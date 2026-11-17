import { useMemo, useState } from 'react';
import { useI18n } from '../../core/i18n';
import { Icon } from '../../core/Icon';
import { PageTitle } from '../../core/ui';
import { go } from '../../core/router';
import { HISTORY } from '../../data/history';
import { BeforeAfter } from './BeforeAfter';

const MIN = 1850, MAX = 1960;
/** 100 points for exact, -5 per year of error (floor 0). Spots with an approximate date accept ±3 years as exact. */
export function score(guess: number, truth: number, approx: boolean) {
  const diff = Math.abs(guess - truth);
  const eff = approx ? Math.max(0, diff - 3) : diff;
  return { diff, points: Math.max(0, 100 - eff * 5) };
}

export function GuessGame() {
  const { t, l, lang } = useI18n();
  const rounds = useMemo(() => HISTORY.filter((s) => s.guessYear !== null), []);
  const [i, setI] = useState(0);
  const [guess, setGuess] = useState(1910);
  const [answered, setAnswered] = useState(false);
  const [total, setTotal] = useState(0);
  const [last, setLast] = useState<{ diff: number; points: number } | null>(null);
  const [done, setDone] = useState(false);
  const spot = rounds[i];
  const then = spot.then.find((x) => x.year === spot.guessYear) ?? spot.then[0];
  const yrs = (n: number) => lang === 'ru' ? (n % 10 === 1 && n % 100 !== 11 ? t('yrs.1') : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? t('yrs.2') : t('yrs.5')) : n === 1 ? t('yrs.1') : t('yrs.2');

  const submit = () => {
    const r = score(guess, spot.guessYear!, !spot.guessExact);
    setLast(r); setTotal((x) => x + r.points); setAnswered(true);
  };
  const next = () => {
    if (i + 1 >= rounds.length) { setDone(true); return; }
    setI(i + 1); setAnswered(false); setLast(null); setGuess(1910);
  };
  const restart = () => { setI(0); setAnswered(false); setLast(null); setTotal(0); setDone(false); setGuess(1910); };

  if (done) {
    return (
      <div className="page">
        <PageTitle title={t('hist.guess')} />
        <div className="hero"><h2>{t('guess.finish')}</h2><p style={{ fontSize: 28, fontWeight: 700 }}>{t('guess.score', { n: total, max: rounds.length * 100 })}</p></div>
        <div className="chips"><button className="btn" onClick={restart}>{t('guess.again')}</button><button className="btn btn--ghost" onClick={() => go('/history')}>{t('guess.to_list')}</button></div>
      </div>
    );
  }
  return (
    <div className="page">
      <button className="btn btn--ghost btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => go('/history')}><Icon name="back" size={16} />{t('hist.back')}</button>
      <PageTitle title={t('hist.guess')} sub={t('guess.round', { n: i + 1, total: rounds.length })} right={<span className="badge badge--soon">{total}</span>} />
      {answered
        ? <BeforeAfter thenSrc={then.src} nowSrc={spot.now.src} thenLabel={`${t('hist.then')} · ${l(then.yearLabel)}`} nowLabel={t('hist.now')} alt={l(spot.title)} />
        : <div className="ba"><img src={then.src} alt={l(spot.title)} /></div>}
      {!answered ? (
        <>
          <p><b>{t('guess.q')}</b></p>
          <div className="field">
            <label htmlFor="yr">{t('guess.your')}: <span style={{ fontSize: 24, fontWeight: 700 }}>{guess}</span></label>
            <input id="yr" type="range" min={MIN} max={MAX} value={guess} onChange={(e) => setGuess(+e.target.value)} />
            <div className="chips">
              <button className="chip" onClick={() => setGuess((g) => Math.max(MIN, g - 1))}>−1</button>
              <button className="chip" onClick={() => setGuess((g) => Math.min(MAX, g + 1))}>+1</button>
            </div>
          </div>
          <p className="muted small">{t('guess.hint')}</p>
          <button className="btn" onClick={submit}>{t('guess.submit')}</button>
        </>
      ) : (
        <>
          <div className="card">
            <p><b>{last && last.diff === 0 ? t('guess.exact') : t('guess.off', { n: last!.diff, yrs: yrs(last!.diff) })}</b> · {t('guess.points', { n: last!.points })}</p>
            <p>{spot.guessExact ? t('guess.truth') : t('guess.truth.approx')}: <b>{spot.guessYear}</b></p>
            <p className="muted" style={{ marginTop: 8 }}>{l(spot.story)}</p>
          </div>
          <button className="btn" onClick={next}>{i + 1 >= rounds.length ? t('guess.finish') : t('guess.next')}</button>
        </>
      )}
    </div>
  );
}
