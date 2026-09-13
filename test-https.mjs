async function checkSupabaseHttps() {
  try {
    const res = await fetch('https://hnlieepsxoqeebkreugt.supabase.co/rest/v1/', {
      headers: { 'apikey': 'dummy' }
    });
    console.log('HTTP status:', res.status, res.statusText);
    const text = await res.text();
    console.log('Response body:', text);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

checkSupabaseHttps();
