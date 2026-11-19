import {useMemo} from 'react';
import type {Walk} from '../../../resident/domain/types';
import {landmark} from '../../core/guide';
import {curatedLegs} from '../../core/curatedPaths';
import {useI18n} from '../../core/i18n';
import {LeafMap} from '../../core/Map';
import {go} from '../../core/router';
import {PageTitle} from '../../core/ui';
import {Walking} from '../tour/Walking';

export function CuratedWalk({walk}:{walk:Walk}){
  const {t,l}=useI18n();
  const ids=walk.placeIds||[];
  const markers=useMemo(()=>ids.flatMap((id,i)=>{
    const p=landmark(id);if(!p?.lat||!p.lon)return [];
    return [{id,lat:p.lat,lon:p.lon,title:l(p.name),glyph:String(i+1),onClick:()=>go('/history/landmark/'+id)}];
  }),[walk,l]);
  const lines=useMemo(()=>curatedLegs(ids),[walk]);
  return <div className="page"><PageTitle title={walk.title}/><a href="#/guide">← {t('guide.back')}</a>
    <LeafMap fit markers={markers} lines={lines.filter(line=>line.points.length>1)}/>
    <p>{walk.description}</p><Walking tour={{source:'shared',title:walk.title,summary:'',stops:ids.map(id=>({id,minutes:0}))}}/>
    <div className="list">{markers.map(m=><a key={m.id} className="row" href={'#/guide/'+m.id}>{m.glyph}. {m.title} →</a>)}</div></div>;
}
