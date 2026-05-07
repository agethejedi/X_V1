export async function onRequestGet() {
  return new Response(JSON.stringify({ ok: true, service: 'jarvis-morning-briefing' }), { headers: { 'content-type': 'application/json' } });
}
