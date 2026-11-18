// Vercel-style function entry: POST /api/chat. All logic lives in server/chat.ts.
import { handleChat } from '../server/chat.js';

export default {
  fetch: handleChat,
};
