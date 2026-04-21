-- 060_connected_stores.sql

CREATE TABLE IF NOT EXISTS connected_stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    store_name VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL, -- 'shopify' or 'woocommerce'
    store_url VARCHAR(500) NOT NULL,
    api_key VARCHAR(500), -- WooCommerce Consumer Key
    api_secret VARCHAR(500), -- WooCommerce Consumer Secret
    access_token VARCHAR(500), -- Shopify Custom App Access Token
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS store_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES connected_stores(id) ON DELETE CASCADE,
    microsite_product_id UUID REFERENCES microsite_products(id) ON DELETE CASCADE,
    external_id VARCHAR(255) NOT NULL, -- ID in Shopify or WooCommerce
    external_url VARCHAR(500),
    sync_status VARCHAR(50) DEFAULT 'success',
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id, microsite_product_id)
);

-- Add e-commerce specific columns to microsite_products so they can be pushed
ALTER TABLE microsite_products 
    ADD COLUMN IF NOT EXISTS sku VARCHAR(100),
    ADD COLUMN IF NOT EXISTS barcode VARCHAR(100),
    ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS weight NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS weight_unit VARCHAR(10) DEFAULT 'kg',
    ADD COLUMN IF NOT EXISTS vendor_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS tags VARCHAR(500);

-- Migrate existing price_label to price if possible
-- (This is best-effort since price_label could be any string like "$1,000+")
UPDATE microsite_products 
SET price = NULLIF(regexp_replace(price_label, '[^0-9.]', '', 'g'), '')::NUMERIC
WHERE price IS NULL AND price_label IS NOT NULL AND price_label ~ '[0-9]';
