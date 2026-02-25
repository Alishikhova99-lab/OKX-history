import { env } from '../config/env.js'
import { upsertUserByTelegramId } from '../db/usersRepo.js'
import { getCache, setCache } from './cache.js'
import { verifyTelegramInitData } from './telegramAuth.js'
import type { UserRecord } from '../types/models.js'

export const resolveUserByInitData = async (initData: string): Promise<UserRecord> => {
  const auth = verifyTelegramInitData(initData)
  const cacheKey = `user:${auth.telegramId}`

  const cached = await getCache<UserRecord>(cacheKey)
  if (cached) {
    return cached
  }

  const user = await upsertUserByTelegramId(auth.telegramId, auth.username)

  await setCache(cacheKey, user, env.userCacheTtlSeconds)
  return user
}
