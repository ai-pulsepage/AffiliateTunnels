CREATE TABLE IF NOT EXISTS drip_queue (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drip_email_id   UUID REFERENCES drip_emails(id) ON DELETE CASCADE,
    lead_id         UUID REFERENCES leads(id) ON DELETE CASCADE,
    scheduled_at    TIMESTAMPTZ NOT NULL,
    sent_at         TIMESTAMPTZ,
    status          VARCHAR(20) DEFAULT 'pending',
    resend_id       VARCHAR(255),
    error           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drip_queue_pending ON drip_queue(scheduled_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_drip_queue_lead ON drip_queue(lead_id);
