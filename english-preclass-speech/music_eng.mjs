// music_eng.mjs: a quiet score for "The Map Inside" (src/scenes/eng.js), synthesised from scratch, meant to sit under a
// live speaker. 84 bpm in story time (70 bpm as played) = PROJECT.bpm in src/config_eng.js. One section per stretch of the film; soft stingers on events.
//   node music_eng.mjs            → assets/eng_bgm.wav (music only, quiet)
//   node vo_eng.mjs first, then   → assets/eng_rehearsal.wav (guide voice + music, for practising the talk)
import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

// S: the film plays 1.2× slower than its story timing (eng.js SLOW); onsets and sustains stretch, timbres don't.
const S = 1.2, SR = 44100, DUR = 146 * S, N = Math.ceil(SR * DUR), BEAT = 60 / 84, BAR = 4 * BEAT, TAU = Math.PI * 2;
const L = new Float32Array(N), R = new Float32Array(N);
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function add(t, len, pan, fn) {
  const i0 = Math.floor(t * S * SR), n = Math.floor(len * SR), gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < n && i0 + i < N; i++) { if (i0 + i < 0) continue; const v = fn(i / SR); L[i0 + i] += v * gl; R[i0 + i] += v * gr; }
}
const env = (tt, a, d) => (tt < a ? tt / a : Math.exp(-(tt - a) / d));

// ---------- instruments ----------
const kalimba = (t, m, v = .12, pan = 0) => { const f = hz(m); add(t, 1.8, pan, tt => v * env(tt, .004, .5) * (Math.sin(TAU * f * tt) + .25 * Math.sin(TAU * f * 5.4 * tt) * Math.exp(-tt * 18) + .1 * Math.sin(TAU * f * 2 * tt) * Math.exp(-tt * 6))); };
const mbox = (t, m, v = .06, pan = 0) => { const f = hz(m); add(t, 1.6, pan, tt => v * env(tt, .001, .55) * (Math.sin(TAU * f * tt) + .4 * Math.sin(TAU * f * 3 * tt) * Math.exp(-tt * 14))); };
const pizz = (t, m, v = .12, pan = -.1) => { const f = hz(m); add(t, .7, pan, tt => { const e = env(tt, .005, .18); let s = 0; for (let k = 1; k <= 4; k++) s += Math.sin(TAU * f * k * tt) * Math.exp(-tt * k * 7) / k; return v * e * s; }); };
const bass = (t, m, len, v = .1) => { len *= S; const f = hz(m); add(t, len + .6, 0, tt => v * Math.min(1, tt / .04) * (tt > len ? Math.exp(-(tt - len) / .2) : 1) * Math.exp(-tt * .25) * (Math.sin(TAU * f * tt) + .2 * Math.sin(TAU * f * 2 * tt))); };
const pad = (t, len, ms, v = .028, cut = .04) => {
  len *= S;
  ms.forEach((m, j) => { for (const det of [-.07, .07]) {
    const f = hz(m + det * .1), ph = rnd(); let lp = 0, lp2 = 0;
    add(t, len + 1.2, (j / (ms.length - 1 || 1)) * 1.2 - .6, tt => {
      const a = Math.min(1, tt / .8) * (tt > len ? Math.exp(-(tt - len) / .45) : 1), saw = 2 * ((f * tt + ph) % 1) - 1;
      lp += (saw - lp) * cut; lp2 += (lp - lp2) * cut; return v * a * lp2;
    });
  } });
};
const thump = (t, v = .25) => add(t, .8, 0, tt => v * Math.exp(-tt * 7) * Math.sin(TAU * (48 + 40 * Math.exp(-tt * 20)) * tt));
const chime = (t, m, v = .05) => [0, 7, 12].forEach((d, i) => mbox(t + i * .06, m + d, v, i * .3 - .3));
const swell = (t, len, v = .02) => { len *= S; let lp = 0; add(t, len, 0, tt => { lp += ((rnd() * 2 - 1) - lp) * .02; return v * lp * Math.sin(Math.PI * tt / len) ** 2; }); };

// ---------- the score: [start, end, chords (midi roots + voicings), texture] ----------
const C = { Am: [57, 60, 64, 67], F: [53, 57, 60, 64], C: [48, 55, 60, 64], G: [55, 59, 62, 67], Dm: [50, 57, 60, 65], Em: [52, 55, 59, 64], Bb: [46, 53, 58, 62], E: [52, 56, 59, 64] };
const SECTIONS = [
  [0, 17.8, ['Am', 'F', 'Am', 'F'], 'night'],
  [17.8, 26.9, ['C', 'G', 'Am', 'F'], 'bright'],
  [26.9, 49.4, ['Dm', 'G', 'C', 'Am'], 'walk'],
  [49.4, 71.9, ['Em', 'C', 'G', 'Em'], 'fog'],
  [71.9, 90.5, ['Dm', 'Bb', 'F', 'C'], 'dusk'],
  [92.0, 101.6, ['Am', 'E', 'Am', 'F'], 'pit'],
  [101.6, 125.2, ['F', 'G', 'Am', 'C'], 'rise'],
  [125.2, 146, ['C', 'F', 'Am', 'G', 'F', 'C'], 'home'],
];
for (const [t0, t1, prog, tex] of SECTIONS) {
  for (let b = 0, t = t0; t < t1 - .2; b++, t += BAR) {
    const ch = C[prog[b % prog.length]], len = Math.min(BAR, t1 - t);
    pad(t, len, ch.slice(1).map(m => m + (tex === 'pit' ? -12 : 0)), tex === 'pit' ? .02 : .026);
    if (tex !== 'night' && tex !== 'pit') bass(t, ch[0] - 12, len * .9, .08);
    for (let k = 0; k < 8; k++) {                                       // eighth-note patterns, per texture
      const tt = t + k * BEAT / 2; if (tt > t1 - .1) break;
      const up = ch.map(m => m + 12), pick = up[[0, 2, 1, 3, 2, 1, 3, 2][k]];
      if (tex === 'night' && k % 4 === 0) mbox(tt, pick + 12, .045, .3);
      if (tex === 'bright' && k % 2 === 0) kalimba(tt, pick, .09, k % 4 ? .3 : -.3);
      if (tex === 'walk') { if (k % 2 === 0) pizz(tt, ch[k % 4 === 0 ? 0 : 2], .1); if (k % 4 === 2) kalimba(tt, pick, .06, .3); }
      if (tex === 'fog' && k % 4 === 0) mbox(tt, pick, .04, k ? .4 : -.4);
      if (tex === 'dusk' && k % 2 === 0) pizz(tt, ch[[0, 1, 2, 1][k / 2]] , .08);
      if (tex === 'rise') { const dens = (t - t0) / (t1 - t0); if (k % (dens > .5 ? 1 : 2) === 0) kalimba(tt, pick, .05 + .04 * dens, k % 2 ? .35 : -.35); }
      if (tex === 'home' && k % 2 === 0) kalimba(tt, pick, .07, k % 4 ? .3 : -.3);
    }
  }
}
// events on the picture
chime(5.6, 72); chime(12.2, 76, .06); chime(20.4, 79, .05);
chime(40.3, 74, .05); chime(50.7, 71, .04); chime(56.5, 76, .05);
[82.5, 82.88, 83.26, 83.64, 84.02, 84.4].forEach((t, i) => mbox(t, 74 + [0, 2, 4, 5, 7, 9][i], .05, .2));
swell(89.8, 1.6, .03); thump(92.05, .22); thump(92.5, .3); for (let i = 0; i < 8; i++) mbox(92.9 + i * .06, 84 + (i % 3) * 3, .03, .5);
chime(107.6, 72, .04); chime(123.4, 72, .05); swell(123.2, 2.4, .025);
chime(136.3, 79, .05);
// the end: one last C, then a fade
pad(143, 3, [60, 64, 67], .02);
for (let i = 0; i < N; i++) { const t = i / SR, g = Math.min(1, t / 1.5) * (t > 143 * S ? Math.max(0, 1 - (t - 143 * S) / (3 * S)) : 1); L[i] *= g; R[i] *= g; }

function writeWav(path, chans) {
  const n = chans[0].length, nc = chans.length, buf = Buffer.alloc(44 + n * 2 * nc);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2 * nc, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(nc, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2 * nc, 28); buf.writeUInt16LE(2 * nc, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 2 * nc, 40);
  let pk = 0; for (const c of chans) for (let i = 0; i < n; i++) pk = Math.max(pk, Math.abs(c[i]));
  const g = pk > .9 ? .9 / pk : 1;
  for (let i = 0; i < n; i++) for (let c = 0; c < nc; c++) buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, chans[c][i] * g)) * 32767), 44 + (i * nc + c) * 2);
  writeFileSync(path, buf);
}
writeWav('assets/eng_bgm_raw.wav', [L, R]);
// quiet: it has to sit under a live voice in a classroom
spawnSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', 'assets/eng_bgm_raw.wav', '-af', 'loudnorm=I=-27:TP=-6:LRA=9', '-ar', '44100', 'assets/eng_bgm.wav'], { stdio: 'inherit' });
if (existsSync('assets/eng_vo.wav'))
  spawnSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', 'assets/eng_vo.wav', '-i', 'assets/eng_bgm.wav', '-filter_complex', '[0:a]aformat=channel_layouts=stereo,volume=1.0[v];[v][1:a]amix=inputs=2:duration=longest:normalize=0,loudnorm=I=-16:TP=-1.5[o]', '-map', '[o]', '-ar', '44100', 'assets/eng_rehearsal.wav'], { stdio: 'inherit' });
console.log('wrote assets/eng_bgm.wav' + (existsSync('assets/eng_vo.wav') ? ' and assets/eng_rehearsal.wav' : ''));
