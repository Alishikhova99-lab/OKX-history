import crypto from 'node:crypto'
import { env } from '../config/env.js'
import type { TelegramAuthResult } from '../types/models.js'

interface TelegramUserPayload {
  id: number
  username?: string
}

export const verifyTelegramInitData = (initData: string): TelegramAuthResult => {
  if (!initData) {
    throw new Error('Empty initData')
  }

  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  if (!hash) {
    throw new Error('initData missing hash')
  }

  const pairs: string[] = []
  for (const [key, value] of params.entries()) {
    if (key !== 'hash') {
      pairs.push(`${key}=${value}`)
    }
  }

  pairs.sort((a, b) => a.localeCompare(b))
  const dataCheckString = pairs.join('\n')

  const secret = crypto.createHmac('sha256', 'WebAppData').update(env.telegramBotToken).digest()
  const expectedHash = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex')

  const expectedBuffer = Buffer.from(expectedHash, 'hex')
  const receivedBuffer = Buffer.from(hash, 'hex')
  if (expectedBuffer.length !== receivedBuffer.length) {
    throw new Error('Invalid Telegram signature size')
  }

  const isValid = crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  if (!isValid) {
    throw new Error('Invalid Telegram signature')
  }

  const userRaw = params.get('user')
  if (!userRaw) {
    throw new Error('initData missing user payload')
  }

  let parsedUser: TelegramUserPayload
  try {
    parsedUser = JSON.parse(userRaw) as TelegramUserPayload
  } catch {
    throw new Error('initData user payload is invalid JSON')
  }

  if (!parsedUser.id) {
    throw new Error('Telegram user id missing')
  }

  return {
    telegramId: String(parsedUser.id),
    username: parsedUser.username ?? null,
  }
}
