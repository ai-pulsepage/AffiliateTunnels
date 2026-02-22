CREATE TABLE IF NOT EXISTS clickbank_sales (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    funnel_id       UUID REFERENCES funnels(id),
    transaction_id  VARCHAR(255) UNIQUE,
    product_name    VARCHAR(255),
    amount          DECIMAL(10,2),
    commission      DECIMAL(10,2),
    payment_method  VARCHAR(50),
    customer_email  VARCHAR(255),
    event_type      VARCHAR(30),
    raw_payload     JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cb_sales_user ON clickbank_sales(user_id);
CREATE INDEX IF NOT EXISTS idx_cb_sales_funnel ON clickbank_sales(funnel_id);
CREATE INDEX IF NOT EXISTS idx_cb_sales_txn ON clickbank_sales(transaction_id);
