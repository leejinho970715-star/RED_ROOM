import * as THREE from './assets/three.module.js';
const palette=['#718092','#8b9c7a','#648ca7','#7983a5','#b39675','#a18ab0','#b5796b'];
const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.9,...extra});
const materials=new Map();
function material(color){if(!materials.has(color))materials.set(color,mat(color));return materials.get(color);}
function cube(parent,x,y,z,w,h,d,color,extra){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),extra?mat(color,extra):material(color));mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function cylinder(parent,x,y,z,r,h,color,segments=12){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments),material(color));mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function label(parent,text,x,y,z,w,h,color='#ffc8bc',bg='#181016',size=28){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,512,128);ctx.fillStyle=color;ctx.font=`${size*2}px Silkscreen, monospace`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64);const texture=new THREE.CanvasTexture(c);texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestFilter;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture}));mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
function renderer(canvas,scene,camera,scale=.58){const r=new THREE.WebGLRenderer({canvas,antialias:false,alpha:true,powerPreference:'low-power'});r.setPixelRatio(1);r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.35;const resize=()=>{const width=canvas.clientWidth,height=canvas.clientHeight;if(!width||!height)return;r.setSize(Math.round(width*scale),Math.round(height*scale),false);const aspect=width/height;camera.left=-camera.userData.extent*aspect;camera.right=camera.userData.extent*aspect;camera.updateProjectionMatrix();};new ResizeObserver(resize).observe(canvas);resize();return r;}
function ortho(extent){const c=new THREE.OrthographicCamera(-extent,extent,extent,-extent,.1,80);c.userData.extent=extent;return c;}
function pipe(parent,x,y,z,w,h,d){cube(parent,x,y,z,w,h,d,'#313b41');if(h>w){for(let n=-h/2+.3;n<h/2;n+=1.4)cube(parent,x,y+n,z,w+.07,.1,d+.07,'#40494b');}else{for(let n=-w/2+.3;n<w/2;n+=1.4)cube(parent,x+n,y,z,.1,h+.07,d+.07,'#40494b');}}
export function createScenes(onMachineClick){
 const machineCanvas=document.querySelector('#machine-canvas');
 let machineRenderer;
 const machineScene=new THREE.Scene();machineScene.background=null;machineScene.fog=new THREE.Fog('#0b1017',14,28);
 const camera=ortho(3.45);camera.position.set(6,5.2,11);camera.lookAt(0,2.55,0);
 try{machineRenderer=renderer(machineCanvas,machineScene,camera,.6);}catch{document.querySelector('.scene-fallback').hidden=false;return {spin(){},updateCharacter(){},rotate(){}};}
 machineScene.add(new THREE.AmbientLight('#96a9c5',.6));const fill=new THREE.DirectionalLight('#8998b8',2);fill.position.set(-5,9,5);fill.castShadow=true;fill.shadow.mapSize.set(1024,1024);fill.shadow.camera.left=-12;fill.shadow.camera.right=12;fill.shadow.camera.top=12;fill.shadow.camera.bottom=-12;machineScene.add(fill);
 const machine=new THREE.Group();machineScene.add(machine);machine.rotation.y=-.08;
 cube(machine,0,.13,0,3.05,.26,2,'#11151d');cube(machine,0,2.45,0,2.75,4.5,1.65,'#642b2c');cube(machine,0,2.5,.86,2.48,4.15,.16,'#943c3a');
 cube(machine,-1.38,2.4,0,.17,4.35,1.78,'#242c35');cube(machine,1.38,2.4,0,.17,4.35,1.78,'#303b43');
 cube(machine,0,4.55,0,3,.55,1.88,'#b64a41');cube(machine,0,4.95,-.2,2.8,.23,1.48,'#333a3e');cube(machine,0,4.55,.96,2.64,.39,.08,'#391c1e');
 label(machine,'RED ROOM',0,4.55,1.01,2.42,.33,'#ffa493','#2a161c',30);
 cube(machine,0,3.16,.94,2.26,2.14,.1,'#15222c');cube(machine,0,3.2,.91,2.1,1.97,.1,'#182f38',{roughness:.5,metalness:.35});
 cube(machine,-1.14,3.18,1.02,.1,2.18,.12,'#d77555');cube(machine,1.14,3.18,1.02,.1,2.18,.12,'#d77555');cube(machine,0,4.25,1.02,2.32,.08,.13,'#ae6a50');cube(machine,0,2.1,1.02,2.32,.13,.13,'#ae6a50');
 const capsuleGroup=new THREE.Group();machine.add(capsuleGroup);const capsules=[];
 for(let i=0;i<13;i++){const cap=new THREE.Group();const col=['#b5746b','#72788a','#9c8a66','#688b90','#89789c'][i%5];const mesh=new THREE.Mesh(new THREE.IcosahedronGeometry(.22,0),mat(col));cap.add(mesh);cube(cap,0,-.07,0,.34,.04,.34,'#262d38');const x=Math.sin(i*15.3)*.8,y=2.5+(i%3)*.43,z=1.07;cap.position.set(x,y,z);capsuleGroup.add(cap);capsules.push({cap,x,y,z});}
 cube(machine,-.83,3.91,1.15,.035,.46,.02,'#8bb4b6',{emissive:'#4f727c',emissiveIntensity:.45});cube(machine,-.68,3.87,1.15,.035,.37,.02,'#5d7e89');cube(machine,.88,2.52,1.15,.025,.46,.02,'#5d7e89');
 label(machine,'56 PARTS / 7 TIERS',0,1.87,1.06,2.2,.25,'#d59c81','#51272a',11);
 const consolePanel=cube(machine,0,1.25,1.1,2.72,.65,.9,'#6d2b2e');cube(machine,0,1.6,1.18,2.6,.13,.94,'#38434a');
 const buttonBase=cylinder(machine,0,1.76,1.23,.47,.13,'#171d26',64);cylinder(machine,0,1.83,1.23,.39,.13,'#54201e',64);const redButton=cylinder(machine,0,1.94,1.23,.34,.14,'#ff1533',64);redButton.material=mat('#ff1533',{roughness:.3,metalness:.2,emissive:'#ff092b',emissiveIntensity:1.3});
 cube(machine,-.92,1.72,1.18,.25,.04,.35,'#252c34');cube(machine,-.92,1.75,1.2,.16,.035,.22,'#70ad99',{emissive:'#62c292',emissiveIntensity:.45});
 cube(machine,.97,1.72,1.21,.23,.035,.35,'#242c35');cube(machine,.97,1.76,1.19,.025,.03,.25,'#987d62');
 cube(machine,0,.73,.95,1.05,.45,.08,'#161b24');cube(machine,0,.52,1.03,1.13,.1,.22,'#363c45');label(machine,'PUSH TO SURVIVE',0,.32,.97,2.1,.19,'#9a6559','#63272b',10);
 for(const x of [-1.23,1.23]){for(let y=.4;y<4.4;y+=.67)cube(machine,x,y,1.03,.055,.055,.015,'#c48d6f');}
 cube(machine,1.485,2.7,.04,.015,1.1,1.05,'#141e2a');for(let y=2.25;y<3.2;y+=.15)cube(machine,1.5,y,.03,.015,.05,.95,'#3a4550');
 const buttonLight=new THREE.PointLight('#ff3b2a',8,7,2);buttonLight.position.set(0,2.3,1.85);machine.add(buttonLight);const insideLight=new THREE.PointLight('#638dc4',3,3,2);insideLight.position.set(0,3.5,1.8);machine.add(insideLight);
 cylinder(machineScene,0,6.2,-.4,.03,1.7,'#2c3036');cube(machineScene,0,5.35,-.4,.8,.1,.65,'#3b3336');cube(machineScene,0,5.26,-.4,.52,.1,.39,'#d8513b',{emissive:'#fa4130',emissiveIntensity:1.3});const ceilingLight=new THREE.PointLight('#ff6245',12,9,2);ceilingLight.position.set(0,5.1,-.4);machineScene.add(ceilingLight);
 const plane=new THREE.Mesh(new THREE.PlaneGeometry(6,3.2),new THREE.MeshBasicMaterial({color:'#eb3d2b',transparent:true,opacity:.08,depthWrite:false}));plane.rotation.x=-Math.PI/2;plane.position.set(0,.035,.8);machineScene.add(plane);
 // Tiny luminous dust points are deterministic decorative positions.
 const pos=[];for(let i=0;i<50;i++)pos.push(Math.sin(i*73.9)*7,.5+((i*17)%55)/10,Math.cos(i*13.2)*3);const dustGeometry=new THREE.BufferGeometry();dustGeometry.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));const dust=new THREE.Points(dustGeometry,new THREE.PointsMaterial({color:'#807f88',size:.035,transparent:true,opacity:.4}));machineScene.add(dust);
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();machineCanvas.addEventListener('click',event=>{const rect=machineCanvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);if(raycaster.intersectObjects([redButton,buttonBase]).length)onMachineClick();});
 let spinEnd=0;let frame=0;let running=true;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function animate(){if(!running)return;requestAnimationFrame(animate);if(document.hidden)return;frame++;const now=performance.now(),spinning=now<spinEnd;capsules.forEach(({cap,x,y,z},i)=>{cap.rotation.y=spinning?now*.005+i:i*.5;cap.rotation.z=spinning?Math.sin(now*.008+i)*.5:0;cap.position.x=spinning?Math.sin(now*.007+i)*.85:x;cap.position.y=spinning?y+Math.sin(now*.015+i)*.12:y;});redButton.position.y=spinning?1.86:1.94;buttonLight.intensity=spinning?10+Math.sin(now*.015)*6:8;ceilingLight.intensity=12+(reduced?0:Math.sin(now*.0018)*.8);machineRenderer.render(machineScene,camera);}
 animate();return {spin(){spinEnd=performance.now()+1400;},dispose(){running=false;machineRenderer.dispose();}};
}


