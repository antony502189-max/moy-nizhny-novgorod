/**
 * Thin serverless proxy for the AI tour builder (Vercel Node function; also served in `npm run dev` by vite.config.ts).
 * The API key lives ONLY in server env vars — it never reaches the browser.
 *
 * Env:
 *   ANTHROPIC_API_KEY   -> uses the Anthropic Messages API (default provider)
 *   TOUR_MODEL          -> optional model id (default claude-haiku-5-5)
 *   LLM_BASE_URL + LLM_API_KEY (+ TOUR_MODEL) -> any OpenAI-compatible chat/completions endpoint instead
 * No key => responds 200 {error:"no_key"} and the client falls back to its deterministic offline planner.
 */
interface Req { method?: string; body?: any; headers?: Record<string, string | string[] | undefined> }
interface Res { status(c: number): Res; setHeader(k: string, v: string): Res; json(o: unknown): void }

const MAX_PROMPT = 400;
const MAX_CATALOG = 60;

function systemPrompt(lang: string) {
  const L = lang === 'en' ? 'English' : lang === 'zh' ? 'Simplified Chinese' : 'Russian';
  return [
    'You are the tour planner of the guest app "Nizhny for Guests" for Nizhny Novgorod, Russia.',
    'Build ONE walking tour using ONLY places from the provided catalog (use their exact ids). Never invent places, prices, opening hours, tickets or facts.',
    'Respect the guest\'s time budget and constraints (e.g. avoid effort=2 places when the guest wants no big climbs; effort 0=flat, 1=some slope/stairs, 2=many steps).',
    'Order stops so that the walk is geographically sensible (use the lat/lon). If the guest wants a sunset, put the best sunset viewpoint (sunset=1) LAST.',
    `Write title, summary and notes in ${L}. Notes: one short sentence per stop on why it fits. Do not mention prices or ticket facts.`,
    'Reply with JSON only, no markdown: {"title":string,"summary":string,"stops":[{"id":string,"minutes":number,"note":string}]}. 2 to 7 stops.',
  ].join('\n');
}

async function callLLM(system: string, user: string): Promise<string> {
  const model = process.env.TOUR_MODEL || 'claude-haiku-5-5';
  if (process.env.LLM_BASE_URL && process.env.LLM_API_KEY) {
    const r = await fetch(process.env.LLM_BASE_URL.replace(/\/$/, '') + '/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + process.env.LLM_API_KEY },
      body: JSON.stringify({ model, max_tokens: 900, temperature: 0.3, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
    });
    if (!r.ok) throw new Error('llm_http_' + r.status);
    const j: any = await r.json();
    return j.choices?.[0]?.message?.content ?? '';
  }
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model, max_tokens: 900, system, messages: [{ role: 'user', content: user }] }),
  });
  if (!r.ok) throw new Error('llm_http_' + r.status);
  const j: any = await r.json();
  return (j.content ?? []).map((c: any) => c.text ?? '').join('');
}

export default async function handler(req: Req, res: Res) {
  res.setHeader('cache-control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const hasKey = !!(process.env.ANTHROPIC_API_KEY || (process.env.LLM_BASE_URL && process.env.LLM_API_KEY));
  if (!hasKey) return res.status(200).json({ source: 'none', error: 'no_key' }); // 200 on purpose: keeps the browser console clean, the client falls back offline

  // Same-site check: browsers always send Origin on cross-origin POST. Set ALLOWED_ORIGINS (comma list) to allow other hosts.
  const origin = String(req.headers?.origin ?? '');
  const host = String(req.headers?.host ?? '');
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map((x) => x.trim()).filter(Boolean);
  if (origin && !origin.endsWith('//' + host) && !allowed.includes(origin) && !/^https?:\/\/(localhost|127\.0\.0\.1)/.test(origin)) return res.status(403).json({ error: 'origin' });
  if (JSON.stringify(req.body ?? {}).length > 12000) return res.status(413).json({ error: 'too_large' });
  const body = req.body ?? {};
  const prompt = String(body.prompt ?? '').replaceAll('"""', "'").slice(0, MAX_PROMPT).trim();
  const lang = ['ru', 'en', 'zh'].includes(body.lang) ? body.lang : 'ru';
  const catalog = Array.isArray(body.catalog) ? body.catalog.slice(0, MAX_CATALOG).filter((c: any) => c && typeof c === 'object') : [];
  if (!prompt || catalog.length < 3) return res.status(400).json({ error: 'bad_request' });

  const lines = catalog.map((c: any) =>
    [String(c.id).slice(0, 40), String(c.name).slice(0, 80), 'tags=' + String(c.tags).slice(0, 80), 'min=' + Number(c.minutes), 'effort=' + Number(c.effort), 'sunset=' + (c.sunset ? 1 : 0), `ll=${Number(c.lat).toFixed(4)},${Number(c.lon).toFixed(4)}`].join(' | '));
  const user = `Guest request: """${prompt}"""\n\nCatalog (id | name | tags | typical visit minutes | effort | sunset viewpoint | lat,lon):\n${lines.join('\n')}`;

  try {
    const text = await callLLM(systemPrompt(lang), user);
    const a = text.indexOf('{'), b = text.lastIndexOf('}');
    if (a < 0 || b < a) return res.status(502).json({ error: 'bad_llm_output' });
    const parsed = JSON.parse(text.slice(a, b + 1));
    return res.status(200).json({ source: 'llm', ...parsed });
  } catch (e) {
    return res.status(502).json({ error: 'llm_failed' });
  }
}
