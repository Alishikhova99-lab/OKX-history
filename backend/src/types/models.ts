export type ApiStatusCode = 'OK' | 'API_INVALID'

export interface TelegramAuthResult {
  telegramId: string
  username: string | null
}

export interface UserRecord {
  id: number
  telegramId: string
  username: string | null
  encryptedApiKey: string | null
  encryptedSecret: string | null
  encryptedPassphrase: string | null
  apiConnected: boolean
  lastSync: string | null
  createdAt: string
  updatedAt: string
}

export interface ApiTrade {
  symbol: string
  side: 'buy' | 'sell'
  quantity: string
  price: string
  timestampMs: number
}
