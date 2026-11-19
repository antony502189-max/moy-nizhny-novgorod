import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../../core/i18n';
import { Icon, svgInner } from '../../core/Icon';
import { LeafMap, type MapMarker } from '../../core/Map';
import { PageTitle, Section, Chip } from '../../core/ui';
import { PlaceSheet } from '../../core/PlaceCard';
import { CENTER, distanceM, fmtDist, type LatLon } from '../../core/geo';
import { isOnCityMap } from '../../core/basemap';
import { sunDay, compass } from '../../core/sun';
import { fmtTime, getNow, TZ } from '../../core/time';
import { PLACES, placeById, placePhoto, type Place } from '../../data/places';
import { edition, upcomingEvents, type CityEvent } from '../../data/events';
import amenityData from '../../data/amenities.json';
import './now.css';

interface Amenity { id: string; kind: 'toilet' | 'water' | 'steps' | 'stepfree'; lat: number; lon: number; name?: string; fee?: string; opening?: string }
const AMEN = (amenityData as { items: Amenity[] }).items;

export function fmtDur(min: number, lang: string): string {
  const tot = Math.round(min), h = Math.floor(tot / 60), m = tot % 60;
  if (lang === 'en') return h ? `${h} h ${m} min` : `${m} min`;
  if (lang === 'zh') return h ? `${h}小时${m}分钟` : `${m}分钟`;
  return h ? `${h} ч ${m} мин` : `${m} мин`;
}

type Layer = 'events' | 'sunset' | 'wc' | 'water' | 'access' | 'steps';
type Sel = { type: 'place'; place: Place; event?: CityEvent } | { type: 'amen'; a: Amenity };
const LOCATION_MARKER = 'me';
const MAX_LOCATION_ACCURACY_M = 500;

export function NowPage() {
  const { t, l, lang } = useI18n();
  const [now, setNow] = useState(getNow());
  useEffect(() => { const i = setInterval(() => setNow(getNow()), 30000); return () => clearInterval(i); }, []);
  const [location, setLocation] = useState<LatLon | null>(null);
  const [geoStatus, setGeoStatus] = useState('');
  const [layers, setLayers] = useState<Set<Layer>>(new Set(['events', 'sunset', 'wc', 'water']));
  const [sel, setSel] = useState<Sel | null>(null);
  const [focusPoint, setFocusPoint] = useState<LatLon | null>(null);
  const mapAnchor = useRef<HTMLDivElement>(null);

  const upcoming = useMemo(() => upcomingEvents(now), [now]);

  const sun = useMemo(() => {
    let d = sunDay(now, CENTER.lat, CENTER.lon), tomorrow = false;
    if (d.sunset && d.sunset.getTime() < now.getTime()) { d = sunDay(new Date(now.getTime() + 86400000), CENTER.lat, CENTER.lon); tomorrow = true; }
    return { ...d, tomorrow };
  }, [now]);

  const viewpoints = useMemo(() => {
    const origin = location ?? CENTER;
    return PLACES.filter(p => p.sunset).sort((a, b) => distanceM(origin, a) - distanceM(origin, b)).slice(0, 5);
  }, [location]);
  const locating = geoStatus === 'now.geo.locating';
  const fromLocation = (meters: number) => t('now.distance', { d: fmtDist(meters, lang) });

  function revealMap({ lat, lon }: LatLon) {
    setFocusPoint({ lat, lon });
    mapAnchor.current?.scrollIntoView({ block: 'start' });
    mapAnchor.current?.focus({ preventScroll: true });
  }

  function selectViewpoint(place: Place) {
    setSel({ type: 'place', place });
    setLayers(active => active.has('sunset') ? active : new Set(active).add('sunset'));
    revealMap(place);
  }

  function locate() {
    setLocation(null);
    setSel(null);
    if (!navigator.geolocation) {
      setGeoStatus('now.geo.unavailable');
      return;
    }
    setGeoStatus('now.geo.locating');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const point = { lat: coords.latitude, lon: coords.longitude };
        if (!isOnCityMap(point)) {
          setGeoStatus('now.geo.far');
          return;
        }
        if (coords.accuracy > MAX_LOCATION_ACCURACY_M) {
          setGeoStatus('now.geo.inaccurate');
          return;
        }
        setLocation(point);
        setGeoStatus('now.geo.found');
        revealMap(point);
      },
      ({ code }) => setGeoStatus(code === 1 ? 'now.geo.denied' : code === 3 ? 'now.geo.timeout' : 'now.geo.fail'),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    );
  }

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
    if (location) out.push({ id: LOCATION_MARKER, ...location, cls: 'pin pin--me', size: 18, title: t('now.you'), popup: t('now.you') });
    return out;
  }, [layers, upcoming, viewpoints, location, l, t]);

  const toggle = (k: Layer) => setLayers((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const sunLeft = sun.sunset && !sun.tomorrow ? Math.round((sun.sunset.getTime() - now.getTime()) / 60000) : null;
  const amenName = (a: Amenity) => a.name || (a.kind === 'toilet' ? t('now.wc') : a.kind === 'water' ? t('now.water') : a.kind === 'steps' ? t('now.steps') : t('now.access'));
  const selectedId = sel?.type === 'place' ? (sel.event ? 'ev-' + sel.event.id : 'sun-' + sel.place.id)
    : sel?.type === 'amen' ? sel.a.id : location ? LOCATION_MARKER : undefined;
  const selectedName = sel?.type === 'place' ? l(sel.place.name)
    : sel?.type === 'amen' ? amenName(sel.a) : location ? t('now.you') : null;

  return (
    <div className="page now-page">
      <PageTitle title={t('now.title')} sub={t('now.sub')} />
      <a className="now-guide" href="#/guide">
        <img src={import.meta.env.BASE_URL + 'places/kremlin.jpg'} alt="" />
        <span className="now-guide__label">{t('guide.title')} <Icon name="arrow" size={22} /></span>
      </a>

      <div className="now-shortcuts">
        <a className="row row--btn now-shortcut" href="./resident.html#/home">
          <Icon name="pin" size={20} />
          <div className="row__main"><b>{t('now.resident')}</b><span>{t('now.resident.detail')}</span></div>
          <Icon name="chev" size={18} />
        </a>
        <a className="row row--btn now-shortcut" href="#/twin">
          <Icon name="globe" size={20} />
          <div className="row__main"><b>{t('now.twin.go')}</b><span>{t('now.twin.detail')}</span></div>
          <Icon name="chev" size={18} />
        </a>
      </div>

      <Section title={t(upcoming.soon ? 'now.events' : 'now.next')}>
        {upcoming.list.length === 0 ? <p role="status">{t('now.noProgramme')}</p> : <div className="list">
          {upcoming.list.map(e => <a className="row row--btn" key={e.id} href={e.source} target="_blank" rel="noreferrer">
            <time className="row__time" dateTime={e.start}>{fmtTime(new Date(e.start),lang)}</time>
            <div className="row__main"><b>{l(e.title)}</b><span>{new Date(e.start).toLocaleDateString(lang, {day:'numeric',month:'long',timeZone:TZ})} · {l(placeById(e.placeId)?.name)}</span></div>
            <Icon name="link" size={16}/>
          </a>)}
        </div>}
        <p className="muted small">{t('now.edition', {date:edition})} <a href="https://arsenal-museum.art/events-all/" target="_blank" rel="noreferrer">{t('common.official')} ↗</a></p>
      </Section>

      <Section title={sun.tomorrow ? t('now.sunset.tomorrow') : t('now.sunset')}>
        <div className="now-sunset">
          <div className="sunbox">
            <div className="kv"><div className="big">{sun.sunset ? fmtTime(sun.sunset, lang) : '—'}</div><small>{sunLeft !== null ? (sunLeft > 0 ? t('now.sunset.left', { m: fmtDur(sunLeft, lang) }) : t('now.sunset.done')) : ''}</small></div>
            {sun.goldenStart && <div className="kv"><b>{fmtTime(sun.goldenStart, lang)}</b><small>{t('now.golden')}</small></div>}
            {sun.sunsetAzimuth !== null && <div className="kv"><b>{compass(sun.sunsetAzimuth, lang)} · {Math.round(sun.sunsetAzimuth)}°</b><small>{t('now.dir')}</small></div>}
          </div>
          <p className="muted small">{t('now.sunset.calc')}</p>
        </div>
        <h3>{t('now.viewpoints')}</h3>
        <p className="muted small">{t('now.viewpoints.note')}{location && ' ' + t('now.geo.found')}</p>
        <div className="list now-viewpoints" role="group" aria-label={t('now.viewpoints')}>
          {viewpoints.map((p) => (
            <button key={p.id} className="row row--btn" onClick={() => selectViewpoint(p)}>
              {placePhoto(p) ? <img className="thumb" src={placePhoto(p)} alt="" loading="lazy" /> : <span className="thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f08a24' }}><Icon name="sunset" size={26} /></span>}
              <div className="row__main"><b>{l(p.name)}</b><span>{l(p.sunset)}</span></div>
              {location && <span className="muted small now-distance">{fromLocation(distanceM(location, p))}</span>}
              <Icon name="chev" size={18} />
            </button>
          ))}
        </div>
      </Section>

      <Section title={t('now.map')} right={
        <button type="button" className="btn btn--ghost btn--sm" onClick={locate} disabled={locating}>
          <Icon name="pin" size={16} />{t('now.near_me')}
        </button>
      }>
        <p className="muted small now-geo-status" role="status" aria-atomic="true">{geoStatus && t(geoStatus)}</p>
        <div className="chips">
          {(['events', 'sunset', 'wc', 'water', 'access', 'steps'] as Layer[]).map((k) => <Chip key={k} active={layers.has(k)} onClick={() => toggle(k)}>{t('now.layer.' + k)}</Chip>)}
        </div>
        <div ref={mapAnchor} tabIndex={-1} role="group" aria-label={selectedName ?? t('now.map')}>
          {selectedName && <p className="now-map-point"><Icon name="pin" size={16} />{selectedName}</p>}
          <LeafMap markers={markers} zoom={14} className="leafmap--tall" selectedId={selectedId} focusPoint={focusPoint} />
        </div>
        <p className="muted small">{layers.has('access') || layers.has('steps') ? t('now.stepfree.hint') + ' ' : ''}{t('now.osm')}</p>
        {sel?.type === 'place' && <PlaceSheet place={sel.place} onClose={() => setSel(null)} extra={sel.event ? <a href={sel.event.source} target="_blank" rel="noreferrer">{l(sel.event.title)} ↗</a> : undefined} />}
        {sel?.type === 'amen' && (
          <div className="sheet">
            <div className="sec__head"><h3>{amenName(sel.a)}</h3><button className="chip" onClick={() => setSel(null)} aria-label={t('common.close')}><Icon name="close" size={16} /></button></div>
            {location && <p className="muted">{fromLocation(distanceM(location, sel.a))}</p>}
            {sel.a.fee && <p>{sel.a.fee === 'yes' ? t('now.fee.yes') : sel.a.fee === 'no' ? t('now.fee.no') : sel.a.fee}</p>}
            {sel.a.opening && <p className="muted small">{sel.a.opening}</p>}
            <p className="credit">{t('now.osm')} © OpenStreetMap contributors</p>
          </div>
        )}
      </Section>
    </div>
  );
}
