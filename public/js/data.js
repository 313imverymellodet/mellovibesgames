// Single source of truth for the site. Everything on the page renders from these objects,
// and tools/finalize.mjs reads them at build time to prerender the JSON-LD and <noscript> list.
// To add a game: add an entry to GAMES and drop its art in /games/<id>/ (see README).

/**
 * @typedef {Object} Game
 * @property {string} id            folder name under /games and the GitHub repo name
 * @property {string} name
 * @property {string} genre
 * @property {string} url           live game
 * @property {string} accent        brand color (buttons, glows)
 * @property {string} ink           text color that reads on the accent
 * @property {string} bg            the game's own background color
 * @property {string} pitch         one sentence
 * @property {string} word          one-word verb for the marquee
 * @property {string[]} tags        short feature chips
 * @property {string[]} filters     lineup filter keys
 * @property {string} players       e.g. "1–4"
 * @property {Object} stage         hero "attract mode" layout
 * @property {string[]} howTo
 * @property {{cols: string[], rows: string[][]}} controls
 * @property {string[]} modes
 */

/** @type {Game[]} */
export const GAMES = [
  {
    id: "bonkbrawl",
    name: "Bonk Brawl",
    genre: "Party platform fighter",
    url: "https://bonkbrawl.vercel.app",
    accent: "#ff3d7f", ink: "#1a0614", bg: "#140a28",
    pitch: "Knock your friends off the stage. Weapons fall from the sky, and fighters from every game join the brawl.",
    word: "Brawl",
    tags: ["Online · 4 players", "Rollback netcode", "Couch 2P"],
    filters: ["online", "party"],
    players: "1–4",
    isNew: true,
    stage: {
      screen: { kind: "wide", src: "/shots/bonkbrawl.webp", w: 1600, h: 900 },
      cast: [
        { src: "/cast/chef.webp", x: -7, y: 36, h: 56, depth: 1.2, r: -6 },
        { src: "/cast/zombie.webp", x: 79, y: 36, h: 54, depth: 1, r: 5, flip: true },
        { src: "/cast/frying-pan.webp", x: 70, y: -2, h: 20, depth: 1.6, r: 24, spin: true },
        { src: "/cast/sword.webp", x: 6, y: 2, h: 30, depth: 0.7, r: -28 },
      ],
    },
    howTo: [
      "Every hit raises the target's damage %. The higher it gets, the further they fly.",
      "Knock rivals past the edge of the screen to take a stock. Last one standing wins.",
      "Attack plus a direction gives a different move, on the ground and in the air. Hold Heavy to charge it.",
      "Weapons fall from the sky: sword, spear, frying pan, blaster and grenade. Press Throw to grab or toss one.",
    ],
    controls: {
      cols: ["Action", "Keyboard", "Gamepad", "Touch"],
      rows: [
        ["Move", "WASD / arrows", "Stick / d-pad", "Left joystick"],
        ["Jump (×3)", "Space", "A", "JUMP"],
        ["Attack", "J / Z", "X", "ATTACK"],
        ["Heavy", "K / X", "B", "HEAVY"],
        ["Dodge", "L / Shift", "Bumpers", "DODGE"],
        ["Grab / throw", "H / E", "Y", "THROW"],
      ],
    },
    modes: ["Online quick match", "Private room codes", "Couch 2-player", "Vs CPUs", "4 stages", "10 fighters"],
  },
  {
    id: "cityrush",
    name: "City Rush",
    genre: "Arcade street racing",
    url: "https://cityrush-pearl.vercel.app",
    accent: "#ff4f93", ink: "#1a0610", bg: "#0d0b1a",
    pitch: "Drift for nitro and race real players through neon downtown and sunny suburbs.",
    word: "Race",
    tags: ["Online · 4 racers", "8 cars", "Leaderboards"],
    filters: ["online"],
    players: "1–4",
    stage: {
      screen: { kind: "wide", src: "/shots/cityrush.webp", w: 1200, h: 630 },
      cast: [
        { src: "/cast/car-race.webp", x: 58, y: 56, h: 40, depth: 1.3, r: -4 },
        { src: "/cast/car-police.webp", x: -8, y: 60, h: 34, depth: 1, r: 4, flip: true },
        { src: "/cast/car-taxi.webp", x: 74, y: -4, h: 24, depth: 0.7, r: 6 },
      ],
    },
    howTo: [
      "The gas is automatic, so you only have to steer.",
      "Hold a hard turn at speed to drift and charge the NITRO bar, then fire it on a straight.",
      "Blue chevron pads give a free boost. Brake to get round the tight corners.",
      "Races are 3 laps, and your best time goes on that city's live leaderboard.",
    ],
    controls: {
      cols: ["Action", "Keyboard", "Touch"],
      rows: [
        ["Steer", "A / D or ← / →", "Slide a thumb on the left half"],
        ["Nitro", "Space", "NITRO"],
        ["Brake", "S / ↓", "BRAKE"],
      ],
    },
    modes: ["Solo vs 5 AI rivals", "Online quick race", "Private room codes", "Downtown & Suburbs", "8 cars"],
  },
  {
    id: "orderup",
    name: "Order Up!",
    genre: "Co-op kitchen chaos",
    url: "https://orderup-three.vercel.app",
    accent: "#ff6a3d", ink: "#1f0a02", bg: "#2a150b",
    pitch: "Chop, cook, plate and serve against the clock, solo or with up to four chefs online.",
    word: "Cook",
    tags: ["Online co-op · 4 chefs", "2 kitchens", "Leaderboards"],
    filters: ["online", "party"],
    players: "1–4",
    stage: {
      screen: { kind: "wide", src: "/shots/orderup.webp", w: 1600, h: 900 },
      cast: [
        { src: "/cast/burger-double.webp", x: 76, y: 46, h: 44, depth: 1.3, r: 6 },
        { src: "/cast/chef-knives.webp", x: -8, y: 52, h: 48, depth: 1, r: -4 },
        { src: "/cast/tomato.webp", x: 70, y: -2, h: 20, depth: 1.6, r: 0, spin: true },
        { src: "/cast/cheese.webp", x: 8, y: 0, h: 16, depth: 0.7, r: -10 },
      ],
    },
    howTo: [
      "Tickets at the top show what to cook. Serve each one before its timer runs out.",
      "Grab ingredients from the crates. Lettuce, tomato and cheese need chopping: hold the action button on a board.",
      "Cook patties on the stove and grab them before they burn.",
      "Build the dish on a plate and take it to the serving hatch. Fast service earns tips, and streaks build a combo.",
    ],
    controls: {
      cols: ["Action", "Keyboard", "Touch"],
      rows: [
        ["Move", "WASD", "Drag on the left side"],
        ["Grab / drop / chop", "Space", "Action button"],
        ["Dash", "Shift", "DASH"],
      ],
    },
    modes: ["Solo shifts", "Online co-op up to 4", "Private room codes", "Burger Bar & Split Shift", "Leaderboard per kitchen"],
  },
  {
    id: "orbyt",
    name: "ORBYT",
    genre: "One-tap arcade",
    url: "https://orbyt-wine.vercel.app",
    accent: "#3ee8ff", ink: "#021a1f", bg: "#0b0620",
    pitch: "One tap. Two orbits. No mercy. Dodge spikes, chain perfects and beat the daily challenge.",
    word: "Tap",
    tags: ["Live duels", "Daily challenge", "7 skins"],
    filters: ["online", "phone"],
    players: "1–2",
    stage: {
      screen: { kind: "phone", orbyt: true },
      cast: [
        { orb: "#ff4d8d", x: 18, y: 16, h: 9, depth: 1.5 },
        { orb: "#3ee8ff", x: 76, y: 70, h: 12, depth: 1.2 },
        { orb: "#8b5cff", x: 80, y: 12, h: 6, depth: 0.7 },
        { orb: "#ffd23f", x: 12, y: 74, h: 5, depth: 1.8 },
      ],
    },
    howTo: [
      "Tap anywhere to jump between the inner and outer orbit.",
      "Dodge the spikes riding the rings. One touch ends the run.",
      "Switch at the last possible moment for a PERFECT. Chain them for combos.",
      "Every 25 points the orbit flips direction and the colors shift.",
    ],
    controls: {
      cols: ["Action", "Keyboard / mouse", "Touch"],
      rows: [["Switch orbit", "Space or click", "Tap anywhere"]],
    },
    modes: ["Endless", "Daily Challenge", "Live duels", "Global leaderboard", "7 unlockable skins"],
  },
  {
    id: "graveshift",
    name: "Grave Shift",
    genre: "Horde survival shooter",
    url: "https://graveshift.vercel.app",
    accent: "#6dffae", ink: "#03190c", bg: "#0b0a17",
    pitch: "One thumb, endless undead. Level up your weapons and survive the graveyard until dawn.",
    word: "Survive",
    tags: ["One thumb", "6 weapons", "3 bosses"],
    filters: ["phone"],
    players: "1",
    stage: {
      screen: { kind: "phone", src: "/shots/graveshift-portrait.webp", w: 600, h: 1298 },
      cast: [
        { src: "/cast/ghost.webp", x: 66, y: 8, h: 34, depth: 1.4, r: 8 },
        { src: "/cast/zombie.webp", x: 2, y: 48, h: 44, depth: 1.1, r: -5 },
        { src: "/cast/px/pumpkin-carved.png", x: 74, y: 70, h: 14, depth: 1.7, px: true },
        { src: "/cast/px/gravestone-round.png", x: 18, y: 6, h: 14, depth: 0.7, px: true },
      ],
    },
    howTo: [
      "Move with one thumb. Aiming and firing are automatic.",
      "Pick up the XP gems the undead drop, then choose a new weapon or upgrade each time you level up.",
      "Bosses like the Rotting Giant and Count Noctis crash the party. Hold out until dawn.",
      "Spend gold in the Crypt Shop between runs to come back stronger.",
    ],
    controls: {
      cols: ["Action", "Keyboard", "Touch"],
      rows: [
        ["Move", "WASD / arrows", "Drag anywhere"],
        ["Aim & fire", "Automatic", "Automatic"],
        ["Pause", "Esc / P", "Pause button"],
      ],
    },
    modes: ["Survive until dawn", "6 weapons", "3 bosses", "Crypt Shop upgrades"],
  },
  {
    id: "spacediner",
    name: "Space Diner",
    genre: "Cozy idle tycoon",
    url: "https://spacediner.vercel.app",
    accent: "#ffc53d", ink: "#1f1400", bg: "#10163a",
    pitch: "Run a burger joint on the Moon, grow it, then launch your diner to Mars and Europa.",
    word: "Build",
    tags: ["3 planets", "9 foods", "Earns while you're away"],
    filters: ["phone"],
    players: "1",
    stage: {
      screen: { kind: "phone", src: "/shots/spacediner-portrait.webp", w: 600, h: 1298 },
      cast: [
        { src: "/cast/burger-cheese.webp", x: 66, y: 10, h: 26, depth: 1.4, r: 10 },
        { src: "/cast/px/donut-sprinkles.png", x: 6, y: 18, h: 14, depth: 1.7, px: true },
        { src: "/cast/px/pizza.png", x: 76, y: 66, h: 15, depth: 1.1, px: true },
        { src: "/cast/px/soda.png", x: 12, y: 66, h: 15, depth: 0.8, px: true },
        { src: "/cast/px/fries.png", x: 84, y: 40, h: 12, depth: 2, px: true },
      ],
    },
    howTo: [
      "Grill the food, carry the wobbly stack to the counter and serve the queue.",
      "Collect your cash and clear the tables the customers leave behind.",
      "Stand on unlock pads to spend cash on tables, drink machines and hovering alien staff.",
      "Finish the Moon diner, then launch it to Mars and Europa for new menus and 4× the pay.",
    ],
    controls: {
      cols: ["Action", "Keyboard", "Touch"],
      rows: [
        ["Move", "WASD / arrows", "Drag anywhere"],
        ["Grill, carry, serve", "Walk onto a station", "Walk onto a station"],
      ],
    },
    modes: ["Offline earnings", "3 planets", "9 foods", "Alien staff", "Upgrades"],
  },
];

export const FILTERS = [
  { key: "all", label: "All games" },
  { key: "online", label: "Play online" },
  { key: "phone", label: "Built for phones" },
  { key: "party", label: "Party games" },
];

// Bonk Brawl roster, straight from unity/Assets/Scripts/Defs.cs.
export const FIGHTERS = [
  { id: "chef", name: "Chef", from: "orderup", cls: "Medium", color: "#ff5a3c", weight: 100, speed: 100, jump: 100, grav: 8 },
  { id: "spark", name: "Spark", from: "spacediner", cls: "Light", color: "#ffc53d", weight: 88, speed: 110, jump: 106, grav: 7 },
  { id: "keeper", name: "Keeper", from: "graveshift", cls: "Medium", color: "#7cffb2", weight: 102, speed: 98, jump: 100, grav: 8 },
  { id: "zombie", name: "Zombie", from: "graveshift", cls: "Heavy", color: "#5de05d", weight: 116, speed: 90, jump: 94, grav: 9 },
  { id: "skeleton", name: "Bones", from: "graveshift", cls: "Light", color: "#e8e0d0", weight: 86, speed: 112, jump: 108, grav: 7 },
  { id: "vampire", name: "Noctis", from: "graveshift", cls: "Medium", color: "#e0405e", weight: 100, speed: 104, jump: 102, grav: 8 },
  { id: "orc", name: "Grunk", from: "graveshift", cls: "Heavy", color: "#8fbf3a", weight: 120, speed: 88, jump: 92, grav: 9 },
  { id: "knight", name: "Sir Bonk", from: null, cls: "Medium", color: "#46b8ff", weight: 106, speed: 96, jump: 98, grav: 8 },
  { id: "racer", name: "Nitro", from: "cityrush", cls: "Light", color: "#ff3d7f", weight: 94, speed: 108, jump: 102, grav: 8 },
  { id: "ghost", name: "Boo", from: "graveshift", cls: "Light", color: "#b8e6ff", weight: 84, speed: 102, jump: 110, grav: 6 },
];

// Brotli-compressed WebGL build size per game (sum of dist/Build/*), in bytes.
export const BUILD_BYTES = {
  bonkbrawl: 6292922, cityrush: 5916321, orderup: 5788614,
  orbyt: 5176997, graveshift: 5564259, spacediner: 5703793,
};

export const gameById = Object.fromEntries(GAMES.map((g) => [g.id, g]));
