CREATE TABLE IF NOT EXISTS drip_campaigns (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    funnel_id       UUID REFERENCES funnels(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    is_active       BOOLEAN DEFAULT false,
    from_name       VARCHAR(255),
    from_email      VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drip_campaigns_funnel ON drip_campaigns(funnel_id);
