CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  telegram_id TEXT NOT NULL UNIQUE,
  username TEXT,
  encrypted_api_key TEXT,
  encrypted_secret TEXT,
  encrypted_passphrase TEXT,
  api_connected BOOLEAN NOT NULL DEFAULT FALSE,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trades (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  entry_price NUMERIC(28, 12) NOT NULL,
  exit_price NUMERIC(28, 12) NOT NULL,
  quantity NUMERIC(28, 12) NOT NULL,
  buy_total NUMERIC(28, 12) NOT NULL,
  sell_total NUMERIC(28, 12) NOT NULL,
  pnl NUMERIC(28, 12) NOT NULL,
  pnl_percent NUMERIC(28, 12) NOT NULL,
  entry_time TIMESTAMPTZ NOT NULL,
  exit_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, symbol, entry_time, exit_time, quantity)
);

CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users (telegram_id);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades (user_id);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades (symbol);
CREATE INDEX IF NOT EXISTS idx_trades_entry_time_desc ON trades (entry_time DESC);
CREATE INDEX IF NOT EXISTS idx_trades_user_exit_desc ON trades (user_id, exit_time DESC, id DESC);
