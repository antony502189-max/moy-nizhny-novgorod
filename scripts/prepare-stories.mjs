// Maintenance command. Only public catalogue facts and the selected archive photographs are sent.
import { readFile, writeFile, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { places } from '../resident/domain/data.ts';
import { PLACES } from '../src/data/places.ts';
import { HISTORY } from '../src/data/history.ts';

const key = process.env.DEEPSEEK_API_KEY;
if (!key) throw Error('Set DEEPSEEK_API_KEY in the maintenance process.');
const model = process.env.DEEPSEEK_MODEL || 'deepseek-flash';
const root = new URL('../', import.meta.url);
const output = new URL('guide/stories.json',root);
const catalog = new Map(places.map(p=>[p.id,{id:p.id,name:p.title,facts:p.description,source:p.descriptionSource}]));
for(const p of PLACES) if (!catalog.has(p.id)) {
  catalog.set(p.id,{id:p.id,name:p.name.ru,facts:p.blurb.ru,source:p.site || 'https://www.openstreetmap.org/?mlat='+p.lat+'&mlon='+p.lon});
}
const jobs = [...catalog.values()].map(place=>({...place,kind:'place'}));
for(const spot of HISTORY) for(const photo of spot.then) jobs.push({
  id:'photo-'+photo.id, kind:'photo', name:spot.title.ru, facts:spot.story?.ru ?? catalog.get(spot.placeId)?.facts, caption:photo.caption.ru, reconstruction:photo.generated === true,
  source:photo.credit.sourceUrl, year:photo.yearLabel.ru, image:photo.src,
});
const current = await readFile(output,'utf8').then(JSON.parse).catch(e=>{
  if(e.code==='ENOENT') return {}; throw e;
});
const result = {};
const languages=['ru','en','zh'];
const prompt = 'Write a short walking-guide narration in Russian, English and simplified Chinese, each 2 to 3 sentences. Use only the supplied facts. Do not invent dates, construction phases, people, ticket prices, stories or instructions. Explicitly identify an AI reconstruction when reconstruction is true. For a photograph mention one clearly visible feature and distinguish it from historical context. Do not claim a modern event or object is visible in the archive photograph. Be specific and spoken, without headings. Return JSON {"ru":"...","en":"...","zh":"..."}.';
for(const job of jobs) {
  const {image,...evidence}=job;
  const photo=image ? await readFile(new URL(image,root)) : null;
  const signature=createHash('sha256').update(model+prompt+JSON.stringify(evidence)).update(photo||'').digest('hex');
  if(current[job.id]?.signature===signature) { result[job.id]=current[job.id]; continue; }
  const content=[{type:'text', text:JSON.stringify(evidence)}];
  if(photo) content.push({type:'image_url',image_url:{url:'data:image/'+(image.endsWith('.webp')?'webp':'jpeg')+';base64,'+photo.toString('base64')}});
  const response=await fetch('https://api.deepseek.com/chat/completions',{
    method:'POST',headers:{authorization:'Bearer '+key,'content-type':'application/json'},
    signal:AbortSignal.timeout(90000),body:JSON.stringify({model,thinking:{type:'disabled'},
      max_tokens:800,response_format:{type:'json_object'},messages:[{role:'system',content:prompt},{role:'user',content:photo?content:content[0].text}]}),
  });
  if(!response.ok) throw Error(job.id+': DeepSeek HTTP '+response.status);
  const reply=await response.json();
  const text=JSON.parse(reply.choices[0].message.content);
  if(!languages.every(l=>typeof text[l]==='string' && text[l].length>=10 && text[l].length<=1300)) throw Error(job.id+': invalid narration');
  result[job.id]={model:reply.model || model,signature,source:job.source,text:Object.fromEntries(languages.map(l=>[l,text[l]]))};
  // Save validated progress so an interrupted refresh does not repeat paid requests.
  await save({...current,...result});
  console.log(job.id);
}
await save(result);
async function save(data) {
  const tmp=new URL('guide/stories.tmp',root);
  await writeFile(tmp,JSON.stringify(data,null,2)+'\n');
  await rename(tmp,output);
}
