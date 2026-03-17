/**
 * /api/approve?token=<uuid>
 *
 * GET — approves a pending memory identified by its token.
 *       Called from the link in the admin moderation email.
 *
 * Requires:
 *   KV binding: MEMORIES
 */

export async function onRequestGet({ request, env }) {
  const url   = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return htmlResponse('Invalid link', '<p>No approval token provided.</p>', 400);
  }

  const memory = await env.MEMORIES.get(`pending:${token}`, { type: 'json' });

  if (!memory) {
    return htmlResponse(
      'Already processed',
      '<p>This memory has already been approved, declined, or the link has expired.</p>',
      404
    );
  }

  // Approve: move from pending → approved
  memory.approved_at = Date.now();
  await env.MEMORIES.put(`approved:${memory.id}`, JSON.stringify(memory));
  await env.MEMORIES.delete(`pending:${token}`);

  return htmlResponse(
    'Memory approved',
    `<h1 style="color:#1c5c38;font-size:1.5rem;margin-bottom:1.5rem;">✓ Memory is now live</h1>
     <blockquote style="border-left:3px solid #1c5c38;padding:0.8rem 1.2rem;font-style:italic;color:#2e4535;margin:0 0 1.2rem;font-size:0.95rem;line-height:1.75;">
       "${escapeHtml(memory.text)}"
     </blockquote>
     <p style="color:#5c6e62;font-size:0.85rem;">— ${escapeHtml(memory.name)}${memory.relationship ? `, ${escapeHtml(memory.relationship)}` : ''}</p>
     <a href="https://rashidnisarkhan.com/#memories"
        style="display:inline-block;margin-top:2rem;color:#1c5c38;font-size:0.85rem;font-family:sans-serif;">
       ← View on memorial
     </a>`
  );
}

function htmlResponse(title, body, status = 200) {
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)} — Rashid Nisar Khan</title>
</head>
<body style="margin:0;padding:0;background:#f0e9d8;font-family:Georgia,serif;">
  <div style="max-width:540px;margin:4rem auto;padding:2rem;background:#f5eedf;border:1px solid rgba(28,92,56,0.14);">
    ${body}
  </div>
</body>
</html>`,
    { status, headers: { 'Content-Type': 'text/html;charset=UTF-8' } }
  );
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
