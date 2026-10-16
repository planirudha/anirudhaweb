(function () {
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');

  // ---------- Theme toggle ----------
  var themeBtn = document.getElementById('themeToggle');
  function currentTheme() {
    if (root.dataset.theme) return root.dataset.theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // ---------- Mobile menu ----------
  var menuBtn = document.getElementById('menuBtn');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    if (!menu || !menuBtn) return;
    menu.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  // ---------- Reveal on scroll (with light stagger) ----------
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var seen = new Map();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var parent = el.parentElement;
        var i = seen.get(parent) || 0;
        el.style.setProperty('--d', Math.min(i * 0.08, 0.32) + 's');
        seen.set(parent, i + 1);
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  // ---------- Share on LinkedIn (blog posts) ----------
  document.querySelectorAll('[data-share="linkedin"]').forEach(function (a) {
    a.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(location.href);
  });

  // ---------- Scroll-linked: progress bar, nav border, active link, timeline ----------
  var nav = document.querySelector('.nav');
  var bar = document.querySelector('.progress span');
  // Only in-page links (#section) take part in active-section highlighting
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__links a[href^="#"]'));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var timeline = document.getElementById('timeline');
  var tlFill = timeline && timeline.querySelector('.tl__line span');
  var tlItems = timeline ? timeline.querySelectorAll('.tl__item') : [];
  var ticking = false;

  function update() {
    ticking = false;
    var y = window.scrollY;
    var vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;

    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    if (nav) nav.classList.toggle('is-scrolled', y > 8);

    if (links.length) {
      // Active nav link: last section whose top is above 40% of viewport
      var active = -1;
      sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < vh * 0.4) active = i; });
      if (y + vh >= document.documentElement.scrollHeight - 4) active = sections.length - 1;
      links.forEach(function (a, i) {
        a.classList.toggle('is-active', i === active);
        if (i === active) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    }

    if (timeline) {
      // Timeline fill follows a marker at 60% of the viewport
      var r = timeline.getBoundingClientRect();
      var marker = vh * 0.6;
      var p = Math.max(0, Math.min(1, (marker - r.top) / r.height));
      tlFill.style.transform = 'scaleY(' + p + ')';
      tlItems.forEach(function (item) {
        item.classList.toggle('is-passed', item.getBoundingClientRect().top + 30 < marker);
      });
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  // ---------- Footer year ----------
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
