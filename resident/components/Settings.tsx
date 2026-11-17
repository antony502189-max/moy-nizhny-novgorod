import { useState } from 'react';
import type { Preferences } from '../domain/types';
import { parseBackup } from '../domain/geo';
import { parsePreferences } from '../domain/logic';
import { places,walks } from '../domain/data';
import { emptyPersonal } from '../domain/personal';
import { integrations } from '../platform/integrations';
export function Settings({prefs,onRestore}:{prefs:Preferences;onRestore:(value:Preferences)=>void}){
 const [message,setMessage]=useState('');
 function backup(){
  const url=URL.createObjectURL(new Blob([JSON.stringify({app:'moynn-web',version:2,createdAt:new Date().toISOString(),preferences:prefs},null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='moynn-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setMessage('Резервная копия сохранена. В ней есть адрес, избранное, маршруты, посещения и заметки.');
 }
 async function restore(file?:File){if(!file)return;try{
  if(file.size>5000000)throw new Error('Файл слишком большой.');
  const imported=parsePreferences(JSON.stringify(parseBackup(await file.text())));
  const current=prefs.personal||emptyPersonal(),incoming=imported.personal||emptyPersonal();
  onRestore({...prefs,houseRecordId:imported.houseRecordId??prefs.houseRecordId,personal:{routes:[...current.routes,...incoming.routes.filter(r=>!current.routes.some(x=>x.id===r.id))].slice(0,100),visits:{...incoming.visits,...current.visits},notes:{...incoming.notes,...current.notes}},home:imported.home??prefs.home,homeQuery:imported.homeQuery||prefs.homeQuery,favorites:{places:[...new Set([...prefs.favorites.places,...imported.favorites.places])].filter(id=>places.some(p=>p.id===id)),walks:[...new Set([...prefs.favorites.walks,...imported.favorites.walks])].filter(id=>walks.some(w=>w.id===id))}});
  setMessage('Данные восстановлены. Избранное и дневник объединены с текущими. При совпадении сохраняются текущие заметки и маршруты.');
 }catch(error){setMessage(error instanceof Error?error.message:'Не удалось восстановить данные.')}}
 return <div className="settings-content"><h3>Без регистрации</h3><p>Маршруты, посещения, заметки, избранное и выбранный дом хранятся в этом браузере. Чтобы перенести их на другое устройство, сохраните и загрузите резервную копию. Выгрузку домов можно отдельно экспортировать в разделе «Мой дом».</p><button className="primary-button" onClick={backup}>Сохранить резервную копию</button><label className="backup-upload">Восстановить из файла<input type="file" accept="application/json,.json" aria-label="Восстановить из файла" onChange={e=>{void restore(e.target.files?.[0]);e.target.value=''}}/></label>{message&&<p role="status">{message}</p>}<h3>Уведомления</h3><p>Городские новости доступны в официальном канале. Уведомления об отключениях внутри приложения появятся после подключения городского источника данных.</p><a className="primary-button" href={integrations.mayor} target="_blank" rel="noopener noreferrer">Открыть официальный канал ↗</a><h3>Установить на телефон</h3><p>В меню браузера выберите «На экран Домой» или «Установить приложение». Каталог, маршруты, дневник и справочник домов доступны без сети после полной первой загрузки. Карты и городские службы требуют интернет.</p><h3>Источники данных</h3><p>Каталог восстановлен по записи приложения. Два прогулочных маршрута составлены для этой версии. Перекрытия из записи доступны как справочный архив: актуальные ограничения проверяйте на сайте города.</p><p>Это самостоятельная версия, не официальный сервис администрации.</p><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">Картографические данные © OpenStreetMap</a></div>;
}
