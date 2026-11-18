import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowUp, ArrowUpRight, Square, X } from 'lucide-react';

import { cssVars } from '../../lib/cssVars';
import ChatPulse from './ChatPulse';
import { LIMITS } from './protocol';
import { useChatPanel } from './useChatPanel';
import { useChatStream, type Message, type Status } from './useChatStream';

const suggestions = [
  'What is Ada?',
  'What did he build at Motiv?',
  'What has he built with Stripe?',
  'What does he do outside work?',
];

/** How lively the header ridgelines are for each state of the conversation. */
const pulseLevel: Record<Status, number> = { idle: 0.2, waiting: 1, streaming: 0.62 };

const stagger = (i: number) => cssVars({ '--i': i });

const MessageBubble = ({ message, streaming }: { message: Message; streaming: boolean }) => (
  <div className={`chat-msg chat-${message.role} ${message.error ? 'is-error' : ''}`}>
    {!message.content ? (
      <span className="chat-wait" role="status">
        Reading the portfolio
      </span>
    ) : message.parts ? (
      message.parts.map((part, i) => (
        <span key={i} className="chat-chunk">
          {part}
        </span>
      ))
    ) : (
      message.content
    )}
    {streaming && <span className="chat-caret" aria-hidden />}
  </div>
);

/**
 * "Ask about David": a launcher that opens a modal panel where visitors put
 * questions to an AI assistant. The conversation lives in useChatStream and the
 * panel's behaviour in useChatPanel; this component is the view.
 */
const Chat = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');

  const { messages, status, send, stop } = useChatStream();
  const { phase, hasOpened, open, close, dragHandlers } = useChatPanel(
    { dialog: dialogRef, launcher: launcherRef, input: inputRef },
    stop
  );

  // When an answer finishes, put the cursor back in the field (not on phones,
  // where that would raise the keyboard over the answer).
  useEffect(() => {
    if (status === 'idle' && phase === 'open' && window.matchMedia('(hover: hover)').matches)
      inputRef.current?.focus();
  }, [status, phase]);

  // Keep the newest text in view while an answer streams in.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, phase]);

  const ask = (text: string) => {
    setInput('');
    if (inputRef.current) inputRef.current.style.height = '';
    void send(text);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  const onInputKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      ask(input);
    }
  };

  const last = messages[messages.length - 1];

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        className={`btn ring chat-launcher ${hasOpened ? 'is-back' : 'is-intro'}`}
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

        <header className="chat-head" {...dragHandlers}>
          <span className="chat-grip" aria-hidden />
          <ChatPulse level={pulseLevel[status]} active={phase !== 'closed'} />
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
                    <button type="button" onClick={() => ask(s)}>
                      {s}
                      <ArrowUpRight size={16} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                streaming={status === 'streaming' && m === last}
              />
            ))
          )}
        </div>

        <form className="chat-form chat-stagger" style={stagger(7)} onSubmit={onSubmit}>
          <div className="chat-field ring">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              maxLength={LIMITS.questionChars}
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
                onClick={stop}
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
