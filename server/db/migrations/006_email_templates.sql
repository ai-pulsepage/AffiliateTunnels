CREATE TABLE IF NOT EXISTS email_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    subject         VARCHAR(500) NOT NULL,
    html_content    TEXT NOT NULL,
    text_content    TEXT,
    category        VARCHAR(50),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_templates_user ON email_templates(user_id);
