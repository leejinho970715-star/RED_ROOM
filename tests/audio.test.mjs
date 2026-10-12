import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createGameAudio} from '../dist/audio.js';

// Contract fixture for trusted activation, mute preferences and tab lifecycle.
function fixture(t){
 class Target{
  listeners=new Map();attributes={};textContent='';value=45;classList={toggle(){}};
  addEventListener(name,fn){const list=this.listeners.get(name)||[];list.push(fn);this.listeners.set(name,list);}
  removeEventListener(name,fn){this.listeners.set(name,(this.listeners.get(name)||[]).filter(x=>x!==fn));}
  emit(name,event={}){for(const fn of this.listeners.get(name)||[])fn(event);}
  setAttribute(name,value){this.attributes[name]=value;}
 }
 const elements=new Map(['#game-bgm','.audio-controls','#bgm-toggle','#sfx-toggle','#audio-volume','#audio-status','#audio-volume-value'].map(id=>[id,new Target()]));
 const music=elements.get('#game-bgm');music.paused=true;music.readyState=0;music.play=()=>{music.paused=false;music.readyState=4;music.emit('playing');return Promise.resolve();};music.pause=()=>{music.paused=true;music.emit('pause');};
 const contexts=[],voices=[];
 const param=()=>({value:0,cancelScheduledValues(){},setValueAtTime(v){this.value=v;},setTargetAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;},exponentialRampToValueAtTime(v){this.value=v;}});
 const node=()=>({gain:param(),frequency:param(),threshold:param(),ratio:param(),connect(){},disconnect(){}});
 class Context{
  currentTime=0;sampleRate=22050;state='suspended';destination=node();
  constructor(){contexts.push(this);}
  createGain(){return node();}createDynamicsCompressor(){return node();}createMediaElementSource(){return node();}createBiquadFilter(){return node();}
  createBuffer(channels,length){return {getChannelData:()=>new Float32Array(length)};}
  createOscillator(){return this.source();}createBufferSource(){return this.source();}
  source(){const voice={...node(),start(at){this.startAt=at;},stop(at){this.stopAt=at;}};voices.push(voice);return voice;}
  resume(){this.state='running';return Promise.resolve();}suspend(){this.state='suspended';return Promise.resolve();}close(){this.state='closed';return Promise.resolve();}
 }
 const document=new Target(),window=new Target(),saved=new Map();document.hidden=false;document.querySelector=id=>elements.get(id);window.AudioContext=Context;
 const globals={document,window,localStorage:{getItem:key=>saved.get(key)||null,setItem:(key,value)=>saved.set(key,value)}};
 const old=new Map(Object.keys(globals).map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
 for(const [key,value]of Object.entries(globals))Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});
 t.after(()=>{window.emit('pagehide',{persisted:false});for(const [key,descriptor]of old){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}});
 const engine=createGameAudio();
 return {engine,elements,document,window,music,contexts,voices,saved};
}

test('audio starts on trusted activation; independent mute preferences survive later gestures',async t=>{
 const f=fixture(t);assert.equal(f.contexts.length,0);assert.equal(f.music.paused,true);
 f.document.emit('click',{isTrusted:false});assert.equal(f.contexts.length,0);
 f.document.emit('click',{isTrusted:true});await Promise.resolve();assert.equal(f.contexts.length,1);assert.equal(f.music.paused,false);
 f.engine.play('equip');const audibleVoices=f.voices.length;assert.ok(audibleVoices>0);
 f.elements.get('#bgm-toggle').emit('click');assert.equal(f.music.paused,true);
 f.engine.play('drop',6);assert.ok(f.voices.length>audibleVoices,'SFX stay enabled while music is muted');
 f.elements.get('#sfx-toggle').emit('click');const mutedVoices=f.voices.length;
 f.engine.play('press');f.document.emit('click',{isTrusted:true});assert.equal(f.voices.length,mutedVoices);assert.equal(f.music.paused,true);
 const prefs=JSON.parse(f.saved.get('red-room-audio-v1'));assert.equal(prefs.bgm,false);assert.equal(prefs.sfx,false);
 assert.equal(f.contexts.length,1,'repeated interactions reuse one context');
});

test('hidden tabs suspend all audio, return resumes music, and navigation closes the context',async t=>{
 const f=fixture(t);f.document.emit('keydown',{isTrusted:true,key:'Enter'});await Promise.resolve();f.engine.play('spin');
 f.document.hidden=true;f.document.emit('visibilitychange');assert.equal(f.music.paused,true);assert.equal(f.contexts[0].state,'suspended');
 const count=f.voices.length;f.engine.play('drop');assert.equal(f.voices.length,count);
 f.document.hidden=false;f.document.emit('visibilitychange');await Promise.resolve();assert.equal(f.music.paused,false);assert.equal(f.contexts[0].state,'running');
 f.window.emit('pagehide',{persisted:false});assert.equal(f.music.paused,true);assert.equal(f.contexts[0].state,'closed');
 f.engine.play('equip');assert.equal(f.voices.length,count);
});

test('BGM is a complete audible stereo PCM loop without clipping or boundary clicks',()=>{
 const wav=readFileSync(new URL('../dist/assets/basement-signal-v1.wav',import.meta.url));
 assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.toString('ascii',8,12),'WAVE');
 assert.equal(wav.readUInt16LE(20),1);assert.equal(wav.readUInt16LE(22),2);assert.equal(wav.readUInt16LE(34),16);
 assert.equal(wav.readUInt32LE(40),wav.length-44);assert.equal(wav.readUInt32LE(4),wav.length-8);
 const seconds=(wav.length-44)/wav.readUInt32LE(28);assert.ok(seconds>=25&&seconds<=90);
 let peak=0,power=0;for(let i=44;i<wav.length;i+=2){const value=wav.readInt16LE(i)/32768;peak=Math.max(peak,Math.abs(value));power+=value*value;}
 assert.ok(peak<.95);assert.ok(Math.sqrt(power/((wav.length-44)/2))>.01,'music must contain audible signal');
 for(const offset of [44,46,wav.length-4,wav.length-2])assert.ok(Math.abs(wav.readInt16LE(offset))<100,'loop boundaries approach silence');
});
