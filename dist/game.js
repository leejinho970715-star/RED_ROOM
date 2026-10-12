export const SLOTS = ['헤드','바디','왼팔','오른팔','왼다리','오른다리','백팩','기어'];
export const FILTERS = ['head','body','arms','arms','legs','legs','gear','gear'];
export const RARITIES = [
 {name:'COMMON',label:'커먼',chance:60,weight:6000,color:'#98a5b5',sale:100,prefix:'러스트'},
 {name:'MAGIC',label:'매직',chance:25,weight:2500,color:'#a4bc94',sale:300,prefix:'스캐빈저'},
 {name:'RARE',label:'레어',chance:10,weight:1000,color:'#83b9d9',sale:700,prefix:'네온'},
 {name:'UNIQUE',label:'유니크',chance:4,weight:400,color:'#98a9de',sale:1500,prefix:'크로마'},
 {name:'LEGENDARY',label:'레전더리',chance:.9,weight:90,color:'#d9aa73',sale:5000,prefix:'타이탄'},
 {name:'EPIC',label:'에픽',chance:.09,weight:9,color:'#c799dd',sale:25000,prefix:'오버시어'},
 {name:'MYTHIC',label:'신화',chance:.01,weight:1,color:'#ff8e83',sale:100000,prefix:'제네시스'}
];
export const BASE_NAMES = ['헬멧','코어','건틀릿 L','건틀릿 R','레그 L','레그 R','리액터 팩','시그널 기어'];
export const CATALOG = RARITIES.flatMap((r,rarity)=>SLOTS.map((s,slot)=>({typeId:`${rarity}-${slot}`,slot,rarity})));
export const COST = 1000; // integer micro-ETH; demo only
export const REWARDS = {0:0,1:0,2:0,3:3000,4:10000,5:100000,6:500000,7:1500000,8:12840000};
export const randomSeed = () => Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
export async function sha256(value){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');}
export async function uniform(seed,label,range){
 const limit=Math.floor(0x100000000/range)*range;
 for(let i=0;;i++){
  const digest=await sha256(`${seed}:${label}:${i}`);
  const n=parseInt(digest.slice(0,8),16);
  if(n<limit)return n%range;
 }
}
export async function gachaResult(seed){
 const slot=await uniform(seed,'slot',8),number=1+await uniform(seed,'number',50),roll=await uniform(seed,'rarity',10000);
 const rarity=rarityForRoll(roll);
 return {slot,number,rarity};
}
export async function lotteryNumbers(seed){
 const pool=Array.from({length:50},(_,i)=>i+1),numbers=[];
 for(let i=0;i<8;i++){const index=await uniform(seed,`lottery-${i}`,pool.length);numbers.push(pool.splice(index,1)[0]);}
 return numbers.sort((a,b)=>a-b);
}
export function rarityForRoll(roll){if(!Number.isInteger(roll)||roll<0||roll>=10000)throw new RangeError('Rarity roll out of range');let total=0;for(let i=0;i<RARITIES.length;i++){total+=RARITIES[i].weight;if(roll<total)return i;}throw new RangeError('Rarity roll out of range');}
export function nameFor(part){return `${RARITIES[part.rarity].prefix} ${BASE_NAMES[part.slot]}`;}
export function sellPart(state,id){const index=state.inventory.findIndex(p=>p.id===id);if(index<0)return null;const part=state.inventory[index];const value=RARITIES[part.rarity].sale;state.inventory.splice(index,1);state.equipped=state.equipped.map(p=>p===id?null:p);state.balance+=value;return {part,value};}
export function canEquip(state,part){return !state.equipped.some((id,slot)=>slot!==part.slot&&state.inventory.find(p=>p.id===id)?.number===part.number);}
export function ticketOf(state){return state.equipped.map(id=>state.inventory.find(p=>p.id===id)?.number??null);}
export function validTicket(ticket){return ticket.length===8&&ticket.every(n=>Number.isInteger(n)&&n>=1&&n<=50)&&new Set(ticket).size===8;}
export function matches(ticket,numbers){return ticket.filter(n=>numbers.includes(n)).length;}
export function combination(n,k){let c=1;for(let i=1;i<=k;i++)c=c*(n-i+1)/i;return Math.round(c);}
export function matchProbability(k){return combination(8,k)*combination(42,8-k)/combination(50,8);}
export async function verifyGacha(proof){
 if(await sha256(proof.seed)!==proof.commit)return false;
 const expected=await gachaResult(proof.seed);
 return expected.number===proof.number&&expected.slot===proof.slot&&expected.rarity===proof.rarity;
}
export async function verifyLottery(proof){return await sha256(proof.seed)===proof.commit&&JSON.stringify(await lotteryNumbers(proof.seed))===JSON.stringify(proof.numbers);}
export async function newRound(id=42){const seed=randomSeed();return {id,seed,commit:await sha256(seed),expires:Date.now()+4*60*60*1000,ticket:null,result:null};}
export async function initialState(){
 const inventory=Array.from({length:8},(_,slot)=>({id:`starter-${slot}`,slot,number:[7,23,12,38,45,19,31,4][slot],rarity:[4,2,0,1,0,3,2,5][slot],starter:true}));
 return {version:1,balance:24000,inventory,equipped:inventory.map((p,i)=>i<5?p.id:null),proofs:[],round:await newRound(),history:[]};
}
