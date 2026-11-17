import { useEffect, useRef, useState } from 'react';
import { searchAddress } from '../platform/geocoding';
import type { SavedHome } from '../domain/types';
import { LiveMap } from './LiveMap';
export function LocationLookup({query}:{query:string}){
 const [results,setResults]=useState<SavedHome[]>([]);const [selected,setSelected]=useState<SavedHome>();const [status,setStatus]=useState('');const [busy,setBusy]=useState(false);
 const controller=useRef<AbortController|null>(null);useEffect(()=>()=>controller.current?.abort(),[]);
 async function search(){
  controller.current?.abort();const active=new AbortController();controller.current=active;setBusy(true);setStatus('');
  try{const found=await searchAddress(query.replace(/^Нижний Новгород,\s*/,''),active.signal);if(active.signal.aborted)return;setResults(found);if(!found.length)setStatus('Место не найдено в открытом справочнике. Используйте внешние карты ниже.');}
  catch{if(!active.signal.aborted)setStatus('Не удалось открыть справочник. Можно открыть адрес во внешних картах.');}finally{if(!active.signal.aborted)setBusy(false)}
 }
 return <div className="location-lookup">{selected?<LiveMap points={[{...selected,title:selected.label}]}/>:<button className="primary-button" disabled={busy} onClick={()=>void search()}>{busy?'Ищем место…':'Найти на карте'}</button>}{status&&<p role="status">{status}</p>}{!selected&&results.length>0&&<div className="address-results"><p>Уточните место:</p>{results.map((p,i)=><button key={i} onClick={()=>setSelected(p)}>{p.label}</button>)}</div>}<p className="source-note">Поиск по адресам с координатами в местном справочнике. Найденный адрес не обозначает границы перекрытия.</p></div>;
}
