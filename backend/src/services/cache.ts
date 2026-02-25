import { Redis } from 'ioredis'
import { env } from '../config/env.js'

export const redis = env.redisUrl
  ? new Redis(env.redisUrl, {
      maxRetriesPerRequest: 3,
      connectTimeout: 10_000,
    })
  : null

export const getCache = async <T>(key: string): Promise<T | null> => {
  if (!redis) {
    return null
  }
  const value = await redis.get(key)
  if (!value) {
    return null
  }
  return JSON.parse(value) as T
}

export const setCache = async <T>(key: string, value: T, ttlSeconds: number): Promise<void> => {
  if (!redis) {
    return
  }
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
}

export const delCache = async (...keys: string[]): Promise<void> => {
  if (!redis || keys.length === 0) {
    return
  }
  await redis.del(...keys)
}
