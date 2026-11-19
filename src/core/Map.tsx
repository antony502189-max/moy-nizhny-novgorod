import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import { CENTER, type LatLon } from './geo';
import { useI18n } from './i18n';

export interface MapMarker {
  id: string; lat: number; lon: number;
  /** css class of the pin: "pin", "pin pin--sun", ... ; `glyph` is its text/emoji content */
  cls?: string; glyph?: string; title?: string; popup?: string; onClick?: () => void; size?: number;
}
export interface MapLine { id: string; points: [number, number][]; color?: string; dashed?: boolean }
export interface MapProps {
  center?: { lat: number; lon: number }; zoom?: number; markers?: MapMarker[]; lines?: MapLine[];
  heat?: [number, number, number][]; onMapClick?: (lat: number, lon: number) => void;
  fit?: boolean; cluster?: boolean; className?: string; label?: string; picked?: { lat: number; lon: number } | null; selectedId?: string | null;
  focusPoint?: LatLon | null;
}

import { addBasemap } from './basemap';

const NO_MARKERS: MapMarker[] = [];
const NO_LINES: MapLine[] = [];

export function LeafMap({ center = CENTER, zoom = 14, markers = NO_MARKERS, lines = NO_LINES, heat, onMapClick, fit, cluster, className = '', label, picked, selectedId, focusPoint }: MapProps) {
  const { t } = useI18n();
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const pins = useRef(new Map<string, L.Marker>());
  const heatLayer = useRef<any>(null);
  const clickRef = useRef(onMapClick);
  clickRef.current = onMapClick;

  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, { zoomControl: false, attributionControl: true, zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false }).setView([center.lat, center.lon], zoom);
    addBasemap(m);
    if (fit) m.setMinZoom(10);
    L.control.zoom({ position: 'bottomright' }).addTo(m);
    layer.current = L.layerGroup().addTo(m);
    m.on('click', (e: L.LeafletMouseEvent) => clickRef.current?.(e.latlng.lat, e.latlng.lng));
    map.current = m;
    const resize = new ResizeObserver(() => {if(map.current===m)m.invalidateSize({animate:false})});
    resize.observe(el.current);
    return () => { resize.disconnect(); m.stop(); m.remove(); map.current = null; heatLayer.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unclusteredId = cluster ? selectedId : undefined;
  useEffect(() => {
    const m = map.current, g = layer.current;
    if (!m || !g) return;
    g.clearLayers();
    pins.current.clear();
    for (const ln of lines) L.polyline(ln.points, { color: ln.color ?? '#3283c7', weight: 4, opacity: 0.85, dashArray: ln.dashed ? '6 8' : undefined }).addTo(g);
    const group = cluster ? L.markerClusterGroup({
      maxClusterRadius: 56, showCoverageOnHover: false, animate: false, spiderfyDistanceMultiplier: 1.5,
      iconCreateFunction: group => L.divIcon({
        className: 'history-cluster', html: String(group.getChildCount()), iconSize: [44, 44],
      }),
    }).addTo(g) : g;
    for (const mk of markers) {
      const size = mk.size ?? 30;
      const icon = L.divIcon({
        className: 'pin-wrap', iconSize: [size, size], iconAnchor: [size / 2, size / 2],
        html: `<div class="${mk.cls ?? 'pin'}" style="width:${size}px;height:${size}px">${mk.glyph ?? ''}</div>`,
      });
      const m2 = L.marker([mk.lat, mk.lon], { icon, title: mk.title, keyboard: Boolean(mk.onClick) }).addTo(mk.id === unclusteredId ? g : group);
      pins.current.set(mk.id, m2);
      if (mk.popup) { const d = document.createElement('div'); d.textContent = mk.popup; m2.bindPopup(d); }
      if (mk.onClick) m2.on('click', mk.onClick);
    }
    if (picked) L.marker([picked.lat, picked.lon], { icon: L.divIcon({ className: 'pin-wrap', iconSize: [34, 34], iconAnchor: [17, 34], html: '<div class="pin-drop"></div>' }) }).addTo(g);
    if (fit && (markers.length > 0)) {
      const b = L.latLngBounds(markers.map((x) => [x.lat, x.lon] as [number, number]));
      m.fitBounds(b, { padding: [36, 36], maxZoom: 16, animate:false });
    }
  }, [markers, lines, picked, fit, cluster, unclusteredId]);

  useEffect(() => {
    const marker = selectedId ? pins.current.get(selectedId) : undefined;
    const pin = marker?.getElement()?.firstElementChild;
    marker?.setZIndexOffset(1000);
    pin?.classList.add('pin--sel');
    return () => {
      marker?.setZIndexOffset(0);
      pin?.classList.remove('pin--sel');
    };
  }, [selectedId, markers, lines, picked, fit]);

  useEffect(() => {
    const m = map.current;
    if (!m || !focusPoint) return;
    m.setView([focusPoint.lat, focusPoint.lon], Math.max(m.getZoom(), 16), { animate: false });
  }, [focusPoint]);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    if (heatLayer.current) { m.removeLayer(heatLayer.current); heatLayer.current = null; }
    if (heat && heat.length) {
      heatLayer.current = (L as any).heatLayer(heat, { radius: 16, blur: 15, max: 5, minOpacity: 0.2, maxZoom: 15, gradient: { 0.25: '#7cc4ff', 0.5: '#3283c7', 0.75: '#f5a623', 1: '#e5484d' } }).addTo(m);
    }
  }, [heat]);

  return <div ref={el} className={`leafmap ${className}`} role="region" aria-label={label ?? t('app.map')} />;
}

export function flyTo(m: L.Map | null, lat: number, lon: number, z = 16) { m?.flyTo([lat, lon], z); }
