import { useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { Plus, Minus, LocateFixed } from 'lucide-react';

/** Recorded map imagery, deliberately offline and never presented as live road data. */
export function MapSurface({image,overview=false}:{image?:string;overview?:boolean}){
 const [zoom,setZoom]=useState(1);const [offset,setOffset]=useState({x:0,y:0});
 const drag=useRef<{x:number;y:number;ox:number;oy:number}|null>(null);
 const points=useRef(new Map<number,{x:number;y:number}>());
 const pinch=useRef<{distance:number;zoom:number}|null>(null);
 const setScale=(next:number)=>{setZoom(Math.max(1,Math.min(5,next)));setOffset({x:0,y:0})};
 const start=(e:PointerEvent<HTMLDivElement>)=>{
  e.currentTarget.setPointerCapture(e.pointerId);points.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(points.current.size===2){const[a,b]=[...points.current.values()];pinch.current={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom};}
  else drag.current={x:e.clientX,y:e.clientY,ox:offset.x,oy:offset.y};
 };
 const move=(e:PointerEvent<HTMLDivElement>)=>{
  if(!points.current.has(e.pointerId))return;
  points.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(points.current.size===2&&pinch.current){const[a,b]=[...points.current.values()];setZoom(Math.max(1,Math.min(5,pinch.current.zoom*Math.hypot(a.x-b.x,a.y-b.y)/pinch.current.distance)));return}
  if(!drag.current)return;
  const rect=e.currentTarget.getBoundingClientRect();
  const maxX=rect.width*(zoom-1)/2,maxY=rect.height*(zoom-1)/2;
  setOffset({x:Math.max(-maxX,Math.min(maxX,drag.current.ox+e.clientX-drag.current.x)),y:Math.max(-maxY,Math.min(maxY,drag.current.oy+e.clientY-drag.current.y))});
 };
 const stop=(e:PointerEvent<HTMLDivElement>)=>{points.current.delete(e.pointerId);drag.current=null;pinch.current=null};
 return <div className={`recorded-map ${overview?'map-overview':''}`}>
  <div className="map-canvas" role="img" aria-label="Карта перекрытий из записи. Масштабируйте кнопками, перемещайте перетаскиванием. Данные не обновляются." onPointerDown={start} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onWheel={e=>{if(e.ctrlKey)setScale(zoom+(e.deltaY<0?.2:-.2))}}>
   <img draggable={false} src={`${import.meta.env.BASE_URL}assets/${image||'map-city.webp'}`} alt="" style={{transform:`translate(${offset.x}px,${offset.y}px) scale(${zoom})`}}/>
  </div>
  <div className="map-zoom"><button onClick={()=>setScale(zoom+.6)} disabled={zoom>=5} aria-label="Приблизить карту"><Plus/></button><button onClick={()=>setScale(zoom-.6)} disabled={zoom<=1} aria-label="Отдалить карту"><Minus/></button></div>
  {zoom>1&&<button className="map-reset" onClick={()=>setScale(1)} aria-label="Показать всю карту"><LocateFixed size={19}/></button>}
  {overview&&<div className="map-legend"><span><i className="full"/>Полное перекрытие</span><span><i className="partial"/>Частичное перекрытие</span></div>}
  <div className="map-source">Снимок из записи</div>
 </div>;
}
