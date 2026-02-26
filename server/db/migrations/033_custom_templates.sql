-- Custom templates saved by users from the editor
CREATE TABLE IF NOT EXISTS custom_templates (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    emoji       VARCHAR(10) DEFAULT '📄',
    category    VARCHAR(50) DEFAULT 'custom',
    blocks      JSONB NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_templates_user ON custom_templates(user_id);
