import { Pool } from 'pg'
import { env } from '../config/env.js'

export const pgPool = new Pool({
  connectionString: env.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
})

pgPool.on('error', (error) => {
  console.error('PostgreSQL pool error', error)
})
