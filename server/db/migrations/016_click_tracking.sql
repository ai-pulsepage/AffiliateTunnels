CREATE TABLE IF NOT EXISTS click_tracking (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cloaked_link_id UUID REFERENCES cloaked_links(id) ON DELETE CASCADE,
    visitor_id      VARCHAR(64),
    ip_address      VARCHAR(45),
    country         VARCHAR(2),
    device_type     VARCHAR(20),
    referrer        TEXT,
    utm_source      VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_click_tracking_link ON click_tracking(cloaked_link_id, created_at);
