import {SLOTS,FILTERS,RARITIES,CATALOG,COST,REWARDS,initialState,newRound,randomSeed,sha256,gachaResult,lotteryNumbers,nameFor,canEquip,ticketOf,validTicket,matches,sellPart,matchProbability,verifyGacha,verifyLottery} from './game.js';
import {partArt,characterArt} from './art.js';
import {createScenes} from './scene.js';
import {createRedButton} from './red-button.js';
import {createGameAudio} from './audio.js';
const $=s=>document.querySelector(s);
const icon=id=>`<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;
const eth=n=>(n/1e6).toFixed(4);
const pad=n=>String(n).padStart(2,'0');
const storageKey='red-room-v2';
const audio=createGameAudio();
let state,view='arcade',filter='all',busy=false,scenes,depositAmount=10000,toastTimer,flipped=false;
try{state=JSON.parse(localStorage.getItem(storageKey));if(!state||state.version!==1||!Array.isArray(state.inventory)||state.equipped?.length!==8||!state.round||!Number.isSafeInteger(state.balance)||state.balance<0)state=null;}catch{state=null;}
if(!state)state=await initialState();
if(!state.nextGacha){const seed=randomSeed();state.nextGacha={seed,commit:await sha256(seed)};}
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{toast('저장 공간이 부족해 현재 플레이를 저장하지 못했습니다.');}}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500);}
function modal(content,eyebrow='RED ROOM TERMINAL'){if($('#modal').open)$('#modal').close();$('#modal-content').innerHTML=content;$('#modal-eyebrow').textContent=eyebrow;$('#modal').showModal();}
function closeModal(){$('#modal').close();}
$('#close-modal').addEventListener('click',closeModal);
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){const r=$('#modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();}});
function equippedParts(){return state.equipped.map(id=>state.inventory.find(p=>p.id===id)??null);}
function render(){
 $('#balance').textContent=eth(state.balance);$('#round-id').textContent=String(state.round.id).padStart(4,'0');$('#inventory-count').textContent=pad(state.inventory.length);$('#nav-count').textContent=state.inventory.length;
 $('#next-gacha-commit').textContent=`NEXT SEED / ${state.nextGacha.commit.slice(0,24)}…`;$('#next-gacha-commit').title=state.nextGacha.commit;
 const parts=equippedParts(),ticket=ticketOf(state);$('#equipped-count').textContent=parts.filter(Boolean).length;
 $('#equip-slots').innerHTML=parts.map((p,i)=>`<button class="equip-slot ${i%2?'right':''} ${p?'equipped':''}" data-choose-slot="${i}" data-slot="${i}" aria-label="${SLOTS[i]} ${p?'번호 '+p.number+' 장착':'빈 슬롯, 장착하기'}"><span>${p?pad(p.number):'+'}</span><small>${SLOTS[i]}</small></button>`).join('');
 $('#ticket-numbers').innerHTML=ticket.map(n=>`<span class="ticket-number ${n===null?'empty':''}">${n===null?'—':pad(n)}</span>`).join('');
 const submitted=!!state.round.ticket;$('#submit-ticket').disabled=(!submitted&&!validTicket(ticket))||busy;$('#submit-ticket').innerHTML=`${submitted?'등록된 조합 결과 확인':validTicket(ticket)?'이 조합으로 로또 참여하기':'파츠를 장착해 조합 완성하기'}${icon('arrow')}`;
 renderInventory();renderFairness();if(view==='results')renderResults();$('#character-illustration').innerHTML=characterArt(parts,flipped);persist();
}
function card(part,catalog=false){
 const r=RARITIES[part.rarity],equipped=state.equipped.includes(part.id),collected=state.inventory.some(p=>p.slot===part.slot&&p.rarity===part.rarity);
 return `<article class="part-card ${equipped?'selected':''} ${catalog&&!collected?'uncollected':''}" style="--rarity:${r.color};--aura:${r.color}1c"><div class="part-card-top"><span class="rarity">${r.name}</span><span class="part-number">${catalog?`#${pad(part.rarity*8+part.slot+1)}`:pad(part.number)}</span></div><div class="part-art">${partArt(part.slot,part.rarity)}</div><h3 class="part-name">${nameFor(part)}</h3><div class="part-meta"><span>${SLOTS[part.slot]} · ${r.label}</span><span>${catalog?r.chance+'%':part.starter?'STARTER':part.id.slice(-7).toUpperCase()}</span></div>${catalog?`<div class="catalog-status ${collected?'collected':''}">${collected?'✓ 수집 완료':'미수집'}<span>판매 ${eth(r.sale)} ETH</span></div>`:`<div class="part-card-actions"><button class="equip-button ${equipped?'equipped':''}" data-equip="${part.id}">${equipped?'✓ 장착 중':'파츠 장착'}${equipped?'':icon('plus')}</button><button class="sell-button" data-sell="${part.id}" aria-label="${nameFor(part)} 판매">판매<span>${eth(r.sale)}</span></button></div>`}</article>`;
}
function renderInventory(){
 const owned=[...state.inventory].reverse().filter(p=>filter==='all'||FILTERS[p.slot]===filter);
 const list=view==='inventory'?owned:owned.slice(0,5);
 $('#parts-grid').innerHTML=list.map(p=>card(p)).join('');$('#empty-parts').hidden=list.length>0;
 $('#part-filters').querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.filter===filter));
}
function navigate(next){
 view=next;$('#arcade-view').hidden=!['arcade','inventory'].includes(next);$('#arcade-view').classList.toggle('full-inventory',next==='inventory');$('#results-view').hidden=next!=='results';$('#fairness-view').hidden=next!=='fairness';
 const names={arcade:'GACHA ARCADE',inventory:'MY NFT PARTS',results:'LOTTERY & REWARDS',fairness:'FAIRNESS CHECK'};$('#breadcrumb').textContent=names[next];document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.nav===next));render();window.scrollTo({top:0,behavior:'smooth'});
}
function equip(id,showToast=true){
 const part=state.inventory.find(p=>p.id===id);if(!part)return;
 if(!canEquip(state,part)){audio.play('error');toast('같은 번호가 이미 장착되어 있습니다. 서로 다른 8개 번호를 조합하세요.');return;}
 if(state.equipped[part.slot]===id)return;
 state.equipped[part.slot]=id;audio.play('equip');render();if(showToast)toast(`${SLOTS[part.slot]}에 ${nameFor(part)} · ${pad(part.number)} 장착 완료`);
}
function chooseSlot(slot){
 const parts=state.inventory.filter(p=>p.slot===slot);
 modal(`<h2>${SLOTS[slot]} 파츠 장착</h2><p>서로 다른 번호의 파츠를 골라 운명을 조립하세요.</p><div class="slot-picker">${parts.length?parts.map(p=>`<button class="slot-pick ${state.equipped[slot]===p.id?'chosen':''}" data-pick="${p.id}"><span class="slot-pick-art">${partArt(p.slot,p.rarity)}</span><span><b style="color:${RARITIES[p.rarity].color}">${nameFor(p)}</b><small>${RARITIES[p.rarity].label} · 로또 번호 ${pad(p.number)}</small></span><strong>${pad(p.number)}</strong></button>`).join(''):'<div class="empty-state">이 부위의 파츠가 없습니다.<br>가챠 머신에서 새 파츠를 추출하세요.</div>'}</div>${state.equipped[slot]?`<button class="modal-secondary" data-unequip="${slot}">현재 파츠 장착 해제</button>`:''}`,'ASSEMBLE YOUR SURVIVOR');
}
function showDrop(part){
 const rarity=RARITIES[part.rarity];
 modal(`<div class="modal-rarity" style="color:${rarity.color}">${rarity.name} / ${rarity.label} · ${rarity.chance}%</div><h2>${nameFor(part)}</h2><p>${SLOTS[part.slot]}의 새로운 조각을 발견했습니다.</p><div class="modal-art" style="background:radial-gradient(ellipse,${rarity.color}22,transparent 65%)">${partArt(part.slot,part.rarity)}</div><div class="drop-number"><span>YOUR LOTTERY NUMBER</span><strong class="modal-number">${pad(part.number)}</strong></div><button class="modal-primary" data-drop-equip="${part.id}">생존자에게 장착하기 ${icon('arrow')}</button><button class="modal-secondary" data-drop-sell="${part.id}">바로 판매 · ${eth(rarity.sale)} DEMO ETH</button><button class="modal-secondary" data-action="close">수집함에 보관하기</button><p class="modal-inline-note">판매하면 파츠가 사라지고 판매액이 플레이 잔액에 즉시 지급됩니다.</p>`,'NEW PART EXTRACTED');
}
async function finishPending(){
 const pending=state.pending;if(!pending)return;
 const result=await gachaResult(pending.seed),part={...result,id:`nft-${pending.id}`,typeId:`${result.rarity}-${result.slot}`};
 state.inventory.push(part);state.proofs.unshift({...pending,...result,kind:'gacha',partId:part.id});delete state.pending;const seed=randomSeed();state.nextGacha={seed,commit:await sha256(seed)};render();return part;
}
async function draw(){
 if(busy)return;audio.unlock();audio.play('press');if(state.balance<COST){audio.play('error');toast('플레이 잔액이 부족합니다. 데모 ETH를 충전하거나 파츠를 판매하세요.');showDeposit();return;}
 busy=true;$('#draw-button').disabled=true;$('#draw-button').classList.add('extracting');$('#draw-label').textContent='EXTRACTING';$('#draw-status').textContent='EXTRACTING YOUR PART';$('#machine-scene').classList.add('spin-active');
 try{
  const {seed,commit}=state.nextGacha,id=crypto.randomUUID();
  state.pending={seed,commit,id,time:Date.now()};state.balance-=COST;persist();$('#balance').textContent=eth(state.balance);scenes?.spin();audio.play('spin');
  await new Promise(resolve=>setTimeout(resolve,1400));const part=await finishPending();showDrop(part);audio.play('drop',part.rarity);
 }catch{toast('추출을 마무리하지 못했습니다. 새로고침하면 저장된 추출을 복구합니다.');}
 finally{busy=false;$('#draw-button').disabled=false;$('#draw-button').classList.remove('extracting');$('#draw-label').textContent='EXTRACT';$('#draw-status').textContent='PRESS TO EXTRACT';$('#machine-scene').classList.remove('spin-active');render();}
}
function showSale(id){
 const part=state.inventory.find(p=>p.id===id);if(!part)return;const rarity=RARITIES[part.rarity];
 modal(`<h2>파츠를 다음 기회로.</h2><p>${nameFor(part)} · 번호 ${pad(part.number)}<br>판매한 파츠는 수집함에서 제거됩니다.${state.equipped.includes(id)?'<br>현재 장착 중인 파츠이므로 장착도 해제됩니다.':''}</p><div class="sale-summary"><span>판매 후 받을 금액</span><strong>${eth(rarity.sale)} <small>DEMO ETH</small></strong><span>판매 후 잔액: ${eth(state.balance+rarity.sale)} ETH</span></div><button class="modal-primary" data-confirm-sell="${id}">판매하고 잔액 받기</button><button class="modal-secondary" data-action="close">계속 보관하기</button>`,'RECYCLE. RECHARGE. REPLAY.');
}
function executeSale(id){const result=sellPart(state,id);if(!result){audio.play('error');toast('이미 판매되었거나 보유하지 않은 파츠입니다.');closeModal();return;}audio.play('sell');render();closeModal();toast(`${nameFor(result.part)} 판매 완료 · +${eth(result.value)} DEMO ETH`);}
function showDeposit(){depositAmount=10000;modal(`<h2>붉은 불빛을 이어가세요.</h2><p>데모 ETH를 충전하고 새로운 파츠를 추출하세요.</p><div class="demo-banner">DEMO NETWORK · 실제 가상화폐 결제 없음</div><div class="deposit-amounts">${[10000,50000,100000].map(n=>`<button data-amount="${n}" class="${n===depositAmount?'active':''}">${eth(n)}<br><small>ETH</small></button>`).join('')}</div><div class="deposit-detail"><span>현재 잔액</span><strong>${eth(state.balance)} DEMO ETH</strong></div><button class="modal-primary" id="confirm-deposit">0.0100 DEMO ETH 충전</button><p class="modal-inline-note">데모 잔액은 이 브라우저에 저장됩니다. 실제 입금·출금·스마트 계약은 연결되지 않았습니다.</p>`,'KEEP THE RED LIGHT ON');}
function showWallet(){
 modal(`<h2>당신의 생존자 ID.</h2><p>브라우저 지갑의 주소를 연결할 수 있습니다. 데모 플레이에는 지갑이 필요하지 않습니다.</p><button class="modal-primary" data-action="connect-wallet">${icon('wallet')} 브라우저 지갑 연결</button><button class="modal-secondary" data-action="close">지갑 없이 데모 계속하기</button><div class="demo-banner">주소 연결만 요청합니다. 서명과 송금은 요청하지 않습니다.</div><p class="modal-inline-note">실제 자산 잔액과 게임의 DEMO ETH 잔액은 별개입니다.</p>`,'YOUR WALLET. YOUR IDENTITY.');
}
async function connectWallet(){
 if(!window.ethereum?.request){toast('연결된 브라우저 지갑이 없습니다. 지갑 없이 데모를 즐길 수 있습니다.');return;}
 try{const accounts=await window.ethereum.request({method:'eth_requestAccounts'});const account=accounts[0];if(!account){toast('지갑에서 연결할 계정을 선택하세요.');return;}$('#wallet-label').textContent=`${account.slice(0,6)}…${account.slice(-4)}`;closeModal();toast('지갑 주소를 연결했습니다. 게임 잔액은 DEMO ETH입니다.');}catch(error){toast(error.code===4001?'지갑 연결 요청을 취소했습니다.':'지갑 연결을 완료하지 못했습니다.');}
}
window.ethereum?.on?.('accountsChanged',accounts=>{$('#wallet-label').textContent=accounts[0]?`${accounts[0].slice(0,6)}…${accounts[0].slice(-4)}`:'CONNECT WALLET';});
function showOdds(){
 modal(`<h2>모든 확률, 숨김없이.</h2><p>번호는 등급과 무관하게 1–50 각각 2%.<br>각 부위는 12.5%. 등급 내 8개 파츠의 확률은 동일합니다.</p><table class="odds-table"><thead><tr><th>등급</th><th>등급 확률</th><th>1종의 확률</th><th>판매 ETH</th></tr></thead><tbody>${[...RARITIES].reverse().map(r=>`<tr><td style="color:${r.color}">${r.label}</td><td>${r.chance}%</td><td>${(r.chance/8).toFixed(r.chance<1?5:3)}%</td><td>${eth(r.sale)}</td></tr>`).join('')}</tbody></table><p class="modal-inline-note">7개 등급 × 8개 부위 = 56종 · 확률 합계 100%<br>신화 1/10,000 · 에픽 9/10,000. 매 추첨은 독립적이며 천장 시스템은 없습니다.</p><button class="modal-primary" data-action="open-fairness">추첨 기록과 검증 방식 보기 ${icon('arrow')}</button>`,'TRANSPARENT DROP RATES');
}
function showCatalog(){
 const ownedTypes=new Set(state.inventory.map(p=>`${p.rarity}-${p.slot}`));
 modal(`<h2>지하실의 56개 조각.</h2><p>7개 등급 × 8개 부위. 현재 보유 ${ownedTypes.size} / 56종.<br>각 파츠의 로또 번호는 추출할 때 별도로 부여됩니다.</p><div class="catalog-tabs">${[...RARITIES].reverse().map((r,i)=>`<button class="${i===0?'active':''}" data-catalog-tier="${RARITIES.indexOf(r)}" style="--tier-color:${r.color}">${r.label}</button>`).join('')}</div><div class="catalog-grid" id="catalog-grid"></div>`,'THE 56 / PARTS ENCYCLOPEDIA');$('#modal').classList.add('wide-modal');renderCatalog(6);
}
function renderCatalog(rarity){$('#catalog-grid').innerHTML=CATALOG.filter(p=>p.rarity===rarity).map(p=>card(p,true)).join('');document.querySelectorAll('[data-catalog-tier]').forEach(b=>b.classList.toggle('active',Number(b.dataset.catalogTier)===rarity));}
$('#modal').addEventListener('close',()=>$('#modal').classList.remove('wide-modal'));
function showGuide(){modal(`<h2>지하 아케이드에 오신 걸 환영합니다.</h2>${[['레드버튼을 누르세요.','1회마다 0.001 DEMO ETH를 사용합니다. 56종 중 하나의 파츠와 1–50의 번호가 나옵니다.'],['파츠로 생존자를 조립하세요.','8개 부위를 각각 장착하세요. 같은 번호는 동시에 장착할 수 없습니다.'],['8개의 번호로 로또에 참여하세요.','완성한 조합을 등록하면 데모 추첨 결과를 즉시 확인합니다. 번호의 순서는 무관합니다.'],['판매하고, 다시 플레이하세요.','필요 없는 파츠를 판매하면 등급별 DEMO ETH를 받아 다시 추첨할 수 있습니다.'],['결과를 직접 검증하세요.','공개된 시드와 해시로 같은 번호를 다시 계산합니다. 현재는 온체인이 아닌 브라우저 데모입니다.']].map((s,i)=>`<div class="guide-step"><span>${pad(i+1)}</span><div><h3>${s[0]}</h3><p>${s[1]}</p></div></div>`).join('')}<button class="modal-primary" data-action="close">아케이드 입장</button>`,'SURVIVOR FIELD GUIDE');}
function showStory(){modal(`<div class="eyebrow">SEOUL / SECTOR 07 / B3</div><h2>세상이 꺼진 뒤,<br>버튼 하나가 남았다.</h2><p>도시는 더 이상 잠들지 않았다. 이미 모든 불빛이 꺼져 있었으니까.</p><p>지하 3층, 낡은 오락기 한 대가 붉은 빛을 내뿜는다. 잊힌 화폐 대신 블록체인으로 이어진 조각들이 기계 안에서 흔들린다. 누군가는 갑옷을 얻고, 누군가는 새로운 운명을 얻는다.</p><p>당신이 모은 여덟 개의 조각은 하나의 생존자가 된다. 그리고 그 생존자는 당신만의 로또 번호가 된다.</p><p style="color:#e17e71">지상에는 아무것도 남지 않았지만,<br>이곳에서는 아직 플레이할 수 있다.</p><button class="modal-primary" data-action="close">KEEP THE RED LIGHT ON.</button>`,'RED ROOM / ORIGIN STORY');}
async function submitTicket(){
 if(busy)return;if(state.round.ticket){navigate('results');return;}const ticket=ticketOf(state);if(!validTicket(ticket)){toast('8개 부위에 서로 다른 번호의 파츠를 장착하세요.');return;}
 const snapshot=[...ticket];modal(`<h2>운명의 조합이 완성됐습니다.</h2><p>이 라운드에는 아래 번호로 한 번 참여합니다.<br>추가 참여 비용은 없습니다. 이미 추출한 파츠도 유지됩니다.</p><div class="result-numbers">${snapshot.map(n=>`<span>${pad(n)}</span>`).join('')}</div><p class="modal-inline-note">추첨 전 시드 커밋: <code style="overflow-wrap:anywhere">${state.round.commit}</code></p><button class="modal-primary" id="confirm-ticket">조합 등록하고 결과 확인하기</button><button class="modal-secondary" data-action="close">조합 더 수정하기</button>`,'LOCK IN YOUR DESTINY');
 $('#confirm-ticket').addEventListener('click',async()=>{
  if(busy||state.round.ticket)return;busy=true;$('#confirm-ticket').disabled=true;
  try{const numbers=await lotteryNumbers(state.round.seed);state.round.ticket=snapshot;state.round.result={numbers,matches:matches(snapshot,numbers),claimed:false};state.history.unshift({round:state.round.id,ticket:snapshot,numbers,seed:state.round.seed,commit:state.round.commit});persist();closeModal();navigate('results');audio.play('drop');}catch{audio.play('error');toast('결과를 준비하지 못했습니다. 다시 시도하세요.');}finally{busy=false;render();}
 },{once:true});
}
function renderResults(){
 const r=state.round;if(!r.result){$('#results-content').innerHTML=`<div class="results-empty">${icon('trophy')}<h3>아직 조립되지 않은 운명.</h3><p>8개 부위의 파츠를 장착하고 서로 다른 번호를 완성하세요.<br>완성한 조합으로 이번 데모 라운드에 참여할 수 있습니다.</p><button data-nav="arcade">생존자 조립하러 가기 ${icon('arrow')}</button></div><div class="reward-table">${rewardTable()}</div>`;return;}
 const result=r.result,reward=REWARDS[result.matches];
 $('#results-content').innerHTML=`<div class="result-header"><div class="eyebrow">ROUND #${String(r.id).padStart(4,'0')} / REVEALED</div><h3>${reward?'어둠 속에서, 기회를 발견했습니다.':'다음 운명의 조각이 기다립니다.'}</h3><p>당첨 번호 · 순서와 관계없이 일치하는 번호를 확인합니다.</p></div><div class="result-numbers">${result.numbers.map(n=>`<span class="${r.ticket.includes(n)?'match':''}">${pad(n)}</span>`).join('')}</div><p class="your-ticket">나의 등록 번호: ${r.ticket.map(pad).join(' · ')}</p><div class="result-detail"><div><span>일치하는 번호</span><strong>${result.matches} / 8</strong></div><div><span>받을 데모 리워드</span><strong>${eth(reward)} ETH</strong></div></div><div class="result-actions">${reward?`<button class="primary" id="claim-reward" ${result.claimed?'disabled':''}>${result.claimed?'✓ 잔액으로 지급 완료':'데모 리워드 받기'}</button>`:''}<button id="next-round">다음 데모 라운드 시작 ${icon('arrow')}</button></div><div class="result-proof"><h3 class="proof-title">공개된 라운드 시드</h3><div class="hash-box">${r.seed}</div><button class="verify-button" id="verify-round">시드와 당첨 번호 검증하기</button></div><div class="reward-table">${rewardTable()}</div>`;
}
function rewardTable(){return `<h3 class="proof-title">리워드 & 당첨 확률</h3><table class="odds-table"><thead><tr><th>일치 번호</th><th>정확히 일치할 확률</th><th>리워드 (DEMO ETH)</th></tr></thead><tbody>${[8,7,6,5,4,3].map(k=>`<tr><td>${k}개</td><td>${(matchProbability(k)*100).toFixed(k>=7?9:6)}%</td><td>${eth(REWARDS[k])}</td></tr>`).join('')}</tbody></table><p class="modal-inline-note">리워드는 일치 개수별 최고 1건을 지급하며 중복 합산하지 않습니다. 실제 출금은 지원하지 않습니다.</p>`;}
function renderFairness(){
 $('#round-commit').textContent=state.round.commit;
 if(!$('#next-commit-full'))$('#round-commit').insertAdjacentHTML('afterend','<p class="next-commit-label">다음 가챠 추출 시드 커밋 · 버튼을 누르기 전에 고정됩니다.</p><div class="hash-box" id="next-commit-full"></div>');$('#next-commit-full').textContent=state.nextGacha.commit;
 $('#proof-list').innerHTML=state.proofs.length?state.proofs.slice(0,20).map(p=>`<div class="proof-row"><div class="proof-row-header"><span>${nameFor(p)} · ${pad(p.number)} · ${RARITIES[p.rarity].label}</span><span>${new Date(p.time).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})}</span></div><div class="hash-box">COMMIT: ${p.commit}<br>REVEAL: ${p.seed}</div><button class="verify-button" data-verify="${p.id}">시드로 결과 다시 검증</button></div>`).join(''):'<div class="empty-state">아직 추첨 기록이 없습니다. 첫 번째 레드버튼을 눌러보세요.</div>';
}
function exportProofs(){const {seed,...round}=state.round;const payload={notice:'Browser-local demo. Not on-chain or independently guaranteed. Algorithm: SHA-256 rejection sampling.',rarities:RARITIES,proofs:state.proofs,nextGachaCommit:state.nextGacha.commit,history:state.history,round:{...round,...(round.result?{seed}:{})}};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='red-room-proofs.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);}
document.addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b||b.disabled)return;
 if(b.dataset.nav){audio.play('ui');navigate(b.dataset.nav);return;}
 if(b.dataset.filter){audio.play('ui');filter=b.dataset.filter;renderInventory();return;}
 if(b.dataset.equip){equip(b.dataset.equip);return;}
 if(b.dataset.sell){showSale(b.dataset.sell);return;}
 if(b.dataset.chooseSlot!==undefined){chooseSlot(Number(b.dataset.chooseSlot));return;}
 if(b.dataset.pick){equip(b.dataset.pick);closeModal();return;}
 if(b.dataset.unequip!==undefined){state.equipped[Number(b.dataset.unequip)]=null;audio.play('unequip');render();closeModal();return;}
 if(b.dataset.dropEquip){equip(b.dataset.dropEquip);closeModal();return;}
 if(b.dataset.dropSell){executeSale(b.dataset.dropSell);return;}
 if(b.dataset.confirmSell){executeSale(b.dataset.confirmSell);return;}
 if(b.dataset.amount){depositAmount=Number(b.dataset.amount);document.querySelectorAll('[data-amount]').forEach(b=>b.classList.toggle('active',Number(b.dataset.amount)===depositAmount));$('#confirm-deposit').textContent=`${eth(depositAmount)} DEMO ETH 충전`;return;}
 if(b.id==='confirm-deposit'){state.balance+=depositAmount;audio.play('deposit');render();closeModal();toast(`${eth(depositAmount)} DEMO ETH 충전 완료`);return;}
 if(b.dataset.catalogTier!==undefined){renderCatalog(Number(b.dataset.catalogTier));return;}
 if(b.id==='claim-reward'){if(state.round.result&&!state.round.result.claimed){state.round.result.claimed=true;state.balance+=REWARDS[state.round.result.matches];audio.play('reward');render();toast('데모 리워드가 플레이 잔액으로 지급되었습니다.');}return;}
 if(b.id==='next-round'){if(state.round.result&&REWARDS[state.round.result.matches]&&!state.round.result.claimed){toast('이번 라운드의 데모 리워드를 먼저 받아주세요.');return;}b.disabled=true;state.round=await newRound(state.round.id+1);navigate('arcade');toast('새 라운드의 시드 해시를 공개했습니다.');return;}
 if(b.id==='verify-round'){b.textContent=await verifyLottery({seed:state.round.seed,commit:state.round.commit,numbers:state.round.result.numbers})?'✓ 시드 해시와 8개 당첨 번호가 일치합니다.':'검증 실패: 기록이 일치하지 않습니다.';return;}
 if(b.dataset.verify){const proof=state.proofs.find(p=>p.id===b.dataset.verify);b.textContent=await verifyGacha(proof)?'✓ 해시 · 부위 · 번호 · 등급 모두 일치':'검증 실패: 기록이 일치하지 않습니다.';return;}
 const actions={wallet:showWallet,deposit:showDeposit,odds:showOdds,catalog:showCatalog,help:showGuide,story:showStory,close:closeModal,'connect-wallet':connectWallet,'open-fairness':()=>{closeModal();navigate('fairness');},rotate:()=>{flipped=!flipped;$('#character-illustration').innerHTML=characterArt(equippedParts(),flipped);}};if(actions[b.dataset.action]){audio.play('ui');actions[b.dataset.action]();}
});
$('#draw-button').addEventListener('click',draw);$('#submit-ticket').addEventListener('click',submitTicket);$('#export-proofs').addEventListener('click',exportProofs);
$('.brand').addEventListener('click',e=>{e.preventDefault();navigate('arcade');});
render();
await document.fonts.ready;
createRedButton();
try{scenes=createScenes(draw);}catch(error){console.error('3D scene unavailable',error);toast('이 브라우저에서는 3D 표시를 준비하지 못했습니다. 게임 버튼은 계속 사용할 수 있습니다.');}
if(state.pending){await finishPending();toast('저장된 추출을 복구했습니다. 파츠가 수집함에 추가되었습니다.');}
function updateClock(){const seconds=Math.max(0,Math.floor((state.round.expires-Date.now())/1000));const hours=Math.floor(seconds/3600),minutes=Math.floor(seconds%3600/60),secs=seconds%60;$('#countdown').innerHTML=`${pad(hours)}<span>:</span>${pad(minutes)}<span>:</span>${pad(secs)}`;}
updateClock();setInterval(updateClock,1000);
