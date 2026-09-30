# Mello Vibes Games

The home page for all the Mello Vibes browser games: one place to find them, each card linking out to the live game.

| Game | Live URL | Source |
|---|---|---|
| Bonk Brawl | https://bonkbrawl.vercel.app | [bonkbrawl](https://github.com/313imverymellodet/bonkbrawl) |
| City Rush | https://cityrush-pearl.vercel.app | [cityrush](https://github.com/313imverymellodet/cityrush) |
| Order Up! | https://orderup-three.vercel.app | [orderup](https://github.com/313imverymellodet/orderup) |
| ORBYT | https://orbyt-wine.vercel.app | [orbyt](https://github.com/313imverymellodet/orbyt) |
| Grave Shift | https://graveshift.vercel.app | [graveshift](https://github.com/313imverymellodet/graveshift) |
| Space Diner | https://spacediner.vercel.app | [spacediner](https://github.com/313imverymellodet/spacediner) |

It's a plain static site with no framework, no dependencies and no build step beyond stamping the share-card URL.

## Layout
```
public/                 everything that gets deployed
  index.html            the page (styles and the small script are inline)
  games/<id>/           cover.webp (1200×630 key art) + icon.webp for each game
  og.png                link-preview card for the hub itself
  icon-192.png, icon-512.png, manifest.webmanifest
art/                    HTML sources for og.png and the icons
tools/finalize.mjs      Vercel build step: fills __SITE_URL__ in the OG tags
vercel.json             serves public/, cache headers
```

## Deploy to Vercel
**From GitHub (recommended):** in Vercel choose **Add New → Project**, import `mellovibesgames`, and click Deploy. Leave the settings as they are, because `vercel.json` already sets the output folder and build command. After that, every push to `main` redeploys.

**From the CLI:** `npx vercel --prod` from this folder.

## Run locally
```bash
npx serve public
```

## Add a new game
1. Put its art in `public/games/<id>/`:
   - `cover.webp`: the game's `og.png` (1200×630) converted to WebP.
   - `icon.webp`: 160×160.
2. In `public/index.html`, copy one of the `<a class="card">` blocks and change:
   - `data-id`, `href` and the `--c` accent color
   - the image paths
   - the name, genre, pitch and tags
3. Update the stats line in the hero ("6 games", "4 with online multiplayer") and the grid in `art/og.html`, then re-render `og.png`.

The **NEW** badge is just a `<span class="badge">New</span>` inside a card's `.art` block. Move it to whichever game is newest.

## Re-rendering the share card and icons
Open `art/og.html` (1200×630) or `art/icon.html` (512×512) in Chrome and screenshot it at exactly that size. Save the results as `public/og.png` and `public/icon-512.png` / `icon-192.png`.

The share card uses the Rubik font from Google Fonts, so render it while online.
