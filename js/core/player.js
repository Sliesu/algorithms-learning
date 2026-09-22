/* 动画播放器：播放 / 暂停 / 单步 / 回退 / 调速 / 拖拽进度，与伪代码逐行联动 */
(function (w) {
  var SPEEDS = [1500, 950, 600, 340, 170];
  var all = [];

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function esc(s) { return SVGR.esc(s); }

  function parseArr(str) {
    if (Array.isArray(str)) return str;
    var s = String(str || '').trim();
    if (!s) return [];
    try {
      var v = JSON.parse(s);
      if (Array.isArray(v)) return v;
    } catch (e) { }
    return s.split(/[\s,，、\[\]]+/).filter(function (x) { return x !== ''; }).map(function (x) {
      var n = Number(x); return isNaN(n) ? x : n;
    });
  }

  var DEFAULT_LEGEND = [
    ['idle', '未处理'], ['cmp', '正在比较'], ['swap', '交换 / 写入'],
    ['done', '已就位'], ['pivot', '基准值'], ['target', '查找目标'], ['active', '当前关注'], ['dim', '暂不涉及']
  ];

  function Player(host, lesson) {
    this.lesson = lesson;
    this.anim = lesson.anim || {};
    this.steps = [];
    this.i = 0;
    this.timer = null;
    this.speed = 2;
    this.build(host);
    this.regenerate();
    all.push(this);
  }

  Player.prototype.build = function (host) {
    var self = this;
    host.innerHTML = '';
    var root = el('div', 'viz');

    /* 控制条 */
    var bar = el('div', 'viz-bar');
    this.btnReset = el('button', '', '⟲ 重置');
    this.btnPrev = el('button', '', '◀ 上一步');
    this.btnPlay = el('button', 'primary', '▶ 播放');
    this.btnNext = el('button', '', '下一步 ▶');
    this.btnEnd = el('button', '', '⏭ 到结尾');
    [this.btnReset, this.btnPrev, this.btnPlay, this.btnNext, this.btnEnd].forEach(function (b) { bar.appendChild(b); });
    this.count = el('span', 'viz-count', '0 / 0');
    bar.appendChild(this.count);
    var sp = el('label', 'viz-speed', '<span>速度</span>');
    this.range = el('input'); this.range.type = 'range'; this.range.min = 0; this.range.max = 4; this.range.value = 2;
    sp.appendChild(this.range);
    this.spLabel = el('span', '', '1.0×');
    sp.appendChild(this.spLabel);
    bar.appendChild(sp);
    root.appendChild(bar);

    /* 进度条 */
    var scrub = el('div', 'viz-scrub');
    this.scrub = el('input'); this.scrub.type = 'range'; this.scrub.min = 0; this.scrub.max = 0; this.scrub.value = 0;
    scrub.appendChild(this.scrub);
    root.appendChild(scrub);

    /* 主体 */
    var body = el('div', 'viz-body');
    this.stage = el('div', 'viz-stage');
    var side = el('div', 'viz-side');
    this.pseudo = el('div', 'viz-pseudo');
    this.vars = el('div', 'viz-vars');
    this.log = el('div', 'viz-log');
    side.appendChild(this.pseudo); side.appendChild(this.vars); side.appendChild(this.log);
    body.appendChild(this.stage); body.appendChild(side);
    root.appendChild(body);

    /* 自定义输入 */
    var f = el('div', 'viz-fields');
    this.inputs = {};
    var fields = this.anim.fields || [{ key: 'arr', kind: 'array', def: '[5,3,8,1,9,2,7]', label: '数组' }];
    fields.forEach(function (fd) {
      var lab = el('label', '', '<span>' + esc(fd.label || fd.key) + '</span>');
      var inp = el('input', fd.kind === 'array' ? 'wide' : '');
      inp.value = fd.def;
      inp.setAttribute('data-key', fd.key);
      lab.appendChild(inp);
      f.appendChild(lab);
      self.inputs[fd.key] = inp;
    });
    var apply = el('button', 'primary', '应用数据');
    var rnd = el('button', '', '随机一组');
    f.appendChild(apply); f.appendChild(rnd);
    root.appendChild(f);

    /* 图例 */
    var lg = el('div', 'legend');
    (this.anim.legend || DEFAULT_LEGEND).forEach(function (p) {
      var c = SVGR.color(p[0]);
      lg.appendChild(el('span', '', '<i style="background:' + c.fill + ';border-color:' + c.stroke + '"></i>' + esc(p[1])));
    });
    root.appendChild(lg);

    host.appendChild(root);

    /* 伪代码 */
    (this.lesson.pseudo || []).forEach(function (line, k) {
      var d = el('span', 'pl', esc(line) || ' ');
      d.setAttribute('data-line', k);
      self.pseudo.appendChild(d);
    });
    if (!this.lesson.pseudo) this.pseudo.style.display = 'none';

    /* 事件 */
    this.btnReset.onclick = function () { self.stop(); self.i = 0; self.render(); };
    this.btnPrev.onclick = function () { self.stop(); if (self.i > 0) self.i--; self.render(); };
    this.btnNext.onclick = function () { self.stop(); if (self.i < self.steps.length - 1) self.i++; self.render(); };
    this.btnEnd.onclick = function () { self.stop(); self.i = self.steps.length - 1; self.render(); };
    this.btnPlay.onclick = function () { self.toggle(); };
    apply.onclick = function () { self.stop(); self.regenerate(); };
    rnd.onclick = function () { self.randomize(); };
    this.range.oninput = function () {
      self.speed = parseInt(this.value, 10);
      self.spLabel.textContent = (600 / SPEEDS[self.speed]).toFixed(1).replace('.0', '.0') + '×';
      if (self.timer) { self.stop(); self.play(); }
    };
    this.scrub.oninput = function () { self.stop(); self.i = parseInt(this.value, 10); self.render(); };
  };

  Player.prototype.values = function () {
    var v = {};
    var fields = this.anim.fields || [{ key: 'arr', kind: 'array' }];
    var self = this;
    fields.forEach(function (fd) {
      var raw = self.inputs[fd.key].value;
      v[fd.key] = fd.kind === 'array' ? parseArr(raw) : (fd.kind === 'number' ? Number(raw) : raw);
    });
    return v;
  };

  Player.prototype.randomize = function () {
    var fields = this.anim.fields || [];
    var self = this;
    fields.forEach(function (fd) {
      if (fd.kind === 'array' && fd.random !== false) {
        var n = 7 + Math.floor(Math.random() * 3);
        var a = [];
        for (var i = 0; i < n; i++) a.push(1 + Math.floor(Math.random() * 60));
        self.inputs[fd.key].value = JSON.stringify(a);
      }
    });
    this.stop();
    this.regenerate();
  };

  Player.prototype.regenerate = function () {
    var v = this.values();
    try {
      /* 统一传「字段值对象」：gen(v) 里用 v.arr / v.target 等取值 */
      this.steps = this.anim.gen(v, v) || [];
    } catch (e) {
      this.steps = [];
      console.error('动画生成失败', e);
    }
    if (!this.steps.length) this.steps = [{ log: '（没有可演示的步骤，换一组数据试试）' }];
    this.i = 0;
    this.scrub.max = Math.max(0, this.steps.length - 1);
    this.scrub.value = 0;
    this.render();
  };

  Player.prototype.play = function () {
    var self = this;
    if (this.i >= this.steps.length - 1) this.i = 0;
    this.btnPlay.textContent = '⏸ 暂停';
    this.timer = setInterval(function () {
      if (self.i >= self.steps.length - 1) { self.stop(); return; }
      self.i++;
      self.render();
    }, SPEEDS[this.speed]);
  };
  Player.prototype.stop = function () {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    this.btnPlay.textContent = '▶ 播放';
  };
  Player.prototype.toggle = function () { if (this.timer) this.stop(); else this.play(); };

  Player.prototype.render = function () {
    var s = this.steps[this.i] || {};
    /* 场景 */
    SVGR.render(this.stage, s.scenes || s.scene || (s.rows ? { kind: 'array', rows: s.rows, caption: s.caption } : null));
    if (s.caption && !s.scenes) {
      var cap = this.stage.querySelector('.viz-caption');
      if (!cap) { cap = el('div', 'viz-caption'); this.stage.appendChild(cap); }
      cap.textContent = s.caption;
    }
    /* 伪代码高亮 */
    var lines = this.pseudo.querySelectorAll('.pl');
    for (var k = 0; k < lines.length; k++) lines[k].classList.toggle('on', k === s.line);
    if (s.line != null && lines[s.line]) {
      var on = lines[s.line], box = this.pseudo;
      var top = on.offsetTop - box.clientHeight / 2 + 12;
      box.scrollTop = Math.max(0, top);
    }
    /* 变量 */
    var vh = '';
    if (s.vars) Object.keys(s.vars).forEach(function (k) {
      vh += '<span class="vchip">' + esc(k) + ' = <b>' + esc(s.vars[k]) + '</b></span>';
    });
    if (s.stack) vh += '<span class="vchip">调用栈 / 容器：<b>' + esc(s.stack.join(' → ')) + '</b></span>';
    this.vars.innerHTML = vh;
    /* 日志 */
    var from = Math.max(0, this.i - 60), lh = '';
    for (var j = from; j <= this.i; j++) {
      var st = this.steps[j];
      if (!st || !st.log) continue;
      lh += '<div class="lg' + (j === this.i ? ' now' : '') + '">' + (j + 1) + '. ' + esc(st.log) + '</div>';
    }
    this.log.innerHTML = lh;
    this.log.scrollTop = this.log.scrollHeight;
    /* 状态 */
    this.count.textContent = (this.i + 1) + ' / ' + this.steps.length;
    this.scrub.value = this.i;
    this.btnPrev.disabled = this.i === 0;
    this.btnNext.disabled = this.i >= this.steps.length - 1;
  };

  w.Player = {
    create: function (host, lesson) { return new Player(host, lesson); },
    stopAll: function () { all.forEach(function (p) { p.stop(); }); all = []; },
    parseArr: parseArr
  };
})(window);
