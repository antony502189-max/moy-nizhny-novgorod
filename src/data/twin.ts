import type { L10n } from '../core/i18n';

export interface TwinCity {
  id: string; name: L10n; country: L10n; lat: number; lon: number; flag: string;
  defaultLang: 'ru' | 'en' | 'zh'; welcome: L10n;
  /** "in your city / with us" comparison rows */
  compare: { yours: L10n; ours: L10n; topic: L10n }[];
  source: string;
}

export const TWINS: TwinCity[] = [
  {
    id: 'minsk', flag: '🇧🇾', lat: 53.9006, lon: 27.5590, defaultLang: 'ru', source: 'https://admgor.nnov.ru/Gostyam/Goroda-pobratimy',
    name: { ru: 'Минск', en: 'Minsk', zh: '明斯克' }, country: { ru: 'Беларусь', en: 'Belarus', zh: '白俄罗斯' },
    welcome: { ru: 'Добро пожаловать из Минска! Покажем, что открыто сейчас, как выглядели места раньше и как сообщить о проблеме без регистрации.', en: 'Welcome from Minsk! We show what is on right now, how places looked before, and how to report a problem without signing up.', zh: '欢迎来自明斯克的朋友！我们为您展示此刻有什么、地点过去的模样，以及无需注册即可反馈问题的方法。' },
    compare: [
      { topic: { ru: 'Река', en: 'River', zh: '河流' }, yours: { ru: 'Свислочь', en: 'Svislach', zh: '斯维斯洛奇河' }, ours: { ru: 'Волга и Ока', en: 'Volga and Oka', zh: '伏尔加河与奥卡河' } },
    ],
  },
  {
    id: 'gomel', flag: '🇧🇾', lat: 52.4345, lon: 30.9754, defaultLang: 'ru', source: 'https://admgor.nnov.ru/news/28990',
    name: { ru: 'Гомель', en: 'Gomel', zh: '戈梅利' }, country: { ru: 'Беларусь', en: 'Belarus', zh: '白俄罗斯' },
    welcome: { ru: 'Добро пожаловать из Гомеля! Нижний — город на двух реках, начните с набережных и кремля.', en: 'Welcome from Gomel! Nizhny is a city on two rivers — start with the embankments and the Kremlin.', zh: '欢迎来自戈梅利的朋友！下诺夫哥罗德是两河之城，不妨从滨河路和克里姆林宫开始。' },
    compare: [
      { topic: { ru: 'Река', en: 'River', zh: '河流' }, yours: { ru: 'Сож', en: 'Sozh', zh: '索日河' }, ours: { ru: 'Волга и Ока', en: 'Volga and Oka', zh: '伏尔加河与奥卡河' } },
    ],
  },
  {
    id: 'vitebsk', flag: '🇧🇾', lat: 55.1904, lon: 30.2049, defaultLang: 'ru', source: 'https://admgor.nnov.ru/news/29716',
    name: { ru: 'Витебск', en: 'Vitebsk', zh: '维捷布斯克' }, country: { ru: 'Беларусь', en: 'Belarus', zh: '白俄罗斯' },
    welcome: { ru: 'Добро пожаловать из Витебска! Покажем Нижний глазами гостя.', en: 'Welcome from Vitebsk! See Nizhny through a guest’s eyes.', zh: '欢迎来自维捷布斯克的朋友！让我们以客人的视角看下诺夫哥罗德。' },
    compare: [
      { topic: { ru: 'Река', en: 'River', zh: '河流' }, yours: { ru: 'Западная Двина', en: 'Western Dvina', zh: '西德维纳河' }, ours: { ru: 'Волга и Ока', en: 'Volga and Oka', zh: '伏尔加河与奥卡河' } },
    ],
  },
  {
    id: 'sukhum', flag: '', lat: 43.0015, lon: 41.0234, defaultLang: 'ru', source: 'https://admgor.nnov.ru/news/26374',
    name: { ru: 'Сухум', en: 'Sukhum', zh: '苏呼米' }, country: { ru: 'Абхазия', en: 'Abkhazia', zh: '阿布哈兹' },
    welcome: { ru: 'Добро пожаловать из Сухума! Приятной прогулки по Нижнему.', en: 'Welcome from Sukhum! Enjoy your walk through Nizhny.', zh: '欢迎来自苏呼米的朋友！祝您在下诺夫哥罗德游览愉快。' },
    compare: [
      { topic: { ru: 'Вода', en: 'Water', zh: '水域' }, yours: { ru: 'Чёрное море', en: 'Black Sea', zh: '黑海' }, ours: { ru: 'Волга и Ока', en: 'Volga and Oka', zh: '伏尔加河与奥卡河' } },
    ],
  },
];
