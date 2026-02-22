CREATE TABLE IF NOT EXISTS media (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    filename        VARCHAR(255) NOT NULL,
    file_url        TEXT NOT NULL,
    file_key        VARCHAR(500),
    file_size       INTEGER,
    mime_type       VARCHAR(100),
    width           INTEGER,
    height          INTEGER,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_user ON media(user_id);
