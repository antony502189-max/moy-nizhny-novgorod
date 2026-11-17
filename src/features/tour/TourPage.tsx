import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../../core/i18n';
import { Icon } from '../../core/Icon';
import { LeafMap, type MapMarker } from '../../core/Map';
import { PageTitle, Section } from '../../core/ui';
import { EffortDots } from '../../core/PlaceCard';
import { useLocal } from '../../core/store';
import { CENTER, fmtDist } from '../../core/geo';
import { sunDay } from '../../core/sun';
import { fmtTime, getNow } from '../../core/time';
import { PLACES, placeById, placePhoto } from '../../data/places';
import { parseIntent, planOffline, sanitizeLLM, tourMetrics, type Tour } from './planner';

const API = (import.meta.env.VITE_TOUR_API as string | undefined) || './api/tour';
const SPEECH_LANG = { ru: 'ru-RU', en: 'en-US', zh: 'zh-CN' } as const;

async function askLLM(prompt: string, lang: string): Promise<Tour | null> {
  const catalog = PLACES.map((p) => ({ id: p.id, name: p.name.en, tags: p.tags.join(','), minutes: p.minutes, effort: p.effort, sunset: !!p.sunset, lat: p.lat, lon: p.lon }));
  const ctl = new AbortController();
  const to = setTimeout(() => ctl.abort(), 25000);
  try {
    const r = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt, lang, catalog }), signal: ctl.signal });
    if (!r.ok) return null;
    const j = await r.json();
    const it = parseIntent(prompt);
    return sanitizeLLM(j, it.minutes, it.maxEffort);
  } catch { return null; } finally { clearTimeout(to); }
}

function parseShared(): Tour | null {
  const m = /[?&]ids=([\w,-]+)/.exec(window.location.hash);
  if (!m) return null;
  const stops = [...new Set(m[1].split(','))].map((id) => placeById(id)).filter(Boolean).map((p) => ({ id: p!.id, minutes: Math.min(p!.minutes, 30) }));
  return stops.length ? { source: 'shared', title: '', summary: '', stops } : null;
}

export function TourPage() {
  const { t, l, lang } = useI18n();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [tour, setTour] = useState<Tour | null>(parseShared);
  const [fell, setFell] = useState(false);
  const [err, setErr] = useState('');
  const [toast, setToast] = useState('');
  const [saved, setSaved] = useLocal<{ ts: number; text: string; ids: string[] }[]>('ng.tours', []);
  const [speaking, setSpeaking] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (toast) { const i = setTimeout(() => setToast(''), 2500); return () => clearTimeout(i); } }, [toast]);
  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);

  const build = async (q = text) => {
    if (!q.trim()) { setErr(t('tour.err.empty')); return; }
    setErr(''); setBusy(true); setFell(false);
    const llm = await askLLM(q, lang);
    if (llm) setTour(llm); else { setTour(planOffline(q, lang, l)); setFell(true); }
    setBusy(false);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const m = tour ? tourMetrics(tour.stops) : null;
  const sun = useMemo(() => sunDay(getNow(), CENTER.lat, CENTER.lon), []);
  const markers = useMemo<MapMarker[]>(() => (tour?.stops ?? []).map((s, i) => { const p = placeById(s.id)!; return { id: s.id, lat: p.lat, lon: p.lon, cls: 'pin pin--num', glyph: String(i + 1), size: 30, title: l(p.name) }; }), [tour, l]);
  const line = useMemo(() => (tour ? [{ id: 'r', points: tour.stops.map((s) => { const p = placeById(s.id)!; return [p.lat, p.lon] as [number, number]; }), dashed: true }] : []), [tour]);

  const speak = (id: string, txt: string) => {
    const ss = window.speechSynthesis;
    if (!ss) return;
    ss.cancel();
    if (speaking === id) { setSpeaking(''); return; }
    const u = new SpeechSynthesisUtterance(txt); u.lang = SPEECH_LANG[lang];
    u.onend = () => setSpeaking(''); u.onerror = () => setSpeaking('');
    setSpeaking(id); ss.speak(u);
  };
  const shareUrl = () => `${location.origin}${location.pathname}#/tour?ids=${tour!.stops.map((s) => s.id).join(',')}`;
  const yandex = () => 'https://yandex.ru/maps/?rtt=pd&rtext=' + tour!.stops.map((s) => { const p = placeById(s.id)!; return `${p.lat},${p.lon}`; }).join('~');
  const startBy = tour?.wantsSunset && sun.sunset && m ? new Date(sun.sunset.getTime() - m.total * 60000) : null;

  return (
    <div className="page">
      <PageTitle title={t('tour.title')} sub={t('tour.sub')} />
      <div className="field">
        <textarea value={text} placeholder={t('tour.ph')} maxLength={400} onChange={(e) => setText(e.target.value)} aria-label={t('tour.title')} />
        <div className="chips">
          <span className="muted small" style={{ alignSelf: 'center' }}>{t('tour.ex')}:</span>
          {[1, 2, 3, 4].map((n) => <button key={n} className="chip" disabled={busy} onClick={() => { setText(t('tour.ex' + n)); build(t('tour.ex' + n)); }}>{t('tour.ex' + n)}</button>)}
        </div>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn" onClick={() => build()} disabled={busy}><Icon name="sparkle" size={18} />{busy ? t('tour.building') : t('tour.build')}</button>
        {busy && <span className="dots" aria-hidden="true"><i /><i /><i /></span>}
      </div>

      {tour && m && (
        <div ref={resultRef} className="page" style={{ padding: 0 }}>
          <div className="hero">
            <span className={`badge ${tour.source === 'llm' ? 'badge--live' : 'badge--soon'}`} style={{ alignSelf: 'flex-start' }}>{t('tour.src.' + tour.source)}</span>
            {tour.title && <h2>{tour.title}</h2>}
            {tour.summary && <p className="muted">{tour.summary}</p>}
            {tour.source === 'llm' && <p className="muted small">{t('tour.ai.note')}</p>}
            <p><b>{t('tour.total')}: {m.total} {t('tour.min')}</b> · {t('tour.stops')}: {tour.stops.length} · {m.walk} {t('tour.min')} {t('tour.walk')} · {fmtDist(m.km * 1000, lang)}</p>
            {startBy && sun.sunset && <p className="muted">{t('tour.start_by', { t: fmtTime(startBy, lang), s: fmtTime(sun.sunset, lang) })}</p>}
          </div>
          {fell && <div className="banner"><Icon name="info" size={18} /><span>{t('tour.fallback')}</span></div>}
          <LeafMap markers={markers} lines={line} fit zoom={14} />
          <p className="muted small">{t('tour.straight')}</p>
          <div className="tour-steps">
            {tour.stops.map((s, i) => {
              const p = placeById(s.id)!;
              const ph = placePhoto(p);
              const voiceId = 'v-' + s.id;
              return (
                <div className="step" key={s.id}>
                  <div className="step__n">{i + 1}</div>
                  <div className="step__body">
                    <div className="sec__head"><b>{l(p.name)}</b><span className="muted small">{s.minutes} {t('tour.min')}</span></div>
                    {ph && <img src={ph} alt="" loading="lazy" style={{ width: '100%', maxHeight: 150, objectFit: 'cover', borderRadius: 10 }} />}
                    <p>{s.note || l(p.blurb)}</p>
                    <div className="tags"><EffortDots level={p.effort} /><span className="muted small">{t(`effort.${p.effort}`)}</span></div>
                    <div className="chips">
                      {p.site ? <a className="btn btn--ghost btn--sm" href={p.site} target="_blank" rel="noreferrer"><Icon name="link" size={16} />{t('tour.site')}</a> : <span className="badge badge--soon">{t('tour.ticket.verify')}</span>}
                      {'speechSynthesis' in window && <button className="btn btn--ghost btn--sm" onClick={() => speak(voiceId, l(p.name) + '. ' + l(p.blurb))}><Icon name="volume" size={16} />{speaking === voiceId ? t('tour.stop') : t('tour.listen')}</button>}
                    </div>
                    {speaking === voiceId && <span className="credit">{t('tour.voice.official')}</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="chips">
            <button className="btn btn--ghost" onClick={() => { navigator.clipboard?.writeText(shareUrl()); setToast(t('tour.copied')); }}><Icon name="share" size={18} />{t('tour.share')}</button>
            <a className="btn btn--ghost" href={yandex()} target="_blank" rel="noreferrer"><Icon name="route" size={18} />{t('tour.open_ya')}</a>
            <button className="btn btn--ghost" onClick={() => { setSaved((s) => [{ ts: Date.now(), text: text || tour.title, ids: tour.stops.map((x) => x.id) }, ...s].slice(0, 10)); setToast(t('tour.saved')); }}><Icon name="heart" size={18} />{t('tour.save')}</button>
          </div>
        </div>
      )}

      {Array.isArray(saved) && saved.length > 0 && (
        <Section title={t('tour.mine')} icon="heart">
          <div className="list">{saved.map((s) => (
            <button key={s.ts} className="row row--btn" onClick={() => setTour({ source: 'shared', title: s.text, summary: '', stops: s.ids.filter((id) => placeById(id)).map((id) => ({ id, minutes: Math.min(placeById(id)?.minutes ?? 20, 30) })) })}>
              <div className="row__main"><b>{s.text || s.ids.length + ' ' + t('tour.stops')}</b><span>{s.ids.filter((id) => placeById(id)).map((id) => l(placeById(id)!.name)).join(' → ')}</span></div><span className="muted small">{t('tour.open')}</span>
            </button>))}</div>
        </Section>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
