export const LOOKS = [
  {id:'everyday',name:'에브리데이 데님',english:'EVERYDAY DENIM',category:'CASUAL',description:'라벤더 니트와 스트레이트 데님. 가장 나다운 일상.',tags:['캐주얼','편안함','일상'],asset:'everyday-v1.png'},
  {id:'office',name:'오피스 시크',english:'OFFICE CHIC',category:'TAILORED',description:'아이보리 재킷과 테일러드 팬츠. 단정한 자신감.',tags:['단정함','세련됨','출근'],asset:'office-v1.png'},
  {id:'evening',name:'리틀 블랙 드레스',english:'LITTLE BLACK DRESS',category:'ELEGANT',description:'클래식한 블랙 드레스. 특별한 저녁을 위한 선택.',tags:['우아함','파티','미니멀'],asset:'evening-v1.png'},
  {id:'sport',name:'소프트 애슬레저',english:'SOFT ATHLEISURE',category:'ACTIVE',description:'세이지 후디와 조거 팬츠. 편안한 움직임과 여유.',tags:['편안함','활동적','산책'],asset:'sport-v1.png'},
  {id:'date',name:'로지 카페 룩',english:'ROSY CAFE LOOK',category:'ROMANTIC',description:'로즈 카디건과 아이보리 플리츠. 다정한 오후.',tags:['로맨틱','카페','부드러움'],asset:'date-v1.png'},
  {id:'hanbok',name:'모던 한복',english:'MODERN HANBOK',category:'HERITAGE',description:'라일락 저고리와 흐르는 실크 치마. 오늘의 한국적 우아함.',tags:['전통','우아함','문화'],asset:'hanbok-v1.png'},
  {id:'trench',name:'라테 트렌치',english:'LATTE TRENCH',category:'CITY',description:'베이지 트렌치와 데님. 도시의 바람까지 스타일로.',tags:['시티','클래식','단정함'],asset:'trench-v1.png'},
  {id:'leather',name:'미드나잇 레더',english:'MIDNIGHT LEATHER',category:'EDGY',description:'블랙 레더 재킷과 차콜 데님. 선명한 나만의 태도.',tags:['시티','개성','시크'],asset:'leather-v1.png'},
  {id:'stripe',name:'마린 스트라이프',english:'MARINE STRIPE',category:'CASUAL',description:'네이비 스트라이프와 크림 팬츠. 산뜻한 일상의 리듬.',tags:['캐주얼','미니멀','편안함'],asset:'stripe-v1.png'},
  {id:'shirt',name:'블루 셔츠 클래식',english:'BLUE SHIRT CLASSIC',category:'CLASSIC',description:'스카이 블루 셔츠와 미디 스커트. 차분하고 또렷하게.',tags:['단정함','출근','클래식'],asset:'shirt-v1.png'},
  {id:'teal',name:'틸 랩 드레스',english:'TEAL WRAP DRESS',category:'ELEGANT',description:'깊은 틸 컬러와 부드러운 드레이프. 특별한 저녁의 여유.',tags:['우아함','파티','세련됨'],asset:'teal-v1.png'},
  {id:'gala',name:'버건디 갈라',english:'BURGUNDY GALA',category:'FORMAL',description:'흐르는 버건디 새틴. 오래 기억될 한 장면.',tags:['파티','포멀','우아함'],asset:'gala-v1.png'},
  {id:'winter',name:'카멜 윈터 코트',english:'CAMEL WINTER COAT',category:'WINTER',description:'울 코트와 아이보리 터틀넥. 포근한 겨울의 자신감.',tags:['겨울','포근함','클래식'],asset:'winter-v1.png'},
  {id:'tweed',name:'스카이 트위드',english:'SKY TWEED',category:'BOUTIQUE',description:'파스텔 블루 트위드 셋업. 단정함에 더한 작은 설렘.',tags:['로맨틱','단정함','부드러움'],asset:'tweed-v1.png'},
  {id:'linen',name:'샌드 린넨 리조트',english:'SAND LINEN RESORT',category:'RESORT',description:'화이트 린넨과 샌드 팬츠. 가볍고 느긋한 휴가처럼.',tags:['편안함','휴가','가벼움'],asset:'linen-v1.png'},
  {id:'overalls',name:'블루 데님 오버롤',english:'BLUE DENIM OVERALLS',category:'PLAYFUL',description:'데님 오버롤과 캔버스 슈즈. 평범한 날의 장난스러운 포인트.',tags:['캐주얼','활동적','일상'],asset:'overalls-v1.png'},
  {id:'bomber',name:'시티 유틸리티',english:'CITY UTILITY',category:'UTILITY',description:'슬레이트 봄버와 카고 팬츠. 가볍게 움직이는 도심의 룩.',tags:['활동적','시티','캐주얼'],asset:'bomber-v1.png'},
  {id:'preppy',name:'포레스트 프레피',english:'FOREST PREPPY',category:'PREPPY',description:'그린 케이블 카디건과 플리츠. 책 한 권 같은 편안한 분위기.',tags:['카페','포근함','클래식'],asset:'preppy-v1.png'}
];
export const LOOK_GROUPS=[{id:'all',name:'전체'},{id:'casual',name:'캐주얼',looks:['everyday','sport','stripe','linen','overalls','bomber']},{id:'city',name:'시티',looks:['office','trench','leather','shirt']},{id:'romantic',name:'소프트',looks:['date','tweed','preppy']},{id:'dress',name:'드레스',looks:['evening','teal','gala']},{id:'season',name:'시즌',looks:['winter']},{id:'heritage',name:'한복',looks:['hanbok']}];
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
  {id:'cafe',name:'성수동, 오후 세 시',copy:'오랜 친구와 새로 생긴 카페에 가는 날. 편안하지만 기억에 남는 룩을 골라주세요.',tags:['캐주얼','로맨틱','따뜻함'],looks:['date','everyday','stripe','tweed','preppy','trench'],accessories:['mini','brooch'],moods:['sunset']},
  {id:'office',name:'첫 프레젠테이션',copy:'스튜디오를 소개하는 첫 미팅! 단정한 실루엣과 믿음직한 포인트가 필요해요.',tags:['출근','단정함','자신감'],looks:['office','shirt','tweed','winter'],accessories:['tote','brooch'],moods:['daylight']},
  {id:'walk',name:'한강의 느긋한 아침',copy:'커피 한 잔을 들고 가볍게 걷는 주말. 움직이기 편한 스타일에 도전해보세요.',tags:['산책','활동적','가벼움'],looks:['sport','everyday','stripe','linen','overalls','bomber'],accessories:['none','mini'],moods:['daylight']},
  {id:'party',name:'루프톱의 초대장',copy:'친구의 작은 전시 오프닝. 저녁 빛 속에서 돋보일 우아한 룩을 준비하세요.',tags:['파티','우아함','저녁'],looks:['evening','office','teal','gala','leather'],accessories:['brooch','tote'],moods:['night']},
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
