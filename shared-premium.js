/* ============================================
   SHARED-PREMIUM.JS - CareerByteCode Premium Interactions
   All 15 Apple-Level Features + Shared Utilities
   ============================================ */
(function(){
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  /* ── Feature 1: Dark Mode Toggle ── */
  function initDarkMode(){
    const toggle = $('#theme-toggle');
    const saved = localStorage.getItem('cbc-theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if(saved) document.documentElement.setAttribute('data-theme', saved);
    else document.documentElement.setAttribute('data-theme', 'oxblood');
    updateToggleIcon();
    if(toggle){
      toggle.addEventListener('click', ()=>{
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('cbc-theme', next);
        updateToggleIcon();
      });
    }
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e=>{
      if(!localStorage.getItem('cbc-theme')){
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        updateToggleIcon();
      }
    });
  }
  function updateToggleIcon(){
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const toggle = $('#theme-toggle');
    if(toggle) toggle.innerHTML = isDark ? '<span class="icon-sun">&#9728;</span>' : '<span class="icon-moon">&#9790;</span>';
  }

  /* ── Feature 2: Page Transitions ── */
  function initPageTransitions(){
    if(!document.startViewTransition || prefersReducedMotion) return;
    document.addEventListener('click', e=>{
      const link = e.target.closest('a[href]');
      if(!link) return;
      const url = new URL(link.href, location.href);
      if(url.origin !== location.origin) return;
      if(url.pathname === location.pathname) return;
      if(link.target === '_blank') return;
      e.preventDefault();
      document.startViewTransition(()=>{
        location.href = link.href;
      });
    });
  }

  /* ── Feature 3: Hero Parallax ── */
  function initParallax(){
    if(prefersReducedMotion || isTouch) return;
    const els = $$('[data-parallax]');
    if(!els.length) return;
    let ticking = false;
    window.addEventListener('scroll', ()=>{
      if(!ticking){
        requestAnimationFrame(()=>{
          const scrollY = window.scrollY;
          els.forEach(el=>{
            const factor = parseFloat(el.dataset.parallax) || 0.3;
            el.style.transform = `translateY(${scrollY * factor}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    }, {passive: true});
  }

  /* ── Feature 4: Skeleton Shimmer ── */
  function initShimmer(){
    $$('.shimmer-img').forEach(wrap=>{
      const img = wrap.querySelector('img');
      if(!img) return;
      if(img.complete){
        wrap.classList.add('loaded');
      } else {
        img.addEventListener('load', ()=> wrap.classList.add('loaded'));
        img.addEventListener('error', ()=> wrap.classList.add('loaded'));
      }
    });
  }

  /* ── Feature 6: Smooth JS Scroll ── */
  function initSmoothScroll(){
    if(prefersReducedMotion) return;
    document.addEventListener('click', e=>{
      const link = e.target.closest('a[href^="#"]');
      if(!link) return;
      const id = link.getAttribute('href');
      if(id === '#') return;
      const target = document.querySelector(id);
      if(!target) return;
      e.preventDefault();
      const start = window.scrollY;
      const end = target.getBoundingClientRect().top + start - 80;
      const duration = 800;
      const startTime = performance.now();
      function easeOutExpo(t){return t===1?1:1-Math.pow(2,-10*t);}
      function step(now){
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = easeOutExpo(progress);
        window.scrollTo(0, start + (end - start) * ease);
        if(progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      // Close mobile menu if open
      const mobile = $('.nav__mobile');
      const hamburger = $('.nav__hamburger');
      if(mobile && mobile.classList.contains('open')){
        mobile.classList.remove('open');
        if(hamburger) hamburger.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── Feature 7: 3D Tilt on Cards ── */
  function initTilt(){
    if(prefersReducedMotion || isTouch) return;
    $$('.card, .speaker-card, .mentor-card').forEach(card=>{
      let tiltRaf = null, tiltX = 0, tiltY = 0;
      card.addEventListener('mousemove', e=>{
        tiltX = e.clientX; tiltY = e.clientY;
        if(tiltRaf !== null) return;            // coalesce to one write per frame
        tiltRaf = requestAnimationFrame(()=>{
          tiltRaf = null;
          const rect = card.getBoundingClientRect();
          const x = tiltX - rect.left;
          const y = tiltY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -4;
          const rotateY = ((x - centerX) / centerX) * 4;
          card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });
      }, {passive: true});
      card.addEventListener('mouseleave', ()=>{
        card.style.transform = '';
        card.style.transition = 'transform 0.5s ease';
        setTimeout(()=> card.style.transition = '', 500);
      });
    });
  }

  /* ── Feature 9: Staggered Reveal Animations ── */
  function initReveal(){
    const els = $$('.reveal');
    if(!els.length) return;
    if(prefersReducedMotion || isTouch){
      els.forEach(el=>{ el.classList.add('reveal--visible'); });
      return;
    }
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        const el = entry.target;
        // Calculate stagger delay based on sibling index
        const parent = el.parentElement;
        if(parent){
          const siblings = Array.from(parent.querySelectorAll(':scope > .reveal'));
          const index = siblings.indexOf(el);
          if(index > 0) el.style.transitionDelay = `${index * 60}ms`;
        }
        el.classList.add('reveal--visible');
        observer.unobserve(el);
      });
    }, {threshold: 0.06, rootMargin: '0px 0px -40px 0px'});
    els.forEach(el=> observer.observe(el));
  }

  /* ── Feature 10: Custom Cursor ── */
  function initCursor(){
    if(prefersReducedMotion || isTouch) return;
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let ringRaf = null;
    document.addEventListener('mousemove', e=>{
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX - 3}px, ${mouseY - 3}px)`;
      // Restart the easing loop only when there's something to animate.
      if(ringRaf === null && !document.hidden) ringRaf = requestAnimationFrame(animateRing);
    }, {passive: true});
    function animateRing(){
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.transform = `translate(${ringX - 16}px, ${ringY - 16}px)`;
      // Stop once the ring has caught up to the cursor — no idle frames.
      if(Math.abs(mouseX - ringX) > 0.1 || Math.abs(mouseY - ringY) > 0.1){
        ringRaf = requestAnimationFrame(animateRing);
      } else {
        ringRaf = null;
      }
    }
    document.addEventListener('visibilitychange', ()=>{
      if(document.hidden && ringRaf !== null){ cancelAnimationFrame(ringRaf); ringRaf = null; }
    });
    // Scale up on interactive elements
    const interactives = 'a, button, .btn, .card, .speaker-card, .mentor-card, [data-tab-btn], [data-accordion-head], .nav__hamburger, .theme-toggle, .btt';
    document.addEventListener('mouseover', e=>{
      if(e.target.closest(interactives)) ring.classList.add('hover');
    });
    document.addEventListener('mouseout', e=>{
      if(e.target.closest(interactives)) ring.classList.remove('hover');
    });
  }

  /* ── Feature 14: Scroll Progress ── */
  function initScrollProgress(){
    const bar = $('.scroll-progress');
    if(!bar) return;
    window.addEventListener('scroll', ()=>{
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const progress = total > 0 ? (window.scrollY / total) * 100 : 0;
      bar.style.width = progress + '%';
    }, {passive: true});
  }

  /* ── Feature 15: Magnetic Buttons ── */
  function initMagneticButtons(){
    if(prefersReducedMotion || isTouch) return;
    $$('.btn--magnetic').forEach(btn=>{
      let magRaf = null, magX = 0, magY = 0;
      btn.addEventListener('mousemove', e=>{
        magX = e.clientX; magY = e.clientY;
        if(magRaf !== null) return;             // coalesce to one write per frame
        magRaf = requestAnimationFrame(()=>{
          magRaf = null;
          const rect = btn.getBoundingClientRect();
          const x = magX - rect.left - rect.width / 2;
          const y = magY - rect.top - rect.height / 2;
          btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
        });
      }, {passive: true});
      btn.addEventListener('mouseleave', ()=>{
        btn.style.transform = '';
        btn.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
        setTimeout(()=> btn.style.transition = '', 400);
      });
    });
  }

  /* ── Shared: Nav Scroll State ── */
  function initNavScroll(){
    const nav = $('.nav');
    if(!nav) return;
    const check = ()=> nav.classList.toggle('nav--scrolled', window.scrollY > 20);
    window.addEventListener('scroll', check, {passive: true});
    check();
  }

  /* ── Shared: Hamburger Menu ── */
  function initHamburger(){
    const btn = $('.nav__hamburger');
    const menu = $('.nav__mobile');
    if(!btn || !menu) return;
    btn.addEventListener('click', ()=>{
      const isOpen = menu.classList.toggle('open');
      btn.classList.toggle('open');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    // Close on link click
    menu.querySelectorAll('a').forEach(a=>{
      a.addEventListener('click', ()=>{
        menu.classList.remove('open');
        btn.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Shared: Counter Animation ── */
  function initCounters(){
    const els = $$('[data-count-to]');
    if(!els.length) return;
    /* On mobile: show final values immediately, skip animation */
    if(isTouch){
      els.forEach(el=>{ el.textContent = el.dataset.countTo; });
      return;
    }
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        const el = entry.target;
        const raw = el.dataset.countTo;
        const num = parseFloat(raw);
        if(isNaN(num)){
          el.textContent = raw;
          observer.unobserve(el);
          return;
        }
        const suffix = raw.replace(/[\d.,]/g, '');
        const isFloat = raw.includes('.');
        const decimals = isFloat ? (raw.split('.')[1] || '').replace(/[^\d]/g,'').length : 0;
        const duration = 2200;
        const start = performance.now();
        function step(now){
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out expo
          const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          const current = num * ease;
          el.textContent = (isFloat ? current.toFixed(decimals) : Math.round(current).toLocaleString()) + suffix;
          if(progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        observer.unobserve(el);
      });
    }, {threshold: 0.5});
    els.forEach(el=> observer.observe(el));
  }

  /* ── Shared: Back-to-Top ── */
  function initBackToTop(){
    const btn = $('.btt');
    if(!btn) return;
    window.addEventListener('scroll', ()=>{
      btn.classList.toggle('show', window.scrollY > 400);
    }, {passive: true});
    btn.addEventListener('click', ()=>{
      if(prefersReducedMotion){
        window.scrollTo(0, 0);
        return;
      }
      const start = window.scrollY;
      const duration = 600;
      const startTime = performance.now();
      function easeOutExpo(t){return t===1?1:1-Math.pow(2,-10*t);}
      function step(now){
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        window.scrollTo(0, start * (1 - easeOutExpo(progress)));
        if(progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* ── Shared: Tab Switching ── */
  function initTabs(){
    $$('[data-tab-btn]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const group = btn.dataset.tabGroup || btn.closest('[data-tab-group]')?.dataset.tabGroup;
        const target = btn.dataset.tabBtn;
        // Deactivate all in group
        const container = btn.closest('.tabs')?.parentElement || document;
        container.querySelectorAll('[data-tab-btn]').forEach(b=> b.classList.remove('active'));
        container.querySelectorAll('[data-tab-panel]').forEach(p=> p.classList.remove('active'));
        // Activate target
        btn.classList.add('active');
        const panel = container.querySelector(`[data-tab-panel="${target}"]`);
        if(panel) panel.classList.add('active');
      });
    });
  }

  /* ── Shared: Accordion Toggle ── */
  function initAccordions(){
    $$('[data-accordion-head]').forEach(head=>{
      head.addEventListener('click', ()=>{
        const item = head.closest('[data-accordion-item]');
        if(!item) return;
        const isOpen = item.hasAttribute('data-open');
        // Close all siblings (if single-open mode)
        const parent = item.parentElement;
        if(parent && parent.dataset.accordionSingle !== undefined){
          parent.querySelectorAll('[data-accordion-item][data-open]').forEach(i=>{
            if(i !== item){
              i.removeAttribute('data-open');
              const body = i.querySelector('[data-accordion-body]');
              if(body) body.style.maxHeight = '0';
            }
          });
        }
        if(isOpen){
          item.removeAttribute('data-open');
          const body = item.querySelector('[data-accordion-body]');
          if(body){
            body.style.maxHeight = body.scrollHeight + 'px';
            requestAnimationFrame(()=>{ body.style.maxHeight = '0'; });
          }
        } else {
          item.setAttribute('data-open', '');
          const body = item.querySelector('[data-accordion-body]');
          if(body){
            body.style.maxHeight = body.scrollHeight + 'px';
            // After transition completes, switch to 'none' so content isn't clipped
            const onEnd = ()=>{ body.style.maxHeight = 'none'; body.removeEventListener('transitionend', onEnd); };
            body.addEventListener('transitionend', onEnd);
          }
        }
      });
    });
    // Initialize open accordions - use 'none' instead of fixed px to avoid clipping
    function refreshOpenAccordions(){
      $$('[data-accordion-item][data-open] [data-accordion-body]').forEach(body=>{
        body.style.maxHeight = 'none';
      });
    }
    refreshOpenAccordions();
    // Recalculate after fonts load (content may reflow)
    if(document.fonts && document.fonts.ready){
      document.fonts.ready.then(refreshOpenAccordions);
    }
    // Also recalculate after a short delay for safety
    setTimeout(refreshOpenAccordions, 500);
  }

  /* ── Shared: Active Nav Highlighting ── */
  function initActiveNav(){
    const sections = $$('section[id], div[id]');
    if(!sections.length) return;
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const id = entry.target.id;
          $$('.nav__links a, .nav__mobile a').forEach(a=>{
            a.classList.toggle('active', a.getAttribute('href') === '#' + id);
          });
        }
      });
    }, {threshold: 0.3, rootMargin: '-20% 0px -60% 0px'});
    sections.forEach(s=> observer.observe(s));
  }

  /* ── Shared: Pause CSS animations while the tab is hidden ── */
  /* Zero visual impact (the tab isn't visible) but stops all the
     infinite blur/orb/streak keyframes from burning GPU in the background. */
  function initVisibilityPause(){
    const apply = ()=> document.body.classList.toggle('anim-paused', document.hidden);
    document.addEventListener('visibilitychange', apply);
    apply();
  }

  /* ── Initialize Everything ── */
  function init(){
    initVisibilityPause();
    initDarkMode();
    initNavScroll();
    initHamburger();
    initScrollProgress();
    initBackToTop();
    initReveal();
    initCounters();
    initShimmer();
    initSmoothScroll();
    initTabs();
    initAccordions();
    initActiveNav();
    // Desktop-only features
    if(!isTouch && !prefersReducedMotion){
      initTilt();
      initCursor();
      initMagneticButtons();
    }
    initParallax();
    initPageTransitions();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ============================================
     Security: Console Warning (anti self-XSS)
     ============================================ */
  console.log('%cStop!', 'color:red;font-size:40px;font-weight:bold;text-shadow:1px 1px 2px rgba(0,0,0,0.3)');
  console.log('%cThis is a browser feature intended for developers. If someone told you to copy-paste something here to enable a feature or "hack" an account, it is a scam and will give them access to your information.', 'font-size:14px;color:#475569');
  console.log('%cSee https://en.wikipedia.org/wiki/Self-XSS for more information.', 'font-size:12px;color:#64748b');

})();
