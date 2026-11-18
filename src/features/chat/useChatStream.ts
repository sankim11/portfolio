import { useCallback, useEffect, useRef, useState } from 'react';

import { describeError } from './errors';
import {
  CHAT_ENDPOINT,
  LIMITS,
  type ChatErrorCode,
  type ChatRequest,
  type ChatRole,
} from './protocol';
import { readEvents } from './stream';

export type Message = {
  id: number;
  role: ChatRole;
  content: string;
  /** Streamed pieces of an answer, kept so each one can fade in as it lands. */
  parts?: string[];
  /** An interface notice, not part of the conversation sent to the model. */
  error?: boolean;
};

export type Status = 'idle' | 'waiting' | 'streaming';

/**
 * The conversation: holds the messages, sends a question with recent history,
 * and streams the answer into the last message as it arrives.
 */
export function useChatStream() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<Status>('idle');

  // Refs let `send` stay stable while still seeing the latest state.
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const statusRef = useRef(status);
  statusRef.current = status;
  const nextId = useRef(1);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => abortRef.current?.abort(), []);
  useEffect(() => stop, [stop]);

  const patchLast = (patch: (m: Message) => Message) =>
    setMessages((all) => all.map((m, i) => (i === all.length - 1 ? patch(m) : m)));

  const send = useCallback(async (text: string) => {
    const question = text.trim().slice(0, LIMITS.questionChars);
    if (!question || statusRef.current !== 'idle') return;

    const user: Message = { id: nextId.current++, role: 'user', content: question };
    const answer: Message = { id: nextId.current++, role: 'assistant', content: '', parts: [] };
    const request: ChatRequest = {
      messages: [...messagesRef.current.filter((m) => !m.error && m.content), user]
        .slice(-LIMITS.historyMessages)
        .map(({ role, content }) => ({ role, content })),
    };

    setMessages((all) => [...all, user, answer]);
    setStatus('waiting');

    const controller = new AbortController();
    abortRef.current = controller;
    const fail = (code: ChatErrorCode) => {
      console.warn(`[chat] ${code}`);
      patchLast((m) =>
        m.content ? m : { ...m, content: describeError(code), parts: undefined, error: true }
      );
    };

    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const body: { error?: ChatErrorCode } | null = await res.json().catch(() => null);
        fail(body?.error ?? (res.status === 404 ? 'not_deployed' : 'unavailable'));
        return;
      }

      let finished = false;
      for await (const event of readEvents(res.body)) {
        if (event.t === 'delta') {
          setStatus('streaming');
          patchLast((m) => ({
            ...m,
            content: m.content + event.v,
            parts: [...(m.parts ?? []), event.v],
          }));
        } else {
          if (event.t === 'error') fail(event.code);
          finished = true;
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
    }
  }, []);

  return { messages, status, send, stop };
}
