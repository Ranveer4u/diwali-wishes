(() => {
  const $ = s => document.querySelector(s);
  const cv = $('#sky'), ctx = cv.getContext('2d');
  const pcv = $('#props'), pctx = pcv.getContext('2d');
  let W, H, parts = [], props = [], shake = 0, flash = 0;
  const resize = () => { W = cv.width = pcv.width = innerWidth; H = cv.height = pcv.height = innerHeight; };
  addEventListener('resize', resize); resize();

  /* ---------- Sound (WebAudio, no files) ---------- */
  let ac;
  const audio = () => ac || (ac = new (window.AudioContext || window.webkitAudioContext)());
  function noise(dur, vol, freq = 800) {
    const a = audio(), n = a.sampleRate * dur, b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 2;
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    f.type = 'lowpass'; f.frequency.value = freq; g.gain.value = vol;
    s.buffer = b; s.connect(f); f.connect(g); g.connect(a.destination); s.start();
  }
  function whistle(dur) {
    const a = audio(), o = a.createOscillator(), g = a.createGain();
    o.frequency.setValueAtTime(400, a.currentTime);
    o.frequency.exponentialRampToValueAtTime(1800, a.currentTime + dur);
    g.gain.setValueAtTime(.05, a.currentTime); g.gain.linearRampToValueAtTime(0, a.currentTime + dur);
    o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + dur);
  }
  const boom = (v = .9) => noise(.9, v, 600);
  const crackle = () => noise(.06, .25, 6000);

  /* ---------- Particles ---------- */
  const rnd = (a, b) => a + Math.random() * (b - a);
  const hue = () => [rnd(20, 50), rnd(0, 20), rnd(330, 360), rnd(90, 140), rnd(180, 220)][Math.random() * 5 | 0];
  const spark = (x, y, vx, vy, h, life = 1, g = .05, size = 2) => parts.push({ x, y, vx, vy, h, life, max: life, g, size });
  function burst(x, y, n = 90, speed = 6, h) {
    h = h ?? hue();
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = rnd(.3, 1) * speed;
      spark(x, y, Math.cos(a) * s, Math.sin(a) * s, h + rnd(-15, 15), rnd(.8, 1.6), .06, rnd(1.5, 2.8));
    }
  }

  /* ---------- Visible, glowing cracker bodies (drawn on #props) ---------- */
  function glow(c, x, y, r, col = 'rgba(255,210,120,.95)') {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, col); g.addColorStop(.4, 'rgba(255,140,30,.45)'); g.addColorStop(1, 'rgba(255,100,0,0)');
    c.globalCompositeOperation = 'lighter'; c.fillStyle = g;
    c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); c.globalCompositeOperation = 'source-over';
  }
  const addProp = fn => props.push(fn);

  /* ---------- Effects ---------- */
  const rx = () => rnd(W > 760 ? 280 : 130, W * .92);

  function sparkler() {                       // Ladi
    const x = rx(), top = H * .6, len = 110, dur = 3800, t0 = performance.now();
    addProp(c => {
      const k = performance.now() - t0; if (k > dur) return false;
      const tipY = top + len * (k / dur), baseY = top + len + 70;
      c.lineCap = 'round';
      c.strokeStyle = '#d8d8d8'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, tipY + 36); c.lineTo(x, baseY); c.stroke();   // wire handle
      c.strokeStyle = '#4a3a30'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, tipY); c.lineTo(x, tipY + 36); c.stroke();    // coated part
      glow(c, x, tipY, 28 + rnd(0, 10));
      for (let i = 0; i < 8; i++) { const a = rnd(0, 6.283), s = rnd(1, 4); spark(x, tipY, Math.cos(a) * s, Math.sin(a) * s - 1, rnd(30, 50), rnd(.3, .8), .1, 1.5); }
      if (Math.random() < .12) crackle();
    });
  }

  function fountain() {                       // Phuljhadi
    const x = rx(), y = H * .8, dur = 4200, t0 = performance.now(); noise(4, .15, 2500);
    addProp(c => {
      const k = performance.now() - t0; if (k > dur) return false;
      c.fillStyle = '#b5301f'; c.beginPath(); c.moveTo(x - 14, y); c.lineTo(x + 14, y); c.lineTo(x + 20, y + 54); c.lineTo(x - 20, y + 54); c.fill();
      c.fillStyle = '#ffb627'; c.fillRect(x - 17, y + 18, 34, 6);
      c.fillStyle = '#7a1d12'; c.beginPath(); c.ellipse(x, y, 14, 4, 0, 0, 6.283); c.fill();
      glow(c, x, y - 4, 36 + rnd(0, 10));
      for (let i = 0; i < 6; i++) spark(x, y - 4, rnd(-1.6, 1.6), rnd(-11, -7), rnd(25, 50), rnd(.8, 1.3), .18, 2);
    });
  }

  function spinner() {                        // Chakri
    const x = rx(), y = H * .66, dur = 4200, t0 = performance.now(); let a = 0; noise(4, .1, 3500);
    addProp(c => {
      const k = performance.now() - t0;
      if (k > dur) { burst(x, y, 40, 4, 40); boom(.3); return false; }
      a += .3 + k / 14000;
      c.strokeStyle = '#9a6b3a'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 90); c.stroke();
      c.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const ang = a + i * 2.094, ex = x + Math.cos(ang) * 26, ey = y + Math.sin(ang) * 26;
        c.strokeStyle = '#e8b04a'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, y); c.lineTo(ex, ey); c.stroke();
        glow(c, ex, ey, 22);
        spark(ex, ey, Math.cos(ang + 1.57) * 4, Math.sin(ang + 1.57) * 4, rnd(10, 40), .6, .02, 2);
      }
      c.fillStyle = '#fff3c4'; c.beginPath(); c.arc(x, y, 5, 0, 6.283); c.fill();
    });
  }

  // Burst point: around the "Happy Diwali." text (never above it)
  function target() {
    const r = $('.hero-title').getBoundingClientRect(), pad = 70;
    return { x: rnd(Math.max(20, r.left - pad), Math.min(W - 20, r.right + pad)), y: rnd(r.top + r.height * .1, r.bottom) };
  }
  function rocket(cb) {
    const t = target(), x = t.x, ty = t.y; let y = H; whistle(1);
    addProp(c => {
      y -= Math.max(4, (y - ty) * .07);
      spark(x + rnd(-1, 1), y + 20, rnd(-.3, .3), rnd(1, 2), 35, .5, .02, 2);
      if (y <= ty + 3) { burst(x, y, 130, 7); boom(.6); cb && cb(x, y); return false; }
      c.strokeStyle = '#c9a15c'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y + 12); c.lineTo(x, y + 60); c.stroke();
      c.fillStyle = '#e23b2e'; c.fillRect(x - 6, y - 20, 12, 32);
      c.fillStyle = '#ffb627'; c.beginPath(); c.moveTo(x - 6, y - 20); c.lineTo(x + 6, y - 20); c.lineTo(x, y - 36); c.fill();
      c.fillStyle = '#b5301f'; c.beginPath(); c.moveTo(x - 6, y + 12); c.lineTo(x - 12, y + 20); c.lineTo(x - 6, y + 6); c.moveTo(x + 6, y + 12); c.lineTo(x + 12, y + 20); c.lineTo(x + 6, y + 6); c.fill();
      glow(c, x, y + 18, 30 + rnd(0, 8));
    });
  }

  function bomb() {                           // Sutli bomb with burning fuse
    const x = rx(), y = H * .78, dur = 1100, t0 = performance.now(); whistle(.5);
    addProp(c => {
      const k = performance.now() - t0;
      if (k > dur) { burst(x, y - 10, 220, 10, 30); burst(x, y - 10, 80, 4, 0); boom(1); shake = 18; flash = .6; return false; }
      const g = c.createRadialGradient(x - 6, y - 6, 2, x, y, 20); g.addColorStop(0, '#666'); g.addColorStop(1, '#111');
      c.fillStyle = g; c.beginPath(); c.arc(x, y, 20, 0, 6.283); c.fill();
      c.fillStyle = '#e23b2e'; c.fillRect(x - 20, y - 3, 40, 6);
      const tx = x + 14 - 4 * (k / dur), ty = y - 36 + 14 * (k / dur);
      c.strokeStyle = '#d8b46a'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x, y - 20); c.quadraticCurveTo(x + 4, y - 30, tx, ty); c.stroke();
      glow(c, tx, ty, 24 + rnd(0, 8));
      for (let i = 0; i < 3; i++) spark(tx, ty, rnd(-2, 2), rnd(-3, 0), rnd(30, 50), rnd(.3, .6), .1, 1.5);
    });
  }

  function pro() {
    for (let i = 0; i < 6; i++) setTimeout(() => rocket((x, y) => {
      burst(x, y, 70, 3.5, hue()); setTimeout(() => burst(x, y, 60, 10, hue()), 120);
    }), i * 450);
  }

  const FX = { sparkler, fountain, spinner, rocket, bomb, pro };
  const fire = t => { audio().resume(); FX[t](); };

  document.querySelectorAll('.card').forEach(c => c.addEventListener('click', () => fire(c.dataset.type)));
  $('#lightAll').onclick = () => Object.keys(FX).forEach((k, i) => setTimeout(() => fire(k), i * 350));
  cv.addEventListener('pointerdown', e => { audio().resume(); burst(e.clientX, e.clientY, 80, 6); boom(.4); });
  $('main').addEventListener('pointerdown', e => {
    if (e.target.closest('.picker')) return;
    burst(e.clientX, e.clientY, 80, 6); boom(.4);
  });

  /* ---------- Render loop ---------- */
  function loop() {
    ctx.save();
    if (shake > 0) { ctx.translate(rnd(-shake, shake), rnd(-shake, shake)); shake *= .9; }
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(7,7,10,.22)'; ctx.fillRect(-20, -20, W + 40, H + 40);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.vy += p.g; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.life -= .016;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      ctx.fillStyle = `hsla(${p.h},100%,${55 + 20 * (p.life / p.max)}%,${p.life / p.max})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (.4 + p.life / p.max), 0, 6.283); ctx.fill();
    }
    if (flash > 0) { ctx.fillStyle = `rgba(255,220,160,${flash})`; ctx.fillRect(0, 0, W, H); flash *= .85; }
    ctx.restore();

    pctx.clearRect(0, 0, W, H);
    for (let i = props.length - 1; i >= 0; i--) {
      pctx.save(); const keep = props[i](pctx); pctx.restore();
      if (keep === false) props.splice(i, 1);
    }
    requestAnimationFrame(loop);
  }
  loop();
  setTimeout(() => rocket(), 600);

})();
