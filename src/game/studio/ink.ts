import * as THREE from 'three';

type Entry={source:THREE.Mesh;stroke:THREE.Mesh;character:boolean;center:THREE.Vector3};
const INK=0x17121d;
function isCharacter(mesh:THREE.Object3D) {
  for(let p:THREE.Object3D|null=mesh;p;p=p.parent)if(p.name==='doll'||/fashion doll|residents/i.test(p.name))return true;
  return false;
}
function candidate(mesh:THREE.Mesh,character:boolean) {
  if(mesh.userData.studioInk||(mesh as THREE.InstancedMesh).isInstancedMesh)return false;
  const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
  if(materials.some(m=>!(m instanceof THREE.MeshStandardMaterial)||m.transparent||m.opacity<.95))return false;
  if(materials.every(m=>(m as THREE.MeshStandardMaterial).emissiveIntensity>1.25))return false;
  if(materials.some(m=>/fine highlights/i.test(m.name)))return false;
  for(let p:THREE.Object3D|null=mesh;p;p=p.parent)if(/face features|eye\.|mouth|brow\.|gaze\.|applique|earring|necklace|bracelet/i.test(p.name))return false;
  const box=new THREE.Box3().setFromBufferAttribute(mesh.geometry.getAttribute('position') as THREE.BufferAttribute);
  const size=box.getSize(new THREE.Vector3()).multiply(new THREE.Vector3().setFromMatrixScale(mesh.matrixWorld));
  if(character)return Math.max(size.x,size.y,size.z)>.10&&size.length()>.14;
  // Leave flat floors, thin foliage, signs, glass and huge terrain discs untraced.
  return Math.min(size.x,size.y,size.z)>.065&&Math.max(size.x,size.y,size.z)<35&&size.length()>.5;
}
function inkMaterial(character:boolean,viewport:{value:THREE.Vector2},width:{value:number}) {
  const material=new THREE.MeshBasicMaterial({color:INK,side:THREE.BackSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
  material.name=character?'Fashion character ink':'Fashion architecture ink';
  material.onBeforeCompile=shader=>{
    shader.uniforms.studioInkViewport=viewport;shader.uniforms.studioInkWidth=width;
    shader.vertexShader='uniform vec2 studioInkViewport;\nuniform float studioInkWidth;\n'+shader.vertexShader;
    // Basic's normal path is normally conditional. Run its real morph/skinning
    // normals for all silhouettes, then extrude in clip space by screen pixels.
    shader.vertexShader=shader.vertexShader.replace('#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )','#if 1');
    shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
      vec3 inkViewNormal=transformedNormal;
      #ifdef FLIP_SIDED
        inkViewNormal=-inkViewNormal;
      #endif
      vec2 inkNormal=(projectionMatrix*vec4(inkViewNormal,0.0)).xy;
      float inkLength=length(inkNormal);
      inkNormal=inkLength>0.0001?inkNormal/inkLength:vec2(0.0);
      gl_Position.xy+=inkNormal*(2.0*studioInkWidth/max(studioInkViewport,vec2(1.0)))*gl_Position.w;
    `);
  };
  material.customProgramCacheKey=()=>`fashion-screen-ink-v2:${character}`;
  return material;
}

/** Shared, selective inverted hulls; no extra render targets or normal pass. */
export function createInkOutlines(root:THREE.Object3D,camera:THREE.Camera) {
  const viewport={value:new THREE.Vector2(360,640)},characterWidth={value:1.35},worldWidth={value:1.15};
  const characterMaterial=inkMaterial(true,viewport,characterWidth),worldMaterial=inkMaterial(false,viewport,worldWidth);
  const seen=new WeakSet<THREE.Object3D>(),entries:Entry[]=[];
  const cam=new THREE.Vector3(),worldCenter=new THREE.Vector3();
  let disposed=false;
  function refresh() {
    if(disposed)return;
    root.updateMatrixWorld(true);
    const found:THREE.Mesh[]=[];
    root.traverse(node=>{if(node instanceof THREE.Mesh&&!node.userData.studioInk&&!seen.has(node))found.push(node);});
    for(const source of found) {
      seen.add(source);
      const character=isCharacter(source);
      if(!candidate(source,character))continue;
      const material=character?characterMaterial:worldMaterial;
      let stroke:THREE.Mesh;
      if(source instanceof THREE.SkinnedMesh) {
        const skin=new THREE.SkinnedMesh(source.geometry,material);
        skin.bindMode=source.bindMode;skin.bind(source.skeleton,source.bindMatrix);
        stroke=skin;
      }else stroke=new THREE.Mesh(source.geometry,material);
      stroke.morphTargetInfluences=source.morphTargetInfluences;stroke.morphTargetDictionary=source.morphTargetDictionary;
      stroke.name='Fashion black silhouette';stroke.userData.studioInk=true;stroke.frustumCulled=false;
      stroke.castShadow=false;stroke.receiveShadow=false;stroke.renderOrder=Math.max(1,source.renderOrder+1);
      source.add(stroke);
      const center=new THREE.Box3().setFromBufferAttribute(source.geometry.getAttribute('position') as THREE.BufferAttribute).getCenter(new THREE.Vector3());
      entries.push({source,stroke,character,center});
    }
  }
  function update(low:boolean,width:number,height:number) {
    if(disposed)return;
    viewport.value.set(Math.max(1,width),Math.max(1,height));
    characterWidth.value=low?1.1:1.5;worldWidth.value=low?.85:1.2;
    camera.getWorldPosition(cam);
    for(const entry of entries) {
      if(entry.character){entry.stroke.visible=true;continue;}
      entry.source.updateWorldMatrix(true,false);
      worldCenter.copy(entry.center).applyMatrix4(entry.source.matrixWorld);
      entry.stroke.visible=worldCenter.distanceToSquared(cam)<(low?34*34:65*65);
    }
  }
  refresh();
  return {refresh,update,get count(){return entries.length;},dispose(){if(disposed)return;disposed=true;for(const entry of entries)entry.stroke.removeFromParent();characterMaterial.dispose();worldMaterial.dispose();entries.length=0;}};
}
