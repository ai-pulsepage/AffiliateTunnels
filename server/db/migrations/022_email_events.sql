CREATE TABLE IF NOT EXISTS email_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drip_queue_id   UUID REFERENCES drip_queue(id),
    resend_id       VARCHAR(255),
    event_type      VARCHAR(30),
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_events_queue ON email_events(drip_queue_id);
CREATE INDEX IF NOT EXISTS idx_email_events_resend ON email_events(resend_id);
