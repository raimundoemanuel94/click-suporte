/* =====================================================
   CLICK SUPORTE — SCRIPT v6.0
   Preserva toda lógica original + novas features
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const themeToggle = document.getElementById('theme-toggle');

  function setTheme(theme) {
    const isLight = theme === 'light';
    document.documentElement.dataset.theme = isLight ? 'light' : 'dark';
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(isLight));
      themeToggle.setAttribute('aria-label', isLight ? 'Alternar para tema escuro' : 'Alternar para tema claro');
    }
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', isLight ? '#ffffff' : '#050810');
  }

  if (themeToggle) {
    const currentTheme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    setTheme(currentTheme);
    themeToggle.addEventListener('click', () => {
      const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      setTheme(nextTheme);
      try {
        localStorage.setItem('click-suporte-theme', nextTheme);
      } catch (error) {}
    });
  }

  /* ─── PLEXUS CANVAS ─────────────────────────────── */
  const canvas = document.getElementById('plexus');
  if (canvas && !reducedMotion) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    let W, H, pts = [];
    let rafId = null;
    const N = coarsePointer ? 28 : 60, DIST = coarsePointer ? 110 : 140;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < N; i++) {
      pts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4
      });
    }

    ctx.lineWidth = 0.7;

    function animate() {
      ctx.clearRect(0, 0, W, H);

      pts.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      });

      // Lines
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < DIST) {
            const a = (1 - d / DIST) * 0.3;
            ctx.strokeStyle = `rgba(0, 229, 255, ${a})`;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }

      // Dots
      ctx.fillStyle = 'rgba(0, 229, 255, 0.45)';
      ctx.shadowColor = 'rgba(0, 229, 255, 0.4)';
      ctx.shadowBlur = 6;
      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      if (!document.hidden) rafId = requestAnimationFrame(animate);
    }
    animate();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && rafId) cancelAnimationFrame(rafId);
      if (!document.hidden) animate();
    });
  }


  /* ─── CUSTOM CURSOR ─────────────────────────────── */
  const ring = document.getElementById('cursor-ring');
  const dot = document.getElementById('cursor-dot');
  if (ring && dot && !reducedMotion && !coarsePointer) {
    let mx = 0, my = 0, rx = 0, ry = 0;

    window.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
    });

    function animCursor() {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
      requestAnimationFrame(animCursor);
    }
    animCursor();

    document.querySelectorAll('a, button, .faq-q, .service-card, .diff-card, .cs-card').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }


  /* ─── REVEAL ON SCROLL ──────────────────────────── */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  if (reducedMotion) document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  else document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


  /* ─── COUNTER ANIMATION (rAF) ───────────────────── */
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.getAttribute('data-target'));
      const suffix = el.getAttribute('data-suffix') || '';
      const dur = reducedMotion ? 1 : 2000;
      const t0 = performance.now();

      function tick(now) {
        const p = Math.min((now - t0) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 4);
        const current = ease * target;
        el.textContent = (target % 1 === 0 ? Math.floor(current) : current.toFixed(1)) + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));


  /* ─── MOUSE GLOW ON CARDS ───────────────────────── */
  document.querySelectorAll('.service-card, .diff-card, .cs-card, .step').forEach(card => {
    if (!reducedMotion && !coarsePointer) card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
    });
  });


  /* ─── SPECIALIST 3D TILT ────────────────────────── */
  const specBlock = document.querySelector('.specialist-block');
  if (specBlock && !reducedMotion && !coarsePointer) {
    specBlock.addEventListener('mousemove', e => {
      const r = specBlock.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      specBlock.style.transform = `perspective(1000px) rotateX(${y * -8}deg) rotateY(${x * 8}deg) translateZ(10px)`;
    });
    specBlock.addEventListener('mouseleave', () => {
      specBlock.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    });
  }


  /* ─── FAQ ACCORDION ─────────────────────────────── */
  document.querySelectorAll('.faq-q').forEach(q => {
    const toggleFaq = () => {
      const item = q.parentElement;
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
        const trigger = i.querySelector('.faq-q');
        const panel = i.querySelector('.faq-a');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
        if (panel) panel.setAttribute('aria-hidden', 'true');
      });
      if (!wasOpen) {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
        const panel = item.querySelector('.faq-a');
        if (panel) panel.setAttribute('aria-hidden', 'false');
      }
    };

    q.addEventListener('click', toggleFaq);
    q.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFaq();
      }
    });
  });


  /* ─── MOBILE MENU ───────────────────────────────── */
  const mobileToggle = document.getElementById('mobile-toggle');
  const mainNav = document.getElementById('main-nav');
  if (mobileToggle && mainNav) {
    const setMenuState = isOpen => {
      mainNav.classList.toggle('mobile-open', isOpen);
      mobileToggle.classList.toggle('open', isOpen);
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
    };

    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      setMenuState(!mainNav.classList.contains('mobile-open'));
    });

    // Close menu when clicking links
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        setMenuState(false);
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!mainNav.contains(e.target) && !mobileToggle.contains(e.target)) {
        setMenuState(false);
      }
    });
  }


  /* ─── HERO CAROUSEL ─────────────────────────────── */
  const heroSlides = document.querySelectorAll('.hero-slide');
  let curSlide = 0;
  if (heroSlides.length > 1 && !reducedMotion) {
    setInterval(() => {
      heroSlides[curSlide].classList.remove('active');
      curSlide = (curSlide + 1) % heroSlides.length;
      heroSlides[curSlide].classList.add('active');
    }, 5000);
  }


  /* ─── HEADER SCROLL ─────────────────────────────── */
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }


  /* ─── BACK TO TOP ───────────────────────────────── */
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  /* ─── SMOOTH ANCHOR SCROLL ──────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
