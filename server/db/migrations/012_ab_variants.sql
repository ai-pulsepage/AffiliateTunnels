CREATE TABLE IF NOT EXISTS ab_variants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ab_test_id      UUID REFERENCES ab_tests(id) ON DELETE CASCADE,
    name            VARCHAR(10) NOT NULL,
    grapes_data     JSONB NOT NULL,
    traffic_percent INTEGER NOT NULL DEFAULT 50,
    views           INTEGER DEFAULT 0,
    conversions     INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ab_variants_test ON ab_variants(ab_test_id);
