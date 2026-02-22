-- Link email templates to funnels for isolation
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS funnel_id UUID REFERENCES funnels(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_email_templates_funnel ON email_templates(funnel_id);
