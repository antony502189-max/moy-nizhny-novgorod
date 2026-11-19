import { useState } from 'react';
import { ratingsKey, readRatings } from './ratings';
import { useLocal } from './store';
import { useI18n } from './i18n';
import { Icon } from './Icon';
import { photoCredits, placePhoto, type Place } from '../data/places';

export function EffortDots({ level }: { level: 0 | 1 | 2 }) {
  const { t } = useI18n();
  return (
    <span className="effort" title={t(`effort.${level}`)}>
      {[0, 1, 2].map((i) => <i key={i} className={i < level ? 'on' : ''} />)}
    </span>
  );
}

export function PlaceSheet({ place, onClose, extra }: { place: Place; onClose?: () => void; extra?: React.ReactNode }) {
  const { t, l } = useI18n();
  const [ratingError, setRatingError] = useState(false);
  const [ratings, setRatings] = useLocal(ratingsKey, readRatings());
  const photo = placePhoto(place);
  const c = place.photo ? photoCredits[place.photo] : undefined;
  return (
    <div className="sheet" role="region" aria-label={l(place.name)}
      onKeyDown={(e) => { if (e.key === 'Escape' && onClose) { e.stopPropagation(); onClose(); } }}>
      <div className="sec__head">
        <h3>{l(place.name)}</h3>
        {onClose && <button className="chip" onClick={onClose} aria-label={t('common.close')}><Icon name="close" size={16} /></button>}
      </div>
      {photo && <img src={photo} alt={l(place.name)} loading="lazy" />}
      {c && <div className="credit">{t('common.photo')}: {c.author}, <a href={c.sourceUrl} target="_blank" rel="noreferrer">{c.license}</a></div>}
      <p>{l(place.blurb)}</p>
      <div className="tags">
        {place.tags.map((g) => <span className="tag" key={g}>{t(`tag.${g}`)}</span>)}
        <span className="tag">{place.minutes} {t('common.min')}</span>
        <span className="tag">{t(`effort.${place.effort}`)}</span>
      </div>
      {place.tip && <p className="muted">{l(place.tip)}</p>}
      <div className="chips">
        {place.site
          ? <a className="btn btn--ghost btn--sm" href={place.site} target="_blank" rel="noreferrer"><Icon name="link" size={16} />{t('common.official')}</a>
          : <span className="badge badge--soon">{t('common.verify')}</span>}
      </div>
      <div role="group" aria-label={t('rating.label')}><p>{t('rating.label')}</p><div className="chips">{[1,2,3,4,5].map(n =>
        <button key={n} className="chip" aria-pressed={ratings?.[place.id] === n}
          onClick={()=>setRatingError(!setRatings({...readRatings(), [place.id]:n}))}>{n} ★</button>)}</div></div>
      {ratingError && <p role="alert">{t('common.storageError')}</p>}
      <a href={'#/guide/'+place.id}>{t('guide.stories')} · {t('guide.title')} →</a>{extra}
    </div>
  );
}
