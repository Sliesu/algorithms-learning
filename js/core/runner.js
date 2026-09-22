/* 代码实验室：可编辑示例代码 + 自定义输入 + 执行过程日志 */
(function (w) {
  function esc(s) { return SVGR.esc(s); }

  function fmt(v) {
    if (v === undefined) return 'undefined';
    if (v === null) return 'null';
    if (typeof v === 'object') { try { return JSON.stringify(v); } catch (e) { return String(v); } }
    return String(v);
  }

  function build(host, lesson) {
    var run = lesson.run || {};
    var inputs = run.inputs || [{ key: 'arr', label: '数组（JSON 或逗号分隔）', def: '[5,3,8,1,9,2,7]' }];
    host.innerHTML = '';
    var root = document.createElement('div');
    root.className = 'lab';

    var left = document.createElement('div'); left.className = 'lab-col';
    var right = document.createElement('div'); right.className = 'lab-col';

    var ih = '<h4>输入数据</h4>';
    inputs.forEach(function (fd, k) {
      ih += '<div style="margin-bottom:8px"><div class="muted" style="font-size:12.5px;margin-bottom:3px">' +
        esc(fd.label || fd.key) + '</div>' +
        '<textarea class="lab-in" data-key="' + esc(fd.key) + '" style="min-height:' + (inputs.length > 2 ? 56 : 74) + 'px;width:100%;' +
        'font-family:var(--mono);font-size:12.5px;border:1px solid var(--line);border-radius:9px;padding:8px;background:#fcfdff;outline:none;resize:vertical">' +
        esc(fd.def) + '</textarea></div>';
    });
    ih += '<h4>示例代码（可直接修改后运行）</h4>' +
      '<textarea class="lab-code" spellcheck="false"></textarea>' +
      '<div class="lab-actions">' +
      '<button class="primary lab-run">▶ 运行代码</button>' +
      '<button class="lab-reset">恢复默认代码</button>' +
      '<button class="lab-clear">清空输出</button>' +
      '</div>';
    left.innerHTML = ih;

    right.innerHTML = '<h4>执行过程与结果</h4><div class="run-out"></div>';
    root.appendChild(left); root.appendChild(right);
    host.appendChild(root);

    var codeEl = left.querySelector('.lab-code');
    var outEl = right.querySelector('.run-out');
    var defaultCode = run.code || 'return input;';
    codeEl.value = defaultCode;

    function collect() {
      var o = {};
      left.querySelectorAll('.lab-in').forEach(function (t) {
        var raw = t.value.trim();
        var k = t.getAttribute('data-key');
        try {
          var v = JSON.parse(raw);
          if (typeof v === 'object' || typeof v === 'number') { o[k] = v; return; }
        } catch (e) { }
        var parts = raw.split(/[\s,，、]+/).filter(function (x) { return x !== ''; });
        /* 只有一个片段且不是数字 → 当作普通字符串（如主串 "abababca"） */
        if (parts.length <= 1) { o[k] = raw; return; }
        o[k] = parts.map(function (x) { var n = Number(x); return isNaN(n) ? x : n; });
      });
      return o;
    }

    function print(cls, s) {
      var d = document.createElement('div');
      if (cls) d.className = cls;
      d.textContent = s;
      outEl.appendChild(d);
    }

    function runCode() {
      outEl.innerHTML = '';
      var input = collect();
      var logs = [];
      var t0 = (w.performance && performance.now) ? performance.now() : Date.now();
      function log() {
        if (logs.length >= 600) return;
        var parts = [];
        for (var i = 0; i < arguments.length; i++) {
          var a = arguments[i];
          parts.push(typeof a === 'object' ? JSON.stringify(a) : String(a));
        }
        logs.push(parts.join(' '));
      }
      try {
        var fn = new Function('input', 'log', codeEl.value);
        var res = fn(input, log);
        var t1 = (w.performance && performance.now) ? performance.now() : Date.now();
        logs.forEach(function (l) { print('dim', '› ' + l); });
        print('ok', '✓ 返回值：' + fmt(res));
        print('kw', '⏱ 耗时：' + (t1 - t0).toFixed(3) + ' ms（仅供参考）');
        print('dim', '共输出 ' + logs.length + ' 条过程日志');
      } catch (e) {
        logs.forEach(function (l) { print('dim', '› ' + l); });
        print('err', '✗ 运行出错：' + (e && e.message ? e.message : String(e)));
      }
    }

    left.querySelector('.lab-run').onclick = runCode;
    left.querySelector('.lab-reset').onclick = function () { codeEl.value = defaultCode; outEl.innerHTML = ''; print('dim', '已恢复默认代码。'); };
    left.querySelector('.lab-clear').onclick = function () { outEl.innerHTML = ''; };
  }

  w.Runner = { create: build };
})(window);
