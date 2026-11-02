import * as THREE from 'three';
import { GROUND_FOOTPRINTS } from './ground';

/** One opaque surface: no reflection buffers, transparency sorting or downloads. */
export function createStudioOcean() {
  const shores = GROUND_FOOTPRINTS.map(g => new THREE.Vector3(g.x,g.z,g.radius));
  const material = new THREE.ShaderMaterial({
    uniforms: { time:{value:0}, motion:{value:1}, shores:{value:shores} },
    vertexShader: `uniform float time;uniform float motion;varying vec3 vOcean;
      void main(){vec3 p=position;vOcean=p; p.z+=sin(p.x*.23+time*.85)*cos(p.y*.19-time*.6)*.07*motion;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
    fragmentShader: `uniform float time;uniform float motion;uniform vec3 shores[3];varying vec3 vOcean;
      void main(){
        vec2 p=vec2(vOcean.x,-vOcean.y);float coast=999.0;
        for(int i=0;i<3;i++){coast=min(coast,length(p-shores[i].xy)-shores[i].z);}
        float shallow=1.0-smoothstep(0.0,22.0,coast);
        vec3 col=mix(vec3(.055,.31,.50),vec3(.19,.74,.74),shallow);
        float t=time*motion;
        float waves=sin(p.x*.8+t*1.2+sin(p.y*.6-t*.6))*sin(p.y*.65-t*.9);
        col+=vec3(.08,.18,.15)*pow(max(waves,0.0),6.0)*(.35+shallow*.65);
        float foamBand=coast-(.65+sin(p.x*.5+p.y*.37+t)*.35);
        float foam=(1.0-smoothstep(.18,.65,abs(foamBand)))*smoothstep(-.1,.25,coast);
        foam*=.5+.5*sin(p.x*3.8+p.y*4.1+sin(t));
        col=mix(col,vec3(.88,.99,.94),foam*.7);
        float sunPath=exp(-pow((p.x+28.0+p.y*.24)/17.0,2.0));
        float glint=pow(max(0.0,sin(p.x*2.1+p.y*2.9+t*1.7)*sin(p.y*1.8-t)),20.0);
        col+=sunPath*glint*vec3(.72,.54,.29);
        gl_FragColor=vec4(col,1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(550,550,54,54),material);
  mesh.name='ocean';mesh.rotation.x=-Math.PI/2;mesh.position.y=-.27;
  return mesh;
}
