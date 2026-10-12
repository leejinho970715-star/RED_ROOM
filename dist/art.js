import {RARITIES} from './game.js';
const ATLAS='./assets/original-survivors-v3.png';
let serial=0;
const HEADS=[
 'M192 7Q142 7 101 38L93 54L107 77L99 96L82 108L67 133L66 184L83 213L102 228Q146 253 195 255Q269 252 296 213L312 208L328 186L336 154L327 126L310 112L297 103L286 79L304 56L306 35Q269 7 192 7Z',
 'M96 24L83 57L72 90L72 124L52 136L47 160L60 181L76 185L80 216Q81 237 113 242L251 242Q287 233 296 219L300 190L313 177L312 145L300 127L288 79Q282 49 249 46L239 38L158 38L138 45L111 53L110 25Z',
 'M190 39Q112 39 76 117L61 127L57 149L62 180L79 189Q93 237 155 242L235 243Q283 224 294 191L308 177L309 141L299 127Q281 40 190 39Z',
 'M193 34Q107 32 78 109L69 119L62 120L52 140L53 183L68 204L88 210Q108 257 189 263Q273 257 294 211L309 205L314 181L314 144L303 126L291 119Q273 36 193 34Z',
 'M180 14L145 22L125 18L112 33Q90 49 82 79L77 92L67 96L56 116L57 150L72 164L88 171Q105 211 178 215Q253 218 278 177L295 168L306 148L306 115L296 97L282 91Q266 28 224 20L210 13Z',
 'M190 10Q111 10 79 83L66 84L48 101L44 133L56 159L75 166Q92 215 159 224L214 225Q274 213 291 168L314 155L327 128L322 99L310 85L295 79Q273 13 190 10Z',
 'M190 9Q112 9 80 84L72 86L59 100L54 128L60 156L75 173L91 179Q108 211 171 222L221 218Q272 207 289 174L311 160L314 134L305 106L291 91Q268 12 190 9Z'
];
const BODY='M152 240L127 252L117 272L119 307L129 324L126 356L120 378Q190 393 265 378L258 350L255 313L267 284L260 258L238 243Z';
const LEFT_ARM='M128 254Q104 256 97 283L90 312L77 329L73 351L71 379L80 403L100 408L113 397L119 378L131 349L133 327L148 303Z';
const RIGHT_ARM='M252 254Q278 262 285 289L293 318L308 337L322 369L326 391L310 407L292 410L278 392L275 373L256 353L253 327L242 301Z';
const LEFT_LEG='M131 365L190 373L183 427L171 443L179 476L174 499Q137 510 103 500L103 483L113 463L129 443L122 419Z';
const RIGHT_LEG='M197 373L257 368L274 418L262 442L285 476L294 497Q259 511 218 500L214 484L222 450L200 428Z';
const BACKPACK='M129 272 Q124 252 143 250 L240 250 Q259 254 258 273 L260 366 Q256 380 239 381 L144 381 Q125 379 125 362Z';
const GEAR='M155 285 Q155 277 164 277 H214 Q225 277 225 287 V322 Q225 333 215 333 H164 Q155 333 155 323Z';
const PATHS=[null,BODY,LEFT_ARM,RIGHT_ARM,LEFT_LEG,RIGHT_LEG,BACKPACK,GEAR];
const VIEWS=['40 0 305 270','110 235 166 164','63 252 90 165','237 252 96 165','95 355 103 157','192 355 110 157','114 235 157 159','146 265 89 80'];
function accessory(slot,rarity){
 const color=RARITIES[rarity].color,accent=['#cc916d','#b9c993','#83e4d2','#ef8bd3','#ec874e','#bded47','#70f0f2'][rarity];
 if(slot===6)return `<g stroke="#10131b" stroke-width="4" stroke-linejoin="round"><path d="M48 41V25q0-13 15-13h35q15 0 15 13v16" fill="none" stroke="${color}" stroke-width="9"/><path d="M36 40Q31 30 22 36L15 113q0 15 25 12M118 40q11-10 19-3l8 79q0 14-25 13" fill="#303945"/><path d="M42 25q-14 0-14 16v84q0 20 20 20h69q17 0 17-20V43q0-18-20-18Z" fill="${color}"/><path d="M43 37h74v37H43Z" fill="#242d3a"/><path d="M43 40h74v12H43Z" fill="${accent}" stroke-width="2"/><path d="M49 88h59q12 0 12 13v24q0 9-11 9H49q-10 0-10-11V101q0-13 10-13Z" fill="#343e4b"/><path d="M58 78v23h13V78M92 78v23h13V78" fill="#d2d0bf"/><path d="M43 31v34M32 113v21M126 45v47" stroke="#ffffff" stroke-opacity=".22" stroke-width="3"/><circle cx="80" cy="118" r="8" fill="${accent}"/>${rarity>=5?`<path d="M80 109l4 7h-8z" fill="#e8ecd8" stroke="none"/>`:''}</g>`;
 return `<g stroke="#10131b" stroke-width="4" stroke-linejoin="round"><path d="M51 47V17q0-5 7-5h5v35" fill="#596571"/><path d="M101 47V29h9v18" fill="#596571"/><path d="M34 41q0-10 13-10h66q12 0 12 10v89q0 14-14 14H47q-13 0-13-14Z" fill="${color}"/><path d="M43 47h73v43H43Z" fill="#172331"/><path d="M49 55h61v24H49Z" fill="${accent}" stroke-width="2"/><path d="M58 64h9l4-5 7 13 6-9h13" fill="none" stroke="#effce9" stroke-width="2"/><circle cx="51" cy="111" r="7" fill="#d6dfd8"/><circle cx="105" cy="111" r="7" fill="${accent}"/><path d="M69 104h17v5H69zM69 114h17v5H69zM52 133h56" fill="#323c49" stroke-width="2"/><path d="M39 43v69" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2"/></g>`;
}
function imageLayer(slot,rarity,muted=false){
 const col=rarity%4,row=Math.floor(rarity/4),id=`illustration-mask-${serial++}`,path=slot===0?HEADS[rarity]:PATHS[slot];
 const transform=slot===0&&rarity>=4?'translate(0 24)':'';
 return `<g ${transform?`transform="${transform}"`:''} ${muted?'opacity=".23"':''}><defs><clipPath id="${id}"><path d="${path}"/></clipPath></defs><g clip-path="url(#${id})"><image href="${ATLAS}" x="${-col*384}" y="${-row*512}" width="1536" height="1024" preserveAspectRatio="none"/></g></g>`;
}
export function partArt(slot,rarity=0){
 if(slot>=6)return `<svg class="illustrated-part" viewBox="0 0 160 160" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${accessory(slot,rarity)}</svg>`;
 const border=RARITIES[rarity].color;
 const extra=slot===6?`<path d="${BACKPACK}" fill="#171d27" stroke="${border}" stroke-width="7"/><path d="M118 272v81M267 272v81" stroke="${border}" stroke-width="8"/>`:slot===7?`<path d="${GEAR}" fill="#202833" stroke="${border}" stroke-width="5"/>`:'';
 return `<svg class="illustrated-part" viewBox="${VIEWS[slot]}" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${extra}${imageLayer(slot,rarity)}</svg>`;
}
export function characterArt(parts,flipped=false){
 const get=slot=>imageLayer(slot,parts[slot]?.rarity??0,!parts[slot]);
 const shadow='<ellipse cx="192" cy="492" rx="100" ry="11" fill="#060a12" opacity=".65"/><ellipse cx="192" cy="493" rx="102" ry="17" fill="none" stroke="#796657" stroke-width="1.5" opacity=".65"/>';
 return `<svg viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="장착한 2D 일러스트 파츠로 조립된 생존자">${shadow}<g ${flipped?'transform="translate(384 0) scale(-1 1)"':''}>${parts[6]?`<g transform="translate(58 256) scale(.62)">${accessory(6,parts[6].rarity)}</g>`:''}${get(4)}${get(5)}${get(1)}${get(2)}${get(3)}${get(0)}${parts[7]?`<g transform="translate(202 278) scale(.34)">${accessory(7,parts[7].rarity)}</g>`:''}</g></svg>`;
}
