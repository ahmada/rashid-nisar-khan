/**
 * /api/memory
 *
 * GET  — returns all approved memories (newest first)
 * POST — submits a new memory for moderation
 *
 * Requires:
 *   KV binding: MEMORIES (set in Cloudflare Pages settings)
 *   Env var:    ADMIN_EMAIL (set in Cloudflare Pages settings)
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

// ── GET: return approved memories ─────────────────────────────────
export async function onRequestGet({ env }) {
  try {
    const list = await env.MEMORIES.list({ prefix: 'approved:' });
    const memories = await Promise.all(
      list.keys.map(k => env.MEMORIES.get(k.name, { type: 'json' }))
    );
    const sorted = memories
      .filter(Boolean)
      .sort((a, b) => b.approved_at - a.approved_at);
    return Response.json(sorted, { headers: CORS });
  } catch (err) {
    console.error('GET /api/memory error:', err);
    return Response.json([], { headers: CORS });
  }
}

// ── POST: submit a memory ──────────────────────────────────────────
export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400, headers: CORS });
  }

  const name         = (data.name || '').trim().slice(0, 80);
  const relationship = (data.relationship || '').trim().slice(0, 100);
  const text         = (data.text || '').trim().slice(0, 1200);

  if (!name || !text) {
    return Response.json({ error: 'Name and memory are required.' }, { status: 400, headers: CORS });
  }

  const id    = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const token = crypto.randomUUID();

  const memory = { id, name, relationship, text, submitted_at: Date.now() };

  // Store pending — expires in 30 days if never approved
  await env.MEMORIES.put(`pending:${token}`, JSON.stringify(memory), {
    expirationTtl: 60 * 60 * 24 * 30,
  });

  // Send moderation email to admin
  const adminEmail = env.ADMIN_EMAIL || 'admin@rashidnisarkhan.com';
  const approveUrl = `https://rashidnisarkhan.com/api/approve?token=${token}`;
  await sendModerationEmail(adminEmail, memory, approveUrl, env.RESEND_API_KEY);

  return Response.json({ ok: true }, { headers: CORS });
}

// ── Email via Resend ───────────────────────────────────────────────
async function sendModerationEmail(to, memory, approveUrl, apiKey) {
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0e9d8;font-family:Georgia,serif;">
  <div style="max-width:580px;margin:2rem auto;background:#f5eedf;border:1px solid rgba(28,92,56,0.14);padding:2.5rem;">
    <h2 style="font-size:1.3rem;color:#1c5c38;margin:0 0 1.5rem;font-weight:500;">
      New memory for Rashid Nisar Khan
    </h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:1.5rem;">
      <tr>
        <td style="padding:0.35rem 0;color:#5c6e62;font-size:0.82rem;width:100px;">From</td>
        <td style="padding:0.35rem 0;color:#162318;font-size:0.9rem;">${escapeHtml(memory.name)}</td>
      </tr>
      ${memory.relationship ? `<tr>
        <td style="padding:0.35rem 0;color:#5c6e62;font-size:0.82rem;">Knew him as</td>
        <td style="padding:0.35rem 0;color:#162318;font-size:0.9rem;">${escapeHtml(memory.relationship)}</td>
      </tr>` : ''}
    </table>
    <blockquote style="border-left:3px solid #1c5c38;margin:0 0 2rem;padding:0.8rem 1.2rem;font-style:italic;color:#2e4535;font-size:0.95rem;line-height:1.75;background:rgba(28,92,56,0.04);">
      "${escapeHtml(memory.text)}"
    </blockquote>
    <a href="${approveUrl}"
       style="display:inline-block;background:#1c5c38;color:#f5eedf;padding:0.7rem 2rem;text-decoration:none;font-family:sans-serif;font-size:0.82rem;letter-spacing:0.06em;text-transform:uppercase;border-radius:1px;">
      ✓ &nbsp;Approve this memory
    </a>
    <p style="margin-top:2rem;font-size:0.72rem;color:#999;font-family:sans-serif;">
      Do nothing to decline. This link expires in 30 days.
    </p>
  </div>
</body>
</html>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'RNK Memorial <memories@rashidnisarkhan.com>',
        to: [to],
        subject: `Memory from ${memory.name} — awaiting approval`,
        html,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', res.status, err);
    }
  } catch (err) {
    console.error('Email send failed:', err);
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
