/**
 * Public Client Configuration
 * Live Supabase project configured with Project Reference: ganrahozrrzoexhtxatj
 */
export const CONFIG = {
  APP_NAME: 'The Fashion Social & Marketplace',
  VERSION: '2.0.0',
  FLAGSHIP_SLUG: 'the-fashion-social',
  
  // Supabase public configuration
  SUPABASE_URL: 'https://ganrahozrrzoexhtxatj.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhbnJhaG96cnJ6b2V4aHR4YXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMzk5MDMsImV4cCI6MjEwODkxNTkwM30.-VvhGKLl52jzS4oiozSWsFnXnCnFhbWsRlGEET079I4',
  
  // Paystack public key
  PAYSTACK_PUBLIC_KEY: window.__ENV?.PAYSTACK_PUBLIC_KEY || 'pk_test_sample_fashion_social_2026',
  
  // Currency and locale
  CURRENCY: 'NGN',
  CURRENCY_SYMBOL: '₦',
  LOCALE: 'en-NG',
  TIMEZONE: 'Africa/Lagos',
  
  // Reservation settings (FR-11)
  HOLD_WINDOW_MINUTES: 10,
  HOLD_WINDOW_SECONDS: 600,
  
  // Check if live Supabase client is operational
  isLiveSupabase() {
    return Boolean(
      window.supabase && 
      this.SUPABASE_URL && 
      !this.SUPABASE_URL.includes('placeholder') &&
      this.SUPABASE_ANON_KEY &&
      !this.SUPABASE_ANON_KEY.includes('placeholder')
    );
  }
};
