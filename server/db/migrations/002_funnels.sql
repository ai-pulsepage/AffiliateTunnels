CREATE TABLE IF NOT EXISTS funnels (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE,
    status          VARCHAR(20) DEFAULT 'draft',
    brand_colors    JSONB DEFAULT '{}',
    brand_fonts     JSONB DEFAULT '{}',
    thumbnail_url   TEXT,
    seo_title       VARCHAR(255),
    seo_description TEXT,
    og_image_url    TEXT,
    ga4_id          VARCHAR(50),
    fb_pixel_id     VARCHAR(50),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funnels_user ON funnels(user_id);
CREATE INDEX IF NOT EXISTS idx_funnels_slug ON funnels(slug);
