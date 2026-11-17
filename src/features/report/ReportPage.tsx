import { useState } from 'react';
import { useI18n, LANGS, LANG_LABEL, type Lang } from '../../core/i18n';
import { Icon, svgInner } from '../../core/Icon';
import { LeafMap, type MapMarker } from '../../core/Map';
import { PageTitle, Section, Chip } from '../../core/ui';
import { go } from '../../core/router';
import { CENTER, distanceM } from '../../core/geo';
import { CATEGORIES, catById } from '../../data/reportCategories';
import { addReport, loadReports, shrinkPhoto, type Report } from './store';

export function ReportPage() {
  const { t, l, lang } = useI18n();
  const [cat, setCat] = useState<string>('');
  const [text, setText] = useState('');
  const [pt, setPt] = useState<{ lat: number; lon: number } | null>(null);
  const [photo, setPhoto] = useState<string>('');
  const [rlangSel, setRlang] = useState<Lang | null>(null);
  const rlang: Lang = rlangSel ?? lang; // follows the UI language until the guest picks another report language
  const [err, setErr] = useState('');
  const [done, setDone] = useState<Report | null>(null);
  const [mine, setMine] = useState(() => loadReports().filter((r) => !r.synthetic));

  const submit = () => {
    if (!cat) { setErr(t('rep.err.cat')); return; }
    if (!pt) { setErr(t('rep.err.point')); return; }
    const r = addReport({ cat, text: text.trim(), lat: pt.lat, lon: pt.lon, lang: rlang, photo: photo || undefined });
    setDone(r); setMine(loadReports()); setErr('');
  };
  const reset = () => { setDone(null); setCat(''); setText(''); setPt(null); setPhoto(''); };
  const me = () => navigator.geolocation?.getCurrentPosition((p) => {
    const q = { lat: p.coords.latitude, lon: p.coords.longitude };
    setPt(distanceM(q, CENTER) > 40000 ? CENTER : q);
  }, () => {}, { timeout: 8000 });

  if (done) {
    return (
      <div className="page">
        <div className="hero"><h2><Icon name="check" size={22} />{t('rep.done.title')}</h2><p style={{ fontSize: 22, fontWeight: 700 }}>{t('rep.done.no', { id: done.id })}</p><p className="muted">{l(catById(done.cat).label)}</p></div>
        <div className="banner"><Icon name="info" size={18} /><span>{t('rep.done.local')}</span></div>
        <div className="chips"><button className="btn" onClick={() => go('/dashboard')}><Icon name="chart" size={18} />{t('rep.done.dash')}</button><button className="btn btn--ghost" onClick={reset}>{t('rep.done.more')}</button></div>
      </div>
    );
  }
  const marks: MapMarker[] = [];
  return (
    <div className="page">
      <PageTitle title={t('rep.title')} sub={t('rep.sub')} />
      <Section title={t('rep.cat')} icon="flag">
        <div className="chips">
          {CATEGORIES.map((c) => <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}><Icon name={c.icon} size={16} />{l(c.label)}</Chip>)}
        </div>
      </Section>
      <Section title={t('rep.point')} icon="pin" right={<span className="chips"><button className="btn btn--ghost btn--sm" onClick={me}>{t('rep.point.me')}</button><button className="btn btn--ghost btn--sm" onClick={() => setPt(CENTER)}>{t('rep.point.center')}</button></span>}>
        <p className="muted small">{pt ? t('rep.point.set') : t('rep.point.hint')}</p>
        <LeafMap center={CENTER} zoom={14} markers={marks} picked={pt} onMapClick={(lat, lon) => setPt({ lat, lon })} />
      </Section>
      <div className="field"><label htmlFor="rt">{t('rep.text')}</label><textarea id="rt" value={text} maxLength={500} placeholder={t('rep.text.ph')} onChange={(e) => setText(e.target.value)} /></div>
      <div className="field">
        <label htmlFor="rp">{t('rep.photo')}</label>
        {photo ? (<><img src={photo} alt="" style={{ maxHeight: 180, borderRadius: 12, objectFit: 'cover' }} /><button className="btn btn--ghost btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => setPhoto('')}>{t('rep.photo.remove')}</button></>)
          : <input id="rp" type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { setPhoto(await shrinkPhoto(f)); } catch { /* ignore */ } } }} />}
      </div>
      <div className="field"><label>{t('rep.lang')}</label>
        <div className="seg" role="group">{LANGS.map((x) => <button key={x} aria-pressed={rlang === x} onClick={() => setRlang(x)}>{LANG_LABEL[x]}</button>)}</div>
      </div>
      {err && <p className="err" role="alert">{err}</p>}
      <button className="btn" onClick={submit}><Icon name="send" size={18} />{t('rep.submit')}</button>
      <p className="muted small">{t('rep.privacy')}</p>
      <Section title={t('rep.mine')} icon="user">
        {mine.length === 0 ? <p className="muted">{t('rep.mine.none')}</p> : (
          <div className="list">
            {mine.map((r) => (
              <div key={r.id} className="row"><div className="row__main"><b>{l(catById(r.cat).label)}</b><span>{r.id} · {new Date(r.ts).toLocaleString(lang)}</span>{r.text && <span>{r.text}</span>}</div><span className="badge badge--soon">{t('rep.status')}</span></div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
