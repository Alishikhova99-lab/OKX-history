import fs from 'node:fs/promises'
import path from 'node:path'
import { pgPool } from './pool.js'

const resolveSqlPath = async (): Promise<string> => {
  const candidates = [
    path.resolve(process.cwd(), 'sql/001_init.sql'),
    path.resolve(process.cwd(), 'backend/sql/001_init.sql'),
  ]

  for (const filePath of candidates) {
    try {
      await fs.access(filePath)
      return filePath
    } catch {
      continue
    }
  }

  throw new Error('Migration file sql/001_init.sql not found')
}

export const runMigrations = async (): Promise<void> => {
  const filePath = await resolveSqlPath()
  const sql = await fs.readFile(filePath, 'utf8')
  const statements = sql
    .split(';')
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0)

  const client = await pgPool.connect()
  try {
    await client.query('BEGIN')
    for (const statement of statements) {
      await client.query(statement)
    }
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
