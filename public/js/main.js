import { GAMES, FILTERS, FIGHTERS, BUILD_BYTES, gameById } from "./data.js";
import { Orbyt } from "./orbyt.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};
const REPO = (id) => `https://github.com/313imverymellodet/${id}`;
const ARROW = '<span aria-hidden="true">→</span>';

/** Runs `onChange(visible)` whenever `el` enters or leaves the viewport. */
function watchVisible(el, onChange, rootMargin = "0px") {
  new IntersectionObserver(([e]) => onChange(e.isIntersecting), { rootMargin }).observe(el);
}

// ---------------------------------------------------------------- shared bits
document.addEventListener("click", (e) => {
  const link = e.target.closest("a[data-game]");
  if (link) store.set("mvg:last", link.dataset.game);
});

$$(".js-random").forEach((btn) =>
  btn.addEventListener("click", () => {
    const g = GAMES[Math.floor(Math.random() * GAMES.length)];
    store.set("mvg:last", g.id);
    location.href = g.url;
  })
);

$("#year").textContent = new Date().getFullYear();

// Nav: solid background once scrolled, and highlight the section in view.
const nav = $("#nav");
const onScroll = () => nav.classList.toggle("scrolled", scrollY > 8);
addEventListener("scroll", onScroll, { passive: true });
onScroll();
const navLinks = $$(".nav-links a");
for (const link of navLinks) {
  const section = $(link.getAttribute("href"));
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) navLinks.forEach((l) => l.setAttribute("aria-current", String(l === link)));
  }, { rootMargin: "-45% 0px -50% 0px" }).observe(section);
}

// ---------------------------------------------------------------- hero: attract mode
const cab = (() => {
  const root = $("#cab");
  const stage = $("#cab-stage");
  const info = $("#cab-info");
  const tabs = $("#cab-tabs");
  const pauseBtn = $("#cab-pause");
  const state = { i: 0, userPaused: false, hover: false, focus: false, visible: true };
  let heroOrbyt = null;

  stage.innerHTML =
    `<div class="cab-bg">${GAMES.map((g) => `<div data-id="${g.id}"><img data-src="${g.stage.screen.src || `/games/${g.id}/cover.webp`}" alt=""></div>`).join("")}</div>` +
    GAMES.map((g, i) => {
      const s = g.stage.screen;
      const device = s.kind === "wide"
        ? `<div class="device wide"><div class="chrome"><i></i><i></i><i></i><span>${esc(g.url.replace("https://", ""))}</span></div><img data-src="${s.src}" alt="" width="${s.w}" height="${s.h}"></div>`
        : `<div class="device phone">${s.orbyt ? "<canvas></canvas>" : `<img data-src="${s.src}" alt="" width="${s.w}" height="${s.h}">`}</div>`;
      const cast = g.stage.cast.map((c, k) => {
        const cls = ["cast", c.px && "px", c.flip && "flip", c.spin && "spin"].filter(Boolean).join(" ");
        const style = `left:${c.x}%;top:${c.y}%;height:${c.h}%;--r:${c.r || 0}deg;--d:${0.25 + k * 0.09}s;--bob:${4.2 + k * 0.7}s;--bd:${-k * 1.3}s`;
        const art = c.orb ? `<span class="orb" style="--o:${c.orb}"></span>` : `<img data-src="${c.src}" alt="">`;
        return `<div class="${cls}" style="${style}" data-depth="${c.depth}">${art}</div>`;
      }).join("");
      return `<div class="slide" id="slide-${g.id}" data-i="${i}" aria-hidden="true">${device}${cast}</div>`;
    }).join("");

  tabs.innerHTML = GAMES.map((g, i) =>
    `<button class="cab-tab" role="tab" id="tab-${g.id}" aria-controls="cab-info" aria-selected="false" tabindex="-1" data-i="${i}">
      <img src="/games/${g.id}/icon.webp" alt="" width="40" height="40"><span class="sr-only">${esc(g.name)}</span><span class="bar"><i></i></span>
    </button>`).join("");
  info.setAttribute("role", "tabpanel");

  const slides = $$(".slide", stage);
  const bgs = $$(".cab-bg > div", stage);
  const tabEls = $$(".cab-tab", tabs);

  const hydrate = (i) => {
    const k = (i + GAMES.length) % GAMES.length;
    for (const el of [slides[k], bgs[k]]) $$("img[data-src]", el).forEach((img) => { img.src = img.dataset.src; img.removeAttribute("data-src"); });
  };

  function renderInfo(g) {
    info.setAttribute("aria-labelledby", `tab-${g.id}`);
    info.style.setProperty("--c", g.accent);
    info.innerHTML = `
      <img class="icon" src="/games/${g.id}/icon.webp" alt="" width="60" height="60">
      <span class="genre">${esc(g.genre)}</span>
      <h2>${esc(g.name)}</h2>
      <p>${esc(g.pitch)}</p>
      <div class="acts">
        <a class="btn btn-primary" href="${g.url}" data-game="${g.id}" style="--c:${g.accent};--on:${g.ink}">Play ${esc(g.name)} ${ARROW}</a>
        <button class="btn btn-ghost btn-sm" type="button" data-sheet="${g.id}">How to play</button>
      </div>`;
    info.classList.remove("swap");
    void info.offsetWidth; // restart the entrance animation
    info.classList.add("swap");
  }

  function show(i, { focus = false } = {}) {
    state.i = (i + GAMES.length) % GAMES.length;
    const g = GAMES[state.i];
    hydrate(state.i);
    hydrate(state.i + 1);
    slides.forEach((s, k) => s.classList.toggle("on", k === state.i));
    bgs.forEach((b, k) => b.classList.toggle("on", k === state.i));
    tabEls.forEach((t, k) => {
      const on = k === state.i;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      // restart the progress bar (it's also the rotation timer)
      const bar = $(".bar i", t);
      bar.style.animation = "none";
      void bar.offsetWidth;
      bar.style.animation = "";
    });
    if (focus) tabEls[state.i].focus();
    document.documentElement.style.setProperty("--accent", g.accent);
    renderInfo(g);
    syncOrbyt();
  }

  function syncOrbyt() {
    const slide = $("#slide-orbyt", stage);
    const on = GAMES[state.i].id === "orbyt" && state.visible && !document.hidden;
    if (on && !heroOrbyt) heroOrbyt = new Orbyt($("canvas", slide), { auto: true });
    if (heroOrbyt) on ? heroOrbyt.start() : heroOrbyt.stop();
  }

  function syncPaused() {
    const paused = state.userPaused || state.hover || state.focus || !state.visible || document.hidden;
    root.classList.toggle("paused", paused);
    pauseBtn.setAttribute("aria-pressed", String(state.userPaused));
    pauseBtn.setAttribute("aria-label", state.userPaused ? "Resume rotation" : "Pause rotation");
  }

  // The active tab's progress-bar animation is the timer: when it finishes, advance.
  tabs.addEventListener("animationend", (e) => { if (e.animationName === "fill") show(state.i + 1); });
  tabs.addEventListener("click", (e) => {
    const t = e.target.closest(".cab-tab");
    if (t) show(+t.dataset.i);
  });
  tabs.addEventListener("keydown", (e) => {
    const map = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (e.key in map) show(state.i + map[e.key], { focus: true });
    else if (e.key === "Home") show(0, { focus: true });
    else if (e.key === "End") show(GAMES.length - 1, { focus: true });
    else return;
    e.preventDefault();
  });
  pauseBtn.addEventListener("click", () => { state.userPaused = !state.userPaused; syncPaused(); });
  root.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { state.hover = true; syncPaused(); } });
  root.addEventListener("pointerleave", () => { state.hover = false; syncPaused(); });
  root.addEventListener("focusin", () => { state.focus = true; syncPaused(); });
  root.addEventListener("focusout", (e) => { if (!root.contains(e.relatedTarget)) { state.focus = false; syncPaused(); } });
  watchVisible(root, (v) => { state.visible = v; syncPaused(); syncOrbyt(); });
  document.addEventListener("visibilitychange", () => { syncPaused(); syncOrbyt(); });

  // Pointer parallax: nearer props (higher depth) move further.
  if (finePointer.matches && !reduced.matches) {
    root.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      $$(".cast", slides[state.i]).forEach((c) => {
        const d = +c.dataset.depth;
        c.style.setProperty("--px", `${(nx * d * 22).toFixed(1)}px`);
        c.style.setProperty("--py", `${(ny * d * 16).toFixed(1)}px`);
      });
    });
  }

  if (reduced.matches) root.classList.add("stopped");
  syncPaused();
  show(0);
  return { show };
})();

// ---------------------------------------------------------------- marquee
{
  const set = GAMES.map((g, i) =>
    `<span class="marquee-item${i % 2 ? " o" : ""}"><img src="/games/${g.id}/icon.webp" alt="" width="44" height="44">${esc(g.word)}</span>`).join("");
  $("#marquee").innerHTML = set.repeat(4); // two copies per half, so the -50% loop is seamless on wide screens
}

// ---------------------------------------------------------------- lineup
{
  const list = $("#lineup");
  const filters = $("#filters");
  const last = store.get("mvg:last");
  const PEOPLE = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3 19c.6-3.2 3-5 6-5s5.4 1.8 6 5"/><path d="M16 5.2a3 3 0 0 1 0 5.6M18 14.3c1.6.6 2.7 2.2 3 4.7"/></svg>';

  list.innerHTML = GAMES.map((g) => `
    <li data-id="${g.id}" style="view-transition-name: card-${g.id}">
      <article class="card" style="--c:${g.accent};--bg:${g.bg}">
        <a class="card-art" href="${g.url}" data-game="${g.id}" tabindex="-1" aria-hidden="true">
          <img src="/games/${g.id}/cover.webp" alt="" width="1200" height="630" loading="lazy" decoding="async">
        </a>
        ${g.isNew ? '<span class="badge">New</span>' : ""}
        ${g.id === last ? '<span class="badge last">Last played</span>' : ""}
        <div class="card-body">
          <img class="card-icon" src="/games/${g.id}/icon.webp" alt="" width="62" height="62" loading="lazy">
          <p class="genre">${esc(g.genre)}</p>
          <h3>${esc(g.name)}</h3>
          <p class="pitch">${esc(g.pitch)}</p>
          <ul class="tags" aria-label="Features">${g.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
          <div class="acts">
            <a class="btn btn-primary btn-sm" href="${g.url}" data-game="${g.id}" style="--on:${g.ink}">Play<span class="sr-only"> ${esc(g.name)}</span> ${ARROW}</a>
            <button class="btn btn-ghost btn-sm" type="button" data-sheet="${g.id}">How to play<span class="sr-only">: ${esc(g.name)}</span></button>
          </div>
          <span class="players">${PEOPLE}${g.players}<span class="sr-only"> players</span></span>
        </div>
      </article>
    </li>`).join("");

  const count = (key) => (key === "all" ? GAMES.length : GAMES.filter((g) => g.filters.includes(key)).length);
  filters.innerHTML = FILTERS.map((f, i) =>
    `<button class="chip" type="button" data-f="${f.key}" aria-pressed="${i === 0}">${esc(f.label)}<span class="n">${count(f.key)}</span></button>`).join("");

  filters.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip || chip.getAttribute("aria-pressed") === "true") return;
    const key = chip.dataset.f;
    const apply = () => {
      $$(".chip", filters).forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      $$("li[data-id]", list).forEach((li) => { li.hidden = key !== "all" && !gameById[li.dataset.id].filters.includes(key); });
    };
    document.startViewTransition && !reduced.matches ? document.startViewTransition(apply) : apply();
  });

  // 3D tilt with a glare that follows the pointer.
  if (finePointer.matches && !reduced.matches) {
    for (const card of $$(".card", list)) {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.classList.add("tilting");
        card.style.setProperty("--ry", `${((x - 0.5) * 7).toFixed(2)}deg`);
        card.style.setProperty("--rx", `${((0.5 - y) * 5).toFixed(2)}deg`);
        card.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
        card.style.setProperty("--my", `${(y * 100 * (r.height / (r.width * 630 / 1200))).toFixed(1)}%`);
      });
      card.addEventListener("pointerleave", () => {
        card.classList.remove("tilting");
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    }
  }
}

// ---------------------------------------------------------------- game sheet (how to play)
{
  const sheet = $("#sheet");
  const CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  function open(id) {
    const g = gameById[id];
    const art = g.stage.screen.kind === "wide" ? g.stage.screen.src : `/games/${g.id}/cover.webp`;
    sheet.style.setProperty("--c", g.accent);
    sheet.style.setProperty("--bg", g.bg);
    sheet.innerHTML = `
      <div class="sheet-art"><img src="${art}" alt=""></div>
      <button class="sheet-close" type="button" aria-label="Close">${CLOSE}</button>
      <div class="sheet-body">
        <div class="sheet-head">
          <img src="/games/${g.id}/icon.webp" alt="" width="72" height="72">
          <span class="genre">${esc(g.genre)}</span>
          <h2 id="sheet-title">${esc(g.name)}</h2>
        </div>
        <p style="color:var(--muted)">${esc(g.pitch)}</p>
        <section><h3>How to play</h3><ol class="steps">${g.howTo.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></section>
        <section><h3>Controls</h3>
          <div class="controls-wrap"><table class="controls"><caption class="sr-only">${esc(g.name)} controls</caption>
            <thead><tr>${g.controls.cols.map((c) => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead>
            <tbody>${g.controls.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>
          </table></div>
        </section>
        <section><h3>Modes &amp; features</h3><ul class="tags">${g.modes.map((m) => `<li>${esc(m)}</li>`).join("")}</ul></section>
        <div class="sheet-acts">
          <a class="btn btn-primary" href="${g.url}" data-game="${g.id}" style="--c:${g.accent};--on:${g.ink}">Play ${esc(g.name)} ${ARROW}</a>
          <a class="btn btn-ghost" href="${REPO(g.id)}" rel="noopener">View source on GitHub</a>
        </div>
      </div>`;
    sheet.showModal();
    sheet.scrollTop = 0;
    $(".sheet-close", sheet).focus();
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-sheet]");
    if (btn) open(btn.dataset.sheet);
  });
  sheet.addEventListener("click", (e) => {
    if (e.target === sheet || e.target.closest(".sheet-close")) sheet.close();
  });
}

// ---------------------------------------------------------------- roster (fighter select)
{
  const section = $("#roster");
  const picker = $("#picker");
  const spot = $("#spot");
  const STATS = [["weight", "Weight"], ["speed", "Speed"], ["jump", "Jump"], ["grav", "Fall"]];
  const range = Object.fromEntries(STATS.map(([k]) => {
    const v = FIGHTERS.map((f) => f[k]);
    return [k, [Math.min(...v), Math.max(...v)]];
  }));
  const pct = (k, v) => 22 + (78 * (v - range[k][0])) / (range[k][1] - range[k][0]);

  picker.innerHTML = FIGHTERS.map((f, i) =>
    `<button class="pick" type="button" role="radio" aria-checked="false" tabindex="-1" data-i="${i}" style="--tc:${f.color}" aria-label="${esc(f.name)}">
      <img src="/cast/${f.id}.webp" alt="" loading="lazy" decoding="async"><span>${esc(f.name)}</span>
    </button>`).join("");

  spot.innerHTML = `
    <div class="spot-name-bg" aria-hidden="true"></div>
    <div class="spot-info">
      <div class="spot-meta"><span class="cls"></span><span class="from"></span></div>
      <h3></h3>
      <div class="statbars">${STATS.map(([k, label]) =>
        `<div><span>${label}</span><span class="track"><i data-k="${k}" style="--v:0%"></i></span><b data-k="${k}"></b></div>`).join("")}
      </div>
      <a class="btn btn-primary" href="${gameById.bonkbrawl.url}" data-game="bonkbrawl"></a>
    </div>
    <div class="spot-fig"></div>`;

  const picks = $$(".pick", picker);
  let current = -1;

  function select(i, focus) {
    i = (i + FIGHTERS.length) % FIGHTERS.length;
    if (i === current) return;
    current = i;
    const f = FIGHTERS[i];
    picks.forEach((p, k) => { p.setAttribute("aria-checked", String(k === i)); p.tabIndex = k === i ? 0 : -1; });
    if (focus) picks[i].focus();
    section.style.setProperty("--fc", f.color);

    $(".spot-name-bg", spot).textContent = f.name;
    $(".cls", spot).textContent = f.cls;
    const origin = f.from ? gameById[f.from] : null;
    $(".from", spot).innerHTML = origin
      ? `<img src="/games/${origin.id}/icon.webp" alt="" width="22" height="22">From ${esc(origin.name)}`
      : "A Bonk Brawl original";
    const h3 = $("h3", spot);
    h3.textContent = f.name;
    h3.style.animation = "none"; void h3.offsetWidth; h3.style.animation = "";
    for (const [k] of STATS) {
      $(`i[data-k="${k}"]`, spot).style.setProperty("--v", `${pct(k, f[k])}%`);
      $(`b[data-k="${k}"]`, spot).textContent = f[k];
    }
    const cta = $(".btn", spot);
    cta.style.setProperty("--c", f.color);
    cta.innerHTML = `Brawl as ${esc(f.name)} ${ARROW}`;
    $(".spot-fig", spot).innerHTML = `<img src="/cast/${f.id}.webp" alt="${esc(f.name)}, a ${f.cls.toLowerCase()}-weight fighter" width="460" height="460">`;
  }

  picker.addEventListener("click", (e) => {
    const p = e.target.closest(".pick");
    if (p) select(+p.dataset.i);
  });
  picker.addEventListener("keydown", (e) => {
    const map = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (e.key in map) select(current + map[e.key], true);
    else if (e.key === "Home") select(0, true);
    else if (e.key === "End") select(FIGHTERS.length - 1, true);
    else return;
    e.preventDefault();
  });
  select(0);
}

// ---------------------------------------------------------------- try ORBYT
{
  const frame = $("#try-frame");
  const overlay = $("#try-overlay");
  const scoreEl = $("#try-score");
  const bestEl = $("#try-best");
  const status = $("#try-status");
  let best = +(store.get("mvg:orbyt-best") || 0);
  let playing = false;
  bestEl.textContent = best;

  const game = new Orbyt($("#try-canvas"), {
    auto: true,
    quietAttract: true,
    onScore(s) { if (playing) scoreEl.textContent = s; },
    onDeath(s) {
      if (!playing) return;
      playing = false;
      if (s > best) { best = s; bestEl.textContent = best; store.set("mvg:orbyt-best", best); }
      $("strong", overlay).textContent = s >= best && s > 0 ? "New best!" : "Tap to retry";
      $("span:last-child", overlay).textContent = `You scored ${s}`;
      status.textContent = `Game over. Score ${s}. Best ${best}.`;
      setTimeout(() => frame.classList.remove("playing"), 350);
    },
  });

  function press() {
    if (!playing) {
      if (game.auto || game.dead) {
        game.auto = false;
        game.reset();
        playing = true;
        scoreEl.textContent = "0";
        frame.classList.add("playing");
        status.textContent = "Playing.";
      }
      return;
    }
    game.input();
  }

  frame.addEventListener("pointerdown", (e) => { e.preventDefault(); frame.focus({ preventScroll: true }); press(); });
  frame.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (!e.repeat) press(); }
  });

  let visible = false;
  const sync = () => (visible && !document.hidden ? game.start() : game.stop());
  watchVisible(frame, (v) => { visible = v; sync(); });
  document.addEventListener("visibilitychange", sync);
  game.draw();
}

// ---------------------------------------------------------------- under the hood: rollback visualizer
{
  const viz = $("#net-viz");
  const N = 16;
  viz.innerHTML = `
    <div class="lane"><b>YOU</b>${'<span class="cell"></span>'.repeat(N)}</div>
    <div class="lane"><b>RIVAL</b>${'<span class="cell"></span>'.repeat(N)}</div>
    <div class="net-status" aria-hidden="true"></div>
    <div class="net-legend">
      <span><i style="background:rgba(255,61,127,.75)"></i>Local input</span>
      <span><i style="background:repeating-linear-gradient(135deg,rgba(62,232,255,.35) 0 3px,rgba(62,232,255,.12) 3px 6px)"></i>Predicted</span>
      <span><i style="background:rgba(62,232,255,.7)"></i>Confirmed</span>
      <span><i style="background:#ffd23f"></i>Rollback</span>
    </div>`;
  const [you, rival] = $$(".lane", viz).map((l) => $$(".cell", l));
  const statusEl = $(".net-status", viz);
  const DELAY = 3; // remote inputs arrive 3 frames late
  let f = 0, timer = null, nextMiss = 6;

  function step() {
    const col = f % N;
    if (col === 0) [...you, ...rival].forEach((c) => (c.className = "cell"));
    you.forEach((c, k) => c.classList.toggle("head", k === col));
    rival.forEach((c, k) => c.classList.toggle("head", k === col));
    you[col].classList.add("you");
    rival[col].classList.add("pred");
    const late = col - DELAY;
    if (late >= 0) {
      if (f >= nextMiss) {
        // the late input disagrees with the prediction: rewind and re-simulate
        const span = rival.slice(late, col + 1);
        span.forEach((c) => { c.classList.remove("pred", "conf"); c.classList.add("bad"); });
        statusEl.textContent = `Rollback · re-simulating ${span.length} frames`;
        statusEl.style.opacity = 1;
        setTimeout(() => { span.forEach((c) => { c.classList.remove("bad"); c.classList.add("conf"); }); statusEl.style.opacity = 0; }, 420);
        nextMiss = f + 7 + Math.floor(Math.random() * 6);
      } else if (!rival[late].classList.contains("bad")) {
        rival[late].classList.remove("pred");
        rival[late].classList.add("conf");
      }
    }
    f++;
  }
  // a static, fully-drawn snapshot for reduced motion; animate otherwise (only while on screen)
  if (reduced.matches) { for (let k = 0; k < 12; k++) step(); }
  else watchVisible(viz, (v) => { clearInterval(timer); if (v) timer = setInterval(step, 190); });
}

// ---------------------------------------------------------------- under the hood: synth + scope
{
  const btn = $("#synth-btn");
  const cv = $("#scope");
  const ctx = cv.getContext("2d");
  let analyser = null, until = 0, raf = 0;

  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2), r = cv.getBoundingClientRect();
    cv.width = r.width * dpr; cv.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return r;
  }
  function draw() {
    const { width: w, height: h } = cv.getBoundingClientRect();
    ctx.clearRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, "#ff3d7f"); grad.addColorStop(0.5, "#8b5cff"); grad.addColorStop(1, "#3ee8ff");
    ctx.strokeStyle = grad; ctx.lineWidth = 2.5; ctx.lineJoin = "round";
    ctx.shadowColor = "#8b5cff"; ctx.shadowBlur = 12;
    ctx.beginPath();
    if (analyser && performance.now() < until) {
      const data = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(data);
      for (let i = 0; i < data.length; i++) {
        const x = (i / (data.length - 1)) * w, y = h / 2 + ((data[i] - 128) / 128) * h * 0.9;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
      raf = requestAnimationFrame(draw);
    } else {
      for (let x = 0; x <= w; x += 2) {
        const y = h / 2 + Math.sin(x / 18) * Math.sin(x / w * Math.PI) * h * 0.12;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
      btn.disabled = false;
      $("span", btn).textContent = "Play a synth riff";
    }
  }
  new ResizeObserver(() => { size(); if (!raf || performance.now() > until) draw(); }).observe(cv);

  btn.addEventListener("click", async () => {
    const { playRiff } = await import("./synth.js");
    const r = playRiff();
    analyser = r.analyser;
    until = performance.now() + r.duration * 1000;
    btn.disabled = true;
    $("span", btn).textContent = "Playing…";
    cancelAnimationFrame(raf);
    draw();
  });
}

// ---------------------------------------------------------------- under the hood: sizes, rooms
{
  const max = Math.max(...Object.values(BUILD_BYTES));
  $("#size-bars").innerHTML = GAMES.map((g, i) => {
    const b = BUILD_BYTES[g.id];
    return `<li style="--c:${g.accent}">
      <span class="nm"><img src="/games/${g.id}/icon.webp" alt="" width="20" height="20" loading="lazy">${esc(g.name)}</span>
      <span class="track"><i style="--v:${((b / max) * 100).toFixed(1)}%;--d:${i * 0.08}s"></i></span>
      <span class="val">${(b / 1e6).toFixed(1)} MB</span>
    </li>`;
  }).join("");

  const code = $("#room-code");
  const A = "ABCDEFGHJKMNPQRSTUVWXYZ";
  const rand = () => A[Math.floor(Math.random() * A.length)];
  let t = null;
  function scramble() {
    const target = Array.from({ length: 4 }, rand).join("");
    let n = 0;
    const iv = setInterval(() => {
      code.textContent = target.slice(0, Math.floor(n / 3)) + Array.from({ length: 4 - Math.floor(n / 3) }, rand).join("");
      if (++n > 12) { clearInterval(iv); code.textContent = target; }
    }, 45);
  }
  if (!reduced.matches) watchVisible(code, (v) => { clearInterval(t); if (v) t = setInterval(scramble, 2600); });
}

// ---------------------------------------------------------------- dock + footer
$("#dock").innerHTML = GAMES.map((g) =>
  `<li><a href="${g.url}" data-game="${g.id}"><img src="/games/${g.id}/icon.webp" alt="" width="84" height="84" loading="lazy"><span>${esc(g.name)}</span></a></li>`).join("");
$("#foot-play").innerHTML = GAMES.map((g) => `<li><a href="${g.url}" data-game="${g.id}">${esc(g.name)}</a></li>`).join("");
$("#foot-src").innerHTML = GAMES.map((g) => `<li><a href="${REPO(g.id)}" rel="noopener">${esc(g.id)}</a></li>`).join("");

// ---------------------------------------------------------------- scroll reveal + count-up
{
  const targets = [
    ...$$(".section-head"), ...$$(".lineup > li"), $("#roster-app"), $(".try-copy"), $(".try-play"), $(".closer"),
  ];
  targets.forEach((el) => el.classList.add("reveal"));
  $$(".lineup > li").forEach((li, i) => li.style.setProperty("--rd", `${(i % 3) * 0.08}s`));
  $$(".bento .tile").forEach((t, i) => t.style.setProperty("--rd", `${(i % 4) * 0.06}s`));
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }, { rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach((el) => io.observe(el));

  if (!reduced.matches) {
    for (const dd of $$("[data-count]")) {
      const n = +dd.dataset.count, t0 = performance.now();
      const tick = (now) => {
        const k = Math.min(1, (now - t0) / 1100);
        dd.textContent = Math.round(n * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }
}

export { cab };
