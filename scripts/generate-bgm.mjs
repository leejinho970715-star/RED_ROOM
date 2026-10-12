import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

// Original 16-bar D-minor basement chiptune, 96 BPM. No sampled recordings.
const rate=22050,beat=60/96,duration=16*4*beat,length=Math.round(rate*duration);
const left=new Float64Array(length),right=new Float64Array(length);
const hz=n=>440*2**((n-69)/12);
let seed=707;
const noise=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/2**31-1;};
function add(start,seconds,voice,pan=0){
 const offset=Math.round(start*rate),count=Math.round(seconds*rate);
 for(let i=0;i<count&&offset+i<length;i++){
  const t=i/rate,value=voice(t,seconds);
  left[offset+i]+=value*Math.sqrt((1-pan)/2);
  right[offset+i]+=value*Math.sqrt((1+pan)/2);
 }
}
function note(midi,start,seconds,volume,type='triangle',pan=0){
 const f=hz(midi);
 add(start,seconds,(t,d)=>{
  const phase=(t*f)%1;
  const wave=type==='pulse'?(phase<.28?1:-1):type==='sine'?Math.sin(2*Math.PI*f*t):1-4*Math.abs(phase-.5);
  const attack=Math.min(1,t/.012),release=Math.min(1,(d-t)/.06);
  return volume*wave*attack*release*Math.exp(-t*(type==='pulse'?3:.5));
 },pan);
}
const chords=[[38,53,57,60,65],[34,53,58,62,65],[41,53,57,60,65],[36,55,60,64,67]];
const lead=[0,2,1,3,2,1,3,1];
for(let bar=0;bar<16;bar++){
 const chord=chords[Math.floor(bar/4)],start=bar*4*beat;
 // Quiet harmonic bed, short bass pulses and a syncopated stereo arpeggio.
 for(const n of chord.slice(1,4))note(n,start,4*beat,.026,'sine',(n%3-1)*.45);
 for(let step=0;step<8;step++){
  const time=start+step*beat/2;
  note(chord[0]+(step===6?12:0),time,beat*.38,.12,'triangle');
  if(step!==3)note(chord[1+lead[step]],time+beat*.06,beat*.32,.045,'pulse',step%2?.45:-.45);
  add(time,.065,t=>Math.round(noise()*8)/8*.022*Math.exp(-t*70),step%2?.3:-.3);
 }
 for(let step=0;step<4;step++){
  const time=start+step*beat;
  if(step%2===0)add(time,.28,t=>Math.sin(2*Math.PI*(42*t+9*(1-Math.exp(-t*25))))*.23*Math.exp(-t*16));
  else add(time,.16,t=>(noise()*.07+Math.sin(2*Math.PI*170*t)*.035)*Math.exp(-t*24),.12);
 }
 if(bar>=8&&bar%2===1)for(let step=0;step<4;step++)note(chord[[4,3,2,3][step]]+12,start+(2+step/2)*beat,beat*.33,.055,'triangle',-.2);
}
const pcm=Buffer.alloc(length*4);
for(let i=0;i<length;i++){
 const edge=Math.min(1,i/(rate*.008),(length-1-i)/(rate*.015));
 pcm.writeInt16LE(Math.round(Math.tanh(left[i]*1.35)*.83*edge*32767),i*4);
 pcm.writeInt16LE(Math.round(Math.tanh(right[i]*1.35)*.83*edge*32767),i*4+2);
}
const header=Buffer.alloc(44);
header.write('RIFF');header.writeUInt32LE(36+pcm.length,4);header.write('WAVEfmt ',8);
header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(2,22);
header.writeUInt32LE(rate,24);header.writeUInt32LE(rate*4,28);header.writeUInt16LE(4,32);header.writeUInt16LE(16,34);
header.write('data',36);header.writeUInt32LE(pcm.length,40);
writeFileSync(fileURLToPath(new URL('../dist/assets/basement-signal-v1.wav',import.meta.url)),Buffer.concat([header,pcm]));
console.log(`BASEMENT SIGNAL: ${duration}s, stereo ${rate}Hz, original synthesized composition.`);
