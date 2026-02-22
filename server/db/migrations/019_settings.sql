CREATE TABLE IF NOT EXISTS settings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key             VARCHAR(100) UNIQUE NOT NULL,
    value           TEXT NOT NULL DEFAULT '',
    is_encrypted    BOOLEAN DEFAULT true,
    description     VARCHAR(500),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-seed all settings keys with empty values
INSERT INTO settings (key, value, is_encrypted, description) VALUES
  ('resend_api_key', '', true, 'Resend API key for email sending'),
  ('stripe_secret_key', '', true, 'Stripe secret key'),
  ('stripe_publishable_key', '', false, 'Stripe publishable key (client-safe)'),
  ('stripe_webhook_secret', '', true, 'Stripe webhook signing secret'),
  ('stripe_pro_price_id', '', false, 'Stripe Price ID for Pro plan'),
  ('stripe_agency_price_id', '', false, 'Stripe Price ID for Agency plan'),
  ('r2_access_key', '', true, 'Cloudflare R2 access key ID'),
  ('r2_secret_key', '', true, 'Cloudflare R2 secret access key'),
  ('r2_bucket_name', '', false, 'Cloudflare R2 bucket name'),
  ('r2_public_url', '', false, 'Cloudflare R2 public URL (e.g. https://pub-xxx.r2.dev)'),
  ('r2_endpoint', '', false, 'Cloudflare R2 endpoint URL'),
  ('clickbank_secret_key', '', true, 'ClickBank IPN secret key'),
  ('clickbank_clerk_api_key', '', true, 'ClickBank Clerk API key'),
  ('default_ga4_id', '', false, 'Default Google Analytics 4 measurement ID'),
  ('default_fb_pixel_id', '', false, 'Default Facebook Pixel ID'),
  ('app_base_url', '', false, 'Base URL of the application (e.g. https://yourapp.railway.app)'),
  ('from_email', '', false, 'Default from email address for outgoing emails'),
  ('from_name', '', false, 'Default from name for outgoing emails'),
  ('physical_address', '', false, 'Physical mailing address for CAN-SPAM compliance')
ON CONFLICT (key) DO NOTHING;
