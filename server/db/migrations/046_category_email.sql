-- Category-based leads: tag leads with microsite subdomain
ALTER TABLE leads ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS consent_marketing BOOLEAN DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS drip_complete BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_leads_category ON leads(category);

-- Allow drip campaigns to be category-based (not just funnel-based)
ALTER TABLE drip_campaigns ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Blog notification campaigns (auto-created when blog posts publish)
CREATE TABLE IF NOT EXISTS blog_notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    blog_post_id    UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    category        VARCHAR(100) NOT NULL,
    subject         TEXT,
    preview_text    TEXT,
    html_body       TEXT,
    status          VARCHAR(20) DEFAULT 'paused',
    approved_at     TIMESTAMPTZ,
    sent_count      INT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_notifications_status ON blog_notifications(status) WHERE status IN ('paused', 'active');
