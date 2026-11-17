import type { L10n } from '../core/i18n';
import { photoCredits } from './places';

/**
 * "Then / now" spots. Old photos come ONLY from Wikimedia Commons items tagged Public domain (checked via the Commons
 * API on 2026-11-16, see `credit`). Modern photos are the CC-BY-SA / CC0 images already used in the source prototype
 * (see photoCredits.json) plus one Commons CC BY-SA image. Licences are quoted as Commons states them — re-verify before
 * commercial use. Add a new spot: put two images in public/history, append an object below.
 */
export interface Credit { author: string; license: string; licenseUrl?: string; sourceUrl: string; note?: string }
export interface ThenPhoto { id: string; src: string; year: number | null; yearLabel: L10n; credit: Credit }
export interface HistorySpot {
  id: string; placeId: string; title: L10n;
  then: ThenPhoto[];
  now: { src: string; credit: Credit };
  story: L10n; angleNote?: L10n;
  /** correct answer for the "guess the year" mode (null => not used in the game) */
  guessYear: number | null; guessExact: boolean;
}

const B = import.meta.env.BASE_URL;
const commons = (file: string) => 'https://commons.wikimedia.org/wiki/File:' + file;
const nowCredit = (id: string): Credit => {
  const c = photoCredits[id];
  return { author: c.author, license: c.license, licenseUrl: c.licenseUrl, sourceUrl: c.sourceUrl };
};
const DMITRIEV = 'Maxim Dmitriev (1858–1948)';

export const HISTORY: HistorySpot[] = [
  {
    id: 'dmitrievskaya', placeId: 'dmitriev', guessYear: 1913, guessExact: true,
    title: { ru: 'Дмитриевская башня', en: 'Dmitrievskaya Tower', zh: '季米特里塔' },
    then: [
      { id: 'd1913', src: B + 'history/dmitriev-1913.jpg', year: 1913, yearLabel: { ru: '1913', en: '1913', zh: '1913年' },
        credit: { author: DMITRIEV + ' (as stated on Commons)', license: 'Public domain', sourceUrl: commons('Dmitrievskaya_tower_1913.jpg'), note: 'Postcard' } },
      { id: 'dpre', src: B + 'history/dmitriev-pre1895.jpg', year: null, yearLabel: { ru: 'до 1895', en: 'before 1895', zh: '1895年以前' },
        credit: { author: DMITRIEV + ' (as stated on Commons)', license: 'Public domain', sourceUrl: commons('Nizhny_Novgorod_Dmitrovskaya_Tower_pre-1895.jpg') } },
    ],
    now: { src: B + 'places/dmitriev.jpg', credit: nowCredit('dmitriev') },
    story: {
      ru: 'До 1895 года башня выглядела гладкой и приземистой (вторая вкладка). Нынешний облик в русском стиле сложился в 1895-м, а с 1896 по 1919 год в башне работал Художественный музей — об этом подпись к фото 1913 года на Commons.',
      en: 'Before 1895 the tower looked plain and squat (second tab). Its current Russian-style look took shape in 1895, and from 1896 to 1919 the tower housed the Art Museum — as stated in the Commons description of the 1913 photo.',
      zh: '1895年以前，这座塔看上去朴素而低矮（第二个标签）。现今的俄式外观形成于1895年；1896至1919年塔内设有艺术博物馆——见维基共享资源上1913年照片的说明。',
    },
  },
  {
    id: 'pokrovskaya', placeId: 'pokrovskaya', guessYear: 1913, guessExact: true,
    title: { ru: 'Большая Покровская', en: 'Bolshaya Pokrovskaya', zh: '大波克罗夫卡街' },
    then: [
      { id: 'p1913', src: B + 'history/pokrovskaya-1913.jpg', year: 1913, yearLabel: { ru: '1913', en: '1913', zh: '1913年' },
        credit: { author: DMITRIEV + ' (as stated on Commons)', license: 'Public domain', sourceUrl: commons('Bolshaya_Pokrovskaya_St_1913.jpg'), note: 'Postcard' } },
    ],
    now: { src: B + 'places/pokrovskaya.jpg', credit: nowCredit('pokrovskaya') },
    story: {
      ru: 'На открытке 1913 года по улице идёт трамвай, а над крышами видны колокольня и купол церкви. Сегодня это главная пешеходная улица центра. Ракурс на фото немного отличается.',
      en: 'On the 1913 postcard a tram runs down the street, with a bell tower and a church dome above the roofs. Today it is the main pedestrian street of the centre. The two shots are taken from slightly different angles.',
      zh: '1913年的明信片上，街上有一辆有轨电车，屋顶之上可见钟楼和教堂圆顶。如今这里是市中心的主要步行街。两张照片的拍摄角度略有不同。',
    },
  },
  {
    id: 'fair', placeId: 'fair', guessYear: null, guessExact: false,
    title: { ru: 'Главный ярмарочный дом', en: 'Main Fair House', zh: '集市主楼' },
    then: [
      { id: 'fold', src: B + 'history/fair-old.jpg', year: null, yearLabel: { ru: 'до 1944', en: 'before 1944', zh: '1944年以前' },
        credit: { author: 'Unknown author', license: 'Public domain', sourceUrl: commons('Нижний_Новгород_Нижегородская_ярмарка_главный_дом_8.jpg'), note: 'Postcard' } },
    ],
    now: { src: B + 'places/fair.jpg', credit: nowCredit('fair') },
    story: {
      ru: 'Открытка «Нижегородская ярмарка. Главный дом»: у здания лавки, на вывеске справа — «Игрушки». Сегодня перед домом — общественное пространство, а закат подсвечивает фасад. Ракурс почти совпадает.',
      en: 'The postcard “Nizhny Novgorod Fair. Main House” shows shops by the building, with a “Toys” sign on the right. Today the area in front is a public space and sunset light warms the façade. The angle is nearly the same.',
      zh: '明信片“下诺夫哥罗德集市·主楼”上，楼旁有店铺，右侧招牌写着“玩具”。如今楼前是公共空间，夕阳映照着立面。两张照片的角度几乎一致。',
    },
  },
  {
    id: 'shukhov', placeId: 'warehouses', guessYear: 1896, guessExact: true,
    title: { ru: 'Выставка 1896 года → Стрелка', en: 'The 1896 exhibition → the Strelka', zh: '1896年博览会 → 斯特列尔卡' },
    then: [
      { id: 's1896', src: B + 'history/shukhov-1896.jpg', year: 1896, yearLabel: { ru: '1896', en: '1896', zh: '1896年' },
        credit: { author: DMITRIEV + ' (as stated on Commons)', license: 'Public domain', sourceUrl: commons('Shukhov_Hyperboloid_Tower_in_Nizhniy_Novgorod_1896.jpg') } },
    ],
    now: { src: B + 'history/pakgauzy-now.jpg', credit: { author: 'Olga-lisenkova', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', sourceUrl: commons('Пакгаузы_на_Стрелке,_вид_с_воды.jpg') } },
    story: {
      ru: 'Фото 1896 года: гиперболоидная башня Шухова на фоне главного павильона Всероссийской выставки. Ажурные металлические пакгаузы на Стрелке сохранились от павильонов той выставки — сегодня это выставочные пространства. Это не тот же ракурс и не та же точка, а перекличка эпох.',
      en: 'A 1896 photo: Shukhov’s hyperboloid tower in front of the main pavilion of the All-Russian Exhibition. The lattice-steel warehouses on the Strelka survive from that exhibition’s pavilions and are now exhibition spaces. The shots are not from the same spot — it is an echo between eras.',
      zh: '1896年的照片：舒霍夫双曲面塔立于全俄博览会主展馆前。斯特列尔卡上的镂空钢结构货栈保留自那次博览会的展馆，如今是展览空间。两张照片并非同一地点，而是两个时代的呼应。',
    },
  },
  {
    id: 'gymnasium', placeId: 'school', guessYear: 1900, guessExact: false,
    title: { ru: 'Губернская гимназия', en: 'The provincial gymnasium', zh: '省立中学' },
    then: [
      { id: 'g1900', src: B + photoCredits.school.src, year: 1900, yearLabel: { ru: 'около 1900', en: 'c. 1900', zh: '约1900年' },
        credit: { author: photoCredits.school.author, license: photoCredits.school.license, sourceUrl: photoCredits.school.sourceUrl, note: 'Date as given by Commons: 1900s' } },
    ],
    now: { src: B + 'places/minin.jpg', credit: nowCredit('minin') },
    story: {
      ru: 'Фото Василия Зеведе (ок. 1900), подпись на Commons — «губернская гимназия, Благовещенская площадь», зимой. Мы сопоставили его с Гимназией № 1 у площади Минина и Пожарского (по справочнику прототипа; точное совпадение здания стоит проверить краеведам). На современном снимке видна Дмитриевская башня, гимназия — вдали. Ракурс другой.',
      en: 'A photo by Vasily Zeveke (c. 1900) captioned on Commons “provincial gymnasium, Blagoveshchenskaya Square”, in winter. We matched it to Gymnasium No. 1 by Minin and Pozharsky Square (per the prototype’s place list; local historians should confirm the exact building). The modern shot shows the Dmitrievskaya Tower, with the gymnasium in the distance. The angle differs.',
      zh: '瓦西里·泽韦克拍摄的冬日照片（约1900年），维基共享资源标题为“省立中学，布拉戈维申斯卡娅广场”。我们将其对应到米宁和波扎尔斯基广场旁的第一中学（依据原型的地点清单，具体建筑请本地史学者核实）。现代照片中可见季米特里塔，中学在远处。拍摄角度不同。',
    },
  },
];
