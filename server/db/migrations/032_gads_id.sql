-- Add Google Ads Tag ID column to funnels
ALTER TABLE funnels ADD COLUMN IF NOT EXISTS gads_id VARCHAR(50);

-- Add default Google Ads tag to global settings
INSERT INTO settings (key, value, is_encrypted, description)
VALUES ('default_gads_id', '', false, 'Default Google Ads conversion tag ID (AW-...)')
ON CONFLICT (key) DO NOTHING;
