// eng.js: "The Map Inside", 146 s. The background film for the talk in SPEECH.md (why learn English in the GenAI era).
// Clawd follows a glowing map pin (the AI) everywhere, never learns the city, walks off a bridge the pin swore was
// real, then draws its own map, until the edge of its world moves. Timings follow the guide read (vo_eng.mjs).
// See STORYBOARD_ENG.md for the reads.
(() => {
  // ---------- palette ----------
  const Z = {
    wallN: '#252850', wallD: '#E8C7A0', deskN: '#3B3152', deskD: '#B88A63',
    pin: '#7B62C8', pinDk: '#56419A', pinLt: '#A995EC', pinGlow: '#B9A6FF',
    gold: '#F2C14E', paper: '#F4ECDA', cardLine: '#8B7F9A',
    slate: '#A7BBBB', slateG: '#8A9A95', fog: '#DADCDC', fogG: '#C7C9CA', fogB: '#BEC2C7',
    duskHi: '#F2B27C', duskMid: '#D98A83', duskLo: '#7E5A8C', rock: '#5A4460', rockDk: '#3E2E48',
    pit: '#3A2C44', pitFl: '#4C3B53', void: '#2C3150', warm: '#F7D9A8',
    cab: '#4F7E88', cabDk: '#355B63', cabLt: '#86AEB4', wood: '#9C6B43', woodDk: '#6E4A2E'
  };
  const CITY = ['#E0896A', '#E9B85C', '#8FB57A', '#6FA3B8', '#C98BB0', '#E7A07A', '#B7A16E'];
  let VIS = [-1e9, 1e9];
  function cam(cx, cy, z, rot = 0) { camBegin(cx, cy, z, rot); VIS = [cx - W / 2 / z - 300, cx + W / 2 / z + 300]; }
  const seen = (x, r = 300) => x + r > VIS[0] && x - r < VIS[1];
  const K = (t, keys, e = ease) => kf(t, keys, e);

  // ---------- small painted things ----------
  function squiggle(x0, x1, y, amp, n, sw, col) { const P = []; for (let i = 0; i <= n; i++) { const k = i / n; P.push([lerp(x0, x1, k), y + Math.sin(k * n * 1.3 + x0) * amp]); } inkLine(P, sw, col, 'inkfine', .6); }
  function scribble(x0, x1, y, h, n, sw, col) { const P = []; for (let i = 0; i <= n; i++) P.push([lerp(x0, x1, i / n) + (hash(i + x0) - .5) * h * .6, y + (i % 2 ? -h : h) * (.5 + .5 * hash(i * 3 + y))]); inkLine(P, sw, col, 'inkfine', .2); }
  function bubblePts(w, h, tail = 1) {
    const P = [];
    for (let i = 0; i < 36; i++) {
      const a = i / 36 * TAU, c = Math.cos(a), s = Math.sin(a), e = .55;
      P.push([Math.sign(c) * Math.pow(Math.abs(c), e) * w / 2, Math.sign(s) * Math.pow(Math.abs(s), e) * h / 2]);
      if (tail && i === 12) P.push([-w * .3 * tail, h * .5], [-w * .42 * tail, h * .85], [-w * .16 * tail, h * .52]);
    }
    return P;
  }
  // a speech bubble: squiggle lines unless o.blank; o.hat puts one of Clawd's hats on it; o.double = a pun (two layers)
  function bubble(x, y, w, h, k, o = {}) {
    if (k <= .01) return; boilSeed('bub' + (o.key || ''));
    push(); translate(x, y); rotate(o.rot || 0); scale(k);
    if (o.glow) glow(0, 0, w * .9, o.glowCol || '#FFD9A0', o.glow);
    if (o.double) paint(bubblePts(w, h, 0).map(([a, b]) => [a + w * .06, b - h * .08]), { wash: '#F3C6CF', ink: PAL.ink, sw: .8, curv: .2 });
    paint(bubblePts(w, h, o.tail ?? 1), { wash: o.col || PAL.cream, washOp: 255 * (o.alpha ?? 1), ink: PAL.ink, sw: o.sw ?? 1, curv: .2 });
    if (!o.blank) {
      const lc = o.lineCol || Z.cardLine;
      squiggle(-w * .32, w * .32, -h * .18, h * .04, 8, 1, lc); squiggle(-w * .32, w * .22, h * .04, h * .04, 7, 1, lc);
      if (h > 90) squiggle(-w * .32, w * .05, h * .24, h * .04, 5, 1, lc);
      if (o.double) squiggle(-w * .26, w * .3, -h * .1, h * .06, 8, 1, '#D9607A');
    }
    if (o.hat) { const hu = w / 13; push(); translate(0, -h * .42 + 8 * hu); hat(hu, o.hat, clamp(hu / 15, .45, 1.2)); pop(); }
    if (o.bowtie) { const b = w * .09; paint([[-b * 1.4, h * .5 + b * .2], [0, h * .5 + b * .8], [-b * 1.4, h * .5 + b * 1.4]], { wash: PAL.ink, ink: null }); paint([[b * 1.4, h * .5 + b * .2], [0, h * .5 + b * .8], [b * 1.4, h * .5 + b * 1.4]], { wash: PAL.ink, ink: null }); }
    pop();
  }
  // a vocabulary card; neat = translated by the pin (straight lines, a gold edge)
  function card(x, y, w, rot = 0, o = {}) {
    boilSeed('card' + (o.key ?? ''));
    const h = w * .62, sx = o.sx ?? 1; if (Math.abs(sx) < .02) return;
    push(); translate(x, y); rotate(rot); scale(sx, 1);
    if (o.flashK) glow(0, 0, w * 1.2, '#FFE6A0', o.flashK);
    paint(rrPts(-w / 2, -h / 2, w, h, w * .06), { wash: o.blank ? '#FBF4E6' : PAL.cream, ink: o.neat ? '#C9962F' : PAL.ink, sw: o.neat ? 1.3 : .8 });
    if (o.scrawl) { for (let i = 0; i < 3; i++) scribble(-w * .38, w * .36, -h * .22 + i * h * .22, h * .07, 9, .8, '#5B4B6A'); }
    else if (!o.blank) {
      if (o.neat) for (let i = 0; i < 3; i++) inkLine([[-w * .34, -h * .2 + i * h * .2], [w * (i === 2 ? .05 : .34), -h * .2 + i * h * .2]], .9, '#6E6380', 'inkfine', 0);
      else { squiggle(-w * .34, w * .3, -h * .16, h * .08, 7, .9, Z.cardLine); squiggle(-w * .34, w * .1, h * .12, h * .08, 5, .9, Z.cardLine); }
    }
    pop();
  }
  function sparkle(x, y, r, k, col = PAL.cream) { if (k > 0 && k < 1) paint(starPts(x, y, r * backOut(k) * (1 - k * .5), .28, 4, k * 1.5), { wash: col, washOp: 255 * (1 - k * k), ink: null }); }
  function puff(x, y, r, k, col = '#C9C2CF') {
    if (k <= 0 || k >= 1) return;
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + .4, d = r * (.4 + 1.2 * easeOut(k)); paint(ellPts(x + Math.cos(a) * d, y + Math.sin(a) * d, r * (1 - k) * .6, r * (1 - k) * .6, 10), { wash: col, washOp: 230 * (1 - k), ink: null }); }
  }
  function streaks(k, dir, cols) {
    if (k <= .02) return; boilSeed('streak');
    for (let i = 0; i < 16; i++) {
      const y = hash(i + 50) * H, len = (300 + 500 * hash(i)) * k, x = hash(i + 80) * W;
      paint(ribbon([[x - dir * len, y], [x, y + 2], [x + dir * len * .3, y]], 2, 10 + 16 * hash(i + 9)), { wash: cols[i % cols.length], washOp: 200 * k, ink: null });
    }
    if (k > .5) paint(rectPts(-50, -50, W + 100, H + 100), { wash: cols[0], washOp: 255 * (k - .5) * 2 * .9, ink: null });
  }
  function thought(x, y, w, h, k, o = {}) {
    if (k <= .01) return; boilSeed('thought' + (o.key || ''));
    const a = o.alpha ?? 1, tail = o.tail ?? -1;
    for (const [dx, dy, r] of [[tail * 70, h * .5 + 70, 11], [tail * 45, h * .5 + 34, 18]]) paint(ellPts(x + dx * k, y + dy * k, r * k, r * k, 12), { wash: PAL.cream, washOp: 255 * a, ink: a > .4 ? PAL.ink : null, sw: .7 });
    const P = []; for (let i = 0; i < 48; i++) { const q = i / 48 * TAU, r = 1 + .1 * Math.abs(Math.sin(q * 4.5)); P.push([x + Math.cos(q) * w / 2 * r * k, y + Math.sin(q) * h / 2 * r * k]); }
    paint(P, { wash: PAL.cream, washOp: 255 * a, ink: a > .4 ? PAL.ink : null, sw: .9, curv: .3 });
  }
  // a little street network inside a box (for thought maps); n = how many streets, a = strength
  function miniMap(x, y, w, h, n, a, key) {
    for (let i = 0; i < n; i++) {
      boilSeed(key + i);
      const hor = i % 2 === 0, p = hash(i * 7 + 3), q = hash(i * 13 + 1), r = hash(i * 5 + 11);
      const P = hor ? [[x - w / 2 + w * .1 * q, y - h / 2 + h * (.15 + .7 * p)], [x + w / 2 - w * .1 * r, y - h / 2 + h * (.15 + .7 * (p * .8 + r * .2))]]
                    : [[x - w / 2 + w * (.12 + .76 * p), y - h / 2 + h * .1 * q], [x - w / 2 + w * (.12 + .76 * (p * .85 + q * .15)), y + h / 2 - h * .1 * r]];
      inkLine(P, 1.3, mixCol(Z.cardLine, '#5A4E6A', a), 'ink', 0);
      if (i % 3 === 0) paint(ellPts(P[1][0], P[1][1], 5, 5, 8), { wash: CITY[i % CITY.length], washOp: 255 * a, ink: null });
    }
  }

  // ---------- the Pin: the AI. A glowing map pin with two dot eyes ----------
  function pin(t, x, y, s, o = {}) {
    if ((o.k ?? 1) <= .01) return;
    boilSeed('pin' + (o.key || ''));
    const k = o.k ?? 1, g = o.glow ?? .55, sq = o.sq || 0;
    if (g > .01) glow(x, y + s * .3, s * 3.4 * (o.gs || 1), Z.pinGlow, g);
    if (o.shadowY) paint(ellPts(x, o.shadowY, s * .9, s * .18, 14), { fill: PAL.ink, fillOp: 60, bleed: .2, ink: null });
    push(); translate(x, y); rotate(o.rot || 0); scale(k * (1 + sq * .6), k * (1 - sq));
    const b = Math.acos(1 / 1.75), P = [];
    for (let i = 0; i <= 26; i++) { const a = lerp(Math.PI / 2 + b, Math.PI / 2 - b + TAU, i / 26); P.push([Math.cos(a) * s, Math.sin(a) * s]); }
    P.push([0, s * 1.75]);
    paint(P, { wash: mixCol(Z.pin, '#E8E0FF', o.bright || 0), fill: Z.pinDk, fillOp: 70, tex: .5, ink: PAL.ink, sw: clamp(s / 30, .5, 1.3) });
    paint(ellPts(-s * .45, -s * .55, s * .22, s * .12, 10, 0, -.6), { wash: Z.pinLt, ink: null });
    paint(ellPts(0, 0, s * .6, s * .6, 20), { wash: PAL.cream, ink: PAL.ink, sw: clamp(s / 40, .4, 1) });
    const lx = (o.lookX || 0) * s * .12, ly = (o.lookY || 0) * s * .12, blink = frac((t + (o.seed || 0)) / 3.4) > .965;
    for (const sd of [-1, 1]) {
      const ex = sd * s * .23 + lx, ey = ly - s * .02;
      if (o.eyes === 'happy') inkLine([[ex - s * .1, ey + s * .05], [ex, ey - s * .07], [ex + s * .1, ey + s * .05]], clamp(s / 30, .6, 1.6), PAL.ink, 'ink', .5);
      else if (o.eyes === 'narrow') paint(rectPts(ex - s * .1, ey - s * .02, s * .2, s * .07), { wash: PAL.ink, ink: null });
      else if (blink || o.eyes === 'closed') inkLine([[ex - s * .09, ey], [ex + s * .09, ey]], clamp(s / 30, .6, 1.6), PAL.ink, 'ink', 0);
      else paint(ellPts(ex, ey, s * .085, s * .125, 10), { wash: PAL.ink, ink: null });
    }
    pop();
  }
  const pinBob = (t, ph = 0) => 10 * Math.sin(t * 2.4 + ph);

  // ---------- Clawd's arm tip in world space (front / q view, like opus.js) ----------
  const tipOf = (x, y, u, a, side, flip = false, view = 'front') => {
    const V = view === 'q' ? (side > 0 ? [5, 1] : [-4.7, -1]) : (side > 0 ? [4.9, 1] : [-4.9, -1]);
    const dir = V[1] * (flip ? -1 : 1), px = V[0] * (flip ? -1 : 1) + dir * .55 * clamp((Math.abs(a) - .7) / .9);
    return [x + (px + dir * Math.cos(a) * 2.2) * u, y - 4.5 * u - Math.sin(a) * 2.2 * u];
  };

  // ---------- buildings of the city of language ----------
  // kind: 0 book (a standing book, spine bands), 1 bubble tower, 2 stacked books. fog 0..1 greys it out, k grows it.
  function building(x, gy, w, h, kind, col, o = {}) {
    const k = o.k ?? 1; if (k <= .01) return;
    boilSeed('bld' + (o.key ?? x));
    const fog = o.fog || 0, c = mixCol(col, o.fogCol || Z.fog, fog), ink = fog > .6 ? null : PAL.ink, sw = .9;
    push(); translate(x, gy); scale(1, backOut(k));
    if (kind === 1) {
      paint(rectPts(-w * .35, -h * .62, w * .7, h * .62, 2), { wash: c, ink, sw });
      paint(bubblePts(w, h * .5, 0).map(([a, b]) => [a, b - h * .78]), { wash: mixCol(c, PAL.cream, .35), ink, sw, curv: .2 });
      if (fog < .5) { squiggle(-w * .28, w * .28, -h * .82, 4, 7, .9, mixCol(c, PAL.ink, .5)); squiggle(-w * .28, w * .1, -h * .72, 4, 5, .9, mixCol(c, PAL.ink, .5)); }
    } else if (kind === 2) {
      const ws = [1, .82, .9], hs = [.36, .3, .34]; let yy = 0;
      ws.forEach((m, i) => { const bh = h * hs[i]; paint(rectPts(-w * m / 2 + (i - 1) * 8, yy - bh, w * m, bh, 2), { wash: mixCol(CITY[(i + (o.key | 0)) % CITY.length], o.fogCol || Z.fog, fog), ink, sw }); if (fog < .5) inkLine([[-w * m / 2 + (i - 1) * 8 + 10, yy - bh * .5], [w * m / 2 + (i - 1) * 8 - 10, yy - bh * .5]], .7, PAL.cream, 'inkfine', 0); yy -= bh; });
    } else {
      paint(rrPts(-w / 2, -h, w, h, w * .08, 2), { wash: c, ink, sw });
      if (fog < .5) for (const f of [.12, .86]) inkLine([[-w / 2 + 4, -h * f], [w / 2 - 4, -h * f]], 1.1, mixCol(c, PAL.ink, .45), 'inkfine', 0);
    }
    if (fog < .5 && kind !== 1) for (let r = 0; r < 3; r++) for (let q = 0; q < 2; q++) paint(rectPts(-w * .28 + q * w * .34, -h * (.72 - r * .2), w * .2, h * .1), { wash: o.lit ? '#FFE3A6' : mixCol(c, PAL.cream, .55), ink: null });
    if (o.door) { if (o.door > .01) glow(0, -h * .1, w * 1.1, '#FFC978', o.door); paint(rrPts(-w * .13, -h * .22, w * .26, h * .22, w * .1), { wash: mixCol('#6E5A55', '#FFD27E', o.door), ink: PAL.ink, sw: .8 }); }
    pop();
  }
  // a row of buildings from x0 to x1, the same every frame (hash)
  function cityRow(key, x0, x1, gy, o = {}) {
    let x = x0, i = 0;
    while (x < x1) {
      const w = (o.w || 150) * (.75 + .6 * hash(i * 3 + key)), h = (o.h || 300) * (.6 + .8 * hash(i * 5 + key + 1)), kind = Math.floor(hash(i * 7 + key + 2) * 3);
      const cx = x + w / 2;
      if (seen(cx, w)) building(cx, gy, w, h, kind, CITY[(i + key) % CITY.length], { fog: o.fog, fogCol: o.fogCol, key: key * 100 + i, k: o.kAt ? o.kAt(cx) : 1, lit: o.lit });
      x += w + (o.gap ?? 14) + 30 * hash(i + key * 9); i++;
    }
  }
  function ground(col, gy, x0 = VIS[0] - 400, x1 = VIS[1] + 400, key = 'ground') {
    boilSeed(key);
    paint(rectPts(x0, gy, x1 - x0, 1800, 3), { wash: col, fill: mixCol(col, PAL.ink, .12), fillOp: 60, bleed: .06, tex: .6, ink: null });
    for (let x = Math.floor(x0 / 1400) * 1400; x < x1; x += 1400) inkLine([[x, gy], [x + 700, gy - 1], [x + 1400, gy]], .7, mixCol(col, PAL.ink, .45), 'inkfine', 0);
  }
  function sky(col, key = 'sky', col2) {
    boilSeed(key);
    paint(rectPts(VIS[0] - 400, -1600, VIS[1] - VIS[0] + 800, 4000), { wash: col, ink: null });
    if (col2) paint(ellPts((VIS[0] + VIS[1]) / 2, 700, 1500, 380, 24, 6), { fill: col2, fillOp: 120, bleed: .3, tex: .5, ink: null });
  }

  // ---------- the desk (shots 1 and 9): D = 0 midnight, 1 dawn ----------
  function desk(t, D, o = {}) {
    boilSeed('wall'); paint(rectPts(-900, -900, W + 1800, 2000), { wash: mixCol(Z.wallN, Z.wallD, D), ink: null });
    // the window, right: night stars, or the coloured city at dawn
    boilSeed('window');
    const wx = 1300, wy = 130, ww = 440, wh = 340;
    paint(rrPts(wx, wy, ww, wh, 14, 2), { wash: mixCol('#141735', '#F6CFA0', D), ink: PAL.ink, sw: .9 });
    if (D > .5) {
      boilSeed('dawnSun'); glow(wx + ww * .7, wy + wh * .55, 260, '#FFC978', .8 * D);
      paint(ellPts(wx + ww * .7, wy + wh * .62, 44, 44, 18), { wash: '#FBE3B0', ink: null });
      for (let i = 0; i < 8; i++) { boilSeed('wcity' + i); const bw = 34 + 26 * hash(i + 2), bh = 60 + 120 * hash(i + 5), bx = wx + 10 + i * 54; paint(rectPts(bx, wy + wh - bh, bw, bh - 2), { wash: CITY[i % CITY.length], ink: PAL.ink, sw: .6 }); paint(rectPts(bx + bw * .3, wy + wh - bh * .7, bw * .3, bh * .12), { wash: '#FFE8B8', ink: null }); }
    } else for (let i = 0; i < 7; i++) { boilSeed('wstar' + i); const x = wx + 20 + hash(i + 7) * (ww - 40), y = wy + 20 + hash(i + 17) * (wh - 40), tw = .6 + .4 * Math.sin(t * 2.3 + i * 1.7); paint(ellPts(x, y, 2.6 * tw, 2.6 * tw, 6), { wash: '#F6E7C6', ink: null }); }
    boilSeed('wframe'); inkLine([[wx + ww / 2, wy + 2], [wx + ww / 2, wy + wh - 2]], 1, PAL.ink, 'ink', 0); inkLine([[wx + 2, wy + wh / 2], [wx + ww - 2, wy + wh / 2]], 1, PAL.ink, 'ink', 0);
    if (o.openK) { boilSeed('wopen'); paint([[wx + ww / 2, wy], [wx + ww / 2 + 150 * o.openK, wy + 30], [wx + ww / 2 + 150 * o.openK, wy + wh - 30], [wx + ww / 2, wy + wh]], { wash: '#B9D3DA', washOp: 200, ink: PAL.ink, sw: .8 }); }
    // Clawd's own map, pinned to the wall (the ending)
    if (o.wallMap) { boilSeed('wallmap'); push(); translate(420, 300); rotate(-.04); paint(rectPts(-190, -130, 380, 260, 3), { wash: Z.paper, ink: PAL.ink, sw: .9 }); miniMap(0, 0, 340, 220, 12, .25, 'wm'); pop(); paint(ellPts(420, 176, 9, 9, 10), { wash: PAL.rose, ink: PAL.ink, sw: .6 }); }
    boilSeed('desk'); paint(rectPts(-900, 740, W + 1800, 900, 3), { wash: mixCol(Z.deskN, Z.deskD, D), fill: mixCol('#1A1628', Z.woodDk, D), fillOp: 70, bleed: .05, tex: .7, ink: null });
    inkLine([[-300, 742], [960, 740], [2200, 742]], .8, PAL.ink, 'inkfine', 0);
    // lamp, left
    boilSeed('lamp'); const L = o.lamp ?? 1;
    if (L > .02) { glow(200, 470, 520 * L, '#FFC66E', .8 * L * (1 - D * .6)); glow(700, 820, 700 * L, '#FFB860', .4 * L * (1 - D * .7)); }
    paint(rectPts(130, 700, 150, 26, 2), { wash: '#4C4A5E', ink: PAL.ink, sw: .9 });
    inkLine([[205, 700], [180, 570], [200, 450]], 2.2, '#4C4A5E', 'ink', .4);
    paint([[120, 340], [280, 340], [330, 460], [70, 460]], { wash: mixCol('#6E5C7E', '#E8AA38', L), ink: PAL.ink, sw: .9 });
    // laptop, right
    boilSeed('laptop');
    const lx = 1500, ly = 880, sc = o.screen ?? 0;
    if (sc > .01) glow(lx, ly - 150, 330, Z.pinGlow, .35 * sc);
    paint([[lx - 150, ly - 290], [lx + 150, ly - 290], [lx + 140, ly - 70], [lx - 140, ly - 70]], { wash: '#4B4760', ink: PAL.ink, sw: .9 });
    paint([[lx - 130, ly - 272], [lx + 130, ly - 272], [lx + 122, ly - 90], [lx - 122, ly - 90]], { wash: mixCol('#2D2B45', '#C7BCF2', sc * .7), ink: null });
    paint([[lx - 190, ly - 70], [lx + 190, ly - 70], [lx + 215, ly - 40], [lx - 215, ly - 40]], { wash: '#6A6583', ink: PAL.ink, sw: .9 });
  }
  function cardStack(x, y, n, t, o = {}) {           // a leaning stack of vocab cards on the desk
    const rot = o.rot || 0;
    push(); translate(x, y); rotate(rot);
    for (let i = 0; i < n; i++) { boilSeed('stack' + i); const w = 150, h = 20, dx = (hash(i + 1) - .5) * 26 * (o.messy ?? 1); paint(rrPts(-w / 2 + dx, -(i + 1) * h, w, h - 3, 5), { wash: i % 3 === 0 ? '#F4E6CB' : PAL.cream, ink: PAL.ink, sw: .7 }); }
    pop();
  }

  // ======================= SHOT 1: midnight desk (0–17.8) =======================
  function shot1(t, lt, dur) {
    const c = K(t, [[0, [930, 700, 1.3]], [5.4, [1000, 640, 1.12]], [9.8, [940, 650, 1.18]], [13.8, [1000, 640, 1.12]], [14.4, [860, 620, 1.12]], [15.4, [930, 650, 1.2]], [17.8, [960, 600, 1.1]]]);
    cam(c[0] + 5 * wob(t, .08), c[1] + 4 * wob(t, .06, .3), c[2]);
    const pinIn = seg(t, 5.55, 6.3), scr = Math.max(ease(seg(t, 5.2, 5.6)), 0);
    desk(t, 0, { screen: scr });
    cardStack(560, 900, 22, t, { rot: .03 * spring(t, 14.45, 3, 9) + .006 * Math.sin(t * 1.3) });
    const X = 930, Y = 930, u = 26;
    const mood = emotions(t, [[0, 'sleepy'], [5.85, 'surprised', { lookX: .9 }], [7.0, 'neutral', { lookX: .6 }], [7.7, 'neutral', { lookX: 0 }],
      [8.6, 'shy', { lookX: 0, lookY: .3 }], [10.1, 'happy'], [11.0, 'neutral', { lookX: .8 }], [12.3, 'starstruck', { lookX: .5 }],
      [14.35, 'neutral', { lookX: -1, lookY: -.5 }], [15.5, 'confused', { lookX: 0 }]]);
    const aR = t < 14.9 ? K(t, [[0, .55], [5.8, .55], [6.0, 1.1], [7.2, .4], [8.4, .4], [8.9, 1.45], [10.7, 1.45], [11.1, .3], [12.25, .25], [12.6, .95], [14.3, .95], [14.9, -.5]]) : mood.aR;
    const flipK = t < 5.6 ? frac(t / 1.35) : 0, cardSx = t < 5.6 ? Math.cos(ease(seg(flipK, .75, 1)) * TAU / 2 * 2) : 1;   // sleepy page-flips
    const neat = t > 12.2, fk = Math.exp(-Math.max(0, t - 12.2) * 5) * (t > 12.2 ? 1 : 0);
    clawd(X, Y, u, { ...mood, aR, armR: (uu, sw) => card(uu * 2.4, 0, uu * 4.4, -aR * .6, { neat, sx: cardSx, key: 'held', flashK: fk }) });
    // the Pin rises out of the laptop
    if (t > 5.5) {
      const p0 = [1500, 720], p1 = [1330, 470], k = backOut(pinIn), lean = ease(seg(t, 11.7, 12.1)) * (1 - ease(seg(t, 12.5, 13.0)));
      const px = lerp(p0[0], p1[0], k) - 60 * lean, py = lerp(p0[1], p1[1], k) + pinBob(t) - 20 * lean;
      const gl = .55 + .4 * fk + 3 * ease(seg(t, 16.9, 17.7));
      pin(t, px, py, 44, { k: ease(seg(t, 5.5, 5.9)), glow: gl, gs: 1 + 5 * easeIn(seg(t, 16.9, 17.8)), lookX: t > 14.3 && t < 15.5 ? -1 : -.8, eyes: t > 12.2 && t < 13.4 ? 'happy' : null, sq: .12 * spring(t, 6.3, 5, 14) });
      if (t > 11.95 && t < 12.3) { const tip = tipOf(X, Y, u, aR, 1); boilSeed('beam'); glow(tip[0], tip[1], 160, '#FFE6A0', 1); inkLine([[px - 30, py + 20], [tip[0] + 40, tip[1]]], 3, '#FFF1C4', 'ink', 0); }
      for (let i = 0; i < 4; i++) { const tip = tipOf(X, Y, u, aR, 1); sparkle(tip[0] + [60, -20, 120, 30][i], tip[1] + [-70, -40, 10, 50][i], 26, seg(t, 12.2 + i * .07, 12.8 + i * .07)); }
    }
    camEnd();
    if (lt < 1.4) iris(...toScreen(X, Y - 4 * u, LAST_CAM), lerp(0, 1400, easeIn(lt / 1.4)));
    flash(ease(seg(t, 17.3, 17.8)), '#FBF1DE');
  }

  // ======================= SHOT 2: the Pin is amazing (17.8–26.9) =======================
  function shot2(t, lt, dur) {
    const c = K(t, [[17.8, [960, 560, 1]], [24.0, [960, 560, 1.03]], [26.9, [800, 700, 1.45]]]);
    cam(c[0] + 5 * wob(t, .07), c[1], c[2]);
    sky('#E6EEF0', 'sky2', '#F6E3C4'); ground('#E8DCC4', 860, undefined, undefined, 'g2');
    for (let i = 0; i < 3; i++) { boilSeed('cl2' + i); const cx = 300 + i * 620 + t * 10, cy = 170 + 70 * hash(i); for (let k = 0; k < 3; k++) paint(ellPts(cx + (k - 1) * 100, cy - (k === 1 ? 26 : 0), 130 - 18 * Math.abs(k - 1), 46, 18, 4), { fill: '#FFFFFF', fillOp: 120, bleed: .25, tex: .4, ink: null }); }
    const px = 1180, py = 470 + pinBob(t), grow = 1 + .25 * ease(seg(t, 20.4, 21.2)) - .1 * ease(seg(t, 24.0, 25.0));
    // cards stream in messy, through the Pin, out neat onto a stack
    const N = 10; let landed = 0;
    for (let i = 0; i < N; i++) {
      const te = 18.5 + i * .5, a = seg(t, te, te + .8), b = seg(t, te + .8, te + 1.5);
      if (t < te) continue;
      if (b >= 1) { landed++; continue; }
      const s0 = [-80, 250 + 180 * hash(i)], s2 = [1560, 840 - landed * 18];
      const p = b > 0 ? arcPt([px, py], s2, 160, ease(b)) : arcPt(s0, [px, py], 80, easeOut(a));
      card(p[0], p[1], 120, (b > 0 ? .3 * (1 - b) : .5 * Math.sin(i + a * 5)), { neat: b > 0, key: 'st' + i, flashK: b > 0 ? .8 * (1 - b) : 0 });
    }
    boilSeed('stack2'); for (let i = 0; i < landed; i++) card(1560 + (hash(i) - .5) * 6, 840 - i * 18, 120, 0, { neat: true, key: 'ls' + i });
    pin(t, px, py, 50 * grow, { glow: .6 + .35 * ease(seg(t, 20.4, 21.2)), eyes: t > 20.6 && t < 22 ? 'happy' : null, lookX: t > 24.2 ? -.6 : -.2, sq: .1 * ring(t, [18.5, 19, 19.5, 20, 20.5, 21, 21.5, 22, 22.5, 23].map(v => v + .8), 8, 20) });
    for (let i = 0; i < 5; i++) sparkle(px + Math.cos(i * 1.3) * 110, py + Math.sin(i * 1.3) * 90, 22, seg(t, 20.5 + i * .08, 21.2 + i * .08));
    const mood = emotions(t, [[17.8, 'surprised', { lookX: .6 }], [18.9, 'starstruck', { lookX: .7 }], [21.8, 'happy', { lookX: .7 }], [24.2, 'thinking', { lookX: 0, lookY: -.3 }]]);
    const clap = t > 19 && t < 23.9 ? Math.abs(Math.sin(t * TAU * 1.6)) : 0;
    clawd(720, 900, 30, { ...mood, ...(clap ? { aL: .5 + .9 * clap, aR: .5 + .9 * (1 - clap) } : {}) });
    camEnd();
    if (lt < .6) flash(1 - ease(lt / .6), '#FBF1DE');
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, [Z.cabDk, Z.slate]);
  }

  // ======================= SHOT 3: London, the taxi driver and us (26.9–49.4) =======================
  const MAP = { x: 360, y: 160, w: 1020, h: 480 };
  const STREETS = (() => {                          // the maze of London streets on the wall map: segments, lit in a scattered order
    const S = [], nx = 11, ny = 7;
    for (let j = 0; j <= ny; j++) for (let i = 0; i < nx; i++) S.push([[i / nx, j / ny], [(i + 1) / nx, j / ny + (hash(i + j * 13) - .5) * .06]]);
    for (let i = 0; i <= nx; i++) for (let j = 0; j < ny; j++) S.push([[i / nx + (hash(i * 3 + j) - .5) * .05, j / ny], [i / nx, (j + 1) / ny]]);
    for (let d = 0; d < 10; d++) S.push([[hash(d * 7), hash(d * 11)], [hash(d * 7) + .2 * (hash(d) - .5), hash(d * 11) + .25]]);
    return S.map((s, i) => ({ s, o: hash(i * 1.37 + 4) }));
  })();
  function londonMap(t) {
    const { x, y, w, h } = MAP;
    boilSeed('mapboard'); paint(rectPts(x - 22, y - 22, w + 44, h + 44, 2), { wash: Z.wood, fill: Z.woodDk, fillOp: 70, tex: .6, ink: PAL.ink, sw: 1 });
    paint(rectPts(x, y, w, h, 1), { wash: '#EFE3C8', fill: '#D9C9A4', fillOp: 50, tex: .5, ink: PAL.ink, sw: .6 });
    boilSeed('thames'); paint(ribbon([[x, y + h * .62], [x + w * .3, y + h * .5], [x + w * .55, y + h * .72], [x + w, y + h * .6]], 26, 30), { wash: '#9CC2CF', ink: null });
    STREETS.forEach(({ s, o }, i) => {
      if (i % 4 === 0) boilSeed('st' + (i >> 2));
      const lk = seg(t, 29.6 + o * 3.8, 29.6 + o * 3.8 + .15);
      const P = s.map(([a, b]) => [x + clamp(a) * w, y + clamp(b) * h]);
      inkLine(P, lk > 0 ? 2.2 : 1, lk > 0 ? mixCol('#CDBB98', '#3D3450', lk) : '#CDBB98', 'inkfine', 0);
      if (lk > 0 && lk < 1) glow(P[1][0], P[1][1], 40, '#FFD58A', .6 * (1 - lk));
    });
    // the Pin's route (27.6–28.8)
    const rk = seg(t, 27.6, 28.8), R = [[.05, .9], [.3, .75], [.45, .45], [.72, .32], [.95, .12]].map(([a, b]) => [x + a * w, y + b * h]);
    if (rk > 0 && t < 30.5) { boilSeed('route'); const n = Math.max(2, Math.ceil(rk * R.length)); const Q = R.slice(0, n); glow(Q[Q.length - 1][0], Q[Q.length - 1][1], 120, Z.pinGlow, .6 * (1 - seg(t, 29.4, 30.5))); inkLine(Q, 4, mixCol(Z.pin, '#EFE3C8', seg(t, 29.4, 30.5)), 'ink', .3); }
    return R;
  }
  function cabbie(x, y, u, o) {                      // the London cabbie: a slate-teal Clawd with a flat cap
    clawd(x, y, u, { ...o, col: Z.cab, dk: Z.cabDk, lt: Z.cabLt, tint: null,
      draw: (uu, sw) => { paint([[-5.3 * uu, -7.7 * uu], [-4.6 * uu, -9.3 * uu], [3.4 * uu, -9.5 * uu], [4.6 * uu, -8.2 * uu], [6.8 * uu, -7.9 * uu], [6.6 * uu, -7.4 * uu], [-5.3 * uu, -7.4 * uu]], { wash: '#5A4A42', fill: '#3E322D', fillOp: 70, tex: .5, ink: PAL.ink, sw: sw * .8, curv: .3 }); } });
  }
  function taxi(x, gy, s) {
    boilSeed('taxi');
    paint([[x - s * 2.2, gy - s * .35], [x - s * 2.1, gy - s * 1.1], [x - s * 1.2, gy - s * 1.2], [x - s * .9, gy - s * 1.9], [x + s * .9, gy - s * 1.9], [x + s * 1.2, gy - s * 1.2], [x + s * 2.1, gy - s * 1.05], [x + s * 2.2, gy - s * .35]], { wash: '#2F3A45', fill: '#1E252C', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1, curv: .25 });
    for (const sd of [-1, 1]) paint(rectPts(x + sd * s * .45 - s * .35, gy - s * 1.75, s * .7, s * .5), { wash: '#AFC7CF', ink: PAL.ink, sw: .7 });
    paint(rectPts(x - s * .25, gy - s * 2.1, s * .5, s * .22), { wash: '#F2C14E', ink: PAL.ink, sw: .6 });
    for (const sd of [-1, 1]) { paint(ellPts(x + sd * s * 1.35, gy - s * .3, s * .38, s * .38, 14), { wash: '#26262E', ink: PAL.ink, sw: .8 }); paint(ellPts(x + sd * s * 1.35, gy - s * .3, s * .14, s * .14, 8), { wash: '#9A9AA8', ink: null }); }
  }
  function shot3(t, lt, dur) {
    const cx0 = K(t, [[26.9, [900, 520, 1]], [34.2, [900, 520, 1]], [35.8, [1450, 540, 1.28]], [42.4, [1480, 540, 1.3]], [44.3, [2950, 560, 1.12]]]);
    const cl = stroll(t, 43, 48.8, 2650, 3000, 24);
    let cx = cx0[0], cy = cx0[1], z = cx0[2];
    if (t > 44.3) cx = cl.x + 220;
    cx += 700 * easeIn(seg(t, 48.7, 49.4));
    cam(cx + 4 * wob(t, .07), cy, z);
    sky(Z.slate, 'sky3', '#C9D3CC');
    for (let i = 0; i < 9; i++) { const bx = -200 + i * 480 + 200 * hash(i), bh = 200 + 180 * hash(i + 4); if (!seen(bx, 300)) continue; boilSeed('lsky' + i); paint(rectPts(bx, 880 - bh - 200, 180 + 90 * hash(i + 2), bh + 200), { wash: mixCol(Z.slateG, Z.slate, .45), ink: null }); }
    if (seen(1850)) { boilSeed('bigben'); paint(rectPts(1790, 150, 120, 750), { wash: mixCol(Z.slateG, Z.slate, .3), ink: null }); paint([[1780, 152], [1850, 40], [1920, 152]], { wash: mixCol(Z.slateG, Z.slate, .3), ink: null }); paint(ellPts(1850, 260, 38, 38, 16), { wash: mixCol(Z.slate, PAL.cream, .5), ink: null }); }
    ground(Z.slateG, 880, undefined, undefined, 'g3');
    if (seen(900, 800)) londonMap(t);
    if (seen(160)) taxi(160, 900, 70);
    // the cabbie
    const cm = emotions(t, [[26.9, 'thinking', { lookX: -.4, lookY: -.8 }], [29.6, 'determined', { lookX: -.7, lookY: -.8 }], [35.2, 'thinking', { lookY: -1, lookX: .3 }], [40.4, 'proud']]);
    if (seen(1560)) cabbie(1560, 900, 24, { ...cm, view: 'q', flip: t < 35.2, aR: t > 29.6 && t < 35.2 ? 1.1 + .15 * Math.sin(t * 5) : cm.aR });
    const tk = ease(seg(t, 35.1, 35.8)), grow = seg(t, 35.4, 40.2), swell = 1 + .22 * backOut(seg(t, 40.2, 40.8)) - .22 * seg(t, 40.2, 40.8) * 0;
    if (tk > 0 && seen(1600)) { thought(1640, 440, 360 * swell, 240 * swell, tk, { key: 'cab' }); miniMap(1640, 440, 290 * swell * tk, 180 * swell * tk, Math.floor(4 + 22 * grow), 1, 'cm'); if (t > 40.2) for (let i = 0; i < 5; i++) sparkle(1640 + Math.cos(i * 1.26) * 230, 440 + Math.sin(i * 1.26) * 160, 20, seg(t, 40.3 + i * .06, 41 + i * .06)); }
    // the Pin: draws the route, then leaves right; later leads Clawd
    const R = [[.05, .9], [.3, .75], [.45, .45], [.72, .32], [.95, .12]].map(([a, b]) => [MAP.x + a * MAP.w, MAP.y + b * MAP.h]);
    if (t < 30) { const rk = ease(seg(t, 27.4, 28.8)), i = Math.min(3, Math.floor(rk * 4)), f = rk * 4 - i; const p = [lerp(R[i][0], R[i + 1][0], f), lerp(R[i][1], R[i + 1][1], f) - 70]; const out = easeIn(seg(t, 29.0, 29.9)); pin(t, p[0] + out * 1500, p[1] - out * 200 + pinBob(t), 34, { k: ease(seg(t, 26.9, 27.5)), lookX: .8 }); }
    if (t > 42) { const px = lerp(3150, 3500, ease(seg(t, 43, 48.8))); pin(t, px, 540 + pinBob(t), 36, { lookX: -.6, shadowY: 900 }); }
    if (t > 42 && seen(cl.x)) {
      const m = emotions(t, [[42.3, 'neutral', { lookY: -.8, lookX: .6 }], [47.2, 'confused', { lookY: -.2 }]]);
      clawd(cl.x, 900, 24, { ...m, view: t < 47.2 ? 'side' : 'q', walk: cl.walk, dy: m.dy + cl.dy });
      const fade = 1 - ease(seg(t, 45.4, 48.2)), tk2 = ease(seg(t, 43.2, 43.8));
      thought(cl.x - 40, 560, 220 * (.6 + .4 * fade), 150 * (.6 + .4 * fade), tk2, { key: 'cl', tail: 1 });
      if (tk2 > .5) miniMap(cl.x - 40, 560, 160 * fade, 100 * fade, Math.max(1, Math.round(6 * fade)), fade, 'clm');
    }
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, [Z.cabDk, Z.slate]);
    streaks(ease(seg(t, 48.7, 49.4)), 1, [Z.fog, Z.fogG, '#E6E8E8']);
  }

  // ======================= SHOT 4: fog city (49.4–58.9) =======================
  function shot4(t, lt, dur) {
    const c = K(t, [[49.4, [860, 540, 1]], [51.1, [1150, 540, 1.06]], [53.4, [1120, 560, 1.02]], [58.9, [1220, 520, 1.1]]]);
    cam(c[0] + 1500 * easeIn(seg(t, 58.3, 58.9)), c[1], c[2]);
    sky(Z.fog, 'sky4', '#E9EAE8'); cityRow(4, -600, 3400, 880, { fog: .9, fogCol: Z.fogB, w: 170, h: 380 });
    ground(Z.fogG, 880, undefined, undefined, 'g4');
    const door = ease(seg(t, 50.5, 51.0));
    building(1400, 880, 230, 420, 0, '#C9A07A', { fog: .35, fogCol: Z.fogB, door: .3 + .7 * door, key: 'dest' });
    for (let i = 0; i < 4; i++) { boilSeed('mist' + i); const mx = 200 + i * 520 + 30 * Math.sin(t * .4 + i); paint(ellPts(mx, 760 - 40 * hash(i), 380, 70, 20, 6), { fill: '#F0F0EE', fillOp: 120, bleed: .3, tex: .4, ink: null }); }
    const cl = stroll(t, 49.6, 50.9, 450, 1180, 26);
    const m = emotions(t, [[49.4, 'neutral', { lookY: -.7, lookX: .5 }], [51.0, 'happy'], [52.15, 'confused', { lookX: -.8 }], [54.2, 'neutral', { lookX: .6, lookY: -.6 }], [56.6, 'happy', { lookY: -.8 }]]);
    const tn = t < 51.5 ? { view: t < 50.9 ? 'side' : 'q' } : turn(t, 51.5, 51.75, .25, 0);
    const hold = ease(seg(t, 56.3, 56.7));
    clawd(cl.x, 900, 26, { ...m, ...tn, walk: cl.walk, dy: m.dy + cl.dy, ...(hold > 0 ? { aL: lerp(m.aL, 1.35, hold), aR: lerp(m.aR, 1.35, hold) } : {}), lookX: t > 52.15 && t < 54.2 ? Math.sin((t - 52.15) * 3) : m.lookX });
    // the Pin, then the ready-made bubble it hands over
    const pp = [1420 + (t < 50.9 ? lerp(-500, 0, ease(seg(t, 49.4, 50.9))) : 0), 440 + pinBob(t)];
    const bk = backOut(seg(t, 54.2, 55.1)), carry = ease(seg(t, 55.7, 56.5));
    const bp = arcPt([pp[0] + 170, pp[1] - 40], [cl.x, 900 - 26 * 8 - 110], 120, carry);
    bubble(bp[0], bp[1], 250, 150, bk, { key: 'ready', glow: .25 });
    pin(t, pp[0], pp[1], 40, { lookX: t < 51 ? .5 : -.7, glow: .5 + .3 * pulse(t), sq: .1 * spring(t, 54.2, 5, 14), eyes: t > 56.4 && t < 57.6 ? 'happy' : null });
    camEnd();
    streaks(1 - ease(seg(lt, 0, .5)), 1, [Z.fog, Z.fogG, '#E6E8E8']);
    streaks(ease(seg(t, 58.3, 58.9)), 1, [Z.fogB, Z.fog, '#E6E8E8']);
  }

  // ======================= SHOT 5: the streets it never sees (58.9–71.9) =======================
  const X1 = 1100, X2 = 1650, X3 = 2350;
  function shot5(t, lt, dur) {
    const cxl = kf(t, [[58.9, 380], [63.5, 800], [65.5, 1330], [67.3, X3]], x => x) + (t > 70.8 ? 300 * ease(seg(t, 70.8, 71.9)) : 0);
    const camX = K(t, [[58.9, 650], [63.3, X1], [65.4, X2], [67.4, X3], [70.8, X3], [71.9, X3 + 260]]);
    cam(camX, 540 + 6 * wob(t, .1), 1.05);
    sky(Z.fog, 'sky5', '#ECEDEB'); cityRow(5, -900, 760, 880, { fog: .88, fogCol: Z.fogB, w: 160, h: 360 }); cityRow(6, 3000, 4300, 880, { fog: .88, fogCol: Z.fogB, w: 160, h: 360 });
    // the pun alley (X1): two sprouts laughing at a two-layer bubble
    if (seen(X1, 500)) {
      boilSeed('alley1'); glow(X1, 700, 380, '#FFD9A0', .35); paint(rectPts(X1 - 220, 360, 440, 520), { wash: '#F2D7B5', fill: '#E7B98C', fillOp: 60, tex: .5, ink: PAL.ink, sw: .8 });
      building(X1 - 290, 880, 150, 440, 0, CITY[0], { key: 'a1l' }); building(X1 + 290, 880, 150, 400, 2, CITY[3], { key: 'a1r' }); building(X1 + 540, 880, 180, 360, 1, CITY[1], { key: 'a1m', fog: .5, fogCol: Z.fogB });
      const lg = t > 62.2 && t < 65.5, bounce = lg ? Math.abs(Math.sin(t * 12)) * .5 : 0;
      pip(X1 - 105, 880, 26, { face: lg ? 'happy' : 'calm', dy: -bounce, key: 'p1', turn: .6 });
      pip(X1 + 105, 880, 23, { face: lg ? 'star' : 'calm', dy: -Math.abs(Math.sin(t * 12 + 1)) * .5 * (lg ? 1 : 0), flip: true, key: 'p2', turn: .6 });
      bubble(X1, 560, 230, 138, backOut(seg(t, 61.6, 62.2)), { key: 'pun', double: true, tail: 0 });
    }
    // the polite window (X2): a smile over a yawn
    if (seen(X2, 500)) {
      building(X2, 880, 300, 520, 0, CITY[4], { key: 'pol' });
      boilSeed('polwin'); paint(rectPts(X2 - 110, 470, 220, 190), { wash: '#FFE6B6', ink: PAL.ink, sw: .9 }); glow(X2, 560, 200, '#FFD08A', .35);
      pip(X2, 660, 20, { face: 'happy', key: 'p3', noShadow: true, turn: 0 });
      if (t > 63.9) emote('zzz', X2 + 70, 500, 30, ease(seg(t, 64.3, 64.7)), t - 64.3);
      bubble(X2 - 170, 480, 120, 72, backOut(seg(t, 63.9, 64.3)), { key: 'polb', tail: -1 });
    }
    // the fork (X3): the same bubble dressed for an essay (top hat) and for a group chat (party hat)
    if (seen(X3, 900)) {
      boilSeed('hall'); const hx = X3 - 360;
      paint([[hx - 190, 470], [hx, 360], [hx + 190, 470]], { wash: '#D8CDBE', ink: PAL.ink, sw: .9 });
      paint(rectPts(hx - 170, 470, 340, 30), { wash: '#CFC3B2', ink: PAL.ink, sw: .8 });
      for (let i = 0; i < 4; i++) paint(rectPts(hx - 150 + i * 92, 500, 32, 330), { wash: '#E6DDCF', ink: PAL.ink, sw: .8 });
      paint(rectPts(hx - 190, 830, 380, 50), { wash: '#CFC3B2', ink: PAL.ink, sw: .8 });
      boilSeed('cafe'); const fx = X3 + 380;
      paint(rrPts(fx - 170, 560, 340, 320, 20), { wash: '#E9A77F', ink: PAL.ink, sw: .9 });
      paint([[fx - 200, 580], [fx + 200, 580], [fx + 170, 520], [fx - 170, 520]], { wash: '#8FB57A', ink: PAL.ink, sw: .8 });
      for (let i = 0; i < 7; i++) { const lx = fx - 180 + i * 60; glow(lx, 540 + 10 * Math.sin(i), 40, CITY[i % CITY.length], .5); paint(ellPts(lx, 540 + 10 * Math.sin(i), 7, 7, 8), { wash: CITY[i % CITY.length], ink: null }); }
      paint(rectPts(fx - 120, 640, 240, 140), { wash: '#FFE3B0', ink: PAL.ink, sw: .8 });
      const bk1 = backOut(seg(t, 66.6, 67.1)), bk2 = backOut(seg(t, 66.9, 67.4));
      bubble(hx, 250 + 6 * Math.sin(t * 2), 180, 108, bk1, { key: 'essay', hat: 'top', bowtie: true, tail: 0 });
      bubble(fx, 360 + 6 * Math.sin(t * 2 + 1), 180, 108, bk2, { key: 'chat', hat: 'party', tail: 0, rot: .08 * Math.sin(t * 4) });
    }
    ground(Z.fogG, 880, undefined, undefined, 'g5');
    // Clawd trots after the Pin, eyes up; stops at the fork, looks both ways; is pulled on
    const atFork = t > 67.3 && t < 70.8;
    const m = emotions(t, [[58.9, 'neutral', { lookY: -.7, lookX: .6 }], [67.35, 'neutral', { lookX: -1, lookY: -.8 }], [68.4, 'neutral', { lookX: 1, lookY: -.8 }], [69.3, 'confused', { lookX: 0 }], [70.6, 'surprised', { lookX: .8 }], [71.2, 'neutral', { lookY: -.7, lookX: .6 }]]);
    const walk = atFork ? 0 : cxl / 95;
    const vw = atFork ? turn(t, 67.3, 67.5, .25, 0) : t > 70.8 ? turn(t, 70.8, 71.0, 0, .25) : { view: 'side' };
    clawd(cxl, 900, 24, { ...m, ...vw, walk, dy: m.dy - (atFork ? 0 : .35 * Math.abs(Math.sin(walk * Math.PI))) });
    const pxp = t < 67.3 ? cxl + 320 : t < 70.2 ? X3 + 320 : lerp(X3 + 320, X3 + 130, ease(seg(t, 70.2, 70.5))) + 400 * ease(seg(t, 70.8, 71.9));
    pin(t, pxp, 420 + pinBob(t) + (atFork ? 12 * Math.sin(t * 9) * seg(t, 68.5, 69.5) : 0), 34, { lookX: -.5, shadowY: 900, sq: .15 * spring(t, 70.5, 6, 16) });
    camEnd();
    streaks(1 - ease(seg(lt, 0, .5)), 1, [Z.fogB, Z.fog, '#E6E8E8']);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, [Z.duskLo, Z.duskMid]);
  }

  // ======================= SHOT 6: the bridge that wasn't there (71.9–101.6) =======================
  const PL = i => ({ x: 760 + i * 118, y: 822 });   // the six planks across the chasm (700–1500)
  function shot6(t, lt, dur) {
    const X = 560, u = 22;
    const fallK = easeIn(seg(t, 91.45, 92.05)), landed = t >= 92.05;
    let cxy = K(t, [[71.9, [980, 540, 1]], [74.6, [1000, 540, 1]], [76.0, [1350, 520, 1.05]], [78.2, [1350, 520, 1.05]], [79.4, [900, 560, 1.12]], [82.2, [980, 560, 1.05]], [91.3, [940, 590, 1.08]], [92.1, [960, 1420, 1.12]], [97.4, [940, 1440, 1.25]], [100.4, [920, 1470, 1.35]]]);
    // the match cut: push into the scrap in Clawd's hand
    const push_ = easeIn(seg(t, 100.55, 101.6));
    const cxN = 900, cyN = 1780;
    const ar = K(t, [[97.6, -.6], [98.0, .6], [100.5, .6]]);
    const tip = tipOf(cxN, cyN, 30, ar, 1);
    cxy = [lerp(cxy[0], tip[0] + 40, push_), lerp(cxy[1], tip[1], push_), lerp(cxy[2], 9, push_)];
    const sh = t > 92.5 && t < 93 ? shakeXY(t, 14 * (1 - seg(t, 92.5, 93))) : [0, 0];
    cam(cxy[0] + sh[0] + 4 * wob(t, .06), cxy[1] + sh[1], cxy[2]);
    // dusk sky and the two cliffs
    boilSeed('sky6'); paint(rectPts(VIS[0] - 400, -1400, VIS[1] - VIS[0] + 800, 2400), { wash: Z.duskMid, ink: null });
    paint(ellPts(1000, 700, 1600, 300, 24, 6), { fill: Z.duskHi, fillOp: 170, bleed: .3, tex: .4, ink: null });
    paint(ellPts(1000, 100, 1600, 280, 24, 6), { fill: Z.duskLo, fillOp: 150, bleed: .3, tex: .4, ink: null });
    glow(1150, 760, 380, '#FFB870', .6);
    boilSeed('court'); const hx = 1850;                         // the courthouse, far side
    paint([[hx - 200, 520], [hx, 420], [hx + 200, 520]], { wash: '#D9B8A6', ink: PAL.ink, sw: .9 });
    paint(rectPts(hx - 180, 520, 360, 26), { wash: '#CFA893', ink: PAL.ink, sw: .8 });
    for (let i = 0; i < 4; i++) paint(rectPts(hx - 160 + i * 98, 546, 30, 250), { wash: '#E7CBB9', ink: PAL.ink, sw: .8 });
    paint(rectPts(hx - 200, 796, 400, 30), { wash: '#CFA893', ink: PAL.ink, sw: .8 });
    boilSeed('cliffs');
    paint([[VIS[0] - 400, 826], [700, 826], [690, 1100], [660, 1500], [640, 2200], [VIS[0] - 400, 2200]], { wash: Z.rock, fill: Z.rockDk, fillOp: 80, tex: .6, ink: PAL.ink, sw: 1 });
    paint([[1500, 826], [VIS[1] + 400, 826], [VIS[1] + 400, 2200], [1560, 2200], [1530, 1500], [1510, 1100]], { wash: Z.rock, fill: Z.rockDk, fillOp: 80, tex: .6, ink: PAL.ink, sw: 1 });
    paint(rectPts(690, 1100, 830, 1100), { wash: Z.pit, fill: '#2A2034', fillOp: 90, bleed: .1, tex: .6, ink: null });
    paint(rectPts(640, 1780, 930, 400, 2), { wash: Z.pitFl, fill: Z.pit, fillOp: 60, tex: .6, ink: PAL.ink, sw: .9 });
    // the six planks
    for (let i = 0; i < 6; i++) {
      const a = backOut(seg(t, 82.5 + i * .38, 82.85 + i * .38)), gone = seg(t, 90.55 + i * .06, 90.85 + i * .06), p = PL(i);
      if (a > 0 && gone < 1) { boilSeed('plank' + i); glow(p.x, p.y, 90, '#E8D6FF', .3 * a * (1 - gone)); push(); translate(p.x, p.y); scale(a * (1 - gone)); paint(rrPts(-52, -14, 104, 28, 6), { wash: '#E9E0F7', ink: PAL.ink, sw: .8 }); squiggle(-36, 36, -2, 3, 6, .8, '#7E6AA8'); pop(); }
      puff(p.x, p.y, 40, seg(t, 90.6 + i * .06, 91.3 + i * .06), '#D9CCE8');
    }
    // Clawd: briefcase and bow tie; steps out; falls; lands in the pit
    let cx = X, cy = 826;
    const step = ease(seg(t, 89.55, 90.4)); cx = lerp(X, 800, step);
    if (t > 91.45) { cy = lerp(826, 1780, fallK); }
    const m = emotions(t, [[71.9, 'neutral', { lookX: .6 }], [74.6, 'proud'], [79.0, 'determined', { lookX: .8 }], [82.4, 'surprised', { lookX: .8, lookY: .3 }], [83.4, 'happy', { lookX: .8, lookY: .2 }],
      [85.5, 'confused', { lookX: .9, lookY: -.8 }], [88.5, 'happy', { lookX: .9, lookY: -.6 }], [89.5, 'determined', { lookX: 1, lookY: .2 }],
      [90.75, 'surprised', { lookX: 0, lookY: 1 }], [91.2, 'scared', { lookY: 1 }], [92.05, 'ko'], [94.6, 'dizzy'], [95.8, 'sad', { lookY: -.6 }], [97.7, 'neutral', { lookX: .7, lookY: 0 }], [98.7, 'nervous', { lookX: .7 }], [99.7, 'nervous', { lookX: 0 }]]);
    const brief = (uu, sw) => { boilSeed('brief'); const pop_ = t > 92.8; paint(rrPts(-1.2 * uu, .2 * uu, 2.4 * uu, 1.8 * uu, .2 * uu), { wash: '#6E4A2E', ink: PAL.ink, sw: sw * .7 }); inkLine([[-.5 * uu, .2 * uu], [-.4 * uu, -.4 * uu], [.4 * uu, -.4 * uu], [.5 * uu, .2 * uu]], sw * .8, PAL.ink, 'ink', .3); if (pop_) paint([[-1.2 * uu, .2 * uu], [1.2 * uu, .2 * uu], [1 * uu, -.8 * uu], [-1.3 * uu, -.5 * uu]], { wash: '#8A5E3A', ink: PAL.ink, sw: sw * .6 }); };
    const scrap = (uu, sw) => card(1.7 * uu, 0, 3.6 * uu, K(t, [[98.1, 0], [98.7, Math.PI], [99.5, Math.PI], [99.9, 0]]), { scrawl: t < 100.9, blank: t >= 100.9, sx: t > 100.6 && t < 101.2 ? Math.cos(seg(t, 100.6, 101.2) * Math.PI) : 1, key: 'scrapH' });
    const hang = t > 90.75 && t < 91.45;
    if (!landed) {
      clawd(cx, cy, u, { ...m, view: t < 85.4 || (t > 89.4 && t < 90.75) ? 'q' : 'front', walk: t > 89.55 && t < 90.4 ? step * 3 : null, hat: 'bowtie',
        dy: m.dy - (t > 91.45 ? 0 : 0) + (hang ? -.2 * Math.sin((t - 90.75) * 20) : 0), noShadow: t > 90.7, aL: hang ? 1.4 : m.aL, aR: hang ? 1.4 : m.aR, armL: t < 91.45 ? brief : null, smear: t > 91.6 ? .5 : 0, smearDir: 0 });
    } else {
      const sq = .35 * Math.exp(-(t - 92.05) * 7);
      clawd(900, 1780, t < 97.4 ? 30 : 30, { ...m, hat: 'bowtie', sq: m.sq + sq, aR: t > 97.6 ? ar : m.aR, armR: t > 97.6 ? scrap : null });
      if (t < 101) { boilSeed('briefL'); push(); translate(1060, 1780); rotate(.2); brief(26, 1); pop(); }
    }
    // the gavel slams; coins spill out of the briefcase
    if (t > 92.15 && t < 94.6) {
      boilSeed('gavel'); const a = t < 92.5 ? lerp(.9, -1.0, easeIn(seg(t, 92.15, 92.5))) : -1.0 + .18 * Math.exp(-(t - 92.5) * 6) * Math.abs(Math.sin((t - 92.5) * 14)), out = ease(seg(t, 94.0, 94.6));
      push(); translate(1560, 1330 - out * 600); rotate(a);
      paint(rectPts(-420, -16, 360, 32, 1), { wash: Z.wood, ink: PAL.ink, sw: 1 });
      paint(rrPts(-560, -80, 150, 160, 18), { wash: '#7A4B2E', fill: Z.woodDk, fillOp: 70, tex: .5, ink: PAL.ink, sw: 1.1 });
      pop();
      if (t > 92.5) puff(1290, 1760, 70, seg(t, 92.5, 93.1), '#A08DA8');
    }
    for (let i = 0; i < 10; i++) {
      const k = seg(t, 92.85 + i * .05, 93.5 + i * .05); if (k <= 0) continue;
      const p = arcPt([1060, 1740], [760 + i * 60 + 30 * hash(i), 1790 - 10 * hash(i + 4)], 180 + 120 * hash(i + 2), easeOut(k));
      boilSeed('coin' + i); paint(ellPts(p[0], p[1], 15, 15 * (.3 + .7 * Math.abs(Math.cos(k * 9 + i))), 12), { wash: Z.gold, ink: PAL.ink, sw: .7 });
    }
    // the scraps the planks turned into flutter down (unreadable scrawl)
    for (let i = 0; i < 5; i++) {
      const k = seg(t, 95.2 + i * .3, 96.9 + i * .3); if (k <= 0 || t > 100.6) continue;
      const p = [lerp(PL(i).x, 700 + i * 150, k) + 40 * Math.sin(k * 8 + i), lerp(900, 1775, easeOut(k))];
      card(p[0], p[1], 90, .6 * Math.sin(k * 7 + i) * (1 - k), { scrawl: true, key: 'scr' + i });
    }
    // the Pin: puffs up, conjures the planks, nods
    if (t < 91.4) {
      const nod = t > 88.2 && t < 89.2 ? Math.abs(Math.sin((t - 88.2) * Math.PI * 2)) : 0;
      pin(t, 720, 520 + pinBob(t) + 30 * nod, 40 * (1 + .18 * ease(seg(t, 72.3, 72.9))), { eyes: t < 74.5 && t > 72.4 ? 'narrow' : nod > 0 ? 'happy' : null, lookX: t < 82.4 ? .6 : t < 85.5 ? .5 : -.7, glow: .6, rot: t > 82.4 && t < 85 ? .15 : 0 });
    } else if (t < 93.5) pin(t, 720, 520 + pinBob(t), 40, { lookX: .2, lookY: 1, eyes: null });
    camEnd();
    if (lt < .3) brushWipe(.5 + lt / .6, [Z.duskLo, Z.duskMid]);
    flash(ease(seg(t, 101.15, 101.6)), '#FBF4E6');
  }

  // ======================= SHOT 7: drawing its own map (101.6–111.8) =======================
  function shot7(t, lt, dur) {
    const cl = stroll(t, 107.6, 110.9, 760, 1420, 26);
    const zOut = ease(seg(t, 110.9, 111.8));
    const cxy = [lerp(t < 107.4 ? 900 : lerp(900, cl.x + 150, ease(seg(t, 107.4, 108.2))), 1200, zOut), lerp(620, 620, zOut), lerp(t < 107.4 ? 1.12 : 1.05, .4, zOut)];
    cam(cxy[0] + 3 * wob(t, .07) * (1 - zOut), cxy[1], cxy[2]);
    if (zOut > 0) { boilSeed('void7'); paint(rectPts(-3000, -2000, 8000, 5000), { wash: Z.void, ink: null }); }
    boilSeed('paper7'); paint(rectPts(1200 - 1300, 620 - 750, 2600, 1500), { wash: '#FBF4E6', fill: '#EEE3CC', fillOp: 40, tex: .6, ink: null });
    // buildings bloom behind Clawd as it walks; its street paints under its feet
    for (let i = 0; i < 7; i++) {
      const bx = 820 + i * 100, tp = 107.6 + clamp((bx + 150 - 760) / 660) * 3.3, k = seg(t, tp, tp + .45);
      if (k > 0) building(bx, 800, 100 + 30 * hash(i), 200 + 160 * hash(i + 3), Math.floor(hash(i + 9) * 3), CITY[(i + 2) % CITY.length], { k, key: 'own' + i, lit: true });
    }
    boilSeed('street7');
    const sx1 = t < 104.4 ? lerp(890, 1010, ease(seg(t, 102.8, 104.4))) : t < 107.6 ? 1010 : Math.max(1010, cl.x + 120);
    if (t > 102.8) paint(rectPts(860, 812, sx1 - 860, 26, 1), { wash: '#E9B85C', ink: PAL.ink, sw: .8 });
    inkLine([[VIS[0] - 300, 830], [VIS[1] + 300, 830]], .5, '#D9CCB0', 'inkfine', 0);
    // the wrong stroke and its scribble-out
    const wk = seg(t, 104.8, 105.3), so = seg(t, 105.3, 106.0);
    if (wk > 0 && t < 107.6) { boilSeed('wrong'); const P = []; for (let i = 0; i <= 10 * wk; i++) P.push([1010 + i * 18, 822 + (i % 2 ? -26 : 26) * (i / 10) - i * 5]); if (P.length > 1) inkLine(P, 2, '#6E5A7A', 'ink', .3); if (so > 0) scribble(1010, 1010 + 190 * so, 800, 30, Math.max(2, Math.round(24 * so)), 2.2, PAL.ink); }
    const m = emotions(t, [[101.6, 'neutral', { lookX: .6, lookY: .5 }], [102.7, 'determined', { lookX: .8, lookY: .7 }], [105.2, 'angry', { emote: 'steam' }], [106.4, 'determined', { lookX: .8 }], [107.6, 'determined', { lookX: .8 }], [109.4, 'proud']]);
    const drawing = t > 102.7 && t < 106.3;
    const pencil = (uu, sw) => { boilSeed('pencil'); paint([[0, -.3 * uu], [3.2 * uu, -.3 * uu], [3.9 * uu, 0], [3.2 * uu, .3 * uu], [0, .3 * uu]], { wash: Z.gold, ink: PAL.ink, sw: sw * .7 }); paint([[3.2 * uu, -.3 * uu], [3.9 * uu, 0], [3.2 * uu, .3 * uu]], { wash: '#E8C9A0', ink: PAL.ink, sw: sw * .5 }); };
    const walking = t > 107.6 && t < 110.9;
    clawd(t < 107.6 ? 760 : cl.x, 826, 26, { ...m, view: 'side', walk: walking ? cl.walk : null, dy: m.dy + (walking ? cl.dy : 0),
      rot: drawing ? .1 + .03 * Math.sin(t * 9) : m.rot * .3, aL: walking ? -.2 : -.75 + (drawing ? .2 * Math.sin(t * 11) : 0), armL: pencil });
    pin(t, (t < 107.6 ? 520 : cl.x - 280), 560 + pinBob(t), 34, { glow: .35, lookX: .8, k: ease(seg(t, 102, 102.8)), shadowY: 826 });
    camEnd();
    flash(1 - ease(seg(lt, 0, .7)), '#FBF4E6');
  }

  // ======================= SHOT 8: the edge of the world (111.8–125.2) =======================
  function shot8(t, lt, dur) {
    const grow = ease(seg(t, 123.4, 124.9)), hw = lerp(520, 720, grow), hh = lerp(300, 420, grow), SX = 960, SY = 560;
    const c = K(t, [[111.8, [SX, SY, 1]], [116.2, [SX, SY, 1]], [117.6, [1400, 600, 2.1]], [123.3, [1420, 600, 2.1]], [124.8, [SX, SY, .9]]]);
    cam(c[0], c[1], c[2]);
    boilSeed('void'); paint(rectPts(VIS[0] - 400, -1500, VIS[1] - VIS[0] + 800, 4000), { wash: Z.void, ink: null });
    for (let i = 0; i < 20; i++) { boilSeed('dust' + i); paint(ellPts(hash(i) * 2400 - 240, hash(i + 40) * 1300 - 110, 2, 2, 6), { wash: '#4A5075', ink: null }); }
    boilSeed('sheet'); paint(rectPts(SX - hw, SY - hh, hw * 2, hh * 2, 3), { wash: '#FBF4E6', fill: '#E8DCC0', fillOp: 50, tex: .6, ink: null });
    if (grow > 0 && grow < 1) { glow(SX, SY, hw * 1.2, '#FFD9A0', .3 * Math.sin(grow * Math.PI)); }
    // streets and blocks, only inside the sheet
    const gk = ease(seg(t, 111.8, 112.9)), gc = mixCol('#FBF4E6', '#C9A56A', gk);
    for (let i = 0; i < 18; i++) { boilSeed('gs' + i); const y = SY - 410 + i * 48; if (Math.abs(y - SY) < hh - 16) inkLine([[SX - hw + 14, y], [SX + hw - 14, y + 2]], .9, gc, 'inkfine', 0); }
    for (let i = 0; i < 29; i++) { boilSeed('gv' + i); const x = SX - 700 + i * 50; if (Math.abs(x - SX) < hw - 16) inkLine([[x, SY - hh + 14], [x + 3, SY + hh - 14]], .9, gc, 'inkfine', 0); }
    for (let i = 0; i < 110; i++) { const x = SX - 700 + hash(i * 3) * 1400, y = SY - 410 + hash(i * 5 + 1) * 820; if (Math.abs(x - SX) > hw - 26 || Math.abs(y - SY) > hh - 26 || hash(i + 77) > gk) continue; boilSeed('blk' + i); paint(rectPts(x - 12, y - 10, 24 + 10 * hash(i), 20), { wash: CITY[i % CITY.length], ink: PAL.ink, sw: .5 }); }
    const edge = .8 + 1.6 * ease(seg(t, 114.6, 115.4)) * (1 - grow);
    boilSeed('edge'); const E = [[SX - hw, SY - hh], [SX + hw, SY - hh], [SX + hw, SY + hh], [SX - hw, SY + hh]];
    for (let i = 0; i < 4; i++) inkLine([E[i], E[(i + 1) % 4]], edge, PAL.ink, 'ink', 0);
    if (t > 114.6 && grow < 1) glow(SX + hw, SY, 200, '#8C7BD8', .25 * ease(seg(t, 114.6, 115.4)) * (1 - grow));
    // Clawd at the right edge, tiny; the Pin beside it
    const X = lerp(1048, SX + 520 - 30, ease(seg(t, 112.6, 116.2))) + (SX + hw - SX - 520), Y = 642, walking8 = t > 112.6 && t < 116.2;
    const m = emotions(t, [[111.8, 'neutral', { lookX: .8 }], [116.6, 'thinking', { lookX: 1, lookY: 0 }], [119.3, 'neutral', { lookX: 1, lookY: -.5 }], [122.2, 'sad', { lookX: .6 }], [123.1, 'determined', { lookX: .8, lookY: .5 }], [124.0, 'happy']]);
    const drawing = t > 123.1 && t < 124.2;
    clawd(X, Y, 10.4, { ...m, view: walking8 ? 'side' : drawing ? 'q' : 'front', walk: walking8 ? X / 40 : null, rot: drawing ? .15 : m.rot, aR: drawing ? -.4 + .3 * Math.sin(t * 12) : m.aR });
    let pp = [X - 60, Y - 130 + pinBob(t) * .5];
    const out = seg(t, 119.4, 121.4);
    if (out > 0 && out < 1) pp = out < .5 ? arcPt(pp, [X + 330, Y - 170], 90, ease(out * 2)) : arcPt([X + 330, Y - 170], pp, 90, ease(out * 2 - 1));
    const pushK = Math.sin(Math.PI * seg(t, 121.8, 122.6));
    if (pushK > 0) pp = [lerp(pp[0], SX + hw + 26, pushK), lerp(pp[1], Y - 60, pushK)];
    // the bubble it carries across, and leaves on the far side
    if (out > 0) { const bp = out < .5 ? [pp[0] + 30, pp[1] - 36] : [X + 360, Y - 205 + 4 * Math.sin(t * 2)]; bubble(bp[0], bp[1], 60, 36, ease(seg(t, 119.4, 119.7)) * (1 - ease(seg(t, 123.4, 124.2))), { key: 'carry', tail: 0, sw: .5 }); }
    pin(t, pp[0], pp[1], 14, { lookX: 1, glow: .5, sq: -.25 * pushK + .15 * spring(t, 122.6, 6, 16) });
    camEnd();
    flash(ease(seg(t, 124.6, 125.2)), Z.warm);
  }

  // ======================= SHOT 9: the desk at dawn, and a blank bubble (125.2–146) =======================
  function shot9(t, lt, dur) {
    const c = K(t, [[125.2, [960, 620, 1.15]], [129.6, [960, 620, 1.15]], [131.2, [1180, 520, 1.18]], [132.9, [960, 600, 1.18]], [138.0, [930, 560, 1.25]], [146, [920, 520, 1.38]]]);
    cam(c[0] + 5 * wob(t, .07), c[1] + 3 * wob(t, .05, .4), c[2]);
    desk(t, 1, { wallMap: true, openK: ease(seg(t, 129.8, 130.6)), lamp: .4, screen: .2 });
    cardStack(560, 900, 8, t, { messy: .15 });
    const X = 930, Y = 930, u = 26;
    const pat = seg(t, 128.4, 129.4), bow = Math.sin(Math.PI * seg(t, 139.5, 140.4));
    const m = emotions(t, [[125.2, 'relieved'], [126.4, 'happy', { lookX: .7 }], [127.6, 'happy', { lookX: 0 }], [129.8, 'hopeful', { lookX: .9, lookY: -.4 }], [132.9, 'thinking', { lookX: 0 }],
      [134.2, 'neutral', { lookX: .8, lookY: -.4 }], [135.1, 'neutral', { lookX: .8 }], [136.3, 'hopeful', { lookX: -.2, lookY: -.9 }], [139.5, 'happy'], [140.6, 'hopeful', { lookX: 0, lookY: -.4 }]]);
    const aR = pat > 0 && pat < 1 ? .15 + .15 * Math.sin(pat * TAU * 2) : t > 135.0 && t < 136.1 ? .5 + .3 * Math.sin((t - 135) * 14) : m.aR;
    clawd(X, Y, u, { ...m, view: t > 129.8 && t < 132.9 ? 'q' : 'front', aR, sq: m.sq + .12 * bow, dy: m.dy + .5 * bow, ...(bow > .2 ? { eyes: 'closed' } : {}) });
    // the Pin beside Clawd now
    const px = 1180, py = 700 + pinBob(t);
    const offered = backOut(seg(t, 134.0, 134.6)), away = ease(seg(t, 135.6, 136.6));
    bubble(1300 + 260 * away, 470 - 160 * away, 190, 115, offered * (1 - away), { key: 'offer', tail: -1, glow: .2 });
    pin(t, px, py, 36, { lookX: t > 136.2 ? -.8 : -.5, lookY: t > 136.2 ? -.8 : 0, eyes: (pat > 0 && pat < 1) || (bow > .2) ? 'happy' : null, sq: .2 * Math.sin(Math.PI * pat) + .1 * bow, glow: .4, shadowY: 900 });
    // Clawd's own bubble: blank
    const own = backOut(seg(t, 136.2, 137.0)), bc = [890, 480 + 6 * Math.sin(t * 1.6)];
    bubble(bc[0], bc[1], 400, 240, own, { key: 'own', blank: true, tail: .6, glow: .35 * own, glowCol: '#FFE2A8', sw: 1.2 });
    const at = toScreen(bc[0], bc[1]);
    camEnd();
    if (lt < .9) flash(1 - ease(lt / .9), Z.warm);
    const ik = seg(t, 143.4, 145.4);
    if (ik > 0) iris(at[0], at[1], lerp(1500, 0, easeIn(ik)));
  }

  // The talk runs at the speaker's real pace (2:45 read aloud): the whole story is timed in "story seconds" and played
  // SLOW times slower, so each shot sees story time and every timing above stays as written.
  const SLOW = 1.2, slowed = list => list.map(([t0, fn]) => [t0 * SLOW, (t, lt, dur) => fn(t / SLOW, lt / SLOW, dur / SLOW)]);
  shots(slowed([[0, shot1], [17.8, shot2], [26.9, shot3], [49.4, shot4], [58.9, shot5], [71.9, shot6], [101.6, shot7], [111.8, shot8], [125.2, shot9]]));
})();
