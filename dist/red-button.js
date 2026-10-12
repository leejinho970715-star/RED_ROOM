import * as THREE from './assets/three.module.js';

// The native button supplies keyboard/accessibility behavior; this canvas renders its physical cap.
export function createRedButton(){
 const button=document.querySelector('#draw-button'),canvas=document.querySelector('#red-button-canvas');
 let renderer;
 try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});}catch{button.classList.add('webgl-fallback');return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,30);
 camera.position.set(.5,2.25,5.15);camera.lookAt(0,0,.25);
 scene.add(new THREE.AmbientLight('#ffdfdf',1.4));
 const key=new THREE.DirectionalLight('#ffe6e3',4.2);key.position.set(-3,5,5);scene.add(key);
 const fill=new THREE.DirectionalLight('#91a6c0',1.8);fill.position.set(4,1,2);scene.add(fill);
 const rimLight=new THREE.PointLight('#ff142b',12,10);rimLight.position.set(2,-1,2.5);scene.add(rimLight);
 const metal=new THREE.MeshStandardMaterial({color:'#45424b',metalness:.72,roughness:.28});
 const darkRed=new THREE.MeshStandardMaterial({color:'#670013',metalness:.3,roughness:.4});
 const red=new THREE.MeshPhysicalMaterial({color:'#bd001c',emissive:'#ff0627',emissiveIntensity:.38,metalness:.18,roughness:.26,clearcoat:1,clearcoatRoughness:.2});
 const glow=new THREE.MeshBasicMaterial({color:'#ff253d'});
 function disk(parent,radius,depth,z,material,bottomRadius=radius){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,bottomRadius,depth,96),material);mesh.rotation.x=Math.PI/2;mesh.position.z=z;parent.add(mesh);return mesh;}
 disk(scene,1.19,.35,-.05,metal);disk(scene,1.1,.24,.19,darkRed);
 const bezel=new THREE.Mesh(new THREE.TorusGeometry(1.1,.055,16,96),metal);bezel.position.z=.24;scene.add(bezel);
 const lightRing=new THREE.Mesh(new THREE.TorusGeometry(1.05,.018,12,96),glow);lightRing.position.z=.29;scene.add(lightRing);
 const cap=new THREE.Group();scene.add(cap);disk(cap,1.02,.33,.43,[darkRed,red,darkRed],1.07);
 // Rounded crown catches a real light reflection without introducing polygonal corners.
 const crown=new THREE.Mesh(new THREE.SphereGeometry(1.02,96,48,0,Math.PI*2,0,Math.PI/2),red);
 crown.rotation.x=Math.PI/2;crown.scale.y=.14;crown.position.z=.595;cap.add(crown);
 const lip=new THREE.Mesh(new THREE.TorusGeometry(1.015,.018,12,96),red);lip.position.z=.6;cap.add(lip);
 // Machined fasteners on the outer metal rim give the housing visible depth.
 const screwMaterial=new THREE.MeshStandardMaterial({color:'#8c8791',metalness:.8,roughness:.4});
 for(let i=0;i<4;i++){
  const angle=Math.PI/4+i*Math.PI/2,screw=disk(scene,.026,.018,.13,screwMaterial);
  screw.position.x=Math.cos(angle)*1.15;screw.position.y=Math.sin(angle)*1.15;
 }
 const observer=new ResizeObserver(()=>{const width=canvas.clientWidth;if(width)renderer.setSize(width,width,false);});observer.observe(canvas);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let hovered=false,pressed=false,last=0,frame;
 button.addEventListener('pointerenter',()=>hovered=true);button.addEventListener('pointerleave',()=>{hovered=false;pressed=false;});
 button.addEventListener('pointerdown',()=>{if(!button.disabled)pressed=true;});
 window.addEventListener('pointerup',()=>pressed=false);
 button.addEventListener('keydown',event=>{if(event.key===' '||event.key==='Enter')pressed=true;});
 window.addEventListener('keyup',event=>{if(event.key===' '||event.key==='Enter')pressed=false;});button.addEventListener('blur',()=>pressed=false);
 function animate(now){frame=requestAnimationFrame(animate);if(document.hidden||now-last<32||!canvas.clientWidth)return;last=now;
  const extracting=button.classList.contains('extracting'),depressed=pressed||extracting;
  cap.position.z=THREE.MathUtils.lerp(cap.position.z,depressed?-.2:0,.3);
  red.emissiveIntensity=extracting?.65:hovered?.52:.36+(reduced.matches?0:Math.sin(now*.0021)*.06);
  renderer.render(scene,camera);
 }
 frame=requestAnimationFrame(animate);
 return {dispose(){cancelAnimationFrame(frame);observer.disconnect();renderer.dispose();}};
}
