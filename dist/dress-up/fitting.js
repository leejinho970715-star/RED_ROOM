// Registration on the 1024×1536 adult base illustration. The head and body
// are never rescaled independently: garments fit the existing anatomy.
export const BODY_ANCHORS={neckY:250,shoulderY:278,waistY:540,wristY:715,ankleY:1395,centerX:515};

// Product cutouts have longer sleeves than bodices. A bounding-box transform
// incorrectly places the hem at the wrist; these grids register both at once.
const TOP_TARGET=[
  [[340,245],[450,245],[582,245],[690,245]],
  [[340,310],[400,310],[632,310],[690,310]],
  [[329,410],[403,410],[629,410],[704,410]],
  [[307,540],[415,540],[622,540],[727,540]],
  [[296,715],[348,715],[681,715],[735,715]]
];
const sources={
  'top-knit':{y:[230,400,650,1090,1310],x:[[140,350,685,884],[130,290,748,894],[95,277,747,929],[41,250,773,983],[20,130,894,1005]]},
  'top-shirt':{y:[208,400,650,1140,1340],x:[[140,350,685,884],[130,290,748,894],[95,277,747,929],[41,250,773,983],[20,130,894,1005]]},
  'outer-blazer':{y:[178,400,650,1120,1285],x:[[140,350,685,884],[130,290,748,894],[95,277,747,929],[41,250,773,983],[10,150,874,1014]],targetY:[245,310,410,640,715]},
  'outer-cardigan':{y:[215,400,650,1110,1300],x:[[140,350,685,884],[130,290,748,894],[95,277,747,929],[41,250,773,983],[20,150,874,1005]],targetY:[245,310,410,640,715]}
};
export function garmentRig(id){
  if(id==='bottom-pleated')return {
    source:[[[345,245],[678,245]],[[285,465],[740,465]],[[65,1320],[959,1320]]],
    target:[[[410,533],[634,533]],[[382,700],[662,700]],[[320,1090],[710,1090]]]
  };
  const rig=sources[id];if(!rig)return null;
  const source=rig.x.map((row,r)=>row.map(x=>[x,rig.y[r]]));
  const target=TOP_TARGET.map((row,r)=>row.map(([x,y])=>[x,rig.targetY?.[r]??y]));
  return {source,target};
}
export function uniformPlacement(sourceBounds,box){
  const [sx,sy,sw,sh]=sourceBounds,[left,top,right,bottom]=box;
  // Height registers ankles/soles; a single scale preserves fabric and shoe shape.
  const scale=(bottom-top)/sh,width=sw*scale;
  return {source:[sx,sy,sw,sh],target:[(left+right-width)/2,top,width,bottom-top],scale};
}
export function footwearPlacement(sourceBounds,box,foot){
  const placed=uniformPlacement(sourceBounds,box),center=foot==='left'?464:558;
  placed.target[0]=center-placed.target[2]/2;
  return placed;
}
