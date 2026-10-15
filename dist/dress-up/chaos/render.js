function prop(ctx,id,x,y,scale){
  if(id==='none')return;
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
  ctx.fillStyle='#4d326b22';ctx.beginPath();ctx.ellipse(0,62,66,15,0,0,Math.PI*2);ctx.fill();
  ctx.shadowColor='#38213c33';ctx.shadowBlur=12;ctx.shadowOffsetY=7;
  if(id==='spoon'){
    ctx.rotate(.18);const silver=ctx.createLinearGradient(-30,0,30,0);silver.addColorStop(0,'#788693');silver.addColorStop(.3,'#edf4f9');silver.addColorStop(.6,'#b8c6d0');silver.addColorStop(1,'#657683');ctx.fillStyle=silver;ctx.beginPath();ctx.roundRect(-8,-46,16,107,8);ctx.fill();ctx.beginPath();ctx.ellipse(0,-67,30,43,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#f4fbff';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(-4,-69,19,31,0,Math.PI*.65,Math.PI*1.6);ctx.stroke();
  }else if(id==='duck'){
    const yellow=ctx.createRadialGradient(-14,-16,3,5,20,65);yellow.addColorStop(0,'#fff69a');yellow.addColorStop(.5,'#ffd849');yellow.addColorStop(1,'#eeb126');ctx.fillStyle=yellow;ctx.beginPath();ctx.ellipse(-3,20,47,34,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(20,-17,25,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f0a51e';ctx.beginPath();ctx.ellipse(43,-9,19,9,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#3b293d';ctx.beginPath();ctx.arc(26,-22,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(27,-23,1.4,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#dfaa27';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(-9,21,23,14,.1,0,Math.PI);ctx.stroke();
  }else{
    const paper=ctx.createLinearGradient(-55,-30,55,48);paper.addColorStop(0,'#fffef4');paper.addColorStop(1,'#e7ccad');ctx.fillStyle=paper;ctx.beginPath();ctx.roundRect(-56,-32,112,80,9);ctx.fill();ctx.shadowBlur=0;ctx.shadowOffsetY=0;ctx.strokeStyle='#b895ba';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-52,-28);ctx.lineTo(0,10);ctx.lineTo(52,-28);ctx.stroke();ctx.fillStyle='#8e5ca1';ctx.beginPath();ctx.arc(0,11,16,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff2c7';ctx.font='bold 22px Arial';ctx.textAlign='center';ctx.fillText('₩',0,19);
  }
  ctx.restore();
}
export function drawStudio(canvas,image,background,look){
  const ctx=canvas.getContext('2d'),w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,2);if(!w||!h||!image||!background)return;
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  const bgScale=Math.max(w/background.width,h/background.height);ctx.drawImage(background,(w-background.width*bgScale)/2,(h-background.height*bgScale)/2,background.width*bgScale,background.height*bgScale);
  if(look.scene==='pink'){ctx.fillStyle='#db649b35';ctx.fillRect(0,0,w,h);}
  if(look.scene==='disco'){
    ctx.fillStyle='#30226160';ctx.fillRect(0,0,w,h);
    for(const [x,y,color] of [[.15,.18,'#e6b8ff77'],[.8,.3,'#99dfe677'],[.5,.7,'#ffe2a044']]){const g=ctx.createRadialGradient(w*x,h*y,0,w*x,h*y,h*.5);g.addColorStop(0,color);g.addColorStop(1,'#ffffff00');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}
  }
  const scale=Math.min(w*.87/image.width,h*.88/image.height),iw=image.width*scale,ih=image.height*scale,cx=look.prop==='none'?w*.5:w*.43,x=cx-iw/2,floor=h*.865,y=floor-ih*.97;
  ctx.fillStyle='#42284d25';ctx.beginPath();ctx.ellipse(cx,floor+3,iw*.24,12,0,0,Math.PI*2);ctx.fill();ctx.drawImage(image,x,y,iw,ih);
  prop(ctx,look.prop,w*.83,h*.79,Math.min(w/490,h/610));
}
