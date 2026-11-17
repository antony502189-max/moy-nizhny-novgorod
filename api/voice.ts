import { reserveModelCall } from '../server/quota.ts';
import { acceptOrigin } from '../server/origin.ts';

interface Req {method?:string;headers?:Record<string,string|string[]|undefined>;body?:{wav?:unknown}}
interface Res {status(n:number):Res;json(v:unknown):void;setHeader(k:string,v:string):void}
export default async function voice(req:Req,res:Res) {
  res.setHeader('cache-control','no-store');
  if(!acceptOrigin(req,res))return res.status(403).json({error:'origin'});
  if(req.method==='OPTIONS')return res.status(200).json({});
  if(req.method!=='POST')return res.status(405).json({error:'method'});
  const key=process.env.DEEPSEEK_API_KEY;
  if(process.env.TOUR_API_ENABLED!=='1'||!key)return res.status(503).json({error:'offline_only'});
  const input=req.body?.wav;
  if(typeof input!=='string'||input.length>1400000)return res.status(400).json({error:'audio'});
  const bytes=Buffer.from(input,'base64');
  if(bytes.length<44 || bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WAVE')return res.status(400).json({error:'wav'});
  try {if(!await reserveModelCall())return res.status(429).json({error:'quota_exceeded'});}
  catch{return res.status(503).json({error:'quota_unavailable'})}
  try {
    const form=new FormData();form.set('file',new Blob([new Uint8Array(bytes)],{type:'audio/wav'}),'request.wav');
    const response=await fetch('https://api.deepseek.com/v1/tools/asr',{method:'POST',headers:{authorization:'Bearer '+key},body:form,signal:AbortSignal.timeout(20000)});
    if(!response.ok)return res.status(502).json({error:'speech_failed'});
    const result=await response.json();
    if(typeof result.text!=='string'||!result.text.trim())return res.status(422).json({error:'no_speech'});
    return res.status(200).json({text:result.text.trim().slice(0,400)});
  } catch{return res.status(502).json({error:'speech_failed'})}
}
