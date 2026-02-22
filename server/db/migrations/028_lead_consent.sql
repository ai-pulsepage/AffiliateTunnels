-- Consent tracking for CAN-SPAM compliance
ALTER TABLE leads ADD COLUMN IF NOT EXISTS consent_offer BOOLEAN DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS consent_marketing BOOLEAN DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMPTZ;
