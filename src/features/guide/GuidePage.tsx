import { useMemo, useState } from 'react';
import { useI18n } from '../../core/i18n';
import { LeafMap } from '../../core/Map';
import { Narration } from '../../core/Narration';
import { landmarks, landmark } from '../../core/guide';
import { go } from '../../core/router';
import { PageTitle } from '../../core/ui';
import { walks } from '../../../resident/domain/data';
import { CuratedWalk } from './CuratedWalk';
import { VisitorStories } from './VisitorStories';

export default function GuidePage({path}:{path:string}){
  const {t,l,lang}=useI18n(), [query,setQuery]=useState('');
  const chosen=landmark(path.split('/')[2]), term=query.trim().toLocaleLowerCase();
  const shown=useMemo(()=>chosen?[chosen]:landmarks.filter(p=>[p.title,l(p.name),p.address].join(' ').toLocaleLowerCase().includes(term)),[chosen,l,term]);
  const markers=useMemo(()=>shown.flatMap(p=>typeof p.lat==='number' && typeof p.lon==='number'?[{
    id:p.id,lat:p.lat,lon:p.lon,title:l(p.name),glyph:'●',size:24,onClick:()=>go('/history/landmark/'+p.id)
  }]:[]),[shown,l]);
  const walk=path.startsWith('/guide/walk/') && walks.find(w=>w.id===path.split('/')[3]);
  if(walk)return <CuratedWalk key={walk.id} walk={walk}/>;
  return <div className="page"><PageTitle title={chosen?l(chosen.name):t('guide.title')}/>
    {chosen?<a href="#/guide">← {t('guide.back')}</a>:<label>{t('guide.search')}<input type="search" value={query} onChange={e=>setQuery(e.target.value)}/></label>}
    <LeafMap markers={markers} fit label={t('guide.title')}/>
    {chosen?<>
      {chosen.archive.map(s=><a className="row" key={s.id} href={'#/history/'+s.id}>{t('hist.title')} · {l(s.title)} →</a>)}
      <p>{chosen.address}</p>{chosen.photo && <figure className="landmark-photo"><img src={import.meta.env.BASE_URL+chosen.photo.src} alt={l(chosen.name)}/><figcaption><a href={chosen.photo.sourceUrl} target="_blank" rel="noreferrer">{chosen.photo.author} · {chosen.photo.license}</a></figcaption></figure>}
      <Narration id={chosen.id} lang={lang} open/>
      <VisitorStories key={chosen.id} place={chosen.id}/></>:<>{!term&&<details><summary>{t('tab.tour')} · {walks.length}</summary><div className="list">{walks.map(w=><a className="row" key={w.id} href={'#/guide/walk/'+w.id}>{w.title} →</a>)}</div></details>}<h2>{t('guide.places')} · {shown.length}</h2>
      {!shown.length && <p>{t('guide.none')}</p>}<div className="list">{shown.map(p=><a className="row" key={p.id} href={'#/guide/'+p.id}><div className="row__main"><b>{l(p.name)}</b><span>{p.address}</span></div>→</a>)}</div></>}
    </div>;
}
