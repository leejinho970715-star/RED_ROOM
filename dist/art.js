// Original 56-sprite pixel atlas. Rows are rarities, columns are equipment slots.
const ATLAS='./assets/pixel-robot-parts-v1.png';
// Alpha-connected sprite bounds, inspected from the unmodified 1340 x 1174 atlas.
const BOUNDS=[[[33,57,113,92],[42,194,96,139],[38,371,109,117],[27,550,130,89],[36,686,108,133],[39,854,104,126],[29,1027,130,107]],[[198,47,127,114],[200,207,125,121],[212,366,101,122],[197,519,130,132],[212,683,101,133],[200,847,123,132],[207,1010,111,134]],[[383,35,72,136],[388,191,69,147],[380,357,77,142],[376,516,83,141],[378,679,81,144],[387,842,69,142],[380,999,77,148]],[[550,35,73,136],[549,191,68,147],[549,357,77,142],[547,516,78,138],[547,679,82,144],[550,842,69,142],[549,998,77,149]],[[703,29,84,139],[703,191,84,141],[704,354,83,143],[703,519,89,138],[701,679,91,144],[709,842,80,142],[709,1000,79,150]],[[887,29,84,139],[888,191,83,141],[887,354,83,142],[882,518,89,139],[882,679,91,144],[885,842,80,142],[886,1001,80,149]],[[1040,38,110,120],[1034,196,122,136],[1026,378,138,110],[1029,525,132,132],[1038,679,118,152],[1026,849,139,135],[1029,1021,132,116]],[[1234,33,61,135],[1231,191,68,143],[1231,380,65,104],[1235,516,71,141],[1230,679,68,148],[1235,842,71,142],[1230,1006,76,138]]];
function sprite(slot,rarity,x=0,y=0,width=128,height=128,muted=false,fit='xMidYMid meet'){
 const [sx,sy,sw,sh]=BOUNDS[slot][rarity];
 return `<svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="${sx-1} ${sy-1} ${sw+2} ${sh+2}" preserveAspectRatio="${fit}" overflow="hidden" ${muted?'opacity=".18"':''} aria-hidden="true"><image href="${ATLAS}" width="1340" height="1174" style="image-rendering:pixelated"/></svg>`;
}
export function partArt(slot,rarity=0){
 return `<svg class="illustrated-part pixel-part" viewBox="0 0 128 128" data-art-medium="pixel-2d" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${sprite(slot,rarity)}</svg>`;
}
export function characterArt(parts,flipped=false){
 const get=(slot,x,y,width,height)=>sprite(slot,parts[slot]?.rarity??0,x,y,width,height,!parts[slot],'none');
 return `<svg class="pixel-character" viewBox="0 0 160 248" data-art-medium="pixel-2d" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="새로 디자인한 2D 픽셀 로봇 파츠로 조립된 생존자"><g ${flipped?'transform="translate(160 0) scale(-1 1)"':''}>${parts[6]?get(6,31,88,98,82):''}<path d="M74 74h12v16H74zM66 149h28v16H66z" fill="#343d4c"/>${get(4,39,156,38,78)}${get(5,84,156,38,78)}${get(2,17,89,34,84)}${get(3,109,89,34,84)}${get(1,49,84,62,72)}${get(0,48,20,64,58)}${parts[7]?get(7,130,133,14,35):''}</g></svg>`;
}
