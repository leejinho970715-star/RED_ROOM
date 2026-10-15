import {COSTUMES,PROPS,SCENES,MISSIONS,GRADES,validLook,evaluate,reward,remainingSeconds,normalizeState} from './rules.js';
import {drawStudio} from './render.js';
import {createStudioAudio} from '../audio.js';
const $=s=>document.querySelector(s),canvas=$('#chaos-canvas'),audio=createStudioAudio(),images=new Map();
const storage='virtual-dress-up-chaos-v1';let raw;try{raw=JSON.parse(localStorage.getItem(storage));}catch{}
const state=normalizeState(raw);let desired={...state.look},figure,background,loadId=0,loading=true,deadline=null,ticker,toastTimer,judgeBusy=false;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3200);}
function persist(){try{localStorage.setItem(storage,JSON.stringify(state));}catch{toast('저장 공간이 부족해요. 증거 사진으로 코디를 남겨주세요.');}}
function loadImage(path){if(!images.has(path))images.set(path,new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>{images.delete(path);reject(new Error('Artwork unavailable'));};image.src=path;}));return images.get(path);}
function draw(){drawStudio(canvas,figure,background,state.look);}
new ResizeObserver(draw).observe(canvas);
function buildWardrobe(){
  $('#costume-grid').innerHTML=COSTUMES.map(c=>`<button class="costume-card" data-costume="${c.id}" aria-pressed="false" aria-label="${c.name} 입기"><span class="costume-art"><img src="./assets/${c.asset}" alt="" loading="lazy"></span><strong>${c.name}</strong><small>${c.tag}</small></button>`).join('');
  $('#prop-grid').innerHTML=PROPS.map(p=>`<button data-prop="${p.id}" aria-pressed="false"><span class="prop-icon" aria-hidden="true">${p.icon}</span><span><strong>${p.name}</strong><small>${p.tag}</small></span></button>`).join('');
  $('#scene-grid').innerHTML=SCENES.map(s=>`<button data-scene="${s.id}" aria-pressed="false"><span class="scene-dot scene-${s.id}" aria-hidden="true"></span><span><strong>${s.name}</strong><small>${s.tag}</small></span></button>`).join('');
}
function render(){
  for(const [field,attribute] of [['costume','costume'],['prop','prop'],['scene','scene']])document.querySelectorAll(`[data-${attribute}]`).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset[attribute]===state.look[field])));
  const costume=COSTUMES.find(c=>c.id===state.look.costume),prop=PROPS.find(p=>p.id===state.look.prop),scene=SCENES.find(s=>s.id===state.look.scene),mission=MISSIONS[state.mission];
  $('#look-name').textContent=costume.name;$('#look-quip').textContent=costume.tag+'. '+(state.look.prop==='none'?'오늘도 빈손으로 당당하게.':prop.tag+'.');
  $('#outfit-receipt').textContent=costume.name+' + '+prop.name+' + '+scene.name;
  $('#mission-title').textContent=mission.name;$('#mission-copy').textContent=mission.copy;$('#mission-tags').innerHTML=mission.tags.map(t=>`<span>${t}</span>`).join('');
  const total=Object.values(state.rewards).reduce((a,b)=>a+b,0),cleared=Object.values(state.rewards).filter(v=>v===3).length;
  $('#star-count').textContent=`✷ ${total} / 18 혼돈 스타`;$('#clear-count').textContent=`${cleared} / 6 의뢰 성공`;
  $('#album-count').textContent=state.album.length+' / 6 기록';$('#album-empty').hidden=!!state.album.length;
  $('#album-grid').innerHTML=state.album.map((a,index)=>{const c=COSTUMES.find(c=>c.id===a.look.costume),p=PROPS.find(p=>p.id===a.look.prop);return `<button class="album-card" data-album="${index}" aria-label="${c.name} 기록 다시 입기"><img src="./assets/${c.asset}" alt="" loading="lazy"><strong>${c.name}</strong><small>${p.name}</small><b>${a.grade} · 혼돈 ${a.score}점</b></button>`;}).join('');
}
function controls(){ $('#chaos-loading').hidden=!loading;$('#chaos-canvas').setAttribute('aria-busy',String(loading));$('#judge').disabled=loading||!figure||!background;$('#save-photo').disabled=loading||!figure||!background; }
async function applyLook(look,announce=true){
  if(!validLook(look))return;
  desired={...look};const id=++loadId,selected=COSTUMES.find(c=>c.id===look.costume);loading=true;controls();
  try{
    if(!background)background=await loadImage('./assets/laundry-v1.png');
    const image=await loadImage('./assets/'+selected.asset);if(id!==loadId)return;
    figure=image;state.look={...desired};$('#chaos-error').hidden=true;render();draw();persist();if(announce){audio.chime('change');toast('코디 완료. 상식은 잠시 휴무입니다.');}
  }catch{if(id===loadId){desired={...state.look};toast('복장을 불러오지 못했어요. 다른 복장을 골라주세요.');if(!figure)$('#chaos-error').hidden=false;}}
  finally{if(id===loadId){loading=false;controls();}}
}
function setDetail(field,value){const next={...state.look,[field]:value};if(!validLook(next))return;state.look=next;desired={...desired,[field]:value};render();draw();persist();audio.chime('change');}
function cancelTimer(){deadline=null;clearInterval(ticker);$('#timer-status').textContent='시간 제한 없음';$('#timer-toggle').textContent='30초 타임어택 시작';$('#timer-status').classList.remove('urgent');}
function tick(){const left=remainingSeconds(deadline);if(left===null)return;$('#timer-status').textContent=`남은 시간 ${left}초`;$('#timer-status').classList.toggle('urgent',left<=10);if(left===0)judge(true);}
function startTimer(){if(!figure||!background){toast('스튜디오 준비가 끝나면 시작할 수 있어요.');return;}if(deadline!==null){cancelTimer();toast('시간 제한 없이 계속 코디하세요.');return;}deadline=Date.now()+30000;$('#timer-toggle').textContent='타임어택 취소';ticker=setInterval(tick,250);tick();toast('30초 시작! 마지막 완성 코디로 자동 심사해요.');}
function burst(score){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  for(let i=0;i<(score>=90?36:score>=75?22:10);i++){const e=document.createElement('i');e.className='chaos-confetti';e.style.cssText=`--x:${Math.random()*100}vw;--dx:${Math.random()*160-80}px;--color:${['#f37ca6','#ffd15e','#a291df','#8cd8d1'][i%4]};--t:${2+Math.random()}s`;document.body.append(e);setTimeout(()=>e.remove(),3300);}
}
function judge(expired=false){
  if(judgeBusy||!figure||!background||loading&&!expired)return;judgeBusy=true;
  if(expired&&loading){++loadId;loading=false;desired={...state.look};controls();}
  const timed=deadline!==null;cancelTimer();const mission=MISSIONS[state.mission],result=evaluate(state.look,mission.id),earned=reward(state.rewards,mission.id,result.score),reaction=GRADES[result.grade];
  state.rewards[mission.id]=earned.total;state.album.unshift({look:{...state.look},mission:mission.id,score:result.score,grade:result.grade,time:Date.now()});state.album=state.album.slice(0,6);persist();render();audio.chime('runway');burst(result.score);
  $('#modal-title').textContent=timed?'TIME ATTACK / CHAOS REVIEW':'CHAOS REVIEW';
  $('#modal-content').innerHTML=`<div class="chaos-reaction grade-${result.grade.toLowerCase()}"><img src="../assets/${reaction.asset}" alt="${result.grade} 등급에 반응하는 서윤"><p>${reaction.line}</p></div><div class="chaos-score"><strong>${result.grade}</strong><span>혼돈 지수 ${result.score} / 100</span><h2>${reaction.title}</h2><p>${result.hints.join(' ')||'복장, 소품, 무대까지 완벽한 대참사예요.'}</p></div><div class="score-breakdown"><span>의뢰에 어울리는 복장 <b>${result.costume} / 60</b></span><span>동행 소품 <b>${result.prop} / 25</b></span><span>무대 분위기 <b>${result.scene} / 15</b></span><span>이번 혼돈 스타 <b>+${earned.earned} ✷</b></span></div><p class="result-note">${expired?'시간 종료! 마지막으로 완성된 코디를 심사했어요. ':''}75점부터 의뢰 성공. 의뢰 하나당 최대 3스타를 받을 수 있어요.</p>`;
  $('#chaos-modal').showModal();setTimeout(()=>judgeBusy=false,500);
}
function guide(){
  $('#modal-title').textContent='STORY / HOW TO LOSE NORMALITY';
  $('#modal-content').innerHTML='<div class="guide-content"><p class="eyebrow">THE WRONG DELIVERY</p><h2>서윤의 옷장에<br>이상한 택배가 왔다.</h2><p>평범한 출근룩을 주문했는데 오리 튜브와 라면 모자, 바나나 탈이 도착했습니다. 반품처는 우주 세탁소. 배송 기사는 이미 달로 떠났어요.</p><p>그때 옷장에 여섯 장의 의뢰가 붙었습니다. 수영장 회의, 구내식당 기사 면접, 실내 장마까지. 서윤은 결심합니다. “일단 입고 가보자.”</p><h3>플레이 방법</h3><ol><li>복장 6종 중 하나를 고르고, 동행 소품 4종과 무대 3종을 조합하세요. 총 72가지 코디가 있어요.</li><li>황당 의뢰의 문장과 태그를 읽으세요. 정답 힌트가 모두 들어 있습니다.</li><li>혼돈 심사: 복장 60점 + 소품 25점 + 무대 15점. 75점부터 성공하며, S 90점 / A 75점 / B 55점 / C 54점 이하입니다.</li><li>의뢰당 첫 도전 1스타, 성공하면 총 3스타. 여섯 의뢰에서 최대 18스타를 모으세요. 반복 심사로 보상이 중복되지는 않아요.</li><li>원한다면 30초 타임어택을 시작하세요. 제한 시간이 지나면 마지막 완성 코디로 자동 심사합니다. 취소하면 자유 코디로 돌아가요.</li><li>운명에 맡기기로 무작위 코디를 만들고, 흑역사 보관함에서 최근 6개 기록을 다시 입으세요. 증거 사진은 현재 화면의 PNG입니다.</li></ol><p>BGM은 첫 클릭 후 시작하며 ON/OFF와 음량을 조절할 수 있습니다. 모든 의상과 배경은 이 모드를 위해 만든 오리지널 3D 일러스트이고, 소품은 화면 옆에 등장합니다. 기본 버전과 진행 기록은 분리되어 있어요.</p></div>';
  $('#chaos-modal').showModal();
}
document.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b||b.disabled)return;
  if(b.dataset.panel){for(const name of ['costumes','props','scenes'])$('#'+name+'-panel').hidden=name!==b.dataset.panel;document.querySelectorAll('[data-panel]').forEach(p=>p.setAttribute('aria-pressed',String(p===b)));return;}
  if(b.dataset.costume){applyLook({...desired,costume:b.dataset.costume});return;}
  if(b.dataset.prop){setDetail('prop',b.dataset.prop);return;}
  if(b.dataset.scene){setDetail('scene',b.dataset.scene);return;}
  if(b.dataset.album!==undefined){const entry=state.album[Number(b.dataset.album)];if(entry){cancelTimer();applyLook(entry.look);$('.chaos-stage-panel').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}return;}
  if(b.dataset.scroll)$(b.dataset.scroll).scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
});
$('#next-mission').addEventListener('click',()=>{cancelTimer();state.mission=(state.mission+1)%MISSIONS.length;render();persist();audio.chime('change');});
$('#randomize').addEventListener('click',()=>{const pick=list=>list[Math.floor(Math.random()*list.length)].id;applyLook({costume:pick(COSTUMES),prop:pick(PROPS),scene:pick(SCENES)});});
$('#judge').addEventListener('click',()=>judge());$('#timer-toggle').addEventListener('click',startTimer);document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick();});
$('#guide').addEventListener('click',guide);for(const id of ['modal-close','modal-continue'])$('#'+id).addEventListener('click',()=>$('#chaos-modal').close());
$('#save-photo').addEventListener('click',()=>{if(loading||!figure||!background)return;canvas.toBlob(blob=>{if(!blob){toast('사진을 저장하지 못했어요.');return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='chaos-closet-'+state.look.costume+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('이 코디의 증거 사진을 저장했어요.');},'image/png');});
$('#retry').addEventListener('click',()=>location.reload());window.addEventListener('pagehide',()=>clearInterval(ticker));
window.addEventListener('pageshow',()=>{if(deadline!==null){clearInterval(ticker);ticker=setInterval(tick,250);tick();}});
buildWardrobe();render();controls();
try{background=await loadImage('./assets/laundry-v1.png');await applyLook(state.look,false);}catch{loading=false;controls();$('#chaos-loading').hidden=true;$('#chaos-error').hidden=false;}
