/* toolkit.js — interactive tools on toolkit.html.
   Sources:
   - Caffeine: Health Canada (≈400 mg/day for most healthy adults); typical
     half-life ≈ 5 h (varies ~3–7 h between people).
   - Wind chill: Environment and Climate Change Canada wind chill index and
     frostbite-risk bands.
   - Humidex: Environment and Climate Change Canada formula and comfort ranges.
   - Standard drink: Canada's Guidance on Alcohol and Health (CCSA, 2023),
     1 standard drink = 17.05 mL (13.45 g) of pure alcohol. */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function used(id) { if (window.FRR) window.FRR.recordTool(id); }

  function esc(text) {
    var d = document.createElement('div');
    d.textContent = String(text);
    return d.innerHTML;
  }

  function storeGet(key) {
    try { return JSON.parse(window.localStorage.getItem(key) || 'null'); } catch (e) { return null; }
  }
  function storeSet(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function toMinutes(hhmm) {
    var p = String(hhmm || '').split(':');
    if (p.length < 2) return null;
    return (parseInt(p[0], 10) * 60 + parseInt(p[1], 10)) % 1440;
  }
  function fromMinutes(m) {
    m = ((m % 1440) + 1440) % 1440;
    return pad(Math.floor(m / 60)) + pad(m % 60);
  }
  function nowHHMM() {
    var d = new Date();
    return pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  /* ════════ Caffeine & Sleep Planner ════════ */
  function initCaffeine() {
    var root = $('[data-tool="caffeine"]');
    if (!root) return;

    var KEY = 'frr-caffeine-log';
    var today = new Date().toDateString();
    var saved = storeGet(KEY);
    var log = saved && saved.day === today ? saved.items : [];
    var sleepInput = $('[data-sleep-time]', root);
    if (saved && saved.sleep) sleepInput.value = saved.sleep;

    var list = $('[data-caf-list]', root);
    var totalNode = $('[data-caf-total]', root);
    var meter = $('[data-caf-meter]', root);
    var meterTrack = $('[data-caf-track]', root);
    var bedtimeNode = $('[data-caf-bedtime]', root);
    var lastCallNode = $('[data-caf-lastcall]', root);
    var verdict = $('[data-caf-verdict]', root);
    var timeInput = $('[data-caf-time]', root);
    timeInput.value = nowHHMM();

    function persist() { storeSet(KEY, { day: today, items: log, sleep: sleepInput.value }); }

    function render() {
      var total = log.reduce(function (s, i) { return s + i.mg; }, 0);
      var sleepMin = toMinutes(sleepInput.value);
      var atBed = 0;
      log.forEach(function (i) {
        var t = toMinutes(i.time);
        if (t === null || sleepMin === null) return;
        var hours = (((sleepMin - t) + 1440) % 1440) / 60;
        atBed += i.mg * Math.pow(0.5, hours / 5);
      });

      list.innerHTML = log.length
        ? log.map(function (i, idx) {
            return '<li><span class="caf-time">' + esc(i.time.replace(':', '')) + '</span>' +
              '<span class="caf-name">' + esc(i.name) + '</span>' +
              '<span class="caf-mg">' + i.mg + ' mg</span>' +
              '<button type="button" class="icon-btn" data-remove="' + idx + '" aria-label="Remove ' + esc(i.name) + '">✕</button></li>';
          }).join('')
        : '<li class="empty">No caffeine logged yet today. Tap a drink above.</li>';

      totalNode.textContent = total + ' mg';
      var pct = Math.min(100, Math.round(total / 400 * 100));
      meter.style.width = pct + '%';
      meter.className = 'meter-fill ' + (total > 400 ? 'over' : total > 300 ? 'near' : 'ok');
      meterTrack.setAttribute('aria-valuenow', String(total));

      bedtimeNode.textContent = sleepMin === null ? '—' : Math.round(atBed) + ' mg';
      lastCallNode.textContent = sleepMin === null ? '—' : fromMinutes(sleepMin - 360) + ' hrs';

      var msg;
      if (!log.length) msg = 'Log drinks to see how much caffeine will still be in your system at rack time.';
      else if (total > 400) msg = '⚠️ Over the ~400 mg/day Health Canada guidance. Switch to water or decaf for the rest of the day.';
      else if (atBed >= 100) msg = '😵 About ' + Math.round(atBed) + ' mg may still be active at rack time, enough to make sleep lighter and shorter. Stop caffeine at least 6 hours before sleep.';
      else if (atBed >= 50) msg = '🙂 Some caffeine will still be around at rack time. Try to finish your last cup a bit earlier.';
      else msg = '✅ Nicely timed. Most of it should be cleared by the time you turn in.';
      verdict.textContent = msg;
      persist();
    }

    $$('[data-drink]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        log.push({ name: btn.getAttribute('data-name'), mg: parseInt(btn.getAttribute('data-drink'), 10), time: timeInput.value || nowHHMM() });
        used('caffeine');
        render();
      });
    });

    var customForm = $('[data-caf-custom]', root);
    if (customForm) {
      customForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var mg = parseInt($('input[name="mg"]', customForm).value, 10);
        if (!mg || mg < 1 || mg > 1000) return;
        log.push({ name: 'Custom', mg: mg, time: timeInput.value || nowHHMM() });
        customForm.reset();
        used('caffeine');
        render();
      });
    }

    list.addEventListener('click', function (e) {
      var b = e.target.closest('[data-remove]');
      if (!b) return;
      log.splice(parseInt(b.getAttribute('data-remove'), 10), 1);
      render();
    });
    sleepInput.addEventListener('input', render);
    $('[data-caf-clear]', root).addEventListener('click', function () { log = []; render(); });
    render();
  }

  /* ════════ Power Nap Timer ════════ */
  function initNap() {
    var root = $('[data-tool="nap"]');
    if (!root) return;
    var display = $('[data-nap-display]', root);
    var status = $('[data-nap-status]', root);
    var ring = $('[data-nap-ring]', root);
    var stopBtn = $('[data-nap-stop]', root);
    var timer = null;
    var endAt = 0;
    var duration = 0;

    function beep() {
      try {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        var ctx = new Ctx();
        [0, 0.35, 0.7].forEach(function (offset) {
          var o = ctx.createOscillator();
          var g = ctx.createGain();
          o.frequency.value = 880;
          o.connect(g); g.connect(ctx.destination);
          g.gain.setValueAtTime(0.0001, ctx.currentTime + offset);
          g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + offset + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.3);
          o.start(ctx.currentTime + offset);
          o.stop(ctx.currentTime + offset + 0.32);
        });
      } catch (e) { /* audio unavailable */ }
      if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300]);
    }

    function paint() {
      var left = Math.max(0, Math.round((endAt - Date.now()) / 1000));
      display.textContent = pad(Math.floor(left / 60)) + ':' + pad(left % 60);
      ring.style.setProperty('--pct', duration ? Math.round((1 - left / duration) * 100) : 0);
      if (left <= 0) {
        stop();
        status.textContent = '⏰ Time to get up! Give yourself a few minutes (and some light) before duty.';
        beep();
        if (window.FRR) window.FRR.toast('⏰ Nap over — rise and shine!');
      }
    }

    function stop() {
      clearInterval(timer);
      timer = null;
      stopBtn.disabled = true;
      root.classList.remove('running');
    }

    $$('[data-nap]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mins = parseInt(btn.getAttribute('data-nap'), 10);
        duration = mins * 60;
        endAt = Date.now() + duration * 1000;
        clearInterval(timer);
        timer = setInterval(paint, 250);
        stopBtn.disabled = false;
        root.classList.add('running');
        status.textContent = mins + '-minute nap started. Keep this page open. 😴';
        used('nap');
        paint();
      });
    });

    stopBtn.addEventListener('click', function () {
      stop();
      display.textContent = '00:00';
      ring.style.setProperty('--pct', 0);
      status.textContent = 'Timer stopped.';
    });
  }

  /* ════════ Wind Chill ════════ */
  var WIND_BANDS = [
    { max: -55, level: 'Extreme', cls: 'extreme', text: 'Exposed skin can freeze in less than 2 minutes. Outdoor conditions are hazardous. Limit upper-deck time to what is essential.' },
    { max: -48, level: 'Severe', cls: 'severe', text: 'Exposed skin can freeze in 2–5 minutes. Cover all skin, work in short rotations, and buddy-check faces.' },
    { max: -40, level: 'Very high', cls: 'vhigh', text: 'Exposed skin can freeze in 5–10 minutes. Full face, hand, and ear protection. Watch shipmates for white or waxy patches.' },
    { max: -28, level: 'High', cls: 'high', text: 'Exposed skin can freeze in 10–30 minutes. Cover cheeks, nose, and ears; keep gloves dry.' },
    { max: -10, level: 'Moderate', cls: 'moderate', text: 'Uncomfortable. Risk of hypothermia if outside a long time without proper protection. Dress in layers and stay dry.' },
    { max: 0, level: 'Low', cls: 'low', text: 'Slight increase in discomfort. Dress for the weather and keep a spare dry pair of gloves.' },
    { max: Infinity, level: 'Minimal', cls: 'low', text: 'Little cold risk. Wind and spray can still chill wet skin and gear.' }
  ];

  function windChill(tempC, windKmh) {
    if (tempC > 10) return tempC;
    if (windKmh < 5) return tempC + ((-1.59 + 0.1345 * tempC) / 5) * windKmh;
    var v = Math.pow(windKmh, 0.16);
    return 13.12 + 0.6215 * tempC - 11.37 * v + 0.3965 * tempC * v;
  }

  function initWindChill() {
    var root = $('[data-tool="windchill"]');
    if (!root) return;
    var t = $('[data-wc-temp]', root);
    var tRange = $('[data-wc-temp-range]', root);
    var w = $('[data-wc-wind]', root);
    var wRange = $('[data-wc-wind-range]', root);
    var unit = $('[data-wc-unit]', root);
    var out = $('[data-wc-out]', root);
    var band = $('[data-wc-band]', root);
    var touched = false;

    function sync(from, to) { to.value = from.value; }

    function calc() {
      var temp = parseFloat(t.value);
      var wind = parseFloat(w.value);
      if (isNaN(temp) || isNaN(wind)) return;
      var kmh = unit.value === 'kt' ? wind * 1.852 : wind;
      var wc = Math.round(windChill(temp, kmh));
      var b = WIND_BANDS.filter(function (x) { return wc <= x.max; })[0];
      out.textContent = wc;
      band.className = 'result-band band-' + b.cls;
      band.innerHTML = '<strong>' + b.level + ' risk.</strong> ' + b.text +
        (temp > 10 ? ' <em>(Wind chill applies at 10 °C and below.)</em>' : '');
      if (touched) used('windchill');
    }

    t.addEventListener('input', function () { touched = true; sync(t, tRange); calc(); });
    tRange.addEventListener('input', function () { touched = true; sync(tRange, t); calc(); });
    w.addEventListener('input', function () { touched = true; sync(w, wRange); calc(); });
    wRange.addEventListener('input', function () { touched = true; sync(wRange, w); calc(); });
    unit.addEventListener('change', function () {
      var val = parseFloat(w.value) || 0;
      var converted = unit.value === 'kt' ? val / 1.852 : val * 1.852;
      w.value = wRange.value = Math.round(converted);
      wRange.max = unit.value === 'kt' ? 60 : 110;
      touched = true;
      calc();
    });
    calc();
  }

  /* ════════ Humidex ════════ */
  var HUMIDEX_BANDS = [
    { min: 46, level: 'Dangerous', cls: 'extreme', text: 'Heat stroke possible. Stop non-essential work, move to cooler air, and drink water. Confusion, fainting, or hot skin that has stopped sweating is a medical emergency.' },
    { min: 40, level: 'Great discomfort', cls: 'vhigh', text: 'Avoid exertion. Take frequent breaks in cooler compartments, rotate tasks, and drink water regularly, about a cup every 15–20 minutes during hot work.' },
    { min: 30, level: 'Some discomfort', cls: 'moderate', text: 'Drink water regularly, pace heavy work, and watch for headache, dizziness, or cramps.' },
    { min: -Infinity, level: 'Little or no discomfort', cls: 'low', text: 'Normal precautions. Keep a water bottle handy in machinery spaces and the galley.' }
  ];

  function humidex(tempC, rh) {
    var e = 6.112 * Math.pow(10, (7.5 * tempC) / (237.7 + tempC)) * (rh / 100);
    var h = tempC + (5 / 9) * (e - 10);
    return Math.max(tempC, h);
  }

  function initHumidex() {
    var root = $('[data-tool="humidex"]');
    if (!root) return;
    var t = $('[data-hx-temp]', root);
    var tRange = $('[data-hx-temp-range]', root);
    var rh = $('[data-hx-rh]', root);
    var rhRange = $('[data-hx-rh-range]', root);
    var out = $('[data-hx-out]', root);
    var band = $('[data-hx-band]', root);
    var touched = false;

    function calc() {
      var temp = parseFloat(t.value);
      var hum = parseFloat(rh.value);
      if (isNaN(temp) || isNaN(hum)) return;
      hum = Math.min(100, Math.max(0, hum));
      var h = Math.round(humidex(temp, hum));
      var b = HUMIDEX_BANDS.filter(function (x) { return h >= x.min; })[0];
      out.textContent = h;
      band.className = 'result-band band-' + b.cls;
      band.innerHTML = '<strong>' + b.level + '.</strong> ' + b.text;
      if (touched) used('humidex');
    }
    function link(a, b) {
      a.addEventListener('input', function () { touched = true; b.value = a.value; calc(); });
    }
    link(t, tRange); link(tRange, t); link(rh, rhRange); link(rhRange, rh);
    calc();
  }

  /* ════════ Hydration Check ════════ */
  var HYDRATION = [
    { color: '#fbfbe6', label: '1', msg: '💧 Well hydrated. Keep sipping through your watch.' },
    { color: '#f6f3b5', label: '2', msg: '💧 Well hydrated. This is the goal: pale yellow.' },
    { color: '#f1ea8b', label: '3', msg: '👍 Good. Keep drinking regularly, especially in heat or when seasick.' },
    { color: '#eadc5f', label: '4', msg: '🥤 Slightly low. Have a glass of water now.' },
    { color: '#e2c83e', label: '5', msg: '🥤 Getting dehydrated. Drink 1–2 glasses of water over the next hour.' },
    { color: '#d4ad2c', label: '6', msg: '⚠️ Dehydrated. Drink water or an oral rehydration drink now, and ease off heavy work if you can.' },
    { color: '#b98d25', label: '7', msg: '⚠️ Very dehydrated. Rehydrate now. If you feel dizzy or faint or cannot keep fluids down, report to Sick Bay.' },
    { color: '#946a1f', label: '8', msg: '🚩 Severely dehydrated, or something else is going on. Report to Sick Bay, especially if urine is brown or red or you feel unwell.' }
  ];

  function initHydration() {
    var root = $('[data-tool="hydration"]');
    if (!root) return;
    var grid = $('[data-hyd-grid]', root);
    var out = $('[data-hyd-out]', root);
    grid.innerHTML = HYDRATION.map(function (h, i) {
      return '<button type="button" class="hyd-swatch" style="--swatch:' + h.color + '" data-hyd="' + i + '" aria-label="Colour ' + h.label + ' of 8" aria-pressed="false"><span>' + h.label + '</span></button>';
    }).join('');
    grid.addEventListener('click', function (e) {
      var b = e.target.closest('[data-hyd]');
      if (!b) return;
      $$('[data-hyd]', grid).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', 'true');
      var idx = parseInt(b.getAttribute('data-hyd'), 10);
      out.textContent = HYDRATION[idx].msg;
      out.className = 'result-band band-' + (idx <= 2 ? 'low' : idx <= 4 ? 'moderate' : idx <= 6 ? 'vhigh' : 'extreme');
      used('hydration');
    });
  }

  /* ════════ Standard Drink Counter ════════ */
  function initDrinks() {
    var root = $('[data-tool="drinks"]');
    if (!root) return;
    var list = $('[data-sd-list]', root);
    var totalNode = $('[data-sd-total]', root);
    var band = $('[data-sd-band]', root);
    var marker = $('[data-sd-marker]', root);
    var items = [];

    function sd(ml, abv) { return (ml * abv / 100) / 17.05; }

    function render() {
      var total = items.reduce(function (s, i) { return s + i.sd; }, 0);
      totalNode.textContent = total.toFixed(1);
      list.innerHTML = items.length
        ? items.map(function (i, idx) {
            return '<li><span class="caf-name">' + esc(i.name) + '</span><span class="caf-mg">' + i.sd.toFixed(1) + ' SD</span>' +
              '<button type="button" class="icon-btn" data-remove="' + idx + '" aria-label="Remove ' + esc(i.name) + '">✕</button></li>';
          }).join('')
        : '<li class="empty">Add the drinks you have had this week.</li>';

      var pos = Math.min(100, (total / 10) * 100);
      marker.style.left = pos + '%';
      var msg, cls;
      if (total === 0) { msg = 'No drinks logged. Not drinking has real health benefits, including better sleep.'; cls = 'low'; }
      else if (total <= 2) { msg = 'Low risk (1–2 per week). Remember: no more than 2 on any one occasion.'; cls = 'low'; }
      else if (total <= 6) { msg = 'Moderate risk (3–6 per week). Cutting back lowers your risk of injury, poor sleep, and long-term disease.'; cls = 'moderate'; }
      else { msg = 'Increasingly high risk (7+ per week). Consider cutting back. Confidential help is available at Stadacona Addiction Prevention & Treatment, 902-721-8600.'; cls = 'vhigh'; }
      band.textContent = msg;
      band.className = 'result-band band-' + cls;
    }

    $$('[data-sd-preset]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var ml = parseFloat(btn.getAttribute('data-ml'));
        var abv = parseFloat(btn.getAttribute('data-abv'));
        items.push({ name: btn.getAttribute('data-name'), sd: sd(ml, abv) });
        used('drinks');
        render();
      });
    });

    var form = $('[data-sd-custom]', root);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ml = parseFloat($('input[name="ml"]', form).value);
      var abv = parseFloat($('input[name="abv"]', form).value);
      if (!(ml > 0) || !(abv > 0) || abv > 100) return;
      items.push({ name: ml + ' mL at ' + abv + '%', sd: sd(ml, abv) });
      used('drinks');
      render();
    });

    list.addEventListener('click', function (e) {
      var b = e.target.closest('[data-remove]');
      if (!b) return;
      items.splice(parseInt(b.getAttribute('data-remove'), 10), 1);
      render();
    });
    $('[data-sd-clear]', root).addEventListener('click', function () { items = []; render(); });
    render();
  }

  /* ── Tool tabs (quick jump + highlight) ── */
  function initTabs() {
    var nav = $('[data-tool-nav]');
    if (!nav) return;
    var links = $$('a', nav);
    var sections = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean);
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + en.target.id;
          a.classList.toggle('active', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { io.observe(s); });
  }

  function init() {
    initCaffeine();
    initNap();
    initWindChill();
    initHumidex();
    initHydration();
    initDrinks();
    initTabs();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
