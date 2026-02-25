declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string
        initDataUnsafe?: {
          user?: {
            id?: number
            first_name?: string
            last_name?: string
            username?: string
            photo_url?: string
          }
        }
        themeParams?: Record<string, string>
        ready?: () => void
        expand?: () => void
      }
    }
  }
}

export {}
