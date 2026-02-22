CREATE TABLE IF NOT EXISTS affiliate_content (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    content_type    VARCHAR(30) NOT NULL,
    title           VARCHAR(255),
    body            TEXT,
    file_url        TEXT,
    product_name    VARCHAR(255),
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_content_user ON affiliate_content(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_content_type ON affiliate_content(content_type);
