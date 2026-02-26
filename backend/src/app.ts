import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import Fastify from 'fastify'
import { runMigrations } from './db/migrate.js'
import { pgPool } from './db/pool.js'
import { OkxHttpError } from './services/okxClient.js'
import { registerApiKeyRoutes } from './routes/apiKeyRoutes.js'
import { registerAuthRoutes } from './routes/authRoutes.js'
import { registerSyncRoutes } from './routes/syncRoutes.js'
import { registerTradeRoutes } from './routes/tradeRoutes.js'

export const buildApp = async () => {
  const app = Fastify({
    logger: true,
  })

  await runMigrations()

  await app.register(cors, {
    origin: true,
  })

  await app.register(rateLimit, {
    max: 60,
    timeWindow: '1 minute',
  })

  app.get('/', async () => {
    return { ok: true }
  })

  app.get('/miniapp', async (_request, reply) => {
    reply.type('text/html; charset=utf-8')
    return `
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>OKX Mini App</title>
    <style>
      :root { color-scheme: dark; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #0f1115;
        color: #e5ecff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .card {
        width: min(92vw, 420px);
        background: rgba(20, 24, 32, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 20px;
        padding: 18px;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }
      h1 { margin: 0 0 8px; font-size: 22px; }
      p { margin: 0 0 14px; color: #a2acbf; line-height: 1.45; }
      a {
        display: inline-block;
        text-decoration: none;
        background: #4f8cff;
        color: white;
        border-radius: 14px;
        padding: 10px 14px;
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <h1>OKX Mini App</h1>
      <p>Backend работает. Подключите frontend URL, чтобы открыть полный интерфейс приложения.</p>
      <a href="/api/health">Проверить API</a>
    </main>
  </body>
</html>
    `.trim()
  })

  app.get('/api/health', async () => {
    const db = await pgPool.query('SELECT NOW() AS now')
    return {
      ok: true,
      db: db.rows[0]?.now,
    }
  })

  await registerAuthRoutes(app)
  await registerApiKeyRoutes(app)
  await registerTradeRoutes(app)
  await registerSyncRoutes(app)

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error)

    if (error instanceof OkxHttpError) {
      return reply.status(error.statusCode).send({ message: error.message })
    }

    return reply.status(500).send({ message: 'Internal server error' })
  })

  return app
}
