/**
 * /api/subscribe
 *
 * POST — adds an email to Brevo list 7
 *
 * Requires:
 *   Env var: BREVO_API_KEY (set in Cloudflare Pages settings)
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400, headers: CORS });
  }

  const email = (data.email || '').trim().toLowerCase().slice(0, 254);
  if (!email || !email.includes('@')) {
    return Response.json({ error: 'A valid email is required.' }, { status: 400, headers: CORS });
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        email,
        listIds: [7],
        updateEnabled: true,
      }),
    });

    // 201 = created, 204 = already exists (updateEnabled)
    if (!res.ok && res.status !== 204) {
      const err = await res.text();
      console.error('Brevo error:', res.status, err);
      return Response.json({ error: 'Could not subscribe. Please try again.' }, { status: 502, headers: CORS });
    }
  } catch (err) {
    console.error('Subscribe failed:', err);
    return Response.json({ error: 'Could not subscribe. Please try again.' }, { status: 502, headers: CORS });
  }

  return Response.json({ ok: true }, { headers: CORS });
}
