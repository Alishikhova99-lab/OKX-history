import type { QueryResultRow } from 'pg'
import { pgPool } from './pool.js'

export interface InsertTradeInput {
  userId: number
  symbol: string
  entryPrice: string
  exitPrice: string
  quantity: string
  buyTotal: string
  sellTotal: string
  pnl: string
  pnlPercent: string
  entryTimeIso: string
  exitTimeIso: string
}

type TradeRow = QueryResultRow & {
  id: string
  user_id: string
  symbol: string
  entry_price: string
  exit_price: string
  quantity: string
  buy_total: string
  sell_total: string
  pnl: string
  pnl_percent: string
  entry_time: Date
  exit_time: Date
  created_at: Date
}

const mapTrade = (row: TradeRow) => ({
  id: Number(row.id),
  symbol: row.symbol,
  entryPrice: row.entry_price,
  exitPrice: row.exit_price,
  quantity: row.quantity,
  buyTotal: row.buy_total,
  sellTotal: row.sell_total,
  pnl: row.pnl,
  pnlPercent: row.pnl_percent,
  entryTime: row.entry_time.toISOString(),
  exitTime: row.exit_time.toISOString(),
  createdAt: row.created_at.toISOString(),
})

export const insertTrades = async (rows: InsertTradeInput[]): Promise<number> => {
  if (rows.length === 0) {
    return 0
  }

  const client = await pgPool.connect()
  try {
    await client.query('BEGIN')
    let inserted = 0

    for (const row of rows) {
      const result = await client.query(
        `
          INSERT INTO trades (
            user_id, symbol, entry_price, exit_price, quantity,
            buy_total, sell_total, pnl, pnl_percent, entry_time, exit_time
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
          ON CONFLICT (user_id, symbol, entry_time, exit_time, quantity) DO NOTHING
        `,
        [
          row.userId,
          row.symbol,
          row.entryPrice,
          row.exitPrice,
          row.quantity,
          row.buyTotal,
          row.sellTotal,
          row.pnl,
          row.pnlPercent,
          row.entryTimeIso,
          row.exitTimeIso,
        ],
      )
      inserted += result.rowCount ?? 0
    }

    await client.query('COMMIT')
    return inserted
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const listTradesByCursor = async (args: {
  userId: number
  cursor?: string
  limit: number
  symbol?: string
}) => {
  const limit = Math.max(1, Math.min(args.limit, 100))
  const filters: string[] = ['user_id = $1']
  const values: Array<string | number | Date> = [args.userId]

  if (args.symbol) {
    values.push(args.symbol.toUpperCase())
    filters.push(`symbol ILIKE $${values.length}`)
  }

  if (args.cursor) {
    values.push(new Date(args.cursor))
    filters.push(`exit_time < $${values.length}`)
  }

  values.push(limit + 1)

  const { rows } = await pgPool.query<TradeRow>(
    `
      SELECT * FROM trades
      WHERE ${filters.join(' AND ')}
      ORDER BY exit_time DESC, id DESC
      LIMIT $${values.length}
    `,
    values,
  )

  const hasMore = rows.length > limit
  const visibleRows = hasMore ? rows.slice(0, limit) : rows
  const lastRow = visibleRows.length > 0 ? visibleRows[visibleRows.length - 1] : undefined
  const nextCursor = hasMore && lastRow ? lastRow.exit_time.toISOString() : null

  return {
    trades: visibleRows.map(mapTrade),
    hasMore,
    nextCursor,
  }
}

export const getOverviewStats = async (userId: number) => {
  const { rows } = await pgPool.query<{
    total_pnl: string
    today_pnl: string
    trades_count: string
  }>(
    `
      SELECT
        COALESCE(SUM(pnl), 0)::text AS total_pnl,
        COALESCE(SUM(CASE WHEN exit_time >= NOW() - INTERVAL '1 day' THEN pnl ELSE 0 END), 0)::text AS today_pnl,
        COUNT(*)::text AS trades_count
      FROM trades
      WHERE user_id = $1
    `,
    [userId],
  )

  const latestTrades = await pgPool.query<TradeRow>(
    `
      SELECT * FROM trades
      WHERE user_id = $1
      ORDER BY exit_time DESC, id DESC
      LIMIT 5
    `,
    [userId],
  )

  return {
    totalPnl: rows[0]?.total_pnl ?? '0',
    todayPnl: rows[0]?.today_pnl ?? '0',
    tradesCount: Number(rows[0]?.trades_count ?? '0'),
    recentTrades: latestTrades.rows.map(mapTrade),
  }
}
