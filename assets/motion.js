/* LGR Tile Installation — motion layer
   Vanilla JS, no dependencies. Every effect is scroll- or pointer-driven and
   is skipped entirely under prefers-reduced-motion, so the page stays usable
   and static when motion is not wanted. */

(function () {
  'use strict';

  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = function () {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  };

  var reduce = motionQuery.matches;

  function clamp(n, min, max) {
    return n < min ? min : n > max ? max : n;
  }

  /* deterministic pseudo-random so a rebuild looks the same */
  function rnd(n) {
    var x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /* ------------------------------------------------------------------
     one scroll loop for every effect
     ------------------------------------------------------------------ */

  var scrollTasks = [];
  var ticking = false;
  var started = false;

  function runTasks() {
    ticking = false;
    for (var i = 0; i < scrollTasks.length; i++) scrollTasks[i]();
  }

  function requestTick() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(runTasks);
  }

  function startLoop() {
    if (started) return;
    started = true;
    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick);
    runTasks();
  }

  /* ------------------------------------------------------------------
     reading progress
     ------------------------------------------------------------------ */

  (function progressBar() {
    if (reduce) return;
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    var fill = document.createElement('span');
    bar.appendChild(fill);
    document.body.appendChild(bar);

    scrollTasks.push(function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var value = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
      fill.style.transform = 'scaleX(' + value.toFixed(4) + ')';
    });
  })();

  /* ------------------------------------------------------------------
     hero parallax — the photo lags the copy as the hero leaves
     ------------------------------------------------------------------ */

  (function heroParallax() {
    if (reduce) return;
    var shot = document.querySelector('.hero-art .shot');
    if (!shot) return;

    scrollTasks.push(function () {
      var y = window.scrollY;
      if (y > window.innerHeight * 1.4) return;
      var k = clamp(y / (window.innerHeight * 0.9), 0, 1);
      shot.style.transform = 'translate3d(0,' + (k * 46).toFixed(1) + 'px,0)';
    });
  })();

  /* ------------------------------------------------------------------
     proof-bar counters — count up to the real figure, once
     ------------------------------------------------------------------ */

  (function counters() {
    var nums = document.querySelectorAll('.proof-num');
    if (!nums.length || reduce || !('IntersectionObserver' in window)) return;

    var items = [];

    Array.prototype.forEach.call(nums, function (el) {
      var first = el.firstChild;
      if (!first || first.nodeType !== 3) return;
      var match = /^\s*([\d]+(?:\.\d+)?)/.exec(first.nodeValue);
      if (!match) return;
      items.push({
        node: first,
        text: first.nodeValue,
        to: parseFloat(match[1]),
        decimals: (match[1].split('.')[1] || '').length,
        done: false
      });
    });
    if (!items.length) return;

    var animate = function (item) {
      var started = performance.now();
      var duration = 1100;
      var step = function (now) {
        var t = clamp((now - started) / duration, 0, 1);
        var value = item.to * easeOutCubic(t);
        var fixed = value.toFixed(item.decimals);
        item.node.nodeValue = item.text.replace(/^(\s*)[\d]+(?:\.\d+)?/, '$1' + fixed);
        if (t < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    };

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          for (var i = 0; i < items.length; i++) {
            if (items[i].node === entry.target.firstChild && !items[i].done) {
              items[i].done = true;
              animate(items[i]);
            }
          }
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );

    Array.prototype.forEach.call(nums, function (el) {
      io.observe(el);
    });
  })();

  /* ------------------------------------------------------------------
     staggered reveals — one delay per child of a known group
     ------------------------------------------------------------------ */

  (function stagger() {
    var groups = [
      ['.cards', 70],
      ['.reviews', 90],
      ['.steps', 90],
      ['.work-grid', 55],
      ['.gallery-grid', 45],
      ['.band-points', 70],
      ['.area-list', 45],
      ['.slabs', 80]
    ];

    groups.forEach(function (group) {
      var parent = document.querySelector(group[0]);
      if (!parent) return;
      Array.prototype.forEach.call(parent.children, function (child, i) {
        if (!child.classList.contains('reveal')) return;
        child.style.setProperty('--reveal-delay', Math.min(i * group[1], 620) + 'ms');
      });
    });
  })();

  /* ------------------------------------------------------------------
     pointer tilt — a few degrees on cards and work photos
     ------------------------------------------------------------------ */

  (function tilt() {
    if (reduce || !finePointer()) return;

    var targets = document.querySelectorAll('.cards .card, .work-grid .shot, .gallery-grid .shot');
    if (!targets.length) return;

    Array.prototype.forEach.call(targets, function (el) {
      var frame = 0;
      el.classList.add('tilt');

      el.addEventListener('pointerenter', function () {
        el.classList.add('is-follow');
      });

      el.addEventListener('pointermove', function (event) {
        if (frame) return;
        frame = window.requestAnimationFrame(function () {
          frame = 0;
          var rect = el.getBoundingClientRect();
          var nx = (event.clientX - rect.left) / rect.width - 0.5;
          var ny = (event.clientY - rect.top) / rect.height - 0.5;
          el.style.transform =
            'perspective(900px) rotateY(' + (nx * 6).toFixed(2) + 'deg) rotateX(' +
            (-ny * 6).toFixed(2) + 'deg) translateY(-4px) scale(1.008)';
        }, event);
      });

      el.addEventListener('pointerleave', function () {
        el.classList.remove('is-follow');
        el.style.transform = '';
      });
    });
  })();

  /* ------------------------------------------------------------------
     the wall scene
     ------------------------------------------------------------------ */

  (function buildScene() {
    var section = document.querySelector('.build');
    if (!section) return;

    var wall = section.querySelector('[data-build-wall]');
    var doneLabel = section.querySelector('.build__done');
    var meter = section.querySelector('.build__meter span');
    var steps = section.querySelectorAll('.build__steps li');
    if (!wall) return;

    if (reduce) {
      section.classList.add('is-static');
      return;
    }

    var tiles = [];
    var cols = 0;
    var rows = 0;

    function makeTiles() {
      var w = wall.clientWidth;
      var h = wall.clientHeight;
      if (!w || !h) return;

      cols = w < 560 ? 6 : 8;
      rows = Math.max(3, Math.round((cols * h) / w));

      wall.style.setProperty('--cols', cols);
      wall.style.setProperty('--rows', rows);
      wall.classList.add('is-live');

      /* remove any previous tiles but keep the fallback plate */
      Array.prototype.forEach.call(wall.querySelectorAll('.build__tile'), function (t) {
        t.parentNode.removeChild(t);
      });

      tiles = [];
      var frag = document.createDocumentFragment();

      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var i = r * cols + c;
          var tile = document.createElement('span');
          tile.className = 'build__tile';
          tile.setAttribute('aria-hidden', 'true');
          tile.style.left = (c * 100) / cols + '%';
          tile.style.top = (r * 100) / rows + '%';
          tile.style.width = 100 / cols + '%';
          tile.style.height = 100 / rows + '%';
          tile.style.backgroundPositionX = (cols > 1 ? (c / (cols - 1)) * 100 : 0) + '%';
          tile.style.backgroundPositionY = (rows > 1 ? (r / (rows - 1)) * 100 : 0) + '%';

          tiles.push({
            node: tile,
            /* courses go in from the bottom up, left to right */
            delay: 0.04 + ((rows - 1 - r) / rows) * 0.5 + (c / cols) * 0.12 + rnd(i) * 0.04,
            dx: (rnd(i * 2 + 1) - 0.5) * w * 0.85,
            dy: h * (0.55 + rnd(i * 2 + 2) * 0.75),
            rot: (rnd(i * 3 + 5) - 0.5) * 26,
            last: -1
          });
          frag.appendChild(tile);
        }
      }

      wall.appendChild(frag);
    }

    function paint(p) {
      for (var i = 0; i < tiles.length; i++) {
        var t = tiles[i];
        var raw = clamp((p - t.delay) / 0.17, 0, 1);
        if (Math.abs(raw - t.last) < 0.004 && raw !== 0 && raw !== 1) continue;
        t.last = raw;
        var e = easeOutCubic(raw);
        var rem = 1 - e;
        t.node.style.transform =
          'translate3d(' + (t.dx * rem).toFixed(1) + 'px,' + (t.dy * rem).toFixed(1) +
          'px,0) rotate(' + (t.rot * rem).toFixed(2) + 'deg) scale(' + (1 + 0.18 * rem).toFixed(3) + ')';
      }

      if (meter) meter.style.width = (p * 100).toFixed(2) + '%';

      var active = p > 0.02 ? 1 : 0;
      if (p > 0.4) active = 2;
      if (p > 0.74) active = 3;
      for (var s = 0; s < steps.length; s++) {
        steps[s].classList.toggle('is-active', s < active);
      }

      var done = p > 0.78;
      if (done !== wall.classList.contains('is-done')) wall.classList.toggle('is-done', done);
      if (doneLabel) doneLabel.classList.toggle('is-on', p > 0.84);
    }

    scrollTasks.push(function () {
      var rect = section.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
      var total = section.offsetHeight - window.innerHeight;
      var p = total > 0 ? clamp(-rect.top / total, 0, 1) : 1;
      paint(p);
    });

    var rebuild = (function () {
      var timer = 0;
      return function () {
        window.clearTimeout(timer);
        timer = window.setTimeout(function () {
          makeTiles();
          requestTick();
        }, 180);
      };
    })();

    makeTiles();

    /* ResizeObserver beats window.resize: it fires once layout has actually
       changed, so phone rotation and the mobile URL bar both rebuild cleanly. */
    if ('ResizeObserver' in window) {
      var lastW = wall.clientWidth;
      new ResizeObserver(function (entries) {
        var w = entries[0].contentRect.width;
        if (Math.abs(w - lastW) < 24) return;
        lastW = w;
        rebuild();
      }).observe(wall);
    } else {
      window.addEventListener('resize', rebuild);
    }

    /* fonts finish loading after first paint — remeasure then */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        if (!tiles.length) makeTiles();
      });
    }
  })();

  /* ------------------------------------------------------------------
     finishes band — parallax + pointer tilt in CSS 3D
     ------------------------------------------------------------------ */

  (function finishes() {
    var group = document.querySelector('[data-slabs]');
    if (!group || reduce) return;

    var depths = [1, 1.35, 0.85, 1.2];
    var bases = [-11, 7, -7, 11];

    Array.prototype.forEach.call(group.children, function (slab, i) {
      slab.style.setProperty('--depth', depths[i % depths.length]);
      slab.style.setProperty('--base', bases[i % bases.length] + 'deg');
    });

    scrollTasks.push(function () {
      var rect = group.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      var offset = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
      group.style.setProperty('--par', clamp(offset * 46, -46, 46).toFixed(1));
    });

    if (!finePointer()) return;

    group.addEventListener('pointermove', function (event) {
      var rect = group.getBoundingClientRect();
      group.style.setProperty('--px', ((event.clientX - rect.left) / rect.width - 0.5).toFixed(3));
      group.style.setProperty('--py', ((event.clientY - rect.top) / rect.height - 0.5).toFixed(3));
    });

    group.addEventListener('pointerleave', function () {
      group.style.setProperty('--px', '0');
      group.style.setProperty('--py', '0');
    });
  })();

  /* ------------------------------------------------------------------ */

  startLoop();
})();
