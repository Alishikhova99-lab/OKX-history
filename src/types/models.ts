export interface Trade {
  id: string
  symbol: string
  buyPrice: number
  sellPrice: number
  quantity: number
  spent: number
  received: number
  pnl: number
  pnlPercent: number
  buyDateTime: string
  sellDateTime: string
  coinIcon: string
}

export interface AuthResponse {
  hasApi: boolean
  onboardingCompleted: boolean
}

export interface OverviewData {
  totalBalance: number
  totalPnl: number
  todayPnl: number
  recentTrades: Trade[]
}

export interface HistoryResponse {
  trades: Trade[]
  nextCursor: string
  hasMore: boolean
}

export interface ProfileData {
  name: string
  username: string
  avatar: string
  apiConnected: boolean
  lastSync: string
  maskedApi: string
}
