import test from 'node:test';
import assert from 'node:assert/strict';
import {CATALOG,RARITIES,rarityForRoll,initialState,sellPart,ticketOf,canEquip,validTicket,gachaResult,lotteryNumbers,sha256,verifyGacha,verifyLottery,combination,matchProbability,COST} from '../dist/game.js';
test('exactly 56 archetypes, eight distinct slots in each of seven ordered rarities',()=>{
 assert.equal(CATALOG.length,56);assert.equal(new Set(CATALOG.map(p=>p.typeId)).size,56);
 assert.deepEqual(RARITIES.map(r=>r.label),['커먼','매직','레어','유니크','레전더리','에픽','신화']);
 for(let tier=0;tier<7;tier++)assert.equal(new Set(CATALOG.filter(p=>p.rarity===tier).map(p=>p.slot)).size,8);
});
test('each of 10,000 probability buckets belongs to the declared rarity exactly',()=>{
 const counts=Array(7).fill(0);for(let i=0;i<10000;i++)counts[rarityForRoll(i)]++;
 assert.deepEqual(counts,RARITIES.map(r=>r.weight));assert.equal(RARITIES.reduce((s,r)=>s+r.weight,0),10000);assert.ok(Math.abs(RARITIES.reduce((s,r)=>s+r.chance,0)-100)<1e-10);
 assert.throws(()=>rarityForRoll(-1));assert.throws(()=>rarityForRoll(10000));
});
test('sale removes ownership, clears equipment and credits exactly once; proceeds fund another draw',async()=>{
 const state=await initialState();const part=state.inventory[0],start=state.balance;
 const sale=sellPart(state,part.id);assert.equal(state.balance,start+RARITIES[part.rarity].sale);assert.equal(sale.part.id,part.id);assert.equal(state.equipped[0],null);assert.equal(state.inventory.length,7);
 assert.equal(sellPart(state,part.id),null);assert.equal(state.balance,start+RARITIES[part.rarity].sale);assert.ok(sale.value>=COST);
});
test('ticket requires eight different numbers and slot replacement rejects duplicate numbers',async()=>{
 const state=await initialState();assert.equal(validTicket(ticketOf(state)),false);state.equipped=state.inventory.map(p=>p.id);assert.equal(validTicket(ticketOf(state)),true);
 assert.equal(canEquip(state,{slot:2,number:state.inventory[0].number}),false);assert.equal(canEquip(state,{slot:0,number:state.inventory[0].number}),true);
 assert.equal(validTicket([1,2,3,4,5,6,7,7]),false);assert.equal(validTicket([0,2,3,4,5,6,7,8]),false);
});
test('SHA-256 proofs reproduce gacha and reject altered number or seed',async()=>{
 const seed='a'.repeat(64),result=await gachaResult(seed),proof={seed,commit:await sha256(seed),...result};
 assert.equal(await verifyGacha(proof),true);assert.equal(await verifyGacha({...proof,number:result.number%50+1}),false);assert.equal(await verifyGacha({...proof,seed:'b'.repeat(64)}),false);
});
test('lottery proof reproduces eight unique in-range sorted numbers and rejects tampering',async()=>{
 const seed='0'.repeat(64),numbers=await lotteryNumbers(seed);assert.equal(numbers.length,8);assert.equal(new Set(numbers).size,8);assert.ok(numbers.every(n=>n>=1&&n<=50));
 assert.deepEqual(numbers,[...numbers].sort((a,b)=>a-b));assert.equal(await verifyLottery({seed,commit:await sha256(seed),numbers}),true);
 assert.equal(await verifyLottery({seed,commit:await sha256(seed),numbers:[...numbers].reverse()}),false);
});
test('published jackpot probability and full hypergeometric distribution agree',()=>{
 assert.equal(combination(50,8),536878650);assert.equal(matchProbability(8),1/536878650);assert.ok(Math.abs(Array.from({length:9},(_,k)=>matchProbability(k)).reduce((s,n)=>s+n,0)-1)<1e-12);
});
