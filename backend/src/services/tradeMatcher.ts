import { Decimal } from 'decimal.js'
import type { ApiTrade } from '../types/models.js'
import type { InsertTradeInput } from '../db/tradesRepo.js'

interface OpenLot {
  quantityLeft: Decimal
  entryPrice: Decimal
  entryTimeMs: number
}

export const pairTrades = (userId: number, trades: ApiTrade[]): InsertTradeInput[] => {
  const bySymbol = new Map<string, ApiTrade[]>()
  for (const trade of trades) {
    const list = bySymbol.get(trade.symbol) ?? []
    list.push(trade)
    bySymbol.set(trade.symbol, list)
  }

  const result: InsertTradeInput[] = []

  for (const [symbol, symbolTrades] of bySymbol.entries()) {
    symbolTrades.sort((a, b) => a.timestampMs - b.timestampMs)
    const lots: OpenLot[] = []

    for (const item of symbolTrades) {
      const quantity = new Decimal(item.quantity)
      const price = new Decimal(item.price)
      if (!quantity.isFinite() || quantity.lte(0) || !price.isFinite() || price.lte(0)) {
        continue
      }

      if (item.side === 'buy') {
        lots.push({
          quantityLeft: quantity,
          entryPrice: price,
          entryTimeMs: item.timestampMs,
        })
        continue
      }

      let sellLeft = quantity

      while (sellLeft.gt(0) && lots.length > 0) {
        const lot = lots[0]
        if (!lot) {
          break
        }

        const matched = Decimal.min(sellLeft, lot.quantityLeft)
        const buyTotal = matched.mul(lot.entryPrice)
        const sellTotal = matched.mul(price)
        const pnl = sellTotal.minus(buyTotal)
        const pnlPercent = buyTotal.gt(0) ? pnl.div(buyTotal).mul(100) : new Decimal(0)

        result.push({
          userId,
          symbol,
          entryPrice: lot.entryPrice.toString(),
          exitPrice: price.toString(),
          quantity: matched.toString(),
          buyTotal: buyTotal.toString(),
          sellTotal: sellTotal.toString(),
          pnl: pnl.toString(),
          pnlPercent: pnlPercent.toString(),
          entryTimeIso: new Date(lot.entryTimeMs).toISOString(),
          exitTimeIso: new Date(item.timestampMs).toISOString(),
        })

        lot.quantityLeft = lot.quantityLeft.minus(matched)
        sellLeft = sellLeft.minus(matched)

        if (lot.quantityLeft.lte(0)) {
          lots.shift()
        }
      }
    }
  }

  return result
}
