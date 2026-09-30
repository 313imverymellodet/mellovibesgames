# Mello Vibes Games

The home for all the Mello Vibes browser games. It's a single-page showcase with a playable demo, an interactive fighter-select screen and a look under the hood. Every card links out to the live game.

| Game | Live | Source |
|---|---|---|
| Bonk Brawl | https://bonkbrawl.vercel.app | [bonkbrawl](https://github.com/313imverymellodet/bonkbrawl) |
| City Rush | https://cityrush-pearl.vercel.app | [cityrush](https://github.com/313imverymellodet/cityrush) |
| Order Up! | https://orderup-three.vercel.app | [orderup](https://github.com/313imverymellodet/orderup) |
| ORBYT | https://orbyt-wine.vercel.app | [orbyt](https://github.com/313imverymellodet/orbyt) |
| Grave Shift | https://graveshift.vercel.app | [graveshift](https://github.com/313imverymellodet/graveshift) |
| Space Diner | https://spacediner.vercel.app | [spacediner](https://github.com/313imverymellodet/spacediner) |

## What's on the page
- **Attract-mode hero.** An arcade-cabinet carousel cycles through the games.
  - Each slide frames a real screenshot in a browser window or phone, with 3D renders from the game popping out of the frame. The renders shift with the pointer.
  - The whole page's accent color eases to the active game's color, using a registered `@property`.
  - The rotation timer *is* the progress bar's CSS animation, so hovering, focusing, pausing and scrolling off-screen all pause it for free.
  - The ORBYT slide runs the live mini-game on autopilot.
- **The lineup.** Filterable cards, animated with View Transitions, with a 3D tilt and a glare that follows the pointer. Each card has a "How to play" sheet built on native `<dialog>` with a controls table for every game.
- **Fighter select.** The Bonk Brawl roster, using the stats straight from `Defs.cs`. It's a keyboard-navigable radio group with animated stat bars.
- **Playable ORBYT.** An under-300-line canvas remake of ORBYT's core loop (`js/orbyt.js`): perfects, combos and direction flips every 25 points, with your best score saved locally.
- **Under the hood.** An animated rollback-netcode timeline, a synthwave riff generated live with Web Audio (`js/synth.js`), a chart of real build sizes, and notes on multiplayer and anti-cheat.

All the content lives in **`public/js/data.js`**, the single source of truth. Every section renders from it, and the build step reads it too.

It has no framework and no dependencies. It's plain HTML, CSS and ES modules.

## Layout
```
public/
  index.html              page shell and static copy
  css/site.css            design tokens → components → sections
  js/data.js              games, filters, fighters, build sizes
  js/main.js              hero, lineup, sheet, roster, demo, bento, reveal
  js/orbyt.js             the mini-game engine (also runs the hero's ORBYT slide)
  js/synth.js             Web Audio riff (loaded on demand)
  games/<id>/             cover.webp (key art) + icon.webp
  shots/                  gameplay screenshots
  cast/                   transparent 3D renders (fighters, cars, food)
  og.png, icon-*.png, manifest.webmanifest
art/                      HTML sources for og.png and the icons
tools/
  finalize.mjs            Vercel build step: stamps the site URL, prerenders JSON-LD + <noscript> from data.js
  build-assets.mjs        regenerates games/, shots/ and cast/ from the game repos
vercel.json               serves public/, cache headers
```

## Deploy to Vercel
**From GitHub (recommended):** in Vercel choose **Add New → Project**, import this repo and click Deploy. `vercel.json` already sets the output folder and build command, and every push redeploys.

**From the CLI:** run `npx vercel --prod` in this folder.

## Run locally
```bash
npx serve public          # or: python3 -m http.server -d public
```

## Add a new game
1. Add an entry to `GAMES` in `public/js/data.js`. The `@typedef` at the top documents every field.
2. Put its art in place. The easiest way is to add it to the lists in `tools/build-assets.mjs` and run:
   ```bash
   node tools/build-assets.mjs ..   # the folder that holds the game repos
   ```
   That writes `games/<id>/cover.webp` and `icon.webp`, plus any screenshots and renders the hero slide uses. It needs Playwright, which it uses as the image encoder.
3. Update the hero stats in `index.html` ("6 games", "4 online multiplayer").

To move the **NEW** badge, set `isNew: true` on the newest game in `data.js`.

## Re-rendering the share card and icons
Open `art/og.html` (1200×630) or `art/icon.html` (512×512) in Chrome while online, so the fonts load, and screenshot it at exactly that size. Save the results as `public/og.png` and `public/icon-512.png` / `icon-192.png`.
