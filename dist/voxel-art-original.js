// Preserved original artwork; the active renderer now uses 2D illustration.
const shade=(hex,f)=>{const n=parseInt(hex.replace('#',''),16);return '#'+[n>>16,n>>8&255,n&255].map(v=>Math.min(255,Math.max(0,Math.round(v*f))).toString(16).padStart(2,'0')).join('');};
export function partArt(slot,rarity=0){
 const color=['#758392','#8b9e7c','#6595ae','#7e8bb3','#bb9773','#a588ba','#b9786c'][rarity];
 let shapes='';
 const box=(x,y,w,h,d,c=color)=>{shapes+=`<path fill="${shade(c,1.25)}" d="M${x} ${y}l${d} ${-d*.6}h${w}l${-d} ${d*.6}z"/><path fill="${shade(c,.62)}" d="M${x+w} ${y}l${d} ${-d*.6}v${h}l${-d} ${d*.6}z"/><path fill="${c}" d="M${x} ${y}h${w}v${h}h${-w}z"/>`;};
 if(slot===0){box(25,31,53,43,20);box(23,30,57,8,21,shade(color,1.05));box(31,45,40,19,4,'#2b323a');box(34,48,15,8,2,'#7fa9aa');box(53,48,14,8,2,'#647e81');box(43,63,15,7,4,'#4d5153');box(25,69,8,7,7);box(69,69,8,7,7);}
 else if(slot===1){box(31,26,44,8,17,'#3a4652');box(22,37,61,42,18);box(18,35,18,13,17,shade(color,1.1));box(71,35,17,13,17,shade(color,1.1));box(28,48,49,11,5,shade(color,.8));box(30,63,14,12,3,'#4f6271');box(54,63,14,12,3,'#4f6271');box(44,42,10,6,3,'#b27958');}
 else if(slot===2||slot===3){box(40,25,28,20,18);box(44,45,20,16,13,'#434e5d');box(34,60,32,26,20,shade(color,1.06));box(33,73,34,8,20,'#845555');box(36,85,10,9,12,'#505965');box(51,85,11,9,12,'#505965');}
 else if(slot===4||slot===5){box(41,22,28,35,20);box(43,54,22,11,17,'#414b57');box(39,66,29,17,19);box(31,83,39,13,25,'#536477');box(31,96,39,4,25,'#343b43');box(43,68,18,5,3,'#b38965');}
 else if(slot===6){box(29,26,47,56,24);box(37,35,30,37,7,'#4d6168');box(42,41,20,12,4,'#72a5a0');box(25,36,8,39,7,'#3d4f58');box(71,36,8,39,7,'#3d4f58');box(40,73,21,11,6,'#87725e');}
 else{box(37,39,36,38,22);box(31,46,13,23,10,'#4b525e');box(49,47,16,21,5,'#ba6553');box(53,50,9,13,2,'#f79573');box(45,24,5,16,6,'#6c7889');box(45,20,5,5,6,'#d9957c');box(43,76,24,8,10,'#3a4653');}
 return `<svg viewBox="0 0 120 110" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">${shapes}</svg>`;
}
