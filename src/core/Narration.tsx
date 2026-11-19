import { useEffect, useRef, useState } from 'react';
import './guide.css';
import type { Lang } from './i18n';
import { readLocal, writeLocal } from './store';

interface Story {model:string;source:string;text:Record<Lang,string>}
type Stories=Record<string,Story>;
let edition: Promise<Stories> | undefined;
function loadStories() {
  return edition ??= fetch(import.meta.env.BASE_URL+'guide/stories.json').then(r=>{
    if(!r.ok) throw Error('stories'); return r.json() as Promise<Stories>;
  }).catch(error=>{edition=undefined;throw error;});
}

export const speechLang={ru:'ru-RU',en:'en-US',zh:'zh-CN'};
const labels={
  ru:{play:'Прослушать',stop:'Остановить',source:'Источник',guide:'Аудиогид',missing:'Рассказ недоступен на этом устройстве.',noVoice:'Для этого языка нужен голос в настройках устройства.',rating:'Моя оценка рассказа',local:'Не удалось сохранить оценку.'},
  en:{play:'Listen',stop:'Stop',source:'Source',guide:'Audio guide',missing:'This story is unavailable on this device.',noVoice:'Install a voice for this language on your device.',rating:'My story rating',local:'Could not save rating.'},
  zh:{play:'收听',stop:'停止',source:'来源',guide:'语音导览',missing:'此设备无法读取故事。',noVoice:'请在设备设置中安装该语言的语音。',rating:'我的故事评分',local:'无法保存评分。'},
};
export function ReadAloud({text,lang,clip}:{text:string;lang:Lang;clip?:string}) {
  const l=labels[lang], [state,setState]=useState<'idle'|'playing'|'error'>('idle');
  const audio=useRef<HTMLAudioElement|null>(null);
  const generation=useRef(0), ownsSpeech=useRef(false);
  function stop(){
    generation.current++; audio.current?.pause(); audio.current=null;
    if(ownsSpeech.current)window.speechSynthesis?.cancel(); ownsSpeech.current=false;setState('idle');
  }
  useEffect(()=>{setState('idle');return ()=>{generation.current++;audio.current?.pause();if(ownsSpeech.current)window.speechSynthesis?.cancel();ownsSpeech.current=false};},[text,lang]);
  const play=async()=>{
    window.dispatchEvent(new Event('ng-stop-audio'));
    const n=++generation.current, ss=window.speechSynthesis;
    const finish=(state:'idle'|'error')=>{if(generation.current===n){ownsSpeech.current=false;setState(state)}};
    const fallback=async()=>{
      if(!clip || lang!=='ru') {finish('error');return;}
      const a=new Audio(import.meta.env.BASE_URL+'guide/audio/'+clip+'.m4a');audio.current=a;
      a.onended=()=>finish('idle');a.onerror=()=>finish('error');
      try {await a.play()} catch {finish('error')}
    };
    setState('playing');
    const voice=ss?.getVoices().find(v=>v.localService && v.lang.toLowerCase().startsWith(lang));
    if(!voice && clip && lang==='ru') {await fallback(); return;}
    if(!ss || !voice) {finish('error');return;}
    const u=new SpeechSynthesisUtterance(text);u.lang=speechLang[lang];if(voice)u.voice=voice;
    u.onend=()=>finish('idle');u.onerror=()=>{if(generation.current===n)void fallback()};ownsSpeech.current=true;ss.speak(u);
  };
  useEffect(()=>{const halt=()=>stop();window.addEventListener('ng-stop-audio',halt);return()=>window.removeEventListener('ng-stop-audio',halt);},[]);
  return <><button type="button" className="chip" aria-pressed={state==='playing'} onClick={state==='playing'?stop:play}>{state==='playing'?l.stop:'▷ '+l.play}</button>{state==='error'&&<small role="status">{l.noVoice}</small>}</>;
}

export function StoryRating({id,lang}:{id:string;lang:Lang}) {
  const key='ng.storyRating.'+id, [score,setScore]=useState(()=>readLocal(key,0)), [error,setError]=useState(false);
  useEffect(()=>{setScore(readLocal(key,0));setError(false)},[key]);
  return <div className="story-rating" role="group" aria-label={labels[lang].rating}><small>{labels[lang].rating}</small>
    {[1,2,3,4,5].map(n=><button type="button" key={n} aria-label={n+' / 5'} aria-pressed={score===n} onClick={()=>{
      const next=score===n?0:n;const ok=writeLocal(key,next);if(ok)setScore(next);setError(!ok);
    }}>{n}★</button>)}{error&&<small>{labels[lang].local}</small>}</div>;
}

export function Narration({id,lang,open=false}:{id:string;lang:Lang;open?:boolean}) {
  const [stories,setStories]=useState<Stories>(),[failed,setFailed]=useState(false);
  useEffect(()=>{let alive=true;loadStories().then(s=>{if(alive)setStories(s)},()=>{if(alive)setFailed(true)});return()=>{alive=false}},[]);
  const story=stories?.[id], l=labels[lang];
  return <details key={id} className="narration" open={open || undefined}><summary>{l.guide}{story?.model.startsWith('deepseek') ? ' · DeepSeek' : ''}</summary>
    {story?<><p>{story.text[lang]}</p><div className="chips"><ReadAloud text={story.text[lang]} lang={lang} clip={id}/><a href={story.source} target="_blank" rel="noreferrer">{l.source} ↗</a></div>
      <StoryRating id={'deepseek.'+id} lang={lang}/></> : <p role="status">{failed || stories?l.missing:'…'}</p>}</details>;
}
