export const FIREWORK_LEVELS=Object.freeze([
 {bursts:2,sparks:24,duration:1.8},
 {bursts:3,sparks:32,duration:2.2},
 {bursts:4,sparks:40,duration:2.6},
 {bursts:5,sparks:48,duration:3.1},
 {bursts:7,sparks:60,duration:3.8},
 {bursts:10,sparks:72,duration:4.6},
 {bursts:14,sparks:88,duration:5.5}
]);

// Pixel fireworks remain behind the collectible inside the dialog's top layer.
export function celebrateDrop(canvas,rarity,color){
 const ctx=canvas.getContext('2d');if(!ctx)return ()=>{};
 const level=FIREWORK_LEVELS[rarity]||FIREWORK_LEVELS[0];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let width=1,height=1,frame,timer,stopped=false,start=performance.now();
 canvas.dataset.rarity=String(rarity);
 const resize=()=>{const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const ratio=Math.min(devicePixelRatio,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);};
 const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
 const palette=rarity>=4?[color,'#fff4cd','#ffd479',color]:[color,'#f1f5ff',color];
 const bursts=Array.from({length:level.bursts},(_,i)=>({
  x:[.16,.84,.3,.7,.5][i%5]+(Math.random()-.5)*.08,y:.18+Math.random()*.56,
  at:.01+i*Math.max(.18,(level.duration-1.5)/level.bursts),
  particles:Array.from({length:level.sparks},(_,j)=>({angle:j/level.sparks*Math.PI*2+(Math.random()-.5)*.09,speed:(.35+Math.random()*.65)*(rarity>=4?115:85),life:.75+Math.random()*.65,size:Math.random()>.75?3:2,color:palette[j%palette.length]}))
 }));
 function stop(){if(stopped)return;stopped=true;cancelAnimationFrame(frame);clearTimeout(timer);observer.disconnect();document.removeEventListener('visibilitychange',visibility);ctx.clearRect(0,0,width,height);}
 function visibility(){if(document.hidden)stop();}
 document.addEventListener('visibilitychange',visibility);
 if(reduced){
  observer.disconnect();
  for(let i=0;i<24;i++){ctx.fillStyle=palette[i%palette.length];const x=(i%2?.83:.17)*width+(Math.random()-.5)*width*.2,y=Math.random()*height;ctx.fillRect(x,y,2,2);}
  timer=setTimeout(stop,1600);return stop;
 }
 function draw(now){
  if(stopped)return;const elapsed=(now-start)/1000;
  ctx.clearRect(0,0,width,height);ctx.globalCompositeOperation='lighter';
  for(const burst of bursts){
   const age=elapsed-burst.at,x=burst.x*width,y=burst.y*height;
   if(age<0&&age>-.24){const launch=(age+.24)/.24,tip=height+(y-height)*launch;ctx.globalAlpha=launch;ctx.fillStyle=color;ctx.fillRect(x,tip,2,15);continue;}
   if(age<0||age>1.4)continue;
   for(const spark of burst.particles){
    if(age>spark.life)continue;
    const travel=spark.speed*age*(1-age*.22),px=x+Math.cos(spark.angle)*travel,py=y+Math.sin(spark.angle)*travel+38*age*age;
    ctx.globalAlpha=Math.max(0,1-age/spark.life);ctx.fillStyle=spark.color;ctx.fillRect(Math.round(px),Math.round(py),spark.size,spark.size);
    if(rarity>=3){ctx.globalAlpha*=.3;ctx.fillRect(Math.round(px-Math.cos(spark.angle)*6),Math.round(py-Math.sin(spark.angle)*6),2,2);}
    if(rarity>=5&&spark.size===3&&age<.5){ctx.fillRect(px-2,py+1,7,1);ctx.fillRect(px+1,py-2,1,7);}
   }
   if(age<.18){ctx.globalAlpha=(1-age/.18)*.22;ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,10+age*145,0,Math.PI*2);ctx.stroke();}
  }
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  if(elapsed>=level.duration)stop();else frame=requestAnimationFrame(draw);
 }
 frame=requestAnimationFrame(draw);return stop;
}
