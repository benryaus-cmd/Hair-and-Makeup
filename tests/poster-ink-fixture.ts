import * as THREE from 'three';
import {createRenderer} from '../src/core/renderer';
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
},rotate(){root.rotation.y+=Math.PI/3;},dispose(){ink.dispose();view.dispose();}};
Object.assign(window,{posterInk:api});
