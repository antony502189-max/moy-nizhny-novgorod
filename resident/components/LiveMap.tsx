import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { GeoPoint } from '../domain/types';
import { addBasemap } from '../../src/core/basemap';
import { curatedLegs } from '../../src/core/curatedPaths';
export type MapPoint=GeoPoint & {title:string;id?:string};
export function LiveMap({points=[],position,onSelect,walkIds}:{points?:MapPoint[];walkIds?:string[];position?:GeoPoint;onSelect?:(id:string)=>void}){
 const container=useRef<HTMLDivElement>(null);
 const key=JSON.stringify({points,position,walkIds});const select=useRef(onSelect);select.current=onSelect;
 useEffect(()=>{
  if(!container.current)return;
  let gone=false;
  const map=L.map(container.current,{scrollWheelZoom:false,zoomControl:false,zoomAnimation:false,fadeAnimation:false,markerZoomAnimation:false}).setView([position?.lat??56.3269,position?.lon??44.0075],position?15:12);
  map.attributionControl.setPrefix('<a href="https://leafletjs.com/" target="_blank" rel="noopener">Leaflet</a>');
  L.control.zoom({zoomInTitle:'Приблизить',zoomOutTitle:'Отдалить'}).addTo(map);
  const bounds:L.LatLngTuple[]=[];
  points.forEach((p,i)=>{
   const button=document.createElement('button');button.type='button';button.textContent=p.title;
   button.addEventListener('click',()=>p.id&&select.current?.(p.id));
   const marker=L.marker([p.lat,p.lon],{title:p.title,icon:L.divIcon({className:'city-marker',html:`<span>${i+1}</span>`,iconSize:[28,28],iconAnchor:[14,28]})}).addTo(map);
   marker.bindPopup(button);bounds.push([p.lat,p.lon]);
  });
  if(position){L.circleMarker([position.lat,position.lon],{radius:8,color:'#fff',weight:3,fillColor:'#207fd5',fillOpacity:1}).bindTooltip('Вы здесь').addTo(map)}
  else if(bounds.length)map.fitBounds(bounds,{padding:[28,28],maxZoom:16,animate:false});
  addBasemap(map);
  if(walkIds)for(const leg of curatedLegs(walkIds)){
    if(leg.points.length>1)L.polyline(leg.points,{color:'#246ca4',weight:4,opacity:.85}).addTo(map);
  }
  const resize=new ResizeObserver(()=>{if(!gone)map.invalidateSize({animate:false})});resize.observe(container.current);
  return()=>{gone=true;resize.disconnect();map.stop();map.remove()};
 },[key]);
 return <div className="live-map-wrap"><div className="live-map" ref={container} role="region" aria-label="Интерактивная карта Нижнего Новгорода"/></div>;
}
