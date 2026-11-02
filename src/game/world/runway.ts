import * as THREE from 'three';
import type {Builder} from '../builder';
import {gloss,neonMaterial} from '../palette';

/** A graphic black-and-ivory fashion set, built from the same reusable world kit. */
export function buildFashionRunway(b:Builder) {
  const ink=gloss(0x211b2b,{roughness:.8,metalness:0});
  const ivory=gloss(0xfff7ed,{roughness:.7,metalness:0});
  const rose=gloss(0xec559b,{roughness:.38,metalness:.08});
  const light=neonMaterial(0xfff2dc,.75);
  // Edge strips and front-row seating frame a clear centre walk, not an obstacle course.
  for(const side of [-1,1]) {
    b.box(.10,.055,25.4,light,-46+side*4.30,.19,6);
    for(let i=0;i<6;i++) {
      const x=-46+side*5.7,z=-3+i*3.5;
      b.box(.90,.12,.82,ivory,x,.55,z);
      b.box(.90,.95,.10,ink,x,.98,z+.43);
      for(const dx of [-.33,.33])b.cyl(.025,.025,.48,6,ink,x+dx,.25,z);
      const fixture=b.add(new THREE.CylinderGeometry(.15,.22,.18,10),ink,-46+side*4.6,.18,z);
      fixture.rotation.z=-side*.35;
      b.sphere(.085,light,-46+side*4.6,.30,z);
    }
    // The portal reads as a high-contrast frame even on a small phone.
    b.box(.38,5.5,.55,ink,-46+side*4.35,3.85,23.7);
    b.box(.12,5.1,.1,light,-46+side*4.12,3.85,23.36);
  }
  b.box(9.1,.38,.55,ink,-46,6.55,23.7);
  b.box(8.55,.10,.12,rose,-46,6.31,23.35);
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;
  const ctx=canvas.getContext('2d');
  if(ctx){ctx.fillStyle='#fff7ed';ctx.fillRect(0,0,1024,512);ctx.textAlign='center';ctx.fillStyle='#211b2b';ctx.font='700 23px sans-serif';ctx.fillText('HAIR & MAKEUP  /  COLLECTION 01',512,100);ctx.font='bold 110px Georgia,serif';ctx.fillText('THE FIRST',512,250);ctx.fillText('LOOK.',512,369);ctx.fillStyle='#ec559b';ctx.fillRect(412,415,200,7);}
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const logo=b.add(new THREE.PlaneGeometry(8,4),new THREE.MeshBasicMaterial({map:texture}),-46,4.05,25.70);logo.name='Fashion show backdrop';logo.rotation.y=Math.PI;
  // Sculptural window-display looks reinforce that this is a fashion destination.
  for(let i=0;i<3;i++) {
    const x=-49.2+i*3.2,z=22.8,fabric=gloss([0x69c0ca,0xec559b,0x9c85c2][i],{roughness:.35,metalness:.10});
    b.cyl(.42,.50,.10,20,ink,x,1.23,z);
    b.cyl(.035,.035,.45,8,ivory,x,1.5,z);
    b.add(new THREE.ConeGeometry(.42,.85,18),fabric,x,1.93,z).scale.z=.65;
    b.add(new THREE.CylinderGeometry(.20,.13,.42,16),fabric,x,2.47,z).scale.z=.65;
    b.sphere(.105,ivory,x,2.81,z);
  }
}
