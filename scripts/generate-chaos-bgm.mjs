import fs from 'node:fs';
const rate=22050,bpm=120,beat=60/bpm,duration=32,frames=rate*duration,left=new Float64Array(frames),right=new Float64Array(frames);
function note(at,midi,length,volume,pan=0,bass=false){
  const hz=440*2**((midi-69)/12),first=Math.round(at*rate),last=Math.min(frames,first+Math.round(length*rate));
  for(let i=first;i<last;i++){const t=(i-first)/rate,env=Math.min(1,t/.008)*Math.min(1,(length-t)/.06)*Math.exp(-t*(bass?5:7));const sound=(Math.sin(2*Math.PI*hz*t+(bass?.15:.7)*Math.sin(4*Math.PI*hz*t)*Math.exp(-t*12))+.12*Math.sin(6*Math.PI*hz*t))*env*volume;left[i]+=sound*(1-pan*.3);right[i]+=sound*(1+pan*.3);}
}
const chords=[[60,64,67],[57,60,64],[65,69,72],[55,59,62]],melodies=[[76,79,76,72,74,76,79,83],[81,76,72,69,72,76,74,72],[77,81,84,81,79,77,76,74],[79,74,71,67,71,74,79,74]];
for(let bar=0;bar<16;bar++){
  const start=bar*beat*4,chord=chords[bar%4];
  for(let b=0;b<4;b++){note(start+b*beat,chord[b%2?2:0]-24,beat*.7,.12,0,true);for(const n of chord)note(start+(b+.5)*beat,n,beat*.32,.025,b%2?.25:-.25);}
  for(let n=0;n<8;n++)note(start+n*beat*.5,melodies[bar%4][n]+(bar>=8&&bar<12?-12:0),beat*.34,.055,n%2?.25:-.25);
  for(let b=0;b<8;b++){const first=Math.round((start+b*beat*.5)*rate);for(let j=0;j<rate*.045&&first+j<frames;j++){const t=j/rate,click=Math.sin(j*17.17+bar*3+b)*Math.sin(j*2.33)*Math.exp(-t*100)*.012;left[first+j]+=click;right[first+j]-=click*.6;}}
}
let peak=0;for(let i=0;i<frames;i++){const fade=Math.min(1,i/(rate*.15),(frames-1-i)/(rate*.25));left[i]*=fade;right[i]*=fade;peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));}
const wav=Buffer.alloc(44+frames*4),scale=.6/peak;wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(2,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*4,28);wav.writeUInt16LE(4,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(frames*4,40);
for(let i=0;i<frames;i++){wav.writeInt16LE(Math.round(left[i]*scale*32767),44+i*4);wav.writeInt16LE(Math.round(right[i]*scale*32767),46+i*4);}
const destination=new URL('../dist/dress-up/chaos/assets/chaos-laundry-v1.wav',import.meta.url);fs.mkdirSync(new URL('../dist/dress-up/chaos/assets/',import.meta.url),{recursive:true});fs.writeFileSync(destination,wav);console.log(`Original Chaos Laundry BGM: ${duration}s, ${bpm} BPM, ${wav.length} bytes`);
