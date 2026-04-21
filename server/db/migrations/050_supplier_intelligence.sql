-- 050_supplier_intelligence.sql

-- Global cache of discovered manufacturers to prevent redundant AI lookups
CREATE TABLE IF NOT EXISTS manufacturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    website_url VARCHAR(500),
    description TEXT,
    niche VARCHAR(255),
    estimated_size VARCHAR(50),
    country VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_website UNIQUE(website_url)
);

-- User's personal CRM of saved manufacturers
CREATE TABLE IF NOT EXISTS user_manufacturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Discovered', -- Discovered, Contacted, Negotiating, Approved, Rejected
    custom_notes TEXT,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    generated_pitch TEXT,
    linked_microsite_id UUID REFERENCES microsites(id) ON DELETE SET NULL,
    ecommerce_store_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_manufacturer UNIQUE(user_id, manufacturer_id)
);

CREATE INDEX IF NOT EXISTS idx_manufacturers_niche ON manufacturers(niche);
CREATE INDEX IF NOT EXISTS idx_user_manufacturers_user ON user_manufacturers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_manufacturers_status ON user_manufacturers(status);
