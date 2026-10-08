// Builds the site's image assets from the game repos' art/ and dist/ folders.
//
//   node tools/build-assets.mjs [path-to-folder-containing-the-game-repos]
//
// The folder defaults to the parent of this repo (so bonkbrawl/, cityrush/, … sit next to mellovibesgames/).
// Uses Playwright's Chromium as the image encoder (canvas → WebP), so there are no native image deps:
//   npm i -g playwright   (or run where Playwright is already installed)
//
// Output (all WebP unless noted):
//   public/games/<id>/cover.webp, icon.webp   key art + app icon
//   public/shots/*.webp                       gameplay screenshots
//   public/cast/*.webp                        transparent 3D renders, trimmed to their content
//   public/cast/px/*.png                      tiny 64px sprites, copied as-is
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.resolve(process.argv[2] || path.join(ROOT, ".."));
const OUT = path.join(ROOT, "public");

let chromium;
try { ({ chromium } = await import("playwright")); }
catch { ({ chromium } = await import(path.join(process.env.PLAYWRIGHT_DIR || "/opt/node22/lib/node_modules/playwright", "index.mjs"))); }

const GAMES = ["kartchaos", "obbyrush", "snackmerge", "orbitdepot", "bonkbrawl", "cityrush", "orderup", "orbyt", "graveshift", "spacediner"];

// [source (relative to SRC), output name, max width, quality, optional crop [x, y, w, h] in source pixels]
const SHOTS = [
  ["orbitdepot/art/bg.png", "orbitdepot", 1600, 0.8],
  ["kartchaos/portal-art/raw/land-3.png", "kartchaos", 1600, 0.8],
  // no clean portrait capture: crop the jar out of the store art
  ["snackmerge/portal-art/cg-portrait-800x1200.png", "snackmerge-portrait", 600, 0.8, [40, 270, 720, 930]],
  ["bonkbrawl/art/shot.png", "bonkbrawl", 1600, 0.8],
  ["cityrush/art/shot.png", "cityrush", 1200, 0.82],
  ["orderup/art/shot.png", "orderup", 1600, 0.8],
  ["spacediner/art/portrait.png", "spacediner-portrait", 600, 0.8],
  ["graveshift/art/portrait.png", "graveshift-portrait", 600, 0.8],
];

// Transparent renders: [source, output name, max edge after trim]
const CAST = [
  // Bonk Brawl roster (ids match js/data.js)
  ["bonkbrawl/art/p/character-male-e.png", "chef", 460],
  ["bonkbrawl/art/p/character-female-b.png", "spark", 460],
  ["bonkbrawl/art/p/character-keeper.png", "keeper", 460],
  ["bonkbrawl/art/p/character-zombie.png", "zombie", 460],
  ["bonkbrawl/art/p/character-skeleton.png", "skeleton", 460],
  ["bonkbrawl/art/p/character-vampire.png", "vampire", 460],
  ["bonkbrawl/art/p/character-orc.png", "orc", 460],
  ["bonkbrawl/art/p/character-human.png", "knight", 460],
  ["bonkbrawl/art/p/character-male-c.png", "racer", 460],
  ["bonkbrawl/art/p/character-ghost.png", "ghost", 460],
  // Spooktober costume fighters (the game's own select-screen renders)
  ["bonkbrawl/unity/Assets/Resources/Icons/bear.png", "bear", 460],
  ["bonkbrawl/unity/Assets/Resources/Icons/dog.png", "dog", 460],
  ["bonkbrawl/unity/Assets/Resources/Icons/duck.png", "duck", 460],
  ["bonkbrawl/unity/Assets/Resources/Icons/jack.png", "jack", 460],
  ["bonkbrawl/unity/Assets/Resources/Icons/witch.png", "witch", 460],
  // weapons
  ["bonkbrawl/art/p/weapon-sword.png", "sword", 300],
  ["bonkbrawl/art/p/frying-pan.png", "frying-pan", 300],
  ["bonkbrawl/art/p/grenade-a.png", "grenade", 240],
  ["bonkbrawl/art/p/blaster-h.png", "blaster", 300],
  // City Rush garage
  ["cityrush/art/cars/race.png", "car-race", 420],
  ["cityrush/art/cars/race-future.png", "car-race-future", 420],
  ["cityrush/art/cars/police.png", "car-police", 380],
  ["cityrush/art/cars/taxi.png", "car-taxi", 380],
  // Order Up! kitchen
  ["orderup/art/burger-double.png", "burger-double", 340],
  ["orderup/art/burger-cheese.png", "burger-cheese", 340],
  ["orderup/art/tomato.png", "tomato", 260],
  ["orderup/art/cheese.png", "cheese", 260],
  ["orderup/art/salad.png", "salad", 300],
  ["orderup/art/chefs/character-female-a.png", "chef-knives", 420],
  // Obby Rush skins
  ["obbyrush/unity/Assets/Resources/Icons/knight.png", "obby-knight", 420],
  ["obbyrush/unity/Assets/Resources/Icons/ranger.png", "obby-ranger", 420],
  ["obbyrush/unity/Assets/Resources/Icons/mage.png", "obby-mage", 420],
  // Snack Monster ladder
  ["snackmerge/unity/Assets/Resources/Icons/watermelon.png", "snack-watermelon", 240],
  ["snackmerge/unity/Assets/Resources/Icons/cupcake.png", "snack-cupcake", 240],
  ["snackmerge/unity/Assets/Resources/Icons/donut.png", "snack-donut", 240],
  ["snackmerge/unity/Assets/Resources/Icons/strawberry.png", "snack-strawberry", 200],
  ["snackmerge/unity/Assets/Resources/Icons/cake.png", "snack-cake", 240],
];

const PX = [
  "graveshift/art/pumpkin-carved.png", "graveshift/art/gravestone-round.png", "graveshift/art/pine.png",
  "graveshift/art/lightpost-single.png", "spacediner/art/donut-sprinkles.png", "spacediner/art/pizza.png",
  "spacediner/art/fries.png", "spacediner/art/soda.png", "spacediner/art/hot-dog.png",
];

const browser = await chromium.launch();
const page = await browser.newPage();

// Runs in the page: decode PNG, optionally trim transparent edges, scale to fit, encode WebP.
async function encode(file, { maxW, maxEdge, quality, trim, crop }) {
  const b64 = fs.readFileSync(file).toString("base64");
  const res = await page.evaluate(async ({ b64, maxW, maxEdge, quality, trim, crop }) => {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    let [sx, sy, sw, sh] = crop || [0, 0, img.naturalWidth, img.naturalHeight];
    if (trim) {
      const c = new OffscreenCanvas(sw, sh), x = c.getContext("2d");
      x.drawImage(img, 0, 0);
      const d = x.getImageData(0, 0, sw, sh).data;
      let x0 = sw, y0 = sh, x1 = 0, y1 = 0;
      for (let y = 0; y < sh; y++) for (let xx = 0; xx < sw; xx++) {
        if (d[(y * sw + xx) * 4 + 3] > 8) { if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      }
      const pad = 2;
      sx = Math.max(0, x0 - pad); sy = Math.max(0, y0 - pad);
      sw = Math.min(img.naturalWidth, x1 + pad + 1) - sx; sh = Math.min(img.naturalHeight, y1 + pad + 1) - sy;
    }
    const scale = Math.min(1, maxW ? maxW / sw : 1, maxEdge ? maxEdge / Math.max(sw, sh) : 1);
    const w = Math.round(sw * scale), h = Math.round(sh * scale);
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const x = c.getContext("2d");
    x.imageSmoothingQuality = "high";
    x.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    return { url: c.toDataURL("image/webp", quality), w, h };
  }, { b64, maxW, maxEdge, quality, trim, crop });
  return { buf: Buffer.from(res.url.split(",")[1], "base64"), w: res.w, h: res.h };
}

function write(rel, buf) {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, buf);
}

const sizes = {};
for (const g of GAMES) {
  write(`games/${g}/cover.webp`, (await encode(`${SRC}/${g}/dist/og.png`, { maxW: 1200, quality: 0.82 })).buf);
  write(`games/${g}/icon.webp`, (await encode(`${SRC}/${g}/dist/icon-512.png`, { maxW: 160, quality: 0.9 })).buf);
}
for (const [src, name, maxW, q, crop] of SHOTS) {
  const r = await encode(`${SRC}/${src}`, { maxW, quality: q, crop });
  write(`shots/${name}.webp`, r.buf); sizes[`shots/${name}`] = [r.w, r.h];
}
for (const [src, name, edge] of CAST) {
  const r = await encode(`${SRC}/${src}`, { maxEdge: edge, quality: 0.86, trim: true });
  write(`cast/${name}.webp`, r.buf); sizes[`cast/${name}`] = [r.w, r.h];
}
for (const src of PX) write(`cast/px/${path.basename(src)}`, fs.readFileSync(`${SRC}/${src}`));

await browser.close();
console.log(JSON.stringify(sizes, null, 1));
