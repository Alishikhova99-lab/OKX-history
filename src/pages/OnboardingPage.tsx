import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authWithTelegram, completeOnboarding } from '../services/api'
import { getTelegramInitData } from '../services/telegram'

const slides = [
  {
    title: 'Read-only безопасность',
    text: 'Ключи только для чтения: торговые действия невозможны из Mini App.',
  },
  {
    title: 'Точный расчет PnL',
    text: 'Все вычисления делаются на backend и отображаются без искажений.',
  },
  {
    title: 'Быстрая синхронизация',
    text: 'История и баланс обновляются быстро, без тяжелых расчетов на телефоне.',
  },
]

export const OnboardingPage = () => {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const finish = async () => {
    setSubmitting(true)
    await completeOnboarding()
    const auth = await authWithTelegram(getTelegramInitData())
    navigate(auth.hasApi ? '/overview' : '/api-register', { replace: true })
  }

  return (
    <section className="screen px-6">
      <div className="mx-auto flex h-[calc(100dvh-60px)] max-w-[420px] flex-col">
        <div className="mb-8 h-1 rounded-full bg-white/10">
          <motion.div
            className="h-1 rounded-full bg-[#4f8cff]"
            animate={{ width: `${((index + 1) / slides.length) * 100}%` }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          />
        </div>

        <button
          type="button"
          onClick={() => setIndex((prev) => (prev + 1) % slides.length)}
          className="glass flex flex-1 flex-col justify-end rounded-[28px] px-6 py-8 text-left"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#9aa3b2]">Шаг {index + 1}</p>
          <h1 className="mb-3 text-3xl font-semibold">{slides[index].title}</h1>
          <p className="mb-8 text-sm text-[#b5bfce]">{slides[index].text}</p>
        </button>

        <div className="mt-6 grid gap-3">
          {index < slides.length - 1 ? (
            <button
              type="button"
              onClick={() => setIndex((prev) => Math.min(prev + 1, slides.length - 1))}
              className="h-14 rounded-3xl bg-[#4f8cff] text-sm font-semibold"
            >
              Дальше
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              disabled={submitting}
              className="h-14 rounded-3xl bg-[#4f8cff] text-sm font-semibold disabled:opacity-70"
            >
              {submitting ? 'Сохранение...' : 'Начать'}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
