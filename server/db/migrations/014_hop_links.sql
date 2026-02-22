CREATE TABLE IF NOT EXISTS hop_links (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    affiliate_id    VARCHAR(100) NOT NULL,
    vendor_id       VARCHAR(100) NOT NULL,
    product_name    VARCHAR(255),
    hop_url         TEXT GENERATED ALWAYS AS (
        'https://' || affiliate_id || '.' || vendor_id || '.hop.clickbank.net'
    ) STORED,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hop_links_user ON hop_links(user_id);
