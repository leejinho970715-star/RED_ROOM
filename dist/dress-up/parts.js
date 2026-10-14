// Every layer has its own transparent artwork and fits the same adult base pose.
export const SLOTS = [
  {id:'top',name:'상의',points:25}, {id:'bottom',name:'하의',points:25},
  {id:'outer',name:'아우터',points:10}, {id:'shoes',name:'신발',points:10}
];
export const PARTS = [
  {id:'top-tee',slot:'top',name:'아이보리 티셔츠',tags:['캐주얼','편안함'],missions:['cafe','walk'],asset:null,crop:[335,240,700,552]},
  {id:'top-knit',slot:'top',name:'라벤더 니트',tags:['부드러움','카페'],missions:['cafe','walk'],asset:'top-knit-v1.png',box:[305,250,720,735]},
  {id:'top-shirt',slot:'top',name:'블루 셔츠',tags:['단정함','출근'],missions:['office','party'],asset:'top-shirt-v1.png',box:[305,248,720,735]},
  {id:'bottom-denim',slot:'bottom',name:'스트레이트 데님',tags:['캐주얼','일상'],missions:['cafe','walk'],asset:'bottom-denim-v1.png',box:[365,534,672,1410]},
  {id:'bottom-tailored',slot:'bottom',name:'차콜 테일러드 팬츠',tags:['단정함','미니멀'],missions:['office','party'],asset:'bottom-tailored-v1.png',box:[365,534,672,1410]},
  {id:'bottom-pleated',slot:'bottom',name:'아이보리 플리츠',tags:['로맨틱','우아함'],missions:['cafe','office','party'],asset:'bottom-pleated-v1.png',box:[340,534,697,1110]},
  {id:'outer-none',slot:'outer',name:'아우터 없이',tags:['가벼움','미니멀'],missions:['cafe','walk','party'],asset:null},
  {id:'outer-blazer',slot:'outer',name:'아이보리 블레이저',tags:['단정함','세련됨'],missions:['office','party'],asset:'outer-blazer-v1.png',box:[305,250,725,735]},
  {id:'outer-cardigan',slot:'outer',name:'포레스트 카디건',tags:['포근함','카페'],missions:['cafe','walk'],asset:'outer-cardigan-v2.png',box:[305,250,725,735]},
  {id:'shoes-flats',slot:'shoes',name:'크림 플랫 슈즈',tags:['부드러움','단정함'],missions:['cafe','office','party'],asset:null,crop:[400,1368,620,1500]},
  {id:'shoes-sneakers',slot:'shoes',name:'아이보리 스니커즈',tags:['편안함','활동적'],missions:['cafe','walk'],asset:'shoes-sneakers-v1.png',box:[398,1370,624,1500]},
  {id:'shoes-loafers',slot:'shoes',name:'브라운 로퍼',tags:['출근','클래식'],missions:['cafe','office','party'],asset:'shoes-loafers-v1.png',box:[403,1375,618,1491]}
];
export const DEFAULT_PARTS = {top:'top-tee',bottom:'bottom-denim',outer:'outer-none',shoes:'shoes-flats'};
export function validParts(parts){return !!parts&&SLOTS.every(s=>PARTS.some(p=>p.slot===s.id&&p.id===parts[s.id]));}
export function equippedParts(parts){return SLOTS.map(s=>PARTS.find(p=>p.slot===s.id&&p.id===parts[s.id]));}
export function partScore(parts,missionId){
  if(!validParts(parts))throw new Error('Invalid clothing parts');
  return SLOTS.reduce((total,s)=>{const p=PARTS.find(p=>p.id===parts[s.id]);return total+(p.missions.includes(missionId)?s.points:Math.round(s.points*.4));},0);
}
export function customLook(parts,accessory='none',mood='daylight'){return {outfit:'everyday',mode:'parts',parts:{...parts},accessory,mood};}
export function cloneLook(look){return {...look,...(look.parts?{parts:{...look.parts}}:{})};}
