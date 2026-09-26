/* quiz.js — renders Knowledge Checks ([data-quiz="id"]) on brief pages and
   the Crew Health Challenge ([data-challenge]) using window.FRR_QUIZ. */
(function () {
  'use strict';

  function esc(text) {
    var d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  }

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function api() { return window.FRR || null; }

  /* Builds one question block. onAnswer(correct) fires once. */
  function questionBlock(item, number, onAnswer) {
    var wrap = document.createElement('div');
    wrap.className = 'quiz-q';
    var qid = 'q' + Math.random().toString(36).slice(2, 8);
    wrap.innerHTML =
      '<p class="quiz-question" id="' + qid + '"><span class="quiz-num">' + number + '</span>' + esc(item.q) + '</p>' +
      '<div class="quiz-options" role="group" aria-labelledby="' + qid + '"></div>' +
      '<p class="quiz-feedback" role="status" aria-live="polite"></p>';

    var opts = wrap.querySelector('.quiz-options');
    var feedback = wrap.querySelector('.quiz-feedback');
    var buttons = item.options.map(function (text, idx) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'quiz-option';
      b.textContent = text;
      b.addEventListener('click', function () {
        var correct = idx === item.answer;
        buttons.forEach(function (btn, i) {
          btn.disabled = true;
          if (i === item.answer) btn.classList.add('is-correct');
        });
        if (!correct) b.classList.add('is-wrong');
        b.setAttribute('aria-pressed', 'true');
        feedback.className = 'quiz-feedback ' + (correct ? 'good' : 'bad');
        feedback.innerHTML = (correct ? '<strong>Correct!</strong> ' : '<strong>Not quite.</strong> ') + esc(item.why);
        wrap.classList.add(correct ? 'answered-right' : 'answered-wrong');
        onAnswer(correct);
      });
      opts.appendChild(b);
      return b;
    });
    return wrap;
  }

  /* ── Per-brief Knowledge Check ── */
  function renderBriefQuiz(host) {
    var id = host.getAttribute('data-quiz');
    var set = window.FRR_QUIZ && window.FRR_QUIZ[id];
    if (!set) return;

    function build() {
      host.innerHTML =
        '<div class="quiz-head">' +
          '<span class="quiz-badge" aria-hidden="true">🎯</span>' +
          '<div><h2 class="quiz-title" id="quiz-title-' + id + '">Knowledge Check</h2>' +
          '<p class="small-note">' + set.questions.length + ' quick questions. Get them all right to earn 🏆 Aced.</p></div>' +
        '</div>' +
        '<div class="quiz-body"></div>' +
        '<div class="quiz-result" hidden role="status" aria-live="polite"></div>';
      host.setAttribute('aria-labelledby', 'quiz-title-' + id);

      var body = host.querySelector('.quiz-body');
      var result = host.querySelector('.quiz-result');
      var answered = 0;
      var score = 0;

      set.questions.forEach(function (item, i) {
        body.appendChild(questionBlock(item, i + 1, function (correct) {
          answered += 1;
          if (correct) score += 1;
          if (answered === set.questions.length) finish();
        }));
      });

      function finish() {
        var total = set.questions.length;
        var perfect = score === total;
        result.hidden = false;
        result.className = 'quiz-result ' + (perfect ? 'perfect' : 'partial');
        result.innerHTML =
          '<p class="quiz-score">' + (perfect ? '🏆' : '⚓') + ' You scored <strong>' + score + '/' + total + '</strong></p>' +
          '<p>' + (perfect ? 'Perfect! You have got this topic squared away.' : 'Good effort. Review the sections above and try again for a perfect score.') + '</p>' +
          '<div class="quiz-actions"><button type="button" class="btn btn-outline" data-retry>↻ Try again</button>' +
          '<a class="btn" href="challenge.html">Take the Crew Challenge →</a></div>';
        result.querySelector('[data-retry]').addEventListener('click', function () {
          build();
          host.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        var F = api();
        if (F) {
          F.recordQuiz(id, score, total);
          if (perfect) F.confetti();
        }
      }
    }
    build();
  }

  /* ── Crew Health Challenge ── */
  var RANKS = [
    { min: 10, title: 'Chief Petty Officer 1st Class', note: 'Flawless. The whole mess will be asking you for advice.', icon: '🎖️' },
    { min: 8, title: 'Petty Officer 1st Class', note: 'Sharp work: you know your stuff and your lifelines.', icon: '🥇' },
    { min: 6, title: 'Master Sailor', note: 'Solid. A quick brief review will get you to the top.', icon: '🥈' },
    { min: 4, title: 'Sailor 1st Class', note: 'Good start. Read a few more briefs and come back.', icon: '🥉' },
    { min: 0, title: 'Sailor 3rd Class', note: 'Everyone starts somewhere. Hit the briefs and try again!', icon: '⚓' }
  ];

  function renderChallenge(host) {
    var LENGTH = 10;

    function pool() {
      var all = [];
      Object.keys(window.FRR_QUIZ || {}).forEach(function (key) {
        var set = window.FRR_QUIZ[key];
        set.questions.forEach(function (q) {
          all.push({ item: q, topic: set.title, icon: set.icon, page: set.page });
        });
      });
      return shuffle(all).slice(0, LENGTH);
    }

    function start() {
      var questions = pool();
      var index = 0;
      var score = 0;
      var streak = 0;
      var bestStreak = 0;
      var missed = [];

      host.innerHTML =
        '<div class="challenge-hud">' +
          '<div class="challenge-progress" role="progressbar" aria-label="Challenge progress" aria-valuemin="0" aria-valuemax="' + questions.length + '" aria-valuenow="0"><div class="challenge-progress-fill"></div></div>' +
          '<div class="challenge-stats"><span data-qcount>Question 1 of ' + questions.length + '</span>' +
          '<span data-score>Score: 0</span><span data-streak class="streak">🔥 0</span></div>' +
        '</div>' +
        '<div class="challenge-stage"></div>';

      var stage = host.querySelector('.challenge-stage');
      var fill = host.querySelector('.challenge-progress-fill');
      var bar = host.querySelector('.challenge-progress');

      function show() {
        var entry = questions[index];
        stage.innerHTML = '<p class="challenge-topic">' + entry.icon + ' ' + esc(entry.topic) + '</p>';
        var block = questionBlock(entry.item, index + 1, function (correct) {
          if (correct) {
            score += 1; streak += 1; bestStreak = Math.max(bestStreak, streak);
          } else {
            streak = 0; missed.push(entry);
          }
          host.querySelector('[data-score]').textContent = 'Score: ' + score;
          var st = host.querySelector('[data-streak]');
          st.textContent = '🔥 ' + streak;
          st.classList.toggle('hot', streak >= 3);
          fill.style.width = ((index + 1) / questions.length * 100) + '%';
          bar.setAttribute('aria-valuenow', String(index + 1));

          var next = document.createElement('button');
          next.type = 'button';
          next.className = 'btn challenge-next';
          next.textContent = index + 1 < questions.length ? 'Next question →' : 'See my rank 🎖️';
          next.addEventListener('click', function () {
            index += 1;
            if (index < questions.length) {
              host.querySelector('[data-qcount]').textContent = 'Question ' + (index + 1) + ' of ' + questions.length;
              show();
            } else {
              finish();
            }
          });
          stage.appendChild(next);
          next.focus();
        });
        stage.appendChild(block);
        var first = stage.querySelector('.quiz-option');
        if (first && index > 0) first.focus();
      }

      function finish() {
        var rank = RANKS.filter(function (r) { return score >= r.min; })[0];
        var review = missed.length
          ? '<div class="challenge-review"><h3>Brush up on:</h3><ul>' +
              missed.map(function (m) { return '<li><a href="' + m.page + '">' + m.icon + ' ' + esc(m.topic) + '</a></li>'; })
                .filter(function (v, i, arr) { return arr.indexOf(v) === i; }).join('') +
            '</ul></div>'
          : '';
        stage.innerHTML =
          '<div class="challenge-result">' +
            '<div class="rank-medal" aria-hidden="true">' + rank.icon + '</div>' +
            '<p class="small-note">Your rank</p>' +
            '<h2 class="rank-title">' + rank.title + '</h2>' +
            '<p class="rank-score"><strong>' + score + '/' + questions.length + '</strong> correct &nbsp;·&nbsp; best streak 🔥 ' + bestStreak + '</p>' +
            '<p>' + rank.note + '</p>' +
            review +
            '<div class="quiz-actions"><button type="button" class="btn" data-again>↻ New challenge</button>' +
            '<a class="btn btn-outline" href="index.html#readiness">View my badges</a></div>' +
          '</div>';
        stage.querySelector('[data-again]').addEventListener('click', start);
        stage.querySelector('[data-again]').focus();
        var F = api();
        if (F) {
          F.recordChallenge(score, questions.length);
          if (score >= 8) F.confetti();
        }
      }

      show();
    }

    var startBtn = document.querySelector('[data-challenge-start]');
    if (startBtn) {
      startBtn.addEventListener('click', function () {
        var intro = document.querySelector('[data-challenge-intro]');
        if (intro) intro.hidden = true;
        host.hidden = false;
        start();
        host.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } else {
      start();
    }
  }

  function init() {
    document.querySelectorAll('[data-quiz]').forEach(renderBriefQuiz);
    var ch = document.querySelector('[data-challenge]');
    if (ch) renderChallenge(ch);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
