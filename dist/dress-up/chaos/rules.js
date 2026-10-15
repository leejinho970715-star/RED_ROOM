export const COSTUMES=[
  {id:'duck',name:'오리 부장 출근룩',tag:'결재는 물 위에서',asset:'duck-v1.png'},
  {id:'broccoli',name:'브로콜리 식당 기사',tag:'방어력보다 식이섬유',asset:'broccoli-v1.png'},
  {id:'noodle',name:'새벽 라면 마법사',tag:'마나 대신 분말수프',asset:'noodle-v1.png'},
  {id:'rain',name:'실내 전용 장마룩',tag:'천장 아래 강수 확률 100%',asset:'rain-v1.png'},
  {id:'banana',name:'바나나 특급 배송',tag:'껍질까지 당일 도착',asset:'banana-v1.png'},
  {id:'space',name:'우주 파자마 인턴',tag:'출근지는 지구 밖',asset:'space-v1.png'}
];
export const PROPS=[
  {id:'none',name:'빈손의 자신감',icon:'✋',tag:'아무것도 안 챙겼다'},
  {id:'spoon',name:'대왕 숟가락',icon:'🥄',tag:'한 술에 모든 걸 건다'},
  {id:'duck',name:'응원용 고무오리',icon:'🦆',tag:'꽥. 그것이 전부다'},
  {id:'paycheck',name:'월급 지킴 봉투',icon:'✉',tag:'이것만은 정상이다'}
];
export const SCENES=[
  {id:'day',name:'멀쩡한 대낮',tag:'아무 일도 없던 척'},
  {id:'pink',name:'핑크빛 야근',tag:'퇴근 버튼을 잃어버림'},
  {id:'disco',name:'세탁방 디스코',tag:'탈수 모드가 무대다'}
];
export const MISSIONS=[
  {id:'meeting',name:'첫 출근인데 수영장 회의',copy:'신입인데 수영장이 회의실이래요. 물에 뜨는 복장과 월급을 지키는 물건이 필요해요. 분위기만큼은 멀쩡하게!',costumes:['duck'],props:['paycheck'],scenes:['day'],tags:['물에 뜸','월급 사수','대낮']},
  {id:'knight',name:'구내식당 최종 보스',copy:'오늘의 용사는 주방에서 뽑습니다. 채소를 지키는 기사여, 한 술 크게 떠보세요. 점심시간 출동!',costumes:['broccoli'],props:['spoon'],scenes:['day'],tags:['식이섬유','대왕 한 술','점심']},
  {id:'midnight',name:'새벽 3시의 금지된 야식',copy:'수프 한 봉지로 세탁방을 소환했어요. 라면 마법사와 거대한 식사 도구로 디스코를 완성하세요.',costumes:['noodle'],props:['spoon'],scenes:['disco'],tags:['라면 마법','야식 도구','디스코']},
  {id:'indoor-rain',name:'천장 아래에만 폭우',copy:'밖은 맑은데 스튜디오 안만 장마예요. 비를 피할 복장과 물 위에서 응원할 친구를 골라주세요. 오늘도 야근!',costumes:['rain'],props:['duck'],scenes:['pink'],tags:['실내 장마','꽥꽥 응원','야근']},
  {id:'delivery',name:'껍질째 특급 배송',copy:'택배 상자보다 내가 더 눈에 띄어야 해요. 바나나 배송원은 월급 봉투를 챙기고 대낮에 출발합니다.',costumes:['banana'],props:['paycheck'],scenes:['day'],tags:['노란 배송원','월급 사수','대낮']},
  {id:'orbit',name:'우주 세탁소 첫 야간 근무',copy:'달에서 잠옷 차림으로 출근하래요. 우주 인턴과 꽥꽥 동료를 데리고 탈수 디스코에 합류하세요.',costumes:['space'],props:['duck'],scenes:['disco'],tags:['우주 잠옷','꽥꽥 동료','디스코']}
];
export const DEFAULT_LOOK={costume:'duck',prop:'none',scene:'day'};
export const GRADES={
  S:{title:'전설의 혼돈',line:'세탁기 3호: “탈수하다가 기립박수 쳤습니다.”',asset:'reaction-s-v1.png'},
  A:{title:'훌륭한 사고',line:'오리 심사위원: “꽥! 결재합니다.”',asset:'reaction-a-v1.png'},
  B:{title:'아직은 사람 같음',line:'옷장 관리자: “조금만 더 이상해질 수 있어요.”',asset:'reaction-b-v1.png'},
  C:{title:'너무 정상적입니다',line:'세탁기 3호: “상식은 잠시 맡기고 오세요.”',asset:'reaction-c-v1.png'}
};
export function validLook(look){return !!look&&COSTUMES.some(c=>c.id===look.costume)&&PROPS.some(p=>p.id===look.prop)&&SCENES.some(s=>s.id===look.scene);}
export function evaluate(look,missionId){
  const mission=MISSIONS.find(m=>m.id===missionId);if(!validLook(look)||!mission)throw new Error('Invalid chaos look or mission');
  const costume=mission.costumes.includes(look.costume)?60:20,prop=mission.props.includes(look.prop)?25:10,scene=mission.scenes.includes(look.scene)?15:5;
  const score=costume+prop+scene,grade=score>=90?'S':score>=75?'A':score>=55?'B':'C';
  const hints=[];if(costume<60)hints.push('의뢰 속 주인공이 될 복장을 다시 골라보세요.');if(prop<25)hints.push('동행 소품 힌트를 확인해보세요.');if(scene<15)hints.push('시간과 무대 분위기를 바꿔보세요.');
  return {score,grade,costume,prop,scene,hints,success:score>=75};
}
export function reward(progress,missionId,score){const previous=[1,3].includes(progress[missionId])?progress[missionId]:0,total=Math.max(previous,score>=75?3:1);return {earned:total-previous,total};}
export function remainingSeconds(deadline,now=Date.now()){return deadline===null?null:Math.max(0,Math.ceil((deadline-now)/1000));}
export function normalizeState(raw){
  const look=validLook(raw?.look)?{costume:raw.look.costume,prop:raw.look.prop,scene:raw.look.scene}:{...DEFAULT_LOOK};
  const mission=Number.isInteger(raw?.mission)&&raw.mission>=0&&raw.mission<MISSIONS.length?raw.mission:0;
  const rewards=Object.fromEntries(MISSIONS.map(m=>[m.id,[1,3].includes(raw?.rewards?.[m.id])?raw.rewards[m.id]:0]));
  const album=Array.isArray(raw?.album)?raw.album.filter(a=>a&&validLook(a.look)&&MISSIONS.some(m=>m.id===a.mission)&&Number.isFinite(a.score)&&a.score>=0&&a.score<=100&&Object.hasOwn(GRADES,a.grade)).slice(0,6).map(a=>({...a,look:{...a.look}})):[];
  return {look,mission,rewards,album};
}
