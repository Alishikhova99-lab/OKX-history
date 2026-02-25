import type { ProfileData } from '../types/models'

export const getTelegramWebApp = () => window.Telegram?.WebApp

export const initTelegram = () => {
  const app = getTelegramWebApp()
  app?.ready?.()
  app?.expand?.()
}

export const getTelegramInitData = () => getTelegramWebApp()?.initData ?? 'mock-init-data'

export const getTelegramTheme = () => getTelegramWebApp()?.themeParams ?? {}

export const getTelegramProfile = (): Pick<ProfileData, 'name' | 'username' | 'avatar'> => {
  const user = getTelegramWebApp()?.initDataUnsafe?.user

  if (!user) {
    return {
      name: 'Demo Trader',
      username: '@okx_user',
      avatar: '/default-avatar.svg',
    }
  }

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()

  return {
    name: fullName || 'Telegram User',
    username: user.username ? `@${user.username}` : '@unknown',
    avatar: '/default-avatar.svg',
  }
}
