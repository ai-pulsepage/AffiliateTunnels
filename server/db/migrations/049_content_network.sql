-- ─── Phase 1: Content Network fields on microsites ───────────────────────────

-- Point microsites at an external store (the actual Shopify/WooCommerce site)
ALTER TABLE microsites ADD COLUMN IF NOT EXISTS target_store_url TEXT;
ALTER TABLE microsites ADD COLUMN IF NOT EXISTS target_store_name VARCHAR(255);

-- Staleness tracking: when was the last piece of content published?
ALTER TABLE microsites ADD COLUMN IF NOT EXISTS last_content_at TIMESTAMPTZ;
ALTER TABLE microsites ADD COLUMN IF NOT EXISTS staleness_days INT DEFAULT 7;

-- ─── Phase 2: Supplier Intelligence ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    website TEXT,
    contact_email TEXT,
    contact_name VARCHAR(255),
    phone VARCHAR(100),
    country VARCHAR(100) DEFAULT 'US',
    product_categories TEXT[],             -- e.g. ['telescopes', 'astronomy']
    price_range_min INT,                   -- min product price in USD
    price_range_max INT,                   -- max product price in USD
    monthly_search_volume INT,             -- estimated searches/mo
    search_trend VARCHAR(20),              -- 'growing' | 'stable' | 'declining'
    trend_data JSONB,                      -- raw Google Trends response
    notes TEXT,
    source VARCHAR(50) DEFAULT 'manual',   -- 'manual' | 'thomasnet' | 'ai'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplier_outreach (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'prospect',  -- 'prospect' | 'contacted' | 'in_discussion' | 'approved' | 'declined' | 'active'
    outreach_letter TEXT,                   -- AI-generated letter
    last_contact_at TIMESTAMPTZ,
    next_followup_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS keyword_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    microsite_id UUID REFERENCES microsites(id) ON DELETE SET NULL,
    niche VARCHAR(255) NOT NULL,
    primary_keyword VARCHAR(255),
    keywords JSONB DEFAULT '[]',            -- array of {keyword, volume, cpc, competition, trend}
    ad_headlines JSONB DEFAULT '[]',        -- Google Ads headlines
    ad_descriptions JSONB DEFAULT '[]',     -- Google Ads descriptions
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_user ON suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_outreach_user ON supplier_outreach(user_id);
CREATE INDEX IF NOT EXISTS idx_outreach_supplier ON supplier_outreach(supplier_id);
CREATE INDEX IF NOT EXISTS idx_outreach_status ON supplier_outreach(status);
CREATE INDEX IF NOT EXISTS idx_keyword_clusters_user ON keyword_clusters(user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_outreach_updated_at ON supplier_outreach;
CREATE TRIGGER update_outreach_updated_at BEFORE UPDATE ON supplier_outreach
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
