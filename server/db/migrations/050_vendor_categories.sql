-- 050_vendor_categories.sql

-- Add category support to vendor_products
ALTER TABLE vendor_products
ADD COLUMN IF NOT EXISTS category_id VARCHAR(50);
