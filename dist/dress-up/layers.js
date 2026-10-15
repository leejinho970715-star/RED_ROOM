import {equippedParts} from './parts.js';
const figures=new Map(),bounds=new WeakMap();
// These masks describe only the base tee and shorts. Keeping skin/hair/hands
// outside the clothing layers prevents an old garment from peeking through.
const baseTee=new Path2D('M340 289 Q380 256 456 249 Q510 302 580 249 Q650 255 690 288 L694 377 L672 391 L632 377 L626 466 L620 533 Q520 552 417 534 L409 466 L401 378 L355 391 L342 375 Z');
const baseShorts=new Path2D('M417 533 Q518 542 621 532 L650 613 L660 779 L379 779 L374 650 Z');
function alphaBounds(image){
  if(bounds.has(image))return bounds.get(image);
  const c=document.createElement('canvas');c.width=image.width;c.height=image.height;
  const cx=c.getContext('2d',{willReadFrequently:true});cx.drawImage(image,0,0);
  const data=cx.getImageData(0,0,c.width,c.height).data;
  let left=c.width,top=c.height,right=-1,bottom=-1;
  for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(data[(y*c.width+x)*4+3]>120){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  if(right<left)throw new Error('Empty garment artwork');
  const result=[left,top,right-left+1,bottom-top+1];bounds.set(image,result);return result;
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
  cx.fill(baseShorts);if(parts.top!=='top-tee')cx.fill(baseTee);cx.restore();
  for(const slot of ['shoes','bottom','top','outer']){
    const index=selected.findIndex(p=>p.slot===slot),part=selected[index],image=images[index];
    if(!image)continue;
    const [x1,y1,x2,y2]=part.box;
    const [sx,sy,sw,sh]=alphaBounds(image),width=x2-x1,height=y2-y1;
    // Match shoulder/waist anchors as well as cuffs and hems. Catalogue cutouts
    // are wider at their hems; a single uniform scale would leave the base tee
    // or shorts visible around narrower shoulders and skirt waistbands.
    for(let row=0;row<height;row++){
      const t=row/height;
      const expand=part.slot==='top'||part.slot==='outer'?1+.25*Math.max(0,1-t/.78):part.id==='bottom-pleated'?1+.68*Math.max(0,1-t/.68):part.slot==='bottom'?1+.08*Math.max(0,1-t/.3):1;
      const dw=width*expand,dx=x1+(width-dw)/2;
      cx.drawImage(image,sx,sy+t*sh,sw,sh/height,dx,y1+row,dw,1);
    }
  }
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
