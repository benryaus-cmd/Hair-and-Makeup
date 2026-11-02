import * as THREE from 'three';

export const ARRIVAL_SECONDS = 7;
const smooth = (x: number) => { const t = THREE.MathUtils.clamp(x, 0, 1); return t*t*(3-2*t); };
/** Three connected shots, ending at the exact camera the follow rig wants. */
export function arrivalShot(elapsed: number, doll: THREE.Vector3, followPosition: THREE.Vector3) {
  const t = THREE.MathUtils.clamp(Number.isFinite(elapsed) ? elapsed : 0, 0, ARRIVAL_SECONDS);
  const a = new THREE.Vector3(36, 28, 30), b = new THREE.Vector3(-13, 12, 4);
  const c = doll.clone().add(new THREE.Vector3(4.4, 2.6, 5.4));
  const focus = doll.clone().add(new THREE.Vector3(0, 1, 0));
  const position = t < 3 ? a.lerp(b,smooth(t/3)) : t < 5.3 ? b.lerp(c,smooth((t-3)/2.3)) : c.lerp(followPosition,smooth((t-5.3)/1.7));
  const target = new THREE.Vector3(0, 1.5, -16).lerp(focus,smooth(t/4));
  return { position, target, progress: t/ARRIVAL_SECONDS };
}
