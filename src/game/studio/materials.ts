import * as THREE from 'three';

type StudioKind = 'world' | 'skin' | 'hair';
const decorated = new WeakSet<THREE.MeshStandardMaterial>();
/** Preserve the Standard pipeline, including wardrobe prints, dye and skinning. */
export function studioMaterial(material: THREE.MeshStandardMaterial, kind: StudioKind = 'world') {
  if (decorated.has(material)) return material;
  decorated.add(material);
  const previous = material.onBeforeCompile;
  const cacheKey = material.customProgramCacheKey();
  material.onBeforeCompile = (shader, renderer) => {
    previous.call(material, shader, renderer);
    shader.uniforms.studioStrength = { value: kind === 'world' ? .34 : .55 };
    shader.fragmentShader = 'uniform float studioStrength;\n' + shader.fragmentShader;
    const physical=THREE.ShaderChunk.lights_physical_pars_fragment.replace(
      'float dotNL = saturate( dot( geometryNormal, directLight.direction ) );',
      `float studioNL = saturate(dot(geometryNormal,directLight.direction));
       float studioRamp = 0.10 + 0.46*smoothstep(0.08,0.23,studioNL) + 0.44*smoothstep(0.52,0.72,studioNL);
       float dotNL = mix(studioNL,studioRamp,studioStrength*0.85);`
    );
    shader.fragmentShader=shader.fragmentShader.replace('#include <lights_physical_pars_fragment>',physical);
    shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', `
      // Broad pastel fill and restrained rim: retain the authored material response.
      float studioFacing = max(dot(normalize(normal), normalize(vViewPosition)), 0.0);
      float studioRim = pow(1.0 - studioFacing, 3.0);
      vec3 studioFill = diffuseColor.rgb * vec3(0.12, 0.075, 0.105);
      outgoingLight += studioFill * studioStrength;
      outgoingLight += vec3(1.0, 0.74, 0.81) * studioRim * studioStrength * 0.22;
      ${kind === 'hair' ? `
      // A directional band on the lit volume, not separate floating strands.
      float studioSilk = pow(max(0.0, 1.0-abs(normalize(normal).y-0.28)), 14.0);
      float studioSilkBreak = 0.8 + 0.2*sin(normal.x*37.0+normal.z*17.0);
      outgoingLight += mix(diffuseColor.rgb, vec3(1.0,0.88,0.71),0.38) * studioSilk * studioSilkBreak * 0.19;
      ` : ''}
      #include <opaque_fragment>
    `);
  };
  material.customProgramCacheKey = () => `${cacheKey}|studio-soft-v1:${kind}`;
  material.needsUpdate = true;
  return material;
}

/** Small rigid shapes only. Cloth and hair retain their own fine silhouettes. */
export function addHeroContours(root: THREE.Object3D) {
  const meshes: THREE.Mesh[] = [];
  root.traverse(node => {
    if (!(node instanceof THREE.Mesh) || node instanceof THREE.SkinnedMesh || Array.isArray(node.material)) return;
    if (node.geometry.getAttribute('position').count < 80 || node.material.transparent) return;
    let clothing = false;
    for (let p: THREE.Object3D | null = node; p && p !== root; p = p.parent) {
      if (/hair|shoe|gown|skirt|top|bottom|necklace|eye|mouth|hand/i.test(p.name)) clothing = true;
    }
    if (!clothing && meshes.length < 12) meshes.push(node);
  });
  const material = new THREE.MeshBasicMaterial({ color: 0x6e3157, side: THREE.BackSide, depthWrite: false });
  // Expand in world units so non-uniformly scaled ovals do not get huge borders.
  material.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', `
      vec4 mvPosition = vec4( transformed, 1.0 );
      #ifdef USE_BATCHING
        mvPosition = batchingMatrix * mvPosition;
      #endif
      #ifdef USE_INSTANCING
        mvPosition = instanceMatrix * mvPosition;
      #endif
      mvPosition = modelViewMatrix * mvPosition;
      mvPosition.xyz += normalize(normalMatrix * normal) * 0.006;
      gl_Position = projectionMatrix * mvPosition;
    `);
  };
  material.customProgramCacheKey = () => 'studio-contour-v1';
  for (const source of meshes) {
    const line = new THREE.Mesh(source.geometry, material);
    line.name = 'Studio silhouette'; line.renderOrder = -1;
    line.userData.studioContour = true;
    source.add(line);
  }
  return { setQuality(low: boolean) { for (const source of meshes) source.children.filter(c => c.userData.studioContour).forEach(c => { c.visible = !low; }); } };
}
