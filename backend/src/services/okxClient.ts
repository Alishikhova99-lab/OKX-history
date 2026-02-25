import crypto from 'node:crypto'
import { env } from '../config/env.js'
import type { ApiTrade } from '../types/models.js'

interface OkxCredentials {
  apiKey: string
  secretKey: string
  passphrase: string
}

export class OkxHttpError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

const buildQuery = (params: Record<string, string | undefined>): string => {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      query.set(key, value)
    }
  }
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

const sign = (secretKey: string, payload: string): string => {
  return crypto.createHmac('sha256', secretKey).update(payload).digest('base64')
}

const requestWithRetry = async (requestFactory: () => Promise<Response>): Promise<Response> => {
  let attempt = 0
  let waitMs = 300

  while (true) {
    attempt += 1
    try {
      const response = await requestFactory()
      if (response.status >= 500 && attempt <= env.okxMaxRetries) {
        await new Promise((resolve) => setTimeout(resolve, waitMs))
        waitMs *= 2
        continue
      }
      return response
    } catch (error) {
      if (attempt > env.okxMaxRetries) {
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, waitMs))
      waitMs *= 2
    }
  }
}

const okxRequest = async <T>(args: {
  method: 'GET'
  path: string
  credentials: OkxCredentials
  query?: Record<string, string | undefined>
}): Promise<T> => {
  const queryString = buildQuery(args.query ?? {})
  const requestPath = `${args.path}${queryString}`
  const timestamp = new Date().toISOString()
  const signaturePayload = `${timestamp}${args.method}${requestPath}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), env.okxTimeoutMs)

  const response = await requestWithRetry(async () => {
    return fetch(`${env.okxApiBaseUrl}${requestPath}`, {
      method: args.method,
      headers: {
        'OK-ACCESS-KEY': args.credentials.apiKey,
        'OK-ACCESS-SIGN': sign(args.credentials.secretKey, signaturePayload),
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': args.credentials.passphrase,
      },
      signal: controller.signal,
    })
  })

  clearTimeout(timer)

  if (response.status === 401) {
    throw new OkxHttpError('OKX unauthorized', 401)
  }

  if (!response.ok) {
    throw new OkxHttpError(`OKX request failed: ${response.status}`, response.status)
  }

  const payload = (await response.json()) as { code?: string; msg?: string; data?: unknown }

  if (payload.code && payload.code !== '0') {
    const statusCode = payload.code === '50113' ? 401 : 400
    throw new OkxHttpError(`OKX error: ${payload.msg ?? payload.code}`, statusCode)
  }

  return payload.data as T
}

export const validateOkxCredentials = async (credentials: OkxCredentials): Promise<void> => {
  await okxRequest({
    method: 'GET',
    path: '/api/v5/account/balance',
    credentials,
  })

  await okxRequest({
    method: 'GET',
    path: '/api/v5/trade/orders-history',
    credentials,
    query: {
      instType: 'SPOT',
      limit: '1',
    },
  })
}

interface OkxOrder {
  instType?: string
  instId?: string
  side?: string
  avgPx?: string
  fillSz?: string
  cTime?: string
  uTime?: string
  state?: string
}

export const fetchSpotOrders = async (args: {
  credentials: OkxCredentials
  sinceMs: number
}): Promise<ApiTrade[]> => {
  const all: ApiTrade[] = []
  let after: string | undefined

  for (let i = 0; i < 20; i += 1) {
    const data = await okxRequest<OkxOrder[]>({
      method: 'GET',
      path: '/api/v5/trade/orders-history',
      credentials: args.credentials,
      query: {
        instType: 'SPOT',
        limit: '100',
        after,
      },
    })

    if (!Array.isArray(data) || data.length === 0) {
      break
    }

    for (const item of data) {
      if (item.instType !== 'SPOT') {
        continue
      }
      if (item.state && item.state !== 'filled') {
        continue
      }

      const timestampRaw = item.uTime ?? item.cTime
      const timestampMs = Number(timestampRaw ?? 0)
      if (!Number.isFinite(timestampMs) || timestampMs <= 0 || timestampMs < args.sinceMs) {
        continue
      }

      const side = item.side === 'buy' ? 'buy' : item.side === 'sell' ? 'sell' : null
      if (!side) {
        continue
      }

      const symbol = item.instId ?? ''
      const quantity = item.fillSz ?? '0'
      const price = item.avgPx ?? '0'
      if (!symbol || quantity === '0' || price === '0') {
        continue
      }

      all.push({
        symbol,
        side,
        quantity,
        price,
        timestampMs,
      })
    }

    after = data[data.length - 1]?.uTime
    if (!after) {
      break
    }
  }

  return all
}
