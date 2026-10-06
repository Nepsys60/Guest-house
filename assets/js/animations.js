/**
 * The Chitwan Sanctuary — Picture-Perfect Animation & Interaction Engine
 * Ultra-smooth 60fps micro-animations, scroll reveals, dynamic number counters,
 * spotlight tilt effects, and luxury feedback transitions.
 */

(function () {
  'use strict';

  // 1. SCROLL-TRIGGERED REVEAL OBSERVER
  function initScrollReveals() {
    const revealElements = document.querySelectorAll(
      '.reveal, .reveal-scale, .reveal-left, .reveal-right, .reveal-fade'
    );

    if (!('IntersectionObserver' in window)) {
      revealElements.forEach(el => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            // Trigger counter animation if element or child has data-counter
            const counters = entry.target.querySelectorAll('[data-counter]');
            if (entry.target.hasAttribute('data-counter')) {
              animateCounter(entry.target);
            }
            counters.forEach(animateCounter);
            obs.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.12,
      }
    );

    revealElements.forEach(el => observer.observe(el));
  }

  // 2. DYNAMIC NUMBER COUNTER ANIMATION
  function animateCounter(el) {
    if (el.dataset.counterDone) return;
    el.dataset.counterDone = 'true';

    const target = parseFloat(el.getAttribute('data-counter') || el.innerText.replace(/[^0-9.]/g, ''));
    if (isNaN(target)) return;

    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const isDecimal = target % 1 !== 0;
    const duration = 1400; // ms
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Apple-style easeOutExpo: 1 - Math.pow(2, -10 * progress)
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = progress * target;

      const formattedNum = isDecimal
        ? (ease * target).toFixed(1)
        : Math.round(ease * target).toLocaleString();

      el.innerText = `${prefix}${formattedNum}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.classList.add('number-bump');
        setTimeout(() => el.classList.remove('number-bump'), 400);
      }
    }

    requestAnimationFrame(step);
  }

  // 3. 3D CARD TILT & SPOTLIGHT HIGHLIGHT
  function initCardSpotlights() {
    const cards = document.querySelectorAll('.interactive-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4.5;
        const rotateY = ((x - centerX) / centerX) * 4.5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // 4. CLICK RIPPLE EFFECT
  function initButtonRipples() {
    const buttons = document.querySelectorAll('.ripple-fx, .shimmer-btn');
    buttons.forEach(button => {
      button.addEventListener('click', function (e) {
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        const rect = button.getBoundingClientRect();

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - rect.left - radius}px`;
        circle.style.top = `${e.clientY - rect.top - radius}px`;
        circle.classList.add('ripple-circle');

        const existing = button.querySelector('.ripple-circle');
        if (existing) existing.remove();

        button.appendChild(circle);
        setTimeout(() => circle.remove(), 650);
      });
    });
  }

  // 5. PARALLAX EFFECT ON HERO IMAGE
  function initHeroParallax() {
    const heroImage = document.querySelector('.animate-ken-burns, section .absolute.inset-0 img');
    if (!heroImage) return;

    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollY < window.innerHeight * 1.2) {
              const move = scrollY * 0.22;
              heroImage.style.transform = `translateY(${move}px) scale(1.05)`;
            }
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  // 6. STICKY HEADER ELEVATION TRANSITION
  function initNavbarScroll() {
    const header = document.querySelector('header');
    if (!header) return;

    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollY > 30) {
              header.classList.add('shadow-md', 'bg-brand-ivory/98');
              header.classList.remove('bg-brand-ivory/95');
            } else {
              header.classList.remove('shadow-md', 'bg-brand-ivory/98');
              header.classList.add('bg-brand-ivory/95');
            }
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  // 7. SMOOTH SCROLL WITH HEADER OFFSET
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '#!') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const header = document.querySelector('header');
          const headerHeight = header ? header.offsetHeight : 80;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth',
          });
        }
      });
    });
  }

  // 8. SCROLLSPY TO HIGHLIGHT ACTIVE NAV LINK
  function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('header nav a[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    window.addEventListener('scroll', () => {
      let currentId = '';
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const headerOffset = 120;

      sections.forEach(section => {
        const sectionTop = section.offsetTop - headerOffset;
        const sectionHeight = section.offsetHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          currentId = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('text-brand-forest', 'font-bold');
        if (currentId && link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('text-brand-forest', 'font-bold');
        }
      });
    }, { passive: true });
  }

  // INITIALIZE ALL PICTURE-PERFECT ANIMATIONS ON DOM READY
  document.addEventListener('DOMContentLoaded', () => {
    initScrollReveals();
    initCardSpotlights();
    initButtonRipples();
    initHeroParallax();
    initNavbarScroll();
    initSmoothAnchors();
    initScrollSpy();
  });
})();
