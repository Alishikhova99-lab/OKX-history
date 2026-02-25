import { buildApp } from './app.js'
import { env } from './config/env.js'

const start = async (): Promise<void> => {
  const app = await buildApp()
  try {
    await app.listen({ port: env.port, host: env.host })
    app.log.info(`backend running at http://${env.host}:${env.port}`)
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

void start()
