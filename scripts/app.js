/* app.js — site-wide interactive layer for the Crew Health Hub.
   - Help Now button + crisis-lines dialog (every page)
   - Progress store (briefs read, quizzes aced, tools used) in localStorage
   - Readiness badges, toasts, and a small confetti burst
   - Read/aced chips on the Health Topics cards and the home dashboard
   Everything degrades gracefully: if storage is blocked, the page still works. */
(function () {
  'use strict';

  var STORE_KEY = 'frr-progress-v1';
  var BRIEFS = ['winter-skin', 'shaving', 'wound-care', 'foot-care', 'fatigue', 'seasickness'];
  var TOOLS = ['caffeine', 'nap', 'windchill', 'humidex', 'hydration', 'drinks'];

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Storage (always wrapped: private mode can throw) ── */
  function emptyState() {
    return { read: {}, quiz: {}, tools: {}, challenge: { best: 0, total: 0 }, lifelines: false, badges: {} };
  }

  function load() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return emptyState();
      var data = JSON.parse(raw);
      var base = emptyState();
      Object.keys(base).forEach(function (k) { if (data[k] === undefined) data[k] = base[k]; });
      return data;
    } catch (e) {
      return emptyState();
    }
  }

  var state = load();

  function save() {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
  }

  /* ── Badges ── */
  var BADGES = [
    { id: 'first-brief', icon: '📖', name: 'First Watch', desc: 'Finish your first health brief',
      test: function (s) { return Object.keys(s.read).length >= 1; } },
    { id: 'all-briefs', icon: '📚', name: 'Well Briefed', desc: 'Finish all 6 health briefs',
      test: function (s) { return BRIEFS.every(function (b) { return s.read[b]; }); } },
    { id: 'first-ace', icon: '🧠', name: 'Sharp Mind', desc: 'Get a perfect score on any Knowledge Check',
      test: function (s) { return Object.keys(s.quiz).some(function (k) { return s.quiz[k].aced; }); } },
    { id: 'all-aced', icon: '🏆', name: 'Quiz Ace', desc: 'Ace all 6 brief Knowledge Checks',
      test: function (s) { return BRIEFS.every(function (b) { return s.quiz[b] && s.quiz[b].aced; }); } },
    { id: 'toolkit', icon: '🧰', name: 'Toolbox Talk', desc: 'Try 3 tools in the Health Toolkit',
      test: function (s) { return Object.keys(s.tools).length >= 3; } },
    { id: 'lifelines', icon: '🆘', name: 'Know Your Lifelines', desc: 'Open the Help Now panel',
      test: function (s) { return !!s.lifelines; } },
    { id: 'challenge', icon: '⚓', name: 'Crew Champion', desc: 'Score 8/10 or better on the Crew Health Challenge',
      test: function (s) { return s.challenge.best >= 8; } }
  ];

  function checkBadges(silent) {
    var earnedNow = [];
    BADGES.forEach(function (b) {
      if (!state.badges[b.id] && b.test(state)) {
        state.badges[b.id] = Date.now();
        earnedNow.push(b);
      }
    });
    if (earnedNow.length) {
      save();
      if (!silent) {
        earnedNow.forEach(function (b, i) {
          setTimeout(function () { toast(b.icon + ' Badge earned: ' + b.name, 'badge'); }, 350 * i);
        });
        confetti();
      }
    }
    return earnedNow;
  }

  /* ── Toasts ── */
  var toastRegion;
  function toast(message, kind) {
    if (!toastRegion) {
      toastRegion = document.createElement('div');
      toastRegion.className = 'toast-region';
      toastRegion.setAttribute('role', 'status');
      toastRegion.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastRegion);
    }
    var t = document.createElement('div');
    t.className = 'toast' + (kind ? ' toast-' + kind : '');
    t.textContent = message;
    toastRegion.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('show'); });
    setTimeout(function () {
      t.classList.remove('show');
      setTimeout(function () { t.remove(); }, 400);
    }, 3600);
  }

  /* ── Confetti (CSS-only pieces, skipped for reduced motion) ── */
  function confetti() {
    if (reduceMotion) return;
    var colors = ['#c9a227', '#2563eb', '#dc2626', '#16a34a', '#e8c84a', '#7c3aed'];
    var layer = document.createElement('div');
    layer.className = 'confetti-layer';
    layer.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 70; i++) {
      var p = document.createElement('span');
      p.className = 'confetti-piece';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * 0.4) + 's';
      p.style.animationDuration = (1.8 + Math.random() * 1.4) + 's';
      p.style.setProperty('--drift', (Math.random() * 160 - 80) + 'px');
      p.style.setProperty('--spin', (Math.random() * 720 - 360) + 'deg');
      layer.appendChild(p);
    }
    document.body.appendChild(layer);
    setTimeout(function () { layer.remove(); }, 3600);
  }

  /* ── Public API used by quiz.js and toolkit.js ── */
  var FRR = {
    BRIEFS: BRIEFS,
    TOOLS: TOOLS,
    BADGES: BADGES,
    state: function () { return state; },
    toast: toast,
    confetti: confetti,
    markRead: function (id) {
      if (!id || state.read[id]) return;
      state.read[id] = Date.now();
      save();
      toast('✅ Brief complete — nice work!', 'success');
      checkBadges();
      refreshWidgets();
    },
    recordQuiz: function (id, score, total) {
      var prev = state.quiz[id] || { best: 0, total: total, aced: false };
      prev.best = Math.max(prev.best, score);
      prev.total = total;
      prev.aced = prev.aced || score === total;
      state.quiz[id] = prev;
      save();
      if (BRIEFS.indexOf(id) !== -1 && !state.read[id]) {
        FRR.markRead(id);
      }
      checkBadges();
      refreshWidgets();
    },
    recordTool: function (id) {
      if (state.tools[id]) return;
      state.tools[id] = Date.now();
      save();
      checkBadges();
    },
    recordChallenge: function (score, total) {
      state.challenge.best = Math.max(state.challenge.best || 0, score);
      state.challenge.total = total;
      save();
      checkBadges();
      refreshWidgets();
    },
    reset: function () {
      state = emptyState();
      save();
      refreshWidgets();
    }
  };
  window.FRR = FRR;

  /* ── Help Now dialog ── */
  var HELP_LINES = [
    { icon: '🚨', title: 'Medical emergency', detail: 'On board: raise the alarm and call the bridge/OOW for a medical emergency. Ashore: call 911.', links: [{ label: 'Call 911', href: 'tel:911', urgent: true }] },
    { icon: '💬', title: '9-8-8 Suicide Crisis Helpline', detail: 'Call or text, 24/7, English or French.', links: [{ label: 'Call 988', href: 'tel:988', urgent: true }, { label: 'Text 988', href: 'sms:988' }] },
    { icon: '🤝', title: 'CF Member Assistance Program (CFMAP)', detail: 'Free, confidential counselling for members and families, 24/7.', links: [{ label: '1-800-268-7708', href: 'tel:+18002687708' }] },
    { icon: '🧠', title: 'NS Mental Health & Addictions Crisis Line', detail: 'Crisis support and referrals, 24/7.', links: [{ label: '1-888-429-8167', href: 'tel:+18884298167' }] },
    { icon: '🛡️', title: 'DCSRC — sexual misconduct & racism', detail: 'Confidential support outside the chain of command, 24/7.', links: [{ label: '1-844-750-1648', href: 'tel:+18447501648' }] },
    { icon: '🩺', title: 'After-hours primary care (CFHS Halifax duty)', detail: 'Evenings and weekends when ashore in Halifax.', links: [{ label: '902-402-6832', href: 'tel:+19024026832' }] },
    { icon: '☎️', title: '811 Nova Scotia', detail: 'Free registered-nurse advice, 24/7.', links: [{ label: 'Call 811', href: 'tel:811' }] },
    { icon: '☠️', title: 'IWK Poison Centre', detail: 'Poisoning or overdose questions, 24/7.', links: [{ label: '1-800-565-8161', href: 'tel:+18005658161' }] }
  ];

  function buildHelpNow() {
    if (document.querySelector('.help-fab')) return;

    var fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'help-fab';
    fab.setAttribute('aria-haspopup', 'dialog');
    fab.innerHTML = '<span aria-hidden="true">🆘</span><span class="help-fab-label">Help now</span>';

    var dialog = document.createElement('dialog');
    dialog.className = 'help-dialog';
    dialog.setAttribute('aria-labelledby', 'help-dialog-title');

    var items = HELP_LINES.map(function (line) {
      var links = line.links.map(function (l) {
        return '<a class="help-call' + (l.urgent ? ' urgent' : '') + '" href="' + l.href + '">' + l.label + '</a>';
      }).join('');
      return '<li class="help-line"><span class="help-line-icon" aria-hidden="true">' + line.icon + '</span>' +
        '<div class="help-line-body"><strong>' + line.title + '</strong><span>' + line.detail + '</span></div>' +
        '<div class="help-line-actions">' + links + '</div></li>';
    }).join('');

    dialog.innerHTML =
      '<div class="help-dialog-head">' +
        '<h2 id="help-dialog-title">Help is one call away</h2>' +
        '<button type="button" class="help-close" aria-label="Close">✕</button>' +
      '</div>' +
      '<p class="help-dialog-sub">You are not alone. Every line below is free and confidential. <strong>If life is at risk, call 911 or raise the alarm on board now.</strong></p>' +
      '<ul class="help-lines">' + items + '</ul>' +
      '<p class="help-dialog-foot"><a href="contacts.html">All contacts →</a> &nbsp;·&nbsp; <a href="support.html">Support resources →</a></p>';

    document.body.appendChild(fab);
    document.body.appendChild(dialog);

    function open() {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      if (!state.lifelines) {
        state.lifelines = true;
        save();
        checkBadges();
        refreshWidgets();
      }
    }
    function close() {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
      fab.focus();
    }

    fab.addEventListener('click', open);
    dialog.querySelector('.help-close').addEventListener('click', close);
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) close();
    });
    document.querySelectorAll('[data-help-now]').forEach(function (btn) {
      btn.addEventListener('click', function (e) { e.preventDefault(); open(); });
    });
  }

  /* ── Brief completion: opening every section counts as reading it ── */
  function trackBrief() {
    var root = document.querySelector('[data-brief]');
    if (!root) return;
    var id = root.getAttribute('data-brief');
    var details = Array.prototype.slice.call(root.querySelectorAll('details[data-accordion-item]'));
    if (!details.length) return;

    var badge = document.createElement('div');
    badge.className = 'brief-status';
    var controls = document.querySelector('.brief-controls .control-row');
    if (controls) controls.appendChild(badge);

    function paint() {
      var s = state;
      var parts = [];
      if (s.read[id]) parts.push('<span class="chip chip-read">✓ Read</span>');
      if (s.quiz[id] && s.quiz[id].aced) parts.push('<span class="chip chip-aced">🏆 Aced</span>');
      badge.innerHTML = parts.join('');
    }
    paint();
    document.addEventListener('frr:refresh', paint);

    function check() {
      if (details.every(function (d) { return d.open; })) FRR.markRead(id);
    }
    details.forEach(function (d) { d.addEventListener('toggle', check); });
  }

  /* ── Status chips on topic cards ── */
  function paintTopicCards() {
    document.querySelectorAll('[data-brief-card]').forEach(function (card) {
      var id = card.getAttribute('data-brief-card');
      var meta = card.querySelector('.card-meta');
      if (!meta) return;
      var holder = meta.querySelector('.card-status');
      if (!holder) {
        holder = document.createElement('span');
        holder.className = 'card-status';
        meta.appendChild(holder);
      }
      var html = '';
      if (state.read[id]) html += '<span class="chip chip-read">✓ Read</span>';
      if (state.quiz[id] && state.quiz[id].aced) html += '<span class="chip chip-aced">🏆 Aced</span>';
      holder.innerHTML = html;
    });

    var summary = document.querySelector('[data-topics-progress]');
    if (summary) {
      var read = BRIEFS.filter(function (b) { return state.read[b]; }).length;
      summary.textContent = read === BRIEFS.length
        ? 'All 6 briefs read — outstanding! Now try the Crew Health Challenge.'
        : 'You have read ' + read + ' of ' + BRIEFS.length + ' briefs.';
    }
  }

  /* ── Home dashboard ── */
  function paintDashboard() {
    var dash = document.querySelector('[data-readiness]');
    if (!dash) return;

    var earned = BADGES.filter(function (b) { return state.badges[b.id]; }).length;
    var pct = Math.round((earned / BADGES.length) * 100);
    var read = BRIEFS.filter(function (b) { return state.read[b]; }).length;
    var aced = BRIEFS.filter(function (b) { return state.quiz[b] && state.quiz[b].aced; }).length;
    var best = state.challenge.best || 0;

    var ring = dash.querySelector('[data-ring]');
    if (ring) ring.style.setProperty('--pct', pct);
    var pctNode = dash.querySelector('[data-ring-value]');
    if (pctNode) pctNode.textContent = pct + '%';
    var ringWrap = dash.querySelector('[data-ring-wrap]');
    if (ringWrap) ringWrap.setAttribute('aria-label', 'Readiness ' + pct + ' percent: ' + earned + ' of ' + BADGES.length + ' badges earned');

    var stats = dash.querySelector('[data-stats]');
    if (stats) {
      stats.innerHTML =
        '<li><strong>' + read + '/6</strong><span>Briefs read</span></li>' +
        '<li><strong>' + aced + '/6</strong><span>Quizzes aced</span></li>' +
        '<li><strong>' + (best ? best + '/10' : '—') + '</strong><span>Best challenge</span></li>';
    }

    var grid = dash.querySelector('[data-badges]');
    if (grid) {
      grid.innerHTML = BADGES.map(function (b) {
        var got = !!state.badges[b.id];
        return '<li class="badge-tile' + (got ? ' earned' : '') + '">' +
          '<span class="badge-icon" aria-hidden="true">' + (got ? b.icon : '🔒') + '</span>' +
          '<span class="badge-name">' + b.name + '</span>' +
          '<span class="badge-desc">' + b.desc + '</span>' +
          '<span class="visually-hidden">' + (got ? 'Earned' : 'Not yet earned') + '</span>' +
        '</li>';
      }).join('');
    }

    var next = dash.querySelector('[data-next-step]');
    if (next) {
      var nextBrief = BRIEFS.filter(function (b) { return !state.read[b]; })[0];
      var msg;
      if (nextBrief) {
        var q = window.FRR_QUIZ && window.FRR_QUIZ[nextBrief];
        msg = 'Next up: <a href="' + nextBrief + '.html">' + (q ? q.icon + ' ' + q.title : nextBrief) + '</a>. Open every section, then take the Knowledge Check.';
      } else if (aced < BRIEFS.length) {
        msg = 'All briefs read! Go back and ace the remaining Knowledge Checks.';
      } else if (best < 8) {
        msg = 'Ready for the big one? <a href="challenge.html">Take the Crew Health Challenge</a>.';
      } else {
        msg = 'Bravo Zulu! 🎉 You are a Crew Health Champion. Pass it on to your shipmates.';
      }
      next.innerHTML = msg;
    }
  }

  function refreshWidgets() {
    paintTopicCards();
    paintDashboard();
    document.dispatchEvent(new CustomEvent('frr:refresh'));
  }

  function initReset() {
    var btn = document.querySelector('[data-reset-progress]');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (window.confirm('Reset all your badges and progress on this device?')) {
        FRR.reset();
        toast('Progress reset. Fresh start!');
      }
    });
  }

  function init() {
    buildHelpNow();
    trackBrief();
    checkBadges(true);
    refreshWidgets();
    initReset();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
