CREATE TABLE IF NOT EXISTS pages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    funnel_id       UUID REFERENCES funnels(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255),
    step_order      INTEGER NOT NULL DEFAULT 0,
    page_type       VARCHAR(30) DEFAULT 'landing',
    grapes_data     JSONB,
    html_output     TEXT,
    css_output      TEXT,
    custom_head     TEXT,
    custom_body     TEXT,
    seo_title       VARCHAR(255),
    seo_description TEXT,
    og_image_url    TEXT,
    is_published    BOOLEAN DEFAULT false,
    published_url   TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pages_funnel ON pages(funnel_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pages_funnel_slug ON pages(funnel_id, slug);
