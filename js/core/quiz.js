/* 小节测验：答错时给提示而非答案，可重试；答对后锁定并记录进度 */
(function (w) {
  function esc(s) { return SVGR.esc(s); }
  var LETTER = ['A', 'B', 'C', 'D', 'E', 'F'];

  function build(host, lesson) {
    var qs = lesson.quiz || [];
    host.innerHTML = '';
    if (!qs.length) { host.innerHTML = '<p class="muted">本节暂无测验。</p>'; return; }

    var rec = Store.quizGet(lesson.id);
    var head = document.createElement('div');
    head.className = 'meta-row';
    var stat = document.createElement('span');
    stat.className = 'chip brand';
    head.appendChild(stat);
    var tip = document.createElement('span');
    tip.className = 'muted';
    tip.textContent = '答错不会直接给答案，先看提示再试一次～';
    head.appendChild(tip);
    host.appendChild(head);

    function refresh() {
      var ok = 0;
      qs.forEach(function (q, i) { if (rec[q.id || ('q' + i)] && rec[q.id || ('q' + i)].ok) ok++; });
      stat.textContent = '已答对 ' + ok + ' / ' + qs.length;
    }

    qs.forEach(function (q, qi) {
      var qid = q.id || ('q' + qi);
      var box = document.createElement('div');
      box.className = 'quiz-q';
      var t = document.createElement('div');
      t.className = 'q-t';
      t.innerHTML = '<span class="q-n">' + (qi + 1) + '.</span><span>' + esc(q.q) + '</span>';
      box.appendChild(t);

      var hint = document.createElement('div');
      hint.className = 'hint-box';
      hint.innerHTML = '<b>提示：</b>' + esc(q.hint || '再读一遍上面的步骤拆解。');

      var solved = rec[qid] && rec[qid].ok;
      var tries = (rec[qid] && rec[qid].tries) || 0;

      q.options.forEach(function (opt, oi) {
        var d = document.createElement('div');
        d.className = 'opt' + (solved ? ' locked' : '');
        d.innerHTML = '<span class="ol">' + LETTER[oi] + '</span><span>' + esc(opt) + '</span>';
        if (solved && oi === q.answer) d.classList.add('correct');
        if (!solved) {
          d.onclick = function () {
            if (box.dataset.done === '1') return;
            if (oi === q.answer) {
              d.classList.add('correct');
              box.dataset.done = '1';
              box.querySelectorAll('.opt').forEach(function (x) { x.classList.add('locked'); });
              hint.classList.remove('show');
              Store.quizSet(lesson.id, qid, true, tries + 1);
              var okTag = document.createElement('div');
              okTag.className = 'muted';
              okTag.style.color = 'var(--ok)';
              okTag.style.marginTop = '8px';
              okTag.textContent = '✓ 答对了！' + (q.why ? '（' + q.why + '）' : '');
              box.appendChild(okTag);
              refresh();
            } else {
              d.classList.add('wrong');
              setTimeout(function () { d.classList.remove('wrong'); }, 700);
              tries++;
              Store.quizSet(lesson.id, qid, false, tries);
              hint.classList.add('show');
            }
          };
        }
        box.appendChild(d);
      });
      box.appendChild(hint);
      if (solved) {
        var done = document.createElement('div');
        done.className = 'muted';
        done.style.color = 'var(--ok)';
        done.textContent = '✓ 本题已完成';
        box.appendChild(done);
      }
      host.appendChild(box);
    });
    refresh();
  }

  w.Quiz = { create: build };
})(window);
