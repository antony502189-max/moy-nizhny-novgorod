import { useState } from 'react';
import { useI18n } from '../../core/i18n';
import { Icon } from '../../core/Icon';

/** Before/after slider. Native range input on top gives touch, mouse and keyboard support for free. */
export function BeforeAfter({ thenSrc, nowSrc, thenLabel, nowLabel, alt }: { thenSrc: string; nowSrc: string; thenLabel: string; nowLabel: string; alt: string }) {
  const { t } = useI18n();
  const [pos, setPos] = useState(50);
  return (
    <div className="ba" style={{ ['--pos' as string]: pos + '%' }}>
      <img src={nowSrc} alt={`${alt} — ${nowLabel}`} draggable={false} />
      <img className="ba__top" src={thenSrc} alt={`${alt} — ${thenLabel}`} draggable={false} />
      <div className="ba__line" /><div className="ba__knob"><Icon name="chev" size={0} /><span style={{ fontSize: 16, letterSpacing: -3 }}>◂▸</span></div>
      <span className="ba__lab" style={{ left: 10 }}>{thenLabel}</span>
      <span className="ba__lab" style={{ right: 10 }}>{nowLabel}</span>
      <input type="range" min={0} max={100} step={0.5} value={pos} onChange={(e) => setPos(+e.target.value)} aria-label={t('hist.slider')} />
    </div>
  );
}
