import { useMemo, useState } from 'react';
import { useI18n } from '../../core/i18n';
import { Icon } from '../../core/Icon';
import { PageTitle, Section } from '../../core/ui';
import { go } from '../../core/router';
import { HISTORY, type Credit, type HistorySpot } from '../../data/history';
import { placeById } from '../../data/places';
import { BeforeAfter } from './BeforeAfter';
import { GuessGame } from './GuessGame';

function CreditLine({ label, c }: { label: string; c: Credit }) {
  return (
    <div className="credit">{label}: {c.author}, <a href={c.sourceUrl} target="_blank" rel="noreferrer">{c.license}</a>{c.note ? ` · ${c.note}` : ''}</div>
  );
}

function SpotView({ spot }: { spot: HistorySpot }) {
  const { t, l } = useI18n();
  const [ti, setTi] = useState(0);
  const then = spot.then[ti];
  const place = placeById(spot.placeId);
  return (
    <div className="page">
      <button className="btn btn--ghost btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => go('/history')}><Icon name="back" size={16} />{t('hist.back')}</button>
      <PageTitle title={l(spot.title)} />
      {spot.then.length > 1 && (
        <div className="seg" role="group">
          {spot.then.map((x, i) => <button key={x.id} aria-pressed={i === ti} onClick={() => setTi(i)}>{l(x.yearLabel)}</button>)}
        </div>
      )}
      <BeforeAfter key={then.id} thenSrc={then.src} nowSrc={spot.now.src} thenLabel={`${t('hist.then')} · ${l(then.yearLabel)}`} nowLabel={t('hist.now')} alt={l(spot.title)} />
      <p className="muted small">{t('hist.drag')}. {t('hist.angle')}</p>
      <div className="card"><p>{l(spot.story)}</p></div>
      <div className="list" style={{ gap: 4 }}>
        <CreditLine label={t('hist.credit.then')} c={then.credit} />
        <CreditLine label={t('hist.credit.now')} c={spot.now.credit} />
        <div className="credit">{t('hist.licence.note')}</div>
      </div>
      <div className="chips">
        {spot.guessYear !== null && <button className="btn" onClick={() => go('/history/guess')}><Icon name="star" size={18} />{t('hist.guess')}</button>}
        {place && <a className="btn btn--ghost" href={`https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}#map=17/${place.lat}/${place.lon}`} target="_blank" rel="noreferrer"><Icon name="pin" size={18} />{t('hist.on_map')}</a>}
      </div>
    </div>
  );
}

export function HistoryPage({ path }: { path: string }) {
  const { t, l } = useI18n();
  const sub = path.replace(/^\/history\/?/, '');
  const spot = useMemo(() => HISTORY.find((s) => s.id === sub), [sub]);
  if (sub === 'guess') return <GuessGame />;
  if (spot) return <SpotView spot={spot} />;
  return (
    <div className="page">
      <PageTitle title={t('hist.title')} sub={t('hist.sub')} />
      <button className="hero" style={{ border: 0, textAlign: 'left' }} onClick={() => go('/history/guess')}>
        <h2><Icon name="star" size={20} />{t('hist.guess')}</h2><p className="muted">{t('hist.guess.sub')}</p>
      </button>
      <Section title={t('hist.spots')} icon="camera">
        <div className="list">
          {HISTORY.map((s) => (
            <button key={s.id} className="row row--btn" onClick={() => go('/history/' + s.id)}>
              <img className="thumb" src={s.then[0].src} alt="" loading="lazy" style={{ filter: 'sepia(.3)' }} />
              <img className="thumb" src={s.now.src} alt="" loading="lazy" />
              <div className="row__main"><b>{l(s.title)}</b><span>{l(s.then[0].yearLabel)}</span></div><Icon name="chev" size={18} />
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}
