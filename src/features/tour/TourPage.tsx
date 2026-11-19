import { VoiceInput } from './VoiceInput';
import { Walking } from './Walking';
import { Narration } from '../../core/Narration';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../../core/i18n';
import { Icon } from '../../core/Icon';
import { LeafMap, type MapMarker } from '../../core/Map';
import { go } from '../../core/router';
import { PageTitle, Section } from '../../core/ui';
import { EffortDots } from '../../core/PlaceCard';
import { useLocal } from '../../core/store';
import { CENTER, fmtDist } from '../../core/geo';
import { sunDay } from '../../core/sun';
import { fmtTime, getNow } from '../../core/time';
import { PLACES, placeById, placePhoto, photoCredits } from '../../data/places';
import { walkLine } from './paths';
import { readRatings } from '../../core/ratings';
import { parseIntent, planOffline, sanitizeLLM, tourMetrics, type Tour } from './planner';

const API = import.meta.env.VITE_TOUR_API as string | undefined;
const interests = ['history','art','architecture','food','souvenir','sunset','water','family'];
const tickets: Record<string,string> = {art:'https://tickets-nn.pushkinmuseum.art/',kremlin:'https://kremlnn.ru/faq',cable:'https://nnkd.ru/',wheel:'https://kolesonino.ru/'};

async function askLLM(prompt: string, lang: string): Promise<Tour | null> {
  if (!API) return null;
  const catalog = PLACES.map((p) => ({ id: p.id, name: p.name.en, tags: p.tags.join(','), minutes: p.minutes, effort: p.effort, sunset: !!p.sunset, lat: p.lat, lon: p.lon }));
  const ctl = new AbortController();
  const to = setTimeout(() => ctl.abort(), 25000);
  try {
    const r = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt, lang, catalog }), signal: ctl.signal });
    if (!r.ok) return null;
    const j = await r.json();
    const it = parseIntent(prompt);
    const route=sanitizeLLM(j, it.minutes, it.maxEffort);
    if(route && it.sunset && !placeById(route.stops.at(-1)!.id)?.sunset)return null;
    return route?{...route,wantsSunset:it.sunset}:null;
  } catch { return null; } finally { clearTimeout(to); }
}

function parseShared(): Tour | null {
  const m = /[?&]ids=([\w,-]+)/.exec(window.location.hash);
  if (!m) {
    try {
      const saved=JSON.parse(sessionStorage.getItem('ng.activeTour')||'null') as Tour|null;
      return saved && ['offline','shared','llm'].includes(saved.source) && Array.isArray(saved.stops) && saved.stops.length && saved.stops.every(s=>s && placeById(s.id) && Number.isFinite(s.minutes)) ? saved : null;
    } catch {return null}
  }
  const stops = [...new Set(m[1].split(','))].map((id) => placeById(id)).filter(Boolean).map((p) => ({ id: p!.id, minutes: Math.min(p!.minutes, 30) }));
  const profile = new URLSearchParams(location.hash.split('?')[1]).get('profile') === 'noSteps' ? 'noSteps' : 'walk';
  return stops.length ? { profile, source: 'shared', title: '', summary: '', stops } : null;
}

export function TourPage() {
  const { t, l, lang } = useI18n();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [tour, setTour] = useState<Tour | null>(parseShared);
  const [useAI, setUseAI] = useState(false);
  const [useRatings, setUseRatings] = useState(false);
  const [fell, setFell] = useState(false);
  const [err, setErr] = useState('');
  const [toast, setToast] = useState('');
  const [stored, setSaved] = useLocal<{ ts: number; text: string; ids: string[]; tour?: Tour }[]>('ng.tours', []);
  const saved = Array.isArray(stored) ? stored.filter(s => s && typeof s.text === 'string' && Array.isArray(s.ids) && s.ids.some(id => placeById(id))) : [];
  const [categories,setCategories]=useState<string[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (toast) { const i = setTimeout(() => setToast(''), 2500); return () => clearTimeout(i); } }, [toast]);
  useEffect(() => {
    const change = () => { const shared = parseShared(); if (shared) setTour(shared); };
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  useEffect(()=>{if(tour)try{sessionStorage.setItem('ng.activeTour',JSON.stringify(tour))}catch{/* Storage is optional. */}},[tour]);

  const build = async (input = text) => {
    const q=[...categories.map(c=>t('tag.'+c)),input].join(' ').trim().slice(0,400);
    if (!q.trim()) { setErr(t('tour.err.empty')); return; }
    setErr(''); setBusy(true); setFell(false);
    const llm = useAI && API ? await askLLM(q, lang) : null;
    if (llm) setTour(llm); else { setTour(planOffline(q, lang, l, useRatings ? readRatings() : {})); setFell(useAI); }
    setBusy(false);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const m = tour ? tourMetrics(tour.stops, tour.profile) : null;
  const sunset = useMemo(() => {
    const now = getNow();
    const today = sunDay(now, CENTER.lat, CENTER.lon).sunset;
    if (today && m && today.getTime() - m.total*60000 >= now.getTime()) return {time:today,tomorrow:false};
    return {time:sunDay(new Date(now.getTime()+86400000),CENTER.lat,CENTER.lon).sunset,tomorrow:true};
  }, [m?.total, tour]);
  const markers = useMemo<MapMarker[]>(() => (tour?.stops ?? []).map((stop, i) => {
    const p = placeById(stop.id)!;
    return { id: p.id, lat: p.lat, lon: p.lon, cls: 'pin pin--num', glyph: String(i + 1),
      size: 30, title: l(p.name), onClick: () => go('/history/landmark/' + p.id) };
  }), [tour, l]);
  const line = useMemo(() => tour?.stops.slice(1).map((s,i) => ({
    id: 'leg-'+i, points: walkLine(tour.stops[i].id, s.id, tour.profile || 'walk'),
  })).filter(leg => leg.points.length > 1) || [], [tour]);

  const shareUrl = () => `${location.origin}${location.pathname}#/tour?ids=${tour!.stops.map((s) => s.id).join(',')}&profile=${tour!.profile || 'walk'}`;
  const yandex = () => 'https://yandex.ru/maps/?rtt=pd&rtext=' + tour!.stops.map((s) => { const p = placeById(s.id)!; return `${p.lat},${p.lon}`; }).join('~');
  const startBy = tour?.wantsSunset && sunset.time && m && Number.isFinite(m.total) ? new Date(sunset.time.getTime() - m.total * 60000) : null;

  return (
    <div className="page">
      <PageTitle title={t('tour.title')} sub={t('tour.sub')} />
      <div className="field">
        <fieldset className="tour-interests"><legend>{t('walk.categories')}</legend><div className="chips">{interests.map(c=><button key={c} className="chip" aria-pressed={categories.includes(c)} onClick={()=>setCategories(old=>old.includes(c)?old.filter(x=>x!==c):[...old,c])}>{t('tag.'+c)}</button>)}</div></fieldset>
        <textarea value={text} placeholder={t('tour.ph')} maxLength={400} onChange={(e) => setText(e.target.value)} aria-label={t('tour.title')} />
        <VoiceInput onText={setText}/>
        <details className="request-examples"><summary>{t('tour.ex')}</summary><div>
          {[1, 2, 3, 4].map((n) => <button key={n} className="chip" disabled={busy} onClick={() => { setText(t('tour.ex' + n)); build(t('tour.ex' + n)); }}>{t('tour.ex' + n)}</button>)}
        </div></details>
        <label className="tour-option"><input type="checkbox" checked={useRatings} onChange={e=>setUseRatings(e.target.checked)}/><span>{t('tour.ratings')}</span></label>
        {API && <label className="tour-option"><input type="checkbox" checked={useAI} onChange={e=>setUseAI(e.target.checked)}/><span>{t('tour.online')}</span></label>}
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn" onClick={() => build()} disabled={busy}><Icon name="route" size={18} />{busy ? t('tour.building') : t('tour.build')}</button>
        {busy && <span className="dots" aria-hidden="true"><i /><i /><i /></span>}
      </div>

      {tour && m && (
        <div ref={resultRef} className="page" style={{ padding: 0 }}>
          <div className="hero">
            {tour.title && <h2>{tour.title}</h2>}
            <small className="tour-source" data-source={tour.source}>{t('tour.src.' + tour.source)}</small>
            {tour.summary && <p>{tour.summary}</p>}
            {tour.source === 'llm' && <p className="muted small">{t('tour.ai.note')}</p>}
            {Number.isFinite(m.total) ? <p><b>{t('tour.total')}: {m.total} {t('tour.min')}</b> · {t('tour.stops')}: {tour.stops.length} · {m.walk} {t('tour.min')} {t('tour.walk')} · {fmtDist(m.km * 1000, lang)}</p> : <p>{t('tour.missing')}</p>}
            {startBy && sunset.time && <p className="muted">{t('tour.start_by', { t: (sunset.tomorrow ? t('now.tomorrow')+' ' : '')+fmtTime(startBy, lang), s: fmtTime(sunset.time, lang) })}</p>}
          </div>
          {fell && <div className="banner"><Icon name="info" size={18} /><span>{t('tour.fallback')}</span></div>}
          {/сияни|aurora|极光/i.test(text) && <p className="banner">{t('walk.aurora')}</p>}
          <Walking key={(tour.profile||'walk')+tour.stops.map(s=>s.id).join(',')} tour={tour}/>
          <LeafMap markers={markers} lines={line} fit zoom={14} />
          <p className="muted small">{t('tour.paths')}</p>
          <div className="tour-steps">
            {tour.stops.map((s, i) => {
              const p = placeById(s.id)!;
              const ph = placePhoto(p);
              const credit = p.photo && photoCredits[p.photo];
              return (
                <div className="step" key={s.id}>
                  <div className="step__n">{i + 1}</div>
                  <div className="step__body">
                    <div className="sec__head"><b>{l(p.name)}</b><span className="muted small">{s.minutes} {t('tour.min')}</span></div>
                    {ph && <img src={ph} alt="" loading="lazy" style={{ width: '100%', maxHeight: 150, objectFit: 'cover', borderRadius: 0 }} />}
                    {ph && credit && <small className="credit">{credit.author} · <a href={credit.sourceUrl} target="_blank" rel="noreferrer">{credit.license}</a></small>}
                    <p>{s.note || l(p.blurb)}</p>
                    <div className="tags"><EffortDots level={p.effort} /><span className="muted small">{t(`effort.${p.effort}`)}</span></div>
                    <div className="chips">
                      {p.site ? <a className="btn btn--ghost btn--sm" href={p.site} target="_blank" rel="noreferrer"><Icon name="link" size={16} />{t('tour.site')}</a> : <span className="badge badge--soon">{t('tour.ticket.verify')}</span>}
                      {tickets[p.id] && <a className="btn btn--ghost btn--sm" href={tickets[p.id]} target="_blank" rel="noreferrer">{t('walk.tickets')} ↗</a>}
                      <a className="chip" href={'#/guide/'+p.id}>{t('guide.stories')}</a>
                    </div>
                    <Narration id={p.id} lang={lang}/>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="chips">
            <button className="btn btn--ghost" onClick={async () => { try { await navigator.clipboard.writeText(shareUrl()); setToast(t('tour.copied')); } catch { window.prompt(t('tour.share'), shareUrl()); } }}><Icon name="share" size={18} />{t('tour.share')}</button>
            <a className="btn btn--ghost" href={yandex()} target="_blank" rel="noreferrer"><Icon name="route" size={18} />{t('tour.open_ya')}</a>
            <button className="btn btn--ghost" onClick={() => { const ok = setSaved([{ ts: Date.now(), text: text || tour.title, ids: tour.stops.map((x) => x.id), tour }, ...saved].slice(0, 10)); setToast(t(ok ? 'tour.saved' : 'common.storageError')); }}><Icon name="heart" size={18} />{t('tour.save')}</button>
          </div>
        </div>
      )}

      {Array.isArray(saved) && saved.length > 0 && (
        <Section title={t('tour.mine')} icon="heart">
          <div className="list">{saved.map((s) => (
            <button key={s.ts} className="row row--btn" onClick={() => setTour(s.tour?.stops?.every(p => p && placeById(p.id) && Number.isFinite(p.minutes)) ? s.tour : { source: 'shared', title: s.text, summary: '', stops: s.ids.filter((id) => placeById(id)).map((id) => ({ id, minutes: Math.min(placeById(id)?.minutes ?? 20, 30) })) })}>
              <div className="row__main"><b>{s.text || s.ids.length + ' ' + t('tour.stops')}</b><span>{s.ids.filter((id) => placeById(id)).map((id) => l(placeById(id)!.name)).join(' → ')}</span></div><span className="muted small">{t('tour.open')}</span>
            </button>))}</div>
        </Section>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
