import { decryptSecret } from './crypto.js'
import { fetchSpotOrders, OkxHttpError } from './okxClient.js'
import { pairTrades } from './tradeMatcher.js'
import { insertTrades } from '../db/tradesRepo.js'
import { setApiConnectedFlag, setLastSync } from '../db/usersRepo.js'
import type { UserRecord } from '../types/models.js'

export interface SyncResult {
  fetchedOrders: number
  insertedTrades: number
  status: 'OK' | 'API_INVALID'
}

export const syncUserTrades = async (user: UserRecord): Promise<SyncResult> => {
  if (!user.encryptedApiKey || !user.encryptedSecret) {
    throw new Error('API credentials are missing')
  }

  const nowIso = new Date().toISOString()
  const sinceMs = user.lastSync ? Date.parse(user.lastSync) : Date.now() - 30 * 24 * 60 * 60 * 1000

  const credentials = {
    apiKey: decryptSecret(user.encryptedApiKey),
    secretKey: decryptSecret(user.encryptedSecret),
    passphrase: user.encryptedPassphrase ? decryptSecret(user.encryptedPassphrase) : '',
  }

  try {
    const orders = await fetchSpotOrders({ credentials, sinceMs })
    const pairedTrades = pairTrades(user.id, orders)
    const insertedTrades = await insertTrades(pairedTrades)
    await setLastSync(user.id, nowIso)

    return {
      fetchedOrders: orders.length,
      insertedTrades,
      status: 'OK',
    }
  } catch (error) {
    if (error instanceof OkxHttpError && error.statusCode === 401) {
      await setApiConnectedFlag(user.id, false)
      return {
        fetchedOrders: 0,
        insertedTrades: 0,
        status: 'API_INVALID',
      }
    }
    throw error
  }
}
