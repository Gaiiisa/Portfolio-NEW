/* ============================================== PROJECT OPENER (global, runs first) */
function openProject(idx) {
  var m = document.getElementById('proj-modal');
  if (!m) return;
  if (window._pmo) { window._pmo(idx); } else { m.classList.add('open'); m.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; m.scrollTop=0; }
}

/* ============================================== SCROLL CACHE */
var _scrollY = window.scrollY || 0;
var _docH    = document.documentElement.scrollHeight;
var _winH    = window.innerHeight;
window.addEventListener('scroll',  function(){ _scrollY = window.scrollY; }, { passive: true });
window.addEventListener('resize',  function(){
  _docH = document.documentElement.scrollHeight;
  _winH = window.innerHeight;
}, { passive: true });

/* ============================================== LOADER */
(function(){
  const pct    = document.getElementById('lpct');
  const bar    = document.querySelector('.lid .pct .bar');
  const loader = document.getElementById('loader');
  let p = 0;
  const t = setInterval(() => {
    p = Math.min(100, p + Math.random() * 3 + 1);
    const v = Math.floor(p);
    if (bar) bar.style.setProperty('--p', v + '%');
    pct.textContent = String(v).padStart(3, '0') + '%';
    if (p >= 100) {
      clearInterval(t);
      setTimeout(() => {
        loader.classList.add('gone');
        /* Start hero entrance ~450 ms into the slide — content becomes visible around that point */
        setTimeout(() => { if (window._startHeroEntrance) window._startHeroEntrance(); }, 450);
        /* Remove loader from layout after the slide finishes so it can never block clicks */
        setTimeout(() => { loader.style.display = 'none'; }, 2000);
      }, 420);
    }
  }, 50);
})();

/* ============================================== THEME */
(function(){
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  if (saved) root.setAttribute('data-theme', saved);
  const icon = document.getElementById('theme-icon');
  function setIcon(){
    const dark = root.getAttribute('data-theme') === 'dark';
    icon.innerHTML = dark
      ? '<path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79Z"/>'
      : '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>';
  }
  setIcon();
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const dark = root.getAttribute('data-theme') === 'dark';
    const next = dark ? 'light' : 'dark';
    document.body.classList.add('theme-switching');
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    setIcon();
    setTimeout(function(){ document.body.classList.remove('theme-switching'); }, 600);
  });
})();

/* ============================================== MOBILE MENU */
(function(){
  const m = document.getElementById('mobile-menu');
  const open = document.getElementById('menu-open');
  const close = document.getElementById('menu-close');
  if (open) open.addEventListener('click', () => m.classList.add('open'));
  close.addEventListener('click', () => m.classList.remove('open'));
  m.querySelectorAll('[data-mm]').forEach(a => a.addEventListener('click', () => m.classList.remove('open')));
})();

/* ============================================== SKILLS */
const SKILLS = {
  frontend: [
    ['React', '5a'], ['Next.js', '4a'], ['TypeScript', '5a'], ['Vite', '3a'],
    ['Astro', '2a'], ['Tailwind', '4a'], ['Framer Motion', '3a'], ['Radix UI', '3a'],
    ['React Query', '4a'], ['Zustand', '3a']
  ],
  backend: [
    ['Node.js', '6a'], ['Go', '3a'], ['Python', '4a'], ['Hono', '2a'],
    ['tRPC', '3a'], ['Fastify', '3a'], ['GraphQL', '4a'], ['WebSockets', '4a'],
    ['REST', '6a'], ['gRPC', '2a']
  ],
  db: [
    ['PostgreSQL', '6a'], ['Redis', '5a'], ['SQLite', '3a'], ['Prisma', '3a'],
    ['Drizzle', '2a'], ['Supabase', '3a'], ['BigQuery', '2a'], ['MongoDB', '4a'],
    ['ClickHouse', '2a']
  ],
  tools: [
    ['Git', '6a'], ['GitHub', '6a'], ['VS Code', '6a'], ['Figma', '5a'],
    ['Linear', '4a'], ['Notion', '4a'], ['Postman', '5a'], ['Sentry', '4a'],
    ['Storybook', '4a']
  ],
  devops: [
    ['Docker', '5a'], ['Kubernetes', '3a'], ['AWS', '4a'], ['Vercel', '4a'],
    ['Fly.io', '2a'], ['Cloudflare', '3a'], ['Terraform', '2a'], ['GitHub Actions', '4a']
  ]
};
(function(){
  const grid = document.getElementById('skills-grid');
  function render(cat) {
    grid.innerHTML = SKILLS[cat].map(([name, yrs]) => `
      <div class="chip"><span class="b">${name.slice(0,2).toLowerCase()}</span><span class="n">${name}</span><span class="yrs">${yrs}</span></div>
    `).join('');
  }
  render('frontend');
  document.querySelectorAll('.skills-tabs .tab').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.skills-tabs .tab').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    render(b.dataset.cat);
  }));
})();

/* ============================================== REVEAL */
(function(){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: .14, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
})();

/* ============================================== SCROLL PROGRESS */
(function(){
  const bar = document.getElementById('progress');
  function tick(){
    const max = _docH - _winH;
    bar.style.width = (max > 0 ? (_scrollY / max * 100) : 0) + '%';
  }
  document.addEventListener('scroll', tick, { passive: true });
  tick();
})();

/* ============================================== HERO ENTRANCE */
(function(){
  const E = 'cubic-bezier(.16,1,.3,1)';

  /*
   * Sequence of elements, each with its own timing.
   * y:0  → opacity-only (element has a pre-existing transform that must be preserved, e.g. nav)
   * y>0  → opacity + translateY entrance
   */
  const seq = [
    { sel: '#nav',              y:  0,  dur: 1.70, delay: 0.00 },
    { sel: '.hero-corners',     y: 16,  dur: 2.00, delay: 0.45 },
    { sel: '.s1 .line',         y: 52,  dur: 2.30, delay: 0.88 },
    { sel: '.s1 .by',           y: 24,  dur: 2.00, delay: 1.38 },
    { sel: '.s1 .cta-row',      y: 24,  dur: 2.00, delay: 1.82 },
    { sel: '#hero-wave-canvas', y:  0,  dur: 2.50, delay: 2.10 },
  ];

  const items = seq
    .map(s => ({ ...s, el: document.querySelector(s.sel) }))
    .filter(s => s.el);

  /* Set initial hidden state immediately — loader covers everything, so no flash */
  items.forEach(s => {
    s.el.style.opacity = '0';
    if (s.y !== 0) s.el.style.transform = `translateY(${s.y}px)`;
  });

  window._startHeroEntrance = function () {
    /* Apply transitions, then trigger target state in the next two frames */
    items.forEach(s => {
      s.el.style.transition =
        `opacity ${s.dur}s ${E} ${s.delay}s, transform ${s.dur}s ${E} ${s.delay}s`;
    });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      items.forEach(s => {
        s.el.style.opacity = '1';
        if (s.y !== 0) s.el.style.transform = 'translateY(0)';
      });
    }));

    /* Once all transitions are done, clear inline styles so CSS / scroll animations take back control */
    const maxEnd = Math.max(...items.map(s => s.delay + s.dur));
    setTimeout(() => {
      items.forEach(s => {
        s.el.style.transition = '';
        s.el.style.opacity    = '';
        s.el.style.transform  = '';
      });
    }, (maxEnd + 0.15) * 1000);
  };
})();

/* ============================================== SMOOTH SCROLL (âncoras apenas) */
(function(){
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

/* ============================================== ACTIVE NAV */
(function(){
  const links = document.querySelectorAll('nav.menu a');
  const ids = [...links].map(a => a.getAttribute('href').slice(1));
  const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const a = document.querySelector(`nav.menu a[href="#${e.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => io.observe(s));
})();

/* ============================================== HIDE NAV ON DOWN-SCROLL */
(function(){
  const nav = document.getElementById('nav');
  let last = 0;
  document.addEventListener('scroll', () => {
    const y = _scrollY;
    if (y > 200 && y > last + 8) nav.classList.add('hidden');
    else if (y < last - 8 || y < 200) nav.classList.remove('hidden');
    last = y;
  }, { passive: true });
})();

/* ============================================== CLOCKS */
(function(){
  const a = document.getElementById('hclock');
  const b = document.getElementById('fclock');
  function tick(){
    const t = new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
    if (a) a.textContent = t + ' · UTC−3';
    if (b) b.textContent = 'SÃO PAULO · ' + t + ' · UTC−3';
  }
  tick(); setInterval(tick, 30000);
})();

/* ============================================== CURSOR PARTICLES (no falling — emit from mouse only on move) */
(function(){
  const c = document.getElementById('cursor-canvas');
  const ctx = c.getContext('2d');
  let w, h, dpr;
  function resize(){
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = c.width = innerWidth * dpr;
    h = c.height = innerHeight * dpr;
    c.style.width = innerWidth + 'px';
    c.style.height = innerHeight + 'px';
  }
  resize(); addEventListener('resize', resize);

  const ps = [];
  let lx = 0, ly = 0;

  addEventListener('mousemove', (e) => {
    const x = e.clientX * dpr, y = e.clientY * dpr;
    const dx = x - lx, dy = y - ly;
    const d = Math.hypot(dx, dy);
    if (d > 1.5) {
      const n = Math.min(4, Math.floor(d / 6) + 1);
      for (let i = 0; i < n; i++) {
        ps.push({
          x: x + (Math.random()-.5)*4,
          y: y + (Math.random()-.5)*4,
          vx: (Math.random()-.5)*.3 + dx*.02,
          vy: (Math.random()-.5)*.3 + dy*.02,
          life: 1,
          s: (Math.random()*1.2 + .6) * dpr
        });
      }
      lx = x; ly = y;
      if (!cursorRaf) cursorRaf = requestAnimationFrame(loop);
    }
  });

  let cursorRaf = null;
  function loop(){
    cursorRaf = null;
    if (window.__rafPaused) return;
    ctx.clearRect(0, 0, w, h);
    if (ps.length === 0) return;
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const col = isLight ? [120,120,120] : [212,163,63];
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.x += p.vx; p.y += p.vy;
      p.vx *= .96; p.vy *= .96;
      p.life -= .018;
      if (p.life <= 0) { ps.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${p.life * .8})`;
      ctx.arc(p.x, p.y, p.s * p.life, 0, Math.PI*2);
      ctx.fill();
    }
    if (ps.length > 0) cursorRaf = requestAnimationFrame(loop);
  }
})();

/* ============================================== HERO SCROLL TRANSITION */
(function(){
  /* Se o browser suporta scroll-driven animations, o CSS já faz tudo */
  if (CSS.supports('animation-timeline', 'scroll()')) return;

  /* Fallback JS para Firefox */
  var driver  = document.querySelector('.hero-driver');
  var groupA  = document.querySelector('.hero-group-a');
  var groupB  = document.querySelector('.hero-group-b');
  var byEl    = document.querySelector('.s1 .by');
  var ctaRow  = document.querySelector('.s1 .cta-row');
  var corners = document.querySelector('.hero-corners');
  if (!driver || !groupA || !groupB) return;

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function map(v, a, b, c, d) { return c + (d - c) * clamp((v - a) / (b - a), 0, 1); }

  var vw = window.innerWidth;
  window.addEventListener('resize', function(){ vw = window.innerWidth; }, { passive: true });

  function readTarget() {
    var range = driver.offsetHeight - window.innerHeight;
    return range > 0 ? clamp(window.scrollY / range, 0, 1) : 0;
  }

  function applyAt(p) {
    var t  = clamp(p / 0.92, 0, 1);
    var e  = 1 - (1 - t) * (1 - t);
    var tx = (e * vw * 0.45).toFixed(2);
    var op = map(p, 0.08, 0.90, 1, 0).toFixed(4);
    groupA.style.transform = 'translateX(-' + tx + 'px)';
    groupB.style.transform = 'translateX('  + tx + 'px)';
    groupA.style.opacity   = op;
    groupB.style.opacity   = op;
    if (byEl)    byEl.style.opacity    = map(p, 0.07, 0.55, 1, 0).toFixed(4);
    if (ctaRow)  ctaRow.style.opacity  = map(p, 0.05, 0.55, 1, 0).toFixed(4);
    if (corners) corners.style.opacity = map(p, 0.0,  0.35, 1, 0).toFixed(4);
  }

  var rafId = null, prevTs = 0, displayP = 0, targetP = 0;
  function loop(ts) {
    rafId = null;
    var dt = prevTs ? Math.min((ts - prevTs) * 0.001, 0.05) : 0.016;
    prevTs = ts;
    targetP = readTarget();
    displayP += (targetP - displayP) * (1 - Math.exp(-12 * dt));
    if (Math.abs(targetP - displayP) < 0.00005) displayP = targetP;
    applyAt(displayP);
    if (Math.abs(targetP - displayP) > 0.00005) rafId = requestAnimationFrame(loop);
  }
  function kick() { if (!rafId) { prevTs = 0; rafId = requestAnimationFrame(loop); } }
  document.addEventListener('scroll', kick, { passive: true });
  targetP = displayP = readTarget();
  applyAt(displayP);
}());

/* ============================================== HERO WAVE PARTICLES */
(function(){

  const cvs = document.getElementById('hero-wave-canvas');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  if (!ctx) return;
  const driver = document.querySelector('.hero-driver');
  if (!driver) return;

  const MOBILE = matchMedia('(max-width: 600px)').matches;
  const COUNT  = MOBILE ? 500 : 2500;
  const TAU    = Math.PI * 2;

  /* dark mode → gold palette  |  light mode → silver palette */
  const DARK_PAL = [
    [212,163, 63], [218,175, 80], [228,190,100],
    [245,193, 93], [200,150, 50], [235,185, 72],
  ];
  /* zinc-700/600 range — readable on the near-white light background */
  const LIGHT_PAL = [
    [63,63,70], [71,71,79], [82,82,91],
    [55,55,63], [75,75,84], [68,68,76],
  ];

  /* pre-build color strings for both palettes (6 each) */
  const DARK_COLS  = DARK_PAL .map(c => `rgb(${c[0]},${c[1]},${c[2]})`);
  const LIGHT_COLS = LIGHT_PAL.map(c => `rgb(${c[0]},${c[1]},${c[2]})`);

  let W = 0, H = 0, DPR = 1;
  let pts = [];
  let animT = 0, lastTs = 0;

  /* ---- resize / rebuild ---------------------------------------- */
  function resize() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = cvs.offsetWidth;
    H = cvs.offsetHeight;
    cvs.width  = Math.round(W * DPR);
    cvs.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    build();
  }

  function build() {
    pts = [];
    for (let i = 0; i < COUNT; i++) {
      const r = (Math.random() - .5) * 2;
      pts.push({
        x:      Math.random() * W,
        yOff:   r * Math.abs(r) * 52,       // cubic dist → clustered near crest
        sz:     0.28 + Math.random() * 0.92,
        bA:     0.18 + Math.random() * 0.72,
        spd:    0.10 + Math.random() * 0.25,
        twPh:   Math.random() * TAU,
        twRt:   0.005 + Math.random() * 0.013,
        palIdx: Math.floor(Math.random() * 6), // index into whichever palette is active
      });
    }
  }

  /* ---- multi-frequency wave ------------------------------------- */
  function waveY(x, t) {
    return (
      H * 0.130 * Math.sin(x * 0.0052 + t * 0.26) +
      H * 0.055 * Math.sin(x * 0.0165 + t * 0.43 + 1.7) +
      H * 0.022 * Math.sin(x * 0.038  + t * 0.72 + 3.2)
    );
  }

  function clampV(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* ---- animation loop ------------------------------------------ */
  let waveRaf = null;
  function frame(ts) {
    waveRaf = null;

    const dt = Math.min(ts - lastTs, 50);
    lastTs = ts;
    animT += dt * 0.001;

    /* scroll-driven fade — fully gone by scroll-progress 0.50 (matches CSS contain 50%) */
    const range = driver.offsetHeight - window.innerHeight;
    const sp    = range > 0 ? clampV(window.scrollY / range, 0, 1) : 0;
    const wa    = Math.max(0, 1 - sp / 0.50);

    if (wa <= 0.003) { ctx.clearRect(0, 0, W, H); return; }
    if (window.__rafPaused) { waveRaf = requestAnimationFrame(frame); return; }
    waveRaf = requestAnimationFrame(frame);

    ctx.clearRect(0, 0, W, H);

    /* resolve palette + opacity boost from current theme once per frame */
    const isDark    = document.documentElement.getAttribute('data-theme') !== 'light';
    const COLS      = isDark ? DARK_COLS : LIGHT_COLS;
    const aBoost    = isDark ? 1.0 : 1.8; // extra opacity for light bg

    const base = H * 0.46;
    const SIG2 = 2 * 20 * 20; // Gaussian σ=20

    for (let i = 0, n = pts.length; i < n; i++) {
      const pt = pts[i];

      pt.x += pt.spd;
      if (pt.x > W + 2) pt.x -= W + 4; // wrap

      pt.twPh += pt.twRt;

      const wy = base + waveY(pt.x, animT) + pt.yOff;
      if (wy < -2 || wy > H + 2) continue;

      /* Gaussian falloff from crest + subtle twinkle */
      const gf    = Math.exp(-(pt.yOff * pt.yOff) / SIG2);
      const tw    = 0.88 + 0.12 * Math.sin(pt.twPh);
      const alpha = Math.min(1, pt.bA * gf * tw * wa * aBoost);
      if (alpha < 0.012) continue;

      ctx.globalAlpha = alpha;
      ctx.fillStyle   = COLS[pt.palIdx];
      ctx.beginPath();
      ctx.arc(pt.x, wy, pt.sz, 0, TAU);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  function kickWave() { if (!waveRaf) waveRaf = requestAnimationFrame(frame); }
  document.addEventListener('scroll', kickWave, { passive: true });

  /* ---- init ---------------------------------------------------- */
  resize();

  let resizeTimer;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  waveRaf = requestAnimationFrame(frame);
})();

/* ============================================== MAGNETIC */
(function(){
  document.querySelectorAll('.btn, .cta-pill, .icon-btn').forEach(b => {
    b.addEventListener('mousemove', (e) => {
      const r = b.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      b.style.transform = `translate(${x*.18}px, ${y*.18}px)`;
    });
    b.addEventListener('mouseleave', () => b.style.transform = '');
  });
})();

/* ============================================== SPLIT TEXT on h2.title */
(function(){
  document.querySelectorAll('h2.title').forEach(h => {
    const html = h.innerHTML;
    h.innerHTML = html.split('<br>').map(line => `<span class="split-line"><span>${line}</span></span>`).join('');
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.split-line').forEach((ln, i) => setTimeout(() => ln.classList.add('in'), i * 80));
        io.unobserve(e.target);
      }
    });
  }, { threshold: .2 });
  document.querySelectorAll('h2.title').forEach(h => io.observe(h));
})();

/* ============================================== HERO PARALLAX (subtle, transform only) */
(function(){
  const glowA = document.querySelector('.bg-glow-a');
  const glowB = document.querySelector('.bg-glow-b');
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / innerWidth - .5) * 30;
    const y = (e.clientY / innerHeight - .5) * 30;
    if (glowA) glowA.style.transform = `translate(${x}px, ${y}px)`;
    if (glowB) glowB.style.transform = `translate(${-x}px, ${-y}px)`;
  });
})();

/* ============================================== CUSTOM SCROLLBAR */
(function(){
  const sb  = document.getElementById('custom-sb');
  const cvs = document.getElementById('custom-sb-cvs');
  if (!sb || !cvs) return;
  const ctx = cvs.getContext('2d');
  if (!ctx) return;

  const W   = 16;  // CSS px — matches #custom-sb width
  const TAU = Math.PI * 2;

  /* dark = gold  |  light = silver */
  const DARK_COLS = [
    'rgb(212,163,63)', 'rgb(218,175,80)', 'rgb(228,190,100)',
    'rgb(245,193,93)', 'rgb(200,150,50)', 'rgb(235,185,72)',
  ];
  const LIGHT_COLS = [
    'rgb(140,140,140)', 'rgb(159,159,159)', 'rgb(176,176,176)',
    'rgb(196,196,196)', 'rgb(212,212,212)', 'rgb(152,150,155)',
  ];

  let pts = [], lastH = 0, animT = 0, lastTs = 0, DPR = 1;

  function isLight() {
    return document.documentElement.getAttribute('data-theme') === 'light';
  }

  /* metrics() removida — usa cache global _scrollY, _docH, _winH */

  function build(h) {
    DPR = Math.min(devicePixelRatio || 1, 2);
    cvs.width  = Math.round(W * DPR);
    cvs.height = Math.round(h * DPR);
    cvs.style.width  = W + 'px';
    cvs.style.height = h + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    lastH = h;

    pts = [];
    const n = Math.round(h * 2.2);
    for (let i = 0; i < n; i++) {
      pts.push({
        x:   0.4 + Math.random() * (W - 0.8),
        y:   0.4 + Math.random() * (h  - 0.8),
        sz:  0.22 + Math.random() * 0.56,
        bA:  0.40 + Math.random() * 0.50,
        idx: Math.floor(Math.random() * 6),
        ph:  Math.random() * TAU,
        rt:  0.012 + Math.random() * 0.022,
      });
    }
  }

  /* pill clip path */
  function pill(h) {
    const r = W / 2;
    ctx.beginPath();
    ctx.moveTo(0, r);
    ctx.arc(r, r,     r, Math.PI, 0);      // top cap
    ctx.lineTo(W, h - r);
    ctx.arc(r, h - r, r, 0,       Math.PI); // bottom cap
    ctx.closePath();
    ctx.clip();
  }

  function frame(ts) {
    requestAnimationFrame(frame);
    if (window.__rafPaused) return;

    const dt = Math.min(ts - lastTs, 50);
    lastTs = ts;
    animT += dt * 0.001;

    const h   = Math.max(36, Math.round(_winH * Math.min(1, _winH / _docH)));
    const ok  = _docH > _winH;
    const top = ok ? Math.round((_scrollY / (_docH - _winH)) * (_winH - h)) : 0;
    if (!ok) { ctx.clearRect(0, 0, W, lastH); return; }
    if (Math.abs(h - lastH) > 1) build(h);

    cvs.style.top = top + 'px';

    /* resolve palette from current theme */
    const COLS = isLight() ? LIGHT_COLS : DARK_COLS;

    ctx.clearRect(0, 0, W, h);
    ctx.save();
    pill(h);

    for (let i = 0, n = pts.length; i < n; i++) {
      const p = pts[i];
      p.ph += p.rt;
      ctx.globalAlpha = p.bA * (0.80 + 0.20 * Math.sin(p.ph));
      ctx.fillStyle   = COLS[p.idx];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.sz, 0, TAU);
      ctx.fill();
    }

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  /* init */
  const h = Math.max(36, Math.round(_winH * Math.min(1, _winH / _docH)));
  build(h);

  window.addEventListener('resize', () => {
    const nh = Math.max(36, Math.round(_winH * Math.min(1, _winH / _docH)));
    if (Math.abs(nh - lastH) > 2) build(nh);
  }, { passive: true });

  requestAnimationFrame(frame);
})();

/* ============================================== PROJECT DETAIL */
(function(){
  var modal = document.getElementById('proj-modal');
  if (!modal) return;

  var bgArt       = modal.querySelector('.pd-bg-art');
  var scrollEl    = document.getElementById('pd-scroll');
  var barEl       = document.getElementById('pd-bar');
  var coverInner  = document.getElementById('pd-cover-inner');
  var mainTitle   = document.getElementById('pd-main-title');
  var subtitleEl  = document.getElementById('pd-subtitle');
  var infoGrid    = document.getElementById('pd-info-grid');
  var descText    = document.getElementById('pd-desc-text');
  var descActions = document.getElementById('pd-desc-actions');
  var presMedia   = document.getElementById('pd-presentation-media');
  var sectionsEl  = document.getElementById('pd-sections');
  var galleryGrid = document.getElementById('pd-gallery-grid');
  var resultQuote = document.getElementById('pd-result-quote');
  var resultText  = document.getElementById('pd-result-text');
  var resultActs  = document.getElementById('pd-result-actions');
  var nextBtn     = document.getElementById('pd-next');
  var nextName    = document.getElementById('pd-next-name');
  var closeBtn    = document.getElementById('pd-close');
  var backBtn     = document.getElementById('pd-back');

  var cards  = Array.from(document.querySelectorAll('#projects .proj'));
  var BG_POS = ['20% 45%','72% 35%','50% 68%','22% 30%','78% 55%','45% 72%'];

  /* ── Rich fictional data for each project ───────────────────── */
  var PROJ_DATA = [
    {
      longDesc: 'ZeroGrau nasceu de uma pergunta simples: é possível construir uma loja com alma de grife — identidade forte, experiência fluida, regras de negócio reais — sem usar frameworks ou plataformas prontas? A resposta está nessa loja. Da vitrine estilo lookbook com troca de foto no hover até o painel administrativo que controla pedidos, estoque e faturamento, cada detalhe foi pensado e construído do zero. Um e-commerce completo que funciona de verdade — e parece que foi feito por uma agência.',
      visual: `<img src="assets/northwind.jpeg" alt="Northwind" style="width:min(88%,1100px);height:auto;max-height:78vh;border-radius:16px;box-shadow:0 20px 80px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.06);object-fit:cover;display:block"/>`,
      _visual_bak: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><rect width="480" height="480" fill="#0a0a0a"/><rect width="94" height="480" fill="#0d0d0d"/><rect x="11" y="18" width="72" height="22" rx="5" fill="#1a1304"/><text x="47" y="33" text-anchor="middle" font-size="9" fill="#d4a33f" font-family="monospace" font-weight="bold">NORTHWIND</text><rect x="11" y="54" width="72" height="26" rx="5" fill="#d4a33f22"/><rect x="18" y="63" width="6" height="6" rx="1" fill="#d4a33f"/><rect x="28" y="64" width="38" height="5" rx="2" fill="#d4a33f"/><rect x="28" y="92" width="36" height="5" rx="2" fill="#2a2a2a"/><rect x="28" y="110" width="44" height="5" rx="2" fill="#2a2a2a"/><rect x="28" y="128" width="26" height="5" rx="2" fill="#2a2a2a"/><rect x="28" y="146" width="38" height="5" rx="2" fill="#2a2a2a"/><rect x="104" y="14" width="86" height="52" rx="7" fill="#111" stroke="#1e1e1e" stroke-width="1"/><rect x="196" y="14" width="86" height="52" rx="7" fill="#111" stroke="#1e1e1e" stroke-width="1"/><rect x="288" y="14" width="86" height="52" rx="7" fill="#111" stroke="#1e1e1e" stroke-width="1"/><rect x="380" y="14" width="86" height="52" rx="7" fill="#1a1304" stroke="#d4a33f33" stroke-width="1"/><text x="147" y="38" text-anchor="middle" font-size="14" font-weight="bold" fill="#f5f5f5" font-family="monospace">R$42k</text><text x="147" y="54" text-anchor="middle" font-size="7" fill="#71717a" font-family="monospace">RECEITA MÊS</text><text x="239" y="38" text-anchor="middle" font-size="14" font-weight="bold" fill="#f5f5f5" font-family="monospace">89%</text><text x="239" y="54" text-anchor="middle" font-size="7" fill="#71717a" font-family="monospace">CONCILIADO</text><text x="331" y="38" text-anchor="middle" font-size="14" font-weight="bold" fill="#f5f5f5" font-family="monospace">14</text><text x="331" y="54" text-anchor="middle" font-size="7" fill="#71717a" font-family="monospace">EMPRESAS</text><text x="423" y="38" text-anchor="middle" font-size="14" font-weight="bold" fill="#d4a33f" font-family="monospace">+12%</text><text x="423" y="54" text-anchor="middle" font-size="7" fill="#d4a33f88" font-family="monospace">VS ANTERIOR</text><rect x="104" y="78" width="248" height="148" rx="7" fill="#111" stroke="#1e1e1e" stroke-width="1"/><text x="118" y="96" font-size="7" fill="#71717a" font-family="monospace">RECEITA MENSAL (R$)</text><line x1="118" y1="106" x2="340" y2="106" stroke="#1a1a1a" stroke-width="1"/><line x1="118" y1="128" x2="340" y2="128" stroke="#1a1a1a" stroke-width="1"/><line x1="118" y1="150" x2="340" y2="150" stroke="#1a1a1a" stroke-width="1"/><line x1="118" y1="172" x2="340" y2="172" stroke="#1a1a1a" stroke-width="1"/><line x1="118" y1="194" x2="340" y2="194" stroke="#1a1a1a" stroke-width="1"/><polygon points="122,200 158,172 194,184 230,155 266,165 303,137 340,143 340,208 122,208" fill="#d4a33f18"/><polyline points="122,200 158,172 194,184 230,155 266,165 303,137 340,143" fill="none" stroke="#d4a33f" stroke-width="2" stroke-linejoin="round"/><circle cx="340" cy="143" r="3.5" fill="#d4a33f"/><rect x="358" y="78" width="108" height="148" rx="7" fill="#111" stroke="#1e1e1e" stroke-width="1"/><text x="372" y="96" font-size="7" fill="#71717a" font-family="monospace">DESPESAS</text><line x1="358" y1="102" x2="466" y2="102" stroke="#1a1a1a" stroke-width="1"/><text x="372" y="119" font-size="7" fill="#a1a1aa" font-family="monospace">Fornecedores</text><rect x="372" y="122" width="82" height="5" rx="2" fill="#1e1e1e"/><rect x="372" y="122" width="56" height="5" rx="2" fill="#d4a33f66"/><text x="372" y="139" font-size="7" fill="#a1a1aa" font-family="monospace">Infra cloud</text><rect x="372" y="142" width="82" height="5" rx="2" fill="#1e1e1e"/><rect x="372" y="142" width="20" height="5" rx="2" fill="#d4a33f44"/><text x="372" y="159" font-size="7" fill="#a1a1aa" font-family="monospace">Folha</text><rect x="372" y="162" width="82" height="5" rx="2" fill="#1e1e1e"/><rect x="372" y="162" width="68" height="5" rx="2" fill="#d4a33f55"/><text x="372" y="179" font-size="7" fill="#a1a1aa" font-family="monospace">Marketing</text><rect x="372" y="182" width="82" height="5" rx="2" fill="#1e1e1e"/><rect x="372" y="182" width="12" height="5" rx="2" fill="#d4a33f33"/><text x="372" y="199" font-size="7" fill="#a1a1aa" font-family="monospace">Outros</text><rect x="372" y="202" width="82" height="5" rx="2" fill="#1e1e1e"/><rect x="372" y="202" width="30" height="5" rx="2" fill="#d4a33f44"/><rect x="104" y="238" width="362" height="228" rx="7" fill="#111" stroke="#1e1e1e" stroke-width="1"/><text x="118" y="256" font-size="7" fill="#71717a" font-family="monospace">TRANSAÇÕES RECENTES</text><line x1="104" y1="262" x2="466" y2="262" stroke="#1e1e1e" stroke-width="1"/><rect x="112" y="270" width="42" height="13" rx="3" fill="#5cc18922"/><text x="133" y="280" text-anchor="middle" font-size="7" fill="#5cc189" font-family="monospace">CRÉDITO</text><text x="166" y="280" font-size="7" fill="#a1a1aa" font-family="monospace">Assinatura · Cliente ABC</text><text x="456" y="280" text-anchor="end" font-size="8" fill="#5cc189" font-family="monospace">+R$18.500</text><line x1="112" y1="288" x2="456" y2="288" stroke="#161616" stroke-width="1"/><rect x="112" y="296" width="42" height="13" rx="3" fill="#e06b6b22"/><text x="133" y="306" text-anchor="middle" font-size="7" fill="#e06b6b" font-family="monospace">DÉBITO</text><text x="166" y="306" font-size="7" fill="#a1a1aa" font-family="monospace">Folha · Junho</text><text x="456" y="306" text-anchor="end" font-size="8" fill="#e06b6b" font-family="monospace">-R$9.800</text><line x1="112" y1="314" x2="456" y2="314" stroke="#161616" stroke-width="1"/><rect x="112" y="322" width="42" height="13" rx="3" fill="#5cc18922"/><text x="133" y="332" text-anchor="middle" font-size="7" fill="#5cc189" font-family="monospace">CRÉDITO</text><text x="166" y="332" font-size="7" fill="#a1a1aa" font-family="monospace">Upsell Enterprise · XYZ</text><text x="456" y="332" text-anchor="end" font-size="8" fill="#5cc189" font-family="monospace">+R$7.600</text><line x1="112" y1="340" x2="456" y2="340" stroke="#161616" stroke-width="1"/><rect x="112" y="348" width="42" height="13" rx="3" fill="#e06b6b22"/><text x="133" y="358" text-anchor="middle" font-size="7" fill="#e06b6b" font-family="monospace">DÉBITO</text><text x="166" y="358" font-size="7" fill="#a1a1aa" font-family="monospace">Infraestrutura AWS</text><text x="456" y="358" text-anchor="end" font-size="8" fill="#e06b6b" font-family="monospace">-R$1.450</text><line x1="112" y1="366" x2="456" y2="366" stroke="#161616" stroke-width="1"/><rect x="112" y="374" width="42" height="13" rx="3" fill="#5cc18922"/><text x="133" y="384" text-anchor="middle" font-size="7" fill="#5cc189" font-family="monospace">CRÉDITO</text><text x="166" y="384" font-size="7" fill="#a1a1aa" font-family="monospace">Nova conta · PME Logística</text><text x="456" y="384" text-anchor="end" font-size="8" fill="#5cc189" font-family="monospace">+R$3.200</text><line x1="112" y1="392" x2="456" y2="392" stroke="#161616" stroke-width="1"/><rect x="112" y="400" width="42" height="13" rx="3" fill="#e06b6b22"/><text x="133" y="410" text-anchor="middle" font-size="7" fill="#e06b6b" font-family="monospace">DÉBITO</text><text x="166" y="410" font-size="7" fill="#a1a1aa" font-family="monospace">Fornecedor TI · Manutenção</text><text x="456" y="410" text-anchor="end" font-size="8" fill="#e06b6b" font-family="monospace">-R$4.200</text><line x1="112" y1="418" x2="456" y2="418" stroke="#161616" stroke-width="1"/><rect x="112" y="426" width="42" height="13" rx="3" fill="#5cc18922"/><text x="133" y="436" text-anchor="middle" font-size="7" fill="#5cc189" font-family="monospace">CRÉDITO</text><text x="166" y="436" font-size="7" fill="#a1a1aa" font-family="monospace">Renovação anual · DEF</text><text x="456" y="436" text-anchor="end" font-size="8" fill="#5cc189" font-family="monospace">+R$22.000</text></svg>`
    },
    {
      longDesc: 'Lighthouse Auth nasceu da necessidade de um toolkit de autenticação para o edge — sem cold starts, sem dependências pesadas. Suporta sessões stateless via JWT com rotação automática, OAuth 2.0 com PKCE, RBAC granular por recurso e TOTP/WebAuthn para MFA. Integração nativa com Cloudflare Workers, Deno Deploy e Vercel Edge Functions. Distribuído como pacote open-source com 2.4k stars no GitHub e adotado por mais de 180 projetos em produção.',
      visual: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><rect width="480" height="480" fill="#0a0a0a"/><rect x="14" y="14" width="220" height="452" rx="8" fill="#0f0f0f" stroke="#1e1e1e" stroke-width="1"/><rect x="14" y="14" width="220" height="30" rx="8" fill="#141414"/><circle cx="30" cy="29" r="4" fill="#2a2a2a"/><circle cx="44" cy="29" r="4" fill="#2a2a2a"/><circle cx="58" cy="29" r="4" fill="#2a2a2a"/><text x="115" y="33" text-anchor="middle" font-size="7" fill="#555" font-family="monospace">lighthouse-auth.ts</text><text x="24" y="62" font-size="7.5" fill="#71717a" font-family="monospace" font-style="italic">// OAuth 2.0 config</text><text x="24" y="78" font-size="7.5" fill="#d4a33f" font-family="monospace">export const</text><text x="82" y="78" font-size="7.5" fill="#a1a1aa" font-family="monospace">auth = new</text><text x="24" y="94" font-size="7.5" fill="#f5c15d" font-family="monospace">  LighthouseAuth</text><text x="130" y="94" font-size="7.5" fill="#a1a1aa" font-family="monospace">({</text><text x="24" y="110" font-size="7.5" fill="#a1a1aa" font-family="monospace">  providers: [</text><text x="24" y="126" font-size="7.5" fill="#5cc189" font-family="monospace">    Google</text><text x="73" y="126" font-size="7.5" fill="#a1a1aa" font-family="monospace">({ clientId }),</text><text x="24" y="142" font-size="7.5" fill="#5cc189" font-family="monospace">    GitHub</text><text x="73" y="142" font-size="7.5" fill="#a1a1aa" font-family="monospace">({ clientId }),</text><text x="24" y="158" font-size="7.5" fill="#a1a1aa" font-family="monospace">  ],</text><text x="24" y="174" font-size="7.5" fill="#a1a1aa" font-family="monospace">  session:</text><text x="72" y="174" font-size="7.5" fill="#d4a33f" font-family="monospace">'jwt'</text><text x="95" y="174" font-size="7.5" fill="#a1a1aa" font-family="monospace">,</text><text x="24" y="190" font-size="7.5" fill="#a1a1aa" font-family="monospace">  mfa:</text><text x="53" y="190" font-size="7.5" fill="#d4a33f" font-family="monospace">true</text><text x="72" y="190" font-size="7.5" fill="#a1a1aa" font-family="monospace">,</text><text x="24" y="206" font-size="7.5" fill="#a1a1aa" font-family="monospace">  rbac:</text><text x="55" y="206" font-size="7.5" fill="#d4a33f" font-family="monospace">true</text><text x="24" y="222" font-size="7.5" fill="#a1a1aa" font-family="monospace">});</text><text x="24" y="248" font-size="7.5" fill="#71717a" font-family="monospace" font-style="italic">// Edge middleware</text><text x="24" y="264" font-size="7.5" fill="#d4a33f" font-family="monospace">export async function</text><text x="24" y="280" font-size="7.5" fill="#f5c15d" font-family="monospace">  authMiddleware</text><text x="122" y="280" font-size="7.5" fill="#a1a1aa" font-family="monospace">(req) {</text><text x="24" y="296" font-size="7.5" fill="#d4a33f" font-family="monospace">  const</text><text x="56" y="296" font-size="7.5" fill="#a1a1aa" font-family="monospace">session =</text><text x="24" y="312" font-size="7.5" fill="#d4a33f" font-family="monospace">    await</text><text x="60" y="312" font-size="7.5" fill="#a1a1aa" font-family="monospace">getSession(req);</text><text x="24" y="328" font-size="7.5" fill="#d4a33f" font-family="monospace">  if</text><text x="40" y="328" font-size="7.5" fill="#a1a1aa" font-family="monospace">(!session)</text><text x="24" y="344" font-size="7.5" fill="#d4a33f" font-family="monospace">    return</text><text x="64" y="344" font-size="7.5" fill="#a1a1aa" font-family="monospace">redirect(</text><text x="24" y="360" font-size="7.5" fill="#d4a33f" font-family="monospace">      '/login'</text><text x="80" y="360" font-size="7.5" fill="#a1a1aa" font-family="monospace">);</text><text x="24" y="376" font-size="7.5" fill="#d4a33f" font-family="monospace">  return</text><text x="60" y="376" font-size="7.5" fill="#a1a1aa" font-family="monospace">next();</text><text x="24" y="392" font-size="7.5" fill="#a1a1aa" font-family="monospace">}</text><rect x="248" y="80" width="218" height="316" rx="12" fill="#111" stroke="#1e1e1e" stroke-width="1"/><circle cx="357" cy="162" r="42" fill="#d4a33f14"/><circle cx="357" cy="162" r="30" fill="#d4a33f1e"/><text x="357" y="153" text-anchor="middle" font-size="22" fill="#d4a33f">&#9671;</text><text x="357" y="171" text-anchor="middle" font-size="9" fill="#d4a33f" font-family="monospace" font-weight="bold">AUTH</text><text x="357" y="220" text-anchor="middle" font-size="12" fill="#f5f5f5" font-family="sans-serif" font-weight="bold">Lighthouse Auth</text><text x="357" y="236" text-anchor="middle" font-size="7" fill="#71717a" font-family="monospace">AUTENTICAÇÃO SEGURA NO EDGE</text><rect x="268" y="248" width="178" height="26" rx="5" fill="#0d0d0d" stroke="#2a2a2a" stroke-width="1"/><text x="280" y="265" font-size="7.5" fill="#3d3d3d" font-family="monospace">email@empresa.com</text><rect x="268" y="282" width="178" height="26" rx="5" fill="#0d0d0d" stroke="#2a2a2a" stroke-width="1"/><text x="280" y="299" font-size="7.5" fill="#3d3d3d" font-family="monospace">••••••••••••</text><rect x="268" y="318" width="178" height="32" rx="6" fill="#d4a33f"/><text x="357" y="338" text-anchor="middle" font-size="9" fill="#0a0a0a" font-family="monospace" font-weight="bold">ENTRAR COM SSO</text><line x1="268" y1="366" x2="446" y2="366" stroke="#1e1e1e" stroke-width="1"/><text x="357" y="380" text-anchor="middle" font-size="7" fill="#3d3d3d" font-family="monospace">continuar com</text><rect x="268" y="386" width="82" height="24" rx="5" fill="#141414" stroke="#2a2a2a" stroke-width="1"/><text x="309" y="401" text-anchor="middle" font-size="8" fill="#a1a1aa" font-family="sans-serif">Google</text><rect x="362" y="386" width="82" height="24" rx="5" fill="#141414" stroke="#2a2a2a" stroke-width="1"/><text x="403" y="401" text-anchor="middle" font-size="8" fill="#a1a1aa" font-family="sans-serif">GitHub</text></svg>`
    },
    {
      longDesc: 'API de comércio eletrônico construída em Go para uma plataforma de moda com picos de 8k RPM em datas sazonais. Arquitetura event-driven com Kafka para processamento assíncrono de pedidos, cache em Redis com TTL adaptativo e circuit breakers via padrão Hystrix. 99.98% de uptime nos últimos 12 meses, processando R$ 12M/mês em volume transacional com latência p95 abaixo de 120ms mesmo sob picos de carga.',
      visual: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><rect width="480" height="480" fill="#0a0a0a"/><rect x="14" y="14" width="452" height="48" rx="8" fill="#111" stroke="#1e1e1e" stroke-width="1"/><text x="30" y="36" font-size="11" fill="#f5f5f5" font-family="monospace" font-weight="bold">Atlas Commerce API</text><text x="30" y="52" font-size="7" fill="#71717a" font-family="monospace">gateway.atlascommerce.io · v3.4.2</text><rect x="308" y="22" width="80" height="22" rx="5" fill="#5cc18922" stroke="#5cc18944" stroke-width="1"/><circle cx="320" cy="33" r="4" fill="#5cc189"/><text x="330" y="37" font-size="8" fill="#5cc189" font-family="monospace">99.98% up</text><rect x="396" y="22" width="58" height="22" rx="5" fill="#d4a33f22" stroke="#d4a33f44" stroke-width="1"/><text x="425" y="37" text-anchor="middle" font-size="8" fill="#d4a33f" font-family="monospace">8k RPM</text><rect x="14" y="74" width="452" height="168" rx="8" fill="#111" stroke="#1e1e1e" stroke-width="1"/><text x="28" y="92" font-size="7" fill="#71717a" font-family="monospace">ENDPOINTS ATIVOS</text><line x1="14" y1="98" x2="466" y2="98" stroke="#1e1e1e" stroke-width="1"/><rect x="26" y="106" width="30" height="14" rx="3" fill="#5cc18922"/><text x="41" y="117" text-anchor="middle" font-size="7" fill="#5cc189" font-family="monospace">GET</text><text x="66" y="117" font-size="7" fill="#a1a1aa" font-family="monospace">/api/v3/orders</text><rect x="362" y="108" width="92" height="10" rx="2" fill="#1e1e1e"/><rect x="362" y="108" width="44" height="10" rx="2" fill="#5cc18944"/><text x="460" y="117" text-anchor="end" font-size="7" fill="#5cc189" font-family="monospace">48ms</text><line x1="24" y1="126" x2="462" y2="126" stroke="#161616" stroke-width="1"/><rect x="26" y="132" width="32" height="14" rx="3" fill="#d4a33f22"/><text x="42" y="143" text-anchor="middle" font-size="7" fill="#d4a33f" font-family="monospace">POST</text><text x="68" y="143" font-size="7" fill="#a1a1aa" font-family="monospace">/api/v3/orders</text><rect x="362" y="134" width="92" height="10" rx="2" fill="#1e1e1e"/><rect x="362" y="134" width="30" height="10" rx="2" fill="#d4a33f44"/><text x="460" y="143" text-anchor="end" font-size="7" fill="#d4a33f" font-family="monospace">94ms</text><line x1="24" y1="152" x2="462" y2="152" stroke="#161616" stroke-width="1"/><rect x="26" y="158" width="32" height="14" rx="3" fill="#d4a33f22"/><text x="42" y="169" text-anchor="middle" font-size="7" fill="#d4a33f" font-family="monospace">POST</text><text x="68" y="169" font-size="7" fill="#a1a1aa" font-family="monospace">/api/v3/payments/charge</text><rect x="362" y="160" width="92" height="10" rx="2" fill="#1e1e1e"/><rect x="362" y="160" width="38" height="10" rx="2" fill="#d4a33f44"/><text x="460" y="169" text-anchor="end" font-size="7" fill="#d4a33f" font-family="monospace">142ms</text><line x1="24" y1="178" x2="462" y2="178" stroke="#161616" stroke-width="1"/><rect x="26" y="184" width="30" height="14" rx="3" fill="#5cc18922"/><text x="41" y="195" text-anchor="middle" font-size="7" fill="#5cc189" font-family="monospace">GET</text><text x="66" y="195" font-size="7" fill="#a1a1aa" font-family="monospace">/api/v3/customers/:id</text><rect x="362" y="186" width="92" height="10" rx="2" fill="#1e1e1e"/><rect x="362" y="186" width="14" height="10" rx="2" fill="#5cc18944"/><text x="460" y="195" text-anchor="end" font-size="7" fill="#5cc189" font-family="monospace">37ms</text><line x1="24" y1="204" x2="462" y2="204" stroke="#161616" stroke-width="1"/><rect x="26" y="210" width="30" height="14" rx="3" fill="#e06b6b22"/><text x="41" y="221" text-anchor="middle" font-size="7" fill="#e06b6b" font-family="monospace">DEL</text><text x="66" y="221" font-size="7" fill="#a1a1aa" font-family="monospace">/api/v3/sessions</text><rect x="362" y="212" width="92" height="10" rx="2" fill="#1e1e1e"/><rect x="362" y="212" width="8" height="10" rx="2" fill="#e06b6b44"/><text x="460" y="221" text-anchor="end" font-size="7" fill="#e06b6b" font-family="monospace">22ms</text><rect x="14" y="254" width="220" height="210" rx="8" fill="#111" stroke="#1e1e1e" stroke-width="1"/><text x="28" y="272" font-size="7" fill="#71717a" font-family="monospace">LATÊNCIA P95 (24h)</text><line x1="28" y1="282" x2="222" y2="282" stroke="#1a1a1a" stroke-width="1"/><line x1="28" y1="310" x2="222" y2="310" stroke="#1a1a1a" stroke-width="1"/><line x1="28" y1="338" x2="222" y2="338" stroke="#1a1a1a" stroke-width="1"/><line x1="28" y1="366" x2="222" y2="366" stroke="#1a1a1a" stroke-width="1"/><line x1="28" y1="394" x2="222" y2="394" stroke="#1a1a1a" stroke-width="1"/><polyline points="30,390 54,360 78,372 102,344 126,356 150,328 174,336 198,316 222,308" fill="none" stroke="#d4a33f" stroke-width="2" stroke-linejoin="round"/><polygon points="30,390 54,360 78,372 102,344 126,356 150,328 174,336 198,316 222,308 222,450 30,450" fill="#d4a33f10"/><rect x="246" y="254" width="220" height="210" rx="8" fill="#111" stroke="#1e1e1e" stroke-width="1"/><text x="260" y="272" font-size="7" fill="#71717a" font-family="monospace">STATUS DAS RÉPLICAS</text><line x1="246" y1="278" x2="466" y2="278" stroke="#1e1e1e" stroke-width="1"/><circle cx="262" cy="298" r="5" fill="#5cc189"/><text x="274" y="302" font-size="8" fill="#a1a1aa" font-family="monospace">api-go-1 · us-east-1</text><text x="452" y="302" text-anchor="end" font-size="7" fill="#5cc189" font-family="monospace">healthy</text><circle cx="262" cy="322" r="5" fill="#5cc189"/><text x="274" y="326" font-size="8" fill="#a1a1aa" font-family="monospace">api-go-2 · us-east-1</text><text x="452" y="326" text-anchor="end" font-size="7" fill="#5cc189" font-family="monospace">healthy</text><circle cx="262" cy="346" r="5" fill="#5cc189"/><text x="274" y="350" font-size="8" fill="#a1a1aa" font-family="monospace">api-go-3 · eu-west-2</text><text x="452" y="350" text-anchor="end" font-size="7" fill="#5cc189" font-family="monospace">healthy</text><circle cx="262" cy="370" r="5" fill="#d4a33f"/><text x="274" y="374" font-size="8" fill="#a1a1aa" font-family="monospace">api-go-4 · eu-west-2</text><text x="452" y="374" text-anchor="end" font-size="7" fill="#d4a33f" font-family="monospace">degraded</text><circle cx="262" cy="394" r="5" fill="#5cc189"/><text x="274" y="398" font-size="8" fill="#a1a1aa" font-family="monospace">api-go-5 · sa-east-1</text><text x="452" y="398" text-anchor="end" font-size="7" fill="#5cc189" font-family="monospace">healthy</text></svg>`
    },
    {
      longDesc: 'Sistema interno de operações desenvolvido para substituir três planilhas Excel e dois sistemas legados numa empresa de logística. Interface visual em kanban para acompanhamento de cargas em tempo real, com filtros por transportadora, status e destino. Reduziu o tempo de atualização manual de 4h/dia para menos de 30 minutos, com integração direta às APIs dos parceiros de frete e notificações automáticas por WhatsApp.',
      visual: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><rect width="480" height="480" fill="#0a0a0a"/><rect x="14" y="14" width="452" height="40" rx="7" fill="#111" stroke="#1e1e1e" stroke-width="1"/><text x="30" y="32" font-size="10" fill="#f5f5f5" font-family="monospace" font-weight="bold">Helm</text><text x="30" y="46" font-size="7" fill="#71717a" font-family="monospace">Painel de operações · 48 cargas ativas</text><rect x="368" y="22" width="88" height="22" rx="5" fill="#d4a33f22" stroke="#d4a33f44" stroke-width="1"/><text x="412" y="37" text-anchor="middle" font-size="8" fill="#d4a33f" font-family="monospace">+ Nova carga</text><rect x="14" y="64" width="140" height="402" rx="7" fill="#111" stroke="#1e1e1e" stroke-width="1"/><rect x="14" y="64" width="140" height="26" rx="7" fill="#1e1e1e"/><text x="30" y="81" font-size="7" fill="#a1a1aa" font-family="monospace">PENDENTE</text><rect x="38" y="71" width="18" height="12" rx="3" fill="#2a2a2a"/><text x="47" y="81" text-anchor="middle" font-size="7" fill="#71717a" font-family="monospace">12</text><rect x="22" y="98" width="124" height="64" rx="5" fill="#161616" stroke="#2a2a2a" stroke-width="1"/><rect x="22" y="98" width="4" height="64" rx="2" fill="#d4a33f"/><text x="34" y="114" font-size="7.5" fill="#f5f5f5" font-family="monospace" font-weight="bold">CG-2841</text><text x="34" y="128" font-size="7" fill="#71717a" font-family="monospace">São Paulo → Manaus</text><text x="34" y="142" font-size="7" fill="#a1a1aa" font-family="monospace">4.2t · Loggi</text><text x="34" y="154" font-size="7" fill="#d4a33f" font-family="monospace">Aguarda coleta</text><rect x="22" y="170" width="124" height="64" rx="5" fill="#161616" stroke="#2a2a2a" stroke-width="1"/><rect x="22" y="170" width="4" height="64" rx="2" fill="#d4a33f"/><text x="34" y="186" font-size="7.5" fill="#f5f5f5" font-family="monospace" font-weight="bold">CG-2842</text><text x="34" y="200" font-size="7" fill="#71717a" font-family="monospace">Curitiba → Recife</text><text x="34" y="214" font-size="7" fill="#a1a1aa" font-family="monospace">1.8t · Jadlog</text><text x="34" y="226" font-size="7" fill="#d4a33f" font-family="monospace">Aguarda NF</text><rect x="22" y="242" width="124" height="64" rx="5" fill="#161616" stroke="#2a2a2a" stroke-width="1"/><rect x="22" y="242" width="4" height="64" rx="2" fill="#555"/><text x="34" y="258" font-size="7.5" fill="#f5f5f5" font-family="monospace" font-weight="bold">CG-2839</text><text x="34" y="272" font-size="7" fill="#71717a" font-family="monospace">Belém → Fortaleza</text><text x="34" y="286" font-size="7" fill="#a1a1aa" font-family="monospace">9.1t · Azul</text><text x="34" y="298" font-size="7" fill="#71717a" font-family="monospace">Bloqueado</text><rect x="162" y="64" width="154" height="402" rx="7" fill="#111" stroke="#1e1e1e" stroke-width="1"/><rect x="162" y="64" width="154" height="26" rx="7" fill="#1e1e1e"/><text x="178" y="81" font-size="7" fill="#a1a1aa" font-family="monospace">EM TRÂNSITO</text><rect x="202" y="71" width="18" height="12" rx="3" fill="#2a2a2a"/><text x="211" y="81" text-anchor="middle" font-size="7" fill="#71717a" font-family="monospace">21</text><rect x="170" y="98" width="138" height="78" rx="5" fill="#161616" stroke="#d4a33f33" stroke-width="1"/><rect x="170" y="98" width="4" height="78" rx="2" fill="#5cc189"/><text x="182" y="114" font-size="7.5" fill="#f5f5f5" font-family="monospace" font-weight="bold">CG-2835</text><text x="182" y="128" font-size="7" fill="#71717a" font-family="monospace">Rio → Salvador</text><text x="182" y="142" font-size="7" fill="#a1a1aa" font-family="monospace">2.4t · LATAM Cargo</text><rect x="182" y="150" width="120" height="6" rx="2" fill="#1e1e1e"/><rect x="182" y="150" width="90" height="6" rx="2" fill="#5cc18966"/><text x="182" y="166" font-size="7" fill="#5cc189" font-family="monospace">Em trânsito · 75%</text><rect x="170" y="184" width="138" height="78" rx="5" fill="#161616" stroke="#d4a33f33" stroke-width="1"/><rect x="170" y="184" width="4" height="78" rx="2" fill="#5cc189"/><text x="182" y="200" font-size="7.5" fill="#f5f5f5" font-family="monospace" font-weight="bold">CG-2830</text><text x="182" y="214" font-size="7" fill="#71717a" font-family="monospace">Campinas → Natal</text><text x="182" y="228" font-size="7" fill="#a1a1aa" font-family="monospace">6.7t · Correios</text><rect x="182" y="236" width="120" height="6" rx="2" fill="#1e1e1e"/><rect x="182" y="236" width="54" height="6" rx="2" fill="#5cc18966"/><text x="182" y="252" font-size="7" fill="#5cc189" font-family="monospace">Em trânsito · 45%</text><rect x="324" y="64" width="142" height="402" rx="7" fill="#111" stroke="#1e1e1e" stroke-width="1"/><rect x="324" y="64" width="142" height="26" rx="7" fill="#1e1e1e"/><text x="340" y="81" font-size="7" fill="#a1a1aa" font-family="monospace">ENTREGUE</text><rect x="382" y="71" width="18" height="12" rx="3" fill="#5cc18922"/><text x="391" y="81" text-anchor="middle" font-size="7" fill="#5cc189" font-family="monospace">15</text><rect x="332" y="98" width="126" height="64" rx="5" fill="#161616" stroke="#2a2a2a" stroke-width="1"/><rect x="332" y="98" width="4" height="64" rx="2" fill="#5cc189"/><text x="344" y="114" font-size="7.5" fill="#f5f5f5" font-family="monospace" font-weight="bold">CG-2821</text><text x="344" y="128" font-size="7" fill="#71717a" font-family="monospace">SP → Goiânia</text><text x="344" y="142" font-size="7" fill="#a1a1aa" font-family="monospace">3.1t · Gol Cargo</text><text x="344" y="154" font-size="7" fill="#5cc189" font-family="monospace">✓ Entregue 14:32</text><rect x="332" y="170" width="126" height="64" rx="5" fill="#161616" stroke="#2a2a2a" stroke-width="1"/><rect x="332" y="170" width="4" height="64" rx="2" fill="#5cc189"/><text x="344" y="186" font-size="7.5" fill="#f5f5f5" font-family="monospace" font-weight="bold">CG-2818</text><text x="344" y="200" font-size="7" fill="#71717a" font-family="monospace">Porto Alegre → SP</text><text x="344" y="214" font-size="7" fill="#a1a1aa" font-family="monospace">1.2t · Azul</text><text x="344" y="226" font-size="7" fill="#5cc189" font-family="monospace">✓ Entregue 09:15</text></svg>`
    },
    {
      longDesc: 'Engine de integração para conectar ERPs heterogêneos de uma rede atacadista com 28 filiais. Processa 800k mensagens/dia usando BullMQ com filas priorizadas, retry exponencial automático e dead-letter queue com alertas em Slack. Dashboard em tempo real exibe throughput, taxa de erro e latência por fluxo. Substituiu integrações frágeis via FTP/CSV por uma camada unificada, observável e com SLA de 99.9%.',
      visual: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><rect width="480" height="480" fill="#0a0a0a"/><text x="30" y="36" font-size="10" fill="#f5f5f5" font-family="monospace" font-weight="bold">Relay</text><text x="30" y="52" font-size="7" fill="#71717a" font-family="monospace">Workflow Engine · 800k msg/dia · uptime 99.9%</text><rect x="14" y="66" width="100" height="346" rx="8" fill="#111" stroke="#1e1e1e" stroke-width="1"/><text x="64" y="84" text-anchor="middle" font-size="7" fill="#71717a" font-family="monospace">FONTES</text><rect x="24" y="92" width="80" height="36" rx="6" fill="#161616" stroke="#2a2a2a" stroke-width="1"/><text x="64" y="110" text-anchor="middle" font-size="7.5" fill="#a1a1aa" font-family="monospace">ERP Filial</text><text x="64" y="122" text-anchor="middle" font-size="7" fill="#71717a" font-family="monospace">SQL Server</text><rect x="24" y="136" width="80" height="36" rx="6" fill="#161616" stroke="#2a2a2a" stroke-width="1"/><text x="64" y="154" text-anchor="middle" font-size="7.5" fill="#a1a1aa" font-family="monospace">ERP Matriz</text><text x="64" y="166" text-anchor="middle" font-size="7" fill="#71717a" font-family="monospace">Oracle DB</text><rect x="24" y="180" width="80" height="36" rx="6" fill="#161616" stroke="#2a2a2a" stroke-width="1"/><text x="64" y="198" text-anchor="middle" font-size="7.5" fill="#a1a1aa" font-family="monospace">Loja Online</text><text x="64" y="210" text-anchor="middle" font-size="7" fill="#71717a" font-family="monospace">REST API</text><rect x="24" y="224" width="80" height="36" rx="6" fill="#161616" stroke="#2a2a2a" stroke-width="1"/><text x="64" y="242" text-anchor="middle" font-size="7.5" fill="#a1a1aa" font-family="monospace">WMS</text><text x="64" y="254" text-anchor="middle" font-size="7" fill="#71717a" font-family="monospace">Webhook</text><line x1="104" y1="110" x2="174" y2="200" stroke="#d4a33f44" stroke-width="1" stroke-dasharray="4 3"/><line x1="104" y1="154" x2="174" y2="210" stroke="#d4a33f44" stroke-width="1" stroke-dasharray="4 3"/><line x1="104" y1="198" x2="174" y2="220" stroke="#d4a33f44" stroke-width="1" stroke-dasharray="4 3"/><line x1="104" y1="242" x2="174" y2="230" stroke="#d4a33f44" stroke-width="1" stroke-dasharray="4 3"/><rect x="166" y="168" width="148" height="76" rx="8" fill="#1a1304" stroke="#d4a33f66" stroke-width="1.5"/><text x="240" y="188" text-anchor="middle" font-size="8" fill="#d4a33f" font-family="monospace" font-weight="bold">RELAY CORE</text><text x="240" y="204" text-anchor="middle" font-size="7" fill="#a1a1aa" font-family="monospace">BullMQ · Transform</text><text x="240" y="218" text-anchor="middle" font-size="7" fill="#a1a1aa" font-family="monospace">Validate · Route</text><text x="240" y="232" text-anchor="middle" font-size="7" fill="#d4a33f88" font-family="monospace">800k msg/dia</text><line x1="314" y1="200" x2="366" y2="130" stroke="#d4a33f44" stroke-width="1" stroke-dasharray="4 3"/><line x1="314" y1="206" x2="366" y2="174" stroke="#d4a33f44" stroke-width="1" stroke-dasharray="4 3"/><line x1="314" y1="212" x2="366" y2="218" stroke="#d4a33f44" stroke-width="1" stroke-dasharray="4 3"/><line x1="314" y1="218" x2="366" y2="262" stroke="#d4a33f44" stroke-width="1" stroke-dasharray="4 3"/><rect x="366" y="66" width="100" height="346" rx="8" fill="#111" stroke="#1e1e1e" stroke-width="1"/><text x="416" y="84" text-anchor="middle" font-size="7" fill="#71717a" font-family="monospace">DESTINOS</text><rect x="376" y="92" width="80" height="36" rx="6" fill="#161616" stroke="#5cc18933" stroke-width="1"/><text x="416" y="110" text-anchor="middle" font-size="7.5" fill="#a1a1aa" font-family="monospace">BI / DW</text><text x="416" y="122" text-anchor="middle" font-size="7" fill="#71717a" font-family="monospace">BigQuery</text><rect x="376" y="136" width="80" height="36" rx="6" fill="#161616" stroke="#5cc18933" stroke-width="1"/><text x="416" y="154" text-anchor="middle" font-size="7.5" fill="#a1a1aa" font-family="monospace">Fiscal</text><text x="416" y="166" text-anchor="middle" font-size="7" fill="#71717a" font-family="monospace">SPED API</text><rect x="376" y="180" width="80" height="36" rx="6" fill="#161616" stroke="#5cc18933" stroke-width="1"/><text x="416" y="198" text-anchor="middle" font-size="7.5" fill="#a1a1aa" font-family="monospace">Estoque</text><text x="416" y="210" text-anchor="middle" font-size="7" fill="#71717a" font-family="monospace">Postgres</text><rect x="376" y="224" width="80" height="36" rx="6" fill="#161616" stroke="#5cc18933" stroke-width="1"/><text x="416" y="242" text-anchor="middle" font-size="7.5" fill="#a1a1aa" font-family="monospace">Alertas</text><text x="416" y="254" text-anchor="middle" font-size="7" fill="#71717a" font-family="monospace">Slack / Email</text><rect x="14" y="428" width="452" height="38" rx="7" fill="#111" stroke="#1e1e1e" stroke-width="1"/><text x="50" y="444" text-anchor="middle" font-size="8" fill="#5cc189" font-family="monospace">↑ 798k</text><text x="50" y="456" text-anchor="middle" font-size="7" fill="#71717a" font-family="monospace">sucesso</text><line x1="86" y1="430" x2="86" y2="464" stroke="#1e1e1e" stroke-width="1"/><text x="130" y="444" text-anchor="middle" font-size="8" fill="#e06b6b" font-family="monospace">2.1k</text><text x="130" y="456" text-anchor="middle" font-size="7" fill="#71717a" font-family="monospace">erros</text><line x1="166" y1="430" x2="166" y2="464" stroke="#1e1e1e" stroke-width="1"/><text x="218" y="444" text-anchor="middle" font-size="8" fill="#d4a33f" font-family="monospace">0.26%</text><text x="218" y="456" text-anchor="middle" font-size="7" fill="#71717a" font-family="monospace">taxa erro</text><line x1="258" y1="430" x2="258" y2="464" stroke="#1e1e1e" stroke-width="1"/><text x="310" y="444" text-anchor="middle" font-size="8" fill="#f5f5f5" font-family="monospace">38ms</text><text x="310" y="456" text-anchor="middle" font-size="7" fill="#71717a" font-family="monospace">lat. média</text><line x1="354" y1="430" x2="354" y2="464" stroke="#1e1e1e" stroke-width="1"/><text x="410" y="444" text-anchor="middle" font-size="8" fill="#5cc189" font-family="monospace">99.9%</text><text x="410" y="456" text-anchor="middle" font-size="7" fill="#71717a" font-family="monospace">uptime</text></svg>`
    },
    {
      longDesc: 'CRM SaaS verticalizado para agências de comunicação e criativas, com foco em gestão de pipeline comercial, propostas interativas e controle de faturamento por projeto. Geração automática de PDF de proposta a partir de templates configuráveis, assinatura digital integrada via DocuSign e notificações em tempo real por webhook. Usado por 14 agências em plano recorrente, com NPS médio de 78 e churn abaixo de 4%.',
      visual: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><rect width="480" height="480" fill="#0a0a0a"/><rect x="14" y="14" width="452" height="40" rx="7" fill="#111" stroke="#1e1e1e" stroke-width="1"/><text x="30" y="32" font-size="10" fill="#f5f5f5" font-family="monospace" font-weight="bold">Drift CRM</text><text x="30" y="46" font-size="7" fill="#71717a" font-family="monospace">Pipeline comercial · 14 agências ativas · Q2 2026</text><rect x="360" y="22" width="96" height="22" rx="5" fill="#d4a33f22" stroke="#d4a33f44" stroke-width="1"/><text x="408" y="37" text-anchor="middle" font-size="8" fill="#d4a33f" font-family="monospace">+ Novo negócio</text><rect x="14" y="64" width="104" height="402" rx="7" fill="#111" stroke="#1e1e1e" stroke-width="1"/><rect x="14" y="64" width="104" height="26" rx="7" fill="#1e1e1e"/><text x="66" y="78" text-anchor="middle" font-size="6.5" fill="#a1a1aa" font-family="monospace">PROSPECÇÃO</text><text x="66" y="88" text-anchor="middle" font-size="7" fill="#71717a" font-family="monospace">R$84k</text><rect x="22" y="98" width="88" height="60" rx="5" fill="#161616" stroke="#2a2a2a" stroke-width="1"/><text x="34" y="114" font-size="7.5" fill="#f5f5f5" font-family="monospace" font-weight="bold">Agência W</text><text x="34" y="126" font-size="7" fill="#71717a" font-family="monospace">Identidade visual</text><text x="34" y="138" font-size="7" fill="#d4a33f" font-family="monospace">R$18.000</text><text x="34" y="150" font-size="6.5" fill="#555" font-family="monospace">Contato inicial</text><rect x="22" y="166" width="88" height="60" rx="5" fill="#161616" stroke="#2a2a2a" stroke-width="1"/><text x="34" y="182" font-size="7.5" fill="#f5f5f5" font-family="monospace" font-weight="bold">Studio M</text><text x="34" y="194" font-size="7" fill="#71717a" font-family="monospace">Campanha mídia</text><text x="34" y="206" font-size="7" fill="#d4a33f" font-family="monospace">R$32.000</text><text x="34" y="218" font-size="6.5" fill="#555" font-family="monospace">Reunião marcada</text><rect x="22" y="234" width="88" height="60" rx="5" fill="#161616" stroke="#2a2a2a" stroke-width="1"/><text x="34" y="250" font-size="7.5" fill="#f5f5f5" font-family="monospace" font-weight="bold">Criativa SP</text><text x="34" y="262" font-size="7" fill="#71717a" font-family="monospace">Branding startup</text><text x="34" y="274" font-size="7" fill="#d4a33f" font-family="monospace">R$34.000</text><text x="34" y="286" font-size="6.5" fill="#555" font-family="monospace">Lead qualificado</text><rect x="126" y="64" width="104" height="402" rx="7" fill="#111" stroke="#1e1e1e" stroke-width="1"/><rect x="126" y="64" width="104" height="26" rx="7" fill="#1e1e1e"/><text x="178" y="78" text-anchor="middle" font-size="6.5" fill="#a1a1aa" font-family="monospace">PROPOSTA</text><text x="178" y="88" text-anchor="middle" font-size="7" fill="#71717a" font-family="monospace">R$120k</text><rect x="134" y="98" width="88" height="60" rx="5" fill="#161616" stroke="#d4a33f22" stroke-width="1"/><text x="146" y="114" font-size="7.5" fill="#f5f5f5" font-family="monospace" font-weight="bold">Burst Agency</text><text x="146" y="126" font-size="7" fill="#71717a" font-family="monospace">Site institucional</text><text x="146" y="138" font-size="7" fill="#d4a33f" font-family="monospace">R$45.000</text><text x="146" y="150" font-size="6.5" fill="#d4a33f88" font-family="monospace">Proposta enviada</text><rect x="134" y="166" width="88" height="60" rx="5" fill="#161616" stroke="#d4a33f22" stroke-width="1"/><text x="146" y="182" font-size="7.5" fill="#f5f5f5" font-family="monospace" font-weight="bold">Hub Digital</text><text x="146" y="194" font-size="7" fill="#71717a" font-family="monospace">App mobile</text><text x="146" y="206" font-size="7" fill="#d4a33f" font-family="monospace">R$75.000</text><text x="146" y="218" font-size="6.5" fill="#d4a33f88" font-family="monospace">Em revisão</text><rect x="238" y="64" width="104" height="402" rx="7" fill="#111" stroke="#1e1e1e" stroke-width="1"/><rect x="238" y="64" width="104" height="26" rx="7" fill="#1e1e1e"/><text x="290" y="78" text-anchor="middle" font-size="6.5" fill="#a1a1aa" font-family="monospace">NEGOCIAÇÃO</text><text x="290" y="88" text-anchor="middle" font-size="7" fill="#71717a" font-family="monospace">R$96k</text><rect x="246" y="98" width="88" height="60" rx="5" fill="#161616" stroke="#d4a33f44" stroke-width="1"/><text x="258" y="114" font-size="7.5" fill="#f5f5f5" font-family="monospace" font-weight="bold">Onda Criativa</text><text x="258" y="126" font-size="7" fill="#71717a" font-family="monospace">E-commerce + UX</text><text x="258" y="138" font-size="7" fill="#d4a33f" font-family="monospace">R$58.000</text><text x="258" y="150" font-size="6.5" fill="#d4a33f" font-family="monospace">Contraproposta</text><rect x="246" y="166" width="88" height="60" rx="5" fill="#161616" stroke="#d4a33f44" stroke-width="1"/><text x="258" y="182" font-size="7.5" fill="#f5f5f5" font-family="monospace" font-weight="bold">Estúdio R</text><text x="258" y="194" font-size="7" fill="#71717a" font-family="monospace">Vídeo corporativo</text><text x="258" y="206" font-size="7" fill="#d4a33f" font-family="monospace">R$38.000</text><text x="258" y="218" font-size="6.5" fill="#d4a33f" font-family="monospace">Ajuste de escopo</text><rect x="350" y="64" width="116" height="402" rx="7" fill="#111" stroke="#1e1e1e" stroke-width="1"/><rect x="350" y="64" width="116" height="26" rx="7" fill="#5cc18914"/><text x="408" y="78" text-anchor="middle" font-size="6.5" fill="#5cc189" font-family="monospace">FECHADO</text><text x="408" y="88" text-anchor="middle" font-size="7" fill="#5cc18988" font-family="monospace">R$214k</text><rect x="358" y="98" width="100" height="60" rx="5" fill="#161616" stroke="#5cc18933" stroke-width="1"/><rect x="358" y="98" width="4" height="60" rx="2" fill="#5cc189"/><text x="372" y="114" font-size="7.5" fill="#f5f5f5" font-family="monospace" font-weight="bold">Pixel Studio</text><text x="372" y="126" font-size="7" fill="#71717a" font-family="monospace">Plataforma SaaS</text><text x="372" y="138" font-size="7" fill="#5cc189" font-family="monospace">R$92.000</text><text x="372" y="150" font-size="6.5" fill="#5cc18988" font-family="monospace">✓ Assinado</text><rect x="358" y="166" width="100" height="60" rx="5" fill="#161616" stroke="#5cc18933" stroke-width="1"/><rect x="358" y="166" width="4" height="60" rx="2" fill="#5cc189"/><text x="372" y="182" font-size="7.5" fill="#f5f5f5" font-family="monospace" font-weight="bold">Criativa RJ</text><text x="372" y="194" font-size="7" fill="#71717a" font-family="monospace">Rebranding</text><text x="372" y="206" font-size="7" fill="#5cc189" font-family="monospace">R$54.000</text><text x="372" y="218" font-size="6.5" fill="#5cc18988" font-family="monospace">✓ Assinado</text><rect x="358" y="234" width="100" height="60" rx="5" fill="#161616" stroke="#5cc18933" stroke-width="1"/><rect x="358" y="234" width="4" height="60" rx="2" fill="#5cc189"/><text x="372" y="250" font-size="7.5" fill="#f5f5f5" font-family="monospace" font-weight="bold">Agency X</text><text x="372" y="262" font-size="7" fill="#71717a" font-family="monospace">Dashboard BI</text><text x="372" y="274" font-size="7" fill="#5cc189" font-family="monospace">R$68.000</text><text x="372" y="286" font-size="6.5" fill="#5cc18988" font-family="monospace">✓ Assinado</text></svg>`
    },
  ];

  var PROJ_META = [
    {
      type: 'E-commerce · Full-stack', year: '2026', status: 'Coleção Inverno 26',
      highlights: [
        { value: '7',      label: 'Páginas da loja (SPA)' },
        { value: 'R$ 299', label: 'Frete grátis a partir de' },
        { value: 'JWT',    label: 'Auth com refresh token automático' },
      ],
    },
    {
      type: 'Biblioteca OSS', year: '2025', status: '2.4k stars · GitHub',
      highlights: [
        { value: '2.4k', label: 'Stars no GitHub' },
        { value: '180+', label: 'Projetos em produção' },
        { value: '0ms',  label: 'Cold start (edge-first)' },
      ],
    },
    {
      type: 'API · Backend', year: '2024', status: 'Em produção',
      highlights: [
        { value: '99.98%', label: 'Uptime nos últimos 12 meses' },
        { value: 'R$12M',  label: 'Volume mensal processado' },
        { value: '8k',     label: 'RPM no pico sazonal' },
      ],
    },
    {
      type: 'Sistema interno', year: '2024', status: 'Em produção',
      highlights: [
        { value: '3',    label: 'Planilhas substituídas' },
        { value: '−87%', label: 'Redução no tempo de atualização' },
        { value: '48',   label: 'Cargas monitoradas em tempo real' },
      ],
    },
    {
      type: 'Automação / Integração', year: '2025', status: 'Em produção · SLA 99.9%',
      highlights: [
        { value: '800k', label: 'Mensagens processadas por dia' },
        { value: '28',   label: 'Filiais integradas' },
        { value: '38ms', label: 'Latência média de processamento' },
      ],
    },
    {
      type: 'SaaS B2B', year: '2025', status: 'Em produção',
      highlights: [
        { value: '14',     label: 'Agências clientes ativas' },
        { value: 'NPS 78', label: 'Satisfação dos usuários' },
        { value: '<4%',    label: 'Churn mensal' },
      ],
    },
  ];

  /* ── Extra case-study data per project ───────────────────── */
  var PROJ_EXTRA = [
    {
      subtitle: 'Uma loja de moda construída do zero — com identidade de grife e toda a estrutura de um e-commerce real.',
      category: ['E-commerce', 'Full-stack', 'SPA'],
      client: 'Projeto fictício · ZeroGrau',
      role: 'Frontend, Backend, Design de produto',
      sections: [
        { label: 'Visão Geral', title: 'Uma vitrine que parece editorial', text: 'A ZeroGrau é uma marca de streetwear para o inverno — Glacier Series, coleção Inverno 26. Mas mais do que um catálogo de produtos, é uma experiência: estética minimalista, tipografia de impacto e fotos que trocam entre frente e costas quando o cursor passa. Quem entra na loja não sente que está num "site de vendas". Sente que está navegando num editorial de moda.', src: 'assets/zerograu/3.jpeg', reverse: false },
        { label: 'Desafio', title: 'Do zero, de propósito', text: 'A decisão de não usar React, Vue ou qualquer framework foi intencional. O objetivo era mostrar que é possível entregar uma experiência rica e completa — navegação sem recarregamento, carrinho persistente, checkout, controle de estoque e painel admin — dominando a web como ela é, sem depender de camadas extras. Quando você entende o fundamento, qualquer ferramenta nova vira detalhe.', src: 'assets/zerograu/1.jpeg', reverse: true },
        { label: 'Solução', title: 'Uma loja que funciona de verdade', text: 'A ZeroGrau tem tudo que um e-commerce real precisa. O cliente navega, filtra produtos, adiciona ao carrinho, faz login, finaliza a compra — sem a página recarregar uma vez sequer. O carrinho persiste mesmo se fechar o browser. O estoque baixa automaticamente a cada pedido confirmado. Frete grátis entra sozinho acima de R$ 299. E se algo der errado no checkout, a transação desfaz tudo — sem deixar dado inconsistente no banco.', src: 'assets/zerograu/7.jpeg', reverse: false },
        { label: 'Desenvolvimento', title: 'Produto com responsabilidade', text: 'No backend, Node.js com Express e banco SQLite — simples, sem dependência de servidor externo, fácil de rodar e auditar. As senhas nunca ficam expostas, a sessão se renova sozinha sem o usuário perceber e o acesso é separado entre clientes e administradores. O painel admin exibe faturamento, pedidos em aberto e produtos esgotados — e ainda simula como a loja aparece no celular, sem precisar abrir outro dispositivo.', src: 'assets/zerograu/6.jpeg', reverse: true },
      ],
      gallery: [
        { src: 'assets/zerograu/4.jpeg', full: true },
        { src: 'assets/zerograu/2.jpeg', full: false },
        { src: 'assets/zerograu/6.jpeg', full: false },
        { src: 'assets/zerograu/3.jpeg', full: false },
        { src: 'assets/zerograu/1.jpeg', full: false },
        { src: 'assets/zerograu/5.jpeg', full: true },
      ],
      resultQuote: 'Uma loja com estética de grife, construída com cuidado de produto e solidez de engenharia.',
      resultText: 'ZeroGrau é a prova de que software bem feito não depende de qual framework está na moda. Depende de entender o problema, tomar as decisões certas e executar com atenção em cada camada — da primeira tela até o último dado gravado no banco.',
      projectUrl: '', githubUrl: '',
      video: 'assets/videoProjetoLoja.mp4',
    },
    {
      subtitle: 'Toolkit de autenticação edge-first com suporte a OAuth, RBAC e MFA.',
      category: ['Biblioteca OSS', 'TypeScript', 'Edge Computing'],
      client: 'Open Source · GitHub',
      role: 'Design de API, Implementação, Documentação',
      sections: [
        { label: 'Visão Geral', title: 'Auth nativo do edge', text: 'Adicione aqui a visão geral do Lighthouse Auth. Explique o que é e por que auth edge-first é relevante.', placeholder: 'Adicione screenshot da visão geral aqui', reverse: false },
        { label: 'Desafio', title: 'Cold starts e latência', text: 'Adicione aqui o desafio. Explique as limitações de libs de auth tradicionais em runtimes de edge.', placeholder: 'Adicione diagrama do desafio aqui', reverse: true },
        { label: 'Solução', title: 'JWT stateless + PKCE', text: 'Adicione aqui a solução. Explique o approach de sessões stateless e o fluxo OAuth com PKCE.', placeholder: 'Adicione screenshot da solução aqui', reverse: false },
        { label: 'Desenvolvimento', title: 'Compatibilidade universal', text: 'Adicione aqui as decisões técnicas. Fale sobre o padrão de adapter para Cloudflare Workers, Deno e Vercel Edge.', placeholder: 'Adicione diagrama de arquitetura aqui', reverse: true },
      ],
      gallery: [
        { placeholder: 'Adicione exemplo de integração aqui', full: true },
        { placeholder: 'Adicione diagrama do fluxo OAuth aqui', full: false },
        { placeholder: 'Adicione interface de RBAC aqui', full: false },
        { placeholder: 'Adicione tela de MFA aqui', full: false },
        { placeholder: 'Adicione screenshot da documentação aqui', full: false },
        { placeholder: 'Adicione resultado final aqui', full: true },
      ],
      resultQuote: 'Uma biblioteca de autenticação que respeita o edge — zero cold start, zero dependências pesadas.',
      resultText: 'Adicione aqui o resultado final. Descreva métricas de adoção, impacto na comunidade e o que diferencia o Lighthouse Auth.',
      projectUrl: '', githubUrl: '',
    },
    {
      subtitle: 'API de alta performance para e-commerce processando R$12M/mês com 99.98% de uptime.',
      category: ['API · Backend', 'Go', 'Cloud Native'],
      client: 'E-commerce de moda · Confidencial',
      role: 'Arquitetura de Backend, Performance, Infra',
      sections: [
        { label: 'Visão Geral', title: 'Comércio em escala', text: 'Adicione aqui a visão geral da Atlas Commerce API. Explique o que faz e a escala que opera.', placeholder: 'Adicione visão geral da API aqui', reverse: false },
        { label: 'Desafio', title: 'Picos de 8k RPM', text: 'Adicione aqui o desafio. Explique os picos de tráfego sazonais e os requisitos de confiabilidade.', placeholder: 'Adicione gráfico de carga aqui', reverse: true },
        { label: 'Solução', title: 'Event-driven com Kafka', text: 'Adicione aqui a solução. Fale sobre processamento assíncrono de pedidos e o padrão circuit breaker.', placeholder: 'Adicione diagrama de arquitetura aqui', reverse: false },
        { label: 'Desenvolvimento', title: 'Go, Redis, Kubernetes', text: 'Adicione aqui as decisões técnicas. Explique por que Go foi escolhido e como Kubernetes gerencia os picos.', placeholder: 'Adicione diagrama de infra aqui', reverse: true },
      ],
      gallery: [
        { placeholder: 'Adicione screenshot da documentação API aqui', full: true },
        { placeholder: 'Adicione dashboard de monitoramento aqui', full: false },
        { placeholder: 'Adicione setup Kubernetes aqui', full: false },
        { placeholder: 'Adicione gráfico de latência aqui', full: false },
        { placeholder: 'Adicione gráfico de uptime aqui', full: false },
        { placeholder: 'Adicione diagrama do sistema final aqui', full: true },
      ],
      resultQuote: '99.98% de uptime, p95 abaixo de 120ms — mesmo sob os picos sazonais mais intensos.',
      resultText: 'Adicione aqui o resultado final. Descreva o impacto de negócio e o que foi alcançado com a Atlas Commerce API.',
      projectUrl: '', githubUrl: '',
    },
    {
      subtitle: 'Painel de operações logísticas que substituiu três planilhas e dois sistemas legados.',
      category: ['Sistema Interno', 'Dashboard', 'React'],
      client: 'Empresa de logística · Confidencial',
      role: 'Frontend, Backend, UX, Integração',
      sections: [
        { label: 'Visão Geral', title: 'Operações sem planilha', text: 'Adicione aqui a visão geral do Helm. Explique o que é e como substituiu o fluxo de planilhas legadas.', placeholder: 'Adicione screenshot da visão geral aqui', reverse: false },
        { label: 'Desafio', title: 'Três planilhas, dois sistemas', text: 'Adicione aqui o desafio. Explique o fluxo fragmentado que existia antes do Helm.', placeholder: 'Adicione diagrama antes/depois aqui', reverse: true },
        { label: 'Solução', title: 'Kanban em tempo real', text: 'Adicione aqui a solução. Explique o kanban em tempo real e como unificou o fluxo de operações.', placeholder: 'Adicione screenshot do kanban aqui', reverse: false },
        { label: 'Desenvolvimento', title: 'React + Node + WebSockets', text: 'Adicione aqui as decisões técnicas. Fale sobre a arquitetura em tempo real e as integrações com APIs de frete.', placeholder: 'Adicione diagrama de arquitetura aqui', reverse: true },
      ],
      gallery: [
        { placeholder: 'Adicione screenshot desktop da interface aqui', full: true },
        { placeholder: 'Adicione tela do kanban aqui', full: false },
        { placeholder: 'Adicione tela de detalhes de carga aqui', full: false },
        { placeholder: 'Adicione versão mobile aqui', full: false },
        { placeholder: 'Adicione tela de notificações aqui', full: false },
        { placeholder: 'Adicione screenshot do resultado final aqui', full: true },
      ],
      resultQuote: 'De 4 horas de atualização manual para 30 minutos — com rastreamento em tempo real.',
      resultText: 'Adicione aqui o resultado final. Descreva como o Helm transformou o fluxo de operações diárias.',
      projectUrl: '', githubUrl: '',
    },
    {
      subtitle: 'Engine de integração processando 800k mensagens por dia entre ERPs heterogêneos.',
      category: ['Automação', 'Node.js', 'BullMQ'],
      client: 'Rede atacadista · 28 filiais',
      role: 'Arquitetura, Backend, Observabilidade',
      sections: [
        { label: 'Visão Geral', title: 'Integrações sem fricção', text: 'Adicione aqui a visão geral do Relay. Explique o que faz e por que integração de ERP é complexa.', placeholder: 'Adicione diagrama de visão geral aqui', reverse: false },
        { label: 'Desafio', title: 'ERPs incompatíveis', text: 'Adicione aqui o desafio. Explique a complexidade de integrar SQL Server, Oracle e REST APIs simultaneamente.', placeholder: 'Adicione diagrama de integração aqui', reverse: true },
        { label: 'Solução', title: 'Fila priorizada com BullMQ', text: 'Adicione aqui a solução. Explique a arquitetura de filas com prioridade e dead-letter handling.', placeholder: 'Adicione diagrama da fila aqui', reverse: false },
        { label: 'Desenvolvimento', title: 'Observabilidade total', text: 'Adicione aqui as decisões técnicas. Fale sobre o dashboard em tempo real, alertas e monitoramento de SLA.', placeholder: 'Adicione screenshot de monitoramento aqui', reverse: true },
      ],
      gallery: [
        { placeholder: 'Adicione diagrama de arquitetura do sistema aqui', full: true },
        { placeholder: 'Adicione dashboard de monitoramento aqui', full: false },
        { placeholder: 'Adicione visualização da fila aqui', full: false },
        { placeholder: 'Adicione tela de rastreamento de erros aqui', full: false },
        { placeholder: 'Adicione gráfico de throughput aqui', full: false },
        { placeholder: 'Adicione visão geral final aqui', full: true },
      ],
      resultQuote: '800 mil mensagens por dia, 38ms de latência média, 99.9% de SLA — integração sem fricção.',
      resultText: 'Adicione aqui o resultado final. Descreva como o Relay unificou a rede de 28 filiais eliminando as integrações frágeis via CSV.',
      projectUrl: '', githubUrl: '',
    },
    {
      subtitle: 'CRM verticalizado para agências criativas com pipeline, propostas e faturamento integrado.',
      category: ['SaaS B2B', 'Next.js', 'CRM'],
      client: 'Agências de comunicação · 14 ativas',
      role: 'Frontend, Backend, Product, UX',
      sections: [
        { label: 'Visão Geral', title: 'CRM feito para criativos', text: 'Adicione aqui a visão geral do Drift CRM. Explique o que é e por que CRMs genéricos falham para agências criativas.', placeholder: 'Adicione screenshot da visão geral aqui', reverse: false },
        { label: 'Desafio', title: 'CRMs genéricos não servem', text: 'Adicione aqui o desafio. Explique as necessidades de agências criativas que o Salesforce e HubSpot não atendem.', placeholder: 'Adicione diagrama do problema aqui', reverse: true },
        { label: 'Solução', title: 'Propostas interativas e assinatura digital', text: 'Adicione aqui a solução. Explique o construtor de propostas, integração com DocuSign e faturamento automatizado.', placeholder: 'Adicione screenshot do construtor de propostas aqui', reverse: false },
        { label: 'Desenvolvimento', title: 'Next.js + Postgres + DocuSign', text: 'Adicione aqui as decisões técnicas. Fale sobre geração de PDF, sistema de webhooks e notificações em tempo real.', placeholder: 'Adicione arquitetura técnica aqui', reverse: true },
      ],
      gallery: [
        { placeholder: 'Adicione screenshot do pipeline CRM aqui', full: true },
        { placeholder: 'Adicione tela do construtor de propostas aqui', full: false },
        { placeholder: 'Adicione versão mobile aqui', full: false },
        { placeholder: 'Adicione tela de faturamento aqui', full: false },
        { placeholder: 'Adicione portal do cliente aqui', full: false },
        { placeholder: 'Adicione interface final aqui', full: true },
      ],
      resultQuote: 'NPS 78, churn abaixo de 4% — um CRM que as agências realmente usam.',
      resultText: 'Adicione aqui o resultado final. Descreva métricas de adoção e os resultados de negócio para os clientes do Drift CRM.',
      projectUrl: '', githubUrl: '',
    },
  ];

  /* ── Build normalized projects array ─────────────────────── */
  var projects = cards.map(function(card, i){
    var ex  = PROJ_DATA[i]  || {};
    var meta = PROJ_META[i] || {};
    var ext = PROJ_EXTRA[i] || {};
    return {
      visual:      ex.visual || '',
      title:       ((card.querySelector('h3') || {}).textContent || '').trim(),
      subtitle:    ext.subtitle || '',
      desc:        ex.longDesc || ((card.querySelector('p') || {}).textContent || '').trim(),
      tags:        Array.from(card.querySelectorAll('.tag')).map(function(t){ return t.textContent; }),
      category:    ext.category || [meta.type || ''],
      year:        meta.year || '',
      client:      ext.client || '',
      role:        ext.role || '',
      status:      meta.status || '',
      sections:    ext.sections || [],
      gallery:     ext.gallery || [],
      resultQuote: ext.resultQuote || '',
      resultText:  ext.resultText  || '',
      projectUrl:  ext.projectUrl  || '',
      githubUrl:   ext.githubUrl   || '',
      video:       ext.video       || '',
    };
  });

  var currentIdx = 0;
  var isOpen = false;

  /* ── Placeholder builder ──────────────────────────────────── */
  var PH_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';
  function ph(text, size) {
    return '<div class="pd-ph ' + (size || 'medium') + '"><div class="ph-icon">' + PH_SVG + '</div><span>' + text + '</span></div>';
  }

  /* ── Info grid builder ────────────────────────────────────── */
  function buildInfoGrid(p) {
    function tags(arr) { return (arr || []).map(function(t){ return '<span class="pd-info-tag">' + t + '</span>'; }).join(''); }
    function cell(lbl, val, isHtml) {
      return '<div class="pd-info-cell"><span class="pd-info-label">' + lbl + '</span>' +
        (isHtml ? '<div class="pd-info-tags">' + val + '</div>' : '<span class="pd-info-value">' + (val || '—') + '</span>') + '</div>';
    }
    return [
      cell('Categoria', tags(p.category), true),
      cell('Ano', p.year, false),
      cell('Cliente', p.client, false),
      cell('Role', p.role, false),
      cell('Stack', tags(p.tags), true),
      cell('Status', p.status, false),
    ].join('');
  }

  /* ── Buttons builder ──────────────────────────────────────── */
  function buildActions(p, addBack) {
    var b = [];
    if (p.projectUrl) b.push('<a class="btn primary" href="' + p.projectUrl + '" target="_blank" rel="noopener">Ver projeto <svg class="arr" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M7 17 17 7M9 7h8v8"/></svg></a>');
    if (p.githubUrl)  b.push('<a class="btn" href="' + p.githubUrl + '" target="_blank" rel="noopener">Ver código <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 5l7 7-7 7"/></svg></a>');
    if (addBack) b.push('<button class="btn" onclick="window._pdClose()">Voltar <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M19 12H5M11 5l-7 7 7 7"/></svg></button>');
    return b.join('');
  }

  /* ── Case sections builder ────────────────────────────────── */
  function buildSections(sections) {
    return (sections || []).map(function(s){
      return '<div class="pd-case-section pd-reveal' + (s.reverse ? ' reverse' : '') + '">' +
        '<div class="pd-case-text">' +
          '<div class="pd-section-head" style="margin-top:0"><span class="pd-section-label">' + s.label + '</span><div class="pd-section-rule"></div></div>' +
          '<h3 class="pd-section-title">' + s.title + '</h3>' +
          '<p class="pd-section-text">' + s.text + '</p>' +
        '</div>' +
        '<div class="pd-case-media">' + (s.src ? '<img src="' + s.src + '" alt="" style="width:100%;height:auto;display:block;border-radius:12px;"/>' : ph(s.placeholder || 'Adicione imagem aqui', 'medium')) + '</div>' +
      '</div>';
    }).join('');
  }

  /* ── Gallery builder ──────────────────────────────────────── */
  function buildGallery(gallery) {
    return (gallery || []).map(function(g){
      return '<div class="pd-gallery-item' + (g.full ? ' pd-gallery-full' : '') + '">' + (g.src ? '<img src="' + g.src + '" alt=""/>' : ph(g.placeholder || 'Adicione imagem aqui', 'short')) + '</div>';
    }).join('');
  }

  /* ── Paint ────────────────────────────────────────────────── */
  function paint(idx) {
    var p   = projects[idx];
    var pos = BG_POS[idx % BG_POS.length];
    bgArt.style.background = [
      'radial-gradient(ellipse 60% 60% at ' + pos + ', var(--accent) 0%, transparent 70%)',
      'radial-gradient(ellipse 50% 50% at ' + (100 - parseInt(pos)) + '% ' + pos.split(' ')[1] + ', var(--accent-strong) 0%, transparent 65%)'
    ].join(', ');

    coverInner.innerHTML = p.visual
      ? '<div class="pd-cover-visual">' + p.visual + '</div>'
      : '<div class="pd-cover-placeholder"><div class="ph-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div><span>Adicione a imagem de capa do projeto aqui</span></div>';

    mainTitle.textContent  = p.title;
    subtitleEl.textContent = p.subtitle || '';
    infoGrid.innerHTML     = buildInfoGrid(p);
    descText.textContent   = p.desc;
    descActions.innerHTML  = buildActions(p, false);
    presMedia.innerHTML    = p.video
      ? '<video src="' + p.video + '" autoplay muted loop playsinline controls style="width:100%;border-radius:16px;display:block;max-height:600px;object-fit:cover;box-shadow:0 16px 60px rgba(0,0,0,.4)"></video>'
      : ph('Adicione o vídeo de demonstração ou screenshot principal do projeto aqui', 'tall');
    sectionsEl.innerHTML   = buildSections(p.sections);
    galleryGrid.innerHTML  = buildGallery(p.gallery);
    resultQuote.innerHTML  = p.resultQuote || 'Adicione aqui a frase de resultado final do projeto.';
    resultText.textContent = p.resultText  || 'Adicione aqui uma breve descrição do resultado e impacto gerado.';
    resultActs.innerHTML   = buildActions(p, true);

    var ni = (idx + 1) % projects.length;
    nextName.textContent = projects[ni].title;
    nextBtn.onclick = function(){
      goTo(ni);
      history.pushState({ projectIdx: ni }, '', '?project=' + ni);
    };

    if (scrollEl) scrollEl.scrollTop = 0;
    setTimeout(checkReveal, 80);
  }

  /* ── Scroll reveal ────────────────────────────────────────── */
  function checkReveal() {
    var threshold = window.innerHeight - 40;
    modal.querySelectorAll('.pd-reveal:not(.in)').forEach(function(el){
      var rect = el.getBoundingClientRect();
      if (rect.top < threshold) el.classList.add('in');
    });
  }
  function revealAll() {
    modal.querySelectorAll('.pd-reveal:not(.in)').forEach(function(el){ el.classList.add('in'); });
  }
  function onScroll() {
    if (barEl && scrollEl) {
      var max = scrollEl.scrollHeight - scrollEl.clientHeight;
      barEl.style.width = (max > 0 ? scrollEl.scrollTop / max * 100 : 0) + '%';
    }
    checkReveal();
  }
  if (scrollEl) scrollEl.addEventListener('scroll', onScroll, { passive: true });

  /* ── Navigation ───────────────────────────────────────────── */
  function goTo(idx) { currentIdx = idx; paint(idx); }

  var mainPage = document.getElementById('top');

  function openModal(idx) {
    goTo(idx);
    modal.classList.add('animating', 'open');
    modal.setAttribute('aria-hidden', 'false');
    isOpen = true;
    window.__rafPaused = true;
    if (mainPage) mainPage.style.visibility = 'hidden';
    history.pushState({ projectIdx: idx }, '', '?project=' + idx);
    setTimeout(function(){ modal.classList.remove('animating'); }, 650);
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        modal.focus();
        checkReveal();
        setTimeout(checkReveal, 200);
      });
    });
  }

  function closeModal() {
    modal.classList.add('animating');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    isOpen = false;
    modal.querySelectorAll('.pd-reveal.in').forEach(function(el){ el.classList.remove('in'); });
    if (history.state && history.state.projectIdx !== undefined) history.back();
    setTimeout(function(){
      modal.classList.remove('animating');
      window.__rafPaused = false;
      if (mainPage) mainPage.style.visibility = '';
      var sec = document.getElementById('projects');
      if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 650);
  }

  window._pmo    = openModal;
  window._pdClose = closeModal;

  /* ── Inject trigger button into each card ─────────────────── */
  cards.forEach(function(card){
    var btn = document.createElement('button');
    btn.className = 'pd-trigger';
    btn.setAttribute('aria-label', 'Abrir projeto');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>';
    card.appendChild(btn);
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backBtn)  backBtn.addEventListener('click', closeModal);

  document.addEventListener('keydown', function(e){
    if (!isOpen) return;
    if (e.key === 'Escape') closeModal();
  });

  window.addEventListener('popstate', function(e) {
    if (e.state && e.state.projectIdx !== undefined) {
      if (!isOpen) {
        goTo(e.state.projectIdx);
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        isOpen = true;
      } else {
        goTo(e.state.projectIdx);
      }
    } else if (isOpen) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      isOpen = false;
      modal.querySelectorAll('.pd-reveal.in').forEach(function(el){ el.classList.remove('in'); });
      setTimeout(function(){
        var sec = document.getElementById('projects');
        if (sec) sec.scrollIntoView({ behavior: 'instant' });
      }, 350);
    }
  });

  /* Handle direct URL load: ?project=N */
  (function(){
    var p = new URLSearchParams(window.location.search).get('project');
    if (p !== null) {
      var n = parseInt(p, 10);
      if (!isNaN(n) && n >= 0 && n < projects.length) {
        history.replaceState({ projectIdx: n }, '', window.location.href);
        openModal(n);
      }
    }
  })();
})();

/* ---- Card click delegation ---- */
(function(){
  var allCards = document.querySelectorAll('#projects .proj');
  document.addEventListener('click', function(e){
    var card = e.target.closest && e.target.closest('#projects .proj');
    if (!card) return;
    e.preventDefault();
    var idx = Array.prototype.indexOf.call(allCards, card);
    if (idx >= 0 && window._pmo) window._pmo(idx);
  });
})();