// ===== VA Portfolio – script.js =====
// Drop-in replacement: no changes to index.html or style.css needed.

(function () {
  'use strict';

  // ---- 1. Inject the small amount of CSS these features need ----
  var css = document.createElement('style');
  css.textContent =
    'nav a.l.active{color:#fff;border-bottom:2px solid #E50914}' +
    '.row-wrap{position:relative}' +
    '.arrow{position:absolute;top:0;bottom:22px;width:4vw;min-width:44px;border:0;z-index:3;' +
    'background:rgba(0,0,0,.6);color:#fff;font-size:34px;cursor:pointer;opacity:0;transition:opacity .2s}' +
    '.row-wrap:hover .arrow,.arrow:focus-visible{opacity:1}' +
    '.arrow.prev{left:0}.arrow.next{right:0}.arrow[hidden]{display:none}' +
    '#toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);background:#E50914;color:#fff;' +
    'padding:12px 22px;border-radius:4px;font:600 15px Inter,sans-serif;z-index:30;' +
    'opacity:0;pointer-events:none;transition:opacity .25s}#toast.show{opacity:1}';
  document.head.appendChild(css);

  // ---- 2. "Who's watching?" profile screen ----
  var who = document.getElementById('who');
  var KEY = 'va-profile-seen';

  function closeWho(targetId) {
    if (!who) return;
    who.classList.add('gone');
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    var t = targetId && document.getElementById(targetId);
    if (t) t.scrollIntoView();
  }

  if (who) {
    // Skip the intro if the visitor has already picked a profile this session
    try { if (sessionStorage.getItem(KEY)) who.classList.add('gone'); } catch (e) {}

    who.querySelectorAll('[data-go]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        closeWho(btn.getAttribute('data-go'));
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !who.classList.contains('gone')) closeWho('top');
    });
  }

  // ---- 3. Left/right arrows on every scrolling row ----
  document.querySelectorAll('.row, .top').forEach(function (row) {
    var wrap = document.createElement('div');
    wrap.className = 'row-wrap';
    row.parentNode.insertBefore(wrap, row);
    wrap.appendChild(row);

    function makeBtn(dir, label, symbol) {
      var b = document.createElement('button');
      b.className = 'arrow ' + dir;
      b.setAttribute('aria-label', label);
      b.textContent = symbol;
      b.addEventListener('click', function () {
        var step = row.clientWidth * 0.8 * (dir === 'next' ? 1 : -1);
        row.scrollBy({ left: step, behavior: 'smooth' });
      });
      wrap.appendChild(b);
      return b;
    }

    var prev = makeBtn('prev', 'Scroll left', '‹');
    var next = makeBtn('next', 'Scroll right', '›');

    function update() {
      prev.hidden = row.scrollLeft < 10;
      next.hidden = row.scrollLeft + row.clientWidth >= row.scrollWidth - 10;
    }
    row.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  // ---- 4. Highlight the nav link for the section on screen ----
  var links = document.querySelectorAll('nav a.l');
  if ('IntersectionObserver' in window && links.length) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    links.forEach(function (a) {
      var s = document.querySelector(a.getAttribute('href'));
      if (s) obs.observe(s);
    });
  }

  // ---- 5. Pricing: remember the chosen plan and tell the visitor ----
  var toast = document.createElement('div');
  toast.id = 'toast';
  toast.setAttribute('role', 'status');
  document.body.appendChild(toast);
  var toastTimer;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2600);
  }

  var chosenPlan = '';
  document.querySelectorAll('.plan').forEach(function (plan) {
    var btn = plan.querySelector('a.btn');
    var name = plan.querySelector('h3').textContent;
    if (!btn) return;
    btn.addEventListener('click', function () {
      chosenPlan = name;
      showToast(name + ' plan selected. Say hello below!');
    });
  });

  // ---- 6. Email button: include the chosen plan in the message ----
  var mail = document.querySelector('.contact a[href^="mailto:"]');
  if (mail) {
    var base = mail.getAttribute('href').split('?')[0];
    mail.addEventListener('click', function () {
      var subject = chosenPlan
        ? 'I’m interested in the ' + chosenPlan + ' plan'
        : 'I’d like to work with you';
      mail.setAttribute('href', base + '?subject=' + encodeURIComponent(subject));
    });
  }
})();
