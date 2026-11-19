import type { ThenPhoto } from './history.ts';

const base = import.meta.env?.BASE_URL || './';
const commons = (file: string) => 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(file.replaceAll(' ', '_'));
const beloborodov = {
  author: 'Алексей Белобородов',
  license: 'CC BY-SA 3.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
};

export const cityFrames: Record<string, ThenPhoto[]> = {
  dmitrievskaya: [
    {
      id: 'dmitriev-1895', src: base + 'history/dmitriev-1895.jpg', year: 1895,
      yearLabel: { ru: '1895', en: '1895', zh: '1895年' },
      caption: {
        ru: 'Башню перестраивают для художественного музея. Над стенами уже подняли новый ярус, а высокой шатровой крыши ещё нет.',
        en: 'The tower is being rebuilt as an art museum. A new storey rises above the walls, still without its steep tented roof.',
        zh: '塔楼正在改建为美术馆。新的一层已高出城墙，陡峭的帐篷形屋顶尚未建起。',
      },
      credit: { author: 'Unknown author', license: 'Public domain', sourceUrl: commons('Restructuring Dmitrievskaya Tower.jpg') },
    },
  ],
  pokrovskaya: [
    {
      id: 'pokrovskaya-1902', src: base + 'history/pokrovskaya-1902.jpg', year: 1902,
      yearLabel: { ru: '1902', en: '1902', zh: '1902年' },
      caption: {
        ru: 'Экипажи стоят вдоль торговых домов. В конце улицы видна Дмитриевская башня кремля.',
        en: 'Horse-drawn carriages line the shopfronts. The Kremlin’s Dmitrievskaya Tower stands at the far end of the street.',
        zh: '马车沿着商铺排列，街道尽头可以看到克里姆林宫的季米特里塔。',
      },
      credit: { author: 'Unknown author', license: 'Public domain', sourceUrl: commons('Old image of the Bolshaya Pokrovskaya Street.jpg') },
    },
    {
      id: 'pokrovskaya-1985', src: base + 'history/pokrovskaya-1985.jpg', year: null,
      yearLabel: { ru: 'около 1985', en: 'c. 1985', zh: '约1985年' },
      caption: {
        ru: 'В Горьком Большая Покровская носила имя Свердлова. На снимке прохожие пересекают широкую улицу под подвесными фонарями.',
        en: 'When the city was called Gorky, Bolshaya Pokrovskaya was known as Sverdlov Street. Pedestrians cross beneath suspended streetlights.',
        zh: '城市名为高尔基时，大波克罗夫卡街称为斯维尔德洛夫街。行人从悬挂的路灯下穿过宽阔的街道。',
      },
      credit: { ...beloborodov, sourceUrl: commons('Gorky City. Sverdlov Street (now Bolshaya Pokrovskaya St).jpg') },
    },
  ],
  fair: [
    {
      id: 'fair-1870-1880', src: base + 'history/fair-1870-1880.jpg', year: null,
      yearLabel: { ru: '1870–1880', en: '1870–1880', zh: '1870–1880年' },
      caption: {
        ru: 'На месте нынешнего здания стоял ярмарочный дом Огюста Монферрана. На снимке Андрея Карелина хорошо видны колонны и треугольный фронтон.',
        en: 'Auguste de Montferrand’s earlier fair building stood on this site. Andrey Karelin’s photograph shows the columns and triangular pediment.',
        zh: '如今的主楼所在地原是蒙费朗设计的集市大楼。安德烈·卡列林的照片清楚地记录了立柱和三角形山墙。',
      },
      credit: { author: 'Андрей Карелин', license: 'Public domain', sourceUrl: commons('Главный ярмарочный дом Огюста Монферрана.jpg') },
    },
    {
      id: 'fair-1982', src: base + 'history/fair-1982.jpg', year: 1982,
      yearLabel: { ru: '1982', en: '1982', zh: '1982年' },
      caption: {
        ru: 'В Главном ярмарочном доме Горького работал магазин «Детский мир». Перед фасадом лежала площадь, вымощенная крупными плитами.',
        en: 'The Main Fair House in Gorky housed the Detsky Mir children’s store. Large paving slabs covered the square in front.',
        zh: '当时高尔基市的集市主楼里开设了“儿童世界”商店。楼前的广场铺着大块石板。',
      },
      credit: { ...beloborodov, sourceUrl: commons('Gorky City. Detsky Mir in Main Fair building.jpg') },
    },
  ],
};
