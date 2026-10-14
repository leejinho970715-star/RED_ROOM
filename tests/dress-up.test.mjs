import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {LOOKS,ACCESSORIES,MOODS,MISSIONS,DEFAULT_LOOK,validLook,evaluateLook,rewardForResult} from '../dist/dress-up/rules.js';
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
test('all six original looks, studio artwork, story guide and playable stereo BGM ship as local assets',()=>{
  for(const look of LOOKS){const bytes=fs.readFileSync(new URL('../dist/dress-up/assets/'+look.asset,import.meta.url));assert.equal(bytes.subarray(1,4).toString(),'PNG');}
  assert.ok(fs.existsSync(new URL('../dist/dress-up/guide.html',import.meta.url)));
  const bgm=fs.readFileSync(new URL('../dist/dress-up/assets/seoul-afterglow-v1.wav',import.meta.url));assert.equal(bgm.subarray(0,4).toString(),'RIFF');assert.equal(bgm.readUInt16LE(22),2);assert.equal(bgm.readUInt32LE(24),22050);assert.equal(bgm.readUInt32LE(40),22050*48*4);
});
