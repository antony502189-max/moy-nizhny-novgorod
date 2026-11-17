import { useEffect, useRef, useState } from 'react';
import { Search, X, Wrench, Building2, BookOpen, Smartphone, MapPin } from 'lucide-react';
import type { Preferences, SavedHome } from '../domain/types';
import { searchAddress } from '../platform/geocoding';
import { HouseContacts } from './HouseContacts';
import { HousingRegistry } from './HousingRegistry';
import { LiveMap } from './LiveMap';
import { integrations, objectMapUrl } from '../platform/integrations';
export function HousePanel({prefs,onChange}:{prefs:Preferences;onChange:(value:Preferences)=>void}){
 const [results,setResults]=useState<SavedHome[]>([]);const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 const request=useRef<AbortController|null>(null);
 useEffect(()=>()=>request.current?.abort(),[]);
 function changeQuery(q:string){request.current?.abort();setBusy(false);setResults([]);setMessage('');onChange({...prefs,homeQuery:q})}
 async function search(){
  request.current?.abort();const controller=new AbortController();request.current=controller;
  setBusy(true);setMessage('');setResults([]);
  try{const found=await searchAddress(prefs.homeQuery,controller.signal);if(controller.signal.aborted)return;setResults(found);if(!found.length)setMessage('Адрес не найден. Уточните улицу и номер дома или откройте поиск в Яндекс.Картах.');}
  catch(error){if(!controller.signal.aborted)setMessage(error instanceof Error&&error.name!=='TypeError'?error.message:'Не удалось открыть справочник. Повторите поиск.');}
  finally{if(!controller.signal.aborted)setBusy(false)}
 }
 return <div className="white-surface house-content">
  <h2>Полезная информация<br/>о вашем доме</h2><p className="house-intro">Найдите дом в открытом реестре или выберите адрес на карте.</p>
  <HousingRegistry prefs={prefs} onChange={onChange}/><details className="online-address"><summary>Поиск на встроенной карте</summary><form onSubmit={e=>{e.preventDefault();void search()}}><div className="address-search"><Search size={17}/><input aria-label="Введите адрес" placeholder="Например, Большая Покровская, 29" value={prefs.homeQuery} onChange={e=>changeQuery(e.target.value)}/>{prefs.homeQuery&&<button type="button" onClick={()=>changeQuery('')} aria-label="Очистить адрес"><X size={14}/></button>}</div><button type="submit" className="primary-button search-submit" disabled={busy||prefs.homeQuery.trim().length<3}>{busy?'Ищем адрес…':'Найти дом'}</button></form>
  <p className="source-note">Адреса из выбранного справочника и городского каталога. На карте показаны записи с координатами.</p>
  {message&&<div className="inline-message" role="status"><p>{message}</p><a target="_blank" rel="noopener noreferrer" href={objectMapUrl('yandex','',`Нижний Новгород, ${prefs.homeQuery}`)}>Поиск в Яндекс.Картах ↗</a></div>}
  {results.length>0&&<div className="address-results" aria-label="Найденные адреса"><p>Выберите подходящий адрес:</p>{results.map((home,i)=><button key={`${home.lat}:${home.lon}:${i}`} onClick={()=>{onChange({...prefs,houseRecordId:undefined,home,homeQuery:home.label});setResults([]);setMessage('')}}><MapPin size={19}/><span>{home.label}</span></button>)}</div>}
  </details>{prefs.home&&<section className="saved-home"><h2>Ваш дом</h2><p>{prefs.home.label}</p><LiveMap points={[{...prefs.home,title:prefs.home.label}]}/><a className="text-link" target="_blank" rel="noopener noreferrer" href={objectMapUrl('yandex','',prefs.home.label)}>Открыть в картах ↗</a><button className="text-link" onClick={()=>onChange({...prefs,home:undefined,houseRecordId:undefined})}>Убрать сохранённый адрес</button></section>}
  <section className="house-benefits"><h2>Городские службы</h2><p className="source-note">Сведения об отключениях и управляющей компании проверяйте в официальных источниках. Управляющая организация также указана в карточке дома из выгрузки, если сведения были опубликованы.</p>
  {[[Wrench,'Отключения воды и теплоснабжение',integrations.utilities],[Building2,'Найти управляющую компанию в ГИС ЖКХ',integrations.housing],[BookOpen,'Сообщить о проблеме в доме',integrations.requests],[Smartphone,'Городские новости и уведомления',integrations.mayor]].map(([Icon,label,url],i)=>{const Glyph=Icon as typeof Wrench;return <a className="house-benefit" key={i} href={url as string} target="_blank" rel="noopener noreferrer"><span><Glyph size={21}/></span><p>{label as string} ↗</p></a>})}
  </section>
  <HouseContacts/>
 </div>;
}
