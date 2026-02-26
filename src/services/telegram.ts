import type { ProfileData } from '../types/models'

export const getTelegramWebApp = () => window.Telegram?.WebApp
const defaultAvatarPath = `${import.meta.env.BASE_URL}default-avatar.svg`

export const initTelegram = () => {
  const app = getTelegramWebApp()
  app?.ready?.()
  app?.expand?.()
}

export const getTelegramInitData = () => getTelegramWebApp()?.initData ?? ''

export const getTelegramTheme = () => getTelegramWebApp()?.themeParams ?? {}

export const getTelegramProfile = (): Pick<ProfileData, 'name' | 'username' | 'avatar'> => {
  const user = getTelegramWebApp()?.initDataUnsafe?.user

  if (!user) {
    return {
      name: 'Demo Trader',
      username: '@okx_user',
      avatar: defaultAvatarPath,
    }
  }

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()

  return {
    name: fullName || 'Telegram User',
    username: user.username ? `@${user.username}` : '@unknown',
    avatar: defaultAvatarPath,
  }
}
