import type { AuthResponse, HistoryResponse, OverviewData, ProfileData, Trade } from '../types/models'
import { getTelegramProfile } from './telegram'

const STORAGE_KEYS = {
  hasApi: 'okx_mock_has_api',
  onboarding: 'okx_onboarding_completed',
  lastSync: 'okx_mock_last_sync',
  profileOverrides: 'okx_profile_overrides',
}

const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'AVAXUSDT']
const iconMap: Record<string, string> = {
  BTCUSDT: '₿',
  ETHUSDT: 'Ξ',
  SOLUSDT: '◎',
  XRPUSDT: '✕',
  DOGEUSDT: 'Ð',
  AVAXUSDT: 'A',
}

type ProfileOverrides = {
  name?: string
  username?: string
  avatar?: string
}

let hasApi = localStorage.getItem(STORAGE_KEYS.hasApi) === '1'
let onboardingCompleted = localStorage.getItem(STORAGE_KEYS.onboarding) === '1'
let lastSync = localStorage.getItem(STORAGE_KEYS.lastSync) || new Date().toISOString()
let profileOverrides: ProfileOverrides = (() => {
  const raw = localStorage.getItem(STORAGE_KEYS.profileOverrides)

  if (!raw) {
    return {}
  }

  try {
    return JSON.parse(raw) as ProfileOverrides
  } catch {
    return {}
  }
})()

const delay = (_ms: number) => Promise.resolve()

const generateTrades = (): Trade[] => {
  return Array.from({ length: 500 }, (_, i) => {
    const symbol = symbols[i % symbols.length]
    const buyPrice = Number((130 + i * 0.65 + (i % 9) * 2.4).toFixed(2))
    const sellDelta = Number((((i % 16) - 7) * 1.75).toFixed(2))
    const sellPrice = Number((buyPrice + sellDelta).toFixed(2))
    const quantity = Number((0.15 + (i % 10) * 0.12).toFixed(4))
    const spent = Number((buyPrice * quantity).toFixed(2))
    const received = Number((sellPrice * quantity).toFixed(2))
    const pnl = Number((received - spent).toFixed(2))
    const pnlPercent = Number(((pnl / spent) * 100).toFixed(2))
    const buyDateTime = new Date(Date.now() - (i * 2 + 3) * 3.6e6).toISOString()
    const sellDateTime = new Date(Date.now() - i * 2 * 3.6e6).toISOString()

    return {
      id: `trade-${i + 1}`,
      symbol,
      buyPrice,
      sellPrice,
      quantity,
      spent,
      received,
      pnl,
      pnlPercent,
      buyDateTime,
      sellDateTime,
      coinIcon: iconMap[symbol] ?? '•',
    }
  })
}

const trades = generateTrades()

const persistState = () => {
  localStorage.setItem(STORAGE_KEYS.hasApi, hasApi ? '1' : '0')
  localStorage.setItem(STORAGE_KEYS.onboarding, onboardingCompleted ? '1' : '0')
  localStorage.setItem(STORAGE_KEYS.lastSync, lastSync)
  localStorage.setItem(STORAGE_KEYS.profileOverrides, JSON.stringify(profileOverrides))
}

export const authWithTelegram = async (_initData: string): Promise<AuthResponse> => {
  await delay(700)
  return { hasApi, onboardingCompleted }
}

export const completeOnboarding = async (): Promise<void> => {
  await delay(250)
  onboardingCompleted = true
  persistState()
}

export const registerApi = async ({ apiKey, secretKey }: { apiKey: string; secretKey: string }): Promise<void> => {
  await delay(850)

  if (!apiKey || !secretKey) {
    throw new Error('Поля API Key и Secret Key обязательны')
  }

  hasApi = true
  lastSync = new Date().toISOString()
  persistState()
}

export const getOverview = async (): Promise<OverviewData> => {
  await delay(500)
  const totalPnl = trades.slice(0, 200).reduce((sum, t) => sum + t.pnl, 0)
  const todayPnl = trades
    .filter((trade) => Date.now() - new Date(trade.sellDateTime).getTime() < 24 * 3.6e6)
    .reduce((sum, t) => sum + t.pnl, 0)

  return {
    totalBalance: 12984.37,
    totalPnl: Number(totalPnl.toFixed(2)),
    todayPnl: Number(todayPnl.toFixed(2)),
    recentTrades: trades.slice(0, 5),
  }
}

export const getHistory = async ({
  limit,
  cursor,
  query,
}: {
  limit: number
  cursor?: string
  query?: string
}): Promise<HistoryResponse> => {
  await delay(450)

  const normalizedQuery = query?.trim().toUpperCase()
  const source = normalizedQuery
    ? trades.filter((trade) => trade.symbol.toUpperCase().includes(normalizedQuery))
    : trades

  const start = cursor ? Number(cursor) : 0
  const page = source.slice(start, start + limit)
  const next = start + page.length

  return {
    trades: page,
    hasMore: next < source.length,
    nextCursor: String(next),
  }
}

export const getProfile = async (): Promise<ProfileData> => {
  await delay(400)
  const tg = getTelegramProfile()

  return {
    name: profileOverrides.name || tg.name,
    username: profileOverrides.username || tg.username,
    avatar: profileOverrides.avatar || tg.avatar,
    apiConnected: hasApi,
    lastSync,
    maskedApi: hasApi ? '****8F3D' : 'Not connected',
  }
}

export const updateProfile = async ({ name, username, avatar }: { name: string; username: string; avatar?: string }): Promise<void> => {
  await delay(300)

  const normalizedName = name.trim()
  const normalizedUsername = username.trim().startsWith('@') ? username.trim() : `@${username.trim()}`

  if (!normalizedName || !normalizedUsername || normalizedUsername === '@') {
    throw new Error('Введите имя и username')
  }

  profileOverrides = {
    ...profileOverrides,
    name: normalizedName,
    username: normalizedUsername,
    avatar: avatar?.trim() || profileOverrides.avatar,
  }

  persistState()
}

export const syncData = async (): Promise<void> => {
  await delay(850)
  lastSync = new Date().toISOString()
  persistState()
}

export const deleteApi = async (): Promise<void> => {
  await delay(500)
  hasApi = false
  persistState()
}
