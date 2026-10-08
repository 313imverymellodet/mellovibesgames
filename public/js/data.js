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
 * @property {{name: string, text: string}} hook   the game's signature mechanic
 * @property {string} [badge]       corner badge on the card ("New", "Spooktober", …)
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
  // ---------------------------------------------------------------- new in October
  {
    id: "kartchaos",
    name: "Kart Chaos",
    genre: "Kart battle arena",
    url: "https://kartchaos.vercel.app",
    accent: "#ff4f8b", ink: "#1f0612", bg: "#1b1340",
    pitch: "Grab coins, fire rockets and spin out your rivals in 2:30 kart battles for up to 8 drivers. Bots fill every empty seat.",
    hook: { name: "Coin Heist", text: "Coins are your score. Hit a kart and half its coins burst out for anyone to grab, and whoever carries the most wears the golden crown." },
    badge: "New",
    word: "Battle",
    tags: ["Online · 8 drivers", "6 items", "14 karts to unlock"],
    filters: ["online", "party"],
    players: "1–8",
    stage: {
      screen: { kind: "wide", src: "/shots/kartchaos.webp", w: 1600, h: 900 },
      cast: [
        { src: "/cast/car-race-future.webp", x: 62, y: 54, h: 36, depth: 1.3, r: -6 },
        { src: "/cast/car-police.webp", x: -8, y: 58, h: 32, depth: 1, r: 5, flip: true },
        { src: "/cast/car-taxi.webp", x: 74, y: -4, h: 22, depth: 0.7, r: 8 },
      ],
    },
    howTo: [
      "Drive over the coins that pop up around the arena. The coins you're carrying are your score.",
      "Grab ? boxes for a Rocket, Triple, Homing shot, Mine, Shield or Boost. Hit a kart and half its coins spill out.",
      "Whoever carries the most coins wears the golden crown, and hitting them spills 75%.",
      "In the last 30 seconds a ring closes in. Whatever you're carrying at the buzzer is banked toward 14 unlockable karts.",
    ],
    controls: {
      cols: ["Action", "Keyboard", "Touch"],
      rows: [
        ["Drive", "WASD / arrows", "Drag on the left half"],
        ["Fire item", "Space", "Item button"],
      ],
    },
    modes: ["Online matches up to 8", "Bots fill every seat", "Private room codes", "Speedway & Pit Stop arenas", "14 cosmetic karts"],
  },
  {
    id: "obbyrush",
    name: "Obby Rush",
    genre: "3D obstacle speedruns",
    url: "https://obbyrush.vercel.app",
    accent: "#8f7bff", ink: "#0e0826", bg: "#1b1340",
    pitch: "Speedrun 3D obstacle courses, and when you miss a jump, rewind time. Race your ghost, the world record or up to 8 players live.",
    hook: { name: "Rewind", text: "Hold REWIND to scrub back the last 3 seconds and undo a missed jump. The clock keeps running, so a no-rewind run is the real flex." },
    badge: "New",
    word: "Jump",
    tags: ["Online · 8 racers", "3 courses", "Ghost races"],
    filters: ["online"],
    players: "1–8",
    stage: {
      // no clean gameplay capture yet: the share card reads as the title screen
      screen: { kind: "wide", src: "/games/obbyrush/cover.webp", w: 1200, h: 630 },
      cast: [
        { src: "/cast/obby-ranger.webp", x: -6, y: 40, h: 52, depth: 1.2, r: -5 },
        { src: "/cast/obby-knight.webp", x: 80, y: 42, h: 50, depth: 1, r: 5 },
        { src: "/cast/obby-mage.webp", x: 72, y: -6, h: 28, depth: 1.6, r: 8 },
      ],
    },
    howTo: [
      "Run, jump and air-jump past checkpoints, springs, conveyors, crumbling tiles, sweepers and moving platforms.",
      "Miss a jump? Hold REWIND to scrub back up to 3 seconds. The meter refills over time, and the run clock never rewinds.",
      "Race your personal-best ghost, the world record's replay, or up to 8 real players live.",
      "Find the 9 hidden stars to unlock all 10 skins.",
    ],
    controls: {
      cols: ["Action", "Keyboard", "Touch"],
      rows: [
        ["Move", "WASD / arrows", "Floating stick"],
        ["Jump (+ air jump)", "Space", "Jump button"],
        ["Rewind (hold)", "Shift / Z", "<< button"],
        ["Camera", "Q / E", "Drag"],
      ],
    },
    modes: ["Sky Garden · Sunset Tower · Storm Peak", "Live races up to 8", "Private room codes", "Ghost races", "Leaderboard per course", "10 skins"],
  },
  {
    id: "snackmerge",
    name: "Snack Monster",
    genre: "Merge puzzle",
    url: "https://snackmerge.vercel.app",
    accent: "#ff5e7e", ink: "#2a0610", bg: "#fff1e4",
    pitch: "Drop snacks in the jar, merge two of a kind into the next one up, and feed the hungry monster what it craves before it gets grumpy.",
    hook: { name: "The Monster", text: "A monster leans on the jar craving one snack at a time. Merge into it and its tongue snatches it out for big points. Keep it waiting and it stomps the jar." },
    badge: "New",
    word: "Merge",
    tags: ["Daily jar", "11-snack ladder", "Leaderboards"],
    filters: ["phone", "chill"],
    players: "1",
    stage: {
      screen: { kind: "phone", src: "/shots/snackmerge-portrait.webp", w: 600, h: 775 },
      cast: [
        { src: "/cast/snack-watermelon.webp", x: 68, y: 6, h: 26, depth: 1.4, r: 8 },
        { src: "/cast/snack-cupcake.webp", x: 8, y: 12, h: 24, depth: 1.7, r: -8 },
        { src: "/cast/snack-donut.webp", x: 76, y: 60, h: 24, depth: 1.1, r: 6, spin: true },
        { src: "/cast/snack-strawberry.webp", x: 12, y: 64, h: 18, depth: 0.8, r: -6 },
      ],
    },
    howTo: [
      "Aim and drop snacks into the jar. Two of the same merge into the next snack up the 11-step ladder.",
      "Watch the monster's craving bubble, and merge into that snack before its patience ring runs out.",
      "HOT PEPPER blasts small snacks nearby, and SPRINKLE CUPCAKE merges with whatever it touches.",
      "Merge two watermelons for the JACKPOT. A free SHAKE and POP each game get you out of a jam.",
    ],
    controls: {
      cols: ["Action", "Keyboard / mouse", "Touch"],
      rows: [
        ["Aim", "Mouse, ← / → or A / D", "Drag"],
        ["Drop", "Release or Space", "Release"],
      ],
    },
    modes: ["Classic", "Daily Jar (same drops for everyone)", "World leaderboards", "Combos & jackpots"],
  },
  {
    id: "orbitdepot",
    name: "Orbit Depot",
    genre: "Idle warehouse tycoon",
    url: "https://orbitdepot.vercel.app",
    accent: "#5aa9ff", ink: "#03122a", bg: "#070b18",
    pitch: "Run a fulfillment floor on a space station: receive cargo, rack it, pick orders, pack, sort and ship across the galaxy.",
    hook: { name: "Seven Stations", text: "One loop from dock to dock: receive, store, restock, pick, pack, sort and ship. Hire bots and crew to run each station while you grow the depot." },
    badge: "New",
    word: "Ship",
    tags: ["7-station loop", "Hire a crew", "4 depots"],
    filters: ["chill"],
    players: "1",
    stage: {
      screen: { kind: "wide", src: "/shots/orbitdepot.webp", w: 1600, h: 900 },
      cast: [
        { orb: "#5aa9ff", x: 4, y: 8, h: 12, depth: 1.5 },
        { orb: "#ffb02e", x: 82, y: 62, h: 10, depth: 1.2 },
        { orb: "#8b5cff", x: 86, y: 6, h: 6, depth: 0.7 },
        { orb: "#6dffae", x: 8, y: 70, h: 5, depth: 1.8 },
      ],
    },
    howTo: [
      "A space truck unloads cargo at the inbound dock. Store the pallets, then break them down to restock the pick rack.",
      "Pick orders into totes, pack them at the table, then drop the boxes in the sort chute.",
      "Forklift full bins to the outbound dock and get paid for every box you ship.",
      "Spend cash on expansion pads to hire crew and add bigger racks and trucks, then open the next depot: Luna, Mars and Europa.",
    ],
    controls: {
      cols: ["Action", "Keyboard", "Touch"],
      rows: [
        ["Move", "WASD / arrows", "Drag anywhere"],
        ["Work a station", "Walk onto it", "Walk onto it"],
      ],
    },
    modes: ["4 depots", "Crew & robot hires", "Peak season rushes", "Quests", "Offline earnings"],
  },

  // ---------------------------------------------------------------- the originals (each got a new hook)
  {
    id: "bonkbrawl",
    name: "Bonk Brawl",
    genre: "Party platform fighter",
    url: "https://bonkbrawl.vercel.app",
    accent: "#ff3d7f", ink: "#1a0614", bg: "#140a28",
    pitch: "Knock your friends off the stage. Weapons fall from the sky, and fighters from across the collection join the brawl.",
    hook: { name: "Hat Stack", text: "Everyone starts with a party hat. KO a rival and their whole stack jumps onto your head. Each hat makes you heavier but slower, and the tallest stack wins ties." },
    badge: "Spooktober",
    word: "Brawl",
    tags: ["Online · 4 players", "Rollback netcode", "15 fighters"],
    filters: ["online", "party"],
    players: "1–4",
    stage: {
      screen: { kind: "wide", src: "/shots/bonkbrawl.webp", w: 1600, h: 900 },
      cast: [
        { src: "/cast/chef.webp", x: -7, y: 36, h: 56, depth: 1.2, r: -6 },
        { src: "/cast/jack.webp", x: 79, y: 38, h: 52, depth: 1, r: 5 },
        { src: "/cast/frying-pan.webp", x: 70, y: -2, h: 20, depth: 1.6, r: 24, spin: true },
        { src: "/cast/sword.webp", x: 6, y: 2, h: 30, depth: 0.7, r: -28 },
      ],
    },
    howTo: [
      "Every hit raises the target's damage %. The higher it gets, the further they fly.",
      "Knock rivals past the edge of the screen to take a stock. Last one standing wins.",
      "KO someone and their whole hat stack jumps onto your head. Hats make you heavier but slower, and the tallest stack wins ties.",
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
    modes: ["Online quick match", "Private room codes", "Couch 2-player", "Vs CPUs", "5 stages, incl. Haunted Hollow", "15 fighters"],
  },
  {
    id: "cityrush",
    name: "City Rush",
    genre: "Arcade street racing",
    url: "https://cityrush-pearl.vercel.app",
    accent: "#ff4f93", ink: "#1a0610", bg: "#0d0b1a",
    pitch: "Weave through live city traffic, chain near misses into nitro and race real players through neon downtown and sunny suburbs.",
    hook: { name: "Traffic Weave", text: "Races run through live city traffic. Skim past cars for near-miss nitro combos, and shove rivals into traffic for takedowns." },
    word: "Race",
    tags: ["Online · 4 racers", "Live traffic", "Leaderboards"],
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
      "Skim past traffic for near-miss NITRO, and chain them within 3 seconds for a combo. Hit a car and you lose most of your speed.",
      "Shove a rival into traffic for a TAKEDOWN: +45 nitro, and they're wrecked.",
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
    genre: "Co-op rhythm kitchen",
    url: "https://orderup-three.vercel.app",
    accent: "#ff6a3d", ink: "#1f0a02", bg: "#2a150b",
    pitch: "Chop, cook and serve to the beat, solo or with up to four chefs online.",
    hook: { name: "Kitchen Beats", text: "The kitchen runs on the music. Chop on the beat for double speed, serve on the beat for 1.5× tips, and keep the crew's beat streak alive to multiply every tip." },
    word: "Cook",
    tags: ["Online co-op · 4 chefs", "Cook to the beat", "Leaderboards"],
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
      "Lettuce, tomato and cheese need chopping: tap the action button at a board. On-beat taps count double.",
      "Cook patties on the stove and grab them before they burn, then build the dish on a plate.",
      "Serve on the beat for a 1.5× tip. The whole crew shares a beat streak that multiplies tips up to 2×.",
    ],
    controls: {
      cols: ["Action", "Keyboard", "Touch"],
      rows: [
        ["Move", "WASD", "Drag on the left side"],
        ["Grab / drop", "Space", "Action button"],
        ["Chop (on the beat)", "Tap Space", "Tap the action button"],
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
    pitch: "One tap. Two orbits. No mercy. Dodge spikes, chain perfects, and outlive the echo of your last run.",
    hook: { name: "Echo", text: "Your last run comes back as a ghost orb riding the other way. Touch it and you're out, slip past it for +2, outlive it for +5." },
    word: "Tap",
    tags: ["Echo", "Live duels", "Daily challenge"],
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
      "Tap anywhere to jump between the inner and outer orbit, and dodge the spikes riding the rings.",
      "Switch at the last possible moment for a PERFECT. Chain them for combos.",
      "Your last run comes back as an echo riding the other way. Slip past it for +2, outlive it for +5.",
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
    pitch: "One thumb, endless undead, and only your lantern's light to fight by. Survive the graveyard until dawn.",
    hook: { name: "Lantern", text: "The graveyard is pitch dark. Your weapons only reach what your lantern lights, and it burns down, so grab oil from the dark to keep it going." },
    badge: "Spooktober",
    word: "Survive",
    tags: ["One thumb", "Pitch-dark nights", "Pumpkin King boss"],
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
      "Move with one thumb. Aiming and firing are automatic, but only reach as far as your lantern's light.",
      "The lantern burns down. Grab oil from the dark, or from tough undead, to keep it lit.",
      "Pick up XP gems to level up, then choose a new weapon or upgrade. Bosses, including the Pumpkin King, arrive through the night.",
      "Survive 8 minutes until dawn, then spend gold in the Crypt Shop to come back stronger.",
    ],
    controls: {
      cols: ["Action", "Keyboard", "Touch"],
      rows: [
        ["Move", "WASD / arrows", "Drag anywhere"],
        ["Aim & fire", "Automatic", "Automatic"],
        ["Pause", "Esc / P", "Pause button"],
      ],
    },
    modes: ["Survive until dawn", "Lantern & oil", "Bosses", "Crypt Shop upgrades", "Spooktober candy & hats"],
  },
  {
    id: "spacediner",
    name: "Space Diner",
    genre: "Cozy idle tycoon",
    url: "https://spacediner.vercel.app",
    accent: "#ffc53d", ink: "#1f1400", bg: "#10163a",
    pitch: "Run a burger joint on the Moon, fling food across the diner in low gravity, then launch it to Mars and Europa.",
    hook: { name: "Zero-G Toss", text: "It's low gravity on the Moon: hold TOSS to aim, then fling your whole food stack onto the counter. Long tosses earn tips, and bullseyes double them." },
    word: "Build",
    tags: ["Zero-G toss", "3 planets", "Earns while you're away"],
    filters: ["phone", "chill"],
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
      "Grill the food and serve the queue at the counter, then collect your cash and clear the tables.",
      "Too far to walk? Hold TOSS to aim, and fling the whole stack onto the counter. Long tosses earn a tip.",
      "Stand on unlock pads to spend cash on tables, drink machines and hovering alien staff.",
      "Finish the Moon diner, then launch it to Mars and Europa for new menus and 4× the pay.",
    ],
    controls: {
      cols: ["Action", "Keyboard", "Touch"],
      rows: [
        ["Move", "WASD / arrows", "Drag anywhere"],
        ["Toss a stack (hold)", "Space", "TOSS"],
        ["Grill, serve, build", "Walk onto a station", "Walk onto a station"],
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
  { key: "chill", label: "Chill & cozy" },
];

// Bonk Brawl roster, straight from unity/Assets/Scripts/Defs.cs.
// `from` is the game a crossover fighter comes from; `event` marks limited-time costume fighters.
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
  // Spooktober costume fighters (colors lightened from the game's so labels stay readable on the dark page)
  { id: "jack", name: "Jack", event: "Spooktober", cls: "Medium", color: "#ff7a2e", weight: 100, speed: 100, jump: 100, grav: 8 },
  { id: "witch", name: "Hexie", event: "Spooktober", cls: "Medium", color: "#a46bff", weight: 90, speed: 104, jump: 106, grav: 7 },
  { id: "bear", name: "Grizz", event: "Spooktober", cls: "Heavy", color: "#c47c50", weight: 118, speed: 90, jump: 94, grav: 9 },
  { id: "dog", name: "Biscuit", event: "Spooktober", cls: "Light", color: "#e0a060", weight: 94, speed: 108, jump: 102, grav: 8 },
  { id: "duck", name: "Quackers", event: "Spooktober", cls: "Light", color: "#ffd23f", weight: 84, speed: 104, jump: 112, grav: 6 },
];

// Brotli-compressed WebGL build size per game (sum of dist/Build/*), in bytes.
export const BUILD_BYTES = {
  kartchaos: 5572574, obbyrush: 6825464, snackmerge: 5705992, orbitdepot: 5937643,
  bonkbrawl: 6713321, cityrush: 5978748, orderup: 5813073,
  orbyt: 5193857, graveshift: 6390305, spacediner: 5753457,
};

export const gameById = Object.fromEntries(GAMES.map((g) => [g.id, g]));
