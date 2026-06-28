-- 061_price_comparison.sql

-- ─── MODULE 1: COMPETITOR PRICING MONITOR ────────────────────────────

CREATE TABLE IF NOT EXISTS price_comparison_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    store_id UUID REFERENCES connected_stores(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    source VARCHAR(50) NOT NULL, -- 'shopify_scan', 'excel_upload'
    shopify_collection VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- pending, scanning, completed, failed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_comparison_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES price_comparison_sessions(id) ON DELETE CASCADE,
    sku VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    barcode VARCHAR(100),
    external_variant_id VARCHAR(255), -- For Shopify variant update mapping
    cost NUMERIC(10, 2) DEFAULT 0.00,
    current_price NUMERIC(10, 2) DEFAULT 0.00,
    suggested_price NUMERIC(10, 2),
    status VARCHAR(50) DEFAULT 'pending', -- pending, scanning, completed, failed
    error_message TEXT,
    scanned_at TIMESTAMPTZ,
    sync_status VARCHAR(50) DEFAULT 'idle', -- idle, syncing, synced, error
    sync_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_comparison_competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES price_comparison_products(id) ON DELETE CASCADE,
    competitor_name VARCHAR(255) NOT NULL,
    competitor_price NUMERIC(10, 2) NOT NULL,
    competitor_url VARCHAR(500),
    stock_status VARCHAR(50) DEFAULT 'in_stock',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_comparison_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES price_comparison_sessions(id) ON DELETE CASCADE,
    executive_summary TEXT,
    qa_insights JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id)
);

-- ─── MODULE 2: WOOCOMMERCE PRODUCT OPTIMIZER ─────────────────────────

-- Background jobs tracking for product optimizations
CREATE TABLE IF NOT EXISTS woocommerce_optimization_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    store_id UUID REFERENCES connected_stores(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, running, completed, failed
    total_products INT DEFAULT 0,
    processed_products INT DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historic record of all changes, with full before/after state
CREATE TABLE IF NOT EXISTS woocommerce_product_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES woocommerce_optimization_jobs(id) ON DELETE CASCADE,
    product_id VARCHAR(255) NOT NULL, -- ID in WooCommerce
    original_title VARCHAR(255),
    optimized_title VARCHAR(255),
    original_description TEXT,
    optimized_description TEXT,
    original_categories JSONB, -- name/id details
    optimized_categories JSONB,
    status VARCHAR(50) DEFAULT 'applied', -- applied, reverted
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pc_sessions_user ON price_comparison_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pc_products_session ON price_comparison_products(session_id);
CREATE INDEX IF NOT EXISTS idx_pc_competitors_product ON price_comparison_competitors(product_id);
CREATE INDEX IF NOT EXISTS idx_woo_jobs_store ON woocommerce_optimization_jobs(store_id);
CREATE INDEX IF NOT EXISTS idx_woo_changes_job ON woocommerce_product_changes(job_id);
