/* 
    CLICK SUPORTE - SaaS/APPLE INTERACTIVITY
    Includes Smooth Scroll, Header Transparency, and Plexus Engine
*/

document.addEventListener('DOMContentLoaded', () => {
    
    // Smooth Scroll for Internal Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar transparency effects
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
            navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.4)';
            navbar.style.background = 'rgba(13, 17, 23, 0.95)';
        } else {
            navbar.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            navbar.style.boxShadow = 'none';
            navbar.style.background = 'rgba(13, 17, 23, 0.8)';
        }
    });

    // --- PLEXUS CANVAS ENGINE (High Performance) ---
    const canvas = document.getElementById('plexus-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let points = [];
        const pointCount = window.innerWidth < 768 ? 25 : 45; // Refined for a calmer feel
        const connectionDistance = 150;
        const speedMultiplier = 0.25; // Smoother, premium movement

        function initCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            points = [];
            for (let i = 0; i < pointCount; i++) {
                points.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * speedMultiplier,
                    vy: (Math.random() - 0.5) * speedMultiplier
                });
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Subtle Cyan Look
            ctx.fillStyle = 'rgba(0, 242, 255, 0.4)';
            ctx.strokeStyle = 'rgba(0, 242, 255, 0.08)';
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(0, 242, 255, 0.5)';

            points.forEach((p, index) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
                ctx.fill();

                for (let j = index + 1; j < points.length; j++) {
                    const p2 = points[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDistance) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.lineWidth = (1 - dist / connectionDistance) * 1.5;
                        ctx.stroke();
                    }
                }
            });
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', initCanvas);
        initCanvas();
        animate();
    }
    // Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileToggle.classList.toggle('open');
        });
    }

    // Close menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileToggle.classList.remove('open');
        });
    });

    // --- REVEAL ON SCROLL ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach((el, i) => {
        revealObserver.observe(el);
    });

    // --- FAQ ACCORDION ---
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const item = button.closest('.faq-item');
            const isOpen = item.classList.contains('open');
            
            // Close all other items
            document.querySelectorAll('.faq-item.open').forEach(openItem => {
                openItem.classList.remove('open');
                openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });
            
            // Toggle current item
            if (!isOpen) {
                item.classList.add('open');
                button.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // --- PARALLAX EFFECT ---
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        if (canvas) {
            canvas.style.transform = `translateY(${scrolled * 0.15}px)`;
        }
    }, { passive: true });

    // --- COUNTER ENGINE ---
    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const countTo = parseFloat(target.getAttribute('data-count'));
                const suffix = target.getAttribute('data-suffix') || '';
                const duration = 2000;
                const startTime = performance.now();
                
                function updateCount(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Ease out expo for elite feel
                    const easeProgress = 1 - Math.pow(2, -10 * progress);
                    const currentCount = (easeProgress * countTo);

                    if (countTo % 1 === 0) {
                        target.innerText = Math.floor(currentCount) + suffix;
                    } else {
                        target.innerText = currentCount.toFixed(1) + suffix;
                    }

                    if (progress < 1) {
                        requestAnimationFrame(updateCount);
                    } else {
                        target.innerText = countTo + suffix;
                    }
                }
                
                requestAnimationFrame(updateCount);
                countObserver.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

    // --- BACK TO TOP ---
    const backToTop = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 600) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }, { passive: true });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Footer Logo Scroll to Top
    const footerLogo = document.getElementById('footer-logo');
    if (footerLogo) {
        footerLogo.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- MOUSE GLOW (Spotlight Effect) ---
    document.querySelectorAll('.card, .step, .testimonial-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // --- WHATSAPP TOOLTIP (first visit only) ---
    const waTooltip = document.getElementById('wa-tooltip');
    if (waTooltip) {
        const alreadySeen = localStorage.getItem('cs_tooltip_seen');
        if (alreadySeen) {
            waTooltip.classList.add('hidden');
        } else {
            // After animation completes (7s delay + 0.5s fade out = 7.5s), hide and mark seen
            setTimeout(() => {
                waTooltip.classList.add('hidden');
                localStorage.setItem('cs_tooltip_seen', '1');
            }, 7500);
        }
    }

    // --- CUSTOM TECH CURSOR ENGINE (60FPS + INERTIA) ---
    const dot = document.querySelector('.cursor-dot');
    const outline = document.querySelector('.cursor-outline');
    
    // Position state
    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;
    
    // Lerp intensity (lower = more delay/smoothness)
    const lerpAmount = 0.15;

    if (dot && outline) {
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Dot follows immediately
            dot.style.left = mouseX + 'px';
            dot.style.top = mouseY + 'px';
        });

        const animateCursor = () => {
            // Outline follows with Lerp (inertia)
            outlineX += (mouseX - outlineX) * lerpAmount;
            outlineY += (mouseY - outlineY) * lerpAmount;
            
            outline.style.left = outlineX + 'px';
            outline.style.top = outlineY + 'px';
            
            requestAnimationFrame(animateCursor);
        };
        animateCursor();

        // Magnetic / Hover Effect
        const interactiveElements = 'a, button, .card, .step, .faq-question, .btn';
        document.querySelectorAll(interactiveElements).forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
            });
        });
    }

    // --- HERO IMAGE CAROUSEL (CINEMATIC FADE) ---
    const heroImages = document.querySelectorAll('.hero-laptop-img');
    let currentImage = 0;

    if (heroImages.length > 1) {
        setInterval(() => {
            heroImages[currentImage].classList.remove('active');
            currentImage = (currentImage + 1) % heroImages.length;
            heroImages[currentImage].classList.add('active');
        }, 6000); // 6s duration for high-end feel
    }
});
