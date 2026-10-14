import fs from 'node:fs';
import path from 'node:path';
const rate=22050,bpm=80,beat=60/bpm,duration=48,frames=rate*duration;
const left=new Float64Array(frames),right=new Float64Array(frames);
const frequency=note=>440*2**((note-69)/12);
function add(start,length,note,volume,pan=0,kind='keys'){
  const hz=frequency(note),first=Math.floor(start*rate),last=Math.min(frames,first+Math.floor(length*rate));
  for(let i=first;i<last;i++){
    const t=(i-first)/rate,end=length-t,attack=Math.min(1,t/.018),release=Math.min(1,end/.15);
    let value;
    if(kind==='bass')value=(Math.sin(2*Math.PI*hz*t)+.16*Math.sin(4*Math.PI*hz*t))*Math.exp(-t*1.8);
    else if(kind==='bell')value=Math.sin(2*Math.PI*hz*t+1.2*Math.sin(2*Math.PI*hz*2*t)*Math.exp(-t*6))*Math.exp(-t*3);
    else value=(Math.sin(2*Math.PI*hz*t+.65*Math.sin(2*Math.PI*hz*2*t)*Math.exp(-t*2.5))+.08*Math.sin(2*Math.PI*hz*3*t))*Math.exp(-t*.9);
    value*=volume*attack*release;left[i]+=value*(1-pan*.35);right[i]+=value*(1+pan*.35);
  }
}
const chords=[[60,64,67,71,74],[57,60,64,67,71],[62,65,69,72,76],[55,59,62,65,69]];
for(let bar=0;bar<16;bar++){
  const chord=chords[bar%4],start=bar*beat*4;
  for(const [n,note] of chord.entries()){add(start+n*.018,beat*3.7,note,.029,n%2?.35:-.35);add(start+beat*2.5,beat*1.25,note,.012,n%2?-.3:.3);}
  add(start,beat*1.65,chord[0]-12,.1,-.1,'bass');add(start+beat*2,beat*1.7,chord[0]-12,.075,.1,'bass');
  if(bar%2===0){add(start+beat,beat*.85,chord[4]+12,.025,-.2,'bell');add(start+beat*3.25,beat*.65,chord[2]+12,.023,.2,'bell');}
  for(let b=0;b<4;b++){
    const first=Math.floor((start+beat*b)*rate);
    for(let j=0;j<rate*.13&&first+j<frames;j++){
      const t=j/rate,kick=Math.sin(2*Math.PI*(48*t+23*(1-Math.exp(-t*25))/25))*Math.exp(-t*38)*.045;
      // Deterministic soft brushed percussion: no samples or third-party audio.
      const noise=Math.sin(j*17.17+bar*11+b*7)*Math.sin(j*3.11)*Math.exp(-t*48)*.012;
      left[first+j]+=kick+noise;right[first+j]+=kick-noise*.6;
    }
  }
}
let peak=0;for(let i=0;i<frames;i++){const fade=Math.min(1,i/(rate*.15),(frames-1-i)/(rate*.4));left[i]*=fade;right[i]*=fade;peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));}
const scale=.66/peak,pcm=Buffer.alloc(frames*4+44);pcm.write('RIFF');pcm.writeUInt32LE(pcm.length-8,4);pcm.write('WAVEfmt ',8);pcm.writeUInt32LE(16,16);pcm.writeUInt16LE(1,20);pcm.writeUInt16LE(2,22);pcm.writeUInt32LE(rate,24);pcm.writeUInt32LE(rate*4,28);pcm.writeUInt16LE(4,32);pcm.writeUInt16LE(16,34);pcm.write('data',36);pcm.writeUInt32LE(frames*4,40);
for(let i=0;i<frames;i++){pcm.writeInt16LE(Math.round(left[i]*scale*32767),44+i*4);pcm.writeInt16LE(Math.round(right[i]*scale*32767),46+i*4);}
const destination=path.resolve(import.meta.dirname,'../dist/dress-up/assets/seoul-afterglow-v1.wav');fs.writeFileSync(destination,pcm);console.log(`Original lounge BGM: ${duration}s, ${bpm} BPM, ${pcm.length} bytes -> ${destination}`);
