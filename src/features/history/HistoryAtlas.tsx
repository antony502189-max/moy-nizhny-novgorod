import { useMemo, useState } from 'react';
import { useI18n } from '../../core/i18n';
import { LeafMap } from '../../core/Map';
import { Icon, svgInner } from '../../core/Icon';
import { PageTitle, Section } from '../../core/ui';
import { go } from '../../core/router';
import { places } from '../../../resident/domain/data.ts';
import { HISTORY, type HistorySpot } from '../../data/history';

const entries = HISTORY.map(spot => {
  const place = places.find(place => place.id === spot.placeId)!;
  const point = spot.point ?? place;
  return { spot, place, lat: point.lat!, lon: point.lon! };
});

export function HistoryAtlas({ focused }: { focused?: HistorySpot }) {
  const { t, l } = useI18n();
  const [query, setQuery] = useState('');
  const term = query.trim().toLocaleLowerCase();
  const shown = useMemo(() => entries.filter(({ spot, place }) =>
    [l(spot.title), spot.title.ru, place.title, place.address].join(' ').toLocaleLowerCase().includes(term)
  ), [term, l]);
  const markers = useMemo(() => shown.map(({ spot, lat, lon }) => ({
    id: spot.id, lat, lon, title: l(spot.title), size: 44, glyph: svgInner('camera', 18),
    onClick: () => go('/history/' + spot.id),
  })), [shown, l]);
  const selected = !term && focused ? markers.find(marker => marker.id === focused.id) : undefined;
  return (
    <div className="page history-atlas">
      <PageTitle title={t('hist.title')} sub={t('hist.sub')} />
      <section className="sec" aria-label={t('hist.map')}>
        <label className="history-atlas__search">
          <Icon name="search" size={18}/>
          <input type="search" aria-label={t('hist.search')} placeholder={t('hist.search')} value={query} onChange={e => setQuery(e.target.value)} />
        </label>
        <LeafMap markers={markers} fit cluster selectedId={selected?.id} focusPoint={selected}
          label={t('hist.map')} className="history-atlas__map" />
        {selected && <a className="history-atlas__selected" href={'#/history/' + selected.id}><Icon name="pin" size={16}/>{selected.title}</a>}
      </section>
      <button className="hero" style={{ border: 0, textAlign: 'left' }} onClick={() => go('/history/guess')}>
        <h2><Icon name="star" size={20} />{t('hist.guess')}</h2><p className="muted">{t('hist.guess.sub')}</p>
      </button>
      <Section title={t('hist.spots')} right={<span className="muted">{shown.length}</span>} icon="camera">
        {!shown.length && <p role="status">{t('guide.none')}</p>}
        <div className="list">
          {shown.map(({ spot }) => (
            <a key={spot.id} className="row row--btn" href={'#/history/' + spot.id}>
              <img className="thumb" src={(spot.then.find(photo => !photo.generated) ?? spot.then[0]).src} alt="" loading="lazy" />
              <img className="thumb" src={spot.now.src} alt="" loading="lazy" />
              <div className="row__main"><b>{l(spot.title)}</b><span>{l(spot.then[0].yearLabel)} — {spot.now.year}</span></div>
              <Icon name="chev" size={18}/>
            </a>
          ))}
        </div>
      </Section>
    </div>
  );
}
