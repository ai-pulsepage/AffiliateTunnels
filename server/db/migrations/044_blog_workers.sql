-- BlogMaker 3000: Blog worker agents
CREATE TABLE IF NOT EXISTS blog_workers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    microsite_id    UUID REFERENCES microsites(id) ON DELETE CASCADE,
    worker_name     VARCHAR(100) NOT NULL,
    worker_title    VARCHAR(255),
    worker_avatar   TEXT,
    affiliate_links JSONB DEFAULT '[]',
    reference_urls  JSONB DEFAULT '[]',
    topics          JSONB DEFAULT '[]',
    prompt_template TEXT,
    schedule_cron   VARCHAR(50) DEFAULT '0 9 1,15 * *',
    schedule_start  TIMESTAMPTZ,
    next_run_at     TIMESTAMPTZ,
    posts_requested INTEGER DEFAULT 4,
    status          VARCHAR(20) DEFAULT 'paused',
    posts_generated INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_workers_user ON blog_workers(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_workers_microsite ON blog_workers(microsite_id);
CREATE INDEX IF NOT EXISTS idx_blog_workers_status ON blog_workers(status);
CREATE INDEX IF NOT EXISTS idx_blog_workers_next_run ON blog_workers(next_run_at);
