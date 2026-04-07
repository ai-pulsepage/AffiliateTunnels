-- Add click_id column for ad network postback tracking
-- Stores the ad network's click identifier (e.g., __CALLBACK_PARAM__ value)
ALTER TABLE click_tracking ADD COLUMN IF NOT EXISTS click_id VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_click_tracking_click_id ON click_tracking(click_id) WHERE click_id IS NOT NULL;
