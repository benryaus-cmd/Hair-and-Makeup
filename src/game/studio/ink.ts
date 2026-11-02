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
/** Weld extrusion normals only. Hard surface normals still shade the original
 * mesh; shared position/skin/morph buffers keep both surfaces in the same pose. */
function outlineGeometry(source:THREE.BufferGeometry) {
  const geometry=new THREE.BufferGeometry();
  geometry.setIndex(source.index);
  for(const [name,attribute] of Object.entries(source.attributes))geometry.setAttribute(name,attribute);
  geometry.morphAttributes=source.morphAttributes;
  geometry.morphTargetsRelative=source.morphTargetsRelative;
  const position=source.getAttribute('position'),normal=source.getAttribute('normal');
  const sums=new Map<string,THREE.Vector3>(),keys:string[]=[];
  for(let i=0;i<position.count;i++) {
    const key=`${Math.round(position.getX(i)*1e5)},${Math.round(position.getY(i)*1e5)},${Math.round(position.getZ(i)*1e5)}`;
    keys.push(key);
    let sum=sums.get(key);if(!sum){sum=new THREE.Vector3();sums.set(key,sum);}
    sum.x+=normal.getX(i);sum.y+=normal.getY(i);sum.z+=normal.getZ(i);
  }
  for(const sum of sums.values())sum.normalize();
  const normals=new Float32Array(position.count*3);
  for(let i=0;i<position.count;i++) {
    const sum=sums.get(keys[i])!;
    if(sum.lengthSq()<.01)sum.set(normal.getX(i),normal.getY(i),normal.getZ(i));
    sum.toArray(normals,i*3);
  }
  geometry.setAttribute('normal',new THREE.BufferAttribute(normals,3));
  return geometry;
}
function inkMaterial(character:boolean,viewport:{value:THREE.Vector2},width:{value:number}) {
  const material=new THREE.MeshBasicMaterial({color:INK,side:THREE.BackSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1,toneMapped:false});
  material.name=character?'Fashion character ink':'Fashion architecture ink';
  material.onBeforeCompile=shader=>{
    shader.uniforms.studioInkViewport=viewport;shader.uniforms.studioInkWidth=width;
    shader.uniforms.studioInkLight={value:new THREE.Vector3(-25,18,-12).normalize()};
    shader.vertexShader='uniform vec2 studioInkViewport;\nuniform float studioInkWidth;\nuniform vec3 studioInkLight;\n'+shader.vertexShader;
    // Basic's normal path is normally conditional. Run its real morph/skinning
    // normals for all silhouettes, then extrude in clip space by screen pixels.
    shader.vertexShader=shader.vertexShader.replace('#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )','#if 1');
    shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
      vec3 inkViewNormal=transformedNormal;
      #ifdef FLIP_SIDED
        inkViewNormal=-inkViewNormal;
      #endif
      inkViewNormal=normalize(inkViewNormal);
      vec3 inkWorldNormal=inverseTransformDirection(inkViewNormal,viewMatrix);
      float inkShade=1.0-smoothstep(-0.35,0.65,dot(inkWorldNormal,studioInkLight));
      // Thin on the lit edge; broad on the shadow edge. Smooth interpolation
      // makes the line taper around the form instead of changing by face.
      float inkWeight=mix(0.42,1.85,inkShade);
      vec2 inkNormal=(projectionMatrix*vec4(inkViewNormal,0.0)).xy;
      float inkLength=length(inkNormal);
      inkNormal=inkLength>0.0001?inkNormal/inkLength:vec2(0.0);
      gl_Position.xy+=inkNormal*(2.0*studioInkWidth*inkWeight/max(studioInkViewport,vec2(1.0)))*gl_Position.w;
    `);
  };
  material.customProgramCacheKey=()=>`fashion-poster-ink-v3:${character}`;
  return material;
}

/** Shared, selective inverted hulls; no extra render targets or normal pass. */
export function createInkOutlines(root:THREE.Object3D,camera:THREE.Camera) {
  const viewport={value:new THREE.Vector2(360,640)},characterWidth={value:1.35},worldWidth={value:1.15};
  const characterMaterial=inkMaterial(true,viewport,characterWidth),worldMaterial=inkMaterial(false,viewport,worldWidth);
  const seen=new WeakSet<THREE.Object3D>(),entries:Entry[]=[];
  const geometries=new Map<THREE.BufferGeometry,THREE.BufferGeometry>();
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
      let geometry=geometries.get(source.geometry);
      if(!geometry){geometry=outlineGeometry(source.geometry);geometries.set(source.geometry,geometry);}
      let stroke:THREE.Mesh;
      if(source instanceof THREE.SkinnedMesh) {
        const skin=new THREE.SkinnedMesh(geometry,material);
        skin.bindMode=source.bindMode;skin.bind(source.skeleton,source.bindMatrix);
        stroke=skin;
      }else stroke=new THREE.Mesh(geometry,material);
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
    characterWidth.value=low?1.25:1.65;worldWidth.value=low?.8:1.1;
    camera.getWorldPosition(cam);
    for(const entry of entries) {
      if(entry.character){entry.stroke.visible=true;continue;}
      entry.source.updateWorldMatrix(true,false);
      worldCenter.copy(entry.center).applyMatrix4(entry.source.matrixWorld);
      entry.stroke.visible=worldCenter.distanceToSquared(cam)<(low?34*34:65*65);
    }
  }
  refresh();
  return {refresh,update,get count(){return entries.length;},dispose(){if(disposed)return;disposed=true;for(const entry of entries)entry.stroke.removeFromParent();for(const geometry of geometries.values())geometry.dispose();geometries.clear();characterMaterial.dispose();worldMaterial.dispose();entries.length=0;}};
}
