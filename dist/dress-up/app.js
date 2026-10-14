import {LOOKS,ACCESSORIES,MOODS,MISSIONS,DEFAULT_LOOK,validLook,evaluateLook,rewardForResult} from './rules.js';
import {createStudioAudio} from './audio.js';
const $=selector=>document.querySelector(selector);
const canvas=$('#model-canvas'),ctx=canvas.getContext('2d');
const storageKey='seoul-studio-v1',imageCache=new Map();
let state={look:{...DEFAULT_LOOK},mission:0,stars:0,rewards:{},visited:['everyday'],cleared:[],album:[]};
try {
  const saved=JSON.parse(localStorage.getItem(storageKey));
  if(saved && validLook(saved.look)) {
    state.look=saved.look;
    state.mission=Number.isInteger(saved.mission)&&saved.mission>=0&&saved.mission<MISSIONS.length?saved.mission:0;
    state.rewards=Object.fromEntries(MISSIONS.map(m=>[m.id,[1,3].includes(saved.rewards?.[m.id])?saved.rewards[m.id]:0]));
    state.stars=Object.values(state.rewards).reduce((sum,value)=>sum+value,0);
    state.visited=Array.isArray(saved.visited)?LOOKS.filter(l=>saved.visited.includes(l.id)).map(l=>l.id):['everyday'];
    state.cleared=Array.isArray(saved.cleared)?MISSIONS.filter(m=>saved.cleared.includes(m.id)).map(m=>m.id):[];
    state.album=Array.isArray(saved.album)?saved.album.filter(a=>validLook(a.look)&&Number.isFinite(a.score)&&a.score>=0&&a.score<=100&&MISSIONS.some(m=>m.id===a.mission)).slice(0,12):[];
  }
}catch{}
let figure,background,zoom=1,panX=0,panY=0,requestId=0,toastTimer,drag=null,loading=false,runwayBusy=false;
const audio=createStudioAudio();
function toast(text){$('#status').textContent=text;$('#status').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#status').classList.remove('show'),3200);}
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{toast('브라우저 저장 공간이 부족해요. 이미지 저장으로 룩을 간직해주세요.');}}
function loadImage(path){if(!imageCache.has(path))imageCache.set(path,new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>{imageCache.delete(path);reject(new Error('Image failed'));};image.src=path;}));return imageCache.get(path);}
function modelRect(width,height){const h=height*.94*zoom,w=h*(figure.width/figure.height);return {x:(width-w)/2+panX,y:height*.025+panY,w,h};}
function rounded(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function drawAccessory(box){
  if(state.look.accessory==='none')return;
  ctx.save();ctx.translate(box.x,box.y);ctx.scale(box.w/1024,box.h/1536);
  if(state.look.accessory==='brooch') {
    ctx.translate(619,345);ctx.shadowColor='#33210c55';ctx.shadowBlur=5;
    const gold=ctx.createRadialGradient(-3,-4,1,0,0,25);gold.addColorStop(0,'#fff4b7');gold.addColorStop(.55,'#d7ac54');gold.addColorStop(1,'#986124');ctx.fillStyle=gold;
    for(let i=0;i<6;i++){ctx.save();ctx.rotate(i*Math.PI/3);ctx.beginPath();ctx.ellipse(0,-12,7,13,0,0,Math.PI*2);ctx.fill();ctx.restore();}
    ctx.fillStyle='#fff6d5';ctx.beginPath();ctx.arc(0,0,6,0,Math.PI*2);ctx.fill();
  } else {
    const mini=state.look.accessory==='mini',x=705,y=800,w=mini?138:160,h=mini?118:168;
    ctx.shadowColor='#27192366';ctx.shadowBlur=15;ctx.shadowOffsetY=8;
    ctx.strokeStyle=mini?'#ad6c82':'#33313a';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(x+20,y+12);ctx.bezierCurveTo(x+12,y-65,x+w-12,y-65,x+w-20,y+12);ctx.stroke();
    const shade=ctx.createLinearGradient(x,y,x+w,y+h);shade.addColorStop(0,mini?'#f0b5c8':'#53505a');shade.addColorStop(.5,mini?'#cc8ea5':'#28252d');shade.addColorStop(1,mini?'#99566e':'#111017');
    ctx.fillStyle=shade;rounded(x,y,w,h,16);ctx.fill();ctx.shadowBlur=0;ctx.shadowOffsetY=0;ctx.strokeStyle=mini?'#f6ced9':'#8c858f';ctx.lineWidth=2;rounded(x+6,y+6,w-12,h-12,12);ctx.stroke();
    ctx.strokeStyle='#c8a259';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+8,y+34);ctx.lineTo(x+w-8,y+34);ctx.stroke();ctx.fillStyle='#d7b776';rounded(x+w/2-12,y+27,24,16,3);ctx.fill();
  }
  ctx.restore();
}
function draw(){
  if(!figure||!background||!ctx)return;
  const width=canvas.clientWidth,height=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,2);
  if(!width||!height)return;
  if(canvas.width!==Math.round(width*dpr)||canvas.height!==Math.round(height*dpr)){canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);}
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
  const scale=Math.max(width/background.width,height/background.height),bw=background.width*scale,bh=background.height*scale;
  ctx.drawImage(background,(width-bw)/2,(height-bh)/2,bw,bh);
  if(state.look.mood==='sunset'){ctx.fillStyle='#dd9b5a28';ctx.fillRect(0,0,width,height);}
  if(state.look.mood==='night'){ctx.fillStyle='#18132970';ctx.fillRect(0,0,width,height);const glow=ctx.createRadialGradient(width*.5,height*.35,0,width*.5,height*.35,height*.6);glow.addColorStop(0,'#eed9c233');glow.addColorStop(1,'#a07db800');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);}
  const box=modelRect(width,height);
  ctx.save();ctx.translate(box.x+box.w*.5,box.y+box.h*.964);ctx.scale(1,.2);const shadow=ctx.createRadialGradient(0,0,5,0,0,box.w*.29);shadow.addColorStop(0,'#46312640');shadow.addColorStop(1,'#46312600');ctx.fillStyle=shadow;ctx.beginPath();ctx.arc(0,0,box.w*.29,0,Math.PI*2);ctx.fill();ctx.restore();
  ctx.drawImage(figure,box.x,box.y,box.w,box.h);drawAccessory(box);
  if(state.stars>=9){ctx.strokeStyle='#d1ad7199';ctx.lineWidth=2;ctx.strokeRect(12,12,width-24,height-24);}
}
new ResizeObserver(draw).observe(canvas);
async function selectLook(look,announce=true){
  if(!validLook(look))return;
  const id=++requestId,previous={...state.look};loading=true;$('#loading').hidden=false;$('#save-look').disabled=true;$('#runway').disabled=true;
  try {
    const item=LOOKS.find(l=>l.id===look.outfit);const image=await loadImage('./assets/'+item.asset);
    if(id!==requestId)return;
    figure=image;state.look={...look};if(!state.visited.includes(look.outfit))state.visited.push(look.outfit);zoom=1;panX=panY=0;render();draw();persist();if(announce){audio.chime('change');toast(item.name+' 룩을 적용했어요.');}
  }catch{if(id===requestId){state.look=previous;toast('복장 이미지를 불러오지 못했어요. 다른 룩을 선택하거나 새로고침해주세요.');}}
  finally{if(id===requestId){loading=false;$('#loading').hidden=true;$('#save-look').disabled=!figure;$('#runway').disabled=!figure;}}
}
function render(){
  const focused=document.activeElement;
  const focusKey=['look','accessory','mood'].find(key=>focused?.dataset?.[key]);
  const focusValue=focusKey?focused.dataset[focusKey]:null;
  const selected=LOOKS.find(l=>l.id===state.look.outfit),mission=MISSIONS[state.mission];
  $('#outfit-grid').innerHTML=LOOKS.map(l=>`<button class="outfit-card" data-look="${l.id}" aria-pressed="${l.id===selected.id}" aria-label="${l.name} 선택"><span class="check" aria-hidden="true">✓</span><span class="outfit-icon"><img src="./assets/${l.asset}" alt="" loading="lazy"></span><strong>${l.name}</strong><small>${l.tags.slice(0,2).join(' · ')}</small></button>`).join('');
  $('#look-label').textContent=String(LOOKS.indexOf(selected)+1).padStart(2,'0')+' / '+selected.english;$('#current-name').textContent=selected.name;$('#current-description').textContent=selected.description;$('#current-badge').textContent=selected.category;
  $('#accessory-options').innerHTML=ACCESSORIES.map(a=>`<button data-accessory="${a.id}" aria-pressed="${a.id===state.look.accessory}"><span>${a.name}</span><small>${a.detail}</small></button>`).join('');
  $('#background-options').innerHTML=MOODS.map(m=>`<button data-mood="${m.id}" aria-pressed="${m.id===state.look.mood}"><span>${m.name}</span><small>${m.detail}</small></button>`).join('');
  $('#mission-name').textContent=mission.name;$('#mission-copy').textContent=mission.copy;$('#mission-tags').innerHTML=mission.tags.map(t=>`<span>${t}</span>`).join('');
  $('#style-stars').textContent='✦ '+state.stars+' STYLE STARS';$('#badge-count').textContent=state.visited.length+' / 6 룩 발견';$('#album-count').textContent=state.album.length+' / 12 LOOKS';$('#album-empty').hidden=!!state.album.length;
  $('#earned-badges').innerHTML=`<span class="${state.visited.length===6?'unlocked':''}">✧ LOOK EXPLORER ${state.visited.length}/6</span><span class="${state.cleared.length===5?'unlocked':''}">✧ MISSION MASTER ${state.cleared.length}/5</span><span class="${state.stars>=9?'unlocked':''}">✧ GOLD FRAME ${Math.min(state.stars,9)}/9</span>`;
  $('#album-grid').innerHTML=state.album.map((a,index)=>{const l=LOOKS.find(l=>l.id===a.look.outfit);return `<button class="album-card" data-album="${index}" aria-label="${l.name} 룩북 다시 입기"><img src="./assets/${l.asset}" alt="${l.name}" loading="lazy"><strong>${l.name}</strong><small>${a.grade} · ${a.score}점</small></button>`;}).join('');
  if(focusKey)document.querySelector(`[data-${focusKey}="${focusValue}"]`)?.focus({preventScroll:true});
}
function setDetail(field,value){const next={...state.look,[field]:value};if(!validLook(next))return;state.look=next;render();draw();persist();audio.chime('change');}
function setZoom(value){zoom=Math.max(1,Math.min(2.2,value));if(zoom===1)panX=panY=0;draw();}
canvas.addEventListener('pointerdown',event=>{if(zoom===1)return;drag={x:event.clientX,y:event.clientY,px:panX,py:panY};canvas.setPointerCapture(event.pointerId);});
canvas.addEventListener('pointermove',event=>{if(!drag)return;panX=Math.max(-canvas.clientWidth*.4,Math.min(canvas.clientWidth*.4,drag.px+event.clientX-drag.x));panY=Math.max(-canvas.clientHeight*.6,Math.min(canvas.clientHeight*.2,drag.py+event.clientY-drag.y));draw();});
for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,()=>drag=null);
canvas.addEventListener('keydown',event=>{if(['+','=','-','0','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();if(event.key==='+'||event.key==='=')setZoom(zoom+.15);else if(event.key==='-')setZoom(zoom-.15);else if(event.key==='0'){zoom=1;panX=panY=0;draw();}else if(zoom>1){if(event.key==='ArrowLeft')panX-=20;if(event.key==='ArrowRight')panX+=20;if(event.key==='ArrowUp')panY-=20;if(event.key==='ArrowDown')panY+=20;draw();}}});
function celebrate(score){
  const flash=document.createElement('div');flash.className='studio-flash';$('#stage').append(flash);setTimeout(()=>flash.remove(),650);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const count=score>=90?58:score>=75?36:14;
  for(let i=0;i<count;i++){const piece=document.createElement('i');piece.className='confetti-piece';piece.style.cssText=`--x:${Math.random()*100}vw;--color:${['#c8a4df','#e5c186','#ebabbf','#b4c8ac'][i%4]};--time:${2+Math.random()*1.6}s;--delay:${Math.random()*.7}s;--drift:${Math.random()*180-90}px;--turn:${Math.random()*720-360}deg`;document.body.append(piece);setTimeout(()=>piece.remove(),5000);}
}
function runway(){
  if(loading||runwayBusy)return;runwayBusy=true;const mission=MISSIONS[state.mission],result=evaluateLook(state.look,mission.id),reward=rewardForResult(state.rewards,mission.id,result.score);
  $('#result-modal .result-top>span').textContent='RUNWAY REVIEW';
  state.rewards[mission.id]=reward.total;state.stars+=reward.earned;if(result.success&&!state.cleared.includes(mission.id))state.cleared.push(mission.id);
  const look={...state.look};state.album.unshift({look,mission:mission.id,score:result.score,grade:result.grade,time:Date.now()});state.album=state.album.slice(0,12);persist();render();draw();celebrate(result.score);audio.chime('runway');
  const tips=[];if(result.outfit<70)tips.push('미션 태그와 가까운 복장을 골라보세요.');if(result.accessory<20)tips.push('액세서리의 분위기를 바꿔보세요.');if(result.mood<10)tips.push('장면에 맞는 스튜디오 무드를 골라보세요.');
  const badge=[state.visited.length===6?'LOOK EXPLORER':'',state.cleared.length===5?'MISSION MASTER':''].filter(Boolean).map(b=>' / '+b).join('');
  $('#result-content').innerHTML=`<div class="score-display"><strong>${result.grade}</strong><span>${result.score} / 100 POINTS</span><h2>${result.score>=90?'스튜디오의 새로운 뮤즈!':result.success?'오늘의 미션을 완성했어요!':'새로운 조합을 찾아볼까요?'}</h2><p>${tips.join(' ')||'복장, 액세서리, 무드가 미션과 잘 어울려요.'}</p></div><div class="score-lines"><div><span>복장과 상황의 어울림</span><b>${result.outfit} / 70</b></div><div><span>액세서리 포인트</span><b>${result.accessory} / 20</b></div><div><span>스튜디오 무드</span><b>${result.mood} / 10</b></div><div><span>이번에 받은 스타일 스타</span><b>+${reward.earned} ✦</b></div></div><p class="result-note">${reward.earned?'같은 미션은 최대 3개의 스타를 받을 수 있어요.':'이 미션의 스타는 이미 받았어요. 다른 미션에 도전해보세요.'}${state.stars>=9?' 골드 포토 프레임을 해금했어요!':''}${badge}</p>`;
  $('#result-modal').showModal();setTimeout(()=>runwayBusy=false,500);
}
function closeResult(){$('#result-modal').close();}
$('#close-result').addEventListener('click',closeResult);$('#continue-styling').addEventListener('click',closeResult);
document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button||button.disabled)return;
  if(button.dataset.look){selectLook({...state.look,outfit:button.dataset.look});return;}
  if(button.dataset.accessory){setDetail('accessory',button.dataset.accessory);return;}
  if(button.dataset.mood){setDetail('mood',button.dataset.mood);return;}
  if(button.dataset.tab){const details=button.dataset.tab==='details';$('#details-panel').hidden=!details;$('#outfits-panel').hidden=details;document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));return;}
  if(button.dataset.album!==undefined){const entry=state.album[Number(button.dataset.album)];if(entry){selectLook(entry.look);$('#stage').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});}return;}
});
$('#next-mission').addEventListener('click',()=>{state.mission=(state.mission+1)%MISSIONS.length;render();persist();audio.chime('change');});
$('#runway').addEventListener('click',runway);
$('#random-look').addEventListener('click',()=>selectLook({outfit:LOOKS[Math.floor(Math.random()*LOOKS.length)].id,accessory:ACCESSORIES[Math.floor(Math.random()*ACCESSORIES.length)].id,mood:MOODS[Math.floor(Math.random()*MOODS.length)].id}));
$('#zoom-in').addEventListener('click',()=>setZoom(zoom+.2));$('#zoom-out').addEventListener('click',()=>setZoom(zoom-.2));$('#reset-camera').addEventListener('click',()=>{zoom=1;panX=panY=0;draw();});
$('#reset-look').addEventListener('click',()=>{selectLook({...DEFAULT_LOOK});toast('기본 코디로 돌아왔어요. 스타와 룩북은 그대로 보관됩니다.');});
$('#save-look').addEventListener('click',()=>{
  if(loading||!figure)return;
  canvas.toBlob(blob=>{if(!blob){toast('이미지를 저장하지 못했어요.');return;}const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='seoul-studio-'+state.look.outfit+'.png';link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('현재 코디의 PNG 이미지를 저장했어요.');},'image/png');
});
$('#story-guide').addEventListener('click',()=>{
  $('#result-modal .result-top>span').textContent='STORY & PLAYER GUIDE';
  $('#result-content').innerHTML=`<div class="story-content"><p class="eyebrow">THE STORY / SEOUL STUDIO</p><h2>평범한 하루를,<br>나만의 장면으로.</h2><p>서울에 사는 24세 서윤은 작은 드레스룸 한쪽에 스타일 스튜디오를 열었습니다. 누구나 자신에게 어울리는 한 장면을 찾을 수 있기를 바라면서요.</p><p>첫 미팅, 친구와의 카페 약속, 한강 산책, 루프톱 전시와 한옥 사진 촬영. 당신은 서윤의 스타일 파트너가 되어 다섯 장의 의뢰를 완성합니다.</p><h3>플레이 방법</h3><ol><li>복장 탭에서 6개 룩 중 하나를 고르세요.</li><li>액세서리 & 무드 탭에서 포인트와 조명을 바꾸세요.</li><li>미션의 상황과 태그를 읽고 런웨이에 출전하세요.</li><li>75점 이상이면 미션 성공! 복장 70점, 액세서리 20점, 무드 10점으로 평가합니다.</li><li>미션별 최대 3스타를 받고, 9스타를 모으면 골드 포토 프레임이 열립니다.</li><li>6개 룩을 모두 입으면 LOOK EXPLORER, 5개 미션을 완성하면 MISSION MASTER 배지를 받습니다.</li></ol><p>룩북은 최근 12개 코디를 보관하며 카드를 누르면 다시 입을 수 있어요. 이미지 저장은 현재 스튜디오의 PNG를 내려받습니다. + / −로 확대하고, 확대 후 드래그나 방향키로 디테일을 살펴보세요.</p><p>캐릭터는 가상의 성인이고, 화면은 생성한 실사풍 3D 일러스트를 교체하는 방식입니다. 360°로 회전하는 입체 메시 모델은 아닙니다. 스타일 스타는 게임 점수로만 사용합니다.</p><a class="guide-link" href="./guide.html">전체 스토리와 설명서 열기 ↗</a></div>`;
  $('#result-modal').showModal();
});
render();
try{background=await loadImage('./assets/studio-v1.png');await selectLook(state.look,false);}catch{$('#loading').hidden=true;$('#webgl-error').hidden=false;$('#save-look').disabled=true;$('#runway').disabled=true;}
for(const l of LOOKS)loadImage('./assets/'+l.asset).catch(()=>{});
