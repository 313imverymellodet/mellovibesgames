// A pocket remake of ORBYT's core loop for the landing page: two rings, one tap to switch,
// spikes to dodge, PERFECTs for last-second switches, and a direction FLIP every 25 points.
// The same engine runs the hero's attract-mode screen on autopilot.

const TAU = Math.PI * 2;
// Spikes live between BEHIND and RUNWAY radians of the player: less than one lap, so a far
// spike is never drawn on top of a near one. They fade at both ends.
const RUNWAY = Math.PI * 1.6, BEHIND = -0.5;
const PALETTES = [
  { bg: "#0b0620", ring: "#8b7bff", spike: "#ff4d8d", player: "#3ee8ff", text: "#f4f0ff" },
  { bg: "#170419", ring: "#ff7ac8", spike: "#ffd23f", player: "#ffffff", text: "#fff2fb" },
  { bg: "#021816", ring: "#3effc2", spike: "#ff5d73", player: "#fff6c9", text: "#eafff8" },
  { bg: "#140c02", ring: "#ffb347", spike: "#3ee8ff", player: "#ffffff", text: "#fff7ea" },
];
const COMBO_WORDS = ["PERFECT", "PERFECT", "CLUTCH", "CLUTCH", "INSANE", "INSANE", "GODLIKE"];

export class Orbyt {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{auto?: boolean, quietAttract?: boolean, onScore?: (s:number)=>void, onDeath?: (s:number)=>void}} opts
   *   quietAttract hides the score while on autopilot, leaving room for a "tap to play" prompt.
   */
  constructor(canvas, opts = {}) {
    this.cv = canvas;
    this.ctx = canvas.getContext("2d");
    this.auto = !!opts.auto;
    this.quietAttract = !!opts.quietAttract;
    this.onScore = opts.onScore || (() => {});
    this.onDeath = opts.onDeath || (() => {});
    this.running = false;
    this.font = getComputedStyle(document.documentElement).getPropertyValue("--font-display").trim() || "sans-serif";
    this._frame = this._frame.bind(this);
    this.resize();
    this.reset();
    new ResizeObserver(() => { this.resize(); if (!this.running) this.draw(); }).observe(canvas);
  }

  resize() {
    const r = this.cv.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(1, r.width);
    this.h = Math.max(1, r.height);
    this.cv.width = Math.round(this.w * this.dpr);
    this.cv.height = Math.round(this.h * this.dpr);
    this.S = Math.min(this.w, this.h);
    this.R = [this.S * 0.25, this.S * 0.4];
  }

  reset() {
    this.ang = -Math.PI / 2;
    this.dir = 1;
    this.ring = 1;
    this.rad = this.R ? this.R[1] : 0;
    this.score = 0;
    this.combo = 0;
    this.pal = 0;
    this.t = 0;
    this.lastSwitch = -9;
    this.dead = false;
    this.deadAt = 0;
    this.shake = 0;
    this.flash = 0;
    this.trail = [];
    this.pops = [];
    this.parts = [];
    this.spikes = [];
    this._seedSpikes(Math.PI * 1.1);
  }

  get speed() { return 1.5 + Math.min(this.score * 0.022, 1.25); }

  // Keep a runway of spikes ahead of the player. `start` is the gap before the first one.
  _seedSpikes(start) {
    let ahead = this.spikes.length ? this._ahead(this.spikes[this.spikes.length - 1]) : start;
    let prevRing = this.spikes.length ? this.spikes[this.spikes.length - 1].ring : this.ring;
    while (ahead < RUNWAY) {
      const minGap = Math.max(0.46, 0.8 - this.score * 0.008);
      const gap = minGap + Math.random() * 0.5;
      const ring = Math.random() < 0.5 ? prevRing : 1 - prevRing;
      if (this.spikes.length) ahead += gap;
      this.spikes.push({ ring, a: this.ang + this.dir * ahead, passed: false });
      prevRing = ring;
    }
  }

  // How far ahead of the player a spike is, in radians along the direction of travel.
  _ahead(s) { return this.dir * (s.a - this.ang); }

  input() {
    if (this.dead) {
      if (this.t - this.deadAt > 0.45) this.reset();
      return;
    }
    this.ring = 1 - this.ring;
    this.lastSwitch = this.t;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.prev = performance.now();
    this.raf = requestAnimationFrame(this._frame);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  _frame(now) {
    if (!this.running) return;
    const dt = Math.min(0.033, (now - this.prev) / 1000);
    this.prev = now;
    this.update(dt);
    this.draw();
    this.raf = requestAnimationFrame(this._frame);
  }

  update(dt) {
    this.t += dt;
    this.shake = Math.max(0, this.shake - dt * 3);
    this.flash = Math.max(0, this.flash - dt * 2.5);
    this.pops = this.pops.filter((p) => (p.life -= dt) > 0);
    for (const p of this.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.96; p.vy *= 0.96; p.life -= dt; }
    this.parts = this.parts.filter((p) => p.life > 0);

    if (this.dead) {
      if (this.auto && this.t - this.deadAt > 1.1) this.reset();
      return;
    }

    if (this.auto) this._autopilot();

    this.ang += this.dir * this.speed * dt;
    const target = this.R[this.ring];
    this.rad += (target - this.rad) * Math.min(1, dt * 22);

    const px = Math.cos(this.ang) * this.rad, py = Math.sin(this.ang) * this.rad;
    this.trail.unshift({ x: px, y: py });
    if (this.trail.length > 16) this.trail.pop();

    const pr = this.S * 0.026, sr = this.S * 0.03;
    for (const s of this.spikes) {
      const d = this._ahead(s);
      const R = this.R[s.ring];
      if (Math.abs(d) * R < pr + sr * 0.75 && Math.abs(this.rad - R) < pr + sr * 0.75) return this._die(px, py);
      if (!s.passed && d < 0) {
        s.passed = true;
        const perfect = s.ring !== this.ring && this.t - this.lastSwitch < 0.2;
        this.score += perfect ? 2 : 1;
        if (perfect) {
          this.combo++;
          this.pops.push({ text: COMBO_WORDS[Math.min(this.combo - 1, COMBO_WORDS.length - 1)], life: 0.9, max: 0.9 });
        } else if (s.ring !== this.ring) this.combo = 0;
        this.onScore(this.score);
        if (Math.floor(this.score / 25) > Math.floor((this.score - (perfect ? 2 : 1)) / 25)) this._flip();
      }
    }
    this.spikes = this.spikes.filter((s) => this._ahead(s) > BEHIND);
    this._seedSpikes(0);
  }

  _flip() {
    this.dir *= -1;
    this.pal = (this.pal + 1) % PALETTES.length;
    this.flash = 1;
    this.spikes = [];
    this._seedSpikes(Math.PI * 0.9);
    this.pops.push({ text: "FLIP!", life: 1, max: 1 });
  }

  _die(x, y) {
    this.dead = true;
    this.deadAt = this.t;
    this.shake = 1;
    const c = PALETTES[this.pal].player;
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * TAU, v = this.S * (0.2 + Math.random() * 0.6);
      this.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.5 + Math.random() * 0.5, c });
    }
    this.onDeath(this.score);
  }

  // Switch when a spike on our ring gets close and the other ring is clear for a bit.
  _autopilot() {
    if (this.t - this.lastSwitch < 0.16) return;
    const trigger = 0.2 + ((this.score * 7919) % 10) / 60; // varies per spike, sometimes a PERFECT
    let threat = null;
    for (const s of this.spikes) {
      const d = this._ahead(s);
      if (s.ring === this.ring && d > 0 && d < trigger) { threat = d; break; }
    }
    if (threat == null) return;
    const other = 1 - this.ring;
    const blocked = this.spikes.some((s) => s.ring === other && this._ahead(s) > -0.2 && this._ahead(s) < threat + 0.3);
    if (!blocked) this.input();
  }

  draw() {
    const { ctx, dpr, w, h, S } = this;
    const P = PALETTES[this.pal];
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = P.bg;
    ctx.fillRect(0, 0, w, h);

    const sx = (Math.random() - 0.5) * this.shake * S * 0.03, sy = (Math.random() - 0.5) * this.shake * S * 0.03;
    ctx.translate(w / 2 + sx, h / 2 + sy);

    // soft core glow
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, this.R[1] * 1.3);
    g.addColorStop(0, P.ring + "33");
    g.addColorStop(1, P.ring + "00");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, this.R[1] * 1.3, 0, TAU); ctx.fill();

    // rings
    for (const R of this.R) {
      ctx.strokeStyle = P.ring + "22"; ctx.lineWidth = S * 0.03;
      ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.stroke();
      ctx.strokeStyle = P.ring + "aa"; ctx.lineWidth = S * 0.008;
      ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.stroke();
    }

    // spikes
    const sr = S * 0.03;
    ctx.fillStyle = P.spike;
    ctx.shadowColor = P.spike;
    ctx.shadowBlur = 14;
    for (const s of this.spikes) {
      const R = this.R[s.ring], d = this._ahead(s);
      ctx.globalAlpha = Math.min(1, (RUNWAY - d) / 0.5, (d - BEHIND) / 0.4);
      ctx.save();
      ctx.translate(Math.cos(s.a) * R, Math.sin(s.a) * R);
      ctx.rotate(s.a + Math.PI / 4);
      ctx.fillRect(-sr * 0.75, -sr * 0.75, sr * 1.5, sr * 1.5);
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    // player + trail
    const pr = S * 0.026;
    ctx.shadowColor = P.player;
    if (!this.dead) {
      ctx.shadowBlur = 0;
      this.trail.forEach((p, i) => {
        ctx.globalAlpha = (1 - i / this.trail.length) * 0.35;
        ctx.fillStyle = P.player;
        ctx.beginPath(); ctx.arc(p.x, p.y, pr * (1 - i / this.trail.length), 0, TAU); ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 18;
      ctx.fillStyle = P.player;
      ctx.beginPath(); ctx.arc(Math.cos(this.ang) * this.rad, Math.sin(this.ang) * this.rad, pr, 0, TAU); ctx.fill();
    }
    ctx.shadowBlur = 0;
    for (const p of this.parts) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    }
    ctx.globalAlpha = 1;

    // score + popups
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = P.text;
    ctx.font = `800 ${Math.round(S * 0.13)}px ${this.font}`;
    if (!(this.auto && this.quietAttract)) ctx.fillText(String(this.score), 0, 0);
    for (const p of this.pops) {
      const k = 1 - p.life / p.max;
      ctx.globalAlpha = Math.min(1, p.life * 3);
      ctx.fillStyle = p.text === "FLIP!" ? P.spike : P.player;
      ctx.font = `800 ${Math.round(S * 0.05)}px ${this.font}`;
      ctx.fillText(p.text, 0, -S * 0.1 - k * S * 0.05);
    }
    ctx.globalAlpha = 1;

    if (this.flash > 0) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = `rgba(255,255,255,${this.flash * 0.25})`;
      ctx.fillRect(0, 0, w, h);
    }
  }
}
