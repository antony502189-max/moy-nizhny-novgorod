import type { HistorySpot, ThenPhoto } from './history.ts';

const base = (import.meta.env?.BASE_URL || './') + 'history/';
const commons = (name: string) =>
  'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(name.replaceAll(' ', '_'));
const shareAlike = {
  license: 'CC BY-SA 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
};

export const riverFrames: Record<string, ThenPhoto[]> = {
  stadium: [
    {
      id: 'stadium-2017', src: base + 'stadium-2017.webp', year: 2017,
      yearLabel: { ru: 'Июль 2017', en: 'July 2017', zh: '2017年7月' },
      caption: {
        ru: 'За портовыми складами уже виден овал стадиона. Между наружными колоннами пока просматриваются трибуны.',
        en: 'The oval stadium rises behind the port warehouses. The stands are still visible between the outer columns.',
        zh: '港口仓库后面已能看到椭圆形体育场，透过外围柱列还可以望见看台。',
      },
      credit: { author: 'Trasprd', ...shareAlike, sourceUrl: commons('Construction of Nizhny Novgorod Stadium.jpg') },
    },
  ],
  shukhov: [
    {
      id: 'packhouses-1882', src: base + 'packhouses-moscow1882.webp', year: 1882,
      yearLabel: { ru: '1882', en: '1882', zh: '1882年' },
      caption: {
        ru: 'Павильоны будущих пакгаузов впервые собрали для выставки в Москве. Из центрального сада виден высокий застеклённый фасад.',
        en: 'The pavilions that would become the warehouses were first assembled for an exhibition in Moscow. The photograph shows the tall glazed façade from the central garden.',
        zh: '后来改建为仓库的展馆最早为莫斯科博览会而搭建。从中央花园望去，可见高大的玻璃立面。',
      },
      credit: {
        author: 'Шерер, Набгольц и Кº · МАММ / МДФ', license: 'Public domain',
        sourceUrl: 'https://russiainphoto.ru/photos/25763/',
      },
    },
    {
      id: 'packhouses-1896', src: base + 'packhouses-1896.webp', year: 1896,
      yearLabel: { ru: '1896', en: '1896', zh: '1896年' },
      caption: {
        ru: 'Для выставки в Нижнем Новгороде павильоны собрали заново. Над витринами художественно-промышленного отдела видны металлические фермы.',
        en: 'The pavilions were reassembled for the Nizhny Novgorod exhibition. Steel trusses span the displays in the industrial arts section.',
        zh: '展馆为下诺夫哥罗德博览会重新组装。工艺美术展厅的展柜上方可见金属桁架。',
      },
      credit: { author: 'Шерер, Набгольц и Кº', license: 'Public domain', sourceUrl: commons('Интерьер павильонов Центрального здания.jpg') },
    },
    {
      id: 'packhouses-2019', src: base + 'packhouses-2019.webp', year: 2019,
      yearLabel: { ru: '2019', en: '2019', zh: '2019年' },
      caption: {
        ru: 'На Стрелке каркасы бывших портовых складов стоят под открытым небом. Сквозь ажурные фермы виден противоположный берег.',
        en: 'The frames of the former port warehouses stand in the open at the Strelka. The opposite bank is visible through the steel lattice.',
        zh: '在斯特列尔卡，原港口仓库的钢架露天而立。透过金属桁架可以看到对岸。',
      },
      credit: {
        author: 'Aleksey Churushkin', ...shareAlike,
        sourceUrl: commons('Вид на ажурные конструкции пакгаузов со стороны стадиона Нижний Новгород.jpg'),
      },
    },
  ],
  gymnasium: [
    {
      id: 'gymnasium-1870', src: base + 'gymnasium-1870.webp', year: 1870,
      yearLabel: { ru: '1870', en: '1870', zh: '1870年' },
      caption: {
        ru: 'На раскрашенном снимке гимназия стоит справа от Благовещенского собора. Центральная часть здания возвышается над боковыми крыльями.',
        en: 'In this coloured photograph the gymnasium stands to the right of the Annunciation Cathedral. The centre of the building rises above its wings.',
        zh: '在这张着色照片中，文理中学位于圣母领报主教座堂右侧。中学主楼的中央部分高于两翼。',
      },
      credit: {
        author: 'Андрей Карелин, Иван Шишкин', license: 'Public domain',
        sourceUrl: commons('Blagoveschensky Cathedral and Province Gymnasia NNovgorod.jpg'),
      },
    },
    {
      id: 'gymnasium-2009', src: base + 'gymnasium-2009.webp', year: 2009,
      yearLabel: { ru: '2009', en: '2009', zh: '2009年' },
      caption: {
        ru: 'В бывшей гимназии работает педагогический университет. После надстройки 1930-х годов у корпуса и его боковых крыльев общая линия крыши.',
        en: 'The former gymnasium houses the pedagogical university. Floors added in the 1930s brought the central block and the wings up to a common roofline.',
        zh: '昔日的文理中学已成为师范大学教学楼。20世纪30年代加层后，中央主楼与两翼的屋顶已基本齐平。',
      },
      credit: { author: 'Edward agapov', license: 'Public domain', sourceUrl: commons('Pedagogical University Nizhny Novgorod.jpg') },
    },
  ],
};

export const gymNow: HistorySpot['now'] = {
  src: base + 'gymnasium-2024.webp', year: 2024,
  caption: {
    ru: 'Вечерний вид с площади Минина и Пожарского. За памятником Кузьме Минину освещён фасад бывшей гимназии, главного корпуса Мининского университета.',
    en: 'An evening view from Minin and Pozharsky Square. Behind the statue of Kuzma Minin is the illuminated former gymnasium, now the main building of Minin University.',
    zh: '从米宁和波扎尔斯基广场望去，库兹马·米宁雕像后方是灯光映照下的昔日文理中学，如今的米宁大学主楼。',
  },
  credit: { author: 'Vyacheslav Bukharov', ...shareAlike, sourceUrl: commons('Views of Nizhny Novgorod (April 2024) - 5.jpg') },
};
