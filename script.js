/* ============================================================
   All-Business — script.js
   Lightweight, progressive-enhancement JS
   ============================================================ */

(function () {
  'use strict';

  /* ── Sticky header ────────────────────────────────────────── */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile nav toggle ────────────────────────────────────── */
  const navToggle = document.getElementById('navToggle');
  const navMenu   = document.getElementById('navMenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      navMenu.classList.toggle('is-open', !open);
    });

    // Close menu on nav link click (mobile)
    navMenu.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('is-open');
      });
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('is-open');
        navToggle.focus();
      }
    });
  }

  /* ── Scroll-triggered fade-up animations ─────────────────── */
  const fadeEls = document.querySelectorAll('.fade-up');
  if ('IntersectionObserver' in window && fadeEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(el => io.observe(el));
  } else {
    // Fallback: show all immediately
    fadeEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ── Animated counters ────────────────────────────────────── */
  const statValues = document.querySelectorAll('.stat-item__value[data-target]');
  if ('IntersectionObserver' in window && statValues.length) {
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const duration = 1600;
        const start = performance.now();

        const tick = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target).toLocaleString();
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        counterIO.unobserve(el);
      });
    }, { threshold: 0.5 });

    statValues.forEach(el => counterIO.observe(el));
  }

  /* ── Pricing toggle ───────────────────────────────────────── */
  const billingBtns  = document.querySelectorAll('.billing-btn');
  const priceAmounts = document.querySelectorAll('.pricing-card__amount[data-monthly]');

  billingBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const period = btn.dataset.period;
      billingBtns.forEach(b => {
        b.classList.toggle('billing-btn--active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      priceAmounts.forEach(amount => {
        const val = amount.dataset[period];
        if (val) amount.textContent = '$' + val;
      });
    });
  });

  /* ── Contact form validation & submission ─────────────────── */
  const form        = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (form) {
    const showError = (input, message) => {
      input.classList.add('is-invalid');
      const errorEl = input.parentElement.querySelector('.field-error');
      if (errorEl) errorEl.textContent = message;
    };

    const clearError = (input) => {
      input.classList.remove('is-invalid');
      const errorEl = input.parentElement.querySelector('.field-error');
      if (errorEl) errorEl.textContent = '';
    };

    const validateEmail = (val) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim());

    // Inline validation on blur
    form.querySelectorAll('input[required]').forEach(input => {
      input.addEventListener('blur', () => {
        if (!input.value.trim()) {
          showError(input, 'This field is required.');
        } else if (input.type === 'email' && !validateEmail(input.value)) {
          showError(input, 'Please enter a valid email address.');
        } else {
          clearError(input);
        }
      });
      input.addEventListener('input', () => {
        if (input.classList.contains('is-invalid')) clearError(input);
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput  = form.querySelector('#name');
      const emailInput = form.querySelector('#email');
      let valid = true;

      if (!nameInput.value.trim()) {
        showError(nameInput, 'Please enter your name.');
        valid = false;
      }
      if (!emailInput.value.trim()) {
        showError(emailInput, 'Please enter your email.');
        valid = false;
      } else if (!validateEmail(emailInput.value)) {
        showError(emailInput, 'Please enter a valid work email.');
        valid = false;
      }

      if (!valid) {
        form.querySelector('.is-invalid')?.focus();
        return;
      }

      // Loading state
      const submitBtn = form.querySelector('[type="submit"]');
      submitBtn.classList.add('btn--loading');
      submitBtn.disabled = true;

      // Simulate async submission (replace with real fetch in production)
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Show success
      form.hidden = true;
      if (formSuccess) {
        formSuccess.hidden = false;
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  /* ── Update copyright year ────────────────────────────────── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Smooth scroll for anchor links (older browser fallback) ─ */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!CSS.supports('scroll-behavior', 'smooth') && !prefersReducedMotion) {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

}());
