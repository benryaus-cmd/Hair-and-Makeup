const fs=require('node:fs'),assert=require('node:assert/strict'),ts=require('typescript'),THREE=require('three');
function compile(file){const mod={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(`src/game/studio/${file}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(require,mod,mod.exports);return mod.exports;}
const {studioMaterial}=compile('materials');
const mat=new THREE.MeshStandardMaterial();let previous=0;mat.onBeforeCompile=s=>{previous++;s.fragmentShader+='\n// wardrobe remains';};mat.customProgramCacheKey=()=>'wardrobe';
studioMaterial(mat,'hair');studioMaterial(mat,'hair');
const shader={uniforms:{},vertexShader:THREE.ShaderLib.standard.vertexShader,fragmentShader:THREE.ShaderLib.standard.fragmentShader};mat.onBeforeCompile(shader,{});
assert.equal(previous,1,'existing wardrobe shader runs exactly once');assert(shader.fragmentShader.includes('studioSilk'),'hair has directional silk lighting');assert(shader.fragmentShader.includes('// wardrobe remains'));assert.equal((shader.fragmentShader.match(/uniform float studioStrength/g)||[]).length,1);assert(mat.customProgramCacheKey().includes('wardrobe'));
const {arrivalShot,ARRIVAL_SECONDS}=compile('arrival');
for(const t of [-1,0,1,3.5,6.9,7,20]){const s=arrivalShot(t,new THREE.Vector3(7,.55,-13),new THREE.Vector3(7,3, -6));assert(s.position.toArray().every(Number.isFinite));assert(s.target.toArray().every(Number.isFinite));assert(s.progress>=0&&s.progress<=1);}
assert.equal(ARRIVAL_SECONDS,7);const end=arrivalShot(7,new THREE.Vector3(),new THREE.Vector3(0,3,7));assert(end.position.distanceTo(new THREE.Vector3(0,3,7))<1e-6,'arrival lands at actual gameplay camera without a hard cut');
console.log('PASS studio shader chaining/idempotence and bounded arrival camera');
