import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {COSTUMES,PROPS,SCENES,MISSIONS,DEFAULT_LOOK,GRADES,validLook,evaluate,reward,remainingSeconds,normalizeState} from '../dist/dress-up/chaos/rules.js';
test('72 comedy combinations have bounded deterministic scores and every absurd mission has a perfect solution',()=>{
  assert.equal(COSTUMES.length*PROPS.length*SCENES.length,72);const grades=new Set();
  for(const c of COSTUMES)for(const p of PROPS)for(const s of SCENES)for(const m of MISSIONS){const look={costume:c.id,prop:p.id,scene:s.id};assert.ok(validLook(look));const result=evaluate(look,m.id);assert.ok(result.score>=0&&result.score<=100);assert.deepEqual(evaluate(look,m.id),result);grades.add(result.grade);}
  assert.deepEqual([...grades].sort(),['A','B','C','S']);
  for(const m of MISSIONS){assert.equal(evaluate({costume:m.costumes[0],prop:m.props[0],scene:m.scenes[0]},m.id).score,100);assert.ok(evaluate({costume:COSTUMES.find(c=>!m.costumes.includes(c.id)).id,prop:m.props[0],scene:m.scenes[0]},m.id).hints.length);}
  assert.throws(()=>evaluate({...DEFAULT_LOOK,costume:'missing'},'meeting'));assert.throws(()=>evaluate(DEFAULT_LOOK,'missing'));
});
test('comedy mission rewards cannot be farmed, and six completed missions give exactly eighteen stars',()=>{
  const progress={};for(const m of MISSIONS){const first=reward(progress,m.id,35);assert.equal(first.earned,1);progress[m.id]=first.total;assert.equal(reward(progress,m.id,35).earned,0);const better=reward(progress,m.id,100);assert.equal(better.earned,2);progress[m.id]=better.total;assert.equal(reward(progress,m.id,100).earned,0);}
  assert.equal(Object.values(progress).reduce((a,b)=>a+b,0),18);
});
test('timer follows wall-clock time across hidden tabs and ends once elapsed',()=>{
  assert.equal(remainingSeconds(null,500),null);assert.equal(remainingSeconds(31000,1000),30);assert.equal(remainingSeconds(31000,1001),30);assert.equal(remainingSeconds(31000,30999),1);assert.equal(remainingSeconds(31000,31000),0);assert.equal(remainingSeconds(31000,100000),0);
});
test('comedy save restoration rejects invalid values, isolates its own schema and clones album looks',()=>{
  const raw={look:{costume:'missing'},mission:-1,rewards:{meeting:999,knight:3},album:[null,{look:{...DEFAULT_LOOK},mission:'meeting',score:100,grade:'S'},{look:DEFAULT_LOOK,mission:'meeting',score:100,grade:'__proto__'}]};
  const restored=normalizeState(raw);assert.deepEqual(restored.look,DEFAULT_LOOK);assert.equal(restored.mission,0);assert.equal(restored.rewards.meeting,0);assert.equal(restored.rewards.knight,3);assert.equal(restored.album.length,1);raw.album[1].look.costume='banana';assert.equal(restored.album[0].look.costume,'duck');
  assert.equal(validLook({outfit:'everyday',accessory:'none',mood:'daylight'}),false);assert.deepEqual(normalizeState(null).look,DEFAULT_LOOK);
});
test('the separate mode ships all original artwork, reaction faces, navigation and audible original stereo music',()=>{
  for(const c of COSTUMES){const bytes=fs.readFileSync(new URL('../dist/dress-up/chaos/assets/'+c.asset,import.meta.url));assert.equal(bytes.subarray(1,4).toString(),'PNG');assert.equal(bytes.readUInt32BE(16),1024);assert.equal(bytes.readUInt32BE(20),1536);}
  assert.ok(fs.existsSync(new URL('../dist/dress-up/chaos/assets/laundry-v1.png',import.meta.url)));
  for(const r of Object.values(GRADES))assert.ok(fs.existsSync(new URL('../dist/dress-up/assets/'+r.asset,import.meta.url)));
  assert.ok(fs.readFileSync(new URL('../dist/dress-up/index.html',import.meta.url),'utf8').includes('href="./chaos/"'));
  const wav=fs.readFileSync(new URL('../dist/dress-up/chaos/assets/chaos-laundry-v1.wav',import.meta.url));assert.equal(wav.subarray(0,4).toString(),'RIFF');assert.equal(wav.readUInt16LE(22),2);assert.equal(wav.readUInt32LE(24),22050);assert.equal(wav.readUInt32LE(40),22050*32*4);
  let peak=0;for(let i=44;i<wav.length;i+=2)peak=Math.max(peak,Math.abs(wav.readInt16LE(i)));assert.ok(peak>15000&&peak<30000);assert.equal(wav.readInt16LE(44),0);assert.equal(wav.readInt16LE(wav.length-2),0);
});
