CREATE TABLE IF NOT EXISTS storefront_settings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    hero_headline   TEXT DEFAULT 'Premium Products, Curated For You',
    hero_subtitle   TEXT DEFAULT 'We empower the future of AI and product marketing through social media and product placement.',
    brand_name      VARCHAR(100) DEFAULT 'DealFindAI',
    logo_url        TEXT,
    accent_color    VARCHAR(20) DEFAULT '#6366f1',
    footer_text     TEXT DEFAULT '© DealFindAI. All rights reserved.',
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
