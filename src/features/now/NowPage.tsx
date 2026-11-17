import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../../core/i18n';
import { Icon, svgInner } from '../../core/Icon';
import { LeafMap, type MapMarker } from '../../core/Map';
import { PageTitle, Section, Chip } from '../../core/ui';
import { PlaceSheet } from '../../core/PlaceCard';
import { CENTER, distanceM, fmtDist, type LatLon } from '../../core/geo';
import { sunDay, compass } from '../../core/sun';
import { fmtTime, getNow, TZ } from '../../core/time';
import { go } from '../../core/router';
import { PLACES, placeById, placePhoto, type Place } from '../../data/places';
import { edition, upcomingEvents, type CityEvent } from '../../data/events';
import amenityData from '../../data/amenities.json';

interface Amenity { id: string; kind: 'toilet' | 'water' | 'steps' | 'stepfree'; lat: number; lon: number; name?: string; fee?: string; opening?: string }
const AMEN = (amenityData as { items: Amenity[] }).items;

export function fmtDur(min: number, lang: string): string {
  const tot = Math.round(min), h = Math.floor(tot / 60), m = tot % 60;
  if (lang === 'en') return h ? `${h} h ${m} min` : `${m} min`;
  if (lang === 'zh') return h ? `${h}小时${m}分钟` : `${m}分钟`;
  return h ? `${h} ч ${m} мин` : `${m} мин`;
}

type Layer = 'events' | 'sunset' | 'wc' | 'water' | 'access' | 'steps';
type Sel = { type: 'place'; place: Place; event?: CityEvent } | { type: 'amen'; a: Amenity } | null;

export function NowPage() {
  const { t, l, lang } = useI18n();
  const [now, setNow] = useState(getNow());
  useEffect(() => { const i = setInterval(() => setNow(getNow()), 30000); return () => clearInterval(i); }, []);
  const [ref, setRef] = useState<LatLon & { me: boolean }>({ ...CENTER, me: false });
  const [toast, setToast] = useState('');
  const [layers, setLayers] = useState<Set<Layer>>(new Set(['events', 'sunset', 'wc', 'water']));
  const [sel, setSel] = useState<Sel>(null);

  const upcoming = useMemo(() => upcomingEvents(now), [now]);

  const sun = useMemo(() => {
    let d = sunDay(now, CENTER.lat, CENTER.lon), tomorrow = false;
    if (d.sunset && d.sunset.getTime() < now.getTime()) { d = sunDay(new Date(now.getTime() + 86400000), CENTER.lat, CENTER.lon); tomorrow = true; }
    return { ...d, tomorrow };
  }, [now]);

  const viewpoints = useMemo(() => PLACES.filter((p) => p.sunset).sort((a, b) => distanceM(ref, a) - distanceM(ref, b)).slice(0, 5), [ref]);
  const nearest = (kind: Amenity['kind']) => AMEN.filter((a) => a.kind === kind).map((a) => ({ a, d: distanceM(ref, a) })).sort((x, y) => x.d - y.d)[0];
  const nWc = nearest('toilet'), nWater = nearest('water');

  const locate = () => {
    if (!navigator.geolocation) { setToast(t('now.geo.fail')); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const me = { lat: p.coords.latitude, lon: p.coords.longitude };
        if (distanceM(me, CENTER) > 40000) { setToast(t('now.geo.far')); return; }
        setRef({ ...me, me: true });
      },
      () => setToast(t('now.geo.fail')), { timeout: 8000 });
  };
  useEffect(() => { if (toast) { const i = setTimeout(() => setToast(''), 3500); return () => clearTimeout(i); } }, [toast]);

  const markers = useMemo<MapMarker[]>(() => {
    const out: MapMarker[] = [];
    if (layers.has('events')) {
      for (const e of upcoming.list) {
        const p = placeById(e.placeId); if (!p) continue;
        out.push({ id: 'ev-' + e.id, lat: p.lat, lon: p.lon, cls: 'pin pin--ev', glyph: svgInner('clock', 16), size: 30, title: l(e.title), onClick: () => setSel({ type: 'place', place: p, event: e }) });
      }
    }
    if (layers.has('sunset')) for (const p of viewpoints) out.push({ id: 'sun-' + p.id, lat: p.lat, lon: p.lon, cls: 'pin pin--sun', glyph: svgInner('sunset', 16), title: l(p.name), onClick: () => setSel({ type: 'place', place: p }) });
    const add = (kind: Amenity['kind'], cls: string, icon: string, size: number) => AMEN.filter((a) => a.kind === kind).forEach((a) => out.push({ id: a.id, lat: a.lat, lon: a.lon, cls, glyph: svgInner(icon, size - 12), size, title: a.name, onClick: () => setSel({ type: 'amen', a }) }));
    if (layers.has('wc')) add('toilet', 'pin pin--wc', 'wc', 26);
    if (layers.has('water')) add('water', 'pin pin--water', 'drop', 26);
    if (layers.has('access')) add('stepfree', 'pin pin--access', 'access', 26);
    if (layers.has('steps')) AMEN.filter((a) => a.kind === 'steps').forEach((a) => out.push({ id: a.id, lat: a.lat, lon: a.lon, cls: 'pin pin--step', size: 10, onClick: () => setSel({ type: 'amen', a }) }));
    if (ref.me) out.push({ id: 'me', lat: ref.lat, lon: ref.lon, cls: 'pin pin--bad', size: 16 });
    return out;
  }, [layers, upcoming, viewpoints, ref, l, t]);

  const toggle = (k: Layer) => setLayers((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const sunLeft = sun.sunset && !sun.tomorrow ? Math.round((sun.sunset.getTime() - now.getTime()) / 60000) : null;
  const amenName = (a: Amenity) => a.name || (a.kind === 'toilet' ? t('now.wc') : a.kind === 'water' ? t('now.water') : a.kind === 'steps' ? t('now.steps') : t('now.access'));
  const refLabel = ref.me ? t('now.from_me') : t('now.from_center');

  return (
    <div className="page">
      <PageTitle title={t('now.title')} sub={t('now.sub')} />
      <a className="guide-cover" href="#/guide"><img src={import.meta.env.BASE_URL+'places/kremlin.jpg'} alt={l(placeById('kremlin')?.name)}/>
        <span>{t('guide.title')} <Icon name="arrow" size={21}/></span></a>

      <a className="row row--btn" href="./resident.html#/home"><Icon name="pin" size={22}/><div className="row__main"><b>{t('more.resident')}</b></div><Icon name="chev" size={18}/></a>
      <button className="row row--btn" onClick={() => go('/twin')}>
        <Icon name="globe" size={22} /><div className="row__main"><b>{t('now.twin.q')}</b><span>{t('now.twin.go')}</span></div><Icon name="chev" size={18} />
      </button>

      <Section title={t(upcoming.soon ? 'now.events' : 'now.next')} icon="clock">
        {!upcoming.list.length && <p role="status">{t('now.noProgramme')}</p>}
        <div className="list">
          {upcoming.list.map(e => <a className="row row--btn" key={e.id} href={e.source} target="_blank" rel="noreferrer">
            <div className="row__time">{fmtTime(new Date(e.start),lang)}</div>
            <div className="row__main"><b>{l(e.title)}</b><span>{new Date(e.start).toLocaleDateString(lang, {day:'numeric',month:'long',timeZone:TZ})} · {l(placeById(e.placeId)?.name)}</span></div>
            <Icon name="link" size={16}/>
          </a>)}
        </div>
        <p className="muted small">{t('now.edition', {date:edition})} <a href="https://arsenal-museum.art/events-all/" target="_blank" rel="noreferrer">{t('common.official')} ↗</a></p>
      </Section>

      <Section title={sun.tomorrow ? t('now.sunset.tomorrow') : t('now.sunset')} icon="sunset">
        <div className="hero">
          <div className="sunbox">
            <div className="kv"><div className="big">{sun.sunset ? fmtTime(sun.sunset, lang) : '—'}</div><small>{sunLeft !== null ? (sunLeft > 0 ? t('now.sunset.left', { m: fmtDur(sunLeft, lang) }) : t('now.sunset.done')) : ''}</small></div>
            {sun.goldenStart && <div className="kv"><b>{fmtTime(sun.goldenStart, lang)}</b><small>{t('now.golden')}</small></div>}
            {sun.sunsetAzimuth !== null && <div className="kv"><b>{compass(sun.sunsetAzimuth, lang)} · {Math.round(sun.sunsetAzimuth)}°</b><small>{t('now.dir')}</small></div>}
          </div>
          <p className="muted small">{t('now.sunset.calc')}</p>
        </div>
        <h3>{t('now.viewpoints')}</h3>
        <p className="muted small">{t('now.viewpoints.note')}</p>
        <div className="list">
          {viewpoints.map((p) => (
            <button key={p.id} className="row row--btn" onClick={() => setSel({ type: 'place', place: p })}>
              {placePhoto(p) ? <img className="thumb" src={placePhoto(p)} alt="" loading="lazy" /> : <span className="thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f08a24' }}><Icon name="sunset" size={26} /></span>}
              <div className="row__main"><b>{l(p.name)}</b><span>{l(p.sunset)}</span></div>
              <span className="muted small">{fmtDist(distanceM(ref, p), lang)}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title={t('now.nearest')} icon="pin" right={<button className="btn btn--ghost btn--sm" onClick={locate}><Icon name="pin" size={16} />{t('now.near_me')}</button>}>
        <div className="stats">
          {[{ k: 'wc', n: nWc, i: 'wc', lab: t('now.wc') }, { k: 'water', n: nWater, i: 'drop', lab: t('now.water') }].map(({ k, n, i, lab }) => n && (
            <button key={k} className="stat row--btn" style={{ border: 0, textAlign: 'left' }} onClick={() => { setSel({ type: 'amen', a: n.a }); setLayers((s) => new Set(s).add(k as Layer)); }}>
              <Icon name={i} size={22} /><b>{fmtDist(n.d, lang)}</b><span className="muted small">{lab} · {refLabel}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title={t('now.map')} icon="layers">
        <div className="chips">
          {(['events', 'sunset', 'wc', 'water', 'access', 'steps'] as Layer[]).map((k) => <Chip key={k} active={layers.has(k)} onClick={() => toggle(k)}>{t('now.layer.' + k)}</Chip>)}
        </div>
        <LeafMap markers={markers} zoom={14} className="leafmap--tall" selectedId={sel?.type === 'amen' ? sel.a.id : undefined} />
        <p className="muted small">{layers.has('access') || layers.has('steps') ? t('now.stepfree.hint') + ' ' : ''}{t('now.osm')}</p>
        {sel?.type === 'place' && <PlaceSheet place={sel.place} onClose={() => setSel(null)} extra={sel.event ? <a href={sel.event.source} target="_blank" rel="noreferrer">{l(sel.event.title)} ↗</a> : undefined} />}
        {sel?.type === 'amen' && (
          <div className="sheet">
            <div className="sec__head"><h3>{amenName(sel.a)}</h3><button className="chip" onClick={() => setSel(null)} aria-label={t('common.close')}><Icon name="close" size={16} /></button></div>
            <p className="muted">{fmtDist(distanceM(ref, sel.a), lang)} · {refLabel}</p>
            {sel.a.fee && <p>{sel.a.fee === 'yes' ? t('now.fee.yes') : sel.a.fee === 'no' ? t('now.fee.no') : sel.a.fee}</p>}
            {sel.a.opening && <p className="muted small">{sel.a.opening}</p>}
            <p className="credit">{t('now.osm')} © OpenStreetMap contributors</p>
          </div>
        )}
      </Section>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
