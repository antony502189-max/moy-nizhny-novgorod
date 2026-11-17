import { useEffect, useState } from 'react';
import { useI18n } from '../../core/i18n';
import { distanceM, type LatLon } from '../../core/geo';
import { useLocal } from '../../core/store';
import { Narration } from '../../core/Narration';
import { landmark } from '../../core/guide';
import type { Tour } from './planner';

async function thumbnail(file:File){
  const url=URL.createObjectURL(file);
  try{
    const img=new Image();img.src=url;await img.decode();
    const ratio=Math.min(1,800/Math.max(img.naturalWidth,img.naturalHeight));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(img.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(img.naturalHeight*ratio));
    const ctx=canvas.getContext('2d');if(!ctx)throw Error('image');
    ctx.drawImage(img,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',0.72);
  }finally{URL.revokeObjectURL(url)}
}
export function Walking({tour}:{tour:Tour}){
  const {l,t,lang}=useI18n(),ids=tour.stops.map(s=>s.id);
  const key='ng.walk.'+(tour.profile||'walk')+'.'+ids.join(',');
  const [progress,save]=useLocal(key,-1),[photos,savePhotos]=useLocal<string[]>(key+'.photos',[]);
  const [track,setTrack]=useState(false),[pos,setPos]=useState<LatLon|null>(null),[error,setError]=useState(''),[saving,setSaving]=useState(false);
  const index=Number.isInteger(progress)?Math.max(-1,Math.min(progress,ids.length)):-1;
  const complete=index===ids.length, current=landmark(ids[index]);
  useEffect(()=>{
    if(!track || complete)return;
    const failed=()=>{setTrack(false);setPos(null);setError('walk.geo')};
    if(!navigator.geolocation){failed();return;}
    const watch=navigator.geolocation.watchPosition(p=>{setPos({lat:p.coords.latitude,lon:p.coords.longitude});setError('')},failed,{enableHighAccuracy:true,maximumAge:10000,timeout:20000});
    return ()=>navigator.geolocation.clearWatch(watch);
  },[track,complete]);
  const near=pos && ids.slice(index).flatMap(id=>{const p=landmark(id);return p?.lat && p.lon?[{...p,lat:p.lat,lon:p.lon}]:[]}).filter(p=>distanceM(pos,p)<=100).sort((a,b)=>distanceM(pos,a)-distanceM(pos,b))[0];
  const advance=(i:number)=>{if(!save(i))setError('common.storageError');if(i===ids.length){setTrack(false);setPos(null)}};
  return <section className="card field walk-control">{index<0?<button className="btn" onClick={()=>advance(0)}>{t('walk.begin')}</button>:complete?
    <><h3>{t('walk.finish')}</h3><label>{t('walk.addphoto')}<input disabled={saving} type="file" accept="image/*" onChange={async e=>{
      const file=e.currentTarget.files?.[0];e.currentTarget.value='';if(!file)return;setSaving(true);
      try{const data=await thumbnail(file);if(!savePhotos([...photos,data]))throw Error();setError('')}
      catch{setError('walk.photoError')}finally{setSaving(false)}
    }}/></label><div className="walk-photos" aria-label={t('walk.photos')}>{photos.map((src,i)=><figure key={i}><img src={src} alt={t('walk.photos')+' '+(i+1)}/><button className="chip" onClick={()=>{if(!savePhotos(photos.filter((_,j)=>j!==i)))setError('common.storageError')}}>{t('walk.remove')}</button></figure>)}</div>
      <button className="chip" onClick={()=>advance(0)}>{t('walk.restart')}</button></>:
    current&&<><h3>{index+1} / {ids.length} · {l(current.name)}</h3>
      <div className="chips"><button className="chip" aria-pressed={track} onClick={()=>{setError('');setPos(null);setTrack(!track)}}>{t(track?'walk.watching':'walk.locate')}</button>
        <button className="btn btn--sm" onClick={()=>advance(index+1)}>{t('walk.next')}</button></div>
      {near&&<div className="banner" role="status"><a href={'#/guide/'+near.id}>{t('walk.near')} · {l(near.name)} →</a></div>}
      <Narration id={near?near.id:current.id} lang={lang} open/></>}
    {error&&<p role="alert">{t(error)}</p>}</section>;
}
