import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Serves POST /api/chat during `npm run dev` with the same handler the
 * deployed function uses, so the chat works locally without a second server.
 * Reads AI_GATEWAY_* and CHAT_* from .env.local (never bundled into the client).
 */
function devChatApi(): Plugin {
  return {
    name: 'dev-chat-api',
    apply: 'serve',
    config(_, { mode }) {
      const env = loadEnv(mode, process.cwd(), '');
      for (const [key, value] of Object.entries(env))
        if (/^(AI_GATEWAY_|CHAT_)/.test(key) && process.env[key] === undefined)
          process.env[key] = value;
    },
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        try {
          const { handleChat } = await server.ssrLoadModule('/server/chat.ts');
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const headers = new Headers();
          for (const [k, v] of Object.entries(req.headers))
            if (typeof v === 'string') headers.set(k, v);
          const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
          const response: Response = await handleChat(
            new Request(`http://${req.headers.host}/api/chat`, {
              method: req.method,
              headers,
              body: hasBody ? Buffer.concat(chunks) : undefined,
            })
          );
          res.statusCode = response.status;
          response.headers.forEach((v, k) => res.setHeader(k, v));
          if (!response.body) return res.end();
          const reader = response.body.getReader();
          req.on('close', () => void reader.cancel().catch(() => {}));
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
          }
          res.end();
        } catch (err) {
          server.config.logger.error(`[chat] ${String(err)}`);
          if (!res.headersSent) res.statusCode = 500;
          res.end();
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), devChatApi()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
