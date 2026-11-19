import { type ReactNode } from 'react';
import { CENTER, type LatLon } from '../../core/geo';
import { useI18n } from '../../core/i18n';
import { compass } from '../../core/sun';
import { fmtTime } from '../../core/time';
import { Section } from '../../core/ui';
import { useClock } from '../../core/useClock';
import { useSunSchedule } from '../../core/useSunSchedule';

export function SunsetSection({ location, children }: { location: LatLon | null; children: ReactNode }) {
  const { t, lang } = useI18n();
  const now = useClock(1000);
  const { today, tomorrow } = useSunSchedule(now, location ?? CENTER);
  const afterSunset = today.sunset !== null && now >= today.sunset;
  const { sunset, goldenStart, sunsetAzimuth } = afterSunset ? tomorrow : today;
  const remaining = sunset ? Math.max(0, Math.ceil((sunset.getTime() - now.getTime()) / 1000)) : 0;
  const duration = t('now.sunset.duration', {
    h: Math.floor(remaining / 3600),
    m: String(Math.floor(remaining / 60) % 60).padStart(2, '0'),
    s: String(remaining % 60).padStart(2, '0'),
  });

  return (
    <Section title={t(afterSunset ? 'now.sunset.tomorrow' : 'now.sunset')}>
      <div className="now-sunset">
        <div className="sunbox">
          <div className="kv">
            <div className="big">{sunset ? <time dateTime={sunset.toISOString()}>{fmtTime(sunset, lang)}</time> : '—'}</div>
            {sunset && <small role="timer">{t('now.sunset.left', { m: duration })}</small>}
          </div>
          {goldenStart && <div className="kv"><b><time dateTime={goldenStart.toISOString()}>{fmtTime(goldenStart, lang)}</time></b><small>{t('now.golden')}</small></div>}
          {sunsetAzimuth !== null && <div className="kv"><b>{compass(sunsetAzimuth, lang)} · {Math.round(sunsetAzimuth)}°</b><small>{t('now.dir')}</small></div>}
        </div>
        <p className="muted small">{t(location ? 'now.sunset.local' : 'now.sunset.calc', { time: fmtTime(now, lang) })}</p>
      </div>
      {children}
    </Section>
  );
}
