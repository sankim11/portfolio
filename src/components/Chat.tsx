import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { ArrowUp, ArrowUpRight, Square, X } from 'lucide-react';
import { profile } from '../data/profile';
import { prefersReducedMotion, scroller } from '../motion';

type Msg = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  /** Streamed pieces of an answer, kept so each one can fade in as it lands. */
  parts?: string[];
  error?: boolean;
};
type Status = 'idle' | 'waiting' | 'streaming';
/** The panel is a scene with an entrance and an exit, not a toggle. */
type Phase = 'closed' | 'opening' | 'open' | 'closing';

const OPEN_MS = 680;
const CLOSE_MS = 440;
const MAX_QUESTION_CHARS = 600;
const MAX_HISTORY_MESSAGES = 12;

const suggestions = [
  'What is Ada?',
  'What did he build at Motiv?',
  'What has he built with Stripe?',
  'What does he do outside work?',
];

// Each message says what happened and what the visitor can do next.
const errorText: Record<string, string> = {
  not_configured: `The chat isn't connected yet. You can reach David at ${profile.email}.`,
  rate_limited: 'That is a lot of questions in a short time. Try again in a few minutes.',
  busy: 'The assistant is busy right now. Try again in a moment.',
  bad_request: 'That message could not be sent. Try a shorter question.',
  unavailable: `The assistant can't be reached right now. Try again, or email David at ${profile.email}.`,
};
const describeError = (code: string) => errorText[code] ?? errorText.unavailable;

const stagger = (i: number) => ({ '--i': i }) as CSSProperties;
const isPhone = () => window.matchMedia('(max-width: 640px)').matches;

/**
 * The assistant's presence: the site's ridgelines, running along the header.
 * Calm when idle, swelling while it thinks, rippling while it answers.
 */
const ChatPulse = ({ level, active }: { level: number; active: boolean }) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const target = useRef(level);
  target.current = level;

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!active || !canvas || !ctx) return;

    const reduced = prefersReducedMotion();
    const css = getComputedStyle(document.documentElement);
    const stroke = css.getPropertyValue('--chrome-2').trim() || '#bcc0ca';
    const fill = css.getPropertyValue('--surface-1').trim() || '#0d0d0d';
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    const size = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();

    let raf = 0;
    let t = 0;
    let last = performance.now();
    let cur = target.current;
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      cur += (target.current - cur) * 0.06;
      t += dt * (0.5 + cur * 2.4);
      ctx.clearRect(0, 0, w, h);
      const lines = 6;
      const top = h * 0.76;
      const gap = (h * 1.14 - top) / (lines - 1);
      for (let i = 0; i < lines; i++) {
        const y0 = top + i * gap;
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w + 4; x += 4) {
          const nx = x / w;
          const n =
            Math.sin(nx * 8 + t * 1.1 + i * 0.5) * 0.5 +
            Math.sin(nx * 17 - t * 0.8 + i * 0.3) * 0.25 +
            Math.sin(nx * 3.1 + t * 0.5 + i) * 0.5;
          ctx.lineTo(x, y0 - Math.max(0, n * 0.5 + 0.5) * gap * (0.45 + 1.45 * cur));
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.globalAlpha = 0.22 + 0.55 * (1 - i / lines);
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    const ro = new ResizeObserver(() => {
      size();
      if (reduced) draw(performance.now());
    });
    ro.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [active]);

  return <canvas ref={ref} className="chat-pulse" aria-hidden />;
};

const Chat = () => {
  const [phase, setPhase] = useState<Phase>('closed');
  const [opened, setOpened] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const phaseRef = useRef<Phase>('closed');
  phaseRef.current = phase;
  const nextId = useRef(1);
  const timer = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const drag = useRef<{ y: number; dy: number } | null>(null);

  const open = () => {
    const dialog = dialogRef.current;
    if (!dialog || phaseRef.current !== 'closed') return;

    // The panel grows out of the launcher's exact footprint.
    const from = launcherRef.current?.getBoundingClientRect();
    if (from) {
      dialog.style.setProperty('--lw', `${from.width}px`);
      dialog.style.setProperty('--lh', `${from.height}px`);
    }
    dialog.style.removeProperty('--drag');
    dialog.style.translate = '';

    // The page recedes around the middle of what is on screen.
    const root = document.documentElement;
    root.style.setProperty('--chat-oy', `${window.scrollY + window.innerHeight / 2}px`);
    root.classList.add('chat-open');
    scroller.lenis?.stop();

    dialog.showModal();
    setOpened(true);
    setPhase('opening');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => setPhase('open'),
      prefersReducedMotion() ? 0 : OPEN_MS
    );
    // On phones, focusing the field would raise the keyboard over the suggestions.
    if (window.matchMedia('(hover: hover)').matches) inputRef.current?.focus();
    else dialog.focus();
  };

  const close = () => {
    if (phaseRef.current === 'closed' || phaseRef.current === 'closing') return;
    abortRef.current?.abort();
    document.documentElement.classList.remove('chat-open');
    setPhase('closing');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => {
        dialogRef.current?.close();
        scroller.lenis?.start();
        setPhase('closed');
      },
      prefersReducedMotion() ? 0 : CLOSE_MS
    );
  };

  // Once the panel has folded away, hand focus back to the launcher.
  useEffect(() => {
    if (phase === 'closed' && opened) launcherRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // "/" opens the chat from anywhere on the page.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target;
      if (el instanceof Element && el.closest('input, textarea, select, [contenteditable]'))
        return;
      e.preventDefault();
      open();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Keep the sheet above the on-screen keyboard and inside the visible area.
  useEffect(() => {
    const dialog = dialogRef.current;
    const vv = window.visualViewport;
    if (phase === 'closed' || !dialog || !vv) return;
    const fit = () => {
      dialog.style.setProperty('--vvh', `${vv.height}px`);
      dialog.style.setProperty(
        '--kb',
        `${Math.max(0, window.innerHeight - vv.height - vv.offsetTop)}px`
      );
    };
    fit();
    vv.addEventListener('resize', fit);
    vv.addEventListener('scroll', fit);
    return () => {
      vv.removeEventListener('resize', fit);
      vv.removeEventListener('scroll', fit);
    };
  }, [phase]);

  // Keep the newest text in view while an answer streams in.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, phase]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      window.clearTimeout(timer.current);
      document.documentElement.classList.remove('chat-open');
    },
    []
  );

  const patchLast = (patch: (m: Msg) => Msg) =>
    setMessages((all) => all.map((m, i) => (i === all.length - 1 ? patch(m) : m)));

  const send = async (text: string) => {
    const question = text.trim().slice(0, MAX_QUESTION_CHARS);
    if (!question || status !== 'idle') return;

    const user: Msg = { id: nextId.current++, role: 'user', content: question };
    const answer: Msg = { id: nextId.current++, role: 'assistant', content: '', parts: [] };
    // Error notices are interface text, not part of the conversation.
    const history = [...messages.filter((m) => !m.error && m.content), user]
      .slice(-MAX_HISTORY_MESSAGES)
      .map(({ role, content }) => ({ role, content }));

    setMessages((all) => [...all, user, answer]);
    setInput('');
    if (inputRef.current) inputRef.current.style.height = '';
    setStatus('waiting');

    const controller = new AbortController();
    abortRef.current = controller;
    const fail = (code: string) =>
      patchLast((m) =>
        m.content ? m : { ...m, content: describeError(code), parts: undefined, error: true }
      );

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => null);
        fail(body?.error ?? (res.status === 404 ? 'not_configured' : 'unavailable'));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finished = false;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const raw of lines) {
          if (!raw.trim()) continue;
          const event = JSON.parse(raw) as { t: string; v?: string; code?: string };
          if (event.t === 'delta' && event.v) {
            setStatus('streaming');
            const chunk = event.v;
            patchLast((m) => ({
              ...m,
              content: m.content + chunk,
              parts: [...(m.parts ?? []), chunk],
            }));
          } else if (event.t === 'error') {
            fail(event.code ?? 'unavailable');
            finished = true;
          } else if (event.t === 'done') {
            finished = true;
          }
        }
      }
      if (!finished) fail('unavailable');
    } catch (err) {
      if ((err as Error).name !== 'AbortError') fail('unavailable');
    } finally {
      abortRef.current = null;
      setStatus('idle');
      // A stopped answer with no text leaves nothing worth showing.
      setMessages((all) =>
        all.length && !all[all.length - 1].content ? all.slice(0, -1) : all
      );
      if (window.matchMedia('(hover: hover)').matches) inputRef.current?.focus();
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const onInputKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send(input);
    }
  };

  // Phones: drag the header down to dismiss the sheet.
  const onDragStart = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse' || !isPhone()) return;
    if ((e.target as HTMLElement).closest('button')) return;
    drag.current = { y: e.clientY, dy: 0 };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* capture is a nicety; the drag still works without it */
    }
    if (dialogRef.current) dialogRef.current.style.transition = 'none';
  };
  const onDragMove = (e: PointerEvent<HTMLElement>) => {
    const dialog = dialogRef.current;
    if (!drag.current || !dialog) return;
    drag.current.dy = Math.max(0, e.clientY - drag.current.y);
    dialog.style.translate = `0 ${drag.current.dy}px`;
  };
  const onDragEnd = () => {
    const dialog = dialogRef.current;
    const state = drag.current;
    drag.current = null;
    if (!state || !dialog) return;
    dialog.style.transition = '';
    if (state.dy > 110) {
      // Leave from where the finger let go.
      dialog.style.setProperty('--drag', `${state.dy}px`);
      dialog.style.translate = '';
      close();
    } else {
      dialog.style.translate = '';
    }
  };

  const last = messages[messages.length - 1];
  const level = status === 'waiting' ? 1 : status === 'streaming' ? 0.62 : 0.2;

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        className={`btn ring chat-launcher ${opened ? 'is-back' : 'is-intro'}`}
        hidden={phase !== 'closed'}
        onClick={open}
        aria-haspopup="dialog"
        aria-keyshortcuts="/"
      >
        <span className="chat-orb" aria-hidden />
        Ask about David
        <kbd className="chat-key" aria-hidden>
          /
        </kbd>
      </button>

      <dialog
        ref={dialogRef}
        className="chat"
        data-phase={phase}
        aria-labelledby="chat-title"
        tabIndex={-1}
        data-lenis-prevent
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <span className="chat-trace ring" aria-hidden />

        <header
          className="chat-head"
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
        >
          <span className="chat-grip" aria-hidden />
          <ChatPulse level={level} active={phase !== 'closed'} />
          <div className="chat-stagger" style={stagger(0)}>
            <h2 id="chat-title" className="t-title">
              Ask about David
            </h2>
            <p className="t-small">
              An AI assistant answering from this site's content. It can be wrong.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-icon chat-close chat-stagger"
            style={stagger(1)}
            onClick={close}
            aria-label="Close chat"
          >
            <X size={16} />
          </button>
        </header>

        <div className="chat-log" ref={logRef} role="log" aria-live="polite">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <p className="t-display-md grad-title chat-stagger" style={stagger(2)}>
                What would you like to know?
              </p>
              <ul className="chat-suggest">
                {suggestions.map((s, i) => (
                  <li key={s} className="chat-stagger" style={stagger(3 + i)}>
                    <button type="button" onClick={() => void send(s)}>
                      {s}
                      <ArrowUpRight size={16} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`chat-msg chat-${m.role} ${m.error ? 'is-error' : ''}`}
              >
                {m.content ? (
                  m.parts ? (
                    m.parts.map((part, i) => (
                      <span key={i} className="chat-chunk">
                        {part}
                      </span>
                    ))
                  ) : (
                    m.content
                  )
                ) : (
                  <span className="chat-wait" role="status">
                    Reading the portfolio
                  </span>
                )}
                {status === 'streaming' && m === last && (
                  <span className="chat-caret" aria-hidden />
                )}
              </div>
            ))
          )}
        </div>

        <form
          className="chat-form chat-stagger"
          style={stagger(7)}
          onSubmit={onSubmit}
        >
          <div className="chat-field ring">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              maxLength={MAX_QUESTION_CHARS}
              placeholder="Ask a question"
              aria-label="Your question"
              enterKeyHint="send"
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={onInputKey}
            />
            {status === 'idle' ? (
              <button
                type="submit"
                className="btn btn-primary btn-icon"
                aria-label="Send question"
                disabled={!input.trim()}
              >
                <ArrowUp size={18} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-icon"
                aria-label="Stop answer"
                onClick={() => abortRef.current?.abort()}
              >
                <Square size={14} />
              </button>
            )}
          </div>
        </form>
      </dialog>
    </>
  );
};

export default Chat;
