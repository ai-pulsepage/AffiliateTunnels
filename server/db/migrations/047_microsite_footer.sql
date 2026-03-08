-- Add footer/social customization to microsites
ALTER TABLE microsites ADD COLUMN IF NOT EXISTS footer_company_name VARCHAR(255);
ALTER TABLE microsites ADD COLUMN IF NOT EXISTS footer_website VARCHAR(500);
ALTER TABLE microsites ADD COLUMN IF NOT EXISTS footer_socials JSONB DEFAULT '{}';
-- footer_socials schema: {"instagram":"url","twitter":"url","tiktok":"url","youtube":"url","facebook":"url","linkedin":"url"}
