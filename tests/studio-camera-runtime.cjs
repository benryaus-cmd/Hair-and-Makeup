const fs=require('node:fs'),assert=require('node:assert/strict'),ts=require('typescript'),THREE=require('three');
const mod={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync('src/game/camera.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(require,mod,mod.exports);
const {createCameraRig}=mod.exports;
function settle(fps){const camera=new THREE.PerspectiveCamera(58,.6,.1,900),rig=createCameraRig(camera),target=new THREE.Vector3();rig.update(1/fps,target,false,false);target.set(3,.6,-2);for(let i=0;i<fps/2;i++)rig.update(1/fps,target,false,false);return camera.position;}
assert(settle(30).distanceTo(settle(120))<.015,'camera damping should give equivalent framing at 30 and 120 fps');
console.log('PASS camera damping independent of frame rate');

const camera=new THREE.PerspectiveCamera(58,.6,.1,900),rig=createCameraRig(camera),target=new THREE.Vector3();
rig.update(1/60,target,false,false);target.y=.6;rig.update(1/60,target,false,false);
const direction=camera.getWorldDirection(new THREE.Vector3());
const focus=camera.position.clone().addScaledVector(direction,(target.z-camera.position.z)/direction.z);
assert(focus.y>1&&focus.y<1.3,'a step/jump eases the camera aim instead of snapping to raw target');
target.set(50,0,0);rig.update(1/60,target,false,false);
assert(camera.position.x>40,'teleports reseed the follow target rather than sweeping across the world');
rig.setPresentation('photo');rig.update(1/60,target,false,false);rig.setPresentation('world');rig.update(1/60,target,false,false);
assert(camera.position.distanceTo(target)<10,'world framing reseeds after leaving a studio camera');
console.log('PASS independently smoothed aim, teleport and presentation reseeding');
