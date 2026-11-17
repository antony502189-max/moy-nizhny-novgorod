# Геоданные Нижнего Новгорода

Картография, границы районов, удобства и расчётные пути основаны на OpenStreetMap. Производные данные доступны на условиях ODbL 1.0. Надписи улиц и линии отрисованы из векторных объектов. Даты OSM баз в исходных ответах Overpass — 17 ноября 2026 года UTC. [OpenStreetMap и лицензия](https://www.openstreetmap.org/copyright)

Для обновления подготовьте пять JSON-файлов Overpass с геометрией и идентификаторами узлов. Общий прямоугольник имеет границы S/W/N/E `56.14,43.57,56.44,44.21`, центр — `56.300,43.935,56.350,44.075`. Вместо `CITY` и `CENTER` в запросах ниже подставьте эти четыре числа.

```text
[out:json];way[highway](CENTER);out geom;
[out:json];(way[highway~"^(primary|secondary|tertiary|trunk|motorway|pedestrian)$"](CITY);way[waterway~"^(river|canal)$"](CITY););out geom;
[out:json];way[highway~"^(residential|living_street|unclassified)$"](CITY);out geom;
[out:json];(way[natural=water](CITY);rel[natural=water][water~"^(river|reservoir)$"](CITY);way[leisure=park](56.30,43.93,56.35,44.08););out geom;
[out:json];rel[boundary=administrative][name~"^(Автозаводский|Канавинский|Ленинский|Московский|Нижегородский|Приокский|Советский|Сормовский) район$"](56.17,43.7,56.4,44.12);out geom;
```

Скрипту нужны Python 3, Pillow и файл шрифта с кириллицей. Запустите из корня репозитория.

```sh
python3 scripts/build-geodata.py center.json major.json streets.json shapes.json districts.json /path/to/font.ttf
```

Результат — две карты WebP в проекции Web Mercator, `src/data/districts.json` и `src/data/walking.json`. Для 21 места скрипт привязывает точку к связной уличной сети в пределах 90 м и ищет кратчайший путь по длине. Схема показывает путь между привязанными узлами. Расстояние также учитывает подходы от каталожных точек. Точка монастыря стоит у [пешеходных ворот](https://www.openstreetmap.org/node/2356441126). В варианте без отмеченных лестниц исключены пути с тегами `highway=steps` и `wheelchair=no`. Уклоны, освещение, состояние покрытия, режим доступа и временные перекрытия требуют проверки на месте.

В шести готовых прогулках пешеходные участки сохранены в `src/data/curated-walking.json`. У стадиона путь заканчивается на [пешеходном подходе](https://www.openstreetmap.org/node/5135589469), маркер обозначает сам стадион. Для пересборки готовых прогулок также нужен Node.js 22.18 или новее.
