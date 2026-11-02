import * as THREE from 'three';

export const ARRIVAL_SECONDS = 7;
const smooth = (x: number) => { const t = THREE.MathUtils.clamp(x, 0, 1); return t*t*(3-2*t); };
/** Front-row, beauty close-up and finale framing on the real catwalk. */
export function arrivalShot(elapsed: number, doll: THREE.Vector3, followPosition: THREE.Vector3) {
  const t = THREE.MathUtils.clamp(Number.isFinite(elapsed) ? elapsed : 0, 0, ARRIVAL_SECONDS);
  if(t>=ARRIVAL_SECONDS)return {position:followPosition.clone(),target:doll.clone().add(new THREE.Vector3(0,1,0)),progress:1};
  const opening=new THREE.Vector3(1.75,1.55,-4.5),beauty=new THREE.Vector3(-2.20,1.65,-3.7),finale=new THREE.Vector3(2.8,2.0,-5.7);
  const offset=t<2.4?opening.lerp(new THREE.Vector3(.8,1.5,-4.1),smooth(t/2.4)):t<4.7?beauty.lerp(new THREE.Vector3(-1.5,1.6,-3.4),smooth((t-2.4)/2.3)):finale.lerp(new THREE.Vector3(1.8,1.9,-5.4),smooth((t-4.7)/2.3));
  return {position:doll.clone().add(offset),target:doll.clone().add(new THREE.Vector3(0,t<4.7&&t>=2.4?1.12:1.0,0)),progress:t/ARRIVAL_SECONDS};
}

/** The hero walks the actual avenue catwalk, then holds an editorial pose. */
export function runwayPerformance(progress:number) {
  const p=THREE.MathUtils.clamp(Number.isFinite(progress)?progress:0,0,1);
  const walk=Math.min(1,p/.55);
  return {position:new THREE.Vector3(-46,.16,17-walk*5.5),yaw:Math.PI+(p>.55?smooth((p-.55)/.30)*.24:0),walking:p<.55,pose:'editorial' as const};
}
