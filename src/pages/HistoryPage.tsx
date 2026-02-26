import { useEffect, useMemo, useState } from 'react'
import { List, type RowComponentProps } from 'react-window'
import { Skeleton } from '../components/Skeleton'
import { TradeCard } from '../components/TradeCard'
import { TradeDetailsModal } from '../components/TradeDetailsModal'
import { getHistory } from '../services/api'
import type { Trade } from '../types/models'

const CARD_ROW_HEIGHT = 170
const ROW_GAP = 10
const BOTTOM_SPACER = 110

interface RowProps {
  trades: Trade[]
  onTradeClick: (trade: Trade) => void
}

const TradeRow = ({ index, style, trades, onTradeClick }: RowComponentProps<RowProps>) => {
  if (index >= trades.length) {
    return <div style={style} />
  }

  const trade = trades[index]

  return (
    <div style={{ ...style, paddingBottom: ROW_GAP }}>
      <TradeCard trade={trade} onClick={onTradeClick} />
    </div>
  )
}

export const HistoryPage = () => {
  const [query, setQuery] = useState('')
  const [trades, setTrades] = useState<Trade[]>([])
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [listHeight, setListHeight] = useState(Math.max(320, window.innerHeight - 210))

  const load = async ({ reset }: { reset: boolean }) => {
    if (reset) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    const result = await getHistory({
      limit: 50,
      cursor: reset ? undefined : cursor,
      query,
    })

    setTrades((prev) => (reset ? result.trades : [...prev, ...result.trades]))
    setCursor(result.nextCursor || undefined)
    setHasMore(result.hasMore)

    if (reset) {
      setLoading(false)
    } else {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    load({ reset: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  useEffect(() => {
    const updateHeight = () => setListHeight(Math.max(320, window.innerHeight - 210))
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  const rowProps = useMemo(() => ({ trades, onTradeClick: setSelectedTrade }), [trades])

  return (
    <section className="screen px-4 pb-0">
      <div className="mx-auto max-w-[460px]">
        <h1 className="mb-4 text-2xl font-semibold">История</h1>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setCursor(undefined)
            setHasMore(true)
            setQuery(e.target.value.toUpperCase().trimStart())
          }}
          placeholder="Поиск по символу"
          className="glass input-focus-line mb-4 h-14 w-full rounded-[24px] px-5 text-sm outline-none"
        />

        {loading ? (
          <div className="grid gap-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : (
          <>
            <List
              rowComponent={TradeRow}
              rowCount={trades.length + 1}
              rowHeight={(index) => (index >= trades.length ? BOTTOM_SPACER : CARD_ROW_HEIGHT + ROW_GAP)}
              rowProps={rowProps}
              style={{ height: listHeight }}
              onRowsRendered={({ stopIndex }) => {
                const visibleStop = Math.min(stopIndex, trades.length - 1)
                if (visibleStop >= trades.length - 5 && hasMore && !loadingMore) {
                  void load({ reset: false })
                }
              }}
            />

            {loadingMore ? <Skeleton className="mt-3 h-16" /> : null}
            {!hasMore ? <p className="pt-3 text-center text-sm text-[#8a93a3]">Больше нет сделок</p> : null}
          </>
        )}
      </div>

      <TradeDetailsModal trade={selectedTrade} onClose={() => setSelectedTrade(null)} />
    </section>
  )
}
