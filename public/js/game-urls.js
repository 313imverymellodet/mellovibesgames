// The only place live game URLs are defined. Page links, ItemList JSON-LD,
// llms.txt, the ORBYT "full game" button, and the room-code host all read this
// map (directly or through GAMES in data.js).
//
// These are the current Vercel production URLs. Do not point them at a
// mellovibes.io subdomain until that hostname is attached to the game's
// Vercel project and actually serves the game. When it does, replace one
// line here. Suggested hostnames:
//   kartchaos  → https://kart.mellovibes.io
//   obbyrush   → https://obby.mellovibes.io
//   snackmerge → https://snack.mellovibes.io
//   orbitdepot → https://depot.mellovibes.io
//   bonkbrawl  → https://bonk.mellovibes.io
//   cityrush   → https://city.mellovibes.io
//   orderup    → https://order.mellovibes.io
//   orbyt      → https://orbyt.mellovibes.io
//   graveshift → https://grave.mellovibes.io
//   spacediner → https://diner.mellovibes.io

/** @type {Record<string, string>} */
export const GAME_URLS = {
  kartchaos: "https://kartchaos.vercel.app",
  obbyrush: "https://obbyrush.vercel.app",
  snackmerge: "https://snackmerge.vercel.app",
  orbitdepot: "https://orbitdepot.vercel.app",
  bonkbrawl: "https://bonkbrawl.vercel.app",
  cityrush: "https://cityrush-pearl.vercel.app",
  orderup: "https://orderup-three.vercel.app",
  orbyt: "https://orbyt-wine.vercel.app",
  graveshift: "https://graveshift.vercel.app",
  spacediner: "https://spacediner.vercel.app",
};
