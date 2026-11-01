/* LGR Tile Installation — site script
   Vanilla JS, no dependencies. Everything degrades to plain HTML. */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     CONFIG
     ------------------------------------------------------------------ */

  // Where quote requests go. Leave empty to fall back to the visitor's
  // mail app (see README). Set to an endpoint that accepts multipart/form-data
  // (fields + photo files): an n8n webhook, Formspree, Getform or a Worker.
  // The form posts there and redirects to /thank-you/ on a 2xx.
  var formEndpoint = 'https://formsubmit.co/thebusinessbrainwave411@gmail.com';

  // 'native' = a normal form post (FormSubmit: emails the fields with the
  // photos attached, then returns to /thank-you/). 'fetch' = post in the
  // background to a JSON/multipart API (n8n, Formspree, Getform, a Worker).
  var formMode = 'native';

  // Real job photos. Drop files into /assets/photos/ and map a slot key here
  // (each .shot in the HTML carries data-photo="key"). Empty = tiled
  // placeholder with its label visible.
  var PHOTOS = {
    'hero-shower': 'shower-gray-plank-wide.webp',
    'work-1': 'floor-sunroom-wide.webp',
    'work-2': 'kitchen-herringbone-43.webp',
    'work-3': 'shower-marble-portrait.webp',
    'work-4': 'bathroom-floor-detail.webp',
    'work-5': 'bathroom-wood-ceiling.webp',
    'work-6': 'shower-gray-niche.webp',
    'work-7': 'kitchen-herringbone-detail.webp',
    'work-8': 'bathroom-accent-wall.webp',
    'work-9': 'shower-subway-stacked.webp',

    'showers-hero': 'shower-gray-plank-wide.webp',
    'showers-waterproof': 'shower-goboard.webp',
    'bathroom-floor': 'bathroom-floor-detail.webp',
    'sb-1': 'shower-marble-portrait.webp',
    'sb-2': 'shower-gray-niche.webp',
    'sb-3': 'shower-gray-plank-43.webp',
    'sb-4': 'bathroom-wood-ceiling.webp',
    'sb-5': 'bathroom-accent-wall.webp',
    'sb-6': 'shower-in-progress.webp',
    'sb-7': 'shower-subway-stacked.webp',
    'sb-8': 'bathroom-demo.webp',

    'backsplash-hero': 'kitchen-herringbone-wide.webp',
    'backsplash-styles': 'kitchen-herringbone-detail.webp',
    'bs-1': 'kitchen-herringbone-white.webp',
    'bs-2': 'kitchen-herringbone-43.webp',
    'bs-3': 'kitchen-herringbone-detail.webp',
    'bs-4': 'kitchen-mosaic-dark.webp',
    'bs-5': 'kitchen-subway-green.webp',
    'bs-6': 'kitchen-mosaic-detail.webp',

    'floors-hero': 'floor-sunroom-wide.webp',
    'fl-1': 'floor-sunroom-wide.webp',
    'fl-2': 'floor-sunroom-43.webp',
    'fl-3': 'bathroom-floor-detail.webp',
    'fl-4': 'bathroom-wood-ceiling.webp',

    'g-01': 'shower-marble-portrait.webp',
    'g-02': 'shower-gray-plank-43.webp',
    'g-03': 'shower-gray-niche.webp',
    'g-04': 'shower-in-progress.webp',
    'g-05': 'bathroom-floor-detail.webp',
    'g-06': 'bathroom-wood-ceiling.webp',
    'g-07': 'bathroom-accent-wall.webp',
    'g-08': 'kitchen-herringbone-43.webp',
    'g-09': 'kitchen-herringbone-detail.webp',
    'g-10': 'kitchen-mosaic-detail.webp',
    'g-11': 'floor-sunroom-wide.webp',
    'g-12': 'floor-sunroom-43.webp',
    'g-13': 'shower-subway-stacked.webp',
    'g-14': 'shower-goboard.webp',
    'g-15': 'bathroom-demo.webp',
    'g-16': 'kitchen-herringbone-white.webp',
    'g-17': 'kitchen-mosaic-dark.webp',
    'g-18': 'kitchen-subway-green.webp'
  };

  var CONTACT = {
    phone: '4074352706',
    email: 'serviceslgrtile@gmail.com',
    thanksUrl: '/thank-you/'
  };

  /* ------------------------------------------------------------------
     helpers
     ------------------------------------------------------------------ */

  function track(event, params) {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', event, params || {});
      } else if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push(Object.assign({ event: event }, params || {}));
      }
    } catch (err) {
      /* analytics must never break the page */
    }
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     header: scrolled state + mobile nav
     ------------------------------------------------------------------ */

  var header = document.querySelector('.site-header');
  var navToggle = document.querySelector('.nav-toggle');

  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function setNav(open) {
    if (!header || !navToggle) return;
    header.classList.toggle('nav-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('nav-open', open);
  }

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      setNav(!header.classList.contains('nav-open'));
    });

    header.addEventListener('click', function (event) {
      if (event.target.closest('.nav a')) setNav(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && header.classList.contains('nav-open')) {
        setNav(false);
        navToggle.focus();
      }
    });

    var mq = window.matchMedia('(min-width: 901px)');
    var onMq = function (e) {
      if (e.matches) setNav(false);
    };
    if (mq.addEventListener) mq.addEventListener('change', onMq);
    else if (mq.addListener) mq.addListener(onMq);
  }

  /* ------------------------------------------------------------------
     scroll reveal
     ------------------------------------------------------------------ */

  var reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) {
    /* nothing to do */
  } else if (reduceMotion || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(reveals, function (el) {
      el.classList.add('is-in');
    });
  } else {
    var revealed = 0;
    var show = function (el) {
      if (el.classList.contains('is-in')) return;
      el.classList.add('is-in');
      revealed++;
    };

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            show(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    Array.prototype.forEach.call(reveals, function (el) {
      io.observe(el);
    });

    /* Safety net: in a view that never paints (some embeds, print preview)
       the observer stays silent. If nothing has revealed after the first
       scroll, fall back to measuring positions directly. */
    var fallback = function () {
      if (revealed > 0) {
        window.removeEventListener('scroll', fallback);
        return;
      }
      var vh = window.innerHeight || 800;
      Array.prototype.forEach.call(reveals, function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < vh * 0.94 && rect.bottom > 0) show(el);
      });
    };
    window.addEventListener('scroll', fallback, { passive: true });
  }

  /* ------------------------------------------------------------------
     photo slots
     ------------------------------------------------------------------ */

  Object.keys(PHOTOS).forEach(function (key) {
    var src = PHOTOS[key];
    if (!src) return;
    var nodes = document.querySelectorAll('[data-photo="' + key + '"]');
    Array.prototype.forEach.call(nodes, function (slot) {
      /* Slots pre-rendered in the HTML already hold their photo. */
      if (slot.querySelector('img.photo')) return;
      var img = document.createElement('img');
      img.className = 'photo';
      img.alt = slot.getAttribute('data-alt') || '';
      img.loading = slot.closest('.hero') ? 'eager' : 'lazy';
      img.decoding = 'async';
      img.addEventListener('load', function () {
        slot.classList.add('has-photo');
      });
      img.src = src.charAt(0) === '/' ? src : '/assets/photos/' + src;
      slot.appendChild(img);
    });
  });

  /* ------------------------------------------------------------------
     gallery filters
     ------------------------------------------------------------------ */

  var filterBar = document.querySelector('[data-filters]');
  if (filterBar) {
    var buttons = filterBar.querySelectorAll('.filter-btn');
    var items = document.querySelectorAll('[data-tags]');
    var empty = document.querySelector('.gallery-empty');

    Array.prototype.forEach.call(buttons, function (btn) {
      var filter = btn.getAttribute('data-filter');
      var count = 0;
      Array.prototype.forEach.call(items, function (item) {
        var tags = (item.getAttribute('data-tags') || '').split(/\s+/);
        if (filter === 'all' || tags.indexOf(filter) !== -1) count++;
      });
      var badge = btn.querySelector('.filter-count');
      if (badge) badge.textContent = count;
    });

    filterBar.addEventListener('click', function (event) {
      var btn = event.target.closest('.filter-btn');
      if (!btn) return;
      var filter = btn.getAttribute('data-filter');
      var shown = 0;

      Array.prototype.forEach.call(buttons, function (b) {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });

      Array.prototype.forEach.call(items, function (item) {
        var tags = (item.getAttribute('data-tags') || '').split(/\s+/);
        var match = filter === 'all' || tags.indexOf(filter) !== -1;
        item.hidden = !match;
        if (match) shown++;
      });

      if (empty) empty.hidden = shown !== 0;
      track('gallery_filter', { filter: filter });

      var grid = document.querySelector('.gallery-grid');
      if (grid) grid.setAttribute('aria-live', 'polite');
    });
  }

  /* ------------------------------------------------------------------
     quote form
     ------------------------------------------------------------------ */

  var form = document.querySelector('[data-quote-form]');
  if (form) {
    var status = form.querySelector('.form-status');
    var fileInput = form.querySelector('input[type="file"]');
    var fileList = form.querySelector('.file-list');

    if (fileInput && fileList) {
      fileInput.addEventListener('change', function () {
        var files = fileInput.files;
        if (!files || !files.length) {
          fileList.textContent = '';
          return;
        }
        var names = Array.prototype.map.call(files, function (f) {
          return f.name;
        });
        fileList.textContent =
          files.length + (files.length === 1 ? ' photo selected: ' : ' photos selected: ') + names.join(', ');
      });
    }

    function setStatus(state, html) {
      if (!status) return;
      status.setAttribute('data-state', state);
      status.innerHTML = html;
    }

    function fieldError(field, message) {
      var wrap = field.closest('.field');
      if (!wrap) return;
      var slot = wrap.querySelector('.field-error');
      if (slot) slot.textContent = message || '';
      if (message) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
    }

    function validate() {
      var problems = 0;
      var firstBad = null;

      var name = form.elements.name;
      if (!name.value.trim() || name.value.trim().length < 2) {
        fieldError(name, 'Please add your name.');
        problems++;
        firstBad = firstBad || name;
      } else {
        fieldError(name, '');
      }

      var phone = form.elements.phone;
      var digits = (phone.value || '').replace(/\D/g, '');
      if (digits.length < 10) {
        fieldError(phone, 'Add a 10-digit phone number so we can text you.');
        problems++;
        firstBad = firstBad || phone;
      } else {
        fieldError(phone, '');
      }

      var zip = form.elements.zip;
      if (!/^\d{5}$/.test((zip.value || '').trim())) {
        fieldError(zip, 'Use the 5-digit ZIP for the job.');
        problems++;
        firstBad = firstBad || zip;
      } else {
        fieldError(zip, '');
      }

      var jobType = form.elements.jobType;
      if (!jobType.value) {
        fieldError(jobType, 'Pick the job type.');
        problems++;
        firstBad = firstBad || jobType;
      } else {
        fieldError(jobType, '');
      }

      var tileChoice = form.querySelector('input[name="haveTile"]:checked');
      if (!tileChoice) {
        var tileGroup = form.querySelector('[data-group="haveTile"] .field-error');
        if (tileGroup) tileGroup.textContent = 'Tell us if you already have the tile.';
        problems++;
      } else {
        var tileGroupErr = form.querySelector('[data-group="haveTile"] .field-error');
        if (tileGroupErr) tileGroupErr.textContent = '';
      }

      var email = form.elements.email;
      if (email && email.value.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email.value.trim())) {
        fieldError(email, 'That email looks incomplete.');
        problems++;
        firstBad = firstBad || email;
      } else if (email) {
        fieldError(email, '');
      }

      if (firstBad) firstBad.focus();
      return problems === 0;
    }

    function readForm() {
      var data = new FormData(form);
      var out = {};
      data.forEach(function (value, key) {
        if (key === 'company_website') return;
        if (Object.prototype.hasOwnProperty.call(out, key)) {
          out[key] = String(out[key]) + ', ' + value;
        } else {
          out[key] = value;
        }
      });
      return out;
    }

    function mailtoBody(values) {
      var rows = [
        ['Name', values.name],
        ['Phone', values.phone],
        ['ZIP', values.zip],
        ['Job type', values.jobType],
        ['Rough size', values.size],
        ['Has tile', values.haveTile],
        ['Timing', values.timing],
        ['Email', values.email],
        ['Notes', values.message]
      ];
      var lines = [];
      rows.forEach(function (row) {
        if (row[1] && String(row[1]).trim()) lines.push(row[0] + ': ' + row[1]);
      });
      lines.push('');
      lines.push('(Photos: please attach the phone photos to this email, or text them to ' + CONTACT.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') + '.)');
      return lines.join('\n');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (form.elements.company_website && form.elements.company_website.value) {
        return; /* bot */
      }

      if (!validate()) {
        setStatus('error', 'A couple of fields need another look. Check the notes in red.');
        return;
      }

      var values = readForm();
      var jobLabel = values.jobType || 'tile job';
      track('quote_request', { job_type: jobLabel, has_tile: values.haveTile || '' });

      var button = form.querySelector('button[type="submit"]');
      var originalLabel = button ? button.innerHTML : '';

      if (!formEndpoint) {
        var subject = 'Tile quote request — ' + jobLabel + ' — ' + (values.zip || '');
        var href =
          'mailto:' + CONTACT.email +
          '?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(mailtoBody(values));
        window.location.href = href;
        setStatus(
          'info',
          'Your email app is opening with the job details filled in. Attach the photos there and hit send — or text photos to ' +
            '<a href="sms:+1' + CONTACT.phone + '">(407) 435-2706</a>. ' +
            'Nothing sent yet? Email <a href="mailto:' + CONTACT.email + '">' + CONTACT.email + '</a> directly.'
        );
        return;
      }

      if (button) {
        button.disabled = true;
        button.textContent = 'Sending…';
      }

      if (formMode === 'native') {
        var hidden = {
          _subject: 'New tile quote request: ' + jobLabel + (values.zip ? ' (' + values.zip + ')' : ''),
          _next: window.location.origin + CONTACT.thanksUrl,
          _captcha: 'false',
          _template: 'table'
        };
        Object.keys(hidden).forEach(function (name) {
          var input = form.querySelector('input[type="hidden"][name="' + name + '"]');
          if (!input) {
            input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            form.appendChild(input);
          }
          input.value = hidden[name];
        });
        if (values.email) {
          var replyTo = form.querySelector('input[type="hidden"][name="_replyto"]');
          if (!replyTo) {
            replyTo = document.createElement('input');
            replyTo.type = 'hidden';
            replyTo.name = '_replyto';
            form.appendChild(replyTo);
          }
          replyTo.value = values.email;
        }
        var trap = form.elements.company_website;
        if (trap && trap.parentNode) trap.parentNode.removeChild(trap);
        form.action = formEndpoint;
        form.method = 'POST';
        form.enctype = 'multipart/form-data';
        HTMLFormElement.prototype.submit.call(form);
        return;
      }

      var payload = new FormData(form);
      payload.delete('company_website');

      fetch(formEndpoint, {
        method: 'POST',
        body: payload,
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Request failed: ' + res.status);
          return res;
        })
        .then(function () {
          window.location.href = CONTACT.thanksUrl;
        })
        .catch(function () {
          if (button) {
            button.disabled = false;
            button.innerHTML = originalLabel;
          }
          var sms =
            'sms:+1' + CONTACT.phone + '?&body=' + encodeURIComponent(mailtoBody(values));
          setStatus(
            'error',
            'That didn\'t go through. Text the details to <a href="' + sms + '">(407) 435-2706</a> or call <a href="tel:+1' +
              CONTACT.phone + '">(407) 435-2706</a> and we\'ll pick it up from there.'
          );
        });
    });

    /* clear an error as soon as the field is edited */
    form.addEventListener('input', function (event) {
      var field = event.target;
      if (field.closest && field.closest('.field') && field.getAttribute('aria-invalid') === 'true') {
        fieldError(field, '');
      }
    });
  }

  /* ------------------------------------------------------------------
     misc
     ------------------------------------------------------------------ */

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* phone / text / quote clicks, for conversion tracking later */
  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href^="tel:"], a[href^="sms:"]');
    if (!link) return;
    track(link.getAttribute('href').indexOf('sms:') === 0 ? 'text_click' : 'call_click', {
      location: link.getAttribute('data-loc') || 'page'
    });
  });
})();
