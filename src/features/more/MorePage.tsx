import { useState } from 'react';
import { useI18n } from '../../core/i18n';
import { Icon } from '../../core/Icon';
import { PageTitle, Section } from '../../core/ui';
import { go } from '../../core/router';
import amenities from '../../data/amenities.json';

export function MorePage() {
  const { t } = useI18n();
  const [done, setDone] = useState(false);
  const am = amenities as { fetchedAt: string; count: number };
  const items = [
    { icon: 'chart', title: t('more.dashboard'), sub: t('more.dashboard.sub'), to: '/dashboard' },
    { icon: 'globe', title: t('more.twin'), sub: t('more.twin.sub'), to: '/twin' },
  ];
  return (
    <div className="page">
      <PageTitle title={t('more.title')} sub={t('more.sub')} />
      <div className="list">
        {items.map((i) => (
          <button key={i.to} className="row row--btn" onClick={() => go(i.to)}>
            <Icon name={i.icon} size={24} /><div className="row__main"><b>{i.title}</b><span>{i.sub}</span></div><Icon name="chev" size={18} />
          </button>
        ))}
      </div>
      <Section title={t('more.about')} icon="info">
        <div className="card list" style={{ gap: 10 }}>
          <p>{t('about.p1')}</p>
          <p className="muted">{t('about.map', { date: am.fetchedAt, n: am.count })}</p>
          <p className="muted">{t('about.photos')}</p>
          <p className="muted">{t('about.demo')}</p>
          <p className="muted">{t('about.src')}</p>
          <button className="btn btn--ghost" onClick={() => { Object.keys(localStorage).filter((k) => k.startsWith('ng.') && k !== 'ng.lang').forEach((k) => localStorage.removeItem(k)); setDone(true); }}>{t('about.reset')}</button>
          {done && <p role="status">{t('about.reset.done')}</p>}
        </div>
      </Section>
    </div>
  );
}
