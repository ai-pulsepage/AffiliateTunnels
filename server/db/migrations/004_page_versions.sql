CREATE TABLE IF NOT EXISTS page_versions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id         UUID REFERENCES pages(id) ON DELETE CASCADE,
    version_number  INTEGER NOT NULL,
    grapes_data     JSONB NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_versions_page ON page_versions(page_id, version_number DESC);
