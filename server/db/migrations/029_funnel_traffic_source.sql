ALTER TABLE funnels ADD COLUMN IF NOT EXISTS traffic_source VARCHAR(30) DEFAULT 'custom';
-- Values: native, facebook, youtube, tiktok, instagram, seo, pinterest, custom
