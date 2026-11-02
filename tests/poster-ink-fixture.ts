import * as THREE from 'three';
import {createRenderer} from '../src/core/renderer';
import {studioMaterial} from '../src/game/studio/materials';
import {createInkOutlines} from '../src/game/studio/ink';
const camera=new THREE.PerspectiveCamera(40,1,.1,100);camera.position.set(0,0,6);camera.lookAt(0,0,0);
const view=createRenderer({container:document.querySelector('#view')!,pixelRatio:2,onResize:()=>{},onError:message=>{throw Error(message)}})!;
const root=new THREE.Group(),scene=new THREE.Scene();scene.background=new THREE.Color('white');scene.add(root);
const sphere=new THREE.Mesh(new THREE.SphereGeometry(.8,64,32),new THREE.MeshStandardMaterial({color:0xe79aaf,emissive:0x885566,roughness:1}));root.add(sphere);
scene.add(new THREE.HemisphereLight(0xffffff,0xffffff,2));
const ink=createInkOutlines(root,camera);
const api={measure(){
  ink.update(false,360,360);view.renderer.render(scene,camera);
  const gl=view.renderer.getContext(),w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,pixels=new Uint8Array(w*4);
  gl.readPixels(0,Math.floor(h/2),w,1,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
  const dark:number[]=[];for(let x=0;x<w;x++)if(Math.max(pixels[x*4],pixels[x*4+1],pixels[x*4+2])<150)dark.push(x);
  return {antialias:gl.getContextAttributes()!.antialias,samples:gl.getParameter(gl.SAMPLES),left:dark.filter(x=>x<w/2).length,right:dark.filter(x=>x>w/2).length};
},fringeProbe(){
  sphere.visible=false;scene.background=new THREE.Color(0x8899aa);
  const material=new THREE.MeshStandardMaterial({color:0x704020,roughness:.88,metalness:.04});studioMaterial(material);
  root.add(new THREE.Mesh(new THREE.CylinderGeometry(.45,.55,2,7),material));
  const key=new THREE.DirectionalLight(0xffe5cf,2.7);key.position.set(-25,18,-12);scene.add(key);
  ink.refresh();ink.update(false,360,360);view.renderer.render(scene,camera);
  const gl=view.renderer.getContext(),w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,pixels=new Uint8Array(w*h*4);
  gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
  let white=0;for(let i=0;i<pixels.length;i+=4)if(Math.min(pixels[i],pixels[i+1],pixels[i+2])>245)white++;
  return {white};
},rotate(){root.rotation.y+=Math.PI/3;},dispose(){ink.dispose();view.dispose();}};
Object.assign(window,{posterInk:api});
