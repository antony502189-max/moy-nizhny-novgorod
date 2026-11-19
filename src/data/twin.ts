import type { L10n } from '../core/i18n';

export type CityRelationship = 'sister' | 'partner';

export interface TwinCity {
  id: string;
  name: L10n;
  area: L10n;
  relationship: CityRelationship;
  since?: number;
  source: string;
  relatedAgreement?: { text: L10n; source: string };
}

export const SISTER_CITY_REGISTER = 'https://admgor.nnov.ru/Gostyam/Goroda-pobratimy';
export const CITY_PROGRAMME = 'https://base.garant.ru/36669977/';

const areas = {
  BY: { ru: "Беларусь", en: "Belarus", zh: "白俄罗斯" },
  BA: { ru: "Республика Сербская, Босния и Герцеговина", en: "Republika Srpska, Bosnia and Herzegovina", zh: "塞族共和国，波斯尼亚和黑塞哥维那" },
  CN: { ru: "Китай", en: "China", zh: "中国" },
  CG: { ru: "Республика Конго", en: "Republic of the Congo", zh: "刚果共和国" },
  CR: { ru: "Коста-Рика", en: "Costa Rica", zh: "哥斯达黎加" },
  CU: { ru: "Куба", en: "Cuba", zh: "古巴" },
  IR: { ru: "Иран", en: "Iran", zh: "伊朗" },
  KG: { ru: "Кыргызстан", en: "Kyrgyzstan", zh: "吉尔吉斯斯坦" },
  KR: { ru: "Республика Корея", en: "South Korea", zh: "韩国" },
  RS: { ru: "Сербия", en: "Serbia", zh: "塞尔维亚" },
  US: { ru: "США", en: "United States", zh: "美国" },
  UZ: { ru: "Узбекистан", en: "Uzbekistan", zh: "乌兹别克斯坦" },
  AB: { ru: "Абхазия", en: "Abkhazia", zh: "阿布哈兹" },
  PM: { ru: "Приднестровье, Молдова", en: "Transnistria, Moldova", zh: "德涅斯特河沿岸，摩尔多瓦" },
  RU: { ru: "Россия", en: "Russia", zh: "俄罗斯" },
  LU: { ru: "Луганская область", en: "Luhansk region", zh: "卢甘斯克地区" },
} satisfies Record<string, L10n>;

export const TWINS: TwinCity[] = [
  { id: 'banja-luka', name: { ru: "Баня-Лука", en: "Banja Luka", zh: "巴尼亚卢卡" }, area: areas.BA,
    relationship: 'sister', since: 2021, source: 'https://www.gordumannov.ru/?id=116833' },
  { id: 'bender', name: { ru: "Бендеры", en: "Bender", zh: "本德尔" }, area: areas.PM,
    relationship: 'partner', since: 2025, source: 'https://www.gordumannov.ru/?id=182954' },
  { id: 'bishkek', name: { ru: "Бишкек", en: "Bishkek", zh: "比什凯克" }, area: areas.KG,
    relationship: 'sister', since: 2026, source: 'https://www.bishkek.gov.kg/ru/post/34185' },
  { id: 'brazzaville', name: { ru: "Браззавиль", en: "Brazzaville", zh: "布拉柴维尔" }, area: areas.CG,
    relationship: 'sister', since: 2023, source: SISTER_CITY_REGISTER },
  { id: 'bukhara', name: { ru: "Бухара", en: "Bukhara", zh: "布哈拉" }, area: areas.UZ,
    relationship: 'sister', since: 2022, source: 'https://www.gordumannov.ru/?id=136528' },
  { id: 'vitebsk', name: { ru: "Витебск", en: "Vitebsk", zh: "维捷布斯克" }, area: areas.BY,
    relationship: 'partner', since: 2025, source: 'https://admgor.nnov.ru/news/29393' },
  { id: 'east-sarajevo', name: { ru: "Восточное Сараево", en: "East Sarajevo", zh: "东萨拉热窝" }, area: areas.BA,
    relationship: 'sister', since: 2025, source: 'https://admgor.nnov.ru/news/29393' },
  { id: 'gomel', name: { ru: "Гомель", en: "Gomel", zh: "戈梅利" }, area: areas.BY,
    relationship: 'sister', since: 2025, source: 'https://admgor.nnov.ru/news/28990' },
  { id: 'derbent', name: { ru: "Дербент", en: "Derbent", zh: "杰尔宾特" }, area: areas.RU,
    relationship: 'partner', since: 2024, source: 'https://www.gordumannov.ru/?id=171377' },
  { id: 'kerman', name: { ru: "Керман", en: "Kerman", zh: "克尔曼" }, area: areas.IR,
    relationship: 'partner', since: 2025, source: 'https://admgor.nnov.ru/news/29393' },
  { id: 'kostroma', name: { ru: "Кострома", en: "Kostroma", zh: "科斯特罗马" }, area: areas.RU,
    relationship: 'partner', source: 'https://invest-kostroma.ru/o-regione/vneshneekonomicheskaya-deyatelnost/mezhregionalnoe-sotrudnichestvo/sotrudnichestvo-s-subektami-rossiyskoy-federatsii/' },
  { id: 'luhansk', name: { ru: "Луганск", en: "Luhansk", zh: "卢甘斯克" }, area: areas.LU,
    relationship: 'partner', since: 2023, source: 'https://www.gordumannov.ru/?id=158220' },
  { id: 'matanzas', name: { ru: "Матансас", en: "Matanzas", zh: "马坦萨斯" }, area: areas.CU,
    relationship: 'sister', since: 2004, source: SISTER_CITY_REGISTER },
  { id: 'minsk', name: { ru: "Минск", en: "Minsk", zh: "明斯克" }, area: areas.BY,
    relationship: 'sister', since: 2007, source: SISTER_CITY_REGISTER,
    relatedAgreement: {
      text: {
        ru: 'В 2017 году города подписали соглашение о побратимских отношениях и сотрудничестве.',
        en: 'The cities signed a twinning and cooperation agreement in 2017.',
        zh: '两市于2017年签署友好城市关系与合作协议。',
      },
      source: 'https://book-hall.ru/files/den-goroda/001/DG_32%20%281196%29.pdf',
    },
  },
  { id: 'novi-sad', name: { ru: "Нови-Сад", en: "Novi Sad", zh: "诺维萨德" }, area: areas.RS,
    relationship: 'sister', since: 2006, source: 'https://www.gordumannov.ru/?id=171377' },
  { id: 'novopolotsk', name: { ru: "Новополоцк", en: "Novopolotsk", zh: "新波洛茨克" }, area: areas.BY,
    relationship: 'sister', since: 2026, source: CITY_PROGRAMME },
  { id: 'san-jose', name: { ru: "Сан-Хосе", en: "San José", zh: "圣何塞" }, area: areas.CR,
    relationship: 'sister', since: 2021, source: 'https://www.gordumannov.ru/?id=116833' },
  { id: 'suwon', name: { ru: "Сувон", en: "Suwon", zh: "水原" }, area: areas.KR,
    relationship: 'sister', since: 2005, source: SISTER_CITY_REGISTER },
  { id: 'sukhum', name: { ru: "Сухум", en: "Sukhum", zh: "苏呼米" }, area: areas.AB,
    relationship: 'sister', since: 2011, source: SISTER_CITY_REGISTER,
    relatedAgreement: {
      text: {
        ru: 'В перечне Нижнего Новгорода указано соглашение 2011 года. Администрация Сухума сообщает о подписании соглашения о побратимстве в сентябре 2024 года.',
        en: 'Nizhny Novgorod’s directory records a 2011 agreement. Sukhum’s administration reports that a twinning agreement was signed in September 2024.',
        zh: '下诺夫哥罗德市名录记载了2011年的协议。苏呼米市政府称，两市于2024年9月签署了友好城市协议。',
      },
      source: 'https://g.sukhumcity.ru/index.php/novosti/item/3873-glava-administratsii-sukhuma-timur-agrba-prinyal-delegatsiyu-iz-nizhnego-novgoroda',
    },
  },
  { id: 'wuxi', name: { ru: "Уси", en: "Wuxi", zh: "无锡" }, area: areas.CN,
    relationship: 'sister', since: 2026, source: 'https://en.wuxi.gov.cn/2026-08/26/c_1208467.htm' },
  { id: 'philadelphia', name: { ru: "Филадельфия", en: "Philadelphia", zh: "费城" }, area: areas.US,
    relationship: 'sister', since: 1992, source: SISTER_CITY_REGISTER },
  { id: 'harbin', name: { ru: "Харбин", en: "Harbin", zh: "哈尔滨" }, area: areas.CN,
    relationship: 'partner', source: CITY_PROGRAMME },
  { id: 'heihe', name: { ru: "Хэйхэ", en: "Heihe", zh: "黑河" }, area: areas.CN,
    relationship: 'partner', source: CITY_PROGRAMME },
  { id: 'hefei', name: { ru: "Хэфэй", en: "Hefei", zh: "合肥" }, area: areas.CN,
    relationship: 'sister', since: 2019, source: SISTER_CITY_REGISTER },
  { id: 'jinan', name: { ru: "Цзинань", en: "Jinan", zh: "济南" }, area: areas.CN,
    relationship: 'sister', since: 1994, source: SISTER_CITY_REGISTER },
  { id: 'zhuhai', name: { ru: "Чжухай", en: "Zhuhai", zh: "珠海" }, area: areas.CN,
    relationship: 'partner', source: CITY_PROGRAMME },
];
