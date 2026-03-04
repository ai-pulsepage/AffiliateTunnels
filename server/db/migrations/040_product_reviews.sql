CREATE TABLE IF NOT EXISTS product_reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    source_url      TEXT NOT NULL,
    product_name    VARCHAR(255),
    affiliate_link  TEXT,
    generated_html  TEXT,
    published_url   TEXT,
    is_published    BOOLEAN DEFAULT FALSE,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_user ON product_reviews(user_id);
