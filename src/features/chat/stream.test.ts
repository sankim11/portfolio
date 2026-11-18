import { describe, expect, it } from 'vitest';

import type { StreamEvent } from './protocol';
import { readEvents } from './stream';

/** A stream that delivers the given strings as separate network chunks. */
function streamOf(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

async function collect(chunks: string[]): Promise<StreamEvent[]> {
  const events: StreamEvent[] = [];
  for await (const event of readEvents(streamOf(chunks))) events.push(event);
  return events;
}

describe('readEvents', () => {
  it('yields one event per line', async () => {
    expect(await collect(['{"t":"delta","v":"Hi"}\n{"t":"done"}\n'])).toEqual([
      { t: 'delta', v: 'Hi' },
      { t: 'done' },
    ]);
  });

  it('reassembles a line split across chunks', async () => {
    expect(await collect(['{"t":"del', 'ta","v":"Hel', 'lo"}\n{"t":', '"done"}\n'])).toEqual([
      { t: 'delta', v: 'Hello' },
      { t: 'done' },
    ]);
  });

  it('handles multi-byte characters split across chunks', async () => {
    const bytes = new TextEncoder().encode('{"t":"delta","v":"São Paulo 한국어"}\n');
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const byte of bytes) controller.enqueue(new Uint8Array([byte]));
        controller.close();
      },
    });
    const events: StreamEvent[] = [];
    for await (const event of readEvents(stream)) events.push(event);
    expect(events).toEqual([{ t: 'delta', v: 'São Paulo 한국어' }]);
  });

  it('reads a final line with no trailing newline and skips blank lines', async () => {
    expect(await collect(['\n{"t":"error","code":"busy"}'])).toEqual([
      { t: 'error', code: 'busy' },
    ]);
  });
});
