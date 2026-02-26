# OKX History (Frontend + Backend)

В этой папке теперь есть обе части:

- `frontend` (Vite + React + TypeScript) — в корне проекта.
- `backend` (Fastify + PostgreSQL + Telegram bot worker) — в папке `backend/`.

## Что уже добавлено

- Полный backend (`backend/src`, `backend/sql`, `backend/public`, `backend/.env.example`).
- `render.yaml` для деплоя web + worker на Render.
- Сборка фронтенда в формат Mini App (`/miniapp`).

## Команды

Установить зависимости фронта:

```bash
npm i
```

Установить зависимости бэка:

```bash
npm i --prefix backend
```

Собрать фронтенд:

```bash
npm run build
```

Собрать backend:

```bash
npm run backend:build
```

Собрать фронтенд и положить в `backend/public/miniapp`:

```bash
npm run build:miniapp
```

Запуск backend:

```bash
npm run backend:start
```

## Render (минимум)

В `backend` env должны быть:

- `DATABASE_URL`
- `MASTER_ENCRYPTION_KEY` (64 hex символа)
- `TELEGRAM_BOT_TOKEN` (для worker)
- `FRONTEND_URL` (например `https://<your-service>.onrender.com/miniapp`)

Проверка после деплоя:

- `GET /health`
- `GET /miniapp`
