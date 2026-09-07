-- ============================================================================
-- MTF Analytics & Disclosures Database Schema (PostgreSQL / SQLite Compatible)
-- ============================================================================

-- 1. Daily Statutory MTF Disclosures
CREATE TABLE IF NOT EXISTS mtf_disclosures (
    id SERIAL PRIMARY KEY,
    disclosure_date DATE NOT NULL,
    symbol VARCHAR(32) NOT NULL,
    exchange VARCHAR(8) NOT NULL DEFAULT 'NSE',
    isin VARCHAR(16) NOT NULL,
    company_name VARCHAR(256),
    financed_quantity BIGINT NOT NULL DEFAULT 0,
    amount_financed_lakhs NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    amount_financed_cr NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    market_cap_lakhs NUMERIC(16, 2),
    free_float_mcap_lakhs NUMERIC(16, 2),
    leverage_pct NUMERIC(6, 2),
    ff_leverage_pct NUMERIC(6, 2),
    days_to_cover NUMERIC(6, 2),
    change_30d_pct NUMERIC(6, 2),
    is_etf BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_date_exchange_symbol UNIQUE (disclosure_date, exchange, symbol)
);

CREATE INDEX IF NOT EXISTS idx_mtf_symbol ON mtf_disclosures (symbol);
CREATE INDEX IF NOT EXISTS idx_mtf_date ON mtf_disclosures (disclosure_date);

-- 2. Real-Time Market Quotes Snapshot Cache
CREATE TABLE IF NOT EXISTS market_quotes (
    symbol VARCHAR(32) PRIMARY KEY,
    cmp NUMERIC(10, 2) NOT NULL,
    day_change NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    percent_change NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    day_high NUMERIC(10, 2),
    day_low NUMERIC(10, 2),
    volume BIGINT NOT NULL DEFAULT 0,
    provider VARCHAR(32) NOT NULL,
    is_live BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. SEBI Regulatory Haircuts Master
CREATE TABLE IF NOT EXISTS regulatory_haircuts (
    symbol VARCHAR(32) PRIMARY KEY,
    exchange VARCHAR(8) NOT NULL DEFAULT 'NSE',
    isin VARCHAR(16) NOT NULL,
    var_margin_pct NUMERIC(5, 2) NOT NULL,
    elm_margin_pct NUMERIC(5, 2) NOT NULL,
    total_haircut_pct NUMERIC(5, 2) NOT NULL,
    category VARCHAR(32) NOT NULL,
    max_leverage NUMERIC(4, 2) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Ingestion Worker Audit Logs
CREATE TABLE IF NOT EXISTS ingestion_logs (
    id SERIAL PRIMARY KEY,
    ingestion_date DATE NOT NULL,
    status VARCHAR(32) NOT NULL,
    nse_count INTEGER NOT NULL DEFAULT 0,
    bse_count INTEGER NOT NULL DEFAULT 0,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
