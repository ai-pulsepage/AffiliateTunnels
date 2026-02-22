CREATE TABLE IF NOT EXISTS leads (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    funnel_id       UUID REFERENCES funnels(id) ON DELETE CASCADE,
    page_id         UUID REFERENCES pages(id),
    email           VARCHAR(255) NOT NULL,
    name            VARCHAR(255),
    custom_fields   JSONB DEFAULT '{}',
    utm_source      VARCHAR(255),
    utm_medium      VARCHAR(255),
    utm_campaign    VARCHAR(255),
    utm_term        VARCHAR(255),
    utm_content     VARCHAR(255),
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    referrer        TEXT,
    is_unsubscribed BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_funnel ON leads(funnel_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
