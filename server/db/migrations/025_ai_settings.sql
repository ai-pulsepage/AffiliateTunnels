-- Add Gemini API key setting for AI copywriter
INSERT INTO settings (key, value, is_encrypted, description) VALUES
  ('gemini_api_key', '', true, 'Google Gemini API key for AI article generation')
ON CONFLICT (key) DO NOTHING;
