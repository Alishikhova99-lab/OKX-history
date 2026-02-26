import dotenv from 'dotenv'

dotenv.config()

const requireEnv = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env: ${name}`)
  }
  return value
}

const optionalInt = (name: string, fallback: number): number => {
  const raw = process.env[name]
  if (!raw) {
    return fallback
  }
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid integer env: ${name}`)
  }
  return parsed
}

const masterKeyHex = requireEnv('MASTER_ENCRYPTION_KEY')
if (!/^[0-9a-fA-F]{64}$/.test(masterKeyHex)) {
  throw new Error('MASTER_ENCRYPTION_KEY must be 64 hex chars (32 bytes)')
}

const databaseUrl = requireEnv('DATABASE_URL')
if (!databaseUrl.startsWith('postgres://') && !databaseUrl.startsWith('postgresql://')) {
  throw new Error('DATABASE_URL must start with postgres:// or postgresql://')
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: optionalInt('PORT', 8000),
  host: process.env.HOST ?? '0.0.0.0',
  databaseUrl,
  redisUrl: process.env.REDIS_URL ?? '',
  telegramBotToken: requireEnv('TELEGRAM_BOT_TOKEN'),
  frontendUrl: process.env.FRONTEND_URL ?? '',
  backendPublicUrl: process.env.BACKEND_PUBLIC_URL ?? '',
  masterEncryptionKey: Buffer.from(masterKeyHex, 'hex'),
  okxApiBaseUrl: process.env.OKX_API_BASE_URL ?? 'https://www.okx.com',
  okxTimeoutMs: optionalInt('OKX_TIMEOUT_MS', 10000),
  okxMaxRetries: optionalInt('OKX_MAX_RETRIES', 3),
  cacheTtlSeconds: optionalInt('CACHE_TTL_SECONDS', 15),
  userCacheTtlSeconds: optionalInt('USER_CACHE_TTL_SECONDS', 300),
}
