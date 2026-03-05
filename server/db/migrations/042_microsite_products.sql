CREATE TABLE IF NOT EXISTS microsite_products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    microsite_id    UUID REFERENCES microsites(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    source_url      TEXT NOT NULL,
    affiliate_url   TEXT NOT NULL,
    product_name    VARCHAR(255),
    product_desc    TEXT,
    slug            VARCHAR(255),
    card_image_url  TEXT,
    images          JSONB DEFAULT '[]',
    price_label     VARCHAR(50),
    generated_html  TEXT,
    product_intel   JSONB DEFAULT '{}',
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(microsite_id, source_url)
);

CREATE INDEX IF NOT EXISTS idx_msp_microsite ON microsite_products(microsite_id);
CREATE INDEX IF NOT EXISTS idx_msp_user ON microsite_products(user_id);
