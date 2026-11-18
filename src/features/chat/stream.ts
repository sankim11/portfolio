import type { StreamEvent } from './protocol';

/**
 * Reads the endpoint's newline-delimited JSON stream and yields one event per
 * line, however the bytes happen to be chunked on the way.
 */
export async function* readEvents(
  body: ReadableStream<Uint8Array>
): AsyncGenerator<StreamEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const raw of lines) if (raw.trim()) yield JSON.parse(raw) as StreamEvent;
    }
    if (buffer.trim()) yield JSON.parse(buffer) as StreamEvent;
  } finally {
    reader.releaseLock();
  }
}
