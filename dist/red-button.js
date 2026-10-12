import * as THREE from './assets/three.module.js';

// The native button supplies keyboard/accessibility behavior; this canvas renders its physical cap.
export function createRedButton(){
 const button=document.querySelector('#draw-button'),canvas=document.querySelector('#red-button-canvas');
 let renderer;
 try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});}catch{button.classList.add('webgl-fallback');return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,30);
 camera.position.set(0,.65,4.8);camera.lookAt(0,0,.2);
 scene.add(new THREE.AmbientLight('#ffdfdf',2.2));
 const key=new THREE.DirectionalLight('#ffe6e3',3);key.position.set(-3,5,5);scene.add(key);
 const rimLight=new THREE.PointLight('#ff142b',12,10);rimLight.position.set(2,-1,2.5);scene.add(rimLight);
 const metal=new THREE.MeshStandardMaterial({color:'#25232b',metalness:.8,roughness:.35});
 const darkRed=new THREE.MeshStandardMaterial({color:'#670013',metalness:.3,roughness:.4});
 const red=new THREE.MeshPhysicalMaterial({color:'#bd001c',emissive:'#ff0627',emissiveIntensity:.38,metalness:.18,roughness:.26,clearcoat:1,clearcoatRoughness:.2});
 const glow=new THREE.MeshBasicMaterial({color:'#ff253d'});
 function disk(parent,radius,depth,z,material,bottomRadius=radius){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,bottomRadius,depth,96),material);mesh.rotation.x=Math.PI/2;mesh.position.z=z;parent.add(mesh);return mesh;}
 disk(scene,1.19,.23,.05,metal);disk(scene,1.1,.2,.19,darkRed);
 const bezel=new THREE.Mesh(new THREE.TorusGeometry(1.1,.055,16,96),metal);bezel.position.z=.24;scene.add(bezel);
 const lightRing=new THREE.Mesh(new THREE.TorusGeometry(1.05,.018,12,96),glow);lightRing.position.z=.29;scene.add(lightRing);
 const cap=new THREE.Group();scene.add(cap);disk(cap,1.02,.2,.38,red,1.07);
 // Rounded crown catches a real light reflection without introducing polygonal corners.
 const crown=new THREE.Mesh(new THREE.SphereGeometry(1.02,96,48,0,Math.PI*2,0,Math.PI/2),red);
 crown.rotation.x=Math.PI/2;crown.scale.y=.105;crown.position.z=.48;cap.add(crown);
 const observer=new ResizeObserver(()=>{const width=canvas.clientWidth;if(width)renderer.setSize(width,width,false);});observer.observe(canvas);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let hovered=false,pressed=false,last=0,frame;
 button.addEventListener('pointerenter',()=>hovered=true);button.addEventListener('pointerleave',()=>{hovered=false;pressed=false;});
 button.addEventListener('pointerdown',()=>{if(!button.disabled)pressed=true;});
 window.addEventListener('pointerup',()=>pressed=false);
 button.addEventListener('keydown',event=>{if(event.key===' '||event.key==='Enter')pressed=true;});
 window.addEventListener('keyup',event=>{if(event.key===' '||event.key==='Enter')pressed=false;});button.addEventListener('blur',()=>pressed=false);
 function animate(now){frame=requestAnimationFrame(animate);if(document.hidden||now-last<32||!canvas.clientWidth)return;last=now;
  const extracting=button.classList.contains('extracting'),depressed=pressed||extracting;
  cap.position.z=THREE.MathUtils.lerp(cap.position.z,depressed?-.13:0,.3);
  red.emissiveIntensity=extracting?.65:hovered?.52:.36+(reduced.matches?0:Math.sin(now*.0021)*.06);
  renderer.render(scene,camera);
 }
 frame=requestAnimationFrame(animate);
 return {dispose(){cancelAnimationFrame(frame);observer.disconnect();renderer.dispose();}};
}
