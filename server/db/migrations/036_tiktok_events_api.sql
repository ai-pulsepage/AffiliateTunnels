-- Add TikTok Events API access token to settings
INSERT INTO settings (key, value, is_encrypted, description)
VALUES ('tiktok_events_api_token', '', true, 'TikTok Events API access token for server-side tracking')
ON CONFLICT (key) DO NOTHING;
