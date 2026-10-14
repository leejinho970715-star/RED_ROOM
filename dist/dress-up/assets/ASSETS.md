# Seoul Studio artwork and music

All nineteen PNGs were generated using the built-in ImageGen tool for this project. They are original realistic 3D-style illustrations; no real celebrity likeness or supplied reference artwork was used. The eighteen character images share the same fictional Korean adult woman, age 24. Original PNG alpha is preserved. The game composites these illustrations; it does not expose a rotatable 3D character mesh.

Saved assets: `everyday-v1.png`, `office-v1.png`, `evening-v1.png`, `sport-v1.png`, `date-v1.png`, `hanbok-v1.png`, `studio-v1.png`. Each image is 1024 × 1536. The character PNGs have transparent outside corners. No generated output was left referenced outside the repository.

## Final prompt: everyday character

Use case: stylized-concept. Asset type: high-resolution transparent full-body character cutout for a realistic 3D-illustration dress-up game. Original fictional Korean adult woman age 24, Seoyun, no likeness to a real celebrity. Premium very realistic CGI fashion illustration, lifelike proportions and face, finely detailed skin, smooth non-pixel materials, realistic fabric knit and denim, natural studio photography lighting. Long dark brown hair with gentle waves, natural makeup, warm composed expression. Full body from crown to soles centered, standing upright in a relaxed frontal fashion-catalog pose, arms slightly away from torso, hands empty. Wearing modest lavender fitted crewneck knit sweater tucked into blue straight-leg jeans and ivory sneakers, simple small earrings. Height occupies 88% of a portrait image, equal comfortable negative margins around all limbs, shoes fully visible, front view at eye level, soft studio lighting from upper left. Keep natural adult anatomy, not chibi, no anime, no pixel art, no text, no logos, no watermark, no background, genuine transparent alpha.

## Final prompt: studio background

Use case: stylized-concept. Asset type: portrait fashion dress-up game room background, realistic high-end 3D architectural illustration. An elegant contemporary Seoul personal dressing studio, softly lit cream plaster walls, warm oak floor, large softly arched niche in the center and subtle molding, a full-height mirror off to the left, neatly arranged pale tailored jackets and garments on a refined rail far to the right, a small cream upholstered bench at the right edge, warm diffused morning window light from upper left, restrained lavender accent vase. The CENTER is an empty uncluttered floor space to composite a full-body fashion model, no person, no mannequin. Architectural straight-on eye-level camera, portrait composition, believable perspective, polished realistic materials and fabric, calm editorial luxury, photo-realistic rendered illustration, no pixel art, no words or logos, no watermark.

## Final clothing edits

Each variant used `everyday-v1.png` as the edit target, with this common prompt and one exact clothing specification below:

Use case: identity-preserve. Asset type: transparent full-body cutout for a realistic 3D-illustration dress-up game. The supplied image is the EDIT TARGET, an original fictional Korean adult woman age 24. Change ONLY her clothing and footwear to: [CLOTHING]. Preserve exactly the same adult woman face, facial features, skin tone, dark brown wavy hairstyle, head scale, body proportions, neutral expression, standing pose, hand positions, frontal camera and full-body framing with both shoes in frame. Keep 1024 by 1536 portrait framing and the same face position. Premium lifelike 3D CGI illustration and realistic fabric, not pixel art or anime. Remove background and surrounding haze/glow; genuine transparent alpha outside the character, no black backdrop, no scene, no text, no logos, no watermark. Keep a single full-body person only.

- Office: Ivory tailored blazer over a pale blue modest crew-neck blouse, black tailored full-length trousers, black low block heel loafers. Office chic with believable wool suiting, crisp lapels and pocket stitching.
- Evening: Elegant modest black midi dress with short sleeves and a square neckline, hem below knees, softly flared skirt, delicate gold waist belt, black closed-toe low heels. Evening dinner fashion, fine textured matte fabric.
- Sport: Soft sage green relaxed hoodie with full sleeves, matching sage jogger trousers, cream athletic sneakers. Comfortable athleisure with realistic cotton folds, fully clothed.
- Date: Dusty rose buttoned cardigan over a white crew-neck top, ivory below-knee pleated midi skirt and beige low block heel shoes. Gentle cafe date styling with fine knit and realistic pleats.
- Hanbok: Elegant contemporary Korean hanbok: pale lilac jeogori with white collar and dark plum ribbon, full flowing ivory chima skirt reaching ankles, simple cream flat shoes peeking below. Modest original modern hanbok with realistic silk texture and folds.

## Original BGM

`seoul-afterglow-v1.wav`: Seoul Afterglow, 48-second stereo PCM loop, 80 BPM, 22050 Hz, 16-bit. Generated deterministically by `scripts/generate-studio-bgm.mjs` using synthesized electric-piano voicings, sine bass, bell melody and brushed percussion. No external audio samples. Maximum signal normalized to 0.66; loop boundaries fade to zero. BGM begins after a trusted user gesture, supports volume/mute and pauses when hidden. Short UI and runway tones are synthesized in `audio.js`.

## Additional 12 outfit images

The wardrobe was expanded from six to eighteen outfits. New saved files are `trench-v1.png`, `leather-v1.png`, `stripe-v1.png`, `shirt-v1.png`, `teal-v1.png`, `gala-v1.png`, `winter-v1.png`, `tweed-v1.png`, `linen-v1.png`, `overalls-v1.png`, `bomber-v1.png`, `preppy-v1.png`.

Built-in ImageGen edits used the same original everyday character as their edit target. Final shared prompt:

Use case: identity-preserve. Asset type: transparent full-body cutout for a realistic 3D-illustration dress-up game. The supplied image is the EDIT TARGET, an original fictional Korean adult woman age 24. Change ONLY her clothing and footwear to: [CLOTHING]. Preserve exactly the same adult woman face, facial features, skin tone, dark brown wavy hairstyle, head scale, body proportions, neutral expression, standing pose, hand positions, frontal camera and full-body framing with both shoes in frame. Keep 1024 by 1536 portrait framing and the same face position. Premium lifelike 3D CGI illustration and realistic fabric, not pixel art or anime. Genuine transparent alpha outside the character, no black backdrop, no scene, no text, no logos, no watermark. Keep a single full-body person only.

Exact clothing specifications:

- Trench: Classic warm beige belted trench coat worn open over a cream crewneck top and medium blue straight-leg jeans, tan ankle boots. Realistic gabardine fabric, lapels, buttons and tied belt at the back. Chic city autumn outfit.
- Leather: Black leather biker jacket over a plain white crewneck T-shirt, charcoal slim straight jeans and black chunky ankle boots. Realistic polished leather, silver zipper hardware, fully clothed urban rocker style, no logos.
- Stripe: Navy-and-ivory horizontally striped relaxed knit sweater, ivory wide-leg tailored full-length pants and navy loafers. Clean nautical everyday styling, realistic knit texture and flowing trouser folds.
- Shirt: Pale sky-blue buttoned collared shirt tucked into a beige below-knee straight midi skirt, dark brown thin belt and cream low block heel shoes. Modest tidy classic city styling, natural shirt fabric.
- Teal: Deep teal modest wrap-style midi dress with elbow-length sleeves, covered neckline and gently flared below-knee skirt, beige pumps. Elegant realistic crepe fabric with subtle drape, original tasteful dinner look.
- Gala: Burgundy floor-length evening gown with a modest boat neckline, long sleeves, elegant fitted bodice and flowing A-line skirt, black low heels just visible beneath the hem. Fine realistic satin fabric, refined formal occasion, no deep cleavage.
- Winter: Camel wool overcoat worn open over an ivory turtleneck knit and charcoal straight-leg tailored pants, chocolate brown boots. Cozy winter city fashion, realistic thick wool texture and folded coat lapels.
- Tweed: Pale pastel blue short tweed jacket with small pearl-like buttons over a cream blouse, matching modest knee-length tweed A-line skirt, cream loafers. Refined original boutique outfit with realistic woven tweed texture, no designer logos.
- Linen: White relaxed short-sleeve linen buttoned shirt and warm sand high-waisted flowing wide-leg linen trousers, woven brown flat sandals and simple brown rope belt. Airy resort style with realistic linen wrinkles and texture, fully clothed.
- Overalls: Medium-indigo full-length denim dungaree overalls over a plain ivory short-sleeve T-shirt, white low-top canvas sneakers. Playful everyday casual fashion, realistic denim pocket stitching and brass buckles.
- Bomber: Muted slate gray relaxed bomber jacket over an ivory crewneck top, olive green full-length cargo trousers and cream chunky sneakers. Original urban utility style with practical pockets, smooth realistic nylon and cotton materials.
- Preppy: Soft forest-green cable-knit cardigan over a plain white collared shirt, navy below-knee pleated midi skirt, dark brown loafers. Cozy academic preppy fashion, realistic cable knit and crisp skirt pleats, modest natural adult proportions.
