# V1.6B asset provenance

Prepared November 10, 2026. Local only; not approved for commit or publication.

## Logo Option 1

- Original owner-provided app emblem: `drkrook/silent-compass-testing/beta-assets/ledovia-logo.svg`.
- Immutable source: https://github.com/drkrook/silent-compass-testing/blob/c94d7690fa5b70e3d75be2d38690e565c97cf67c/beta-assets/ledovia-logo.svg
- Original SVG SHA-256: `817a9b4fb1dfe1b88a33a1866ef3ecaf2a5ee3ed90de9020b7becba0bb9afe29`.
- Every original path d, group stroke width, linecap and linejoin is preserved. Only stroke/fill colors change; lockups add a parent placement transform and a separate wordmark. No app assets were modified.
- White variants: #FFFFFF; light-background variants: #113E41.
- Wordmark: LEDOVIA in DejaVu Sans Bold, converted to vector outlines using fontTools so exports do not depend on installed browser fonts. The app wordmark is styled text, not part of its emblem SVG. Typeface notice: WORDMARK-FONT-LICENSE.txt.
- SVG lockups: vertically stacked 400 × 240 viewBox, emblem centered above wordmark with more than 32.5 units of clear vertical separation; transparent PNG lockups: 800 × 480.
- Emblem-only SVGs and favicon: original 160 × 110 viewBox; PNG emblems: 320 × 220.
- PNG export used the already-installed Sharp transitive dependency; no package dependency or lockfile changes.

## Hero photograph

- Title: Moraine Lake 17092005. Valley of the Ten Peaks, Banff National Park, Canada.
- Photographer: Gorgo.
- Source page: https://commons.wikimedia.org/wiki/File:Moraine_Lake_17092005.jpg
- Download URL: https://upload.wikimedia.org/wikipedia/commons/c/c5/Moraine_Lake_17092005.jpg
- License: public domain (PD-self), released by the author; Commons metadata states attribution is not required. A visible credit and source link are included in the footer.
- Original JPEG SHA-256: `adb3041e3ac2de4cf3e7c3d186ea2c39a1a811b4a5fff4f888a6711579833d5f`.
- Source metadata snapshot: hero-source-metadata.json. Retrieved November 10, 2026.
- Changes: width-resizing and WebP encoding at quality 82 using existing Sharp; no compositing or generative edits. CSS applies the dark readability overlay.
- Responsive local widths: 640, 1024, 1600, 2000 pixels. No third-party image requests are needed at runtime.
- The photograph is scenic context, not a claim of product availability or field performance.
- The earlier original expedition.svg is retained, unmodified. It is no longer the hero image.

## Export checksums

- `public/brand/ledovia-emblem-teal.png` — SHA-256 `89a6781adf148925f1b3fa462b7d0953e559aa7fc017b6c654a240e17fcfe8c1`; 9,890 bytes.
- `public/brand/ledovia-emblem-teal.svg` — SHA-256 `b1509fa725cfa4175c871f3209090dd2c992ee6355df9b5fa8ee73b672b28e21`; 444 bytes.
- `public/brand/ledovia-emblem-white.png` — SHA-256 `d1c2de0994de46f8918a5a4c396d663846da23bf069ba83c6e8ebc59f890ba9e`; 8,255 bytes.
- `public/brand/ledovia-emblem-white.svg` — SHA-256 `33efd9e9add9d08440f0f3d9e5e1ede1efd07ede6dc280cf1c8451ad9c25a736`; 444 bytes.
- `public/brand/ledovia-logo-teal.png` — SHA-256 `9ba3539f5ef0e94eace116cb78a54f66e632007616cf477b17963e4bc7341241`; 24,539 bytes.
- `public/brand/ledovia-logo-teal.svg` — SHA-256 `50fd4be606a74f50fd6fd6e52d779fe9354bf07aa099f473a26fed03b978eff9`; 1,464 bytes.
- `public/brand/ledovia-logo-white.png` — SHA-256 `d93829f3c39c5c3c89fb5faaac19a3aff0b91769b13b142f5d3ddd9a856eb49c`; 19,750 bytes.
- `public/brand/ledovia-logo-white.svg` — SHA-256 `577e9a90f2e23e7a31e3364b67bd86fb5c980e5ae18eceddb5c66eac382ee576`; 1,464 bytes.
- `public/favicon.svg` — SHA-256 `b1509fa725cfa4175c871f3209090dd2c992ee6355df9b5fa8ee73b672b28e21`; 444 bytes.
- `public/images/moraine-lake-1024.webp` — SHA-256 `8694ad1261fb4f0bd821093ed59161c024189c11749c500db412c0bc8a2c8935`; 136,664 bytes.
- `public/images/moraine-lake-1600.webp` — SHA-256 `aa18d077221a745ad97ec6e679d569884a74525c39aa0ec6058a53dbb3efff88`; 282,038 bytes.
- `public/images/moraine-lake-2000.webp` — SHA-256 `c0dbddeb16bea8ecf7861ebb8a146f9cffb04b3d55c5708d32d245a7191f4540`; 402,820 bytes.
- `public/images/moraine-lake-640.webp` — SHA-256 `60f9b63407e6506fb0fbf4782e44553561c0584bd917e733b2844815385e626d`; 56,660 bytes.
