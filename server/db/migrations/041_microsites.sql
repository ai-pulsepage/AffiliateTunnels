CREATE TABLE IF NOT EXISTS microsites (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    subdomain       VARCHAR(63) UNIQUE NOT NULL,
    site_title      VARCHAR(255),
    site_subtitle   TEXT,
    accent_color    VARCHAR(20) DEFAULT '#6366f1',
    logo_url        TEXT,
    optin_enabled   BOOLEAN DEFAULT FALSE,
    optin_headline  TEXT DEFAULT 'Get an Exclusive Discount',
    optin_incentive TEXT DEFAULT 'Enter your email to receive your special offer link.',
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_microsites_user ON microsites(user_id);
CREATE INDEX IF NOT EXISTS idx_microsites_subdomain ON microsites(subdomain);
