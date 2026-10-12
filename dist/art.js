import {RARITIES} from './game.js';
const ATLAS='./assets/survivor-atlas-cutout.png';
let serial=0;
const HEADS=[
 'M194 31 C153 30 127 56 112 78 L77 162 L70 214 L91 250 L128 272 L164 268 L202 277 L248 270 L282 264 L319 246 L334 222 L314 176 L282 77 Q243 32 194 31Z',
 'M195 40 C148 39 118 63 95 100 L77 139 L75 202 L90 237 L117 262 L164 277 L231 271 L270 255 L299 270 L311 247 L294 205 L288 132 Q276 42 195 40Z',
 'M194 39 Q147 41 118 61 L110 66 L85 73 L81 93 L59 106 L72 139 L61 151 L81 174 L83 197 Q112 252 161 269 L221 269 Q273 249 296 200 L307 170 L317 153 L304 131 L313 105 L296 88 L279 65 Q252 38 194 39Z',
 'M191 37 C136 38 91 61 76 103 L74 118 L57 127 L57 184 L77 199 C96 250 139 274 192 274 C249 274 288 248 307 198 L324 180 L324 128 L306 116 C289 67 250 38 191 37Z',
 'M193 8 L239 38 L313 29 L288 87 L311 123 L292 172 L266 212 L219 240 L171 240 L121 218 L91 176 L78 137 L96 89 L89 30 L147 41Z',
 'M191 8 L250 42 L279 84 L316 145 L329 175 L307 210 L281 218 L259 250 L215 269 L175 264 L133 248 L108 218 L85 202 L64 178 L55 157 L98 86 L137 41Z',
 'M191 18 C139 18 110 34 87 80 L79 98 L70 103 L70 159 L84 175 Q91 213 132 239 L175 250 L230 247 Q282 234 299 190 L310 169 L318 153 L318 109 L307 96 Q287 22 191 18Z'
];
const BODY='M143 259 Q116 267 105 286 L130 307 L130 345 L124 368 Q190 386 261 367 L255 306 L279 286 Q266 270 244 260 Q191 277 143 259Z';
const LEFT_ARM='M112 281 Q94 287 86 314 L78 344 L72 371 L78 390 L95 405 L111 399 L125 378 L129 343 L137 311Z';
const RIGHT_ARM='M267 281 Q288 288 296 314 L303 344 L310 371 L303 393 L291 405 L273 399 L259 380 L254 343 L247 311Z';
const LEFT_LEG='M139 361 L185 370 L184 423 L177 453 L178 472 L167 486 Q137 498 111 485 L115 468 L129 439 L125 410Z';
const RIGHT_LEG='M199 370 L247 361 L255 410 L250 440 L265 469 L269 486 Q240 498 214 486 L205 473 L207 452 L198 421Z';
const BACKPACK='M129 272 Q124 252 143 250 L240 250 Q259 254 258 273 L260 366 Q256 380 239 381 L144 381 Q125 379 125 362Z';
const GEAR='M155 285 Q155 277 164 277 H214 Q225 277 225 287 V322 Q225 333 215 333 H164 Q155 333 155 323Z';
const PATHS=[null,BODY,LEFT_ARM,RIGHT_ARM,LEFT_LEG,RIGHT_LEG,BACKPACK,GEAR];
const VIEWS=['50 0 290 285','91 255 203 130','65 275 86 138','238 275 84 138','104 350 86 150','195 350 86 150','114 235 157 159','146 265 89 80'];
function imageLayer(slot,rarity,muted=false){
 const col=rarity%4,row=Math.floor(rarity/4),id=`illustration-mask-${serial++}`,path=slot===0?HEADS[rarity]:PATHS[slot];
 const transform=slot===0?(rarity>=4?'translate(0 16)':rarity===2?'translate(0 4)':''):'';
 return `<g ${transform?`transform="${transform}"`:''} ${muted?'opacity=".23"':''}><defs><clipPath id="${id}"><path d="${path}"/></clipPath></defs><g clip-path="url(#${id})"><image href="${ATLAS}" x="${-col*384}" y="${-row*512}" width="1536" height="1024" preserveAspectRatio="none"/></g></g>`;
}
export function partArt(slot,rarity=0){
 const border=RARITIES[rarity].color;
 const extra=slot===6?`<path d="${BACKPACK}" fill="#171d27" stroke="${border}" stroke-width="7"/><path d="M118 272v81M267 272v81" stroke="${border}" stroke-width="8"/>`:slot===7?`<path d="${GEAR}" fill="#202833" stroke="${border}" stroke-width="5"/>`:'';
 return `<svg class="illustrated-part" viewBox="${VIEWS[slot]}" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${extra}${imageLayer(slot,rarity)}</svg>`;
}
export function characterArt(parts,flipped=false){
 const get=slot=>imageLayer(slot,parts[slot]?.rarity??0,!parts[slot]);
 const shadow='<ellipse cx="192" cy="492" rx="100" ry="11" fill="#060a12" opacity=".65"/><ellipse cx="192" cy="493" rx="102" ry="17" fill="none" stroke="#796657" stroke-width="1.5" opacity=".65"/>';
 return `<svg viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="장착한 2D 일러스트 파츠로 조립된 생존자">${shadow}<g ${flipped?'transform="translate(384 0) scale(-1 1)"':''}>${parts[6]?`<path d="M116 281 Q96 277 92 299 L87 351 Q86 371 118 372 L133 363 V289Z" fill="${RARITIES[parts[6].rarity].color}" stroke="#10141d" stroke-width="4"/>`:''}${get(4)}${get(5)}${get(1)}${get(2)}${get(3)}${get(0)}${parts[7]?get(7):''}</g></svg>`;
}
