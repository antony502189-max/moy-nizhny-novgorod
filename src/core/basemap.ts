import L from 'leaflet';

const cityBounds: L.LatLngTuple[] = [[56.14, 43.57], [56.44, 44.21]];
const centerBounds: L.LatLngBoundsExpression = [[56.300, 43.935], [56.350, 44.075]];

export function addBasemap(map: L.Map) {
  const root = import.meta.env.BASE_URL + 'maps/';
  const attribution = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
  map.setMinZoom(11).setMaxZoom(17).setMaxBounds(L.latLngBounds(cityBounds).pad(0.1));
  map.attributionControl.setPrefix('<a href="https://leafletjs.com/">Leaflet</a>');
  L.imageOverlay(root + 'city.webp', cityBounds, { attribution, interactive: false }).addTo(map);
  const detail = L.imageOverlay(root + 'center.webp', centerBounds, { interactive: false });
  const showDetail = () => {
    if (map.getZoom() >= 14) detail.addTo(map);
    else detail.remove();
  };
  map.on('zoomend', showDetail);
  showDetail();
}
