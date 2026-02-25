import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'

const tabs: Array<{
  to: string
  label: string
  icon: React.ReactNode
}> = [
  {
    to: '/overview',
    label: 'Кошелёк',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="5" width="18" height="14" rx="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M15 10h6v4h-6a2 2 0 0 1 0-4Z" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.2" cy="12" r="0.9" fill="currentColor" />
      </svg>
    ),
  },
  {
    to: '/history',
    label: 'История',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 6.3v5.8l3.8 2.2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.9" />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Профиль',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="8.1" r="3.4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5.3 18a6.8 6.8 0 0 1 13.4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
]

const pillTransition = {
  type: 'tween' as const,
  duration: 0.16,
  ease: [0.2, 0.8, 0.2, 1] as const,
}

export const BottomNav = () => {
  return (
    <nav className="nav-shell fixed bottom-4 left-1/2 z-30 w-[min(93vw,430px)] -translate-x-1/2 overflow-hidden rounded-[36px] border border-white/12">
      <ul className="flex h-[68px] items-stretch">
        {tabs.map((tab) => (
          <li key={tab.to} className="relative flex flex-1 items-center justify-center px-1 py-1">
            <NavLink to={tab.to} className="relative flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-[28px]">
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <motion.div
                      layoutId="active-pill"
                      transition={pillTransition}
                      className="nav-active-outline absolute inset-0 rounded-[28px]"
                    />
                  ) : null}

                  <motion.span
                    className={`relative z-10 transition-colors duration-150 ${isActive ? 'text-[#5cc8ff]' : 'text-[#d0d6e1]'}`}
                    animate={{ scale: isActive ? 1.02 : 1 }}
                    transition={{ duration: 0.14, ease: 'easeOut' }}
                  >
                    {tab.icon}
                  </motion.span>

                  <span
                    className={`relative z-10 text-[0.58rem] font-medium tracking-[0.01em] ${
                      isActive ? 'text-[#5cc8ff]' : 'text-[#c0c6d4]'
                    }`}
                  >
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
