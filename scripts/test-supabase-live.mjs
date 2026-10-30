const SUPABASE_URL = 'https://ganrahozrrzoexhtxatj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhbnJhaG96cnJ6b2V4aHR4YXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMzk5MDMsImV4cCI6MjEwODkxNTkwM30.-VvhGKLl52jzS4oiozSWsFnXnCnFhbWsRlGEET079I4';

async function testConnection() {
  console.log('Testing REST connection to:', SUPABASE_URL);

  const res = await fetch(`${SUPABASE_URL}/rest/v1/events?select=id,title,slug,capacity,status,ticket_categories(*)&status=eq.PUBLISHED`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`HTTP ${res.status} Error:`, text);
    return;
  }

  const events = await res.json();
  console.log(`\n✓ SUCCESS: Successfully fetched ${events.length} published event(s) from live Supabase:`);
  events.forEach(e => {
    console.log(`  - [${e.slug}] ${e.title} (Capacity: ${e.capacity}, Tiers: ${e.ticket_categories?.length || 0})`);
  });

  const catRes = await fetch(`${SUPABASE_URL}/rest/v1/ticket_categories?select=id,name,code,price_kobo,total_inventory`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });

  const categories = await catRes.json();
  console.log(`\n✓ SUCCESS: Successfully queried ${categories.length} ticket categories:`);
  categories.forEach(c => {
    console.log(`  - ${c.name} (${c.code}): ₦${(c.price_kobo / 100).toLocaleString()} (Cap: ${c.total_inventory})`);
  });
}

testConnection().catch(console.error);
