import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { Builder } from '../builder';
import { gloss } from '../palette';
import { signTexture } from './materials';

/** Cosmetic facade kit; no new collisions or narrowed doorways. */
export function buildStudioArchitecture(b: Builder) {
  const pearl=gloss(0xfff4e8,{roughness:.63,metalness:0});
  const plum=gloss(0x62415d,{roughness:.82,metalness:0});
  const rose=gloss(0xe5a2b6,{roughness:.6,metalness:.03});
  const brass=gloss(0xe8bf7b,{roughness:.3,metalness:.55});
  const green=gloss(0x47896d,{roughness:.9,metalness:0});
  const rounded=(w:number,h:number,d:number,mat:THREE.Material,x:number,y:number,z:number,r=.08)=>b.add(new RoundedBoxGeometry(w,h,d,2,r),mat,x,y,z);
  const planter=(x:number,z:number)=>{
    rounded(.85,.62,.85,pearl,x,.33,z,.12);
    for(let i=0;i<3;i++) {const bush=b.sphere(.35,green,x+(i-1)*.18,.89+(i%2)*.16,z);bush.scale.y=1.3;}
    b.sphere(.16,rose,x,.97,z+.26);
  };
  const titles=['MAISON ROSÉ','THE BEAUTY EDIT','ATELIER GOLD'];
  const colors=[0xe8b8c7,0xb9d7ce,0xe8d0a8];
  for(let i=0;i<3;i++) {
    const z=-1+i*13, color=gloss(colors[i],{roughness:.72,metalness:0});
    // Stepped cornices, a raised monogram and soft-edged display bays.
    rounded(.42,.40,8.85,pearl,-53.0,7.45,z,.09);
    rounded(.38,1.45,7.1,color,-53.08,5.76,z,.13);
    rounded(.22,2.8,5.6,plum,-53.05,2.45,z,.12);
    rounded(.25,.15,6,brass,-52.89,1.05,z,.035);
    for(const side of [-1,1]) {
      rounded(.38,4.3,.4,pearl,-52.88,2.9,z+side*3.05,.09);
      planter(-51.9,z+side*3.55);
      // Sculptural display forms give the window a purpose, even at mobile distance.
      const dress=b.add(new THREE.ConeGeometry(.48,1.25,12),color,-52.74,2.02,z+side*1.4);dress.scale.x=.30;
      b.sphere(.17,pearl,-52.74,2.82,z+side*1.4);
      b.cyl(.035,.035,.75,8,brass,-52.74,1.32,z+side*1.4);
    }
    if(typeof document!=='undefined') {
      const sign=b.add(new THREE.PlaneGeometry(6.2,.8),new THREE.MeshBasicMaterial({map:signTexture(titles[i],'#62415d','#fff4e8')}),-52.85,5.8,z);
      sign.rotation.y=Math.PI/2;
    }
    for(let n=0;n<3;n++)rounded(.22,.13,.9,brass,-52.84,4.7,z+(n-1)*2.1,.03);
  }
  // Salon: a cream architectural frame, lit vanity bulbs and flowering entry.
  rounded(10.8,.38,.55,pearl,-29,4.86,22.15,.12);
  for(const x of [-33.85,-24.15]) {
    rounded(.4,3.65,.5,pearl,x,1.83,22.2,.10);
    planter(x,23.15);
  }
  for(let i=0;i<9;i++)b.sphere(.055,gloss(0xffe2af,{emissive:0xffd5a0,emissiveIntensity:.6}),-33+i,3.72,22.56);
  // Arrival boulevard: inset decorative medallions and a photo-ready welcome marker.
  const signMat=new THREE.MeshBasicMaterial({map:signTexture('HAIR & MAKEUP','#62415d','#fff4e8')});
  rounded(5.5,1.15,.18,pearl,15,2.25,-21.8,.15);
  const welcome=b.add(new THREE.PlaneGeometry(5.05,.8),signMat,15,2.25,-21.69);welcome.name='Studio arrival landmark';
  for(const x of [12.6,17.4]){b.cyl(.045,.045,1.8,8,brass,x,1,-21.8);planter(x,-22.1);}
  // A scalloped rooftop crown turns the existing villa into a recognisable landmark.
  for(let i=0;i<9;i++) {
    const arc=b.add(new THREE.TorusGeometry(.62,.075,6,14,Math.PI),pearl,-8+i*2,7.7,-47.35);arc.rotation.z=0;
  }
}
