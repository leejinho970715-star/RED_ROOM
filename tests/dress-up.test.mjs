import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {SLOTS,PARTS,DEFAULT_PARTS,validParts,customLook,cloneLook} from '../dist/dress-up/parts.js';
import {REACTIONS} from '../dist/dress-up/reactions.js';
import {LOOKS,LOOK_GROUPS,ACCESSORIES,MOODS,MISSIONS,DEFAULT_LOOK,validLook,evaluateLook,rewardForResult} from '../dist/dress-up/rules.js';
test('eighteen distinct outfits are covered exactly once by wardrobe categories',()=>{
  assert.equal(LOOKS.length,18);assert.equal(new Set(LOOKS.map(l=>l.id)).size,18);
  const grouped=LOOK_GROUPS.filter(g=>g.id!=='all').flatMap(g=>g.looks);
  assert.equal(grouped.length,18);assert.equal(new Set(grouped).size,18);
  assert.deepEqual([...grouped].sort(),LOOKS.map(l=>l.id).sort());
});
test('every style challenge is solvable at 100 points and mismatched styles receive lower scores',()=>{
  for(const mission of MISSIONS){
    const perfect={outfit:mission.looks[0],accessory:mission.accessories[0],mood:mission.moods[0]};
    assert.equal(evaluateLook(perfect,mission.id).score,100);
    const wrongOutfit=LOOKS.find(l=>!mission.looks.includes(l.id)).id;
    assert.equal(evaluateLook({...perfect,outfit:wrongOutfit},mission.id).success,false);
  }
  for(const outfit of LOOKS)for(const accessory of ACCESSORIES)for(const mood of MOODS)for(const mission of MISSIONS){const result=evaluateLook({outfit:outfit.id,accessory:accessory.id,mood:mood.id},mission.id);assert.ok(result.score>=0&&result.score<=100);}
});
test('challenge star rewards cannot be farmed by repeats; improving a result awards only the difference',()=>{
  assert.deepEqual(rewardForResult({},'cafe',50),{earned:1,total:1});
  assert.deepEqual(rewardForResult({cafe:1},'cafe',50),{earned:0,total:1});
  assert.deepEqual(rewardForResult({cafe:1},'cafe',100),{earned:2,total:3});
  assert.deepEqual(rewardForResult({cafe:3},'cafe',100),{earned:0,total:3});
  assert.deepEqual(rewardForResult({cafe:3},'cafe',40),{earned:0,total:3});
  assert.equal(validLook(DEFAULT_LOOK),true);assert.equal(validLook({...DEFAULT_LOOK,outfit:'missing'}),false);
  assert.throws(()=>evaluateLook(DEFAULT_LOOK,'missing'));
});
test('all eighteen original looks, studio artwork, story guide and playable stereo BGM ship as local assets',()=>{
  for(const look of LOOKS){const bytes=fs.readFileSync(new URL('../dist/dress-up/assets/'+look.asset,import.meta.url));assert.equal(bytes.subarray(1,4).toString(),'PNG');}
  assert.ok(fs.existsSync(new URL('../dist/dress-up/guide.html',import.meta.url)));
  const bgm=fs.readFileSync(new URL('../dist/dress-up/assets/seoul-afterglow-v1.wav',import.meta.url));assert.equal(bgm.subarray(0,4).toString(),'RIFF');assert.equal(bgm.readUInt16LE(22),2);assert.equal(bgm.readUInt32LE(24),22050);assert.equal(bgm.readUInt32LE(40),22050*48*4);
});

test('all 81 independent garment combinations validate and use actual selected parts for scoring',()=>{
  const groups=SLOTS.map(s=>PARTS.filter(p=>p.slot===s.id));
  assert.deepEqual(groups.map(g=>g.length),[3,3,3,3]);
  const scores=new Set();let count=0;
  for(const top of groups[0])for(const bottom of groups[1])for(const outer of groups[2])for(const shoes of groups[3]){
    const look=customLook({top:top.id,bottom:bottom.id,outer:outer.id,shoes:shoes.id},'mini','sunset');
    assert.ok(validLook(look));count++;
    for(const mission of MISSIONS){const result=evaluateLook(look,mission.id);assert.ok(result.score>=0&&result.score<=100);}
    scores.add(evaluateLook(look,'cafe').outfit);
  }
  assert.equal(count,81);assert.ok(scores.size>1);
  const perfect=customLook(DEFAULT_PARTS,'mini','sunset');
  assert.equal(evaluateLook(perfect,'cafe').score,100);
  const oneDifferent=customLook({...DEFAULT_PARTS,bottom:'bottom-tailored'},'mini','sunset');
  assert.equal(evaluateLook(oneDifferent,'cafe').outfit,55);
  assert.equal(evaluateLook({...oneDifferent,outfit:'date'},'cafe').outfit,55);
});

test('legacy looks still validate; malformed parts and slot mismatches are rejected',()=>{
  assert.ok(validLook(JSON.parse(JSON.stringify(DEFAULT_LOOK))));
  assert.ok(validParts(DEFAULT_PARTS));
  assert.equal(validParts({...DEFAULT_PARTS,top:'bottom-denim'}),false);
  assert.equal(validLook({...DEFAULT_LOOK,mode:'parts'}),false);
  assert.equal(validLook({...customLook(DEFAULT_PARTS),parts:{top:'top-tee'}}),false);
  assert.equal(validLook({...DEFAULT_LOOK,mode:'unknown'}),false);
  const original=customLook(DEFAULT_PARTS),albumLook=cloneLook(original);
  original.parts.bottom='bottom-pleated';
  assert.equal(albumLook.parts.bottom,'bottom-denim');
  assert.ok(validLook(JSON.parse(JSON.stringify(albumLook))));
});

test('garment layers ship with valid registration bounds and four modern style missions are solvable',()=>{
  for(const part of PARTS.filter(p=>p.asset)){
    const bytes=fs.readFileSync(new URL('../dist/dress-up/assets/'+part.asset,import.meta.url));
    assert.equal(bytes.subarray(1,4).toString(),'PNG');
    const [left,top,right,bottom]=part.box;
    assert.ok(left>=0&&top>=0&&right<=1024&&bottom<=1536&&right>left&&bottom>top);
  }
  assert.ok(fs.existsSync(new URL('../dist/dress-up/assets/parts-base-v1.png',import.meta.url)));
  for(const mission of MISSIONS.filter(m=>m.id!=='heritage')){
    const parts=Object.fromEntries(SLOTS.map(s=>[s.id,PARTS.find(p=>p.slot===s.id&&p.missions.includes(mission.id)).id]));
    assert.equal(evaluateLook(customLook(parts,mission.accessories[0],mission.moods[0]),mission.id).score,100);
  }
});

test('runway grades select four different shipped character expressions for actual score outcomes',()=>{
  const samples=[
    [{outfit:'everyday',accessory:'mini',mood:'sunset'},100,'S'],
    [{outfit:'everyday',accessory:'none',mood:'daylight'},75,'A'],
    [{outfit:'office',accessory:'mini',mood:'sunset'},60,'B'],
    [{outfit:'office',accessory:'none',mood:'daylight'},35,'C']
  ];
  assert.equal(new Set(Object.values(REACTIONS).map(r=>r.asset)).size,4);
  for(const [look,score,grade] of samples){
    const result=evaluateLook(look,'cafe');assert.equal(result.score,score);assert.equal(result.grade,grade);
    const bytes=fs.readFileSync(new URL('../dist/dress-up/assets/'+REACTIONS[result.grade].asset,import.meta.url));
    assert.equal(bytes.subarray(1,4).toString(),'PNG');assert.ok(REACTIONS[grade].name&&REACTIONS[grade].message);
  }
});
