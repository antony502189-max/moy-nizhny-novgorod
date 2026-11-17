import { useI18n, LANGS, LANG_LABEL } from '../../core/i18n';
import { Icon } from '../../core/Icon';
import { PageTitle, Section } from '../../core/ui';
import { go } from '../../core/router';
import { CENTER, distanceM, fmtDist } from '../../core/geo';
import { writeLocal } from '../../core/store';
import { TWINS } from '../../data/twin';

export function TwinPage({ path }: { path: string }) {
  const { t, l, lang, setLang } = useI18n();
  const id = path.replace(/^\/twin\/?/, '');
  const city = TWINS.find((c) => c.id === id);

  if (!city) {
    return (
      <div className="page">
        <PageTitle title={t('twin.title')} sub={t('twin.sub')} />

        <div className="list">
          {TWINS.map((c) => (
            <button key={c.id} className="row row--btn" onClick={() => { writeLocal('ng.twin', c.id); go('/twin/' + c.id); }}>
              <span className="flagc" aria-hidden="true">{c.flag || <Icon name="globe"/>}</span>
              <div className="row__main"><b>{l(c.name)}</b><span>{l(c.country)} · {fmtDist(distanceM(c, CENTER), lang)}</span></div><Icon name="chev" size={18} />
            </button>
          ))}
        </div>
      </div>
    );
  }
  const starts = [
    { to: '/now', icon: 'sunset', label: t('twin.start.now') },
    { to: '/history', icon: 'camera', label: t('twin.start.hist') },
    { to: '/tour', icon: 'route', label: t('twin.start.tour') },
    { to: '/report', icon: 'flag', label: t('twin.start.rep') },
  ];
  return (
    <div className="page">
      <button className="btn btn--ghost btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => go('/twin')}><Icon name="back" size={16} />{t('twin.back')}</button>
      <div className="hero">
        <span className="flagc" style={{ fontSize: 36 }} aria-hidden="true">{city.flag || <Icon name="globe"/>}</span>
        <h1>{l(city.name)}</h1>
        <p>{l(city.welcome)}</p>
        <p className="muted small">{t('twin.dist', { d: fmtDist(distanceM(city, CENTER), lang) })}</p>
      </div>
      <div className="field"><label>{t('twin.lang')}</label>
        <div className="seg" role="group">{LANGS.map((x) => <button key={x} aria-pressed={lang === x} onClick={() => setLang(x)}>{LANG_LABEL[x]}</button>)}</div>
      </div>
      <Section title={t('twin.compare')} icon="globe">
        <div className="card list" style={{ gap: 12 }}>
          {city.compare.map((c, i) => (
            <div key={i}>
              <b>{l(c.topic)}</b>
              <div className="stats" style={{ marginTop: 6 }}>
                <div className="stat"><span className="muted small">{t('twin.yours')} · {l(city.name)}</span><br />{l(c.yours)}</div>
                <div className="stat"><span className="muted small">{t('twin.ours')} · {lang === 'ru' ? 'Нижний' : lang === 'zh' ? '下诺夫哥罗德' : 'Nizhny'}</span><br />{l(c.ours)}</div>
              </div>
            </div>
          ))}
          <a href={city.source} target="_blank" rel="noreferrer">{t(city.id === 'vitebsk' ? 'twin.partner' : 'twin.sister')} ↗</a>
        </div>
      </Section>
      <Section title={t('twin.start')} icon="route">
        <div className="list">{starts.map((s) => (
          <button key={s.to} className="row row--btn" onClick={() => go(s.to)}><Icon name={s.icon} size={22} /><div className="row__main"><b>{s.label}</b></div><Icon name="chev" size={18} /></button>
        ))}</div>
      </Section>
    </div>
  );
}
