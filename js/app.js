/* 应用主逻辑：路由、导航、渲染课程页 / 首页、搜索、进度 */
(function (w) {
  var D = document;
  var LESSONS = w.LESSONS || [];
  var LEVELS = w.LEVELS || [];
  var content = D.getElementById('content');
  var navTree = D.getElementById('navTree');
  var sidebar = D.getElementById('sidebar');
  var scrim = D.getElementById('scrim');
  var menuBtn = D.getElementById('menuBtn');
  var searchInput = D.getElementById('searchInput');
  var searchPanel = D.getElementById('searchPanel');
  var toastEl = D.getElementById('toast');

  function esc(s) { return SVGR.esc(s); }
  function byId(id) { return lessonById(id); }
  function levelOf(id) {
    for (var i = 0; i < LEVELS.length; i++) if (LEVELS[i].id === id) return LEVELS[i];
    return LEVELS[0];
  }
  function indexOfLesson(id) {
    for (var i = 0; i < LESSONS.length; i++) if (LESSONS[i].id === id) return i;
    return -1;
  }

  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    requestAnimationFrame(function () { toastEl.classList.add('show'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('show');
      setTimeout(function () { toastEl.hidden = true; }, 250);
    }, 1900);
  }

  /* ---------------- 导航树 ---------------- */
  function buildNav() {
    var html = '';
    LEVELS.forEach(function (lv) {
      var list = LESSONS.filter(function (l) { return l.level === lv.id; });
      if (!list.length) return;
      var doneN = list.filter(function (l) { return Store.isDone(l.id); }).length;
      html += '<div class="nav-level">';
      html += '<div class="nav-level-title"><span class="dot" style="background:' + lv.color + '"></span>' +
        esc(lv.name.split(' · ')[0]) + '<span class="cnt">' + doneN + '/' + list.length + '</span></div>';
      list.forEach(function (l, i) {
        var done = Store.isDone(l.id);
        html += '<div class="nav-item' + (done ? ' done' : '') + '" data-id="' + l.id + '" title="' + esc(l.title) + '">' +
          '<span class="num">' + (i + 1) + '</span>' +
          '<span class="ttl">' + esc(l.title.split('：')[0]) + '</span>' +
          '<span class="mins">' + l.minutes + '′</span>' +
          '<span class="tick">✓</span></div>';
      });
      html += '</div>';
    });
    html += '<div class="nav-level"><div class="nav-level-title"><span class="dot" style="background:#94a3b8"></span>关于</div>' +
      '<div class="nav-item" data-id="__home"><span class="num">⌂</span><span class="ttl">课程总览</span></div></div>';
    navTree.innerHTML = html;
    Array.prototype.forEach.call(navTree.querySelectorAll('.nav-item'), function (it) {
      it.onclick = function () {
        var id = it.getAttribute('data-id');
        location.hash = id === '__home' ? '#/home' : '#/lesson/' + id;
        closeDrawer();
      };
    });
  }

  function highlightNav(id) {
    Array.prototype.forEach.call(navTree.querySelectorAll('.nav-item'), function (it) {
      it.classList.toggle('active', it.getAttribute('data-id') === id);
    });
  }

  function updateProgress() {
    var s = Store.stats(LESSONS);
    var pct = s.total ? (s.done / s.total * 100) : 0;
    D.getElementById('tpFill').style.width = pct.toFixed(1) + '%';
    D.getElementById('tpText').textContent = s.done + ' / ' + s.total + ' 节';
  }

  function openDrawer() { sidebar.classList.add('open'); scrim.classList.add('show'); }
  function closeDrawer() { sidebar.classList.remove('open'); scrim.classList.remove('show'); }
  menuBtn.onclick = function () { sidebar.classList.contains('open') ? closeDrawer() : openDrawer(); };
  scrim.onclick = closeDrawer;

  /* ---------------- 搜索 ---------------- */
  function doSearch(q) {
    q = (q || '').trim();
    if (!q) { searchPanel.hidden = true; return; }
    var res = LESSONS.filter(function (l) {
      return (l.title + l.subtitle + l.tags.join('') + (l.analogyTitle || '')).toLowerCase().indexOf(q.toLowerCase()) >= 0;
    }).slice(0, 12);
    var html = '';
    if (!res.length) html = '<div class="sp-empty">没有找到「' + esc(q) + '」相关课程</div>';
    res.forEach(function (l) {
      html += '<div class="sp-item" data-id="' + l.id + '"><span class="lv">' + esc(levelOf(l.level).name.split(' · ')[0]) + '</span>' +
        '<span>' + esc(l.title) + '</span><span class="muted" style="margin-left:auto;font-size:12px">' + l.minutes + ' 分钟</span></div>';
    });
    searchPanel.innerHTML = html;
    searchPanel.hidden = false;
    Array.prototype.forEach.call(searchPanel.querySelectorAll('.sp-item'), function (it) {
      it.onclick = function () {
        location.hash = '#/lesson/' + it.getAttribute('data-id');
        searchPanel.hidden = true; searchInput.value = '';
      };
    });
  }
  searchInput.oninput = function () { doSearch(this.value); };
  searchInput.onblur = function () { setTimeout(function () { searchPanel.hidden = true; }, 200); };
  searchInput.onfocus = function () { if (this.value) doSearch(this.value); };

  D.getElementById('resetProgress').onclick = function () {
    if (w.confirm('确定要清空全部学习进度与答题记录吗？此操作不可撤销。')) {
      Store.clear(); buildNav(); updateProgress(); toast('已清空学习进度');
      render();
    }
  };

  /* ---------------- 首页 ---------------- */
  function renderHome() {
    Player.stopAll();
    var s = Store.stats(LESSONS);
    var h = '<div class="hero">' +
      '<h1>算法小灶 · 零基础也能学会的算法课</h1>' +
      '<p>从「算法是什么」讲起，每一节都用生活类比 + 可操控的 SVG 动画 + 能改能跑的代码，把抽象过程摊开给你看。跟着走完 20 节，你就能独立分析时间/空间复杂度，并解决大部分中等难度算法题。</p>' +
      '<div class="hero-stats">' +
      '<div class="hero-stat"><div class="n">' + LESSONS.length + '</div><div class="l">节课</div></div>' +
      '<div class="hero-stat"><div class="n">' + s.done + '</div><div class="l">已完成</div></div>' +
      '<div class="hero-stat"><div class="n">' + LESSONS.reduce(function (a, b) { return a + b.minutes; }, 0) + '</div><div class="l">总分钟</div></div>' +
      '<div class="hero-stat"><div class="n">' + LESSONS.filter(function (l) { return l.anim; }).length + '</div><div class="l">个动画</div></div>' +
      '</div></div>';

    h += '<div class="card"><h2 class="sec-title"><span class="idx">▤</span>怎么使用这个网站</h2>' +
      '<ol class="steps">' +
      '<li><div class="st-t">先看类比，再看步骤</div><div class="st-why">每节开头都是生活化的比喻，先建立直觉；步骤拆解里每一步都写了<b>「为什么这么做」</b>，别跳过。</div></li>' +
      '<li><div class="st-t">动画要动手玩</div><div class="st-why">支持播放 / 暂停 / 单步 / 回退 / 调速，还能改输入数据。建议先用「单步」走一遍，边看伪代码高亮边对照日志。</div></li>' +
      '<li><div class="st-t">代码区可以改了直接跑</div><div class="st-why">示例代码可编辑，输入数据可自定义，运行后会打印每一步的执行过程日志。</div></li>' +
      '<li><div class="st-t">测验答错先要提示</div><div class="st-why">答错不会直接给答案，而是给一条提示引导你再想一次；动手题的答案默认折叠。</div></li>' +
      '</ol></div>';

    h += '<div class="level-grid">';
    LEVELS.forEach(function (lv) {
      var list = LESSONS.filter(function (l) { return l.level === lv.id; });
      var dn = list.filter(function (l) { return Store.isDone(l.id); }).length;
      h += '<div class="level-card">' +
        '<div class="lc-h"><div class="lc-badge" style="background:' + lv.color + '">' + lv.badge + '</div>' +
        '<div class="lc-t">' + esc(lv.name) + '</div></div>' +
        '<div class="lc-d">' + esc(lv.desc) + '</div>' +
        '<div class="lc-prog"><i style="width:' + (list.length ? dn / list.length * 100 : 0) + '%"></i></div>' +
        '<div class="muted" style="font-size:12px;margin-bottom:6px">' + dn + ' / ' + list.length + ' 已完成</div>' +
        '<ul class="lc-list">';
      list.forEach(function (l, i) {
        h += '<li data-id="' + l.id + '" class="' + (Store.isDone(l.id) ? 'done' : '') + '">' +
          '<span class="tk">✓</span><span>' + (i + 1) + '. ' + esc(l.title.split('：')[0]) + '</span>' +
          '<span class="t">' + l.minutes + '′</span></li>';
      });
      h += '</ul></div>';
    });
    h += '</div>';

    content.innerHTML = h;
    Array.prototype.forEach.call(content.querySelectorAll('.lc-list li'), function (li) {
      li.onclick = function () { location.hash = '#/lesson/' + li.getAttribute('data-id'); };
    });
  }

  /* ---------------- 课程页 ---------------- */
  function renderLesson(lesson) {
    Player.stopAll();
    Store.visit(lesson.id);
    var idx = indexOfLesson(lesson.id);
    var lv = levelOf(lesson.level);
    var list = LESSONS.filter(function (l) { return l.level === lesson.level; });
    var no = list.indexOf(lesson) + 1;

    var h = '';
    /* 头部 */
    h += '<div class="card">' +
      '<div class="muted" style="margin-bottom:6px">' + esc(lv.name) + ' · 第 ' + no + ' / ' + list.length + ' 节</div>' +
      '<h1 class="lesson-title">' + esc(lesson.title) + '</h1>' +
      '<p class="lead">' + esc(lesson.subtitle) + '</p>' +
      '<div class="meta-row">' +
      '<span class="chip brand">⏱ 预计 ' + lesson.minutes + ' 分钟</span>' +
      lesson.tags.map(function (t) { return '<span class="chip">#' + esc(t) + '</span>'; }).join('');
    if (lesson.prereq.length) {
      h += '<span class="chip warn">前置：' + lesson.prereq.map(function (p) {
        var pl = byId(p);
        return pl ? '<a href="#/lesson/' + p + '">' + esc(pl.title.split('：')[0]) + '</a>' : esc(p);
      }).join('、') + '</span>';
    }
    h += '</div></div>';

    /* ① 类比 */
    h += '<div class="card"><h2 class="sec-title"><span class="idx">①</span>先建立直觉：' + esc(lesson.analogyTitle || '生活里的类比') + '</h2>';
    (lesson.analogy || []).forEach(function (p) { h += '<p>' + p + '</p>'; });
    h += '</div>';

    /* ② 核心思想 + 适用场景 */
    h += '<div class="card"><h2 class="sec-title"><span class="idx">②</span>核心思想与适用场景</h2>' +
      '<h3>核心思想</h3><div class="idea-list">';
    lesson.idea.forEach(function (t) { h += '<p>• ' + t + '</p>'; });
    h += '</div><h3>什么时候用它</h3>';
    lesson.when.forEach(function (t) { h += '<p>• ' + t + '</p>'; });
    h += '</div>';

    /* ③ 步骤 */
    h += '<div class="card"><h2 class="sec-title"><span class="idx">③</span>步骤拆解（每步都说清「为什么」）</h2><ol class="steps">';
    lesson.steps.forEach(function (s) {
      h += '<li><div class="st-t">' + esc(s.t) + '</div><div class="st-why"><b>为什么：</b>' + s.why + '</div></li>';
    });
    h += '</ol></div>';

    /* ④ 动画 */
    h += '<div class="card"><h2 class="sec-title"><span class="idx">④</span>动画演示（可播放 / 单步 / 回退 / 调速）</h2>' +
      '<div id="vizHost"></div></div>';

    /* ⑤ 代码 */
    h += '<div class="card"><h2 class="sec-title"><span class="idx">⑤</span>代码实验室（可改输入、可改代码、可直接运行）</h2>' +
      '<div id="labHost"></div></div>';

    /* ⑥ 复杂度 */
    var cx = lesson.complexity || {};
    h += '<div class="card"><h2 class="sec-title"><span class="idx">⑥</span>时间与空间复杂度</h2>' +
      '<div class="cx-grid">' +
      '<div class="cx-box"><div class="k">最好情况</div><div class="v">' + esc(cx.best || '-') + '</div></div>' +
      '<div class="cx-box"><div class="k">平均情况</div><div class="v">' + esc(cx.avg || '-') + '</div></div>' +
      '<div class="cx-box"><div class="k">最坏情况</div><div class="v">' + esc(cx.worst || '-') + '</div></div>' +
      '<div class="cx-box"><div class="k">空间复杂度</div><div class="v">' + esc(cx.space || '-') + '</div></div>' +
      '</div>';
    if (cx.stable) h += '<p class="muted">稳定性：' + esc(cx.stable) + '</p>';
    (cx.detail || []).forEach(function (p) { h += '<p>' + p + '</p>'; });
    if (cx.table) {
      h += '<table class="tbl"><thead><tr>';
      cx.table[0].forEach(function (c) { h += '<th>' + c + '</th>'; });
      h += '</tr></thead><tbody>';
      for (var r = 1; r < cx.table.length; r++) {
        h += '<tr>' + cx.table[r].map(function (c) { return '<td class="mono">' + c + '</td>'; }).join('') + '</tr>';
      }
      h += '</tbody></table>';
    }
    h += '</div>';

    /* ⑦ 测验 */
    h += '<div class="card"><h2 class="sec-title"><span class="idx">⑦</span>小节测验（答错给提示，不直接给答案）</h2><div id="quizHost"></div></div>';

    /* ⑧ 动手题 */
    h += '<div class="card"><h2 class="sec-title"><span class="idx">⑧</span>动手题</h2>';
    lesson.practice.forEach(function (p) {
      h += '<div class="practice"><div class="p-t">' + esc(p.title) + '</div><div class="p-d">' + esc(p.desc) + '</div>';
      if (p.hint) h += '<details class="fold"><summary>💡 看提示（不剧透答案）</summary><div class="fold-body">' + esc(p.hint) + '</div></details>';
      if (p.solution) h += '<details class="fold"><summary>✅ 展开参考思路与代码</summary><div class="fold-body"><pre>' + esc(p.solution) + '</pre></div></details>';
      h += '</div>';
    });
    h += '</div>';

    /* 完成 + 上下节 */
    var prev = idx > 0 ? LESSONS[idx - 1] : null;
    var next = idx < LESSONS.length - 1 ? LESSONS[idx + 1] : null;
    h += '<div class="finish-bar"><span class="fb-t">学完这节了吗？进度会自动保存在本机浏览器里。</span>' +
      '<button class="btn-primary" id="finishBtn">' + (Store.isDone(lesson.id) ? '✓ 已完成（点击取消）' : '标记为已完成') + '</button></div>';
    h += '<div class="lesson-nav">';
    if (prev) h += '<a href="#/lesson/' + prev.id + '"><span class="dir">← 上一节</span><span class="ttl">' + esc(prev.title) + '</span></a>';
    if (next) h += '<a href="#/lesson/' + next.id + '"><span class="dir">下一节 →</span><span class="ttl">' + esc(next.title) + '</span></a>';
    h += '</div>';

    content.innerHTML = h;
    w.scrollTo(0, 0);

    /* 挂载子组件 */
    if (lesson.anim) Player.create(D.getElementById('vizHost'), lesson);
    else D.getElementById('vizHost').innerHTML = '<p class="muted">本节暂无动画演示。</p>';
    Runner.create(D.getElementById('labHost'), lesson);
    Quiz.create(D.getElementById('quizHost'), lesson);

    var fb = D.getElementById('finishBtn');
    fb.onclick = function () {
      var v = Store.toggleDone(lesson.id);
      fb.textContent = v ? '✓ 已完成（点击取消）' : '标记为已完成';
      fb.classList.toggle('done', v);
      buildNav(); updateProgress(); highlightNav(lesson.id);
      toast(v ? '已标记完成 🎉' : '已取消标记');
    };
    if (Store.isDone(lesson.id)) fb.classList.add('done');
  }

  /* ---------------- 路由 ---------------- */
  function render() {
    var hash = location.hash || '#/home';
    var m = hash.match(/^#\/lesson\/(.+)$/);
    if (m) {
      var l = byId(decodeURIComponent(m[1]));
      if (l) { renderLesson(l); highlightNav(l.id); return; }
    }
    renderHome();
    highlightNav('__home');
  }

  w.addEventListener('hashchange', render);

  /* 启动 */
  if (LESSONS.length === 0) {
    content.innerHTML = '<div class="card"><p>课程数据加载失败，请检查 js/data 下的脚本是否被正确引入。</p></div>';
    return;
  }
  buildNav();
  updateProgress();
  render();
})(window);
