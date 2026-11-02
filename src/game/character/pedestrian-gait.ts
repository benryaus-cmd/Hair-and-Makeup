import * as THREE from 'three';
import { solveLimb } from '@/game/character/riding';
import type { MotionFrame } from './motion-controller';

const TAU = Math.PI * 2;
const STRIDE_DISTANCE = .96, STANCE = .6, REACH = STRIDE_DISTANCE * STANCE / 2;
const keys = ['pelvis','waist','head','leftUpperLeg','leftLowerLeg','leftFoot','rightUpperLeg','rightLowerLeg','rightFoot','leftUpperArm','leftLowerArm','leftHand','rightUpperArm','rightLowerArm','rightHand'];
const smooth = (t:number) => t*t*(3-2*t);

/** Resident-only walking at pedestrian speeds. During stance the local foot
 * retreats exactly as far as the route travels, so its world contact stays put.
 * A complete cycle covers .96m regardless of frame time or walking speed. */
export function createPedestrianGait() {
  const out:MotionFrame = {pelvisY:.936,phase:0,rotations:Object.fromEntries(keys.map(key=>[key,[0,0,0] as [number,number,number]])),hands:{left:'relaxed',right:'relaxed'}};
  const origin=new THREE.Vector3(),target=new THREE.Vector3(),hint=new THREE.Vector3(),direction=new THREE.Vector3(),euler=new THREE.Euler();
  let distance=0;
  return {update(_dt:number, distanceDelta:number, moving:boolean):MotionFrame {
    if(moving&&Number.isFinite(distanceDelta))distance+=Math.max(0,distanceDelta);
    const cycleDistance=((distance%STRIDE_DISTANCE)+STRIDE_DISTANCE)%STRIDE_DISTANCE;
    out.phase=cycleDistance/STRIDE_DISTANCE*TAU;
    for(const rotation of Object.values(out.rotations))rotation.fill(0);
    const contacts=[0,1].map(i=>{
      if(!moving)return {z:0,lift:0,roll:0};
      const cycle=(cycleDistance/STRIDE_DISTANCE+i*.5)%1;
      const swing=cycle>STANCE?(cycle-STANCE)/(1-STANCE):0;
      const z=cycle<=STANCE?REACH-STRIDE_DISTANCE*cycle:-REACH+REACH*2*smooth(swing);
      const roll=cycle<.1?-.12*(1-cycle/.1):cycle>.48&&cycle<=STANCE?.18*smooth((cycle-.48)/(STANCE-.48)):cycle>STANCE?.18*Math.cos(swing*Math.PI):0;
      // Shoe length converts heel/toe roll into the ankle's required clearance.
      const clearance=Math.max(0,Math.sin(roll))*.13+Math.max(0,-Math.sin(roll))*.055;
      return {z,lift:.075*Math.pow(Math.sin(swing*Math.PI),1.5)+clearance,roll};
    });
    out.pelvisY=Math.min(...contacts.map(contact=>.09+contact.lift+.025+Math.sqrt(.821*.821-contact.z*contact.z)))-.0005;
    for(let i=0;i<2;i++) {
      const side=i?1:-1,p=i?'right':'left',{z,lift,roll}=contacts[i];
      origin.set(side*.108,-.025,0);target.set(side*.108,.09+lift-out.pelvisY,z);hint.set(0,0,1);direction.set(0,-Math.cos(roll),-Math.sin(roll));
      const rotations=solveLimb(origin,target,hint,.425,.397,direction);
      for(let j=0;j<3;j++){euler.setFromQuaternion(rotations[j]);out.rotations[p+['UpperLeg','LowerLeg','Foot'][j]].splice(0,3,euler.x,euler.y,euler.z);}
      const progress=moving?z/REACH:0;
      // Same-side arm moves back as its leg advances. A soft elbow and slight
      // outward clearance keep the hands beside skirts rather than through them.
      out.rotations[p+'UpperArm'].splice(0,3,.04+progress*.32,0,side*.105);
      out.rotations[p+'LowerArm'][0]=-.14-.12*Math.max(0,-progress);
      out.rotations[p+'Hand'].splice(0,3,-.025,-side*.6,side*.015);
    }
    if(moving){out.rotations.waist[1]=-Math.sin(out.phase)*.045;out.rotations.head[1]=Math.sin(out.phase)*.018;}
    return out;
  }};
}
