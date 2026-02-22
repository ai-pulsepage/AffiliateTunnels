CREATE TABLE IF NOT EXISTS drip_emails (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drip_campaign_id UUID REFERENCES drip_campaigns(id) ON DELETE CASCADE,
    email_template_id UUID REFERENCES email_templates(id),
    step_order      INTEGER NOT NULL,
    delay_days      INTEGER NOT NULL DEFAULT 0,
    subject_override VARCHAR(500),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drip_emails_campaign ON drip_emails(drip_campaign_id, step_order);
