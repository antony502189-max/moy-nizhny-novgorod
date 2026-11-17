import type { L10n } from '../core/i18n';
import credits from './photoCredits.json';

export type Tag = 'history' | 'view' | 'sunset' | 'walk' | 'art' | 'family' | 'architecture' | 'park' | 'religion' | 'water';
/** effort: 0 flat / easy, 1 some slope or stairs, 2 many steps or a steep climb */
export type Effort = 0 | 1 | 2;

export interface Place {
  id: string; lat: number; lon: number; name: L10n; blurb: L10n;
  tags: Tag[]; minutes: number; effort: Effort;
  /** official website, only where verified in the source prototype's data; otherwise undefined => "verify on site" */
  site?: string; tip?: L10n; photo?: string;
  /** sunset-viewpoint candidate note (curated; to be checked on site) */
  sunset?: L10n;
  source: string;
}

export interface PhotoCredit { src: string; author: string; license: string; licenseUrl: string; sourceUrl: string; caption: string; historic: boolean }
export const photoCredits = credits as Record<string, PhotoCredit>;
export const photoUrl = (id: string) => (photoCredits[id] ? import.meta.env.BASE_URL + photoCredits[id].src : undefined);

const OSM = 'Coordinates: OpenStreetMap (via the source prototype); texts: team summary of public descriptions';

export const PLACES: Place[] = [
  {
    id: 'kremlin', lat: 56.3280332, lon: 44.0021054, tags: ['history', 'view', 'architecture'], minutes: 60, effort: 1,
    name: { ru: 'Нижегородский кремль', en: 'Nizhny Novgorod Kremlin', zh: '下诺夫哥罗德克里姆林宫' },
    blurb: {
      ru: 'Каменная крепость начала XVI века на высоком берегу у слияния Оки и Волги. Башни, стены, музеи и обзорные площадки.',
      en: 'Stone fortress of the early 16th century on the high bank where the Oka meets the Volga. Towers, walls, museums and viewpoints.',
      zh: '16世纪初的石砌要塞，坐落在奥卡河与伏尔加河交汇处的高岸上。有塔楼、城墙、博物馆和观景台。',
    },
    site: 'https://kremlnn.ru/', photo: 'kremlin', source: OSM,
    tip: { ru: 'Вход на территорию, музеи и прогулка по стене — разные варианты; правила и билеты проверяйте на сайте.', en: 'Entering the grounds, museums and the wall walk are separate options; check rules and tickets on the website.', zh: '进入园区、博物馆和城墙漫步是不同的选项；请在官网核实规则和门票。' },
  },
  {
    id: 'dmitriev', lat: 56.3270462, lon: 44.0056767, tags: ['history', 'architecture'], minutes: 15, effort: 0,
    name: { ru: 'Дмитриевская башня', en: 'Dmitrievskaya Tower', zh: '季米特里塔' },
    blurb: {
      ru: 'Главные ворота кремля со стороны площади Минина и Пожарского. Привычный облик в русском стиле сложился в 1895 году.',
      en: 'The Kremlin’s main gate facing Minin and Pozharsky Square. Its familiar Russian-style look took shape in 1895.',
      zh: '克里姆林宫的正门，面向米宁和波扎尔斯基广场。现今的俄式外观形成于1895年。',
    },
    site: 'https://kremlnn.ru/', photo: 'dmitriev', source: OSM,
  },
  {
    id: 'minin', lat: 56.3261338, lon: 44.0047027, tags: ['history', 'walk'], minutes: 10, effort: 0,
    name: { ru: 'Площадь Минина и Пожарского', en: 'Minin and Pozharsky Square', zh: '米宁和波扎尔斯基广场' },
    blurb: {
      ru: 'Площадь рядом с кремлём — удобное начало прогулки: отсюда идут к Дмитриевской башне.',
      en: 'The square next to the Kremlin is a natural start of a walk: from here you go on to the Dmitrievskaya Tower.',
      zh: '紧邻克里姆林宫的广场，是散步的理想起点，从这里走向季米特里塔。',
    },
    photo: 'minin', source: OSM,
    tip: { ru: 'Площадь пересекают дороги — пользуйтесь переходами.', en: 'Roads cross the square — use the pedestrian crossings.', zh: '广场被道路穿过，请走人行横道。' },
  },
  {
    id: 'viewpoint', lat: 56.3292784, lon: 44.0022819, tags: ['view', 'sunset', 'history'], minutes: 15, effort: 1,
    name: { ru: 'Смотровая площадка кремля', en: 'Kremlin viewing platform', zh: '克里姆林宫观景台' },
    blurb: {
      ru: 'Обзорная площадка на территории кремля над рекой.',
      en: 'A viewing platform inside the Kremlin grounds above the river.',
      zh: '位于克里姆林宫园区内、俯瞰河流的观景平台。',
    },
    site: 'https://kremlnn.ru/', source: OSM,
    sunset: { ru: 'Высокий берег над рекой; открытый вид на воду. Закатную сторону проверьте на месте.', en: 'High bank above the river with an open view over the water. Check the sunset side on site.', zh: '河上高岸，视野开阔。请到现场确认日落方向。' },
  },
  {
    id: 'chkalov', lat: 56.3304669, lon: 44.0094375, tags: ['history', 'view', 'sunset', 'architecture'], minutes: 30, effort: 2,
    name: { ru: 'Чкаловская лестница', en: 'Chkalov Stairs', zh: '契卡洛夫台阶' },
    blurb: {
      ru: 'Монументальная лестница в форме восьмёрки между Верхне- и Нижне-Волжской набережными, открыта 24 июля 1949 года. По описанию — 667 ступеней, две смотровые площадки.',
      en: 'A monumental figure-eight staircase between the Upper and Lower Volga embankments, opened on 24 July 1949. Described as 667 steps with two viewing platforms.',
      zh: '连接上、下伏尔加河滨河路的八字形大台阶，1949年7月24日落成。据介绍共667级，设有两个观景平台。',
    },
    photo: undefined, source: OSM,
    tip: { ru: 'Много ступеней и перепад высоты. С коляской выбирайте обход по улицам.', en: 'Many steps and a big height difference. With a stroller or wheelchair take the street detour.', zh: '台阶多、落差大。推婴儿车或轮椅请选择沿街绕行。' },
    sunset: { ru: 'Площадки на лестнице и верхняя смотровая у памятника Чкалову — вид на Волгу. Подъём займёт время.', en: 'The platforms on the stairs and the upper lookout by the Chkalov monument face the Volga. Allow time for the climb.', zh: '台阶上的平台和契卡洛夫纪念碑旁的上层观景台可远眺伏尔加河。请留出攀登时间。' },
  },
  {
    id: 'upper-volga', lat: 56.3295938, lon: 44.0114449, tags: ['walk', 'view', 'sunset'], minutes: 25, effort: 0,
    name: { ru: 'Верхне-Волжская набережная', en: 'Upper Volga Embankment', zh: '上伏尔加河滨河路' },
    blurb: {
      ru: 'Прогулочная набережная на верхней террасе над Волгой; под ней — Александровский сад.',
      en: 'A promenade on the upper terrace above the Volga; the Alexander Garden lies below it.',
      zh: '伏尔加河上方高台上的步行滨河路，其下是亚历山大花园。',
    },
    photo: 'upper-volga', source: OSM,
    sunset: { ru: 'Открытая терраса над рекой, лавочки и ровная дорожка.', en: 'An open terrace above the river with benches and a level path.', zh: '河上开阔的平台，有长椅和平整的步道。' },
  },
  {
    id: 'garden', lat: 56.3306514, lon: 44.0139569, tags: ['park', 'walk', 'family'], minutes: 30, effort: 1,
    name: { ru: 'Александровский сад и «Ракушка»', en: 'Alexander Garden and the “Rakushka” stage', zh: '亚历山大花园和“贝壳”露天舞台' },
    blurb: {
      ru: 'Сад под Верхне-Волжской набережной с летней сценой «Ракушка», где проходят концерты под открытым небом.',
      en: 'A garden below the Upper Volga Embankment with the “Rakushka” summer stage for open-air concerts.',
      zh: '位于上伏尔加河滨河路下方的花园，设有举办露天音乐会的“贝壳”夏季舞台。',
    },
    photo: 'garden', source: OSM,
    tip: { ru: 'Дорожки идут по склону; программу «Ракушки» уточняйте у организаторов.', en: 'Paths run along a slope; check the Rakushka programme with the organisers.', zh: '步道沿斜坡而行；“贝壳”舞台的节目请向主办方确认。' },
  },
  {
    id: 'lower-volga', lat: 56.3315917, lon: 44.0100288, tags: ['walk', 'view', 'sunset', 'architecture'], minutes: 40, effort: 0,
    name: { ru: 'Нижне-Волжская набережная', en: 'Lower Volga Embankment', zh: '下伏尔加河滨河路' },
    blurb: {
      ru: 'Одна из самых длинных набережных города вдоль Волги: речной вокзал, Чкаловская лестница, исторические здания.',
      en: 'One of the city’s longest embankments along the Volga: the river station, the Chkalov Stairs and historic buildings.',
      zh: '沿伏尔加河的城市最长滨河路之一：河运站、契卡洛夫台阶和历史建筑。',
    },
    photo: 'lower-volga', source: OSM,
    sunset: { ru: 'Ровная набережная у воды, ближе к реке, чем верхняя терраса.', en: 'A level waterside promenade, closer to the river than the upper terrace.', zh: '平坦的水边步道，比上层平台更靠近河水。' },
  },
  {
    id: 'deer', lat: 56.3320354, lon: 44.0121, tags: ['walk', 'family', 'history'], minutes: 10, effort: 0,
    name: { ru: 'Скульптура «Олень»', en: '“Deer” sculpture', zh: '“鹿”雕塑' },
    blurb: {
      ru: 'Скульптура венгерского художника Габора Миклоша Жокэ на Нижне-Волжской набережной — знак дружбы российского и венгерского народов. Олень есть и на гербе города.',
      en: 'A sculpture by the Hungarian artist Gábor Miklós Zsoke on the Lower Volga Embankment, a sign of friendship between the Russian and Hungarian peoples. The deer is also on the city’s coat of arms.',
      zh: '匈牙利艺术家加博尔·米克洛什·若凯创作的雕塑，立于下伏尔加河滨河路，象征俄匈两国人民的友谊。鹿也出现在城市的市徽上。',
    },
    source: OSM,
  },
  {
    id: 'mayak', lat: 56.3303607, lon: 43.9928699, tags: ['architecture', 'history'], minutes: 10, effort: 0,
    name: { ru: 'Торговый дом Рукавишникова («Маяк»)', en: 'Rukavishnikov Trading House (“Mayak”)', zh: '鲁卡维什尼科夫商号（“灯塔”厂）' },
    blurb: {
      ru: 'Здание на Нижне-Волжской набережной, 11 — бывшая фабрика «Маяк». Осмотреть фасад можно во время прогулки.',
      en: 'The building at Lower Volga Embankment 11 is the former “Mayak” factory. You can view the façade on the walk.',
      zh: '下伏尔加河滨河路11号的建筑，前“灯塔”工厂。散步时可欣赏其外立面。',
    },
    source: OSM,
  },
  {
    id: 'rozhdestvenskaya', lat: 56.3293651, lon: 43.9926478, tags: ['walk', 'architecture', 'history'], minutes: 25, effort: 0,
    name: { ru: 'Рождественская улица', en: 'Rozhdestvenskaya Street', zh: '罗日杰斯特文斯卡亚街' },
    blurb: {
      ru: 'Историческая улица в нижней части центра рядом с Волгой, удобно идти после набережной и фабрики «Маяк».',
      en: 'A historic street in the lower part of the centre near the Volga; a good continuation after the embankment and the Mayak building.',
      zh: '市中心下城靠近伏尔加河的历史街道，适合在滨河路和“灯塔”厂之后继续游览。',
    },
    photo: 'rozhdestvenskaya', source: OSM,
  },
  {
    id: 'fair', lat: 56.3288518, lon: 43.961701, tags: ['history', 'architecture', 'walk', 'sunset'], minutes: 30, effort: 0,
    name: { ru: 'Нижегородская ярмарка', en: 'Nizhny Novgorod Fair', zh: '下诺夫哥罗德集市' },
    blurb: {
      ru: 'Исторический торговый комплекс в Канавинском районе. Территория у Главного ярмарочного дома сегодня — общественное пространство.',
      en: 'A historic trade complex in the Kanavinsky district. The area by the Main Fair House is now a public space.',
      zh: '卡纳温区的历史商贸建筑群。主集市大楼前的区域如今是公共空间。',
    },
    photo: 'fair', source: OSM,
    sunset: { ru: 'Открытая площадь перед Главным ярмарочным домом; на фото — закатный свет.', en: 'An open square in front of the Main Fair House; the photo shows sunset light.', zh: '主集市大楼前的开阔广场；照片中是日落时分的光线。' },
  },
  {
    id: 'oka', lat: 56.3330427, lon: 43.9741635, tags: ['view', 'sunset', 'walk', 'water'], minutes: 30, effort: 0,
    name: { ru: 'Окская набережная и Стрелка', en: 'Oka Embankment and the Strelka', zh: '奥卡河滨河路与斯特列尔卡' },
    blurb: {
      ru: 'Пешеходное пространство на пути к Стрелке — месту слияния Оки и Волги. Пешеходный проход под Канавинским мостом ведёт к Ярмарке.',
      en: 'A pedestrian space on the way to the Strelka, where the Oka meets the Volga. A footpath under the Kanavinsky Bridge leads to the Fair.',
      zh: '通往斯特列尔卡（奥卡河与伏尔加河交汇处）的步行空间。卡纳温大桥下的步道通往集市。',
    },
    source: OSM,
    sunset: { ru: 'Широкий горизонт над слиянием рек; ровная набережная. Закатную сторону уточните на месте.', en: 'A wide horizon over the river confluence on a level promenade. Check the sunset side on site.', zh: '平坦的滨河步道，河流交汇处视野开阔。请到现场确认日落方向。' },
  },
  {
    id: 'warehouses', lat: 56.334936, lon: 43.974804, tags: ['architecture', 'history', 'art'], minutes: 20, effort: 0,
    name: { ru: 'Пакгаузы на Стрелке', en: 'Warehouses on the Strelka', zh: '斯特列尔卡货栈' },
    blurb: {
      ru: 'Ажурные металлические пакгаузы сохранились от павильонов Всероссийской промышленной и художественной выставки 1896 года. Сегодня — выставочное и концертное пространства.',
      en: 'The lattice-steel warehouses survive from the pavilions of the 1896 All-Russian Industrial and Art Exhibition. Today they host exhibition and concert spaces.',
      zh: '镂空钢结构货栈保留自1896年全俄工业与艺术博览会的展馆，如今是展览和音乐会场地。',
    },
    source: OSM,
  },
  {
    id: 'cable', lat: 56.3237872, lon: 44.0391179, tags: ['view', 'family', 'water'], minutes: 40, effort: 0,
    name: { ru: 'Канатная дорога Нижний — Бор', en: 'Cable car Nizhny — Bor', zh: '下诺夫哥罗德—博尔缆车' },
    blurb: {
      ru: 'Станция на Казанской набережной, 8А. Отсюда кабины идут через Волгу в город Бор.',
      en: 'The station is at Kazanskaya Embankment 8A. Cabins cross the Volga to the town of Bor.',
      zh: '车站位于喀山滨河路8А号，缆车从这里越过伏尔加河前往博尔市。',
    },
    site: 'https://nnkd.ru/', source: OSM,
    tip: { ru: 'Поездка оплачивается отдельно; режим работы зависит от погоды — проверьте на nnkd.ru.', en: 'The ride is paid separately; operation depends on weather — check nnkd.ru.', zh: '乘坐需另行付费；运营受天气影响，请查看 nnkd.ru。' },
    sunset: { ru: 'Станция у воды на Казанской набережной; вид на Волгу из кабины.', en: 'A waterside station on the Kazanskaya Embankment; river views from the cabin.', zh: '喀山滨河路水边的车站，可在车厢内欣赏伏尔加河风光。' },
  },
  {
    id: 'wheel', lat: 56.3241447, lon: 44.0359323, tags: ['view', 'family', 'sunset'], minutes: 30, effort: 0,
    name: { ru: 'Колесо обозрения «НиНо»', en: '“NiNo” Ferris wheel', zh: '“尼诺”摩天轮' },
    blurb: {
      ru: 'Колесо обозрения у Казанского съезда. Закрытые кабинки, рядом арт-объекты и кофейня (по описанию оператора).',
      en: 'A Ferris wheel by the Kazansky Descent. Enclosed cabins, with art objects and a café nearby (per the operator’s description).',
      zh: '喀山下坡旁的摩天轮。封闭车厢，附近有艺术装置和咖啡馆（据运营方介绍）。',
    },
    site: 'https://kolesonino.ru/', source: OSM,
    tip: { ru: 'Билет оплачивается отдельно; режим работы уточняйте у оператора.', en: 'Tickets are paid separately; check opening hours with the operator.', zh: '门票另付；营业时间请向运营方确认。' },
    sunset: { ru: 'Высота обзора над рекой; удобно проверить сторону заката из кабины.', en: 'Height above the river; you can see which way the sun sets from the cabin.', zh: '可在河上高处观景，在车厢内能看清日落方向。' },
  },
  {
    id: 'pokrovskaya', lat: 56.3162651, lon: 43.9938495, tags: ['walk', 'architecture'], minutes: 40, effort: 0,
    name: { ru: 'Большая Покровская улица', en: 'Bolshaya Pokrovskaya Street', zh: '大波克罗夫卡街' },
    blurb: {
      ru: 'Главная пешеходная улица центра: кафе, магазины, исторические дома.',
      en: 'The main pedestrian street of the centre: cafés, shops and historic houses.',
      zh: '市中心的主要步行街：咖啡馆、商店和历史建筑。',
    },
    photo: 'pokrovskaya', source: OSM,
  },
  {
    id: 'monastery', lat: 56.3231362, lon: 44.0493471, tags: ['history', 'religion', 'architecture'], minutes: 40, effort: 1,
    name: { ru: 'Вознесенский Печерский монастырь', en: 'Ascension Pechersky Monastery', zh: '升天洞窟修道院' },
    blurb: {
      ru: 'Действующий мужской монастырь в Приволжской слободе.',
      en: 'A working monastery for men in the Privolzhskaya Sloboda.',
      zh: '位于伏尔加河畔区的现役男修道院。',
    },
    source: OSM,
    tip: { ru: 'Действующая обитель: соблюдайте правила посещения; осмотр снаружи доступен как отдельный сценарий.', en: 'A working monastery: respect the visiting rules; an exterior-only visit is possible.', zh: '现役修道院：请遵守参观规定；也可仅在外部参观。' },
  },
  {
    id: 'art', lat: 56.3275176, lon: 44.0057012, tags: ['art', 'history'], minutes: 60, effort: 0,
    name: { ru: 'Центр современного искусства «Арсенал»', en: '“Arsenal” Centre for Contemporary Art', zh: '“阿尔谢纳尔”当代艺术中心' },
    blurb: {
      ru: 'Находится в корпусе 6 кремля; Волго-Вятский филиал ГМИИ имени А. С. Пушкина. Вход ближе к Дмитриевской башне.',
      en: 'Located in building 6 of the Kremlin; the Volga-Vyatka branch of the Pushkin State Museum of Fine Arts. The entrance is nearer to the Dmitrievskaya Tower.',
      zh: '位于克里姆林宫6号楼，是普希金造型艺术博物馆的伏尔加-维亚特卡分馆，入口靠近季米特里塔。',
    },
    site: 'https://arsenal-museum.art/', source: OSM,
    tip: { ru: 'Программу, билеты и доступность уточняйте на сайте.', en: 'Check the programme, tickets and accessibility on the website.', zh: '展览、门票和无障碍信息请查看官网。' },
  },
  {
    id: 'school', lat: 56.327378, lon: 44.0081026, tags: ['history', 'architecture'], minutes: 10, effort: 0,
    name: { ru: 'Гимназия № 1 (бывшая губернская гимназия)', en: 'Gymnasium No. 1 (former provincial gymnasium)', zh: '第一中学（原省立中学）' },
    blurb: {
      ru: 'Учебное здание рядом с площадью Минина и Пожарского; на старом фото около 1900 года, возможно, он же.',
      en: 'A school building near Minin and Pozharsky Square; it may be the one in the old photo from around 1900.',
      zh: '米宁和波扎尔斯基广场附近的学校建筑，可能就是约1900年老照片中的那一座。',
    },
    photo: undefined, source: OSM,
    tip: { ru: 'Это учебное здание: осмотр снаружи, внутрь не заходят.', en: 'This is a school building: view it from outside only.', zh: '这是学校建筑，仅限外部参观。' },
  },
  {
    id: 'victory', lat: 56.3276243, lon: 44.0355738, tags: ['park', 'family', 'walk'], minutes: 40, effort: 1,
    name: { ru: 'Парк Победы', en: 'Victory Park', zh: '胜利公园' },
    blurb: {
      ru: 'Городской парк на нагорной части города — для неспешной прогулки.',
      en: 'A city park on the upland part of the city, for a relaxed stroll.',
      zh: '位于城市高地的公园，适合悠闲散步。',
    },
    site: 'https://park-pobeda-nn.ru/', photo: 'victory', source: OSM,
  },
];

export const placeById = (id: string) => PLACES.find((p) => p.id === id);
export const placePhoto = (p: Place) => (p.photo ? photoUrl(p.photo) : undefined);
