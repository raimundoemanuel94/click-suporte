/* =====================================================
   CLICK SUPORTE — SCRIPT.JS (ADAPTADO)
   Interatividade: Plexus, Counters e Menu Mobile
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // ─── PLEXUS CANVAS (REGRA 4 & 5) ───
  const canvas = document.getElementById('plexus');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1; // REGRA 4: Suporte Retina
    let W, H, pts = [];
    const N = 70, DIST = 140;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr); // REGRA 4
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

    // REGRA 4: Mover propriedades estáticas para fora do loop
    ctx.shadowColor = 'rgba(0, 229, 255, 0.5)';
    ctx.lineWidth = 0.8;

    function animate() {
      ctx.clearRect(0, 0, W, H);
      
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      });

      // Desenhar Linhas
      ctx.shadowBlur = 0; // REGRA 4: Desabilita glow nas linhas para performance
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < DIST) {
            const a = (1 - d / DIST) * 0.35;
            ctx.strokeStyle = `rgba(0, 229, 255, ${a})`;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }

      // Desenhar Pontos
      ctx.shadowBlur = 8; // REGRA 4: Glow somente nos pontos
      ctx.fillStyle = 'rgba(0, 229, 255, 0.5)';
      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }
    animate();
  }

  // ─── NAV MOBILE (REGRA 6) ───
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      mobileToggle.classList.toggle('open');
    });
  }

  // Fechar ao clicar fora (REGRA 6)
  document.addEventListener('click', (e) => {
    if (navLinks && !navLinks.closest('nav') && !e.target.closest('#mobile-toggle')) {
      navLinks.classList.remove('active');
      mobileToggle?.classList.remove('open');
    }
  });

  // ─── COUNTER ENGINE (REGRA 3) ───
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.getAttribute('data-target')); // REGRA 3: data-target
      const suffix = el.getAttribute('data-suffix') || ''; // REGRA 3: data-suffix
      let start = 0;
      const dur = 2000;
      const t0 = performance.now();

      function tick(now) {
        const p = Math.min((now - t0) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 4);
        const current = (ease * target);
        el.textContent = (target % 1 === 0 ? Math.floor(current) : current.toFixed(1)) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-num').forEach(el => counterIO.observe(el));

  // ─── MOUSE GLOW (REGRA 7) ───
  document.querySelectorAll('.card, .step, .testimonial-card, .service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
});
