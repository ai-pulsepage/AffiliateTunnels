-- Add category column to funnels (links landing pages to microsite subdomains for Reviews tab)
ALTER TABLE funnels ADD COLUMN IF NOT EXISTS category VARCHAR(100);
CREATE INDEX IF NOT EXISTS idx_funnels_category ON funnels(category);

-- Link blog posts to microsites
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS microsite_id UUID REFERENCES microsites(id) ON DELETE SET NULL;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS worker_id UUID;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_name VARCHAR(255);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_title VARCHAR(255);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_avatar TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS target_keyword VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_blog_posts_microsite ON blog_posts(microsite_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_worker ON blog_posts(worker_id);
