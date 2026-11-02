const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict');
const mod={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync('src/game/card-collection.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(()=>({default:{}}),mod,mod.exports);
const {collectorReward,collectionMilestone}=mod.exports;
assert.equal(collectorReward(0),15);assert.equal(collectorReward(1),25);assert.equal(collectorReward(3),40);assert.equal(collectorReward(7),75);assert.equal(collectorReward(99),0);
assert.equal(collectionMilestone(3),0);assert.equal(collectionMilestone(4),60);assert.equal(collectionMilestone(8),150);assert.equal(collectionMilestone(9),0);
console.log('PASS rarity rewards and exact collection milestones');
