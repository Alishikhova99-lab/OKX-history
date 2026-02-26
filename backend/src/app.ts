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
