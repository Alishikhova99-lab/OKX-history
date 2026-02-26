# OKX Backend (Telegram Mini App)

Backend for `/Users/alishikhov.yakub/OKX history`.

## Stack

- Node.js + TypeScript
- Fastify
- PostgreSQL
- Redis (optional but recommended)
- Decimal.js
- AES-256-GCM encryption via Node `crypto`

## Endpoints

- `GET /health`
- `GET /miniapp`
- `POST /auth/telegram`
- `POST /api/register`
- `GET /api/trades?cursor=...&limit=50&symbol=...`
- `GET /api/overview`
- `POST /api/sync`
- `GET /api/health`

## Bot worker

Run a separate worker service with:

```bash
npm run bot
```

Required env for bot worker:

- `TELEGRAM_BOT_TOKEN`
- `FRONTEND_URL` (recommended)
- `BACKEND_PUBLIC_URL` (fallback for `/miniapp` HTML page)

## Security model

- Telegram auth by `initData` signature verification.
- User identity by `telegram_id` only.
- API keys stored encrypted (`encrypted_api_key`, `encrypted_secret`, `encrypted_passphrase`).
- Master key comes from `MASTER_ENCRYPTION_KEY` env.

## DB schema

SQL migration file:

- `backend/sql/001_init.sql`

Creates:

- `users`
- `trades`
- required indexes

## Run locally

1. Go to backend folder:

```bash
cd "/Users/alishikhov.yakub/OKX history/backend"
```

2. Install deps:

```bash
npm i
```

3. Create env:

```bash
cp .env.example .env
```

4. Start dev server:

```bash
npm run dev
```

## Notes

- `/miniapp` is served from static files in `backend/public/miniapp`.
- CORS allows Telegram WebApp and Render domains.
- `POST /api/sync` returns `API_INVALID` if OKX returns 401, and sets `api_connected = false`.
- `GET /api/trades` uses cursor-based pagination (`exit_time` cursor), default limit `50`.
- Caching uses Redis with short TTL for trade payloads and longer TTL for user cache.
- If `REDIS_URL` is missing, backend continues to work without cache.
