import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { PnlValue } from '../components/PnlValue'
import { Skeleton } from '../components/Skeleton'
import { TradeCard } from '../components/TradeCard'
import { TradeDetailsModal } from '../components/TradeDetailsModal'
import { getOverview } from '../services/api'
import type { OverviewData, Trade } from '../types/models'

const metricCardStyle = {
  borderRadius: '24px',
  padding: '20px',
  background: 'linear-gradient(145deg, #1B2230, #111723)',
} as const

export const OverviewPage = () => {
  const [data, setData] = useState<OverviewData | null>(null)
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)

  useEffect(() => {
    getOverview().then(setData)
  }, [])

  return (
    <section className="screen px-4 pb-32">
      <div className="mx-auto max-w-[460px]">
        <h1 className="mb-4 text-2xl font-semibold">Кошелёк</h1>

        {!data ? (
          <div className="grid gap-3">
            <Skeleton className="h-26" />
            <Skeleton className="h-26" />
            <Skeleton className="h-26" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              className="grid gap-3"
            >
              <article style={metricCardStyle}>
                <p className="text-sm text-[#9aa3b2]">Общий баланс</p>
                <p className="number mt-2 text-3xl font-semibold">${data.totalBalance.toFixed(2)}</p>
              </article>

              <article style={metricCardStyle}>
                <p className="text-sm text-[#9aa3b2]">Total PnL</p>
                <PnlValue value={data.totalPnl} className="mt-2 block text-2xl font-semibold" />
              </article>

              <article style={metricCardStyle}>
                <p className="text-sm text-[#9aa3b2]">Today PnL</p>
                <PnlValue value={data.todayPnl} className="mt-2 block text-2xl font-semibold" />
              </article>
            </motion.div>

            <div className="mt-5">
              <h2 className="mb-3 text-base font-medium">Последние сделки</h2>
              <div className="grid gap-3">
                {data.recentTrades.map((trade) => (
                  <TradeCard key={trade.id} trade={trade} onClick={setSelectedTrade} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <TradeDetailsModal trade={selectedTrade} onClose={() => setSelectedTrade(null)} />
    </section>
  )
}
