import * as THREE from 'three';
import type { Builder } from '../builder';
import { gloss } from '../palette';
import { flowerPatch } from './props';

/** Low relief planting and pavement break up the old empty spawn beach. */
export function buildCreatorPlaza(b:Builder) {
  const paving=gloss(0xf4e3da,{roughness:.85,metalness:0});
  const edging=gloss(0xd6b8bc,{roughness:.9,metalness:0});
  const lawn=gloss(0x8dbb9e,{roughness:.95,metalness:0});
  const apron=b.add(new THREE.CircleGeometry(10,48),paving,7,.025,-13);apron.rotation.x=-Math.PI/2;
  const band=b.add(new THREE.RingGeometry(9.75,10,48),edging,7,.03,-13);band.rotation.x=-Math.PI/2;
  // Tiles form a legible route to the pool/house, leaving the player's sightline open.
  for(let i=0;i<7;i++)b.box(2.1,.035,.65,i%2?paving:edging,7,.055,-14.5-i*1.15);
  for(const [x,z,r] of [[-6,-12,3.3],[18,-7,3.1],[-9,-23,2.5],[21,-23,2.5]]) {
    const grass=b.add(new THREE.CircleGeometry(r,28),lawn,x,.045,z);grass.rotation.x=-Math.PI/2;
    const rim=b.add(new THREE.RingGeometry(r,r+.12,28),paving,x,.05,z);rim.rotation.x=-Math.PI/2;
    flowerPatch(b,x,z,0xe99db8);
  }
  // Contact decals keep static furniture and trees grounded even in low graphics.
  const shadowMat=new THREE.MeshBasicMaterial({color:0x664f5e,transparent:true,opacity:.075,depthWrite:false});
  const shadowGeo=new THREE.CircleGeometry(1,20);
  for(const [x,z,sx,sz] of [[-18,4,2,1],[-14,-10,2,1],[16,2,2,1],[22,-12,2,1],[-17,-35,2,1],[21,-48,2,1],[24,44,2,1],[36,46,2,1],[50,20,2,1],[58,34,2,1]]) {
    const shade=b.add(shadowGeo,shadowMat,x+.7,.019,z+.35);shade.rotation.x=-Math.PI/2;shade.scale.set(sx,sz,1);
  }
}
