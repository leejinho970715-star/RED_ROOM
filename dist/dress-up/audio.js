export function createStudioAudio(){
  const player=document.querySelector('#studio-bgm'),toggle=document.querySelector('#music-toggle'),volume=document.querySelector('#music-volume');
  let enabled=true,level=.35,activated=false,context;
  try{const saved=JSON.parse(localStorage.getItem('seoul-studio-audio-v1'));if(saved){enabled=saved.enabled!==false;if(Number.isFinite(saved.level)&&saved.level>=0&&saved.level<=1)level=saved.level;}}catch{}
  function sync(){player.volume=level;volume.value=String(Math.round(level*100));toggle.textContent=enabled?'BGM ON':'BGM OFF';toggle.setAttribute('aria-pressed',String(enabled));toggle.setAttribute('aria-label',enabled?'배경 음악 끄기':'배경 음악 켜기');}
  function persist(){try{localStorage.setItem('seoul-studio-audio-v1',JSON.stringify({enabled,level}));}catch{}}
  function start(){if(activated&&enabled&&!document.hidden)player.play().catch(()=>{});}
  function activate(event){if(!event.isTrusted)return;activated=true;start();}
  document.addEventListener('pointerdown',activate,{capture:true});document.addEventListener('keydown',event=>{if(['Enter',' ','ArrowLeft','ArrowRight','+','-'].includes(event.key))activate(event);},{capture:true});
  toggle.addEventListener('click',()=>{enabled=!enabled;if(enabled)start();else player.pause();sync();persist();});
  volume.addEventListener('input',()=>{level=Number(volume.value)/100;sync();persist();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){player.pause();context?.suspend();}else{start();if(activated)context?.resume();}});
  window.addEventListener('pagehide',()=>{player.pause();context?.suspend();});window.addEventListener('pageshow',start);
  function chime(type){
    if(!activated||!enabled||!level||document.hidden)return;
    try{context??=new (window.AudioContext||window.webkitAudioContext)();context.resume();const now=context.currentTime,notes=type==='runway'?[523.25,659.25,783.99,1046.5]:[659.25,880];notes.forEach((hz,i)=>{const oscillator=context.createOscillator(),gain=context.createGain();oscillator.type='sine';oscillator.frequency.value=hz;gain.gain.setValueAtTime(0,now+i*.08);gain.gain.linearRampToValueAtTime(level*.1,now+i*.08+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+i*.08+.35);oscillator.connect(gain).connect(context.destination);oscillator.start(now+i*.08);oscillator.stop(now+i*.08+.4);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};});}catch{}
  }
  sync();return{chime};
}
