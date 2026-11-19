import { useState } from 'react';
import { useI18n } from '../../core/i18n';
import { Icon } from '../../core/Icon';
import { PageTitle, Section } from '../../core/ui';
import { CITY_PROGRAMME, SISTER_CITY_REGISTER, TWINS, type CityRelationship } from '../../data/twin';

const groups: { title: string; relationships: CityRelationship[] }[] = [
  { title: 'twin.group.sister', relationships: ['sister'] },
  { title: 'twin.group.partner', relationships: ['partner'] },
  { title: 'twin.group.history', relationships: ['paused', 'ended'] },
];

function searchText(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

export function TwinPage({ path }: { path: string }) {
  const { t, l, lang } = useI18n();
  const [query, setQuery] = useState('');
  const id = path.replace(/^\/twin\/?/, '');
  const city = TWINS.find(c => c.id === id);

  if (!city) {
    const term = searchText(query.trim());
    const matches = TWINS.filter(c => (
      [...Object.values(c.name), ...Object.values(c.area)].some(value => searchText(value).includes(term))
    )).sort((a,b) => l(a.name).localeCompare(l(b.name), lang));

    return (
      <div className="page">
        <PageTitle title={t('twin.title')} sub={t('twin.sub')} />
        <div className="field">
          <label htmlFor="twin-search">{t('twin.search')}</label>
          <input id="twin-search" type="search" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        {!matches.length && <p role="status">{t('twin.empty')}</p>}
        {groups.map(({title, relationships}) => {
          const entries = matches.filter(c => relationships.includes(c.relationship));
          if (!entries.length) return null;
          return (
            <Section key={title} title={t(title)} icon="globe">
              <div className="list">
                {entries.map(c => (
                  <a className="row row--btn" key={c.id} href={'#/twin/' + c.id}>
                    <div className="row__main">
                      <b>{l(c.name)}</b>
                      <span>{l(c.area)} · {t('twin.relationship.' + c.relationship)}</span>
                    </div>
                    <Icon name="chev" size={18} />
                  </a>
                ))}
              </div>
            </Section>
          );
        })}
        <Section title={t('twin.sources')} icon="link">
          <a href={SISTER_CITY_REGISTER} target="_blank" rel="noreferrer">{t('twin.register')} ↗</a>
          <a href={CITY_PROGRAMME} target="_blank" rel="noreferrer">{t('twin.programme')} ↗</a>
        </Section>
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
      <a className="btn btn--ghost btn--sm" style={{ alignSelf: 'flex-start' }} href="#/twin">
        <Icon name="back" size={16} />{t('twin.back')}
      </a>
      <PageTitle title={l(city.name)} sub={l(city.area)} />
      <div className="hero">
        <b>{t('twin.relationship.' + city.relationship)}</b>
        {city.since && <p>{t(city.relationship === 'paused' ? 'twin.initialAgreement' : 'twin.since', { year: city.since })}</p>}
        <a href={city.source} target="_blank" rel="noreferrer">{t('twin.source')} ↗</a>
        {city.relatedAgreement && (
          <p>{l(city.relatedAgreement.text)} <a href={city.relatedAgreement.source} target="_blank" rel="noreferrer">{t('twin.agreementSource')} ↗</a></p>
        )}
      </div>
      <Section title={t('twin.start')} icon="route">
        <div className="list">{starts.map(s => (
          <a key={s.to} className="row row--btn" href={'#' + s.to}>
            <Icon name={s.icon} size={22} /><div className="row__main"><b>{s.label}</b></div><Icon name="chev" size={18} />
          </a>
        ))}</div>
      </Section>
    </div>
  );
}
