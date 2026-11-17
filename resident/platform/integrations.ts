// Verified public destinations, provenance in docs/API_ACCESS.md.
export const integrations = {
 requests:'https://lbch.ru/', mayor:'https://max.ru/yuriy_shalabaev', community:'https://vk.ru/moynn_app',
 utilities:'https://oko-nn.ru/', housing:'https://dom.gosuslugi.ru/', roads:'https://admgor.nnov.ru/',
 traffic:'https://yandex.ru/maps/?ll=44.005986%2C56.326887&z=12&l=map%2Ctrf%2Ctrfe',
};
export function objectMapUrl(provider:'yandex'|'2gis',title:string,address:string) {
 const query=encodeURIComponent([title,address].filter(Boolean).join(', '));
 return provider==='yandex'?`https://yandex.ru/maps/?text=${query}`:`https://2gis.ru/search/${query}`;
}
