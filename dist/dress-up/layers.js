import {equippedParts} from './parts.js';
import {garmentRig,uniformPlacement,footwearPlacement} from './fitting.js';
const figures=new Map(),bounds=new WeakMap();
// These masks describe only the base tee and shorts. Keeping skin/hair/hands
// outside the clothing layers prevents an old garment from peeking through.
const baseTee=new Path2D('M340 289 Q380 256 456 249 Q510 302 580 249 Q650 255 690 288 L694 377 L672 391 L632 377 L626 466 L620 533 Q520 552 417 534 L409 466 L401 378 L355 391 L342 375 Z');
const baseShorts=new Path2D('M417 533 Q518 542 621 532 L650 613 L660 779 L379 779 L374 650 Z');
const underTee=new Path2D('M445 249 L585 249 L626 385 L620 533 Q520 552 417 534 L407 385 Z');
const frontNeck=new Path2D('M460 235 L576 235 L578 265 Q565 288 518 291 Q477 289 456 264 Z');
function alphaBounds(image,region='full'){
  if(bounds.get(image)?.[region])return bounds.get(image)[region];
  const c=document.createElement('canvas');c.width=image.width;c.height=image.height;
  const cx=c.getContext('2d',{willReadFrequently:true});cx.drawImage(image,0,0);
  const data=cx.getImageData(0,0,c.width,c.height).data;
  let left=c.width,top=c.height,right=-1,bottom=-1;
  const start=region==='right'?Math.floor(c.width/2):0,end=region==='left'?Math.floor(c.width/2):c.width;
  for(let y=0;y<c.height;y++)for(let x=start;x<end;x++)if(data[(y*c.width+x)*4+3]>120){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  if(right<left)throw new Error('Empty garment artwork');
  const result=[left,top,right-left+1,bottom-top+1];bounds.set(image,{...bounds.get(image),[region]:result});return result;
}
export async function composeParts(parts,loadImage){
  const key=equippedParts(parts).map(p=>p.id).join('|');
  if(figures.has(key))return figures.get(key);
  const selected=equippedParts(parts);
  const images=await Promise.all(selected.map(p=>p.asset?loadImage('./assets/'+p.asset):null));
  const base=await loadImage('./assets/parts-base-v1.png');
  const c=document.createElement('canvas');c.width=1024;c.height=1536;const cx=c.getContext('2d');
  cx.drawImage(base,0,0,c.width,c.height);
  cx.save();cx.globalCompositeOperation='destination-out';
  cx.fill(baseShorts);if(parts.top!=='top-tee'||parts.outer!=='outer-none')cx.fill(baseTee);cx.restore();
  if(parts.top==='top-tee'&&parts.outer!=='outer-none'){
    cx.save();cx.clip(underTee);cx.drawImage(base,0,0,1024,1536);cx.restore();
  }
  if(parts.shoes!=='shoes-flats')cx.clearRect(398,1405,226,131);
  for(const slot of ['shoes','bottom','top','outer']){
    const index=selected.findIndex(p=>p.slot===slot),part=selected[index],image=images[index];
    if(!image)continue;
    const rig=garmentRig(part.id);
    if(rig){
      const lerp=(a,b,t)=>a+(b-a)*t;
      // Smooth scanline interpolation avoids diagonal seams through knit/folds.
      for(let band=0;band<rig.source.length-1;band++){
        const from=rig.source[band],to=rig.source[band+1],a=rig.target[band],b=rig.target[band+1];
        const height=b[0][1]-a[0][1],sourceHeight=(to[0][1]-from[0][1])/height;
        for(let row=0;row<height;row++){
          const t=row/height,sy=lerp(from[0][1],to[0][1],t);
          for(let col=0;col<from.length-1;col++){
            const sx=lerp(from[col][0],to[col][0],t),ex=lerp(from[col+1][0],to[col+1][0],t);
            const dx=lerp(a[col][0],b[col][0],t),right=lerp(a[col+1][0],b[col+1][0],t);
            cx.drawImage(image,sx,sy,ex-sx,sourceHeight,dx,a[0][1]+row,right-dx+.3,1);
          }
        }
      }
    }else if(slot==='shoes'){
      for(const foot of ['left','right']){
        const placement=footwearPlacement(alphaBounds(image,foot),part.box,foot);
        cx.drawImage(image,...placement.source,...placement.target);
      }
    }else{
      const placement=uniformPlacement(alphaBounds(image),part.box);
      cx.drawImage(image,...placement.source,...placement.target);
    }
  }
  // Back collars sit behind the neck instead of forming an artificial choker.
  cx.save();cx.clip(frontNeck);cx.drawImage(base,0,0,1024,1536);cx.restore();
  // Hands must sit in front of sleeves; the cuff stops at the wrist rather than
  // covering fingers when outerwear and a long-sleeve top are worn together.
  cx.save();cx.beginPath();cx.rect(282,705,82,144);cx.rect(674,705,82,144);cx.clip();cx.drawImage(base,0,0,1024,1536);cx.restore();
  // Keep a bounded cache: 81 combinations need not occupy decoded memory forever.
  if(figures.size>=16)figures.delete(figures.keys().next().value);
  figures.set(key,c);return c;
}
export async function partPreview(part,loadImage){
  if(part.id==='outer-none')return null;
  const image=await loadImage('./assets/'+(part.asset||'parts-base-v1.png'));
  const crop=part.asset?alphaBounds(image):[part.crop[0],part.crop[1],part.crop[2]-part.crop[0],part.crop[3]-part.crop[1]];
  const c=document.createElement('canvas');c.width=220;c.height=160;const cx=c.getContext('2d');
  const scale=Math.min(196/crop[2],140/crop[3]);
  cx.drawImage(image,...crop,(220-crop[2]*scale)/2,(160-crop[3]*scale)/2,crop[2]*scale,crop[3]*scale);
  return c;
}
