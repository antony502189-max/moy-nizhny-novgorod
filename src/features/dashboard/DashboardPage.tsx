import { useMemo, useState } from 'react';
import { useI18n, LANG_LABEL } from '../../core/i18n';
import { Icon } from '../../core/Icon';
import { LeafMap } from '../../core/Map';
import { PageTitle, Section, Chip, DemoBadge } from '../../core/ui';
import { DISTRICTS, CENTER } from '../../core/geo';
import { CATEGORIES, catById } from '../../data/reportCategories';
import { loadReports } from '../report/store';
import { syntheticReports } from './synthetic';



export function DashboardPage() {
  const { t, l, lang } = useI18n();
  const [days, setDays] = useState(30);
  const [cat, setCat] = useState('');
  const [demo, setDemo] = useState(false);
  const samples = useMemo(() => demo ? syntheticReports() : [], [demo]);
  const mine = useMemo(() => loadReports().filter((r) => !r.synthetic), []);
  const now = useMemo(() => Date.now(), []);
  const all = useMemo(() => {
    const cut = now - days * 86400000;
    return [...mine, ...samples].filter((r) => r.ts >= cut && (!cat || r.cat === cat));
  }, [days, cat, samples, mine, now]);

  const count = (key: (r: (typeof all)[number]) => string) => { const m = new Map<string, number>(); all.forEach((r) => m.set(key(r), (m.get(key(r)) ?? 0) + 1)); return [...m.entries()].sort((a, b) => b[1] - a[1]); };
  const byCat = count((r) => r.cat), byDist = count((r) => r.district), byLang = count((r) => r.lang);
  const dayList = Array.from({ length: 14 }, (_, i) => { const d = new Date(now - (13 - i) * 86400000); const key = d.toDateString(); return { label: String(d.getDate()), n: all.filter((r) => new Date(r.ts).toDateString() === key).length }; });
  const maxDay = Math.max(1, ...dayList.map((d) => d.n));
  const heat = useMemo(() => all.map((r) => [r.lat, r.lon, r.synthetic ? 0.5 : 1] as [number, number, number]), [all]);
  const distName = (id: string) => { const d = DISTRICTS.find((x) => x.id === id); return d ? d[lang] : t('dash.unknown'); };
  const bar = (label: string, n: number, max: number) => (
    <div className="bar" key={label}><span>{label}</span><div className="bar__track"><div className="bar__fill" style={{ width: (n / max) * 100 + '%' }} /></div><b>{n}</b></div>
  );

  return (
    <div className="page">
      <PageTitle title={t('dash.title')} sub={t('dash.sub')} right={demo && <DemoBadge /> } />
      <div className="banner"><Icon name="info" size={18} /><span>{demo ? t('dash.banner', { n: samples.length }) : t('dash.local')}</span></div>
      <div className="field"><label>{t('dash.period')}</label>
        <div className="seg" role="group">{[7, 14, 30].map((d) => <button key={d} aria-pressed={days === d} onClick={() => setDays(d)}>{t('dash.days', { n: d })}</button>)}</div>
      </div>
      <div className="stats">
        <div className="stat"><b>{all.length}</b><span className="muted small">{t('dash.total')}</span></div>
        <div className="stat"><b>{all.filter((r) => !r.synthetic).length}</b><span className="muted small">{t('dash.real')}</span></div>
        <div className="stat"><b style={{ fontSize: 16 }}>{byCat[0] ? l(catById(byCat[0][0]).label) : '—'}</b><span className="muted small">{t('dash.top_cat')}</span></div>
        <div className="stat"><b style={{ fontSize: 16 }}>{byDist[0] ? distName(byDist[0][0]) : '—'}</b><span className="muted small">{t('dash.top_dist')}</span></div>
      </div>
      <Section title={t('dash.heat')} icon="layers" right={demo && <DemoBadge /> }>
        <div className="chips"><Chip active={!cat} onClick={() => setCat('')}>{t('dash.all')}</Chip>{CATEGORIES.map((c) => <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>{l(c.label)}</Chip>)}</div>
        <LeafMap center={CENTER} zoom={13} heat={heat} className="leafmap--tall" />
        <label className="chip" style={{ alignSelf: 'flex-start' }}><input type="checkbox" checked={demo} onChange={(e) => setDemo(e.target.checked)} /> {t('dash.samples')}</label>
      </Section>
      <Section title={t('dash.by_cat')} icon="chart"><div className="bars card">{byCat.map(([k, n]) => bar(l(catById(k).label), n, byCat[0][1]))}</div></Section>
      <Section title={t('dash.by_dist')} icon="chart"><div className="bars card">{byDist.map(([k, n]) => bar(distName(k), n, byDist[0][1]))}<p className="muted small">{t('dash.districts.note')}</p></div></Section>
      <Section title={t('dash.by_day')} icon="chart"><div className="card" style={{ paddingBottom: 30 }}><div className="cols">{dayList.map((d, i) => <div key={i} style={{ height: (d.n / maxDay) * 100 + '%' }} title={String(d.n)}><span>{d.label}</span></div>)}</div></div></Section>
      <Section title={t('dash.by_lang')} icon="globe"><div className="bars card">{byLang.map(([k, n]) => bar(LANG_LABEL[k as 'ru'], n, byLang[0][1]))}</div></Section>
      <Section title={t('dash.latest')} icon="user">
        {mine.length === 0 ? <p className="muted">{t('dash.latest.none')}</p> : (
          <div className="list">{mine.slice(0, 5).map((r) => (
            <div className="row" key={r.id}>{r.photo && <img className="thumb" src={r.photo} alt="" />}<div className="row__main"><b>{l(catById(r.cat).label)}</b><span>{r.id} · {distName(r.district)} · {LANG_LABEL[r.lang]}</span>{r.text && <span>{r.text}</span>}</div></div>
          ))}</div>
        )}
      </Section>
    </div>
  );
}
