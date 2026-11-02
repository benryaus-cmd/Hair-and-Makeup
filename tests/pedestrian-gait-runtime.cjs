const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript'),THREE=require('three');
const root=path.resolve(__dirname,'..'),cache={};
function load(name){name=name.replace(/\.tsx?$/,'');if(cache[name])return cache[name];const mod={exports:{}};cache[name]=mod.exports;new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(root,'src',name+'.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(id=>id.startsWith('@/')?load(id.slice(2)):id.startsWith('.')?load(path.posix.join(path.posix.dirname(name),id)):require(id),mod,mod.exports);return cache[name]=mod.exports;}
assert(fs.existsSync(path.join(root,'src/game/character/pedestrian-gait.ts')),'residents need a gait driven by actual pedestrian travel');
const {createPedestrianGait}=load('game/character/pedestrian-gait');
const q=r=>new THREE.Quaternion().setFromEuler(new THREE.Euler(...r));
function ankle(f,side){const p=side<0?'left':'right',hip=q(f.rotations[p+'UpperLeg']),lower=hip.clone().multiply(q(f.rotations[p+'LowerLeg']));return new THREE.Vector3(side*.108,-.025,0).add(new THREE.Vector3(0,-.425,0).applyQuaternion(hip)).add(new THREE.Vector3(0,-.397,0).applyQuaternion(lower)).applyQuaternion(q(f.rotations.pelvis)).add(new THREE.Vector3(0,f.pelvisY,0));}
function footPitch(f,side){const p=side<0?'left':'right';return new THREE.Euler().setFromQuaternion(q(f.rotations.pelvis).multiply(q(f.rotations[p+'UpperLeg'])).multiply(q(f.rotations[p+'LowerLeg'])).multiply(q(f.rotations[p+'Foot']))).x;}
for(const speed of [1,1.2,1.4]){
 const gait=createPedestrianGait(),ranges=[[],[]],lifts=[0,0],support=[0,0],rolls=[],knees=[];let previous,travel=0,plantedSamples=0,maxSlip=0;
 for(let i=0;i<240;i++){
  const f=gait.update(1/60,speed/60,true);travel+=speed/60;
  const feet=[ankle(f,-1),ankle(f,1)];
  assert(Math.min(...feet.map(a=>a.y))<.121,'every frame has a supporting foot');
  for(const [j,side] of [-1,1].entries()){
   const a=feet[j];ranges[j].push(a.z);assert(a.y>=.089,'no ankle below shoe support height');
   if(a.y>.13)lifts[j]++;if(a.y<.096)support[j]++;
   if(previous&&a.y<.094&&previous.feet[j].y<.094){const slip=Math.abs(a.z+travel-previous.feet[j].z-previous.travel);maxSlip=Math.max(maxSlip,slip);plantedSamples++;}
   rolls.push(footPitch(f,side));knees.push(Math.abs(f.rotations[(side<0?'left':'right')+'LowerLeg'][0]));
  }
  previous={feet,travel};
 }
 for(let j=0;j<2;j++){assert(Math.max(...ranges[j])-Math.min(...ranges[j])>.48,'slow pedestrians take visible alternating steps');assert(lifts[j]>15&&support[j]>60,'both feet alternate clear swing and support');}
 assert(plantedSamples>50&&maxSlip<.003,'support feet remain planted while the resident travels');
 assert(Math.max(...rolls)>.11&&Math.min(...rolls)<-.08,'heel release and toe lift articulate the shoe');
 assert(Math.max(...knees)>.6,'swing knee visibly folds');
 const stop=gait.update(1/60,0,false),hold=JSON.stringify(stop.rotations),phase=stop.phase;
 for(let i=0;i<60;i++){const f=gait.update(1/60,0,false);assert.equal(f.phase,phase,'stops never continue stepping');assert.equal(JSON.stringify(f.rotations),hold,'stopped legs and arms stay neutral');for(const side of [-1,1])assert(Math.abs(ankle(f,side).y-.09)<.002,'stopped feet are supported');}
}
const fine=createPedestrianGait(),coarse=createPedestrianGait();let a,b;
for(let i=0;i<90;i++)a=fine.update(1/60,1.2/60,true);
for(let i=0;i<30;i++)b=coarse.update(1/20,1.2/20,true);
assert(Math.abs(a.phase-b.phase)<1e-10,'equal distance has identical gait phase at different frame rates');
for(const side of [-1,1])assert(ankle(a,side).distanceTo(ankle(b,side))<1e-9,'equal travel gives the same actual ankle pose');
const avatar=load('game/avatar').createAvatar();avatar.setShoes('sneakers');avatar.setPose('idle');
avatar.update(1/60,{moving:true,speed:1.2,grounded:true,dancing:false,sitting:false,locomotionFrame:a});avatar.group.updateMatrixWorld(true);
for(const side of [-1,1])assert(avatar.rig.bones[side<0?'leftFoot':'rightFoot'].getWorldPosition(new THREE.Vector3()).distanceTo(ankle(a,side))<1e-8,'avatar applies pedestrian frame to actual rendered foot bones');
// Check the shoe surface, not only the ankle pivot, while it rolls over the sole.
const shoeGait=createPedestrianGait();
for(let i=0;i<24;i++){
 const f=shoeGait.update(1/24,.96/24,true);
 avatar.update(1/24,{moving:true,speed:.96,grounded:true,dancing:false,sitting:false,locomotionFrame:f});avatar.group.updateMatrixWorld(true);
 const floors=[];
 for(const side of ['left','right']){const shoe=avatar.rig.bones[side+'Foot'].getObjectByName('sneakers');let floor=Infinity;shoe.traverse(n=>{if(n.isMesh)for(let v=0;v<n.geometry.attributes.position.count;v++)floor=Math.min(floor,n.localToWorld(new THREE.Vector3().fromBufferAttribute(n.geometry.attributes.position,v)).y);});floors.push(floor);}
 assert(Math.min(...floors)<.018,'one actual sneaker sole stays near the floor');assert(Math.min(...floors)>-.003,'heel/toe rolling does not drive the shoe through the floor');
}
const reference=load('game/avatar').createAvatar();reference.setShoes('sneakers');reference.setPose('wave');avatar.setPose('wave');
// First settle both controllers so prior pedestrian input cannot hide a stale step.
for(let i=0;i<120;i++)for(const doll of [avatar,reference])doll.update(1/60,{moving:false,speed:0,grounded:true,dancing:false,sitting:false});
for(const state of [{moving:false,speed:0,grounded:true,dancing:false,sitting:false},{moving:true,speed:1.2,grounded:true,dancing:false,sitting:true},{moving:true,speed:1.2,grounded:true,dancing:true,sitting:false}]){
 avatar.update(1/60,{...state,locomotionFrame:a});reference.update(1/60,state);
 for(const key of Object.keys(avatar.rig.bones))assert(avatar.rig.bones[key].quaternion.angleTo(reference.rig.bones[key].quaternion)<1e-7,'standing/photo, sitting and dance ignore a stale pedestrian override');
}
global.document={createElement:()=>({getContext:()=>({beginPath(){},roundRect(){},fill(){},fillText(){}})})};
const residents=load('game/residents').createResidents(1),observer=new THREE.Vector3(37.6,.04,15),ken=residents.root.children.find(p=>p.name==='Ken');
let bending=false;
for(let i=0;i<90;i++){residents.update(1/60,observer,false,1);ken.traverse(n=>{if(n.name==='resident knee'&&Math.abs(n.rotation.x)>.5)bending=true;});}
assert(bending,'Ken and inexpensive residents articulate knees rather than swinging rigid legs');
const stopped=ken.position.clone();for(let i=0;i<60;i++)residents.update(1/60,stopped,false,1);
const knees=[];ken.traverse(n=>{if(n.name==='resident knee')knees.push(n.rotation.x);});assert(knees.every(x=>Math.abs(x)<1e-8),'conversation stops knee cycling');
residents.setPhotoGroup(['ken'],'wave');for(let i=0;i<60;i++)residents.update(1/60,observer,true,1);
ken.traverse(n=>{if(n.name==='resident knee')assert.equal(n.rotation.x,0,'photo pose excludes travel gait');});
residents.dispose();
const closeResidents=load('game/residents').createResidents(1),closeObserver=new THREE.Vector3(17.2,.18,-19),brooklyn=closeResidents.root.children.find(p=>p.name==='Brooklyn'),detailFeet=[[],[]];
for(let i=0;i<100;i++){
 closeResidents.update(1/60,closeObserver,false,1);closeResidents.root.updateMatrixWorld(true);
 const doll=brooklyn.getObjectByName('Dreamland fashion doll');assert(doll&&doll.visible,'nearest walking resident uses the shared detail rig');
 for(const [j,side] of ['leftFoot','rightFoot'].entries()){let foot;doll.traverse(n=>{if(n.userData.humanoidBone===side)foot=n;});detailFeet[j].push(brooklyn.worldToLocal(foot.getWorldPosition(new THREE.Vector3())).z);}
}
for(const samples of detailFeet)assert(Math.max(...samples)-Math.min(...samples)>.48,'resident detail integration retains the readable full step');
closeResidents.dispose();
console.log('PASS: pedestrian-distance steps at 1–1.4m/s, alternate foot support/swing, planted feet, knee/heel/toe articulation, frame-rate equivalence, actual avatar bones, Ken stops and photos');
