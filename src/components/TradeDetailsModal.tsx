import type { Trade } from '../types/models'
import { PnlValue } from './PnlValue'

interface TradeDetailsModalProps {
  trade: Trade | null
  onClose: () => void
}

const formatDate = (value: string) => new Date(value).toLocaleString()

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-3 border-b border-white/8 py-2.5 text-sm last:border-b-0">
    <span className="text-[#98a0af]">{label}</span>
    <span className="number text-right text-[#e5ecff]">{value}</span>
  </div>
)

export const TradeDetailsModal = ({ trade, onClose }: TradeDetailsModalProps) => {
  if (!trade) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/55 px-3 pb-3 pt-8" onClick={onClose}>
      <section
        className="glass w-full rounded-[28px] border border-white/12 bg-[#141820f2] p-4"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#4f8cff24] text-lg">{trade.coinIcon}</div>
            <div>
              <p className="text-base font-semibold">{trade.symbol}</p>
              <p className="text-xs text-[#9aa3b2]">Детали сделки (SPOT)</p>
            </div>
          </div>
          <button type="button" className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#c0c6d4]" onClick={onClose}>
            Закрыть
          </button>
        </header>

        <div className="rounded-2xl bg-[#1a1d24] px-3">
          <Row label="Сумма покупки" value={trade.spent.toFixed(2)} />
          <Row label="Сумма продажи" value={trade.received.toFixed(2)} />
          <Row label="Количество" value={trade.quantity.toFixed(4)} />
          <Row label="Монета" value={trade.symbol} />
          <Row label="Цена входа" value={trade.buyPrice.toFixed(2)} />
          <Row label="Цена выхода" value={trade.sellPrice.toFixed(2)} />
          <Row label="PnL" value={<PnlValue value={trade.pnl} />} />
          <Row label="PnL %" value={<PnlValue value={trade.pnlPercent} suffix="%" />} />
          <Row label="Дата и время покупки" value={formatDate(trade.buyDateTime)} />
          <Row label="Дата и время продажи" value={formatDate(trade.sellDateTime)} />
        </div>
      </section>
    </div>
  )
}
