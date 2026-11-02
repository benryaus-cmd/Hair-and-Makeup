const fs=require('node:fs'),assert=require('node:assert/strict'),ts=require('typescript'),THREE=require('three');
const mod={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync('src/game/studio/ink.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(require,mod,mod.exports);
const {createInkOutlines}=mod.exports;
const root=new THREE.Group(),doll=new THREE.Group();doll.name='doll';root.add(doll);
const material=new THREE.MeshStandardMaterial(),body=new THREE.Mesh(new THREE.SphereGeometry(.3,12,8),material);body.scale.set(1,2,.7);doll.add(body);
const face=new THREE.Group();face.name='face features';doll.add(face);const eye=new THREE.Mesh(new THREE.SphereGeometry(.05),material);face.add(eye);
const cloth=new THREE.SkinnedMesh(new THREE.CylinderGeometry(.3,.5,.6,12),material);cloth.name='weighted skirt';const bone=new THREE.Bone();cloth.add(bone);const count=cloth.geometry.attributes.position.count;cloth.geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(new Uint16Array(count*4),4));const weights=new Float32Array(count*4);for(let i=0;i<count;i++)weights[i*4]=1;cloth.geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));cloth.bind(new THREE.Skeleton([bone]));doll.add(cloth);
const wall=new THREE.Mesh(new THREE.BoxGeometry(3,3,.3),material);wall.position.set(3,1,-4);root.add(wall);const water=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.ShaderMaterial());water.name='ocean';root.add(water);
const camera=new THREE.PerspectiveCamera(58,.6,.1,500);camera.position.set(0,2,7);const ink=createInkOutlines(root,camera);
ink.refresh();ink.update(false,360,640);const find=mesh=>mesh.children.find(c=>c.userData.studioInk);
assert(find(body),'body gets a black silhouette');assert(find(cloth) instanceof THREE.SkinnedMesh,'skinned wardrobe receives a skinned outline');assert.equal(find(cloth).skeleton,cloth.skeleton);assert(find(cloth).bindMatrix.equals(cloth.bindMatrix));assert.equal(find(body).geometry,body.geometry,'outline shares rather than copies geometry');assert(find(body).renderOrder>body.renderOrder,'ink must render after opaque scenery so the floor cannot paint over it');assert(!find(eye),'face detail stays unoutlined');assert(!find(water),'water is excluded');assert(find(wall),'architecture is outlined');
assert.equal(find(body).material.color.getHex(),0x17121d);const before=body.children.length;ink.refresh();assert.equal(body.children.length,before,'refresh is idempotent');ink.update(true,360,640);assert(find(body).visible,'low graphics keeps the requested character outlines');
wall.position.set(300,0,0);ink.update(false,360,640);assert.equal(find(wall).visible,false,'distant world outlines are culled');
const shader={uniforms:{},vertexShader:THREE.ShaderLib.basic.vertexShader,fragmentShader:THREE.ShaderLib.basic.fragmentShader};find(cloth).material.onBeforeCompile(shader,{});assert(shader.vertexShader.includes('transformedNormal'));assert(shader.vertexShader.includes('studioInkViewport'));assert(shader.vertexShader.includes('#if 1'),'normal skinning must run for basic outline materials');
ink.dispose();assert(!find(body));assert(!find(cloth));console.log('PASS black ink selection, skinning, geometry sharing, low graphics, culling and cleanup');

const builderMod={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync('src/game/builder.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(require,builderMod,builderMod.exports);
const boxes=[],base=builderMod.exports.createBuilder(boxes),moved=builderMod.exports.translatedBuilder(base,11,-1.6);
const booth=moved.solid(2,2,2,material,-46,1,16.4);assert(Math.abs(booth.position.x+35)<1e-8&&Math.abs(booth.position.z-14.8)<1e-8);assert.equal(boxes[0].x,booth.position.x);assert.equal(boxes[0].z,booth.position.z);
console.log('PASS moved photo venue keeps visuals and colliders aligned');

const direct=new THREE.Object3D();direct.position.set(-46,2,17);moved.group.add(direct);base.group.updateMatrixWorld(true);const directPosition=direct.getWorldPosition(new THREE.Vector3());assert.equal(directPosition.x,-35);assert.equal(directPosition.z,15.4);
console.log('PASS moved venue includes direct and instanced group children');
