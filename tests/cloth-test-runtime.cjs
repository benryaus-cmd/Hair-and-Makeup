const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createRequire}=require('node:module');
const repo=process.env.DREAMLAND_REPO||path.resolve(__dirname,'..');
const localRequire=createRequire(repo+'/package.json');
const THREE=localRequire('three'),ts=localRequire('typescript');
const cache={};
function load(name) {
 name=name.replace(/\.tsx?$/,'');
 if(cache[name])return cache[name];
 const mod={exports:{}};cache[name]=mod.exports;
 const js=ts.transpileModule(fs.readFileSync(repo+'/src/'+name+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 new Function('require','module','exports',js)(id=>id.startsWith('@/')?load(id.slice(2)):(id.startsWith('./')||id.startsWith('../'))?load(path.posix.join(path.posix.dirname(name),id)):localRequire(id),mod,mod.exports);
 return cache[name]=mod.exports;
}
const {createClothTestRig}=load('game/character/cloth-test-rig');
const still={moving:false,speed:0,phase:0,dancing:false,sitting:false};
function vertices(mesh) {return Float32Array.from(mesh.geometry.getAttribute('position').array);}
function changed(before,after){let max=0;for(let i=0;i<before.length;i++)max=Math.max(max,Math.abs(before[i]-after[i]));return max;}
function validate(mesh,label){
 const a=mesh.geometry.getAttribute('position').array;
 const n=mesh.geometry.getAttribute('normal').array;
 assert(a.length>800,label+' sufficient mesh resolution');
 assert(a.every(Number.isFinite),label+' positions finite');
 assert(n.every(Number.isFinite),label+' normals finite');
 assert(mesh.geometry.index.count>1200,label+' connected triangles');
}
const root=new THREE.Group(),hips=new THREE.Bone();hips.name='pelvis';root.add(hips);
const legs=[-1,1].map(side=>{
 const hip=new THREE.Bone();hip.position.set(side*.108,-.025,0);hips.add(hip);
 const knee=new THREE.Bone();knee.position.y=-.425;hip.add(knee);
 const ankle=new THREE.Bone();ankle.position.y=-.397;knee.add(ankle);
 return {hip,knee,ankle};
});
const gownHolder=new THREE.Group();hips.add(gownHolder);
const gown=createClothTestRig(gownHolder,new THREE.MeshStandardMaterial(),'gown',legs);
const reference=vertices(gown.mesh),geo=gown.mesh.geometry;
assert.equal(geo.attributes.position.usage,THREE.DynamicDrawUsage);
for(const leg of legs)leg.hip.rotation.x=-.5;
for(let i=0;i<150;i++)gown.update(1/60,{...still,moving:true,speed:4.5,phase:i*.18});
const moved=vertices(gown.mesh);
validate(gown.mesh,'gown');
assert(changed(reference,moved)>.003,'gown vertices must respond to walking, not just rigidly rotate');
const last=geo.attributes.position.count;
const hem=[];
for(let i=last-32;i<last;i++)hem.push(Math.hypot(moved[i*3],moved[i*3+2]/.82));
assert(hem.every(r=>r>.27&&r<.55),'gown maintains flared ballgown hem while moving');
for(const dt of [NaN,Infinity,-1])gown.update(dt,{...still,moving:true,speed:Infinity,phase:NaN});
validate(gown.mesh,'gown extreme inputs');
gown.update(0,still,true);
assert.equal(changed(reference,vertices(gown.mesh)),0,'gown snaps back when newly equipped');
const topHolder=new THREE.Group();root.add(topHolder);
const top=createClothTestRig(topHolder,new THREE.MeshStandardMaterial(),'top');
const shirtRest=vertices(top.mesh);
for(let i=0;i<140;i++)top.update(1/60,{...still,moving:true,speed:4.5,phase:i*.2});
validate(top.mesh,'blouse');
assert(changed(shirtRest,vertices(top.mesh))>.001,'blouse hem must follow the spring solver');
top.update(0,still,true);
assert.equal(changed(shirtRest,vertices(top.mesh)),0,'blouse resets on wardrobe swap');
const types=fs.readFileSync(repo+'/src/game/lifestyle-types.ts','utf8');
const fashion=fs.readFileSync(repo+'/src/game/fashion.ts','utf8');
const avatar=fs.readFileSync(repo+'/src/game/avatar.ts','utf8');
assert(types.includes("'cloth-top'")&&types.includes("'cloth-gown'"));
assert(fashion.includes("Airflow blouse · cloth test")&&fashion.includes("Flowing gown · cloth test"));
assert(avatar.includes("clothGownRig?.update")&&avatar.includes("clothTopRig?.update"));
console.log('PASS: free cloth test gown + blouse, shape retention, spring movement, finite normals, reset, wardrobe integration');
