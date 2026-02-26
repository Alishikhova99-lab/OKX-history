import type { QueryResultRow } from 'pg'
import { pgPool } from './pool.js'
import type { UserRecord } from '../types/models.js'

type UserRow = QueryResultRow & {
  id: string
  telegram_id: string
  username: string | null
  encrypted_api_key: string | null
  encrypted_secret: string | null
  encrypted_passphrase: string | null
  api_connected: boolean
  last_sync: Date | null
  created_at: Date
  updated_at: Date
}

const mapUser = (row: UserRow): UserRecord => ({
  id: Number(row.id),
  telegramId: row.telegram_id,
  username: row.username,
  encryptedApiKey: row.encrypted_api_key,
  encryptedSecret: row.encrypted_secret,
  encryptedPassphrase: row.encrypted_passphrase,
  apiConnected: row.api_connected,
  lastSync: row.last_sync ? row.last_sync.toISOString() : null,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
})

export const upsertUserByTelegramId = async (telegramId: string, username: string | null): Promise<UserRecord> => {
  const { rows } = await pgPool.query<UserRow>(
    `
      INSERT INTO users (telegram_id, username)
      VALUES ($1, $2)
      ON CONFLICT (telegram_id)
      DO UPDATE SET username = EXCLUDED.username, updated_at = NOW()
      RETURNING *
    `,
    [telegramId, username],
  )

  const row = rows[0]
  if (!row) {
    throw new Error('Failed to upsert user')
  }

  return mapUser(row)
}

export const getUserByTelegramId = async (telegramId: string): Promise<UserRecord | null> => {
  const { rows } = await pgPool.query<UserRow>('SELECT * FROM users WHERE telegram_id = $1 LIMIT 1', [telegramId])
  const row = rows[0]
  return row ? mapUser(row) : null
}

export const setUserApiCredentials = async (args: {
  userId: number
  encryptedApiKey: string
  encryptedSecret: string
  encryptedPassphrase: string | null
  apiConnected: boolean
}): Promise<void> => {
  await pgPool.query(
    `
      UPDATE users
      SET encrypted_api_key = $2,
          encrypted_secret = $3,
          encrypted_passphrase = $4,
          api_connected = $5,
          updated_at = NOW()
      WHERE id = $1
    `,
    [args.userId, args.encryptedApiKey, args.encryptedSecret, args.encryptedPassphrase, args.apiConnected],
  )
}

export const clearUserApiCredentials = async (userId: number): Promise<void> => {
  await pgPool.query(
    `
      UPDATE users
      SET encrypted_api_key = NULL,
          encrypted_secret = NULL,
          encrypted_passphrase = NULL,
          api_connected = FALSE,
          updated_at = NOW()
      WHERE id = $1
    `,
    [userId],
  )
}

export const setApiConnectedFlag = async (userId: number, apiConnected: boolean): Promise<void> => {
  await pgPool.query('UPDATE users SET api_connected = $2, updated_at = NOW() WHERE id = $1', [userId, apiConnected])
}

export const setLastSync = async (userId: number, timestampIso: string): Promise<void> => {
  await pgPool.query('UPDATE users SET last_sync = $2, updated_at = NOW() WHERE id = $1', [userId, timestampIso])
}
