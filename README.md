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
- `netlify/functions/chat.mts` exposes it at `/api/chat` on Netlify. `vite.config.ts` serves the same handler during `npm run dev`.

The site is hosted on Netlify. The endpoint calls Claude through Vercel AI Gateway (model `anthropic/claude-haiku-5.5` by default; change it with `CHAT_MODEL`).

- Create an AI Gateway API key in the Vercel dashboard and set a monthly budget there.
- Production: add it in Netlify as `AI_GATEWAY_API_KEY` (scope must include Functions) and redeploy.
- Locally: copy `.env.example` to `.env.local` and paste the key.

The key stays on the server and is never sent to the browser. Without it the panel says the chat isn't connected.

Limits live at the top of `server/chat.ts`: question length, history size, answer size and a per-address rate limit. Set a budget in the AI Gateway dashboard as well, since the endpoint is public.
