-- Safety migration: ensure columns from 032 and 033 exist
-- (covers case where original migrations were recorded but failed mid-transaction)
ALTER TABLE funnels ADD COLUMN IF NOT EXISTS gads_id VARCHAR(50);
ALTER TABLE pages ADD COLUMN IF NOT EXISTS traffic_tag VARCHAR(30);

INSERT INTO settings (key, value, is_encrypted, description)
VALUES ('default_gads_id', '', false, 'Default Google Ads conversion tag ID (AW-...)')
ON CONFLICT (key) DO NOTHING;
