-- Media folders for organizing assets by funnel
CREATE TABLE IF NOT EXISTS media_folders (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    funnel_id   UUID REFERENCES funnels(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_folders_user ON media_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_media_folders_funnel ON media_folders(funnel_id);

-- Link media to folders
ALTER TABLE media ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES media_folders(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_media_folder ON media(folder_id);
