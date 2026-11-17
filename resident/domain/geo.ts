import type { GeoPoint, SavedHome } from './types.ts';
export function validPoint(value:unknown): value is GeoPoint {
 const p=value as GeoPoint|null;
 return !!p && Number.isFinite(p.lat) && Number.isFinite(p.lon) && Math.abs(p.lat)<=90 && Math.abs(p.lon)<=180;
}
export function validHome(value:unknown): value is SavedHome {
 const h=value as SavedHome|null;
 return validPoint(h)&&typeof h.label==='string'&&h.label.length>0&&h.label.length<500&&(!h.district||typeof h.district==='string');
}
export function distanceKm(a:GeoPoint,b:GeoPoint){
 const rad=Math.PI/180,dLat=(b.lat-a.lat)*rad,dLon=(b.lon-a.lon)*rad;
 const v=Math.sin(dLat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLon/2)**2;
 return 6371*2*Math.atan2(Math.sqrt(v),Math.sqrt(Math.max(0,1-v)));
}
export function routeUrl(points:{title:string;address:string;lat?:number;lon?:number}[]){
 const route=points.map(p=>validPoint(p)?`${p.lat},${p.lon}`:`${p.title}, ${p.address}`).join('~');
 return `https://yandex.ru/maps/?mode=routes&rtext=${encodeURIComponent(route)}&rtt=pd`;
}
export function parseBackup(value:string): unknown {
 if(value.length>5000000)throw new Error('Файл слишком большой. Выберите резервную копию приложения.');
 let data;try{data=JSON.parse(value)}catch{throw new Error('Не удалось прочитать JSON-файл.');}
 if(data?.app!=='moynn-web'||![1,2].includes(data.version)||!data.preferences||typeof data.preferences.homeQuery!=='string'||!Array.isArray(data.preferences.favorites?.places)||!Array.isArray(data.preferences.favorites?.walks))throw new Error('Это не резервная копия приложения «Мой Нижний».');
 return data.preferences;
}
