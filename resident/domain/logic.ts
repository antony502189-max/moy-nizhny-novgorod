import type { Place, Category, Favorites, Preferences } from './types.ts';
import { parsePersonal } from './personal.ts';
import { validHome } from './geo.ts';
export const initialPreferences: Preferences = { onboarded:false, homeQuery:'', favorites:{places:[],walks:[]} };
export function filterPlaces(places: Place[], category: Category | '') { return category ? places.filter(p=>p.category===category) : places; }
export function toggleFavorite(favorites: Favorites, kind: keyof Favorites, id: string): Favorites {
 const values = favorites[kind];
 return {...favorites,[kind]:values.includes(id)?values.filter(v=>v!==id):[...values,id]};
}
export function parsePreferences(value: string | null): Preferences {
 try {
  const parsed=JSON.parse(value||'null');
  if(!parsed || typeof parsed!=='object') return structuredClone(initialPreferences);
  const ids=(v:unknown)=>Array.isArray(v)?[...new Set(v.filter((x): x is string=>typeof x==='string'))]:[];
  return {houseRecordId:typeof parsed.houseRecordId==='string'?parsed.houseRecordId:undefined,personal:parsePersonal(parsed.personal),onboarded:parsed.onboarded===true,homeQuery:typeof parsed.homeQuery==='string'?parsed.homeQuery:'',home:validHome(parsed.home)?parsed.home:undefined, notificationPermission:typeof parsed.notificationPermission==='string'?parsed.notificationPermission:undefined,favorites:{places:ids(parsed.favorites?.places),walks:ids(parsed.favorites?.walks)}};
 }catch{return structuredClone(initialPreferences)}
}
export function plural(n:number,one:string,few:string,many:string) {const v=n%100;return v>=11&&v<=14?many:n%10===1?one:n%10>=2&&n%10<=4?few:many;}
