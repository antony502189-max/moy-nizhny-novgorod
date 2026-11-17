// Coordinates checked against OpenStreetMap via Photon on 2026-11-15.
// A coordinate for an area/street is a representative point, not an entrance.
// Deliberately excluded ambiguous geocoder matches (bus stops and shops).
export const placeEnrichment: Record<string, { lat: number; lon: number; description?: string; title?: string; address?: string; source: string }> = {
 model:{lat:56.326401,lon:44.0018558,source:'https://www.openstreetmap.org/node/9291159927'},
 barracks:{lat:56.3314844,lon:44.001768,source:'https://www.openstreetmap.org/relation/2860611'},
 walls:{lat:56.3270462,lon:44.0056767,source:'https://www.openstreetmap.org/node/4320825061'},
 viewpoint:{lat:56.3292784,lon:44.0022819,source:'https://www.openstreetmap.org/node/360980046'},
 shukhov:{lat:56.335648,lon:43.974779,source:'https://tonkosti.ru/MTS/nizhegorodskaya-oblast/mys-strelka/replika-shuhovskoj-bashni'},
 ski:{lat:56.3248051,lon:44.035929,source:'https://www.openstreetmap.org/node/1847144720'},
 cable: { lat: 56.3237872, lon: 44.0391179, source: 'https://www.openstreetmap.org/relation/8455183', description: 'Нижегородская станция канатной дороги расположена на Казанской набережной, 8А. Отсюда кабины отправляются через Волгу в город Бор. Перед поездкой проверьте режим работы на официальном сайте оператора nnkd.ru: работа транспорта зависит от погодных условий.' },
 wheel: { lat: 56.3241447, lon: 44.0359323, source: 'https://www.openstreetmap.org/way/978580338', description: '«Колесо НиНо» — колесо обозрения у Казанского съезда. Закрытые кабинки оборудованы кондиционерами и обогревом. На территории комплекса есть арт-объекты и кофейня. Билеты, режим работы и дополнительные услуги публикуются на официальном сайте kolesonino.ru.' },
 shell: { lat: 56.3306514, lon: 44.0139569, source: 'https://www.openstreetmap.org/way/1396546120', description: 'Летняя сцена «Ракушка» находится в Александровском саду под Верхне-Волжской набережной. Здесь проходят концерты под открытым небом. Визит удобно совместить с прогулкой по саду и к Чкаловской лестнице; актуальную программу проверяйте у организаторов мероприятий.' },
 deer: { lat: 56.3320354, lon: 44.0121, source: 'https://www.openstreetmap.org/node/4396530951', description: 'Скульптура «Олень» на Нижне-Волжской набережной создана венгерским художником Габором Миклошем Жокэ. Туристический портал области отмечает, что её установили как знак дружбы российского и венгерского народов. Олень также изображён на гербе Нижнего Новгорода.' },
 mayak: { lat: 56.3303607, lon: 43.9928699, source: 'https://www.openstreetmap.org/relation/2892617', description: 'Здание на Нижне-Волжской набережной, 11 известно как торговый дом Рукавишникова и бывшая фабрика «Маяк». Сейчас этот адрес также используется «Академией Маяк». Осмотреть фасад можно во время прогулки вдоль набережной; посещение мероприятий внутри зависит от их программы.' },
 markin: { lat: 56.3295779, lon: 43.9891695, source: 'https://www.openstreetmap.org/way/40444139', description: 'Площадь Маркина находится у Нижне-Волжской набережной и Рождественской улицы. Это заключительная точка прогулки «Волжские набережные». Отсюда можно продолжить прогулку по Рождественской улице.' },
 minin: { lat: 56.3261338, lon: 44.0047027, source: 'https://www.openstreetmap.org/way/1389654714', description: 'Площадь Минина и Пожарского расположена рядом с Нижегородским кремлём. В нашем варианте прогулки она служит начальной точкой: далее маршрут идёт к Дмитриевской башне и на территорию кремля.' },
 dmitriev: { lat: 56.3270462, lon: 44.0056767, source: 'https://www.openstreetmap.org/node/4320825061', description: 'Дмитриевская башня — одна из башен Нижегородского кремля, расположенная со стороны площади Минина и Пожарского. Внутри отмечена музейная экспозиция; перед посещением уточните доступность и часы работы у музея.' },
 kremlin: { lat: 56.3280332, lon: 44.0021054, source: 'https://www.openstreetmap.org/relation/2906502', description: 'Нижегородский кремль — исторический комплекс в центре города. Метка показывает территорию комплекса, а не конкретный вход. Во время прогулки можно осмотреть башни и стены, а затем выйти к Чкаловской лестнице.' },
 chkalov: { lat: 56.3304669, lon: 44.0094375, source: 'https://www.openstreetmap.org/node/4929597723' },
 rozhdestvenskaya: { lat: 56.3293651, lon: 43.9926478, source: 'https://www.openstreetmap.org/way/215637320', description: 'Рождественская улица проходит в нижней части исторического центра рядом с Волгой. Метка показывает один из её пешеходных участков. Улицу удобно включить в прогулку после Нижне-Волжской набережной и здания бывшей фабрики «Маяк».' },
 fair: { lat: 56.3288518, lon: 43.961701, source: 'https://www.openstreetmap.org/node/5289571922', description: 'Нижегородская ярмарка — исторический торговый комплекс в Канавинском районе. Сегодня территория у Главного ярмарочного дома служит общественным пространством. Отсюда удобно начать прогулку к Окской набережной и Стрелке.' },
 oka: { lat: 56.3330427, lon: 43.9741635, source: 'https://www.openstreetmap.org/way/589671597', description: 'Окская набережная в Канавинском районе — пешеходное пространство на пути к Стрелке. С противоположного берега видна нагорная часть Нижнего Новгорода. Пешеходный проход под Канавинским мостом связывает набережную с территорией Ярмарки.' },
 warehouses: { lat: 56.334936, lon: 43.974804, source: 'https://www.openstreetmap.org/node/9800958604', description: 'Ажурные металлические Пакгаузы на Стрелке сохранились от павильонов Всероссийской промышленной и художественной выставки 1896 года. Сегодня здесь находятся выставочное и концертное пространства. Посещение зала или выставки планируйте по программе площадки.' },
 volga: { lat: 56.3383951, lon: 43.9666206, source: 'https://www.openstreetmap.org/way/528470794', description: 'Волжская набережная находится в Канавинском районе, на берегу Волги. Метка показывает участок возле Стрелки и стадиона. Это отдельная улица: её не следует путать с Верхне-Волжской и Нижне-Волжской набережными в историческом центре.' },
 stadium: { lat: 56.336801, lon: 43.9636748, source: 'https://www.openstreetmap.org/relation/5317016', description: 'Стадион, известный как «Нижний Новгород», теперь носит название «Совкомбанк Арена». Он расположен у слияния Оки и Волги, рядом со Стрелкой. События и правила посещения публикуются на официальном сайте scbarena-nn.ru. Метка обозначает территорию арены; вход выбирайте по своему билету.' },
 // Address correction: https://arsenal-museum.art/info-for-our-visitors/ (official museum).
 art: { title: 'Центр современного искусства «Арсенал»', lat: 56.3275176, lon: 44.0057012, address: 'Нижний Новгород, Кремль, корпус 6', source: 'https://www.openstreetmap.org/node/11966302769', description: 'Центр современного искусства «Арсенал» находится на территории Нижегородского кремля, в корпусе 6. Сегодня это Волго-Вятский филиал ГМИИ имени А. С. Пушкина. Вход в музей находится в правом крыле, ближе к Дмитриевской башне.' },
 'rowing': { lat: 56.3250163, lon: 44.0508589, source: 'https://www.openstreetmap.org/way/227660177' },
 'upper-volga': { lat: 56.3295938, lon: 44.0114449, source: 'https://www.openstreetmap.org/way/878616991' },
 'fedorovsky': { lat: 56.325369, lon: 43.9854697, source: 'https://www.openstreetmap.org/way/39934385' },
 'lower-volga': { lat: 56.3315917, lon: 44.0100288, source: 'https://www.openstreetmap.org/way/39540378' },
 'kazan-embankment': { lat: 56.3233095, lon: 44.0353626, source: 'https://www.openstreetmap.org/way/975112413' },
 'pokrovskaya': { lat: 56.3162651, lon: 43.9938495, source: 'https://www.openstreetmap.org/way/1443892509' },
 'station': { lat: 56.3164189, lon: 43.9710099, source: 'https://www.openstreetmap.org/way/148138976' },
 'barysheva': { lat: 56.3242734, lon: 43.9772511, source: 'https://www.openstreetmap.org/way/147551291' },
 'kozhevnikov': { lat: 56.3208016, lon: 43.9733774, source: 'https://www.openstreetmap.org/way/147573290' },
 'vyakhirev': { lat: 56.321335, lon: 43.9738615, source: 'https://www.openstreetmap.org/way/147551285' },
 'prison': { lat: 56.3172225, lon: 44.0170054, source: 'https://www.openstreetmap.org/way/151905925' },
 'olisov': { lat: 56.3257901, lon: 43.9903165, source: 'https://www.openstreetmap.org/way/147054105' },
 'peter': { lat: 56.3255082, lon: 43.994991, source: 'https://www.openstreetmap.org/way/108727791' },
 'garden': { lat: 56.3281329, lon: 44.0253368, source: 'https://www.openstreetmap.org/relation/2054610' },
 'sormovo-house': { lat: 56.320501, lon: 43.9983383, source: 'https://www.openstreetmap.org/relation/3483594' },
 'gaz': { lat: 56.2476014, lon: 43.8969958, source: 'https://www.openstreetmap.org/relation/2006090' },
 'gaz-museum': { lat: 56.2544887, lon: 43.8926754, source: 'https://www.openstreetmap.org/node/1808680326' },
 'sormovo': { lat: 56.3626641, lon: 43.8729407, source: 'https://www.openstreetmap.org/relation/13573399' },
 'sormovo-museum': { lat: 56.3599145, lon: 43.8702059, source: 'https://www.openstreetmap.org/node/1808680322' },
 'zachatie': { lat: 56.3308309, lon: 44.0033564, source: 'https://www.openstreetmap.org/relation/2323262' },
 'mosque': { lat: 56.3234434, lon: 44.0376162, source: 'https://www.openstreetmap.org/relation/13028362' },
 'monastery': { lat: 56.3231362, lon: 44.0493471, source: 'https://www.openstreetmap.org/relation/3015727' },
 'hero': { lat: 56.3322407, lon: 44.0095028, source: 'https://www.openstreetmap.org/way/192561355' },
 'bell': { lat: 56.3286232, lon: 44.0048761, source: 'https://www.openstreetmap.org/way/930383109' },
 'school': { lat: 56.327378, lon: 44.0081026, source: 'https://www.openstreetmap.org/way/151302740' },
 'north-tower': { lat: 56.3287762, lon: 43.9980266, source: 'https://www.openstreetmap.org/relation/2906507' },
 'kazan-church': { lat: 56.3288657, lon: 43.9957103, source: 'https://www.openstreetmap.org/relation/2951066' },
 'gorky': { lat: 56.3231469, lon: 43.9841689, source: 'https://www.openstreetmap.org/node/10793533203' },
 'victory': { lat: 56.3276243, lon: 44.0355738, source: 'https://www.openstreetmap.org/relation/2400756' },
 'church': { lat: 56.3272531, lon: 43.9849679, source: 'https://www.openstreetmap.org/relation/3022763' },
 'suetinskaya': { lat: 56.3269945, lon: 43.985782, source: 'https://www.openstreetmap.org/way/147087797' },
};

// These two point sequences are editorial choices approved in the task.
// They must be labelled as such; they are NOT the recovered original VK routes.
export const walkEnrichment: Record<string, { description: string; placeIds: string[]; editorial?: boolean }> = {
 history: {
  editorial: true,
  placeIds: ['minin', 'dmitriev', 'kremlin', 'chkalov', 'shell', 'deer', 'mayak', 'rozhdestvenskaya'],
  description: 'Прогулка знакомит с кремлём, набережными и историческими улицами Нижнего Новгорода. Начните на площади Минина и Пожарского, подойдите к Дмитриевской башне и пройдите по территории кремля. Затем направляйтесь к Чкаловской лестнице и Александровскому саду со сценой «Ракушка». На Нижне-Волжской набережной посмотрите скульптуру «Олень» и бывшую фабрику «Маяк», а завершите прогулку на Рождественской улице.\n\nЭто наш вариант маршрута: состав оригинального маршрута в записи не показан. На пути есть лестницы и перепады высоты. Время зависит от выбранного прохода, остановок и доступности территории; навигатор рассчитает пеший путь по актуальной карте.'
 },
 kanavino: {
  editorial: true,
  placeIds: ['fair', 'oka', 'warehouses', 'volga', 'stadium'],
  description: 'Прогулка по Канавинскому району начинается у Нижегородской ярмарки. От Ярмарки выйдите к Окской набережной и двигайтесь к Стрелке, где Ока встречается с Волгой. Следующая остановка — Пакгаузы с их ажурными металлическими конструкциями. Затем продолжите прогулку по Волжской набережной к территории стадиона, который сегодня называется «Совкомбанк Арена».\n\nЭто наш вариант прогулки по известным объектам района, а не восстановленный состав оригинального маршрута. Для входа на выставку, концерт или стадион могут потребоваться отдельные билеты. Время прогулки зависит от остановок и доступных проходов; пеший путь уточняйте в навигаторе.'
 },
};
