CREATE TABLE IF NOT EXISTS templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID,
    name            VARCHAR(255) NOT NULL,
    category        VARCHAR(50),
    template_type   VARCHAR(20) DEFAULT 'page',
    grapes_data     JSONB NOT NULL,
    thumbnail_url   TEXT,
    is_global       BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_user ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_global ON templates(is_global) WHERE is_global = true;
