# David San Kim — portfolio

Source for [davidsankim.netlify.app](https://davidsankim.netlify.app): a single-page portfolio with scroll-driven motion, particle sculptures for the off-hours section, and a chat panel that answers questions about me.

Built with React 18, TypeScript (strict), Vite and three.js. Hosted on Netlify; the chat calls Claude through Vercel AI Gateway.

## Getting started

Requires Node 20 or newer.

```bash
npm install
npm run dev
```

The site runs at `http://localhost:5173`. The chat panel works locally once `.env.local` has a key (see [Chat](#chat)); without one it says it isn't connected.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload. Also serves `/api/chat`. |
| `npm run build` | Production build into `dist/`. |
| `npm run preview` | Serves the production build locally. |
| `npm run typecheck` | Type-checks the browser code and the server code. |
| `npm run lint` | ESLint over the whole repo. |
| `npm test` | Unit tests (Vitest). `npm run test:watch` re-runs on change. |
| `npm run check` | Everything CI runs: typecheck, lint, test, build. |

CI (`.github/workflows/ci.yml`) runs the same four checks on every push to `main` and every pull request.

## Project layout

```
src/
  App.tsx            Page composition. Lazy-loads the chat.
  sections/          One file per page section (Hero, About, Projects, …).
  components/        Pieces shared across sections (Nav, Intro, ErrorBoundary, …).
  features/
    chat/            Chat panel: view, hooks, stream reader, shared protocol.
    sculpture/       three.js particle sculptures, one shape file per pursuit.
  lib/
    motion/          Scroll engine, reveal-on-scroll, motion hooks.
  data/              All site content, typed. Edit copy here.
  styles/            Design tokens, components, motion and chat styles.
server/              Chat endpoint logic: validation, rate limit, prompt, handler.
netlify/functions/   Thin Netlify wrapper that exposes the handler at /api/chat.
```

A few rules keep this easy to change:

- **Content lives in `src/data/`.** Sections render it and the chat assistant is briefed from it, so one edit updates both.
- **Sections don't import each other.** Shared pieces go in `components/` or `lib/`.
- **Features own their folder.** The chat and the sculptures are each loaded on demand and can be removed without touching the rest of the page. three.js only downloads when the off-hours section is near the viewport.
- **The browser never imports `server/`.** ESLint enforces it. The one shared file is `src/features/chat/protocol.ts`, which holds the request and response types both sides agree on.
- **Motion respects `prefers-reduced-motion`.** Check `prefersReducedMotion()` from `lib/motion` before animating in script.

### Adding things

- **A project, role or skill:** add an entry to the matching file in `src/data/`.
- **A pursuit:** add its id to `HobbyId` and an entry in `src/data/hobbies.ts`, then a shape in `src/features/sculpture/shapes/` registered in `shapes/index.ts`. TypeScript flags the missing shape, and the shape tests check it is well formed.
- **A section:** add a file in `src/sections/` and place it in `App.tsx`.

## Chat

A panel on the site answers visitors' questions about me, using only what is in `src/data/`.

- `src/features/chat/` is the interface. `useChatStream` talks to the endpoint; `useChatPanel` handles opening, closing and the phone sheet.
- `server/chat.ts` is the endpoint. It validates the request (`validate.ts`), applies a per-address rate limit (`rateLimit.ts`), builds the prompt (`prompt.ts`) and streams the answer back as newline-delimited JSON.
- `netlify/functions/chat.mts` exposes it at `/api/chat`. `vite.config.ts` serves the same handler during `npm run dev`.

The endpoint calls Claude through Vercel AI Gateway, model `anthropic/claude-haiku-5.5` by default (override with `CHAT_MODEL`).

### Setting up the key

1. In the Vercel dashboard, open AI Gateway, add credits and set a monthly budget. The endpoint is public, so the budget is the real spending cap.
2. Create an AI Gateway API key.
3. **Production:** add it in Netlify as `AI_GATEWAY_API_KEY` (scope must include Functions) and redeploy.
4. **Local:** copy `.env.example` to `.env.local` and paste the key. That file is ignored by git.

The key stays on the server and is never sent to the browser. To check a deployment, open `/api/chat`: it reports whether the function is live and whether it can see a key, never the key itself.

Message limits (question length, history size) are in `src/features/chat/protocol.ts`; the rate limit and answer size are at the top of `server/chat.ts`.

## Deployment

Netlify builds from `main` using `netlify.toml` (`npm run build`, publish `dist/`, functions in `netlify/functions/`). The only setting kept outside the repo is the `AI_GATEWAY_API_KEY` environment variable.
