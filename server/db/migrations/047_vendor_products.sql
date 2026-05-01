-- Migration 047: Vendor Products Pipeline

CREATE TABLE IF NOT EXISTS vendor_products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    source_url      TEXT NOT NULL,
    vendor_name     VARCHAR(255),
    
    original_title  TEXT,
    original_desc   TEXT,
    original_images JSONB DEFAULT '[]',
    original_price  DECIMAL(10, 2),
    sku             VARCHAR(100),
    
    refined_title   TEXT,
    refined_desc    TEXT,
    seo_keywords    TEXT,
    
    status          VARCHAR(50) DEFAULT 'pending_scrape', -- pending_scrape, pending_review, pushed, failed
    target_store_id UUID REFERENCES connected_stores(id) ON DELETE SET NULL,
    
    error_message   TEXT,
    
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_products_user ON vendor_products(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_products_status ON vendor_products(status);
