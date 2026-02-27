-- Add TikTok Pixel ID to funnels (per-funnel override)
ALTER TABLE funnels ADD COLUMN IF NOT EXISTS tiktok_pixel_id VARCHAR(50);

-- Add default TikTok Pixel ID to settings (global default)
INSERT INTO settings (key, value, is_encrypted, description)
VALUES ('default_tiktok_pixel_id', '', false, 'Default TikTok Pixel ID')
ON CONFLICT (key) DO NOTHING;
