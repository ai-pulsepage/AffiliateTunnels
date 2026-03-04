CREATE TABLE IF NOT EXISTS showcase_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    page_id         UUID REFERENCES pages(id) ON DELETE CASCADE,
    category_id     UUID REFERENCES showcase_categories(id) ON DELETE SET NULL,
    display_title   VARCHAR(255),
    display_desc    TEXT,
    card_image_url  TEXT,
    price_label     VARCHAR(50),
    sort_order      INTEGER DEFAULT 0,
    is_visible      BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_showcase_items_user ON showcase_items(user_id);
CREATE INDEX IF NOT EXISTS idx_showcase_items_cat ON showcase_items(category_id);
