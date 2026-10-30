const supabaseUrl = 'https://ganrahozrrzoexhtxatj.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhbnJhaG96cnJ6b2V4aHR4YXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMzk5MDMsImV4cCI6MjEwODkxNTkwM30.-VvhGKLl52jzS4oiozSWsFnXnCnFhbWsRlGEET079I4';

async function verifyLiveSettings() {
  const url = `${supabaseUrl}/rest/v1/events?select=id,title,reservation_hold_minutes,show_countdown,show_remaining_capacity,service_fee_mode,official_notification_email&limit=1`;
  const res = await fetch(url, {
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`
    }
  });

  const data = await res.json();
  console.log('Live Event Record in Supabase:');
  console.log(JSON.stringify(data, null, 2));
}

verifyLiveSettings().catch(console.error);
