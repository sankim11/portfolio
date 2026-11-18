// The contract between the chat panel and the /api/chat endpoint. Both sides
// import this file, so a limit or an error code can never drift between them.

export const CHAT_ENDPOINT = '/api/chat';

export const LIMITS = {
  /** Longest question a visitor can send. */
  questionChars: 600,
  /** Most recent messages sent as context. */
  historyMessages: 12,
  /** Total characters of context the server will accept. */
  historyChars: 8000,
} as const;

export type ChatRole = 'user' | 'assistant';
export type ChatMessage = { role: ChatRole; content: string };
export type ChatRequest = { messages: ChatMessage[] };

/**
 * Why a request failed. The setup codes all show visitors the same plain
 * message; the exact code is for whoever is fixing the deployment.
 */
export type ChatErrorCode =
  | 'method_not_allowed'
  | 'bad_request'
  | 'not_configured' // the function has no AI_GATEWAY_API_KEY
  | 'not_deployed' // /api/chat is not there (set by the client on a 404)
  | 'key_rejected' // the gateway refused the key (401)
  | 'key_denied' // the gateway refused access (403)
  | 'billing' // the gateway account needs credits or budget
  | 'model_not_found' // CHAT_MODEL is not a gateway model ID
  | 'rate_limited' // this visitor is sending too many questions
  | 'busy' // the model provider is rate limiting
  | 'empty' // the model finished without writing anything
  | 'unavailable';

/** One line of the newline-delimited JSON stream the endpoint answers with. */
export type StreamEvent =
  | { t: 'delta'; v: string }
  | { t: 'done' }
  | { t: 'error'; code: ChatErrorCode };

/** What GET /api/chat reports: enough to debug a deployment, never the key. */
export type ChatHealth = { ok: true; keyConfigured: boolean; model: string };
