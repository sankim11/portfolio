import { LIMITS, type ChatMessage } from '../src/features/chat/protocol.js';

/**
 * Validates the history a client sent and trims it to the limits.
 * Returns null if anything about it is malformed.
 */
export function parseMessages(body: unknown): ChatMessage[] | null {
  const raw = (body as { messages?: unknown } | null)?.messages;
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const messages: ChatMessage[] = [];
  for (const item of raw) {
    const role = (item as Partial<ChatMessage> | null)?.role;
    const content = (item as Partial<ChatMessage> | null)?.content;
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null;
    const text = content.trim();
    if (!text) return null;
    if (role === 'user' && text.length > LIMITS.questionChars) return null;
    messages.push({ role, content: text });
  }
  if (messages[messages.length - 1].role !== 'user') return null;

  // Keep the most recent turns, within the character budget, starting on a user turn.
  let kept = messages.slice(-LIMITS.historyMessages);
  const size = () => kept.reduce((n, m) => n + m.content.length, 0);
  while (kept.length > 1 && size() > LIMITS.historyChars) kept = kept.slice(1);
  while (kept.length > 1 && kept[0].role !== 'user') kept = kept.slice(1);
  return kept;
}
