// The chat endpoint, written against the web-standard Request/Response so the
// same handler runs behind any host: netlify/functions/chat.mts wraps it for
// Netlify, and vite.config.ts mounts it at /api/chat during local development.
//
// The site is hosted on Netlify; the model is reached through Vercel AI Gateway
// using its Anthropic-compatible API, so this is the regular Anthropic SDK
// pointed at the gateway. Billing, usage and the monthly budget are managed in
// the AI Gateway dashboard on Vercel.
//
// Imports use .js extensions because this code also runs in Node as ESM.
import Anthropic from '@anthropic-ai/sdk';

import type {
  ChatErrorCode,
  ChatHealth,
  StreamEvent,
} from '../src/features/chat/protocol.js';
import { SYSTEM_PROMPT } from './prompt.js';
import { createRateLimiter } from './rateLimit.js';
import { parseMessages } from './validate.js';

const GATEWAY_URL = process.env.AI_GATEWAY_BASE_URL || 'https://ai-gateway.vercel.sh';

// Gateway model IDs are "creator/model". Haiku 5.5 is the low-cost Claude model
// and is plenty for short factual answers from a fixed profile.
const MODEL = process.env.CHAT_MODEL || 'anthropic/claude-haiku-5.5';

// This is a public endpoint that spends the site owner's credit, so every
// request is bounded: input (see LIMITS in the protocol), output, and rate.
const MAX_OUTPUT_TOKENS = 2000; // includes the model's reasoning; answers are a few sentences
const isRateLimited = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 20 });

const JSON_HEADERS = { 'content-type': 'application/json', 'cache-control': 'no-store' };

const jsonError = (status: number, error: ChatErrorCode) =>
  new Response(JSON.stringify({ error }), { status, headers: JSON_HEADERS });

/**
 * AI Gateway API key. Set AI_GATEWAY_API_KEY in Netlify (scope: Functions) for
 * production and in .env.local for development. It never reaches the browser.
 */
const gatewayKey = () => process.env.AI_GATEWAY_API_KEY || '';

/**
 * Turns a provider failure into a code. Distinct codes are for the site owner
 * (visible in the response and the function log); visitors see one plain
 * message for all the "not set up" ones.
 */
function errorCode(err: unknown): ChatErrorCode {
  if (err instanceof Anthropic.AuthenticationError) return 'key_rejected';
  if (err instanceof Anthropic.PermissionDeniedError)
    // The gateway answers 403 when the account is on the free tier and the
    // model needs paid credits; that is a billing fix, not a key fix.
    return /free tier|paid credits/i.test(err.message) ? 'billing' : 'key_denied';
  if (err instanceof Anthropic.RateLimitError) return 'busy';
  if (err instanceof Anthropic.NotFoundError) return 'model_not_found';
  if (err instanceof Anthropic.BadRequestError) return 'bad_request';
  if (err instanceof Anthropic.APIError && err.status === 402) return 'billing';
  return 'unavailable';
}

/**
 * GET  → a health report (is the function live, can it see a key).
 * POST { messages: [{ role, content }] } → a stream of newline-delimited JSON
 *   StreamEvents: deltas, then `done` or `error`. Failures before the stream
 *   starts come back as a JSON error with a status code.
 */
export async function handleChat(
  request: Request,
  meta: { ip?: string } = {}
): Promise<Response> {
  const apiKey = gatewayKey();

  if (request.method === 'GET') {
    const health: ChatHealth = { ok: true, keyConfigured: Boolean(apiKey), model: MODEL };
    return new Response(JSON.stringify(health), { headers: JSON_HEADERS });
  }
  if (request.method !== 'POST') return jsonError(405, 'method_not_allowed');
  if (!apiKey) return jsonError(503, 'not_configured');

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, 'bad_request');
  }
  const messages = parseMessages(body);
  if (!messages) return jsonError(400, 'bad_request');

  const ip =
    meta.ip || (request.headers.get('x-forwarded-for') ?? 'local').split(',')[0].trim();
  if (isRateLimited(ip)) return jsonError(429, 'rate_limited');

  const client = new Anthropic({ apiKey, baseURL: GATEWAY_URL });
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: MAX_OUTPUT_TOKENS,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages,
  });

  const encoder = new TextEncoder();
  const line = (event: StreamEvent) => encoder.encode(JSON.stringify(event) + '\n');

  const out = new ReadableStream<Uint8Array>({
    async start(controller) {
      let sent = false;
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            sent = true;
            controller.enqueue(line({ t: 'delta', v: event.delta.text }));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === 'refusal' && !sent) {
          sent = true;
          controller.enqueue(
            line({
              t: 'delta',
              v: `I can't help with that one. I can answer questions about David's work, projects and background.`,
            })
          );
        }
        if (sent) {
          controller.enqueue(line({ t: 'done' }));
        } else {
          // The model finished without writing any text. Say so instead of
          // leaving the visitor with a question and no reply.
          console.error(`[chat] empty answer (stop_reason: ${final.stop_reason})`);
          controller.enqueue(line({ t: 'error', code: 'empty' }));
        }
      } catch (err) {
        // Log the failure for the site owner; never echo provider detail to visitors.
        if (err instanceof Anthropic.APIError)
          console.error(`[chat] Anthropic API error ${err.status}: ${err.message}`);
        else if (!(err instanceof Anthropic.APIUserAbortError)) console.error('[chat]', err);
        controller.enqueue(line({ t: 'error', code: errorCode(err) }));
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(out, {
    headers: {
      'content-type': 'application/x-ndjson; charset=utf-8',
      'cache-control': 'no-store',
      'x-accel-buffering': 'no',
    },
  });
}
