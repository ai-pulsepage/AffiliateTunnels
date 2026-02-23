CREATE TABLE IF NOT EXISTS blog_posts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    funnel_id       UUID REFERENCES funnels(id) ON DELETE SET NULL,
    title           VARCHAR(500) NOT NULL,
    slug            VARCHAR(500) UNIQUE NOT NULL,
    excerpt         TEXT,
    content_html    TEXT,
    featured_image  TEXT,
    seo_title       VARCHAR(255),
    seo_description VARCHAR(500),
    seo_keyword     VARCHAR(255),
    category        VARCHAR(100),
    tags            TEXT[] DEFAULT '{}',
    status          VARCHAR(20) DEFAULT 'draft',
    published_url   TEXT,
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_user ON blog_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_funnel ON blog_posts(funnel_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
