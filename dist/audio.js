// One shared audio context: original looped music + procedural arcade effects.
export function createGameAudio(){
 const music=document.querySelector('#game-bgm'),panel=document.querySelector('.audio-controls');
 const musicButton=document.querySelector('#bgm-toggle'),fxButton=document.querySelector('#sfx-toggle');
 const volume=document.querySelector('#audio-volume'),status=document.querySelector('#audio-status');
 const prefsKey='red-room-audio-v1';
 let prefs={bgm:true,sfx:true,volume:.45};
 try{const saved=JSON.parse(localStorage.getItem(prefsKey));if(saved){for(const key of ['bgm','sfx'])if(typeof saved[key]==='boolean')prefs[key]=saved[key];if(Number.isFinite(saved.volume))prefs.volume=Math.max(0,Math.min(1,saved.volume));}}catch{}
 let context,master,musicBus,fxBus,unlocked=false,failed=false,disposed=false;
 const active=new Set();
 function save(){try{localStorage.setItem(prefsKey,JSON.stringify(prefs));}catch{}}
 function update(){
  musicButton.setAttribute('aria-pressed',String(prefs.bgm));musicButton.textContent=`BGM ${prefs.bgm?'ON':'OFF'}`;
  fxButton.setAttribute('aria-pressed',String(prefs.sfx));fxButton.textContent=`SFX ${prefs.sfx?'ON':'OFF'}`;
  musicButton.setAttribute('aria-label',prefs.bgm?'배경 음악 끄기':'배경 음악 켜기');fxButton.setAttribute('aria-label',prefs.sfx?'효과음 끄기':'효과음 켜기');
  volume.value=Math.round(prefs.volume*100);document.querySelector('#audio-volume-value').textContent=`${volume.value}%`;
  const playing=!music.paused&&music.readyState>=2&&prefs.bgm&&!document.hidden&&prefs.volume>0;
  panel.classList.toggle('playing',playing);
  status.textContent=failed?'AUDIO UNAVAILABLE':!prefs.volume||(!prefs.bgm&&!prefs.sfx)?'MUTED':!unlocked?'CLICK TO START AUDIO':document.hidden?'AUDIO PAUSED':playing?'BASEMENT SIGNAL · 96 BPM':prefs.bgm?'STARTING BGM…':'BGM PAUSED · SFX '+(prefs.sfx?'ON':'OFF');
 }
 function gain(param,value){param.cancelScheduledValues(context.currentTime);param.setTargetAtTime(value,context.currentTime,.025);}
 function init(){
  if(context)return;
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw new Error('Web Audio unavailable');
  context=new Audio();master=context.createGain();musicBus=context.createGain();fxBus=context.createGain();
  const limiter=context.createDynamicsCompressor();limiter.threshold.value=-10;limiter.ratio.value=8;
  musicBus.gain.value=.7;fxBus.gain.value=prefs.sfx?1:0;master.gain.value=prefs.volume;
  context.createMediaElementSource(music).connect(musicBus);musicBus.connect(master);fxBus.connect(master);master.connect(limiter);limiter.connect(context.destination);
 }
 async function startMusic(){
  if(!unlocked||!prefs.bgm||document.hidden||disposed)return;
  try{await music.play();failed=false;}catch(error){if(error.name!=='AbortError'&&prefs.bgm&&!document.hidden){unlocked=false;failed=error.name!=='NotAllowedError';}}
  update();
 }
 function unlock(){
  if(disposed||document.hidden)return;
  try{init();unlocked=true;failed=false;void context.resume().then(()=>{update();}).catch(()=>{unlocked=false;update();});void startMusic();update();}catch{failed=true;update();}
 }
 // Resume in a trusted gesture; delayed drop effects then use the same context.
 const onGesture=event=>{if(event.isTrusted&&(!unlocked||context?.state!=='running'||(prefs.bgm&&music.paused)))unlock();};
 const onKey=event=>{if(event.key==='Enter'||event.key===' ')onGesture(event);};
 document.addEventListener('click',onGesture,true);document.addEventListener('keydown',onKey,true);
 function track(source,nodes,at,duration){
  active.add(source);source.onended=()=>{active.delete(source);source.disconnect();nodes.forEach(n=>n.disconnect());};source.start(at);source.stop(at+duration);
 }
 function tone(frequency,at,duration,level=.1,type='triangle',endFrequency){
  const osc=context.createOscillator(),envelope=context.createGain();osc.type=type;
  osc.frequency.setValueAtTime(frequency,at);if(endFrequency)osc.frequency.exponentialRampToValueAtTime(endFrequency,at+duration);
  envelope.gain.setValueAtTime(0,at);envelope.gain.linearRampToValueAtTime(level,at+.006);envelope.gain.exponentialRampToValueAtTime(.0001,at+duration);
  osc.connect(envelope);envelope.connect(fxBus);track(osc,[envelope],at,duration+.015);
 }
 function noise(at,duration,level,cutoff){
  const source=context.createBufferSource(),buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate);
  const samples=buffer.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
  source.buffer=buffer;const filter=context.createBiquadFilter(),envelope=context.createGain();filter.type='lowpass';filter.frequency.value=cutoff;
  envelope.gain.setValueAtTime(level,at);envelope.gain.exponentialRampToValueAtTime(.0001,at+duration);
  source.connect(filter);filter.connect(envelope);envelope.connect(fxBus);track(source,[filter,envelope],at,duration);
 }
 function play(kind='ui',rarity=0){
  if(!context||!unlocked||!prefs.sfx||document.hidden||disposed)return;
  const t=context.currentTime+.008;
  if(kind==='press'){
   tone(125,t,.15,.24,'sine',42);noise(t,.08,.16,1800);tone(420,t+.018,.075,.06,'triangle',140);
  }else if(kind==='spin'){
   for(let i=0;i<11;i++)tone(80+i*22,t+i*.105,.07,.035,'square',70+i*30);
  }else if(kind==='drop'||kind==='reward'){
   const tier=Math.max(0,Math.min(6,rarity)),base=kind==='reward'?440:261.63*2**(tier/12);
   [1,1.25,1.5,2].forEach((n,i)=>tone(base*n,t+i*.09,.35,.12,'triangle'));
   noise(t,.12,.045,4600);
   if(tier>=4)[2.5,3,4].forEach((n,i)=>tone(base*n,t+.36+i*.12,.48,.075,'sine'));
  }else if(kind==='equip'){
   noise(t,.035,.12,2600);tone(330,t,.09,.12,'square');tone(660,t+.075,.2,.13);tone(990,t+.14,.23,.065,'sine');
  }else if(kind==='unequip'){
   tone(620,t,.08,.08);tone(310,t+.075,.15,.09);
  }else if(kind==='sell'||kind==='deposit'){
   [523,784,1047].forEach((f,i)=>tone(f,t+i*.065,.17,.085));
  }else if(kind==='error'){
   tone(180,t,.11,.09,'sawtooth',130);tone(130,t+.13,.14,.08,'sawtooth',95);
  }else tone(720,t,.045,.045,'square',480);
 }
 function toggle(key){
  prefs[key]=!prefs[key];save();
  if(key==='bgm'){if(prefs.bgm){unlock();}else music.pause();}
  else{if(context)gain(fxBus.gain,prefs.sfx?1:0);if(prefs.sfx){unlock();play('ui');}}
  update();
 }
 musicButton.addEventListener('click',()=>toggle('bgm'));fxButton.addEventListener('click',()=>toggle('sfx'));
 volume.addEventListener('input',()=>{prefs.volume=Number(volume.value)/100;save();if(context)gain(master.gain,prefs.volume);update();});
 for(const event of ['playing','pause','waiting','error'])music.addEventListener(event,()=>{if(event==='error')failed=true;update();});
 function visibility(){
  if(document.hidden){music.pause();for(const source of active){try{source.stop();}catch{}}void context?.suspend();}
  else if(unlocked){void context?.resume().catch(()=>{});void startMusic();}update();
 }
 document.addEventListener('visibilitychange',visibility);
 function dispose(){if(disposed)return;disposed=true;music.pause();for(const source of active){try{source.stop();}catch{}}document.removeEventListener('click',onGesture,true);document.removeEventListener('keydown',onKey,true);document.removeEventListener('visibilitychange',visibility);void context?.close();}
 window.addEventListener('pagehide',event=>{if(event.persisted){music.pause();void context?.suspend();}else dispose();});
 window.addEventListener('pageshow',event=>{if(event.persisted)visibility();});
 update();return {play,unlock};
}
