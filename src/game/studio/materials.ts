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
    shader.uniforms.studioStrength = { value: kind === 'world' ? .72 : .76 };
    shader.fragmentShader = 'uniform float studioStrength;\n' + shader.fragmentShader;
    const physical=THREE.ShaderChunk.lights_physical_pars_fragment.replace(
      'float dotNL = saturate( dot( geometryNormal, directLight.direction ) );',
      `float studioNL = saturate(dot(geometryNormal,directLight.direction));
       float studioRamp = 0.035 + 0.49*smoothstep(0.10,0.22,studioNL) + 0.475*smoothstep(0.55,0.67,studioNL);
       float dotNL = mix(studioNL,studioRamp,studioStrength*0.95);`
    );
    shader.fragmentShader=shader.fragmentShader.replace('#include <lights_physical_pars_fragment>',physical);
    shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', `
      // Broad pastel fill and restrained rim: retain the authored material response.
      float studioFacing = max(dot(normalize(normal), normalize(vViewPosition)), 0.0);
      float studioRim = pow(1.0 - studioFacing, 3.0);
      vec3 studioFill = diffuseColor.rgb * vec3(0.035, 0.025, 0.045);
      outgoingLight += studioFill * studioStrength;
      outgoingLight += vec3(1.0, 0.74, 0.81) * studioRim * studioStrength * 0.10;
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
