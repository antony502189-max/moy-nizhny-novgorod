import { useRef, useState } from 'react';
import { useI18n } from '../../core/i18n';
import { Icon } from '../../core/Icon';
import { PageTitle } from '../../core/ui';
import { go } from '../../core/router';
import { HISTORY, historyForPlace, type HistorySpot } from '../../data/history';
import { Narration } from '../../core/Narration';
import './timeline.css';
import { HistoryAtlas } from './HistoryAtlas';
import { GuessGame } from './GuessGame';

function SpotView({ spot }: { spot: HistorySpot }) {
  const { t, l, lang } = useI18n();
  const [selected, setSelected] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const nowLabel = spot.now.year ? t('hist.now') + ' · ' + spot.now.year : t('hist.now');
  const frames = [
    ...spot.then.map(photo => ({
      ...photo, label: l(photo.yearLabel), description: l(photo.caption), narration: 'photo-' + photo.id,
    })),
    { ...spot.now, id: 'now', label: nowLabel, description: l(spot.now.caption), generated: spot.now.generated, narration: spot.story ? null : spot.placeId },
  ];
  const frame = frames[selected];
  const source = frame.credit;
  return (
    <div className="page history-spot">
      <nav className="history-spot__links" aria-label={t('hist.title')}>
        <a className="btn btn--ghost btn--sm" href="#/history"><Icon name="back" size={16} />{t('hist.back')}</a>
        <a className="btn btn--ghost btn--sm" href={'#/history/map/'+spot.id}><Icon name="pin" size={16}/>{t('hist.on_map')}</a>
      </nav>
      <PageTitle title={l(spot.title)} />
      <figure className="history-timeline">
        <div className="history-timeline__photo"
          onTouchStart={event => { const point = event.touches[0]; touchStart.current = event.touches.length === 1 ? { x: point.clientX, y: point.clientY } : null; }}
          onTouchCancel={() => { touchStart.current = null; }}
          onTouchEnd={event => {
            const start = touchStart.current;
            touchStart.current = null;
            if (!start || event.touches.length) return;
            const dx = event.changedTouches[0].clientX - start.x;
            const dy = event.changedTouches[0].clientY - start.y;
            if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
              setSelected(i => Math.max(0, Math.min(frames.length - 1, i + (dx < 0 ? 1 : -1))));
            }
          }}>
          <img src={frame.src} alt={l(spot.title) + ' · ' + frame.label + '. ' + frame.description} />
        </div>
        <div className="history-timeline__strip" role="radiogroup" aria-label={t('hist.timeline')}>
          {frames.map((photo, i) => (
            <label key={photo.id} className="history-timeline__choice">
              <input type="radio" name="history-stage" checked={selected === i} onChange={() => setSelected(i)} />
              <img src={photo.src} alt="" />
              <span>{photo.label}</span>
            </label>
          ))}
        </div>
        <figcaption aria-live="polite" aria-atomic="true">
          <p>{frame.description}</p>
          <div className="history-timeline__credit">
            <a href={source.sourceUrl} target="_blank" rel="noreferrer">{frame.generated ? t('hist.reference') : source.author}</a>
            {!frame.generated && <> · {source.licenseUrl ? <a href={source.licenseUrl} target="_blank" rel="noreferrer">{source.license}</a> : source.license}</>}
          </div>
        </figcaption>
      </figure>
      <div className="card">{spot.story && <p>{l(spot.story)}</p>}{frame.narration && <Narration key={frame.id} id={frame.narration} lang={lang}/>}</div>
      {spot.guessYear !== null && <div className="chips"><button className="btn" onClick={() => go('/history/guess')}><Icon name="star" size={18} />{t('hist.guess')}</button></div>}
    </div>
  );
}

export function HistoryPage({ path }: { path: string }) {
  const [, , section, id] = path.split('/');
  if (section === 'guess') return <GuessGame />;
  if (section === 'map') return <HistoryAtlas key={id} focused={HISTORY.find(s => s.id === id)}/>;
  const spot = section === 'landmark' ? historyForPlace(id) : HISTORY.find(s => s.id === section);
  return spot ? <SpotView key={spot.id} spot={spot} /> : <HistoryAtlas />;
}
