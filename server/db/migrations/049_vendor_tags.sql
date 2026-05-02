-- 049_vendor_tags.sql

-- Add tags support to vendor_products
ALTER TABLE vendor_products
ADD COLUMN IF NOT EXISTS tags JSONB;
