/* ============================================================
   Manlai — Ulaanbaatar to Seoul
   All interactivity: language switching (EN/MN) + scroll animation
   ============================================================ */

const STORAGE_KEY = 'site-lang';
let translations = null;
let currentLang = localStorage.getItem(STORAGE_KEY) || 'en';

/* ---------- Load translations.json, then boot everything ---------- */
fetch('translations.json')
  .then(res => {
    if (!res.ok) throw new Error('translations.json failed to load: ' + res.status);
    return res.json();
  })
  .then(data => {
    translations = data;
    applyLanguage(currentLang);
    initInteractivity();
  })
  .catch(err => {
    console.error(err);
    // Fail safe: still boot interactivity even if translations didn't load,
    // so the page isn't stuck behind the preloader.
    initInteractivity();
  });

/* ---------- Apply a language to every tagged element ---------- */
function applyLanguage(lang) {
  if (!translations || !translations[lang]) return;
  const dict = translations[lang];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) el.textContent = dict[key];
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (dict[key] !== undefined) el.innerHTML = dict[key];
  });

  document.documentElement.setAttribute('lang', lang === 'mn' ? 'mn' : 'en');
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
}

function toggleLanguage() {
  applyLanguage(currentLang === 'en' ? 'mn' : 'en');
}

/* ---------- Everything else: preloader, cursor, scroll effects ---------- */
function initInteractivity() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.registerPlugin(ScrollTrigger);

  document.getElementById('langToggle')?.addEventListener('click', toggleLanguage);

  // ---------- Preloader ----------
  const bootPreloader = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        document.body.classList.remove('loading');
        ScrollTrigger.refresh();
      }
    });
    tl.to('#plFill', { width: '100%', duration: reduceMotion ? 0.1 : 1.1, ease: 'power2.inOut' })
      .to('#preloader', { yPercent: -100, duration: reduceMotion ? 0.1 : 0.9, ease: 'power3.inOut' }, '-=0.15');
  };
  if (document.readyState === 'complete') {
    bootPreloader();
  } else {
    window.addEventListener('load', bootPreloader);
  }

  // ---------- Top scroll progress ----------
  gsap.to('#progressFill', {
    width: '100%',
    ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 }
  });

  // ---------- Custom cursor ----------
  if (!reduceMotion && window.matchMedia('(hover:hover)').matches) {
    const cursor = document.getElementById('cursor');
    window.addEventListener('mousemove', e => {
      gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.35, ease: 'power3.out' });
    });
    document.querySelectorAll('a, button, .dot, .accordion-item').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
    });
    document.querySelectorAll('.cta, #rail .dot').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const relX = e.clientX - (r.left + r.width / 2);
        const relY = e.clientY - (r.top + r.height / 2);
        gsap.to(el, { x: relX * 0.3, y: relY * 0.3, duration: 0.4, ease: 'power3.out' });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.4)' });
      });
    });
  }

  // ---------- Scroll reveals ----------
  document.querySelectorAll('section, footer').forEach(section => {
    const items = section.querySelectorAll('.reveal');
    if (!items.length) return;
    gsap.to(items, {
      opacity: 1, y: 0,
      duration: 0.9, ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: { trigger: section, start: 'top 78%' }
    });
  });

  // ---------- Hero route line ----------
  gsap.to('.route-path', {
    strokeDashoffset: 0,
    ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
  });
  gsap.to('#hero .route', {
    yPercent: reduceMotion ? 0 : -12,
    ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  // ---------- Stage timeline highlight ----------
  gsap.utils.toArray('.stage').forEach(stage => {
    ScrollTrigger.create({
      trigger: stage,
      start: 'top 65%',
      end: 'bottom 35%',
      onEnter: () => gsap.to(stage.querySelector('.num'), { scale: 1.15, duration: 0.3, ease: 'power2.out' }),
      onLeave: () => gsap.to(stage.querySelector('.num'), { scale: 1, duration: 0.3 }),
      onEnterBack: () => gsap.to(stage.querySelector('.num'), { scale: 1.15, duration: 0.3 }),
      onLeaveBack: () => gsap.to(stage.querySelector('.num'), { scale: 1, duration: 0.3 })
    });
  });

  // ---------- Animated stat counters ----------
  document.querySelectorAll('.count').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    const prefix = el.dataset.prefix || '';
    const counter = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          val: target, duration: 1.4, ease: 'power2.out',
          onUpdate: () => { el.textContent = prefix + Math.round(counter.val); }
        });
      }
    });
  });

  // ---------- Rail: active dot + click-to-scroll ----------
  const sectionIds = ['hero', 'video', 'journey', 'skku', 'learned'];
  const sections = sectionIds.map(id => document.getElementById(id));
  const dots = document.querySelectorAll('#rail .dot');
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const target = document.getElementById(dot.dataset.target);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
  sections.forEach(sec => {
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: self => {
        if (self.isActive) {
          dots.forEach(d => d.classList.remove('active'));
          document.querySelector(`#rail .dot[data-target="${sec.id}"]`)?.classList.add('active');
        }
      }
    });
  });

  // ---------- Accordion ----------
  document.querySelectorAll('.accordion-item button').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
}
