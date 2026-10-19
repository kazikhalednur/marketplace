# Marketplace — Frontend

Next.js 16 (App Router) web client for the Marketplace platform, written in TypeScript
with React 19, Tailwind CSS 4 and Redux Toolkit / RTK Query. It talks to the Django API in
[`../server`](../server) over REST and WebSockets.

## Run locally

With Docker (recommended), from the repository root: see
[docs/development.md](../docs/development.md).

Without Docker:

```bash
npm ci
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL etc.
npm run dev                  # http://localhost:3000
```

| Script | Command |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (`output: 'standalone'`) |
| `npm run start` | Start a production build |
| `npm run lint` | Runs `next lint`, which Next.js 16 no longer provides; use ESLint directly |

## Environment variables

All are `NEXT_PUBLIC_*` and are inlined at build time: `NEXT_PUBLIC_API_URL`,
`NEXT_PUBLIC_WEBSOCKET_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`,
`NEXT_PUBLIC_GOOGLE_REDIRECT_URI`, `NEXT_PUBLIC_CONTACT_EMAIL`. Details:
[docs/configuration.md](../docs/configuration.md#frontend-client).

## Documentation

- [Frontend guide](../docs/frontend.md): structure, routes, state, authentication, WebSockets
- [API reference](../docs/api.md)
- [User manual](../docs/user-manual.md)
- [Documentation index](../README.md#documentation)

The `README.md` files inside `src/` were written during development and have not been
re-verified; prefer the documents above.
