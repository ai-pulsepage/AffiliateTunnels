const TIER_LIMITS = {
  free: {
    funnels: 1,
    pagesPerFunnel: 3,
    monthlyVisitors: 1000,
    abTesting: false,
    customDomain: false,
    templates: 'basic',
    emailDrips: 1,
    leadsExport: false,
    linkCloaking: false,
    teamSeats: 1,
    whiteLabel: false,
  },
  pro: {
    funnels: 10,
    pagesPerFunnel: -1, // unlimited
    monthlyVisitors: 50000,
    abTesting: true,
    customDomain: true,
    templates: 'all',
    emailDrips: -1,
    leadsExport: true,
    linkCloaking: true,
    teamSeats: 1,
    whiteLabel: false,
  },
  agency: {
    funnels: -1,
    pagesPerFunnel: -1,
    monthlyVisitors: -1,
    abTesting: true,
    customDomain: true,
    templates: 'all',
    emailDrips: -1,
    leadsExport: true,
    linkCloaking: true,
    teamSeats: 5,
    whiteLabel: true,
  },
};

const PLAN_PRICES = {
  free: { monthly: 0, stripePriceId: null },
  pro: { monthly: 2700, stripePriceId: null }, // cents
  agency: { monthly: 9700, stripePriceId: null },
};

const PAGE_TYPES = ['landing', 'bridge', 'offer', 'optin', 'thankyou', 'bonus', 'vsl', 'webinar'];

const CONTENT_TYPES = ['demographics', 'email_swipe', 'landing_copy', 'image', 'video', 'link', 'document'];

const TEMPLATE_CATEGORIES = ['bridge', 'bonus', 'optin', 'vsl', 'webinar', 'clickbank', 'ecommerce', 'leadgen'];

const EVENT_TYPES = ['pageview', 'click', 'form_submit', 'conversion', 'bounce', 'scroll', 'exit_intent'];

const EMAIL_EVENT_TYPES = ['delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed'];

const DRIP_STATUSES = ['pending', 'sent', 'failed', 'cancelled'];

const AB_TEST_STATUSES = ['draft', 'running', 'completed', 'paused'];

const CLICKBANK_EVENT_TYPES = ['SALE', 'RFND', 'CGBK', 'CANCEL', 'BILL', 'TEST_SALE'];

const SETTINGS_KEYS = [
  'resend_api_key',
  'stripe_secret_key',
  'stripe_publishable_key',
  'stripe_webhook_secret',
  'stripe_pro_price_id',
  'stripe_agency_price_id',
  'r2_access_key',
  'r2_secret_key',
  'r2_bucket_name',
  'r2_public_url',
  'r2_endpoint',
  'clickbank_secret_key',
  'clickbank_clerk_api_key',
  'default_ga4_id',
  'default_gads_id',
  'default_fb_pixel_id',
  'default_tiktok_pixel_id',
  'tiktok_events_api_token',
  'app_base_url',
  'from_email',
  'from_name',
  'physical_address',
  'gemini_api_key',
];

module.exports = {
  TIER_LIMITS,
  PLAN_PRICES,
  PAGE_TYPES,
  CONTENT_TYPES,
  TEMPLATE_CATEGORIES,
  EVENT_TYPES,
  EMAIL_EVENT_TYPES,
  DRIP_STATUSES,
  AB_TEST_STATUSES,
  CLICKBANK_EVENT_TYPES,
  SETTINGS_KEYS,
};
