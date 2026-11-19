import type { L10n } from '../core/i18n';
import archive from './archiveCredits.json' with { type:'json' };
import { photoCredits } from './places.ts';
import { catalogExtra } from './historyCatalogExtra.ts';
import { catalogA } from './historyCatalogA.ts';
import { catalogB } from './historyCatalogB.ts';
import { catalogC } from './historyCatalogC.ts';
import { cathedralFrames } from './cathedralFrames.ts';
import { cityFrames } from './cityFrames.ts';
import { riverFrames, gymNow } from './riverFrames.ts';

export interface Credit { author: string; license: string; licenseUrl?: string; sourceUrl: string; note?: string }
export interface ThenPhoto { id: string; src: string; year: number | null; yearLabel: L10n; caption: L10n; generated?: boolean; credit: Credit }
export interface HistorySpot {
  id: string; placeId: string; title: L10n;
  then: ThenPhoto[];
  now: { src: string; year: number; caption: L10n; credit: Credit; generated?: boolean };
  point?: { lat: number; lon: number };
  story?: L10n; angleNote?: L10n;
  /** correct answer for the "guess the year" mode (null => not used in the game) */
  guessYear: number | null; guessExact: boolean;
}

const B = import.meta.env?.BASE_URL || './';
const commons = (file: string) => 'https://commons.wikimedia.org/wiki/File:' + file;
const nowCredit = (id: string): Credit => {
  const c = photoCredits[id];
  return { author: c.author, license: c.license, licenseUrl: c.licenseUrl, sourceUrl: c.sourceUrl };
};
const DMITRIEV = 'Maxim Dmitriev (1858–1948)';

export const HISTORY: HistorySpot[] = [
  {
    id:'pechersky',placeId:'monastery',point:{lat:56.32312,lon:44.04944},guessYear:null,guessExact:false,
    title:{ru:'Вознесенский собор',en:'Ascension Cathedral',zh:'升天大教堂'},
    then:[...cathedralFrames, {id:'pechersky-1900',src:B+archive['pechersky-1900'].src,year:null,yearLabel:{ru:'1890–1910',en:'1890–1910',zh:'1890–1910'},caption: {
          ru: "Максим Дмитриев снял собор со стороны крыльца. Слева к пятиглавому храму примыкает колокольня.",
          en: "Maxim Dmitriev photographed the cathedral from the porch side. The bell tower adjoins the five-domed church on the left.",
          zh: "马克西姆·德米特里耶夫从门廊一侧拍摄了大教堂。钟楼紧邻五圆顶教堂的左侧。",
        },
        credit:archive['pechersky-1900']}],
    now: { year: 2025, caption: {
          ru: "Вознесенский собор Печерского монастыря в октябре 2025 года. Над стенами по-прежнему поднимаются пять глав.",
          en: "The Ascension Cathedral of Pechersky Monastery in October 2025, with its five domes above the walls.",
          zh: "2025年10月，佩切尔斯基修道院升天大教堂的五座圆顶依然高耸。",
        },
      src:B+archive['pechersky-2025'].src,credit:archive['pechersky-2025']},
    story:{ru:'Белокаменный нижний этаж стал основанием пятиглавого храма. По ходу строительства к собору добавили трапезную и широкое северное крыльцо, к которому примкнула колокольня.',
      en:'A white limestone base supports the five-domed church. During construction, the builders added a refectory and a broad north porch adjoining the bell tower.',
      zh:'白色石灰岩砌成的底层支撑着五圆顶教堂。建造过程中，工匠增建了食堂和宽阔的北门廊，钟楼与门廊相连。'},
  },
  {
    id:'stadium', placeId:'stadium', guessYear:null, guessExact:false,
    title:{ru:'Стадион на Стрелке',en:'Stadium at the Strelka',zh:'斯特列尔卡体育场'},
    then:[
      {id:'stadium-2016',src:B+archive['stadium-2016'].src,year:2016,yearLabel:{ru:'2016',en:'2016',zh:'2016年'},caption: {
          ru: "Над строительной площадкой на Стрелке стоят краны. Уже видны бетонные ярусы будущих трибун.",
          en: "Cranes stand over the construction site at the Strelka. The concrete tiers of the stands are taking shape.",
          zh: "斯特列尔卡的工地上吊车林立，看台的混凝土结构已初具规模。",
        },
        credit:archive['stadium-2016']},
      ...riverFrames.stadium,
      {id:'stadium-2018',src:B+archive['stadium-2018'].src,year:2018,yearLabel:{ru:'май 2018',en:'May 2018',zh:'2018年5月'},caption: {
          ru: "В мае 2018 года поле уже готово к игре. Над заполненными трибунами видно кольцо крыши.",
          en: "By May 2018 the pitch was ready for play, and the roof ring sheltered the crowded stands.",
          zh: "到2018年5月，球场已投入使用，环形屋顶下的看台上坐满了观众。",
        },
        credit:archive['stadium-2018']},
    ],
    now: { year: 2024, caption: {
          ru: "Стадион на панораме Стрелки в июне 2024 года, через шесть лет после открытия.",
          en: "A panorama of the stadium at the Strelka in June 2024, six years after it opened.",
          zh: "2024年6月斯特列尔卡体育场全景，距开放已有六年。",
        },
      src:B+archive['stadium-2024'].src,credit:archive['stadium-2024']},
    story: {
          ru: "Стадион построили на Стрелке, где Ока впадает в Волгу. В 2018 году здесь прошли матчи чемпионата мира по футболу.",
          en: "The stadium stands at the confluence of the Oka and Volga. It hosted football World Cup matches in 2018.",
          zh: "体育场建在奥卡河与伏尔加河的交汇处，曾举办2018年世界杯足球赛。",
        },
  },
  {
    id: 'dmitrievskaya', placeId: 'dmitriev', guessYear: 1913, guessExact: true,
    title: { ru: 'Дмитриевская башня', en: 'Dmitrievskaya Tower', zh: '季米特里塔' },
    then: [
      { id: 'dpre', src: B + 'history/dmitriev-pre1895.jpg', year: null, yearLabel: { ru: 'до 1895', en: 'before 1895', zh: '1895年以前' },
        caption: {
          ru: "До перестройки башня была ниже. Её прямоугольный верх ещё лишён высокого шатра.",
          en: "Before the rebuilding, the tower was lower, with a plain rectangular top and no tall tented roof.",
          zh: "改建前的塔楼较低，方形的塔身尚无高耸的帐篷形屋顶。",
        },
        credit: { author: DMITRIEV, license: 'Public domain', sourceUrl: commons('Nizhny_Novgorod_Dmitrovskaya_Tower_pre-1895.jpg') } },
      ...cityFrames.dmitrievskaya,
      { id: 'd1913', src: B + 'history/dmitriev-1913.jpg', year: 1913, yearLabel: { ru: '1913', en: '1913', zh: '1913年' },
        caption: {
          ru: "На открытке башню уже венчает высокий шатёр. В это время внутри работал художественный музей.",
          en: "The postcard shows the tower with its tall tented roof. It housed an art museum at the time.",
          zh: "明信片上的塔楼已有高耸的帐篷形屋顶。当时塔内设有美术馆。",
        },
        credit: { author: DMITRIEV, license: 'Public domain', sourceUrl: commons('Dmitrievskaya_tower_1913.jpg'), note: 'Postcard' } },
    ],
    now: { year: 2022, caption: {
          ru: "Дмитриевская башня со стороны площади Минина и Пожарского. Над воротами сохранился высокий шатёр.",
          en: "Dmitrievskaya Tower seen from Minin and Pozharsky Square, with the tall roof still rising above its gate.",
          zh: "从米宁和波扎尔斯基广场望去，季米特里塔的大门上方依然耸立着高高的帐篷形屋顶。",
        },
      src: B + 'places/dmitriev.jpg', credit: nowCredit('dmitriev') },
    story: {
      ru: 'До 1895 года башня выглядела гладкой и приземистой. Нынешний облик в русском стиле сложился в 1895-м, а с 1896 по 1919 год в башне работал Художественный музей — об этом подпись к фото 1913 года на Commons.',
      en: 'Before 1895 the tower looked plain and squat. Its current Russian-style look took shape in 1895, and from 1896 to 1919 the tower housed the Art Museum — as stated in the Commons description of the 1913 photo.',
      zh: '1895年以前，这座塔看上去朴素而低矮。现今的俄式外观形成于1895年；1896至1919年塔内设有艺术博物馆——见维基共享资源上1913年照片的说明。',
    },
  },
  {
    id: 'pokrovskaya', placeId: 'pokrovskaya', guessYear: 1913, guessExact: true,
    title: { ru: 'Большая Покровская', en: 'Bolshaya Pokrovskaya', zh: '大波克罗夫卡街' },
    then: [
      cityFrames.pokrovskaya[0],
      { id: 'p1913', src: B + 'history/pokrovskaya-1913.jpg', year: 1913, yearLabel: { ru: '1913', en: '1913', zh: '1913年' },
        caption: {
          ru: "По Большой Покровской проходит трамвай. Над крышами домов возвышается колокольня.",
          en: "A tram runs along Bolshaya Pokrovskaya, with a bell tower rising above the rooftops.",
          zh: "有轨电车驶过大波克罗夫卡街，钟楼高出沿街的屋顶。",
        },
        credit: { author: DMITRIEV, license: 'Public domain', sourceUrl: commons('Bolshaya_Pokrovskaya_St_1913.jpg'), note: 'Postcard' } },
      cityFrames.pokrovskaya[1],
    ],
    now: { year: 2024, caption: {
          ru: "Пешеходная Большая Покровская летом 2024 года. Вдали, в конце улицы, виден кремль.",
          en: "The pedestrianised street in summer 2024, looking north towards the Kremlin.",
          zh: "2024年夏天，从步行街向北望去，尽头可见克里姆林宫。",
        },
      src: B + 'places/pokrovskaya.jpg', credit: nowCredit('pokrovskaya') },
    story: {
      ru: 'На открытке 1913 года по улице идёт трамвай, а над крышами видны колокольня и купол церкви. Сегодня это главная пешеходная улица центра.',
      en: 'On the 1913 postcard a tram runs down the street, with a bell tower and a church dome above the roofs. Today it is the main pedestrian street of the centre.',
      zh: '1913年的明信片上，街上有一辆有轨电车，屋顶之上可见钟楼和教堂圆顶。如今这里是市中心的主要步行街。',
    },
  },
  {
    id: 'fair', placeId: 'fair', guessYear: null, guessExact: false,
    title: { ru: 'Главный ярмарочный дом', en: 'Main Fair House', zh: '集市主楼' },
    then: [
      cityFrames.fair[0],
      { id: 'fold', src: B + 'history/fair-old.jpg', year: null, yearLabel: { ru: 'до 1944', en: 'before 1944', zh: '1944年以前' },
        caption: {
          ru: "На открытке перед фасадом нового ярмарочного дома тянется ряд лавок. Справа видна вывеска «Игрушки».",
          en: "On the postcard, stalls line the front of the new fair building. A sign on the right advertises toys.",
          zh: "明信片上，新集市大楼前排列着一排商铺，右侧的招牌上写着“玩具”。",
        },
        credit: { author: 'Unknown author', license: 'Public domain', sourceUrl: commons('Нижний_Новгород_Нижегородская_ярмарка_главный_дом_8.jpg'), note: 'Postcard' } },
      cityFrames.fair[1],
    ],
    now: { year: 2022, caption: {
          ru: "Закатный свет отражается в окнах Главного ярмарочного дома и в воде на площади перед фасадом.",
          en: "Sunset light reflects in the windows of the Main Fair House and in the water on the square in front.",
          zh: "夕阳倒映在集市主楼的窗户上，也映在楼前广场的积水中。",
        },
      src: B + 'places/fair.jpg', credit: nowCredit('fair') },
    story: {
      ru: 'Открытка «Нижегородская ярмарка. Главный дом»: у здания лавки, на вывеске справа — «Игрушки». Сегодня перед домом — общественное пространство, а закат подсвечивает фасад. Ракурс почти совпадает.',
      en: 'The postcard “Nizhny Novgorod Fair. Main House” shows shops by the building, with a “Toys” sign on the right. Today the area in front is a public space and sunset light warms the façade. The angle is nearly the same.',
      zh: '明信片“下诺夫哥罗德集市·主楼”上，楼旁有店铺，右侧招牌写着“玩具”。如今楼前是公共空间，夕阳映照着立面。两张照片的角度几乎一致。',
    },
  },
  {
    id: 'shukhov', placeId: 'warehouses', guessYear: 1896, guessExact: true,
    title: { ru: 'Пакгаузы на Стрелке', en: 'The Strelka warehouses', zh: '斯特列尔卡仓库' },
    then: riverFrames.shukhov,
    now: {
      src: B + 'history/pakgauzy-now.jpg', year: 2024,
      caption: {
        ru: 'Пакгаузы с воды. За ажурными фермами видны купола собора Александра Невского.',
        en: 'The warehouses seen from the river, with Alexander Nevsky Cathedral rising behind the latticework.',
        zh: '从河面望去，仓库的镂空金属结构后面可见亚历山大·涅夫斯基大教堂。',
      },
      credit: { author: 'Olga-lisenkova', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', sourceUrl: commons('Пакгаузы_на_Стрелке,_вид_с_воды.jpg') },
    },
    story: {
      ru: 'Металлический каркас выставочного павильона перевезли из Москвы в Нижний Новгород. Позднее его секции стали частью портовых складов на Стрелке.',
      en: 'The exhibition pavilion’s steel frame travelled from Moscow to Nizhny Novgorod. Sections of it later became part of the port warehouses at the Strelka.',
      zh: '展馆的金属框架从莫斯科迁至下诺夫哥罗德，其中部分结构后来成为斯特列尔卡港口仓库的一部分。',
    },
  },
  {
    id: 'gymnasium', placeId: 'minin', point: { lat: 56.326172, lon: 44.008839 }, guessYear: 1900, guessExact: false,
    title: { ru: 'Губернская гимназия', en: 'The provincial gymnasium', zh: '省立中学' },
    then: [
      riverFrames.gymnasium[0],
      { id: 'g1900', src: B + photoCredits.school.src, year: 1900, yearLabel: { ru: 'около 1900', en: 'c. 1900', zh: '约1900年' },
        caption: {
          ru: "Гимназия на зимнем снимке Василия Зевеке. Её длинный фасад выходит на заснеженную Благовещенскую площадь.",
          en: "Vasily Zeveke photographed the gymnasium in winter. Its long façade faces the snow-covered Blagoveshchenskaya Square.",
          zh: "瓦西里·泽韦克在冬天拍下这座中学。教学楼的长立面朝向白雪覆盖的报喜广场。",
        },
        credit: { author: photoCredits.school.author, license: photoCredits.school.license, sourceUrl: photoCredits.school.sourceUrl, note: 'Date as given by Commons: 1900s' } },
      riverFrames.gymnasium[1],
    ],
    now: gymNow,
    story: {
          ru: "Главный корпус Мининского университета на улице Ульянова, 1 занимает здание бывшей губернской гимназии. На старых фотографиях видно, как менялась его высота.",
          en: "Minin University’s main building at 1 Ulyanova Street occupies the former provincial gymnasium. The photographs show how its height changed over time.",
          zh: "米宁大学位于乌里扬诺夫街1号的主楼曾是省立中学。历年的照片展示了这座建筑高度的变化。",
        },
  },
  ...catalogExtra,
  ...catalogA,
  ...catalogB,
  ...catalogC,
];

export function historyForPlace(id: string) {
  return HISTORY.find(spot => spot.id === 'place-' + id) ?? HISTORY.find(spot => spot.placeId === id);
}
