export const LOOKS = [
  {id:'everyday',name:'에브리데이 데님',english:'EVERYDAY DENIM',category:'CASUAL',description:'라벤더 니트와 스트레이트 데님. 가장 나다운 일상.',tags:['캐주얼','편안함','일상'],asset:'everyday-v1.png'},
  {id:'office',name:'오피스 시크',english:'OFFICE CHIC',category:'TAILORED',description:'아이보리 재킷과 테일러드 팬츠. 단정한 자신감.',tags:['단정함','세련됨','출근'],asset:'office-v1.png'},
  {id:'evening',name:'리틀 블랙 드레스',english:'LITTLE BLACK DRESS',category:'ELEGANT',description:'클래식한 블랙 드레스. 특별한 저녁을 위한 선택.',tags:['우아함','파티','미니멀'],asset:'evening-v1.png'},
  {id:'sport',name:'소프트 애슬레저',english:'SOFT ATHLEISURE',category:'ACTIVE',description:'세이지 후디와 조거 팬츠. 편안한 움직임과 여유.',tags:['편안함','활동적','산책'],asset:'sport-v1.png'},
  {id:'date',name:'로지 카페 룩',english:'ROSY CAFE LOOK',category:'ROMANTIC',description:'로즈 카디건과 아이보리 플리츠. 다정한 오후.',tags:['로맨틱','카페','부드러움'],asset:'date-v1.png'},
  {id:'hanbok',name:'모던 한복',english:'MODERN HANBOK',category:'HERITAGE',description:'라일락 저고리와 흐르는 실크 치마. 오늘의 한국적 우아함.',tags:['전통','우아함','문화'],asset:'hanbok-v1.png'}
];
export const ACCESSORIES = [
  {id:'none',name:'액세서리 없이',detail:'미니멀하게'},
  {id:'mini',name:'로즈 미니백',detail:'사랑스러운 포인트'},
  {id:'tote',name:'클래식 블랙백',detail:'단정한 도시 감성'},
  {id:'brooch',name:'골드 플라워 브로치',detail:'작은 반짝임'}
];
export const MOODS = [
  {id:'daylight',name:'모닝 라이트',detail:'맑은 자연광'},
  {id:'sunset',name:'골든 아워',detail:'따뜻한 오후'},
  {id:'night',name:'이브닝 라운지',detail:'차분한 저녁'}
];
export const MISSIONS = [
  {id:'cafe',name:'성수동, 오후 세 시',copy:'오랜 친구와 새로 생긴 카페에 가는 날. 편안하지만 기억에 남는 룩을 골라주세요.',tags:['캐주얼','로맨틱','따뜻함'],looks:['date','everyday'],accessories:['mini','brooch'],moods:['sunset']},
  {id:'office',name:'첫 프레젠테이션',copy:'스튜디오를 소개하는 첫 미팅! 단정한 실루엣과 믿음직한 포인트가 필요해요.',tags:['출근','단정함','자신감'],looks:['office'],accessories:['tote','brooch'],moods:['daylight']},
  {id:'walk',name:'한강의 느긋한 아침',copy:'커피 한 잔을 들고 가볍게 걷는 주말. 움직이기 편한 스타일에 도전해보세요.',tags:['산책','활동적','가벼움'],looks:['sport','everyday'],accessories:['none','mini'],moods:['daylight']},
  {id:'party',name:'루프톱의 초대장',copy:'친구의 작은 전시 오프닝. 저녁 빛 속에서 돋보일 우아한 룩을 준비하세요.',tags:['파티','우아함','저녁'],looks:['evening','office'],accessories:['brooch','tote'],moods:['night']},
  {id:'heritage',name:'한옥에서 남기는 한 장',copy:'서울의 오래된 골목에서 특별한 사진을 남겨요. 전통과 오늘의 감성을 연결해보세요.',tags:['문화','전통','우아함'],looks:['hanbok'],accessories:['brooch','none'],moods:['daylight','sunset']}
];
export const DEFAULT_LOOK = {outfit:'everyday',accessory:'none',mood:'daylight'};
export function validLook(look) {
  return !!look && LOOKS.some(item=>item.id===look.outfit) && ACCESSORIES.some(item=>item.id===look.accessory) && MOODS.some(item=>item.id===look.mood);
}
export function evaluateLook(look, missionId) {
  const mission=MISSIONS.find(item=>item.id===missionId);
  if (!validLook(look)||!mission) throw new Error('Invalid style or mission');
  const outfit=mission.looks.includes(look.outfit)?70:30;
  const accessory=mission.accessories.includes(look.accessory)?20:5;
  const mood=mission.moods.includes(look.mood)?10:0;
  const score=outfit+accessory+mood;
  return {score,outfit,accessory,mood,grade:score>=90?'S':score>=75?'A':score>=55?'B':'C',success:score>=75};
}
export function rewardForResult(progress, missionId, score) {
  const previous=progress[missionId]??0;
  const target=score>=75?3:1;
  const earned=Math.max(0,target-previous);
  return {earned,total:Math.max(previous,target)};
}
