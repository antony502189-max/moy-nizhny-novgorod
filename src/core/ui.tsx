import type { ReactNode } from 'react';
import { useI18n } from './i18n';
import { Icon } from './Icon';

export function DemoBadge({ label }: { label?: string }) {
  const { t } = useI18n();
  return <span className="badge badge--demo" title={t('demo.hint')}>{label ?? t('demo.badge')}</span>;
}

export function PageTitle({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="pagetitle">
      <div><h1>{title}</h1>{sub && <p className="muted">{sub}</p>}</div>
      {right}
    </div>
  );
}

export function Section({ title, icon, right, children }: { title: string; icon?: string; right?: ReactNode; children: ReactNode }) {
  return (
    <section className="sec">
      <div className="sec__head">
        <h2>{icon && <Icon name={icon} size={18} />}{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

export function Chip({ active, onClick, children, tone }: { active?: boolean; onClick?: () => void; children: ReactNode; tone?: string }) {
  return <button type="button" className={`chip${active ? ' chip--on' : ''}${tone ? ' chip--' + tone : ''}`} onClick={onClick} aria-pressed={active}>{children}</button>;
}
