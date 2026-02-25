import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import { ApiRegisterPage } from '../pages/ApiRegisterPage'
import { HistoryPage } from '../pages/HistoryPage'
import { OnboardingPage } from '../pages/OnboardingPage'
import { OverviewPage } from '../pages/OverviewPage'
import { ProfileEditPage } from '../pages/ProfileEditPage'
import { ProfilePage } from '../pages/ProfilePage'
import { SplashPage } from '../pages/SplashPage'
import { getTelegramTheme } from '../services/telegram'

const AppRoutes = () => {
  return (
    <main>
      <Routes>
        <Route path="/" element={<Navigate to="/splash" replace />} />
        <Route path="/splash" element={<SplashPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/api-register" element={<ApiRegisterPage />} />
        <Route path="/profile-edit" element={<ProfileEditPage />} />
        <Route element={<TabsLayout />}>
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/splash" replace />} />
      </Routes>
    </main>
  )
}

const TabsLayout = () => {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  )
}

const applyThemeVars = () => {
  const root = document.documentElement
  const theme = getTelegramTheme()

  root.style.setProperty('--bg', theme.bg_color ?? '#0f1115')
  root.style.setProperty('--surface', '#1a1d24')
  root.style.setProperty('--accent', theme.button_color ?? '#4f8cff')
  root.style.setProperty('--text', theme.text_color ?? '#e5ecff')
}

export const App = () => {
  applyThemeVars()
  return <AppRoutes />
}
