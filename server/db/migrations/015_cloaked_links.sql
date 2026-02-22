CREATE TABLE IF NOT EXISTS cloaked_links (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    slug            VARCHAR(100) UNIQUE NOT NULL,
    destination_url TEXT NOT NULL,
    total_clicks    INTEGER DEFAULT 0,
    unique_clicks   INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cloaked_links_user ON cloaked_links(user_id);
CREATE INDEX IF NOT EXISTS idx_cloaked_links_slug ON cloaked_links(slug);
