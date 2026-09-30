// Vercel build step (also runnable by hand). Prerenders the parts of public/index.html that
// shouldn't depend on JavaScript, using public/js/data.js as the single source of truth:
//   • __SITE_URL__ → the production URL, so link previews (iMessage, X, Discord…) show the OG card
//   • <!--JSONLD-->  → schema.org ItemList of VideoGame entries for search engines
//   • <!--NOSCRIPT--> → a plain list of links for visitors without JavaScript
// Manual use: node tools/finalize.mjs https://mellovibesgames.vercel.app
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "public/index.html");
const { GAMES } = await import(pathToFileURL(path.join(root, "public/js/data.js")).href);

const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const url = (process.argv[2] || (host ? "https://" + host : "")).replace(/\/$/, "");

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

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
  `<li><a class="card" style="--c:${g.accent}" href="${g.url}"><img class="card-art" src="/games/${g.id}/cover.webp" alt="" width="1200" height="630"><span class="card-body"><h3>${esc(g.name)}</h3><span class="pitch">${esc(g.pitch)}</span></span></a></li>`).join("")}</ul>`;

let html = fs.readFileSync(file, "utf8")
  .replace("<!--JSONLD-->", `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, "\\u003c")}</script>`)
  .replace("<!--NOSCRIPT-->", noscript);
if (/^https:\/\//.test(url)) html = html.replaceAll("__SITE_URL__", url);
else console.log("No site URL given — leaving OG tags untouched.");
fs.writeFileSync(file, html);
console.log("Finalized", file, url ? `for ${url}` : "");
