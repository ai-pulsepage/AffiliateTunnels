-- Blog queue: 1-to-1 mapping of reference URL + topic + scheduled date
CREATE TABLE IF NOT EXISTS blog_queue (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id       UUID REFERENCES blog_workers(id) ON DELETE CASCADE,
    reference_url   TEXT NOT NULL,
    topic           TEXT NOT NULL,
    target_keyword  VARCHAR(255),
    scheduled_at    TIMESTAMPTZ,
    status          VARCHAR(20) DEFAULT 'pending',
    post_id         UUID REFERENCES blog_posts(id),
    error           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_queue_worker ON blog_queue(worker_id);
CREATE INDEX IF NOT EXISTS idx_blog_queue_pending ON blog_queue(scheduled_at) WHERE status = 'pending';
