import { Suspense, useEffect } from 'react';
import { I18nProvider, LANGS, LANG_LABEL, registerStrings, useI18n } from './core/i18n';
import { coreStrings } from './core/strings';
import { usePath } from './core/router';
import { Icon } from './core/Icon';
import { FEATURES } from './features/registry';
import { MorePage } from './features/more/MorePage';

registerStrings(coreStrings);
FEATURES.forEach((f) => registerStrings(f.strings));

function Shell() {
  const { t, lang, setLang } = useI18n();
  const path = usePath();
  const feature = FEATURES.find((f) => path === f.path || path.startsWith(f.path + '/'));
  const tabs = FEATURES.filter((f) => f.tab);
  const moreActive = !feature?.tab;
  const tabKey = feature?.tab?.labelKey;
  useEffect(() => {
    document.title = (tabKey ? t(tabKey) + ' · ' : '') + t('app.name');
    document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true });
  }, [path, lang, tabKey]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#/now"><img src={import.meta.env.BASE_URL+'favicon.svg'} alt="" width={32} height={32}/><span>{t('app.name')}<small>{t('app.sub')}</small></span></a>
        <div className="lang" role="group" aria-label={t('app.lang')}>
          {LANGS.map((l) => <button key={l} aria-pressed={lang === l} onClick={() => setLang(l)}>{LANG_LABEL[l]}</button>)}
        </div>
      </header>
      <main tabIndex={-1}>{feature ? <Suspense fallback={<p role="status">…</p>}><feature.Component path={path} /></Suspense> : <MorePage />}</main>
      <nav className="tabbar" aria-label="Main"><div className="tabbar__in">
        {tabs.map((f) => (
          <a key={f.id} className="tab" href={'#' + f.path} aria-current={feature?.id === f.id ? 'page' : undefined}>
            <Icon name={f.tab!.icon} size={22} /><span className="tab__label">{t(f.tab!.labelKey)}</span>
          </a>
        ))}
        <a className="tab" href="#/more" aria-current={moreActive ? 'page' : undefined}><Icon name="grid" size={22} /><span className="tab__label">{t('tab.more')}</span></a>
      </div></nav>
    </div>
  );
}

export function App() { return <I18nProvider><Shell /></I18nProvider>; }
