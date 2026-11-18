# Portfolio

This is the source code for my personal portfolio website, showcasing my projects, skills, and professional journey. Built with modern technologies, the site is fast, responsive, and visually appealing.

## Technologies Used

- **React**
- **TypeScript**
- **Tailwind CSS**
- **Vite**
- **Swiper**
- **Lucide-react**

## Ask about David (chat)

A chat panel on the site answers visitors' questions about me. It answers only from the content in `src/data/` (the same files the page renders), so updating the site updates the assistant.

- `src/components/Chat.tsx` is the interface.
- `server/chat.ts` is the endpoint: it builds the prompt from `src/data/knowledge.ts`, calls the Claude API and streams the answer.
- `api/chat.ts` exposes it as a serverless function (Vercel-style). `vite.config.ts` serves the same handler at `/api/chat` during `npm run dev`.

The endpoint calls Claude through Vercel AI Gateway (model `anthropic/claude-haiku-5.5` by default; change it with `CHAT_MODEL`).

- On Vercel no key is needed: functions authenticate to the gateway with the deployment's OIDC token.
- Locally, copy `.env.example` to `.env.local` and add an `AI_GATEWAY_API_KEY`.

The key stays on the server and is never sent to the browser. Without a credential the panel says the chat isn't connected.

Limits live at the top of `server/chat.ts`: question length, history size, answer size and a per-address rate limit. Set a budget in the AI Gateway dashboard as well, since the endpoint is public.
