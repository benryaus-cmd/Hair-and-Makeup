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
      // Cool printed shadows and warm lit planes, without a white silhouette rim.
      vec3 studioNormal=normalize(normal);
      vec3 studioWorldNormal=inverseTransformDirection(studioNormal,viewMatrix);
      float studioKey=dot(studioWorldNormal,normalize(vec3(-25.0,18.0,-12.0)));
      float studioLit=smoothstep(-0.10,0.55,studioKey);
      vec3 studioTint=mix(vec3(0.70,0.63,0.88),vec3(1.04,1.0,0.94),studioLit);
      outgoingLight*=mix(vec3(1.0),studioTint,studioStrength*0.65);
      outgoingLight+=diffuseColor.rgb*vec3(0.025,0.018,0.04)*studioStrength;
      ${kind === 'hair' ? `
      // A directional band on the lit volume, not separate floating strands.
      float studioSilk = pow(max(0.0, 1.0-abs(normalize(normal).y-0.28)), 14.0);
      float studioSilkBreak = 0.8 + 0.2*sin(normal.x*37.0+normal.z*17.0);
      outgoingLight += mix(diffuseColor.rgb, vec3(1.0,0.88,0.71),0.20) * studioSilk * studioSilkBreak * 0.12;
      ` : ''}
      #include <opaque_fragment>
    `);
  };
  material.customProgramCacheKey = () => `${cacheKey}|studio-poster-v2:${kind}`;
  material.needsUpdate = true;
  return material;
}
