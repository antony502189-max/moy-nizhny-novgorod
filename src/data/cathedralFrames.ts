import type { ThenPhoto } from './history.ts';

const base = import.meta.env?.BASE_URL || './';

export const cathedralFrames: ThenPhoto[] = [
  {
    id: 'pechersky-1631',
    src: base + 'history/pechersky-1631.jpg',
    year: 1631,
    yearLabel: { ru: '1631', en: '1631', zh: '1631年' },
    caption: {
      ru: 'Летом 1631 года артель Фёдора Опарина начала класть из белого камня нижний этаж будущего собора.',
      en: 'In the summer of 1631, Fyodor Oparin’s masons began laying the white limestone base of the cathedral.',
      zh: '1631年夏，费奥多尔·奥帕林带领石匠用白色石灰岩砌筑大教堂的底层。',
    },
    generated: true,
    credit: {
      author: 'OpenAI ImageGen',
      license: 'Летопись монастыря',
      sourceUrl: 'https://www.pecherskiy.nne.ru/ob-obiteli/letopis-monastyirya.html',
    },
  },
  {
    id: 'pechersky-1870s',
    src: base + 'history/pechersky-1870s.jpg',
    year: null,
    yearLabel: { ru: '1870-е', en: '1870s', zh: '1870年代' },
    caption: {
      ru: 'На раскрашенной фотографии Андрея Карелина пятиглавый собор виден за колокольней, на фоне Волги.',
      en: 'In Andrey Karelin’s coloured photograph, the five-domed cathedral rises behind the bell tower, with the Volga in the distance.',
      zh: '在安德烈·卡列林的着色照片中，五圆顶大教堂矗立在钟楼后方，远处是伏尔加河。',
    },
    credit: {
      author: 'Андрей Карелин',
      license: 'Public domain',
      sourceUrl: 'https://www.nnov.ec/Старый_центр_Нижнего_Новгорода_на_снимках_Карелина_и_Дмитриева',
    },
  },
];
