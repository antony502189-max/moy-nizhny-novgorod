import type { PersonalData, PersonalRoute } from './types.ts';
export const emptyPersonal = ():PersonalData=>({routes:[],visits:{},notes:{}});
const safeKey=(s:unknown):s is string=>typeof s==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(s)&&!['__proto__','constructor','prototype'].includes(s);
export function parsePersonal(value:unknown):PersonalData {
 const v=value as Partial<PersonalData>|null;const result=emptyPersonal();
 if(!v||typeof v!=='object')return result;
 if(Array.isArray(v.routes))for(const r of v.routes.slice(0,100)){
  if(!r||!safeKey(r.id)||typeof r.title!=='string'||!r.title.trim()||!Array.isArray(r.placeIds)||result.routes.some(x=>x.id===r.id))continue;
  result.routes.push({id:r.id,title:r.title.slice(0,100),description:typeof r.description==='string'?r.description.slice(0,2000):'',placeIds:[...new Set(r.placeIds.filter(safeKey))].slice(0,30)});
 }
 for(const key of ['visits','notes'] as const){const map=v[key];if(map&&typeof map==='object'&&!Array.isArray(map))for(const [id,text] of Object.entries(map).slice(0,1000))if(safeKey(id)&&typeof text==='string'&&(key==='notes'||!isNaN(Date.parse(text))))result[key][id]=text.slice(0,key==='notes'?2000:40);}
 return result;
}
export function moveStop(ids:string[],index:number,delta:number){const next=[...ids];const to=index+delta;if(index<0||index>=ids.length||to<0||to>=ids.length)return next;[next[index],next[to]]=[next[to],next[index]];return next;}
export function encodeRoute(route:PersonalRoute){return encodeURIComponent(JSON.stringify({title:route.title,placeIds:route.placeIds}));}
export function decodeRoute(text:string,knownIds:string[]):Omit<PersonalRoute,'id'|'description'> {
 if(text.length>10000)throw new Error('Ссылка слишком длинная.');
 let v;try{v=JSON.parse(decodeURIComponent(text))}catch{throw new Error('Не удалось прочитать маршрут из ссылки.');}
 if(typeof v?.title!=='string'||!v.title.trim()||v.title.length>100||!Array.isArray(v.placeIds)||v.placeIds.length<2||v.placeIds.length>30||v.placeIds.some((id:unknown)=>typeof id!=='string'||!knownIds.includes(id))||new Set(v.placeIds).size!==v.placeIds.length)throw new Error('В ссылке нет корректного маршрута из 2–30 объектов.');
 return {title:v.title,placeIds:v.placeIds};
}
