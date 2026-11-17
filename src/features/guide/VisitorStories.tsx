import { useEffect, useState, type FormEvent } from 'react';
import { useI18n, LANGS, type Lang } from '../../core/i18n';
import { readLocal, writeLocal } from '../../core/store';
import { ReadAloud, StoryRating } from '../../core/Narration';

interface Story {id:string; place:string; author:string; text:string; lang:Lang}
function valid(s:unknown, place:string):s is Story {
  if(!s || typeof s!=='object')return false;
  const v=s as Partial<Story>;
  return v.place===place && typeof v.id==='string' && /^[\w-]{1,64}$/.test(v.id)
    && typeof v.author==='string' && !!v.author.trim() && v.author.length<=60
    && typeof v.text==='string' && !!v.text.trim() && v.text.length<=2000 && LANGS.includes(v.lang as Lang);
}
function sharedStory(place:string){
  try{
    const raw=new URLSearchParams(location.hash.split('?')[1]).get('story');
    if(!raw || raw.length>20000)return null;
    const parsed=JSON.parse(raw);
    return valid(parsed,place)?parsed:null;
  }catch{return null}
}
export function VisitorStories({place}:{place:string}) {
  const {t,lang}=useI18n(), key='ng.stories.'+place;
  const get=()=>{const all=readLocal<unknown>(key,[]);return Array.isArray(all)?all.filter(s=>valid(s,place)):[]};
  const [stories,setStories]=useState(get), [error,setError]=useState('');
  const [incoming,setIncoming]=useState(()=>sharedStory(place)),[shareLink,setShareLink]=useState('');
  useEffect(()=>{
    const update=()=>setIncoming(sharedStory(place));window.addEventListener('hashchange',update);
    return ()=>window.removeEventListener('hashchange',update);
  },[place]);
  function share(story:Story){
    const url=new URL(location.href);url.hash='/guide/'+place+'?'+new URLSearchParams({story:JSON.stringify(story)});
    setShareLink(url.href);
    if(navigator.share)void navigator.share({title:story.author,url:url.href}).catch(()=>{});
    else void navigator.clipboard?.writeText(url.href).catch(()=>{});
  }
  function save(s:Story){
    const items=get(),next=[s,...items.filter(v=>v.id!==s.id)].slice(0,100);
    if(!writeLocal(key,next)){setError(t('common.storageError'));return false;}
    setStories(next);setError('');return true;
  }
  function add(e:FormEvent<HTMLFormElement>){
    e.preventDefault();const form=e.currentTarget,fields=new FormData(form);
    const story={id:crypto.randomUUID(),place,author:String(fields.get('author')).trim(),text:String(fields.get('text')).trim(),lang};
    if(valid(story,place) && save(story))form.reset();
  }
  function download(s:Story){
    const url=URL.createObjectURL(new Blob([JSON.stringify(s)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download=place+'-story.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  return <section className="field"><h3>{t('guide.stories')}</h3><small>{t('guide.local')}</small>
    {incoming && !stories.some(s=>s.id===incoming.id) && <article className="card"><b>{incoming.author}</b> · {t('guide.visitor')}<p>{incoming.text}</p><button className="chip" onClick={()=>save(incoming)}>{t('tour.save')}</button></article>}
    {shareLink && <label>{t('tour.share')}<input readOnly value={shareLink} onFocus={e=>e.currentTarget.select()}/></label>}
    {stories.map(s=><article key={s.id} className="card"><b>{s.author}</b> · {t('guide.visitor')}<p>{s.text}</p>
      <div className="chips"><ReadAloud lang={s.lang} text={s.text}/><button className="chip" onClick={()=>share(s)}>{t('tour.share')}</button><button className="chip" onClick={()=>download(s)}>{t('guide.export')}</button></div>
      <StoryRating id={place+'.'+s.id} lang={lang}/></article>)}
    <details><summary>{t('guide.add')}</summary><form className="field" onSubmit={add}>
      <label>{t('guide.author')}<input name="author" maxLength={60} required/></label>
      <label>{t('guide.text')}<textarea name="text" maxLength={2000} required/></label>
      <button className="btn">{t('guide.add')}</button></form></details>
    <label>{t('guide.import')}<input type="file" accept="application/json,.json" onChange={async e=>{
      const file=e.currentTarget.files?.[0];e.currentTarget.value='';if(!file)return;
      try{if(file.size>20000)throw Error();const story=JSON.parse(await file.text());if(!valid(story,place))throw Error();save(story)}
      catch{setError(t('guide.invalid'))}
    }}/></label>{error&&<p role="alert">{error}</p>}</section>;
}
