# OKX History Mini App

Проект находится в папке:

`/Users/alishikhov.yakub/OKX history`

## Структура

- `src/` — frontend (React + Vite)
- `backend/` — backend (Fastify + TypeScript + PostgreSQL + Redis)

## Frontend

```bash
cd "/Users/alishikhov.yakub/OKX history"
npm i
npm run dev
```

## Backend

```bash
cd "/Users/alishikhov.yakub/OKX history/backend"
cp .env.example .env
npm i
npm run dev
```

TypeScript проверка backend:

```bash
npm run lint
```

Сборка backend:

```bash
npm run build
```

Render template:

- `render.yaml` in project root defines web + worker services.

## Основные backend endpoint-ы

- `GET /health`
- `GET /miniapp`
- `POST /auth/telegram`
- `POST /api/register`
- `GET /api/trades?cursor=...&limit=50&symbol=...`
- `GET /api/overview`
- `POST /api/sync`
- `GET /api/health`

Подробности по backend в:

`/Users/alishikhov.yakub/OKX history/backend/README.md`
