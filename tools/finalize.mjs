// Vercel build step (also runnable by hand). Prerenders the parts of public/index.html that
// shouldn't depend on JavaScript, using public/js/data.js as the single source of truth
// and public/js/game-urls.js for live game addresses:
//   • __SITE_URL__ → the production URL, so link previews (iMessage, X, Discord…) show the OG card
//   • __GAME_URL_<id>__ / __GAME_HOST_<id>__ → that game's URL from game-urls.js
//   • <!--JSONLD-->  → schema.org ItemList of VideoGame entries for search engines
//   • <!--NOSCRIPT--> → a plain list of links for visitors without JavaScript
//   • public/robots.txt, public/sitemap.xml, public/llms.txt
// Manual use: node tools/finalize.mjs https://play.mellovibes.io
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "public/index.html");
const publicDir = path.join(root, "public");
const { GAMES } = await import(pathToFileURL(path.join(root, "public/js/data.js")).href);
const { GAME_URLS } = await import(pathToFileURL(path.join(root, "public/js/game-urls.js")).href);

// Canonical origin of this hub. robots.txt, sitemap.xml and llms.txt always
// describe production, including on preview deploys.
const SITE = "https://play.mellovibes.io";

const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const url = (process.argv[2] || (host ? "https://" + host : "")).replace(/\/$/, "");

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

for (const id of Object.keys(GAME_URLS)) {
  if (!GAMES.some((g) => g.id === id)) throw new Error(`GAME_URLS has no matching game: ${id}`);
}
for (const g of GAMES) {
  if (GAME_URLS[g.id] !== g.url) throw new Error(`${g.id} is not using GAME_URLS`);
}

const gameById = Object.fromEntries(GAMES.map((g) => [g.id, g]));

const jsonld = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Mello Vibes Games",
  itemListElement: GAMES.map((g, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "VideoGame",
      name: g.name,
      url: g.url,
      description: g.pitch,
      genre: g.genre,
      gamePlatform: "Web browser",
      applicationCategory: "Game",
      operatingSystem: "Any",
      image: url ? `${url}/games/${g.id}/cover.webp` : undefined,
      numberOfPlayers: g.players,
      offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
    },
  })),
};

const noscript = `<ul class="lineup">${GAMES.map((g) =>
  `<li><a class="card" style="--c:${g.accent}" href="${esc(g.url)}"><img class="card-art" src="/games/${g.id}/cover.webp" alt="${esc(g.name)} key art" width="1200" height="630"><span class="card-body"><h3>${esc(g.name)}</h3><span class="pitch">${esc(g.pitch)}</span></span></a></li>`).join("")}</ul>`;

let html = fs.readFileSync(file, "utf8")
  .replace("<!--JSONLD-->", `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, "\\u003c")}</script>`)
  .replace("<!--NOSCRIPT-->", noscript);

html = html.replace(/__GAME_URL_([a-z0-9]+)__/g, (_, id) => {
  const g = gameById[id];
  if (!g) throw new Error(`Unknown game in __GAME_URL_${id}__`);
  return g.url;
});
html = html.replace(/__GAME_HOST_([a-z0-9]+)__/g, (_, id) => {
  const g = gameById[id];
  if (!g) throw new Error(`Unknown game in __GAME_HOST_${id}__`);
  return new URL(g.url).host;
});

if (/^https:\/\//.test(url)) html = html.replaceAll("__SITE_URL__", url);
else console.log("No site URL given — leaving OG tags untouched.");
if (html.includes("__GAME_") || (html.includes("__SITE_URL__") && /^https:\/\//.test(url))) {
  throw new Error("Unreplaced placeholder left in index.html");
}
fs.writeFileSync(file, html);

// Pages on this host only. Game links on other hosts (today, *.vercel.app;
// later, game subdomains) belong in those hosts' sitemaps, not this one.
const locs = new Set([`${SITE}/`]);
for (const g of GAMES) {
  const u = new URL(g.url);
  if (u.origin === SITE) locs.add(u.href);
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...locs].map((loc) => `  <url>\n    <loc>${esc(loc)}</loc>\n  </url>`).join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;

const llms = `# Mello Vibes Games

> Ten free browser games, zero downloads. Play on a phone or a computer at ${SITE}.

Mello Vibes Games is a one-page hub for ten games built in Unity 6 and shipped to the web as WebAssembly. Nothing to install and no account required. The hub is a single URL, ${SITE}/. Each game is its own site, linked below. This domain has no other HTML pages.

The page has one top-level heading, "Ten games. Zero downloads." It publishes a schema.org ItemList of VideoGame entries for the same ten games, plus a no-JavaScript list of those games and their key art.

## Games

${GAMES.map((g) => `- [${g.name}](${g.url}): ${g.genre}. ${g.pitch} Signature mechanic, ${g.hook.name}: ${g.hook.text} Players: ${g.players}.`).join("\n")}

## Optional

- [Mello Vibes Games](${SITE}/): The hub. Lineup, how to play, the Bonk Brawl fighter roster, and a small playable ORBYT demo written for the page.
`;

fs.writeFileSync(path.join(publicDir, "robots.txt"), robots);
fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(publicDir, "llms.txt"), llms);
console.log("Finalized", file, url ? `for ${url}` : "");
console.log("Wrote robots.txt, sitemap.xml (", locs.size, "urls ) and llms.txt");
