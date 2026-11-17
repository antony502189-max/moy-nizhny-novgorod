import network from '../data/curated-walking.json' with {type:'json'};
const edges=network.profiles.walk as Record<string,number[]>;
export function curatedLegs(ids:string[]){
  return ids.slice(1).map((end,i)=>{
    const edge=edges[ids[i]+'>'+end];
    if(!edge)return {id:ids[i]+'>'+end,meters:0,points:[] as [number,number][]};
    const [meters,ref]=edge,deltas=network.geometry[Math.abs(ref)-1];
    let y=0,x=0;const points:[number,number][]=[];
    for(let j=0;j<deltas.length;j+=2){y+=deltas[j];x+=deltas[j+1];points.push([y/100000,x/100000]);}
    return {id:ids[i]+'>'+end,meters,points:ref<0?points.reverse():points};
  });
}
