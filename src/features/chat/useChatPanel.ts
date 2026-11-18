import { useCallback, useEffect, useRef, useState, type PointerEvent, type RefObject } from 'react';

import { prefersReducedMotion, scroller } from '../../lib/motion';

/** The panel is a scene with an entrance and an exit, not a toggle. */
export type Phase = 'closed' | 'opening' | 'open' | 'closing';

/** Must match the durations in chat.css. */
const OPEN_MS = 680;
const CLOSE_MS = 440;
/** How far the sheet must be dragged down to dismiss it. */
const DISMISS_PX = 110;

const isPhone = () => window.matchMedia('(max-width: 640px)').matches;
const canHover = () => window.matchMedia('(hover: hover)').matches;

type Refs = {
  dialog: RefObject<HTMLDialogElement>;
  launcher: RefObject<HTMLButtonElement>;
  input: RefObject<HTMLTextAreaElement>;
};

/**
 * Everything about the panel as a surface: its open and close choreography,
 * the "/" shortcut, focus hand-off, keeping the phone sheet above the on-screen
 * keyboard, and dragging the sheet down to dismiss it.
 */
export function useChatPanel({ dialog, launcher, input }: Refs, onClose?: () => void) {
  const [phase, setPhase] = useState<Phase>('closed');
  const [hasOpened, setHasOpened] = useState(false);
  const phaseRef = useRef<Phase>('closed');
  phaseRef.current = phase;
  const timer = useRef(0);
  const drag = useRef<{ y: number; dy: number } | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const open = useCallback(() => {
    const el = dialog.current;
    if (!el || phaseRef.current !== 'closed') return;

    // The panel grows out of the launcher's exact footprint.
    const from = launcher.current?.getBoundingClientRect();
    if (from) {
      el.style.setProperty('--lw', `${from.width}px`);
      el.style.setProperty('--lh', `${from.height}px`);
    }
    el.style.removeProperty('--drag');
    el.style.translate = '';

    // The page recedes around the middle of what is on screen.
    const root = document.documentElement;
    root.style.setProperty('--chat-oy', `${window.scrollY + window.innerHeight / 2}px`);
    root.classList.add('chat-open');
    scroller.lenis?.stop();

    el.showModal();
    setHasOpened(true);
    setPhase('opening');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => setPhase('open'),
      prefersReducedMotion() ? 0 : OPEN_MS
    );
    // On phones, focusing the field would raise the keyboard over the suggestions.
    if (canHover()) input.current?.focus();
    else el.focus();
  }, [dialog, launcher, input]);

  const close = useCallback(() => {
    if (phaseRef.current === 'closed' || phaseRef.current === 'closing') return;
    onCloseRef.current?.();
    document.documentElement.classList.remove('chat-open');
    setPhase('closing');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => {
        dialog.current?.close();
        scroller.lenis?.start();
        setPhase('closed');
      },
      prefersReducedMotion() ? 0 : CLOSE_MS
    );
  }, [dialog]);

  // Once the panel has folded away, hand focus back to the launcher.
  useEffect(() => {
    if (phase === 'closed' && hasOpened) launcher.current?.focus({ preventScroll: true });
  }, [phase, hasOpened, launcher]);

  // "/" opens the chat from anywhere on the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target;
      if (el instanceof Element && el.closest('input, textarea, select, [contenteditable]'))
        return;
      e.preventDefault();
      open();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Keep the sheet above the on-screen keyboard and inside the visible area.
  useEffect(() => {
    const el = dialog.current;
    const viewport = window.visualViewport;
    if (phase === 'closed' || !el || !viewport) return;
    const fit = () => {
      el.style.setProperty('--vvh', `${viewport.height}px`);
      el.style.setProperty(
        '--kb',
        `${Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)}px`
      );
    };
    fit();
    viewport.addEventListener('resize', fit);
    viewport.addEventListener('scroll', fit);
    return () => {
      viewport.removeEventListener('resize', fit);
      viewport.removeEventListener('scroll', fit);
    };
  }, [phase, dialog]);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      document.documentElement.classList.remove('chat-open');
    },
    []
  );

  // Phones: drag the header down to dismiss the sheet.
  const dragHandlers = {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (e.pointerType === 'mouse' || !isPhone()) return;
      if ((e.target as HTMLElement).closest('button')) return;
      drag.current = { y: e.clientY, dy: 0 };
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* capture is a nicety; the drag still works without it */
      }
      if (dialog.current) dialog.current.style.transition = 'none';
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      const el = dialog.current;
      if (!drag.current || !el) return;
      drag.current.dy = Math.max(0, e.clientY - drag.current.y);
      el.style.translate = `0 ${drag.current.dy}px`;
    },
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  };

  function endDrag() {
    const el = dialog.current;
    const state = drag.current;
    drag.current = null;
    if (!state || !el) return;
    el.style.transition = '';
    if (state.dy > DISMISS_PX) {
      // Leave from where the finger let go.
      el.style.setProperty('--drag', `${state.dy}px`);
      el.style.translate = '';
      close();
    } else {
      el.style.translate = '';
    }
  }

  return { phase, hasOpened, open, close, dragHandlers };
}
