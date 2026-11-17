import { useState } from 'react';
import type { PersonalData } from '../domain/types';
export function PlaceJournal({id,data,onChange}:{id:string;data:PersonalData;onChange:(data:PersonalData)=>void}){
 const [draft,setDraft]=useState(data.notes[id]||'');const [saved,setSaved]=useState(false);
 const visit=data.visits[id];
 return <section className="journal"><h3>Мои впечатления</h3><label className="visit-check"><input type="checkbox" checked={!!visit} onChange={e=>{const visits={...data.visits};if(e.target.checked)visits[id]=new Date().toISOString();else delete visits[id];onChange({...data,visits})}}/>{visit?`Посещено ${new Date(visit).toLocaleDateString('ru-RU')}`:'Я здесь был'}</label><label className="field-label">Заметка к месту<textarea maxLength={2000} rows={3} placeholder="Что понравилось, что посмотреть в следующий раз…" value={draft} onChange={e=>{setDraft(e.target.value);setSaved(false)}}/></label><button className="secondary-button" disabled={draft===(data.notes[id]||'')} onClick={()=>{const notes={...data.notes};if(draft.trim())notes[id]=draft.trim();else delete notes[id];onChange({...data,notes});setDraft(draft.trim());setSaved(true)}}>Сохранить заметку</button>{saved&&<p role="status" className="source-note">Заметка сохранена</p>}</section>;
}
