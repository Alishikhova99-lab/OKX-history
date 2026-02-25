import type { CSSProperties } from 'react'
import type { Trade } from '../types/models'

interface TradeCardProps {
  trade: Trade
  style?: CSSProperties
  onClick?: (trade: Trade) => void
}

const formatSigned = (value: number, suffix = '') => `${value >= 0 ? '+' : ''}${value.toFixed(2)}${suffix}`

export const TradeCard = ({ trade, style, onClick }: TradeCardProps) => {
  const isProfit = trade.pnl >= 0

  return (
    <button
      type="button"
      style={style}
      className="trade-card relative w-full overflow-hidden rounded-[28px] p-[18px] text-left"
      data-list-index={style ? undefined : 'static'}
      onClick={() => onClick?.(trade)}
    >
      <div className="trade-card-base absolute inset-0" />
      <div className={`trade-card-accent absolute inset-y-0 left-0 w-[3px] ${isProfit ? 'bg-[#16C784]' : 'bg-[#EA3943]'}`} />
      <div className="trade-card-inner absolute inset-0" />

      <div className="relative z-10 grid grid-cols-[1fr_auto] items-start gap-7">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="trade-coin-badge grid h-[34px] w-[34px] place-items-center rounded-full text-[1rem]">{trade.coinIcon}</div>
            <p className="text-[1.55rem] font-semibold leading-none text-[#e7ecf9]">{trade.symbol}</p>
          </div>

          <p className="number mt-4 text-[0.97rem] text-[#d8deee]">
            {trade.buyPrice.toFixed(2)} {'→'} {trade.sellPrice.toFixed(2)}
          </p>
          <p className="number mt-1 text-[0.97rem] text-[#d8deee]">{trade.quantity.toFixed(4)} BTC</p>
        </div>

        <div className="flex min-h-[112px] flex-col items-end text-right">
          <p className={`number text-[1.6rem] font-bold leading-none ${isProfit ? 'text-[#16C784]' : 'text-[#EA3943]'}`}>
            {formatSigned(trade.pnl, ' USDT')}
          </p>

          <p className={`number mt-1 text-[1.1rem] font-semibold leading-none ${isProfit ? 'text-[#16C784]' : 'text-[#EA3943]'}`}>
            {formatSigned(trade.pnlPercent, '%')}
          </p>

          <p className="number mt-auto text-xs text-[#727a8c]">{new Date(trade.sellDateTime).toLocaleString()}</p>
        </div>
      </div>
    </button>
  )
}
