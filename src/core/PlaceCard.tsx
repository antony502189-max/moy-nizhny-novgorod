import { useEffect, useRef } from 'react';
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
  const photo = placePhoto(place);
  const c = place.photo ? photoCredits[place.photo] : undefined;
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus({ preventScroll: true });
    return () => { prev?.focus?.({ preventScroll: true }); };
  }, [place.id]);
  return (
    <div className="sheet" role="dialog" aria-label={l(place.name)} tabIndex={-1} ref={ref}
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
      {extra}
    </div>
  );
}
