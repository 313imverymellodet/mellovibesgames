// Two bars of synthwave, generated on the spot with the Web Audio API: the same trick the
// games use for all their music and sound effects (no audio files anywhere).

let ctx = null;

/** Plays the riff and returns an AnalyserNode for visualizing it, plus its duration in seconds. */
export function playRiff() {
  ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();

  const t0 = ctx.currentTime + 0.05;
  const bpm = 128, step = 60 / bpm / 4; // 16th notes
  const master = ctx.createGain();
  master.gain.value = 0.55;
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  master.connect(analyser).connect(ctx.destination);

  // A minor → F → C → G, one chord per half bar
  const chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  for (let i = 0; i < 32; i++) {
    const t = t0 + i * step;
    const chord = chords[Math.floor(i / 8)];
    // arpeggio: up-down through the chord, an octave up
    const note = chord[[0, 1, 2, 1][i % 4]] + 12 + (i % 8 >= 4 ? 12 : 0);
    voice(t, hz(note), step * 0.9, "sawtooth", 0.09, 2400);
    // bass on 8ths
    if (i % 2 === 0) voice(t, hz(chord[0] - 24), step * 1.8, "square", 0.12, 600);
    // kick on quarters, snare on 2 and 4
    if (i % 4 === 0) kick(t);
    if (i % 8 === 4) snare(t);
  }
  // final chord pad
  const end = t0 + 32 * step;
  for (const m of [57, 60, 64, 69]) voice(end, hz(m), 1.2, "triangle", 0.08, 1800);

  function voice(t, f, dur, type, vol, cutoff) {
    const o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = type;
    o.frequency.value = f;
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(cutoff, t);
    lp.frequency.exponentialRampToValueAtTime(cutoff * 0.3, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(lp).connect(g).connect(master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
  function kick(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.2);
  }
  function snare(t) {
    const len = Math.floor(ctx.sampleRate * 0.15);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = buf;
    hp.type = "highpass";
    hp.frequency.value = 1200;
    g.gain.value = 0.22;
    src.connect(hp).connect(g).connect(master);
    src.start(t);
  }

  return { analyser, duration: 32 * step + 1.3 };
}
