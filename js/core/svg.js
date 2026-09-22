/* 原生 SVG 场景渲染器：支持 array（条形/格子）、grid（DP 表格）、nodes（链表/树/图） */
(function (w) {
  var C = {
    idle:   { fill: '#e8edf5', stroke: '#cbd5e1', text: '#334155' },
    dim:    { fill: '#f4f6fa', stroke: '#e6ebf2', text: '#aab3c2' },
    cmp:    { fill: '#fde68a', stroke: '#f59e0b', text: '#78350f' },
    swap:   { fill: '#fecaca', stroke: '#ef4444', text: '#7f1d1d' },
    done:   { fill: '#bbf7d0', stroke: '#22c55e', text: '#14532d' },
    pivot:  { fill: '#ddd6fe', stroke: '#8b5cf6', text: '#4c1d95' },
    target: { fill: '#bfdbfe', stroke: '#3b82f6', text: '#1e3a8a' },
    found:  { fill: '#6ee7b7', stroke: '#059669', text: '#064e3b' },
    active: { fill: '#fed7aa', stroke: '#f97316', text: '#7c2d12' },
    key:    { fill: '#c7d2fe', stroke: '#6366f1', text: '#312e81' },
    dead:   { fill: '#eceff4', stroke: '#b6bfcd', text: '#8a94a6' },
    queue:  { fill: '#fbcfe8', stroke: '#ec4899', text: '#831843' },
    path:   { fill: '#a5f3fc', stroke: '#06b6d4', text: '#164e63' }
  };
  function col(s) { return C[s] || C.idle; }

  function esc(s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function txt(x, y, s, opt) {
    opt = opt || {};
    return '<text x="' + x + '" y="' + y + '" text-anchor="' + (opt.anchor || 'middle') + '" ' +
      'font-family="' + (opt.mono ? 'ui-monospace,Consolas,Menlo,monospace' : '-apple-system,\'PingFang SC\',\'Microsoft YaHei\',sans-serif') + '" ' +
      'font-size="' + (opt.size || 13) + '" ' +
      (opt.weight ? 'font-weight="' + opt.weight + '" ' : '') +
      'fill="' + (opt.fill || '#334155') + '">' + esc(s) + '</text>';
  }
  function isNum(v) { return typeof v === 'number' ? true : (v !== '' && v !== null && v !== undefined && !isNaN(Number(v))); }

  /* ---------- 1. 数组 / 字符串 ---------- */
  function renderArray(spec) {
    var rows = spec.rows || [];
    if (!rows.length) return '';
    var n = 1;
    rows.forEach(function (r) { n = Math.max(n, r.items.length); });

    var numeric = true;
    rows.forEach(function (r) {
      r.items.forEach(function (it) { if (!isNum(it.v)) numeric = false; });
    });
    var mode = spec.mode || (numeric ? 'bar' : 'cell');

    var W = 760, padX = 14, gap = n > 30 ? 3 : (n > 18 ? 5 : 9);
    var bw = (W - padX * 2 - gap * (n - 1)) / n;
    bw = Math.max(15, Math.min(66, bw));
    var totalW = bw * n + gap * (n - 1);
    var startX = (W - totalW) / 2;

    var rowH = mode === 'bar' ? 208 : 96;
    var H = rows.length * rowH + 14;
    var out = '';

    rows.forEach(function (row, ri) {
      var top = ri * rowH + 8;
      var items = row.items;
      var base = mode === 'bar' ? top + 168 : top + 46;
      var vmax = -Infinity, vmin = Infinity;
      items.forEach(function (it) { var v = Number(it.v); if (isNum(it.v)) { if (v > vmax) vmax = v; if (v < vmin) vmin = v; } });
      if (vmax === -Infinity) { vmax = 1; vmin = 0; }
      if (vmax === vmin) { vmax = vmin + 1; }

      if (row.label) out += txt(startX, top + 2, row.label, { size: 11.5, fill: '#98a2b3', anchor: 'start' });

      items.forEach(function (it, i) {
        var x = startX + i * (bw + gap);
        var st = col(it.s);
        var cx = x + bw / 2;
        var h, y;
        if (mode === 'bar') {
          var ratio = isNum(it.v) ? (Number(it.v) - vmin) / (vmax - vmin) : 0;
          h = 22 + ratio * 132;
          y = base - h;
          out += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) +
            '" height="' + h.toFixed(1) + '" rx="5" fill="' + st.fill + '" stroke="' + st.stroke + '" stroke-width="1.4"/>';
          if (h >= 26) out += txt(cx, y + 16, it.v, { size: Math.min(13, bw - 4), fill: st.text, weight: 600, mono: true });
          else out += txt(cx, y - 5, it.v, { size: Math.min(12, bw - 2), fill: st.text, weight: 600, mono: true });
        } else {
          h = 40; y = base - h;
          out += '<rect x="' + x.toFixed(1) + '" y="' + y + '" width="' + bw.toFixed(1) +
            '" height="' + h + '" rx="6" fill="' + st.fill + '" stroke="' + st.stroke + '" stroke-width="1.4"/>';
          out += txt(cx, y + 25, it.v, { size: Math.min(14, bw - 3), fill: st.text, weight: 600, mono: true });
        }
        out += txt(cx, base + 15, i, { size: 10.5, fill: '#a3aec0', mono: true });
        if (it.tag) out += txt(cx, base + 29, it.tag, { size: 9.5, fill: '#8a94a6' });
      });

      /* 指针 */
      var used = {};
      (row.ptrs || []).forEach(function (p) {
        if (p.idx == null || p.idx < 0 || p.idx >= items.length) return;
        var k = p.idx; used[k] = (used[k] || 0) + 1;
        var x = startX + p.idx * (bw + gap) + bw / 2;
        var yy = base + 34 + (used[k] - 1) * 19;
        var c = p.color || '#4f46e5';
        out += '<path d="M' + (x - 5) + ' ' + (yy - 7) + ' L' + (x + 5) + ' ' + (yy - 7) + ' L' + x + ' ' + (yy + 1) + ' Z" fill="' + c + '"/>';
        out += '<rect x="' + (x - 17) + '" y="' + (yy + 1) + '" width="34" height="16" rx="5" fill="' + c + '"/>';
        out += txt(x, yy + 12.5, p.name, { size: 11, fill: '#fff', weight: 700, mono: true });
      });
    });
    return wrap(W, H, out, spec.caption);
  }

  /* ---------- 2. 表格（DP / 距离表） ---------- */
  function renderGrid(spec) {
    var cells = spec.cells || [];
    var rows = cells.length, cols = rows ? cells[0].length : 0;
    var cw = spec.cellW || 48, chh = spec.cellH || 38;
    var lw = spec.labelW || 58, lh = spec.labelH || 30;
    var W = lw + cols * cw + 20;
    var H = lh + rows * chh + 20;
    var out = '';

    (spec.colLabels || []).forEach(function (t, c) {
      out += txt(lw + c * cw + cw / 2, lh - 10, t, { size: 11.5, fill: '#8a94a6', mono: true });
    });
    (spec.rowLabels || []).forEach(function (t, r) {
      out += txt(lw - 8, lh + r * chh + chh / 2 + 4, t, { size: 11.5, fill: '#8a94a6', anchor: 'end', mono: true });
    });

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var cell = cells[r][c] || { v: '', s: 'idle' };
        var st = col(cell.s);
        var x = lw + c * cw, y = lh + r * chh;
        out += '<rect x="' + x + '" y="' + y + '" width="' + (cw - 3) + '" height="' + (chh - 3) + '" rx="6" fill="' +
          st.fill + '" stroke="' + st.stroke + '" stroke-width="1.3"/>';
        out += txt(x + (cw - 3) / 2, y + chh / 2 + 1, cell.v, { size: 12.5, fill: st.text, mono: true, weight: 600 });
      }
    }
    if (spec.hl) {
      var hx = lw + spec.hl.c * cw, hy = lh + spec.hl.r * chh;
      out += '<rect x="' + (hx - 2) + '" y="' + (hy - 2) + '" width="' + (cw + 1) + '" height="' + (chh + 1) +
        '" rx="8" fill="none" stroke="#f97316" stroke-width="2.4"/>';
    }
    (spec.arrows || []).forEach(function (a) {
      var x1 = lw + a.c1 * cw + cw / 2, y1 = lh + a.r1 * chh + chh / 2;
      var x2 = lw + a.c2 * cw + cw / 2, y2 = lh + a.r2 * chh + chh / 2;
      out += '<path d="M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + '" stroke="#f97316" stroke-width="1.6" fill="none" marker-end="url(#ar-orange)"/>';
    });
    return wrap(W, H, out, spec.caption);
  }

  /* ---------- 3. 节点图（链表 / 树 / 图） ---------- */
  function renderNodes(spec) {
    var nodes = spec.nodes || [], edges = spec.edges || [];
    if (!nodes.length) return wrap(340, 90, txt(170, 50, '（暂无节点）', { size: 13, fill: '#98a2b3' }));
    var map = {};
    nodes.forEach(function (nd) { map[nd.id] = nd; });

    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach(function (nd) {
      var hw = nd.shape === 'circle' ? 22 : (nd.w ? nd.w / 2 : 23);
      var hh = nd.shape === 'circle' ? 22 : (nd.h ? nd.h / 2 : 18);
      minX = Math.min(minX, nd.x - hw); maxX = Math.max(maxX, nd.x + hw);
      minY = Math.min(minY, nd.y - hh); maxY = Math.max(maxY, nd.y + hh);
    });
    var pad = 34;
    var W = Math.max(240, maxX - minX + pad * 2);
    var H = Math.max(140, maxY - minY + pad * 2);
    var ox = pad - minX, oy = pad - minY;
    var out = '';

    function center(nd) {
      return { x: nd.x + ox, y: nd.y + oy };
    }
    function radius(nd, dx, dy) {
      if (nd.shape === 'circle') return 23;
      var hw = (nd.w || 46) / 2, hh = (nd.h || 36) / 2;
      var ang = Math.atan2(dy, dx);
      var tx = Math.abs(hw / Math.cos(ang)), ty = Math.abs(hh / Math.sin(ang));
      if (isNaN(tx)) tx = ty; if (isNaN(ty)) ty = tx;
      return Math.min(tx, ty) + 5;
    }

    edges.forEach(function (e) {
      var a = map[e.from], b = map[e.to];
      if (!a || !b) return;
      var pa = center(a), pb = center(b);
      var dx = pb.x - pa.x, dy = pb.y - pa.y;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      var ux = dx / len, uy = dy / len;
      var ra = radius(a, ux, uy), rb = radius(b, -ux, -uy);
      var x1 = pa.x + ux * ra, y1 = pa.y + uy * ra;
      var x2 = pb.x - ux * rb, y2 = pb.y - uy * rb;
      var st = col(e.s || 'idle');
      var stroke = e.s === 'done' ? '#22c55e' : (e.s === 'active' ? '#f97316' : (e.s === 'key' ? '#6366f1' : (e.s === 'dead' ? '#cbd5e1' : '#94a3b8')));
      var dash = e.dashed ? ' stroke-dasharray="5 4"' : '';
      var marker = e.dir === false ? '' : ' marker-end="url(#ar-' + (e.s === 'done' ? 'green' : (e.s === 'active' ? 'orange' : (e.s === 'key' ? 'indigo' : 'gray'))) + ')"';
      if (e.curve) {
        var mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - e.curve;
        out += '<path d="M' + x1 + ' ' + y1 + ' Q' + mx + ' ' + my + ' ' + x2 + ' ' + y2 + '" fill="none" stroke="' + stroke +
          '" stroke-width="' + (e.wide ? 2.6 : 1.8) + '"' + dash + marker + '/>';
      } else {
        out += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + stroke +
          '" stroke-width="' + (e.wide ? 2.6 : 1.8) + '"' + dash + marker + '/>';
      }
      if (e.label) {
        var lx = (x1 + x2) / 2 + (e.lx || 0), ly = (y1 + y2) / 2 + (e.ly || -4);
        out += '<rect x="' + (lx - 11) + '" y="' + (ly - 9) + '" width="22" height="15" rx="4" fill="#fff" stroke="' + stroke + '" stroke-width="1"/>';
        out += txt(lx, ly + 2, e.label, { size: 10.5, fill: '#475569', mono: true, weight: 600 });
      }
    });

    nodes.forEach(function (nd) {
      var p = center(nd);
      var st = col(nd.s || 'idle');
      if (nd.shape === 'circle') {
        out += '<circle cx="' + p.x + '" cy="' + p.y + '" r="22" fill="' + st.fill + '" stroke="' + st.stroke + '" stroke-width="1.8"/>';
        out += txt(p.x, p.y + (nd.sub ? 0 : 5), nd.label, { size: 13, fill: st.text, weight: 700, mono: true });
        if (nd.sub) out += txt(p.x, p.y + 13, nd.sub, { size: 9.5, fill: st.text });
      } else {
        var ww = nd.w || 46, hh = nd.h || 36;
        out += '<rect x="' + (p.x - ww / 2) + '" y="' + (p.y - hh / 2) + '" width="' + ww + '" height="' + hh +
          '" rx="8" fill="' + st.fill + '" stroke="' + st.stroke + '" stroke-width="1.6"/>';
        out += txt(p.x, p.y + (nd.sub ? 1 : 5), nd.label, { size: 13, fill: st.text, weight: 700, mono: true });
        if (nd.sub) out += txt(p.x, p.y + 14, nd.sub, { size: 9.5, fill: st.text });
      }
      if (nd.badge) {
        out += '<circle cx="' + (p.x + 18) + '" cy="' + (p.y - 14) + '" r="9" fill="#4f46e5"/>';
        out += txt(p.x + 18, p.y - 10, nd.badge, { size: 10, fill: '#fff', weight: 700, mono: true });
      }
    });
    return wrap(W, H, out, spec.caption);
  }

  var DEFS =
    '<defs>' +
    '<marker id="ar-gray" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#94a3b8"/></marker>' +
    '<marker id="ar-orange" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#f97316"/></marker>' +
    '<marker id="ar-green" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#22c55e"/></marker>' +
    '<marker id="ar-indigo" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#6366f1"/></marker>' +
    '<marker id="ar-pink" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#ec4899"/></marker>' +
    '</defs>';

  function wrap(W, H, inner, caption) {
    var s = '<svg viewBox="0 0 ' + W.toFixed(0) + ' ' + H.toFixed(0) + '" preserveAspectRatio="xMidYMid meet" role="img">' + DEFS + inner + '</svg>';
    if (caption) s += '<div class="viz-caption">' + esc(caption) + '</div>';
    return s;
  }

  w.SVGR = {
    color: col,
    esc: esc,
    scene: function (spec) {
      if (!spec) return '';
      if (spec.kind === 'grid') return renderGrid(spec);
      if (spec.kind === 'nodes') return renderNodes(spec);
      return renderArray(spec);
    },
    render: function (el, specOrList) {
      var list = Array.isArray(specOrList) ? specOrList : [specOrList];
      var html = '';
      list.forEach(function (sp) { html += SVGR.scene(sp); });
      el.innerHTML = html || '<div class="viz-caption">（本节无动画场景）</div>';
    }
  };
})(window);
