-- 048_vendor_batching.sql

-- Add batching and shipping class support to vendor_products
ALTER TABLE vendor_products
ADD COLUMN IF NOT EXISTS batch_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS shipping_class_id VARCHAR(50);

-- Make original fields nullable to support queuing before scraping
ALTER TABLE vendor_products
ALTER COLUMN original_title DROP NOT NULL,
ALTER COLUMN original_desc DROP NOT NULL,
ALTER COLUMN original_price DROP NOT NULL;

-- Create an index for faster batch lookups
CREATE INDEX IF NOT EXISTS idx_vendor_products_batch ON vendor_products(batch_id);
