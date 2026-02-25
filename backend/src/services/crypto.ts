import crypto from 'node:crypto'
import { env } from '../config/env.js'

const ALGO = 'aes-256-gcm'

export const encryptSecret = (plainText: string): string => {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGO, env.masterEncryptionKey, iv)
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(':')
}

export const decryptSecret = (payload: string): string => {
  const [ivB64, tagB64, dataB64] = payload.split(':')
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error('Invalid encrypted payload format')
  }
  const decipher = crypto.createDecipheriv(ALGO, env.masterEncryptionKey, Buffer.from(ivB64, 'base64'))
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'))
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()])
  return decrypted.toString('utf8')
}
