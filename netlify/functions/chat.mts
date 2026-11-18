// Netlify function entry: POST /api/chat. All logic lives in server/chat.ts.
import { handleChat } from '../../server/chat.js';

export default (request: Request, context: { ip?: string }) =>
  handleChat(request, { ip: context?.ip });

export const config = { path: '/api/chat' };
