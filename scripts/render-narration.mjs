// Offline maintenance step. Pass a local eSpeak NG Emscripten module and an ffmpeg executable.
import { mkdtemp, readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
const factory=(await import(pathToFileURL(resolve(process.argv[2])).href)).default;
const module=await factory();
const voice=new module.eSpeakNGWorker();
voice.set_voice('ru'); voice.set_rate(155);
const rate=voice.get_samplerate();
const temp=await mkdtemp(join(tmpdir(),'nizhny-audio-'));
await mkdir('guide/audio',{recursive:true});
const stories=JSON.parse(await readFile('guide/stories.json','utf8'));
for(const [id,story] of Object.entries(stories)){
  const chunks=[];
  voice.synthesize(story.text.ru, samples=>{chunks.push(Buffer.from(new Uint8Array(samples.buffer,samples.byteOffset,samples.byteLength)));return 0;});
  const pcm=Buffer.concat(chunks);
  if(pcm.length<rate || !pcm.some(v=>v))throw Error('Silent narration: '+id);
  const header=Buffer.alloc(44);
  header.write('RIFF');header.writeUInt32LE(36+pcm.length,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);
  header.writeUInt16LE(1,20);header.writeUInt16LE(1,22);header.writeUInt32LE(rate,24);header.writeUInt32LE(rate*2,28);
  header.writeUInt16LE(2,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.length,40);
  const wav=join(temp,'story.wav');
  await writeFile(wav,Buffer.concat([header,pcm]));
  execFileSync(process.argv[3] || 'ffmpeg',['-loglevel','error','-y','-i',wav,'-c:a','aac','-b:a','32k','-movflags','+faststart','guide/audio/'+id+'.m4a']);
}
console.log(Object.keys(stories).length+' audio clips');
