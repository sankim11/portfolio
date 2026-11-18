import { profile } from '../../data/profile';
import type { ChatErrorCode } from './protocol';

const notConnected = `The chat isn't connected yet. You can reach David at ${profile.email}.`;
const unavailable = `The assistant can't be reached right now. Try again, or email David at ${profile.email}.`;

/**
 * What a visitor reads for each failure. Each message says what happened and
 * what they can do next. Setup problems share one plain message; the exact
 * code is logged for whoever is fixing the deployment.
 */
const messages: Record<ChatErrorCode, string> = {
  not_configured: notConnected,
  not_deployed: notConnected,
  key_rejected: notConnected,
  key_denied: notConnected,
  billing: notConnected,
  model_not_found: notConnected,
  rate_limited: 'That is a lot of questions in a short time. Try again in a few minutes.',
  busy: 'The assistant is busy right now. Try again in a moment.',
  bad_request: 'That message could not be sent. Try a shorter question.',
  empty: 'No answer came back that time. Try asking again.',
  method_not_allowed: unavailable,
  unavailable,
};

export const describeError = (code: string): string =>
  messages[code as ChatErrorCode] ?? unavailable;
