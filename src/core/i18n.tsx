import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export const LANGS = ['ru', 'en', 'zh'] as const;
export type Lang = (typeof LANGS)[number];
export const LANG_LABEL: Record<Lang, string> = { ru: 'RU', en: 'EN', zh: '中文' };
/** Localised content value. Add a new language: extend LANGS + provide strings; missing keys fall back to ru/en. */
export type L10n = Partial<Record<Lang, string>> & { ru: string };
export type Strings = Record<string, string>;
export type Bundle = Record<Lang, Strings>;

const dict: Record<Lang, Strings> = { ru: {}, en: {}, zh: {} };
/** Features register their UI strings here (see each feature strings.ts). */
export function registerStrings(b: Partial<Bundle>) {
  for (const l of LANGS) Object.assign(dict[l], b[l] ?? {});
}

function detect(): Lang {
  let saved: Lang | null = null;
  try { saved = localStorage.getItem('ng.lang') as Lang | null; } catch { /* private browsing */ }
  if (saved && LANGS.includes(saved)) return saved;
  const nav = (navigator.language || 'ru').toLowerCase();
  if (nav.startsWith('zh')) return 'zh';
  if (nav.startsWith('ru') || nav.startsWith('be') || nav.startsWith('uk')) return 'ru';
  return nav.startsWith('en') ? 'en' : 'ru';
}

interface Ctx {
  lang: Lang; setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  l: (v: L10n | undefined) => string;
}
const I18nCtx = createContext<Ctx>(null as unknown as Ctx);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detect);
  const setLang = useCallback((l: Lang) => { try { localStorage.setItem('ng.lang', l); } catch { /* session only */ } setLangState(l); }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const value = useMemo<Ctx>(() => ({
    lang, setLang,
    t: (key, vars) => {
      let s = dict[lang][key] ?? dict.ru[key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
      return s;
    },
    l: (v) => (v ? (v[lang] ?? v.en ?? v.ru) : ''),
  }), [lang, setLang]);
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}
export const useI18n = () => useContext(I18nCtx);
