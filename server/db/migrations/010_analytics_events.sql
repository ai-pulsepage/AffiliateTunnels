CREATE TABLE IF NOT EXISTS analytics_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    funnel_id       UUID REFERENCES funnels(id) ON DELETE CASCADE,
    page_id         UUID REFERENCES pages(id),
    variant_id      UUID,
    event_type      VARCHAR(30) NOT NULL,
    visitor_id      VARCHAR(64),
    session_id      VARCHAR(64),
    ip_address      VARCHAR(45),
    country         VARCHAR(2),
    city            VARCHAR(100),
    device_type     VARCHAR(20),
    browser         VARCHAR(50),
    os              VARCHAR(50),
    referrer        TEXT,
    utm_source      VARCHAR(255),
    utm_medium      VARCHAR(255),
    utm_campaign    VARCHAR(255),
    page_url        TEXT,
    element_id      VARCHAR(255),
    time_on_page    INTEGER,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_funnel_date ON analytics_events(funnel_id, created_at);
CREATE INDEX IF NOT EXISTS idx_events_page_type ON analytics_events(page_id, event_type);
CREATE INDEX IF NOT EXISTS idx_events_visitor ON analytics_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_events_created ON analytics_events(created_at);
