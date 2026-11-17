import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../core/i18n';
import { speechLang } from '../../core/Narration';
import micWorklet from './mic-worklet.js?url';

type Recognition = {lang:string;interimResults:boolean;continuous:boolean;start():void;stop():void;abort():void;
  onresult:((e:{results:{[i:number]:{[i:number]:{transcript:string}}}})=>void)|null;
  onerror:(()=>void)|null;onend:(()=>void)|null};
const endpoint=import.meta.env.VITE_VOICE_API;
export function VoiceInput({onText}:{onText:(s:string)=>void}){
  const {lang,t}=useI18n();
  const browser=window as typeof window & {SpeechRecognition?:new()=>Recognition;webkitSpeechRecognition?:new()=>Recognition};
  const Recognizer=browser.SpeechRecognition||browser.webkitSpeechRecognition;
  const [active,setActive]=useState(''),[message,setMessage]=useState('');
  const recognizer=useRef<Recognition|null>(null),end=useRef<null|(()=>void)>(null);
  const serial=useRef(0),abort=useRef<AbortController|null>(null);
  const release=useRef<()=>void>(()=>{});
  useEffect(()=>()=>{serial.current++;recognizer.current?.abort();release.current();abort.current?.abort()},[lang]);
  useEffect(()=>{setActive('');setMessage('')},[lang]);
  function startBrowser(){
    if(!Recognizer)return;
    const s=new Recognizer();const run=++serial.current;recognizer.current=s;
    s.lang=speechLang[lang];s.interimResults=false;s.continuous=false;
    s.onresult=e=>{if(run===serial.current)onText(e.results[0][0].transcript.trim().slice(0,400))};
    s.onerror=()=>{if(run===serial.current){setActive('');setMessage(t('voice.failed'))}};
    s.onend=()=>{if(run===serial.current)setActive('')};
    setMessage('');setActive('browser');
    try{s.start()}catch{setActive('');setMessage(t('voice.failed'))}
  }
  async function record(){
    const run=++serial.current;setMessage('');setActive('starting');
    let stream:MediaStream|undefined,ctx:AudioContext|undefined,timer=0;
    function close(){window.clearTimeout(timer);stream?.getTracks().forEach(tr=>tr.stop());if(ctx && ctx.state!=='closed')void ctx.close();ctx=undefined;end.current=null}
    release.current=close;
    try {
      stream=await navigator.mediaDevices.getUserMedia({audio:true});
      if(run!==serial.current){close();return;}
      ctx=new AudioContext({sampleRate:16000});await ctx.audioWorklet.addModule(micWorklet);
      if(run!==serial.current || !ctx){close();return;}
      const rate=ctx.sampleRate,source=ctx.createMediaStreamSource(stream),node=new AudioWorkletNode(ctx,'tour-microphone');
      const mute=ctx.createGain();mute.gain.value=0;source.connect(node).connect(mute).connect(ctx.destination);
      const chunks:Float32Array[]=[];let length=0;
      node.port.onmessage=({data})=>{if(length<rate*30){chunks.push(data);length+=data.length}};
      await ctx.resume();
      if(run!==serial.current){close();return;}
      async function finish(){
        if(!end.current)return;close();setActive('sending');
        try {
          const wav=new ArrayBuffer(44+length*2), view=new DataView(wav);
          const tag=(at:number,s:string)=>[...s].forEach((c,i)=>view.setUint8(at+i,c.charCodeAt(0)));
          tag(0,'RIFF');view.setUint32(4,36+2*length,true);tag(8,'WAVEfmt ');view.setUint32(16,16,true);
          view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,rate,true);view.setUint32(28,rate*2,true);
          view.setUint16(32,2,true);view.setUint16(34,16,true);tag(36,'data');view.setUint32(40,length*2,true);
          let i=44;for(const part of chunks)for(const x of part){view.setInt16(i,Math.max(-1,Math.min(1,x))*32767,true);i+=2;}
          const bytes=new Uint8Array(wav);let encoded='';for(let i=0;i<bytes.length;i+=8192)encoded+=String.fromCharCode(...bytes.subarray(i,i+8192));
          const ctl=new AbortController();abort.current=ctl;
          const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({wav:btoa(encoded)}),signal:AbortSignal.any([ctl.signal,AbortSignal.timeout(25000)])});
          if(!response.ok)throw Error('asr');const result=await response.json();
          if(typeof result.text!=='string')throw Error('text');if(serial.current===run)onText(result.text.slice(0,400));
        } catch {if(serial.current===run)setMessage(t('voice.failed'))} finally{if(serial.current===run)setActive('')}
      }
      end.current=()=>void finish();timer=window.setTimeout(end.current,30000);setActive('deepseek');
    } catch {close();if(run===serial.current){setMessage(t('voice.failed'));setActive('')}}
  }
  return <div className="field"><div className="chips">
    {Recognizer && <button type="button" className="chip" disabled={!!active && active!=='browser'} onClick={active==='browser'?()=>recognizer.current?.stop():startBrowser}>{t(active==='browser'?'voice.stop':'voice.browser')}</button>}
    {endpoint && <button type="button" className="chip" disabled={!!active && active!=='deepseek'} onClick={active==='deepseek'?()=>end.current?.():()=>void record()}>{t(active==='deepseek'?'voice.finish':'voice.deepseek')}</button>}
  </div><small className="muted" role="status">{message || t(active==='sending'?'voice.processing':active?'voice.listen':Recognizer||endpoint?'voice.hint':'voice.unsupported')}</small></div>;
}
