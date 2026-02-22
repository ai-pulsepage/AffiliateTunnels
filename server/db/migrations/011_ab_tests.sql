CREATE TABLE IF NOT EXISTS ab_tests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id         UUID REFERENCES pages(id) ON DELETE CASCADE,
    name            VARCHAR(255),
    status          VARCHAR(20) DEFAULT 'draft',
    winner_variant_id UUID,
    started_at      TIMESTAMPTZ,
    ended_at        TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ab_tests_page ON ab_tests(page_id);
