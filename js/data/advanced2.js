/* ============ 进阶篇（二） ============ */

/* ------------------------------------------------------------------ */
L({
  id: 'dp-advanced',
  level: 'advanced',
  title: '动态规划进阶：最长公共子序列与 LIS',
  subtitle: '二维 DP 的经典形态：两个序列比一比，填一张表就能出答案。',
  prereq: ['dp-basic'],
  minutes: 45,
  tags: ['动态规划', 'LCS', 'LIS'],

  analogyTitle: '两段字幕找「共同部分」，像做文字差异对比',
  analogy: [
    '你有两段字幕文本，想知道它们有多少内容是一样的（比如用来比对两个版本的差异）。你不会去枚举所有可能的子序列（那是 2ⁿ 种），而是画一张<strong>表格</strong>：横轴是 B 的前 j 个字符，纵轴是 A 的前 i 个字符，格子里填「这两个前缀的最长公共子序列长度」。',
    '填表规则极其简单：<strong>当前两字符相同就「左上角 +1」，不同就「取上方和左方的较大者」</strong>。整张表填完，右下角那个数字就是答案。这就是二维 DP 最标准的样子。'
  ],

  idea: [
    '<strong>LCS 状态</strong>：dp[i][j] = A 的前 i 个字符与 B 的前 j 个字符的 LCS 长度。',
    '<strong>转移</strong>：若 A[i-1]==B[j-1] → dp[i][j] = dp[i-1][j-1] + 1；否则 dp[i][j] = max(dp[i-1][j], dp[i][j-1])。',
    '<strong>LIS 状态</strong>：dp[i] = 以 a[i] <strong>结尾</strong>的最长递增子序列长度（注意必须以 i 结尾，这才构成最优子结构）。',
    '<strong>LIS 的 O(n log n) 优化</strong>：维护 tails 数组，tails[k] = 长度 k+1 的递增子序列的<strong>最小结尾</strong>，用二分找插入位置——「贪心 + 二分 + DP」的经典组合。'
  ],
  when: [
    '两个序列的「匹配 / 相似度 / 差异」问题 → LCS 及其变体（编辑距离是它的升级版）。',
    '「最长 / 最多的子序列」类问题 → LIS。',
    '看到两个字符串 / 数组，第一反应就应该是二维 DP。'
  ],

  steps: [
    { t: '画表：行 = A 的前 i 个，列 = B 的前 j 个，第 0 行 / 第 0 列全 0', why: '「空串与任何串的 LCS 都是 0」，这是递推的起点。' },
    { t: '逐格填：若当前两字符相等，取左上角 +1', why: '两个字符匹配上了，它们必然可以接在「去掉这两个字符之后的子问题」的后面，长度 +1。' },
    { t: '若不等，取 max(上方, 左方)', why: '匹配不上时，LCS 只能来自「A 少用一个字符」或「B 少用一个字符」两种情况之一，取较大的即可。' },
    { t: '右下角 dp[n][m] 即答案；若要还原序列，从右下角回溯', why: '回溯规则：相等则斜着走并记下字符；不等则往值大的方向走。' },
    { t: 'LIS：dp[i] = max(dp[j]) + 1（j<i 且 a[j]<a[i]）', why: '「以 i 结尾」这个限定很关键——它把子序列的末尾固定住，使转移只依赖前面的 dp[j]，具备最优子结构。' }
  ],

  pseudo: [
    '// LCS',
    'for i = 1 .. n:',
    '    for j = 1 .. m:',
    '        if A[i-1] == B[j-1]:',
    '            dp[i][j] = dp[i-1][j-1] + 1        // 相等：左上角 +1',
    '        else:',
    '            dp[i][j] = max(dp[i-1][j], dp[i][j-1])',
    '',
    '// LIS（O(n^2)）',
    'for i = 0 .. n-1:',
    '    dp[i] = 1',
    '    for j = 0 .. i-1:',
    '        if a[j] < a[i]: dp[i] = max(dp[i], dp[j] + 1)',
    '',
    '// LIS（O(n log n)：tails + 二分）',
    'tails = []',
    'for x in a:',
    '    pos = lowerBound(tails, x)    // 第一个 >= x 的位置',
    '    if pos == len(tails): tails.push(x)',
    '    else: tails[pos] = x          // 用更小的结尾替换',
    'return len(tails)'
  ],

  anim: {
    fields: [
      { key: 'a', kind: 'array', def: '[3,1,4,1,5,9,2,6]' },
      { key: 'b', kind: 'array', def: '[1,2,3,4]' }
    ],
    legend: [['active', '正在计算'], ['key', '依赖的格子'], ['done', '已填好'], ['dim', '未填']],
    gen: function (v) {
      var A = v.a.slice(0, 8), B = v.b.slice(0, 6);
      var n = A.length, m = B.length, steps = [], hl = {}, filled = [];
      var dp = []; for (var i = 0; i <= n; i++) dp.push(new Array(m + 1).fill(0));
      function scene() {
        return {
          kind: 'grid', cellW: 42, cellH: 38, labelW: 58, labelH: 30,
          rowLabels: ['空'].concat(A.map(function (x, i) { return 'A' + (i + 1) + ':' + x; })),
          colLabels: ['空'].concat(B.map(function (x, i) { return 'B' + (i + 1) + ':' + x; })),
          cells: dp.map(function (row, r) {
            return row.map(function (x, c) {
              var s = 'dim';
              if (hl.cur && hl.cur[0] === r && hl.cur[1] === c) s = 'active';
              else if (hl.dep && hl.dep.some(function (p) { return p[0] === r && p[1] === c; })) s = 'key';
              else if (filled.some(function (p) { return p[0] === r && p[1] === c; })) s = 'done';
              return { v: x, s: s };
            });
          }),
          caption: 'A = ' + A.join(' ') + '   B = ' + B.join(' ') + '（黄=依赖的格子，橙=当前）'
        };
      }
      function push(line, log) {
        steps.push({ line: line, scenes: [scene()], log: log, vars: {} });
      }
      for (var c0 = 0; c0 <= m; c0++) filled.push([0, c0]);
      for (var r0 = 0; r0 <= n; r0++) filled.push([r0, 0]);
      push(0, 'A = ' + A.join(' ') + '，B = ' + B.join(' ') + '。第 0 行 / 第 0 列初始化为 0');
      for (var i = 1; i <= n; i++) {
        for (var j = 1; j <= m; j++) {
          hl = { cur: [i, j] };
          if (A[i - 1] === B[j - 1]) {
            hl.dep = [[i - 1, j - 1]];
            push(3, 'A[' + (i - 1) + ']=' + A[i - 1] + ' 与 B[' + (j - 1) + ']=' + B[j - 1] + ' 相等 → 取左上角 dp[' + (i - 1) + '][' + (j - 1) + ']=' + dp[i - 1][j - 1] + ' 再加 1');
            dp[i][j] = dp[i - 1][j - 1] + 1;
          } else {
            hl.dep = [[i - 1, j], [i, j - 1]];
            push(5, 'A[' + (i - 1) + ']=' + A[i - 1] + ' ≠ B[' + (j - 1) + ']=' + B[j - 1] + ' → 取 max(上 ' + dp[i - 1][j] + ', 左 ' + dp[i][j - 1] + ')');
            dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          }
          filled.push([i, j]);
          push(5, 'dp[' + i + '][' + j + '] = ' + dp[i][j]);
        }
      }
      hl = {};
      push(6, 'LCS 长度 = dp[' + n + '][' + m + '] = ' + dp[n][m]);
      return steps;
    }
  },

  run: {
    inputs: [
      { key: 'a', label: '数组 / 字符串 A', def: '[3,1,4,1,5,9,2,6]' },
      { key: 'b', label: '数组 / 字符串 B（LCS 用）', def: '[1,2,3,4]' }
    ],
    code:
      'const A = input.a, B = input.b, n = A.length, m = B.length;\n' +
      '// —— LCS ——\n' +
      'const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));\n' +
      'for (let i = 1; i <= n; i++)\n' +
      '  for (let j = 1; j <= m; j++)\n' +
      '    dp[i][j] = (A[i-1] === B[j-1]) ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);\n' +
      'log("LCS 长度 =", dp[n][m]);\n' +
      '// 回溯出一个具体的 LCS\n' +
      'const seq = []; let i = n, j = m;\n' +
      'while (i > 0 && j > 0) {\n' +
      '  if (A[i-1] === B[j-1]) { seq.push(A[i-1]); i--; j--; }\n' +
      '  else if (dp[i-1][j] >= dp[i][j-1]) i--; else j--;\n' +
      '}\n' +
      'seq.reverse();\n' +
      'log("其中一个 LCS =", seq.join(" "));\n' +
      '// —— LIS：O(n^2) 与 O(n log n) 对照 ——\n' +
      'const d2 = new Array(n).fill(1);\n' +
      'for (let i = 0; i < n; i++) for (let j = 0; j < i; j++) if (A[j] < A[i]) d2[i] = Math.max(d2[i], d2[j] + 1);\n' +
      'const tails = [];\n' +
      'for (const x of A) {\n' +
      '  let l = 0, r = tails.length;\n' +
      '  while (l < r) { const mid = (l + r) >> 1; if (tails[mid] < x) l = mid + 1; else r = mid; }\n' +
      '  if (l === tails.length) tails.push(x); else tails[l] = x;\n' +
      '}\n' +
      'log("LIS 长度(O(n^2)) =", Math.max(0, ...d2), "  LIS 长度(O(n log n)) =", tails.length);\n' +
      'return { LCS长度: dp[n][m], 一个LCS: seq.join(""), LIS长度: tails.length, tails数组: tails };'
  },

  complexity: {
    best: 'LCS O(nm) / LIS O(n log n)', avg: 'LCS O(nm)', worst: 'LCS O(nm)', space: 'LCS O(nm) → O(m)；LIS O(n)', stable: '—',
    detail: [
      'LCS：表格有 (n+1)(m+1) 格，每格 O(1) → 时间 O(nm)，空间 O(nm)。因为 dp[i][j] 只依赖「上一行与同一行的左边」，可以压成一维数组 + 一个变量保存左上角 → O(m)。',
      'LIS：朴素 O(n²)；tails + 二分 O(n log n)。tails 数组本身<strong>不是</strong>所求的子序列，只有它的<strong>长度</strong>是正确答案——要还原序列需要额外记录前驱。'
    ],
    table: [
      ['问题', '朴素', '优化', '空间'],
      ['LCS', 'O(nm)', '滚动数组 O(m) 空间', 'O(m)'],
      ['编辑距离', 'O(nm)', '同 LCS', 'O(m)'],
      ['LIS', 'O(n²)', 'tails + 二分 → O(n log n)', 'O(n)']
    ]
  },

  quiz: [
    {
      q: 'LCS 中如果两个字符相等，dp[i][j] 应该取？',
      options: ['max(上, 左)', '左上角 + 1', '左上角', '上 + 1'],
      answer: 1,
      hint: '这两个字符匹配上了，就等于「在去掉它们之后的子问题答案」基础上再加一个匹配。',
      why: 'dp[i-1][j-1] + 1。'
    },
    {
      q: 'LIS 的状态为什么定义为「以 a[i] 结尾的」而不是「前 i 个中的」？',
      options: ['前者更好算', '只有固定结尾，才能用「更小的前一个元素」拼出转移（具备最优子结构）', '两者等价', '为了省空间'],
      answer: 1,
      hint: '如果只知道「前 i 个中的 LIS 长度」，你不知道它的末尾是多少，就无法判断 a[i+1] 能不能接上去。',
      why: '固定结尾才满足最优子结构。'
    },
    {
      q: 'LIS 的 tails 优化中，tails[k] 的含义是？',
      options: ['长度 k+1 的递增子序列的最小结尾', '第 k 个元素', '以 k 结尾的子序列长度', '答案序列本身'],
      answer: 0,
      hint: '为什么存「最小结尾」？结尾越小，后面越容易接上更长的序列——这就是这里的贪心思想。',
      why: '最小结尾 + 二分替换。'
    },
    {
      q: 'LCS 的空间从 O(nm) 压到 O(m)，需要额外保存什么？',
      options: ['上一行', '左上角那个值 dp[i-1][j-1]', '整个矩阵', '不需要额外保存'],
      answer: 1,
      hint: '一维数组里，dp[j-1] 是「左边」，dp[j] 更新前是「上方」。那「左上角」在更新过程中会被覆盖，得提前用一个变量存住。',
      why: '用 prev 变量保存左上角。'
    }
  ],

  practice: [
    {
      title: '动手题 1 · 编辑距离',
      desc: '把单词 A 变成 B，允许插入、删除、替换一个字符，求最少操作次数。定义 dp[i][j] 并写出三种操作的转移。',
      hint: 'dp[i][j] = A 前 i 个变成 B 前 j 个的最少步数。三种来源：删（dp[i-1][j]+1）、插（dp[i][j-1]+1）、替换或不变（dp[i-1][j-1] + (不等 ? 1 : 0)）。',
      solution:
        'function editDistance(A, B) {\n' +
        '  const n = A.length, m = B.length;\n' +
        '  const dp = Array.from({ length: n + 1 }, (_, i) => [i].concat(new Array(m).fill(0)));\n' +
        '  for (let j = 0; j <= m; j++) dp[0][j] = j;\n' +
        '  for (let i = 1; i <= n; i++)\n' +
        '    for (let j = 1; j <= m; j++)\n' +
        '      dp[i][j] = Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + (A[i-1] === B[j-1] ? 0 : 1));\n' +
        '  return dp[n][m];\n' +
        '}\n' +
        '// 时间 O(nm)，空间可压到 O(m)'
    },
    {
      title: '动手题 2 · 最长递增子序列的个数',
      desc: '在求 LIS 长度的同时，统计一共有多少条长度等于 LIS 的递增子序列。需要同时维护 len[i] 和 cnt[i] 两个数组。',
      hint: 'len[i] = 以 i 结尾的 LIS 长度；cnt[i] = 以 i 结尾、长度为 len[i] 的子序列条数。当 j 能接上 i 时：若 len[j]+1 > len[i] 则重新计数，若相等则累加。',
      solution:
        'function findNumberOfLIS(a) {\n' +
        '  const n = a.length, len = new Array(n).fill(1), cnt = new Array(n).fill(1);\n' +
        '  for (let i = 0; i < n; i++)\n' +
        '    for (let j = 0; j < i; j++)\n' +
        '      if (a[j] < a[i]) {\n' +
        '        if (len[j] + 1 > len[i]) { len[i] = len[j] + 1; cnt[i] = cnt[j]; }\n' +
        '        else if (len[j] + 1 === len[i]) cnt[i] += cnt[j];\n' +
        '      }\n' +
        '  const mx = Math.max(0, ...len);\n' +
        '  let ans = 0;\n' +
        '  for (let i = 0; i < n; i++) if (len[i] === mx) ans += cnt[i];\n' +
        '  return ans;\n' +
        '}\n' +
        '// 时间 O(n²)'
    }
  ]
});

/* ------------------------------------------------------------------ */
L({
  id: 'greedy',
  level: 'advanced',
  title: '贪心算法：每一步都选「当前看起来最好」的',
  subtitle: '简单、快，但只对特定结构的问题正确——证明它能用，比写它难得多。',
  prereq: ['dp-basic'],
  minutes: 30,
  tags: ['贪心', '区间调度', '反例'],

  analogyTitle: '一天里排最多场电影：永远选「结束最早」的',
  analogy: [
    '你有一堆电影的起止时间，想在一天里看尽量多场。策略是什么？<strong>每次都选「在可看的里面，结束最早的那一场」</strong>。直觉上很合理：早早结束，剩下的时间才最多，才有机会再看更多场。这个贪心策略恰好是最优的。',
    '但换个问题——<strong>背包问题</strong>：容量 10 的背包，物品有重量和价值。「每次拿价值最高的」显然不对（可能占满容量但总价值低）；「每次拿最轻的」也不对；「每次拿性价比最高的」在 0-1 背包里同样不是最优。<strong>这就是贪心的陷阱：它看起来很自然，但只对部分问题成立。</strong>'
  ],

  idea: [
    '<strong>贪心的本质</strong>：不做全局搜索，每一步只做局部最优选择，且<strong>不回头</strong>。',
    '<strong>能用的两个条件</strong>：① 贪心选择性质（局部最优能扩展成全局最优）② 最优子结构。',
    '<strong>区间调度</strong>的正确策略：按<strong>结束时间</strong>排序，依次选「开始时间 ≥ 上一个结束时间」中最早结束的那个。',
    '<strong>常见反例</strong>：0-1 背包不能用贪心（要 DP）；找零钱在某些面额组合下贪心失效；有负权边时 Dijkstra 失效。'
  ],
  when: [
    '问题具有「贪心选择性质」：区间调度、Huffman 编码、最小生成树（Prim/Kruskal）、Dijkstra（非负权）。',
    '拿不准时先构造反例——构造不出来再尝试证明（常用<strong>交换论证</strong>：把最优解里的某个元素换成贪心选择，不会变差）。',
    '求「所有方案」或问题有明显后效性 → 用 DP / 回溯。'
  ],

  steps: [
    { t: '先按「结束时间」从小到大排序', why: '我们想要「尽早腾出时间」，结束时间是唯一合理的排序依据。按开始时间或按持续时间排序都能构造出反例。' },
    { t: '维护 lastEnd，扫描每个区间', why: 'lastEnd 代表当前已占用到的时间点，是判断「能不能再选一个」的唯一依据。' },
    { t: '若 start ≥ lastEnd：选它，lastEnd = end', why: '不冲突就选：它结束得最早，留下的时间最多，这正是贪心选择性质。' },
    { t: '否则跳过', why: '与已选区间冲突，只能放弃——注意这里不回头重选，这就是贪心「不后悔」的特点。' },
    { t: '验证：尝试构造反例', why: '贪心最危险的地方是「看起来对」。用交换论证：假设最优解第一个选的是 X（结束 ≥ 贪心选的 G），把 X 换成 G 后仍然可行且数量不减 → 贪心选择安全。' }
  ],

  pseudo: [
    '// 区间调度：最多能安排多少个互不冲突的区间',
    '按结束时间升序排序',
    'lastEnd = -∞; count = 0',
    'for (s, e) in intervals:',
    '    if s >= lastEnd:          // 不冲突',
    '        选中它; count++',
    '        lastEnd = e           // 更新可用起始时间',
    'return count'
  ],

  anim: {
    fields: [{ key: 'intervals', kind: 'array', def: '[1,10,2,3,4,5,6,7]' }],
    legend: [['active', '正在考虑'], ['done', '已选中'], ['dead', '冲突被跳过'], ['dim', '未考虑']],
    gen: function (v) {
      var flat = v.intervals.slice(0, 12);
      var ivs = [];
      for (var i = 0; i + 1 < flat.length; i += 2) ivs.push({ s: flat[i], e: flat[i + 1], id: ivs.length });
      if (!ivs.length) ivs = [{ s: 1, e: 3, id: 0 }];
      var T = Math.max.apply(null, ivs.map(function (x) { return x.e; }));
      var steps = [];
      var state = ivs.map(function () { return 'dim'; });
      var lastEnd = -Infinity, count = 0;
      function scene() {
        return {
          kind: 'grid', cellW: 30, cellH: 30, labelW: 58, labelH: 26,
          rowLabels: ivs.map(function (x) { return '[' + x.s + ',' + x.e + ']'; }),
          colLabels: Array.from({ length: T + 1 }, function (_, t) { return t; }),
          cells: ivs.map(function (x, r) {
            return Array.from({ length: T + 1 }, function (_, t) {
              var inside = t >= x.s && t < x.e;
              return { v: inside ? '▬' : '', s: inside ? state[r] : 'dim' };
            });
          }),
          caption: '每行一个区间，横轴是时间。绿=选中，灰=跳过，橙=正在判断'
        };
      }
      function push(line, log) {
        steps.push({ line: line, scenes: [scene()], log: log, vars: {} });
      }
      push(1, '原始区间：' + ivs.map(function (x) { return '[' + x.s + ',' + x.e + ']'; }).join(' '));
      var sorted = ivs.slice().sort(function (a, b) { return a.e - b.e; });
      push(1, '按结束时间排序：' + sorted.map(function (x) { return '[' + x.s + ',' + x.e + ']'; }).join(' '));
      sorted.forEach(function (iv) {
        state[iv.id] = 'active';
        push(4, '考虑 [' + iv.s + ',' + iv.e + ']：开始 ' + iv.s + (lastEnd === -Infinity ? '（还没有已选区间）' : ' 与上一个结束 ' + lastEnd + ' 比较'));
        if (iv.s >= lastEnd) {
          state[iv.id] = 'done'; lastEnd = iv.e; count++;
          push(6, '不冲突 → 选中！已选 ' + count + ' 个，可用起始时间更新为 ' + lastEnd);
        } else {
          state[iv.id] = 'dead';
          push(6, iv.s + ' < ' + lastEnd + ' → 与已选区间冲突，跳过');
        }
      });
      push(7, '结束：最多可安排 ' + count + ' 个互不冲突的区间');
      return steps;
    }
  },

  run: {
    inputs: [{ key: 'intervals', label: '区间（起始、结束依次排列）', def: '[1,10,2,3,4,5,6,7]' }],
    code:
      'const flat = input.intervals;\n' +
      'const ivs = [];\n' +
      'for (let i = 0; i + 1 < flat.length; i += 2) ivs.push({ s: flat[i], e: flat[i + 1] });\n' +
      'ivs.sort((a, b) => a.e - b.e);            // ① 按结束时间排序\n' +
      'log("排序后：", ivs.map(x => "[" + x.s + "," + x.e + "]").join(" "));\n' +
      'let lastEnd = -Infinity, count = 0; const chosen = [];\n' +
      'for (const iv of ivs) {\n' +
      '  if (iv.s >= lastEnd) { chosen.push(iv); count++; lastEnd = iv.e; log("选 [" + iv.s + "," + iv.e + "]"); }\n' +
      '  else log("跳过 [" + iv.s + "," + iv.e + "]  （与上一个结束 " + lastEnd + " 冲突）");\n' +
      '}\n' +
      '// 对照：错误地按「开始时间」排序\n' +
      'const wrong = ivs.slice().sort((a, b) => a.s - b.s);\n' +
      'let le = -Infinity, c2 = 0;\n' +
      'for (const iv of wrong) if (iv.s >= le) { c2++; le = iv.e; }\n' +
      'return { 贪心按结束时间: count, 选中: chosen.map(x => "[" + x.s + "," + x.e + "]"),\n' +
      '         对照_按开始时间: c2, 说明: "按开始时间排序不是最优策略，可构造反例" };'
  },

  complexity: {
    best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)（不计排序）', stable: '—',
    detail: [
      '排序 O(n log n) + 一次线性扫描 O(n) → 总 O(n log n)。若区间已按结束时间排好，扫描本身只要 O(n)。',
      '<strong>正确性（交换论证）</strong>：设最优解第一个区间是 X，贪心选的是 G（G 结束最早，即 e(G) ≤ e(X)）。把 X 替换成 G：由于 e(G) ≤ e(X)，替换后后续区间仍不冲突，数量不变 → 存在「以 G 开头的最优解」。对剩余子问题重复此论证即得贪心最优。'
    ],
    table: [
      ['问题', '贪心策略', '是否最优'],
      ['区间调度（最多场数）', '按结束时间选', '✓ 最优'],
      ['最小生成树', '每次取最小边（Kruskal / Prim）', '✓ 最优'],
      ['单源最短路（非负权）', '每次取距离最小的点（Dijkstra）', '✓ 最优'],
      ['0-1 背包', '按价值 / 性价比选', '✗ 反例存在 → 用 DP'],
      ['找零（面额非规范）', '每次取最大面额', '✗ 如 {1,3,4} 凑 6：贪心 4+1+1，最优 3+3']
    ]
  },

  quiz: [
    {
      q: '区间调度为什么按「结束时间」而不是「开始时间」排序？',
      options: ['结束时间更好算', '越早结束，留给后面的时间越多；按开始时间可构造反例', '因为区间一定有结束时间', '两者等价'],
      answer: 1,
      hint: '反例：[1,10]、[2,3]、[4,5]。按开始时间会先选 [1,10]，然后什么都选不了；按结束时间呢？',
      why: '按结束时间能留出最多后续空间。'
    },
    {
      q: '下面哪个问题<strong>不能</strong>用贪心求最优解？',
      options: ['活动选择（区间调度）', '最小生成树', '0-1 背包', 'Huffman 编码'],
      answer: 2,
      hint: '0-1 背包里「选了这个就装不下那个」，存在明显的后效性——局部最优拼不出全局最优。',
      why: '0-1 背包要用 DP。'
    },
    {
      q: '证明贪心正确性最常用的方法是？',
      options: ['数学归纳法直接证', '交换论证：把最优解里的选择换成贪心选择，结果不会变差', '举一个例子', '跑一遍测试'],
      answer: 1,
      hint: '核心思路是「存在一个以贪心选择开头的最优解」，然后递归到子问题。',
      why: '交换论证 + 归纳。'
    },
    {
      q: '面额 {1,3,4}，凑 6 元且硬币最少，贪心（每次取最大面额）得到？',
      options: ['3 枚（4+1+1）', '2 枚（3+3）', '6 枚', '凑不出'],
      answer: 0,
      hint: '贪心会先拿 4，剩 2 只能拿两个 1 → 3 枚。但最优是两个 3。这说明什么？',
      why: '贪心给 3 枚，最优 2 枚 → 贪心失效。'
    }
  ],

  practice: [
    {
      title: '动手题 1 · 用最少的箭头射爆气球',
      desc: '一堆区间（气球直径），一支箭从某点射出能击中所有包含该点的区间。求最少箭数。',
      hint: '按结束时间排序，维护「当前箭的位置」。若下一个区间的开始 > 箭的位置，就需要一支新箭（射在它的结束位置）。',
      solution:
        'function findMinArrowShots(points) {\n' +
        '  if (!points.length) return 0;\n' +
        '  points.sort((a, b) => a[1] - b[1]);      // 按右端点排序\n' +
        '  let arrows = 1, pos = points[0][1];      // 第一箭射在第一个的右端\n' +
        '  for (let i = 1; i < points.length; i++) {\n' +
        '    if (points[i][0] > pos) { arrows++; pos = points[i][1]; }\n' +
        '  }\n' +
        '  return arrows;\n' +
        '}\n' +
        '// 时间 O(n log n)，空间 O(1)'
    },
    {
      title: '动手题 2 · 给贪心找反例',
      desc: '「每次都选持续时间最短的区间」能不能得到最多的安排数量？如果不能，请给出一组反例数据。',
      hint: '试着构造：一个短区间夹在中间，选了它会导致左右两个区间都不能选。比如 [1,3]、[2,4]、[3,5]。',
      solution:
        '反例：[1,3]、[2,4]、[3,5]\n' +
        '· 按「持续时间最短」：三个长度都是 2，随便选一个（比如 [2,4]）后，\n' +
        '  剩下两个都冲突 → 只能选 1 个\n' +
        '· 按「结束时间最早」：选 [1,3]，再选 [3,5] → 可以选 2 个 ✓\n' +
        '结论：持续时间最短 ≠ 最优；只有「最早结束」才保证最优。'
    }
  ]
});

/* ------------------------------------------------------------------ */
L({
  id: 'graph-bfs-dfs',
  level: 'advanced',
  title: '图的遍历：BFS 找最近，DFS 走到底',
  subtitle: 'BFS 用队列一层层铺开（最短路），DFS 用栈一条路走到底（连通性、拓扑、回溯）。',
  prereq: ['stack-queue', 'recursion-basic'],
  minutes: 40,
  tags: ['图', 'BFS', 'DFS'],

  analogyTitle: '往水里丢石头 vs 一个人钻迷宫',
  analogy: [
    '<strong>BFS（广度优先）</strong>像往水里丢一块石头，涟漪从中心<strong>一圈一圈均匀向外扩散</strong>。所以「先被看到的一定是离中心最近的」——这就是 BFS 能求无权图最短路的原因。',
    '<strong>DFS（深度优先）</strong>像一个人钻迷宫：遇到岔路就挑一条<strong>一头扎到底</strong>，撞墙了才退回上一个岔路口换条路。它不保证「最先到达的是最近的」，但非常适合「把连通的地方一次走完」「判断能不能到达」「找出所有路径」。'
  ],

  idea: [
    '<strong>图的表示</strong>：邻接表（稀疏图首选，空间 O(V+E)）或邻接矩阵（稠密图 / 需要 O(1) 判边）。',
    '<strong>BFS</strong>：队列 + visited。每步取出队首，把未访问的邻居入队。<strong>层数 = 无权最短距离</strong>。',
    '<strong>DFS</strong>：栈（或递归）+ visited。一条路走到底再回退。可用于连通块计数、拓扑排序、找环。',
    '<strong>visited 必须加</strong>：图里可能有环，不加会无限循环。一般<strong>入队 / 入栈时就标记</strong>，避免重复入队。'
  ],
  when: [
    '无权图最短路径、最少步数、层序遍历 → BFS。',
    '连通性、迷宫是否有路、拓扑排序、找所有路径 → DFS。',
    '图很大且只要「能不能到达」→ DFS 更省内存（栈深 O(深度)，BFS 队列最宽可达 O(V)）。'
  ],

  steps: [
    { t: '建邻接表：adj[u] = u 的所有邻居', why: '遍历时只关心「从 u 能走到哪」，邻接表把无关的边全部过滤掉，总代价 O(V+E)。' },
    { t: 'BFS：起点入队并标记 visited', why: '起点距离为 0，是第 0 层。入队即标记，可避免同一个点被多个父节点重复入队。' },
    { t: '循环：出队一个点 u，遍历它的邻居 v', why: '队列的 FIFO 保证「先出队的一定是距离更近的」，这是 BFS 层序性的来源。' },
    { t: '若 v 未访问：dist[v] = dist[u] + 1，入队', why: '第一次被访问时的距离就是最短距离——因为它是由「最近的未处理层」扩展来的。' },
    { t: 'DFS：访问 u → 对每个未访问的邻居递归 dfs(v)', why: '递归天然就是栈：一直往下钻，钻不动了自动回退到上一层继续。' }
  ],

  pseudo: [
    '// BFS（无权图最短路）',
    'queue = [start]; visited[start] = true; dist[start] = 0',
    'while queue 非空:',
    '    u = queue.dequeue()',
    '    for v in adj[u]:',
    '        if not visited[v]:',
    '            visited[v] = true',
    '            dist[v] = dist[u] + 1',
    '            queue.enqueue(v)',
    '',
    '// DFS（递归）',
    'function dfs(u):',
    '    visited[u] = true',
    '    for v in adj[u]:',
    '        if not visited[v]: dfs(v)'
  ],

  anim: {
    fields: [{ key: 'mode', kind: 'text', label: '输入 BFS 或 DFS', def: 'BFS' }],
    legend: [['active', '当前处理中'], ['queue', '待处理（队列/栈）'], ['done', '已访问完毕'], ['idle', '未访问']],
    gen: function (v) {
      var mode = String(v.mode || 'BFS').toUpperCase().indexOf('DFS') >= 0 ? 'DFS' : 'BFS';
      var P = [[80, 40], [250, 40], [420, 40], [165, 150], [335, 150], [80, 265], [420, 265]];
      var adj = [[1, 3], [0, 2, 4], [1, 4], [0, 4, 5], [1, 2, 3, 6], [3, 6], [4, 5]];
      var n = 7, steps = [];
      var visited = new Array(n).fill(false), dist = new Array(n).fill(-1);
      var container = [], cur = -1;
      function scene() {
        var nodes = [], edges = [];
        for (var i = 0; i < n; i++) {
          var st = visited[i] ? 'done' : (container.indexOf(i) >= 0 ? 'queue' : 'idle');
          if (i === cur) st = 'active';
          nodes.push({
            id: 'g' + i, label: String(i), sub: dist[i] >= 0 ? 'd=' + dist[i] : '',
            x: P[i][0], y: P[i][1], s: st, shape: 'circle'
          });
        }
        var seen = {};
        adj.forEach(function (list, i) {
          list.forEach(function (j) {
            var k = Math.min(i, j) + '-' + Math.max(i, j);
            if (seen[k]) return; seen[k] = 1;
            edges.push({ from: 'g' + i, to: 'g' + j, s: (visited[i] && visited[j]) ? 'done' : 'idle', dir: false });
          });
        });
        return { kind: 'nodes', nodes: nodes, edges: edges, caption: mode + ' 遍历：橙=正在处理，粉=待处理，绿=已完成' };
      }
      function push(line, log) {
        steps.push({
          line: line, scenes: [scene()], log: log,
          vars: { 距离: JSON.stringify(dist) },
          stack: container.map(function (i) { return i + (dist[i] >= 0 ? '(d' + dist[i] + ')' : ''); })
        });
      }
      push(0, mode + ' 从节点 0 出发');
      visited[0] = true; dist[0] = 0; container.push(0);
      push(1, '起点 0 入队，dist[0] = 0');
      while (container.length) {
        var u = mode === 'BFS' ? container.shift() : container.pop();
        cur = u;
        push(3, '取出 ' + u + '（' + (mode === 'BFS' ? '队首' : '栈顶') + '），查看邻居 ' + JSON.stringify(adj[u]));
        for (var k = 0; k < adj[u].length; k++) {
          var w = adj[u][k];
          if (!visited[w]) {
            visited[w] = true; dist[w] = dist[u] + 1; container.push(w);
            push(mode === 'BFS' ? 7 : 12, '邻居 ' + w + ' 未访问 → 标记，dist[' + w + '] = ' + dist[w] + '，加入' + (mode === 'BFS' ? '队尾' : '栈顶'));
          } else {
            push(mode === 'BFS' ? 5 : 12, '邻居 ' + w + ' 已访问过，跳过（避免重复与死循环）');
          }
        }
        cur = -1;
        push(3, '节点 ' + u + ' 处理完毕。当前待处理：' + JSON.stringify(container));
      }
      push(3, mode + ' 结束。各点距离：' + JSON.stringify(dist));
      return steps;
    }
  },

  run: {
    inputs: [{ key: 'mode', label: 'BFS 或 DFS', def: 'BFS' }],
    code:
      'const mode = String(input.mode || "BFS").toUpperCase();\n' +
      'const adj = [[1,3],[0,2,4],[1,4],[0,4,5],[1,2,3,6],[3,6],[4,5]];\n' +
      'const n = adj.length, visited = new Array(n).fill(false), dist = new Array(n).fill(-1);\n' +
      'const order = [];\n' +
      'function bfs(s) {\n' +
      '  const q = [s]; visited[s] = true; dist[s] = 0;\n' +
      '  while (q.length) {\n' +
      '    const u = q.shift(); order.push(u);\n' +
      '    log("  出队 " + u + "（dist=" + dist[u] + "）");\n' +
      '    for (const v of adj[u]) if (!visited[v]) { visited[v] = true; dist[v] = dist[u] + 1; q.push(v); }\n' +
      '    log("    队列：[" + q.join(",") + "]");\n' +
      '  }\n' +
      '}\n' +
      'function dfs(u, d) {\n' +
      '  visited[u] = true; dist[u] = d; order.push(u);\n' +
      '  log("  访问 " + u + "（深度 " + d + "）");\n' +
      '  for (const v of adj[u]) if (!visited[v]) dfs(v, d + 1);\n' +
      '}\n' +
      'if (mode.indexOf("DFS") >= 0) dfs(0, 0); else bfs(0);\n' +
      'return { 模式: mode.indexOf("DFS") >= 0 ? "DFS" : "BFS", 访问顺序: order,\n' +
      '         距离: dist, 备注: "BFS 的距离就是无权最短距离；DFS 的深度不是" };'
  },

  complexity: {
    best: 'O(V + E)', avg: 'O(V + E)', worst: 'O(V + E)', space: 'O(V)', stable: '—',
    detail: [
      '每个顶点入队 / 入栈一次（O(V)），每条边被检查一次（无向图两次，仍是 O(E)）→ 总 <strong>O(V + E)</strong>。用邻接矩阵表示时，找邻居要扫一整行 → O(V²)。',
      '空间：visited + 队列 / 栈 = O(V)。BFS 的队列最宽可能达到 O(V)（星形图），DFS 的递归栈深度最坏 O(V)（链式图）。'
    ],
    table: [
      ['', 'BFS', 'DFS'],
      ['数据结构', '队列（FIFO）', '栈 / 递归（LIFO）'],
      ['遍历顺序', '一层层扩散', '一条路走到底再回退'],
      ['能求无权最短路', '✓', '✗'],
      ['典型应用', '最短步数、层序、社交距离', '连通块、拓扑排序、找环、全路径'],
      ['空间', 'O(V)', 'O(V)（栈深）']
    ]
  },

  quiz: [
    {
      q: '为什么 BFS 能求无权图的最短路径？',
      options: ['因为它用递归', '因为它按层扩散，先被访问到的点距离一定更小', '因为它遍历了所有边', '因为它用了栈'],
      answer: 1,
      hint: '队列的 FIFO 保证「距离 d 的点全部处理完，才会处理距离 d+1 的点」。第一次到达某点时，它的距离就是最小的。',
      why: '层序性 → 首次访问即最短。'
    },
    {
      q: '图遍历中忘了 visited 标记会怎样？',
      options: ['只是慢一点', '有环时会无限循环 / 重复访问', '结果不变', '会自动停止'],
      answer: 1,
      hint: 'A→B→C→A，走完一圈又回到 A，然后……？',
      why: '环导致死循环。'
    },
    {
      q: 'visited 应该在什么时候标记？',
      options: ['出队时', '入队（入栈）时', '遍历结束后', '任意时刻都行'],
      answer: 1,
      hint: '如果出队时才标记，同一个点可能被多个邻居重复加入队列（队列里出现重复元素）。',
      why: '入队即标记，避免重复入队。'
    },
    {
      q: '用邻接矩阵存图时，BFS 的复杂度变为？',
      options: ['O(V+E)', 'O(V²)', 'O(E)', 'O(V log V)'],
      answer: 1,
      hint: '邻接矩阵找某个点的所有邻居，必须把那一整行都扫一遍（V 个），一共 V 行。',
      why: '每行扫 V 次 × V 行 = O(V²)。'
    }
  ],

  practice: [
    {
      title: '动手题 1 · 岛屿数量（连通块计数）',
      desc: '一个由 "1"（陆地）和 "0"（水）组成的网格，求岛屿个数。上下左右相邻的 1 算同一个岛。',
      hint: '遍历每个格子，遇到未访问的 1 就启动一次 DFS/BFS，把它能连到的所有 1 都标记为已访问，岛屿数 +1。这就是 flood fill。',
      solution:
        'function numIslands(grid) {\n' +
        '  let cnt = 0;\n' +
        '  const R = grid.length, C = grid[0].length;\n' +
        '  function dfs(r, c) {\n' +
        '    if (r < 0 || r >= R || c < 0 || c >= C || grid[r][c] !== "1") return;\n' +
        '    grid[r][c] = "0";                       // 就地标记已访问\n' +
        '    dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1);\n' +
        '  }\n' +
        '  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++)\n' +
        '    if (grid[r][c] === "1") { cnt++; dfs(r, c); }\n' +
        '  return cnt;\n' +
        '}\n' +
        '// 时间 O(R×C)，空间 O(R×C)（递归栈最坏）'
    },
    {
      title: '动手题 2 · 拓扑排序（DFS 版）',
      desc: '有向无环图中，求一个满足「所有边从前指向后」的顺序。提示：DFS 结束后把节点压入栈，最后逆序输出。',
      hint: '为什么逆序？DFS 最先「完成」的节点是「没有后续依赖」的（最深处），它应该排在最后。',
      solution:
        'function topoSort(n, edges) {\n' +
        '  const adj = Array.from({ length: n }, () => []);\n' +
        '  for (const [u, v] of edges) adj[u].push(v);\n' +
        '  const state = new Array(n).fill(0);   // 0未访问 1访问中 2已完成\n' +
        '  const stack = [];\n' +
        '  function dfs(u) {\n' +
        '    state[u] = 1;\n' +
        '    for (const v of adj[u]) {\n' +
        '      if (state[v] === 1) throw new Error("有环，无法拓扑排序");\n' +
        '      if (state[v] === 0) dfs(v);\n' +
        '    }\n' +
        '    state[u] = 2; stack.push(u);        // 完成后入栈\n' +
        '  }\n' +
        '  for (let i = 0; i < n; i++) if (state[i] === 0) dfs(i);\n' +
        '  return stack.reverse();               // 逆序即拓扑序\n' +
        '}'
    }
  ]
});

/* ------------------------------------------------------------------ */
L({
  id: 'dijkstra',
  level: 'advanced',
  title: 'Dijkstra：带权图的最短路（贪心 + 松弛）',
  subtitle: '每次挑「当前距离最小的未确定点」，用它去更新邻居——前提是所有边权非负。',
  prereq: ['graph-bfs-dfs', 'greedy', 'heap'],
  minutes: 40,
  tags: ['图', '最短路', '贪心'],

  analogyTitle: '地图导航：从已知区域向外「铺路」',
  analogy: [
    '你要从家出发去各个地方。一开始只知道家的距离是 0，其他地方都是 ∞。你先走到<strong>离得最近</strong>的那个点 A——因为边权都是正数，不可能存在「绕更远的路再到 A 反而更近」的情况，所以 A 的最短距离就此确定。',
    '然后从 A 出发看看能不能让邻居的距离变短（<strong>松弛</strong>）：如果「家→A→B」比已知的「家→B」更短，就更新 B。接着在剩下的未确定点里再挑最近的……不断重复。<strong>每一步都确定一个点的最短距离</strong>，这就是贪心。'
  ],

  idea: [
    '<strong>核心：贪心 + 松弛</strong>。dist[v] 记录当前已知的最短距离上界；每轮取未确定点中 dist 最小的 u，它的距离「就此确定」，然后用它松弛所有邻居。',
    '<strong>为什么取最小的就能确定</strong>：所有边权非负，任何绕道到 u 的路径必然 ≥ 当前 dist[u]。',
    '<strong>负权边会让它失效</strong>：负边可能让「已确定」的点距离变得更小。有负权要用 Bellman-Ford（O(VE)，还能检测负环）。',
    '<strong>优先队列优化</strong>：朴素 O(V²)（每轮线性扫描找最小）→ 二叉堆 O((V+E) log V)。'
  ],
  when: [
    '单源最短路、边权非负：地图导航、网络路由、任务依赖最小耗时。',
    '有负权边 → Bellman-Ford / SPFA；任意两点最短路 → Floyd（O(V³)）。',
    '只需要「最少边数」而非最小权重 → BFS 就够了。'
  ],

  steps: [
    { t: '初始化 dist[start] = 0，其余为 ∞', why: '「已知起点距离为 0」是唯一的已知事实，其余还没有任何证据说明它们有多远。' },
    { t: '重复 V 次：取未确定点中 dist 最小的 u，标记为「已确定」', why: '非负权保证：任何其他路径到 u 都要先经过某个距离 ≥ dist[u] 的点，再加非负边，不可能更短。这是 Dijkstra 正确性的全部依据。' },
    { t: '对 u 的每条出边 (u,v,w)：若 dist[u]+w < dist[v] 则更新', why: '这一步叫「松弛」：发现更短的走法就更新上界。' },
    { t: '用优先队列维护「当前最小的 dist」，避免每次线性扫描', why: '朴素版每轮 O(V) 找最小值，总 O(V²)；堆能把取最小和更新都压到 O(log V)。' },
    { t: '若需要具体路径，用 prev[] 记录前驱', why: 'dist 只给距离，不记路径。松弛成功时顺便记 prev[v] = u，最后从终点回溯。' }
  ],

  pseudo: [
    'dist[] = ∞; dist[start] = 0; visited[] = false',
    'pq = 优先队列（按 dist 从小到大）',
    'while pq 非空:',
    '    u = pq.popMin()',
    '    if visited[u]: continue        // 过期的旧记录，跳过',
    '    visited[u] = true              // u 的最短距离确定',
    '    for (v, w) in adj[u]:          // 松弛',
    '        if dist[u] + w < dist[v]:',
    '            dist[v] = dist[u] + w',
    '            prev[v] = u',
    '            pq.push(v, dist[v])'
  ],

  anim: {
    fields: [{ key: 'start', kind: 'text', label: '起点编号（0~5）', def: '0' }],
    legend: [['active', '当前确定的点'], ['done', '距离已确定'], ['path', '最短路径树的边'], ['idle', '未确定']],
    gen: function (v) {
      var S = Math.max(0, Math.min(5, parseInt(Number(v.start) || 0, 10)));
      var P = [[80, 60], [270, 40], [460, 60], [150, 200], [390, 200], [270, 320]];
      var E = [[0, 1, 4], [0, 3, 2], [1, 2, 5], [1, 3, 1], [1, 4, 3], [2, 4, 8], [3, 4, 6], [3, 5, 3], [4, 5, 2]];
      var n = 6, steps = [], INF = 1e9;
      var dist = new Array(n).fill(INF), prev = new Array(n).fill(-1), done = new Array(n).fill(false);
      dist[S] = 0;
      var hl = {};
      function scene() {
        var nodes = [], edges = [];
        for (var i = 0; i < n; i++) {
          var st = done[i] ? 'done' : 'idle';
          if (hl.u === i) st = 'active';
          nodes.push({
            id: 'd' + i, label: String(i), sub: dist[i] >= INF ? '∞' : 'd=' + dist[i],
            x: P[i][0], y: P[i][1], s: st, shape: 'circle'
          });
        }
        E.forEach(function (e, ei) {
          var st = 'idle';
          if (hl.edge === ei) st = 'active';
          else if (prev[e[1]] === e[0] || prev[e[0]] === e[1]) st = 'path';
          edges.push({ from: 'd' + e[0], to: 'd' + e[1], s: st, label: String(e[2]), dir: false });
        });
        return { kind: 'nodes', nodes: nodes, edges: edges, caption: '橙=当前处理，青=最短路径树的边，边上数字=权重' };
      }
      function distGrid() {
        return {
          kind: 'grid', cellW: 62, cellH: 34, labelW: 40, labelH: 26,
          rowLabels: ['dist'],
          colLabels: Array.from({ length: n }, function (_, i) { return '点' + i; }),
          cells: [[].concat(dist.map(function (d, i) {
            return { v: d >= INF ? '∞' : d, s: done[i] ? 'done' : (hl.u === i ? 'active' : 'idle') };
          }))],
          caption: '绿色 = 距离已确定的点'
        };
      }
      function push(line, log) {
        steps.push({
          line: line, scenes: [scene(), distGrid()], log: log,
          vars: { dist: JSON.stringify(dist.map(function (d) { return d >= INF ? '∞' : d; })) }
        });
      }
      push(0, '起点 ' + S + '，dist[' + S + '] = 0，其余为 ∞');
      for (var round = 0; round < n; round++) {
        var u = -1, best = INF;
        for (var i = 0; i < n; i++) if (!done[i] && dist[i] < best) { best = dist[i]; u = i; }
        if (u < 0) break;
        done[u] = true; hl = { u: u };
        push(4, '第 ' + (round + 1) + ' 轮：未确定点中最小的是 ' + u + '（dist=' + dist[u] + '）→ 标记确定');
        E.forEach(function (e, ei) {
          var from = e[0], to = e[1], w = e[2];
          if (from !== u && to !== u) return;
          var a = from === u ? from : to, b = from === u ? to : from;
          if (done[b]) return;
          hl = { u: u, edge: ei };
          push(6, '检查边 ' + a + '—' + b + '（权 ' + w + '）：dist[' + a + ']+' + w + ' = ' + (dist[a] + w) + '  vs dist[' + b + '] = ' + (dist[b] >= INF ? '∞' : dist[b]));
          if (dist[a] + w < dist[b]) {
            dist[b] = dist[a] + w; prev[b] = a;
            push(7, '更短！更新 dist[' + b + '] = ' + dist[b] + '，prev[' + b + '] = ' + a);
          } else {
            push(7, '不更短，保持不变');
          }
        });
        hl = {};
      }
      push(9, '结束。最终距离：' + JSON.stringify(dist.map(function (d) { return d >= INF ? '∞' : d; })));
      return steps;
    }
  },

  run: {
    inputs: [{ key: 'start', label: '起点编号（0~5）', def: '0' }],
    code:
      'const S = Number(input.start) || 0;\n' +
      'const E = [[0,1,4],[0,3,2],[1,2,5],[1,3,1],[1,4,3],[2,4,8],[3,4,6],[3,5,3],[4,5,2]];\n' +
      'const n = 6, INF = Infinity;\n' +
      'const adj = Array.from({ length: n }, () => []);\n' +
      'for (const [u, v, w] of E) { adj[u].push([v, w]); adj[v].push([u, w]); }\n' +
      'const dist = new Array(n).fill(INF), done = new Array(n).fill(false), prev = new Array(n).fill(-1);\n' +
      'dist[S] = 0;\n' +
      'for (let r = 0; r < n; r++) {\n' +
      '  let u = -1, best = INF;\n' +
      '  for (let i = 0; i < n; i++) if (!done[i] && dist[i] < best) { best = dist[i]; u = i; }\n' +
      '  if (u < 0) break;\n' +
      '  done[u] = true;\n' +
      '  log("确定点 " + u + "  dist=" + dist[u]);\n' +
      '  for (const [v, w] of adj[u]) {\n' +
      '    if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; prev[v] = u; log("  松弛 " + v + " → " + dist[v]); }\n' +
      '  }\n' +
      '}\n' +
      'function path(t) { const p = []; for (let x = t; x !== -1; x = prev[x]) p.push(x); return p.reverse().join("→"); }\n' +
      'for (let i = 0; i < n; i++) log("到 " + i + " 的最短距离 = " + dist[i] + "  路径：" + path(i));\n' +
      'return { 起点: S, 最短距离: dist, 路径: Array.from({length:n}, (_, i) => path(i)) };'
  },

  complexity: {
    best: 'O(V²) 朴素 / O(E log V) 堆优化', avg: '同上', worst: '同上', space: 'O(V)', stable: '—',
    detail: [
      '朴素实现：每轮 O(V) 找最小 + O(度) 松弛 → O(V² + E) = O(V²)。适合稠密图。',
      '堆优化：取最小 O(log V)、每次成功松弛要更新堆 O(log V) → O((V + E) log V)。适合稀疏图（E ≪ V²）。',
      '注意：<strong>不能处理负权边</strong>。有负权用 Bellman-Ford：反复松弛所有边 V-1 轮，O(VE)，还能检测负环。'
    ],
    table: [
      ['算法', '适用', '时间', '能否处理负权'],
      ['BFS', '无权图', 'O(V+E)', '不适用'],
      ['Dijkstra（朴素）', '非负权', 'O(V²)', '✗'],
      ['Dijkstra（堆优化）', '非负权、稀疏图', 'O((V+E) log V)', '✗'],
      ['Bellman-Ford', '任意（无负环）', 'O(VE)', '✓ 且能检测负环'],
      ['Floyd', '任意两点', 'O(V³)', '✓']
    ]
  },

  quiz: [
    {
      q: 'Dijkstra 每轮选出「未确定中 dist 最小的点」后，为什么能确定它的距离就是最终的？',
      options: ['因为它被访问过了', '因为边权非负，任何绕道到它的路径都不会更短', '因为它没有邻居了', '因为它是距离最小的'],
      answer: 1,
      hint: '假设存在一条更短的绕道路径，它必然要先经过某个未确定的点 x，而 x 的 dist ≥ 当前点的 dist，再加一条非负边……会更短吗？',
      why: '非负权保证了贪心选择的正确性。'
    },
    {
      q: 'Dijkstra 不能直接处理什么情况？',
      options: ['有向图', '负权边', '稀疏图', '边权为 0'],
      answer: 1,
      hint: '负权边意味着「绕远路反而可能更短」，那「先确定最近的点」这个前提还成立吗？',
      why: '负权要用 Bellman-Ford。'
    },
    {
      q: '松弛操作指的是？',
      options: ['删除一条边', '尝试用 dist[u]+w 更新 dist[v]，取更小值', '把点加入队列', '标记点已访问'],
      answer: 1,
      hint: 'dist 数组存的是「当前已知的最短距离上界」，发现更短的走法时就更新它。',
      why: '不断收紧上界，直到确定。'
    },
    {
      q: '稠密图（E 接近 V²）用哪种 Dijkstra 更合适？',
      options: ['堆优化版', '朴素 O(V²) 版', '两者一样', '都不能用'],
      answer: 1,
      hint: '堆优化是 O((V+E) log V)。当 E ≈ V² 时，它变成 O(V² log V)，反而比朴素 O(V²) 慢。',
      why: '稠密图朴素版更优。'
    }
  ],

  practice: [
    {
      title: '动手题 1 · 堆优化版 Dijkstra',
      desc: '用优先队列改写上面的朴素版本，并对比两者在稀疏图 / 稠密图上的操作次数。',
      hint: 'JS 没有内置优先队列，可以先用数组 + 每次线性找最小模拟，或者自己实现一个小顶堆（参考「堆」那一节）。注意「过期记录跳过」：同一个点可能多次入堆。',
      solution:
        'const pq = [[S, 0]];                       // [点, dist]\n' +
        'while (pq.length) {\n' +
        '  pq.sort((a, b) => a[1] - b[1]);         // 简化：用排序代替堆\n' +
        '  const [u, d] = pq.shift();\n' +
        '  if (d > dist[u]) continue;              // 过期的旧记录，跳过\n' +
        '  for (const [v, w] of adj[u])\n' +
        '    if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; pq.push([v, dist[v]]); }\n' +
        '}\n' +
        '// 真实实现应替换为小顶堆，把 sort 的 O(n log n) 降到 O(log n)'
    },
    {
      title: '动手题 2 · 带费用限制的最短路',
      desc: '每条边有「长度」和「费用」两个权重，要求在总费用不超过 B 的前提下，求最短路。想想状态该怎么扩展。',
      hint: '单一 dist[v] 不够了。把状态扩成 dist[v][c] = 到达 v 且已花费 c 时的最短长度——这就是「分层图最短路」，本质是 DP + Dijkstra。',
      solution:
        '// 状态：(点, 已用费用) → 最短长度\n' +
        'const dist = Array.from({ length: n }, () => new Array(B + 1).fill(INF));\n' +
        'dist[S][0] = 0;\n' +
        '// 用优先队列按「距离」排序，松弛时同时推进 点 与 费用 两个维度\n' +
        '// 答案 = min over c of dist[T][c]\n' +
        '// 复杂度 O((V·B + E·B) log(V·B))，B 很大时需考虑其他方法'
    }
  ]
});

/* ------------------------------------------------------------------ */
L({
  id: 'union-find',
  level: 'advanced',
  title: '并查集：一秒判断「你们是不是一伙的」',
  subtitle: '两个近乎 O(1) 的操作（find / union），撑起了动态连通性与 Kruskal 最小生成树。',
  prereq: ['hash-table'],
  minutes: 25,
  tags: ['并查集', '连通性', '路径压缩'],

  analogyTitle: '找老大：只认「最终 boss」，顺便把层级压平',
  analogy: [
    '一群人分成几个帮派，每个人只记得「我的上级是谁」。要判断 A 和 B 是不是同一个帮派，就各自顺着上级一路往上找，看<strong>最终的老大</strong>是不是同一个人——这就是 find。',
    '两个帮派要合并，就让一方老大认另一方当老大——这就是 union。但有个问题：如果每次都乱认，链条会拉得极长，找老大就要爬很久。两个优化解决它：<strong>① 按大小合并</strong>（小帮派并入大帮派，别让树长高）<strong>② 路径压缩</strong>（查一次之后，把路上所有人的上级直接改成老大，下次一步到位）。'
  ],

  idea: [
    '<strong>两个核心操作</strong>：find(x) 找代表元（根），union(x, y) 合并两个集合。',
    '<strong>按大小 / 按秩合并</strong>：始终让「小的树挂到大的树下」，保证树高增长极慢。',
    '<strong>路径压缩</strong>：find 过程中把经过的所有节点直接指向根，把树压扁。',
    '<strong>复杂度近乎 O(1)</strong>：两者同时使用后的均摊复杂度是反阿克曼函数 α(n)，实际中 ≤ 5，可视为常数。'
  ],
  when: [
    '动态连通性问题：社交网络好友圈、网络连接状态、动态版岛屿数量。',
    'Kruskal 最小生成树：每次取最小边，用并查集判断两端是否已连通（成环就不选）。',
    '需要「删除边」的动态连通 → 并查集做不了。'
  ],

  steps: [
    { t: '初始化 parent[i] = i（每个人一开始是自己的老大）', why: '初始时 n 个元素互不相交，各有各的集合。' },
    { t: 'find(x)：顺着 parent 一路往上，直到 parent[x] == x', why: '根节点（parent 指向自己）就是该集合的代表元。代表元相同 ⇔ 属于同一集合。' },
    { t: '路径压缩：find 返回前，把路径上所有节点的 parent 直接改成根', why: '这一次 O(深度) 的代价换来了以后 O(1)。find 会被调用很多次，摊还下来极划算。' },
    { t: 'union(x, y)：分别 find 出两个根，若不同则把其中一个挂到另一个下', why: '只要改一次 parent 指针就完成合并，这就是它快的原因——不需要移动任何元素。' },
    { t: '按大小合并：始终让较小的树挂到较大的树根下', why: '挂反了会让树变高，find 变慢。按大小合并能保证树高最多 O(log n)。' }
  ],

  pseudo: [
    'parent[i] = i;  size[i] = 1',
    '',
    'function find(x):',
    '    if parent[x] != x:',
    '        parent[x] = find(parent[x])      // ← 路径压缩',
    '    return parent[x]',
    '',
    'function union(x, y):',
    '    rx = find(x); ry = find(y)',
    '    if rx == ry: return false            // 已在同一集合',
    '    if size[rx] < size[ry]: swap(rx, ry) // ← 按大小合并',
    '    parent[ry] = rx; size[rx] += size[ry]',
    '    return true'
  ],

  anim: {
    fields: [{ key: 'ops', kind: 'array', def: '[0,1,2,3,1,4,5,2]' }],
    legend: [['active', '本次操作的根'], ['cmp', 'find 路径上的节点'], ['idle', '普通节点']],
    gen: function (v) {
      var ops = v.ops.slice(0, 12).map(Number).filter(function (x) { return !isNaN(x); });
      var n = 3;
      ops.forEach(function (x) { if (x >= 0) n = Math.max(n, x + 1); });
      n = Math.min(9, n);
      var parent = [], sz = [];
      for (var i = 0; i < n; i++) { parent.push(i); sz.push(1); }
      var steps = [], hl = {};
      function findPath(x) {
        var path = [];
        while (parent[x] !== x) { path.push(x); x = parent[x]; }
        return { root: x, path: path };
      }
      function scene() {
        var nodes = [], edges = [];
        for (var i = 0; i < n; i++) {
          var st = 'idle';
          if (hl.path && hl.path.indexOf(i) >= 0) st = 'cmp';
          if (hl.root === i) st = 'active';
          nodes.push({ id: 'u' + i, label: String(i), sub: 'sz' + sz[i], x: 56 + i * 82, y: 60, s: st, shape: 'circle' });
        }
        for (var j = 0; j < n; j++) {
          if (parent[j] !== j) edges.push({ from: 'u' + j, to: 'u' + parent[j], s: hl.hiEdge === j ? 'active' : 'idle', dir: true });
        }
        return { kind: 'nodes', nodes: nodes, edges: edges, caption: '箭头指向「上级」，根节点的 parent 指向自己' };
      }
      function arrScene() {
        return {
          kind: 'array', mode: 'cell', rows: [{
            label: 'parent 数组（parent[i] = i 表示 i 是根）',
            items: parent.map(function (p, i) {
              var s = 'idle';
              if (hl.path && hl.path.indexOf(i) >= 0) s = 'cmp';
              if (hl.root === i) s = 'active';
              return { v: p, s: s };
            })
          }]
        };
      }
      function push(line, log) {
        steps.push({ line: line, scenes: [scene(), arrScene()], log: log, vars: { parent: JSON.stringify(parent) } });
      }
      push(0, '初始化 ' + n + ' 个独立元素，parent[i] = i');
      for (var k = 0; k + 1 < ops.length; k += 2) {
        var x = ops[k], y = ops[k + 1];
        if (x >= n || y >= n) continue;
        hl = {};
        push(7, 'union(' + x + ', ' + y + ')：先分别找它们的根');
        var r1 = findPath(x);
        hl = { path: r1.path.slice(), root: r1.root };
        push(3, 'find(' + x + ')：路径 ' + r1.path.concat([r1.root]).join('→') + '，根 = ' + r1.root + '（路径压缩：把沿途节点直接指向根）');
        for (var t = 0; t < r1.path.length; t++) parent[r1.path[t]] = r1.root;
        var r2 = findPath(y);
        hl = { path: r2.path.slice(), root: r2.root };
        push(3, 'find(' + y + ')：路径 ' + r2.path.concat([r2.root]).join('→') + '，根 = ' + r2.root);
        for (var t2 = 0; t2 < r2.path.length; t2++) parent[r2.path[t2]] = r2.root;
        if (r1.root === r2.root) {
          hl = { root: r1.root };
          push(9, '两个根相同（' + r1.root + '）→ 已在同一集合，无需合并（若在建图上，说明会成环）');
        } else {
          var big = sz[r1.root] >= sz[r2.root] ? r1.root : r2.root;
          var small = big === r1.root ? r2.root : r1.root;
          parent[small] = big; sz[big] += sz[small];
          hl = { root: big, hiEdge: small };
          push(11, '合并：把较小的 ' + small + '（size ' + sz[small] + '）挂到 ' + big + ' 下，新 size = ' + sz[big]);
        }
      }
      hl = {};
      push(11, '结束。最终 parent = ' + JSON.stringify(parent));
      return steps;
    }
  },

  run: {
    inputs: [{ key: 'ops', label: '合并操作（两两一组）', def: '[0,1,2,3,1,4,5,2]' }],
    code:
      'const ops = input.ops.map(Number);\n' +
      'let n = 0; for (const x of ops) if (x >= 0) n = Math.max(n, x + 1);\n' +
      'const parent = [], sz = [];\n' +
      'for (let i = 0; i < n; i++) { parent.push(i); sz.push(1); }\n' +
      'let pathLen = 0;\n' +
      'function find(x) {\n' +
      '  if (parent[x] !== x) { pathLen++; parent[x] = find(parent[x]); }   // 路径压缩\n' +
      '  return parent[x];\n' +
      '}\n' +
      'function union(x, y) {\n' +
      '  let rx = find(x), ry = find(y);\n' +
      '  if (rx === ry) { log("union(" + x + "," + y + ") 已在同集合，跳过"); return false; }\n' +
      '  if (sz[rx] < sz[ry]) { const t = rx; rx = ry; ry = t; }            // 按大小合并\n' +
      '  parent[ry] = rx; sz[rx] += sz[ry];\n' +
      '  log("union(" + x + "," + y + ") → " + ry + " 挂到 " + rx + "  parent=" + JSON.stringify(parent));\n' +
      '  return true;\n' +
      '}\n' +
      'for (let i = 0; i + 1 < ops.length; i += 2) union(ops[i], ops[i + 1]);\n' +
      '// 对照：不做路径压缩时的查找代价\n' +
      'return { parent, size: sz, find累计经过节点数: pathLen,\n' +
      '         说明: "路径压缩后，后续 find 几乎都是一步到位" };'
  },

  complexity: {
    best: '≈O(1)（α(n)）', avg: '≈O(1)（α(n)）', worst: '≈O(1)（α(n)）', space: 'O(n)', stable: '—',
    detail: [
      '只用路径压缩：单次最坏 O(log n) 甚至 O(n)，但 m 次操作均摊 O(m log n)。只用按大小合并：树高 ≤ log n，单次 O(log n)。',
      '<strong>两者同时使用：m 次操作的均摊复杂度 O(m·α(n))</strong>，α(n) 是反阿克曼函数，n 为整个宇宙原子数时 α(n) 也不超过 5 —— 工程上当作常数。'
    ],
    table: [
      ['优化', '单次 find 最坏', 'm 次操作均摊'],
      ['都不做', 'O(n)', 'O(mn)'],
      ['只按大小合并', 'O(log n)', 'O(m log n)'],
      ['只路径压缩', 'O(n)', 'O(m log n)'],
      ['两者都用', 'O(α(n))', 'O(m·α(n)) ≈ O(m)']
    ]
  },

  quiz: [
    {
      q: '并查集中判断两个元素是否在同一集合，依据是？',
      options: ['比较它们的值', '比较 find(x) 与 find(y) 的根是否相同', '比较 size 数组', '看 parent 是否相邻'],
      answer: 1,
      hint: '每个集合用「代表元（根）」来标识。同集合 ⇔ 同根。',
      why: '根相同即同集合。'
    },
    {
      q: '「路径压缩」做了什么？',
      options: ['把树删掉重建', 'find 时把路径上所有节点的 parent 直接指向根', '把两个根合并', '压缩数组长度'],
      answer: 1,
      hint: '查一次老大之后，路上的每个人都可以直接认老大当上级——下次就不用爬了。',
      why: '把树压扁，后续查询 O(1)。'
    },
    {
      q: '「按大小合并」为什么要让小树挂到大树下？',
      options: ['代码更好写', '避免树变高，保证树高最多 O(log n)', '为了数组连续', '没有特殊原因'],
      answer: 1,
      hint: '反过来（大树挂到小树下）会让新树高度直接 +1，反复如此树就长高了。想想最坏情况。',
      why: '控制树高增长。'
    },
    {
      q: 'Kruskal 算法里并查集的作用是什么？',
      options: ['排序所有边', '判断一条边的两端是否已连通，避免成环', '计算最小生成树权值', '找起点'],
      answer: 1,
      hint: 'Kruskal 每次取权值最小的边。但如果这条边的两端已经通过其他边连通了，加上它就会形成环——需要 O(1) 判断。',
      why: '用 find 判环，决定是否选这条边。'
    }
  ],

  practice: [
    {
      title: '动手题 1 · Kruskal 最小生成树',
      desc: '给定带权无向图，求权值和最小的生成树。用并查集 + 边排序实现。',
      hint: '① 按权值升序排序所有边 ② 依次取边，若两端不同根就选它并 union ③ 选够 n-1 条边即结束。',
      solution:
        'function kruskal(n, edges) {\n' +
        '  edges.sort((a, b) => a[2] - b[2]);          // 按权值排序\n' +
        '  const parent = [...Array(n).keys()], sz = new Array(n).fill(1);\n' +
        '  function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }\n' +
        '  let total = 0, cnt = 0;\n' +
        '  for (const [u, v, w] of edges) {\n' +
        '    const ru = find(u), rv = find(v);\n' +
        '    if (ru === rv) continue;                  // 会成环，跳过\n' +
        '    if (sz[ru] < sz[rv]) { parent[ru] = rv; sz[rv] += sz[ru]; }\n' +
        '    else { parent[rv] = ru; sz[ru] += sz[rv]; }\n' +
        '    total += w; if (++cnt === n - 1) break;\n' +
        '  }\n' +
        '  return { 权值和: total, 边数: cnt };\n' +
        '}\n' +
        '// 时间 O(E log E)（排序主导），并查集部分近乎 O(E)'
    },
    {
      title: '动手题 2 · 等式方程的可满足性',
      desc: '给定若干 "a==b" 与 "a!=b" 的等式，判断是否可能同时成立。用并查集：先把所有 == 合并，再检查所有 != 是否矛盾。',
      hint: '先处理等式建立集合，再处理不等式：若某个 != 的两端属于同一集合，就矛盾了。',
      solution:
        'function equationsPossible(eqs) {\n' +
        '  const parent = {};\n' +
        '  for (let c = 97; c <= 122; c++) parent[String.fromCharCode(c)] = String.fromCharCode(c);\n' +
        '  function find(x) { if (parent[x] !== x) parent[x] = find(parent[x]); return parent[x]; }\n' +
        '  for (const e of eqs) if (e[1] === "=") { parent[find(e[0])] = find(e[3]); }\n' +
        '  for (const e of eqs) if (e[1] === "!") { if (find(e[0]) === find(e[3])) return false; }\n' +
        '  return true;\n' +
        '}\n' +
        '// 时间 O(n·α(n)) ≈ O(n)'
    }
  ]
});

/* ------------------------------------------------------------------ */
L({
  id: 'kmp',
  level: 'advanced',
  title: 'KMP：失配时不回退主串的串匹配',
  subtitle: '用「已匹配部分的前后缀信息」决定模式串该往右滑多远，主串指针永不回退 → O(n+m)。',
  prereq: ['dp-basic'],
  minutes: 40,
  tags: ['字符串', 'KMP', '前缀函数'],

  analogyTitle: '拼图对不上时，别把已拼好的部分全拆了',
  analogy: [
    '暴力匹配就像：你拿一张透明胶片（模式串）盖在墙纸（主串）上比对，一旦发现某个位置对不上，就把胶片整体右移一格，从头再比。前面明明已经对上了 5 个，却全被浪费了。',
    'KMP 的洞察是：<strong>对不上的那一刻，「已经对上的那一段」本身就是有用信息</strong>。如果这段的「后半部分」恰好等于模式串的「开头部分」，那胶片就不需要只挪一格——可以直接挪到让这两段重合的位置，中间那些位置根本不可能匹配成功。'
  ],

  idea: [
    '<strong>核心数据结构：next / lps 数组</strong>。lps[j] = 模式串前 j+1 个字符组成的子串中，最长的「相等真前缀与真后缀」的长度。',
    '<strong>匹配时</strong>：主串指针 i 永不回退；失配时令 j = lps[j-1]（模式串右滑），继续比较。',
    '<strong>求 lps 其实就是「模式串自己和自己匹配」</strong>——用同样的双指针方法在线性时间内求出，可以看成是一个小型 DP。',
    '总复杂度 O(n + m)：i 最多前进 n 次，j 的回退总量被 lps 的性质限制在 O(m)。'
  ],
  when: [
    '在一个长文本里查找模式串出现的所有位置 → KMP / BM / Sunday。',
    '需要「最长公共前后缀」「字符串周期」相关性质 → 前缀函数。',
    '短模式 + 短文本 → 暴力就够了（常数小）；超长文本可用 BM（实际更快）。'
  ],

  steps: [
    { t: '预处理：求模式串的 lps（next）数组', why: '它记录了「每个位置失配时，模式串可以直接滑到哪」——有了它才敢不回退主串指针。' },
    { t: 'lps 的定义：P[0..j] 中最长的相等真前缀与真后缀长度', why: '「真」意味着不能是整个串本身，否则失配时滑动距离就是 0，会死循环。' },
    { t: '求 lps：双指针 len 与 i，相等则 len++，不等则 len = lps[len-1]', why: '失配时把 len 退到「上一个可能更短的前后缀长度」，这正是复用已有信息的体现，也是 O(m) 的关键。' },
    { t: '匹配：i 走主串、j 走模式串，相等则双双前进', why: 'j 前进表示「又多匹配上一个字符」。' },
    { t: '失配：若 j>0 则 j = lps[j-1]，否则 i++', why: 'j 回退等价于「模式串右移」，而 i 不动——这正是 KMP 相比暴力的本质优化；j==0 说明第一个字符就没对上，只能让 i 前进。' },
    { t: 'j == m 时命中一次，然后 j = lps[j-1] 继续找下一个', why: '找到一处后不能停，而且已匹配部分仍可复用（处理重叠匹配，如在 "ababab" 里找 "abab"）。' }
  ],

  pseudo: [
    '// ① 求 lps（next）数组',
    'lps[0] = 0; len = 0',
    'for i = 1 .. m-1:',
    '    while len > 0 and P[i] != P[len]: len = lps[len-1]   // 回退',
    '    if P[i] == P[len]: len++',
    '    lps[i] = len',
    '',
    '// ② 匹配',
    'i = 0; j = 0',
    'while i < n:',
    '    if T[i] == P[j]: i++; j++',
    '        if j == m: 记录命中 i-m; j = lps[j-1]',
    '    else:',
    '        if j > 0: j = lps[j-1]      // 模式串右滑，i 不动',
    '        else: i++                   // 首字符就失配，i 前进'
  ],

  anim: {
    fields: [
      { key: 'text', kind: 'text', label: '主串', def: 'ababababca' },
      { key: 'pat', kind: 'text', label: '模式串', def: 'abababca' }
    ],
    legend: [['done', '已匹配成功的部分'], ['cmp', '正在比较'], ['swap', '失配'], ['dim', '未涉及']],
    gen: function (v) {
      var T = String(v.text || 'ababababca').slice(0, 26);
      var P = String(v.pat || 'abababca').slice(0, 14);
      var n = T.length, m = P.length, steps = [];
      var lps = new Array(m).fill(0), len = 0;
      for (var q = 1; q < m; q++) {
        while (len > 0 && P[q] !== P[len]) len = lps[len - 1];
        if (P[q] === P[len]) len++;
        lps[q] = len;
      }
      function lpsScene(cur) {
        return {
          kind: 'grid', cellW: 42, cellH: 34, labelW: 54, labelH: 26,
          rowLabels: ['lps'],
          colLabels: P.split('').map(function (c, i) { return c + '@' + i; }),
          cells: [[].concat(lps.map(function (x, i) { return { v: x, s: i === cur ? 'active' : (i < cur ? 'done' : 'idle') }; }))],
          caption: 'lps[j] = P[0..j] 中最长的「相等真前缀与真后缀」长度'
        };
      }
      function rowsScene(i, j, st) {
        var tItems = T.split('').map(function (c, k) {
          var s = 'dim';
          if (st === 'hit' && k >= i - m && k < i) s = 'done';
          else if (k >= i - j && k < i) s = 'done';
          return { v: c, s: s };
        });
        if (i < n) tItems[i] = { v: T[i], s: st === 'miss' ? 'swap' : 'cmp' };
        var pItems = [];
        for (var k = 0; k < i - j; k++) pItems.push({ v: '' });
        P.split('').forEach(function (c, k) {
          var s = 'dim';
          if (k < j) s = 'done';
          if (k === j) s = st === 'miss' ? 'swap' : 'cmp';
          pItems.push({ v: c, s: s });
        });
        return {
          kind: 'array', mode: 'cell', rows: [
            { label: '主串 T', items: tItems, ptrs: [{ name: 'i', idx: Math.min(i, n - 1), color: '#f97316' }] },
            { label: '模式串 P（已右移到当前位置）', items: pItems, ptrs: [{ name: 'j', idx: i, color: '#8b5cf6' }] }
          ]
        };
      }
      function push(line, log, i, j, st, lpsCur) {
        steps.push({
          line: line, scenes: [rowsScene(i, j, st), lpsScene(lpsCur == null ? -1 : lpsCur)],
          log: log, vars: { i: i, j: j, lps: JSON.stringify(lps) }
        });
      }
      push(6, '先预处理模式串 "' + P + '" 的 lps 数组 = ' + JSON.stringify(lps) + '。lps[j] 表示 P[0..j] 中最长的相等真前缀与真后缀长度。', 0, 0, 'cmp', m - 1);
      var i = 0, j = 0, hits = 0;
      while (i < n) {
        if (T[i] === P[j]) {
          push(13, 'T[' + i + ']="' + T[i] + '" 与 P[' + j + ']="' + P[j] + '" 匹配 → i、j 双双前进', i, j, 'cmp', j);
          i++; j++;
          if (j === m) {
            hits++;
            push(15, '完全匹配！在下标 ' + (i - m) + ' 处找到 "' + P + '"，继续查找下一处（j 回退到 lps[' + (m - 1) + ']=' + lps[m - 1] + '）', i, j, 'hit', m - 1);
            j = lps[j - 1];
          }
        } else {
          push(17, 'T[' + i + ']="' + T[i] + '" ≠ P[' + j + ']="' + P[j] + '" 失配', i, j, 'miss', j);
          if (j > 0) {
            var nj = lps[j - 1];
            push(18, 'j 从 ' + j + ' 回退到 lps[' + (j - 1) + '] = ' + nj + '（模式串右滑，i 保持 ' + i + ' 不动）', i, nj, 'cmp', j - 1);
            j = nj;
          } else {
            push(19, 'j == 0，模式串无法再滑 → i 前进到 ' + (i + 1), i + 1, 0, 'cmp', -1);
            i++;
          }
        }
        if (steps.length > 400) break;
      }
      push(19, '匹配结束，共找到 ' + hits + ' 处。全程 i 只增不减 → O(n+m)', Math.min(i, n - 1), j, 'cmp', -1);
      return steps;
    }
  },

  run: {
    inputs: [
      { key: 'text', label: '主串', def: 'ababababca' },
      { key: 'pat', label: '模式串', def: 'abababca' }
    ],
    code:
      'const T = String(input.text), P = String(input.pat);\n' +
      'const n = T.length, m = P.length;\n' +
      'let cmpK = 0;\n' +
      '// ① 求 lps\n' +
      'const lps = new Array(m).fill(0);\n' +
      'let len = 0;\n' +
      'for (let i = 1; i < m; i++) {\n' +
      '  while (len > 0 && P[i] !== P[len]) len = lps[len - 1];\n' +
      '  if (P[i] === P[len]) len++;\n' +
      '  lps[i] = len;\n' +
      '}\n' +
      'log("lps =", JSON.stringify(lps));\n' +
      '// ② KMP 匹配\n' +
      'const hits = [];\n' +
      'let i = 0, j = 0, back = 0;\n' +
      'while (i < n) {\n' +
      '  cmpK++;\n' +
      '  if (T[i] === P[j]) { i++; j++; if (j === m) { hits.push(i - m); log("命中，起点 =", i - m); j = lps[j - 1]; } }\n' +
      '  else if (j > 0) { j = lps[j - 1]; back++; }\n' +
      '  else i++;\n' +
      '}\n' +
      '// ③ 暴力对照\n' +
      'let cmpB = 0; const hitsB = [];\n' +
      'for (let s = 0; s + m <= n; s++) {\n' +
      '  let k = 0;\n' +
      '  while (k < m) { cmpB++; if (T[s + k] !== P[k]) break; k++; }\n' +
      '  if (k === m) hitsB.push(s);\n' +
      '}\n' +
      'log("KMP 比较次数 =", cmpK, "  j 回退次数 =", back);\n' +
      'log("暴力比较次数 =", cmpB);\n' +
      'return { lps, KMP命中位置: hits, 暴力命中位置: hitsB, KMP比较次数: cmpK, 暴力比较次数: cmpB,\n' +
      '         一致: JSON.stringify(hits) === JSON.stringify(hitsB) };'
  },

  complexity: {
    best: 'O(n+m)', avg: 'O(n+m)', worst: 'O(n+m)', space: 'O(m)', stable: '—',
    detail: [
      '<strong>为什么是 O(n+m)</strong>：主串指针 i 永不回退，最多前进 n 次；每次比较成功时 j 前进（总共不超过 n 次），失配时 j 回退但回退量不会超过它前进过的总量 → 总比较次数 &lt; 2n。求 lps 同理是 O(m)。',
      '暴力法最坏 O(nm)：比如 T = "aaaa...aab"，P = "aaa...ab"，每次都在最后一个字符失配，前面 m-1 次比较全白费。'
    ],
    table: [
      ['算法', '预处理', '匹配', '空间', '特点'],
      ['暴力', '无', 'O(nm)', 'O(1)', '常数小，短串够用'],
      ['KMP', 'O(m)', 'O(n)', 'O(m)', '主串指针不回退，最坏有保证'],
      ['BM', 'O(m)', 'O(n) 平均', 'O(m)', '从右往左比，实际最快'],
      ['Sunday', 'O(m)', 'O(n) 平均', 'O(m)', '实现简单，实践常用']
    ]
  },

  quiz: [
    {
      q: 'KMP 相比暴力匹配，最本质的优化是？',
      options: ['它从右往左比较', '主串指针 i 永不回退，失配时只右滑模式串', '它先排序', '它用了哈希表'],
      answer: 1,
      hint: '暴力法失配时要把模式串右移一格、从头再比——等于主串指针回退了。KMP 能不回退，靠的是什么信息？',
      why: '靠 lps 决定滑动距离。'
    },
    {
      q: 'lps[j] 的含义是？',
      options: ['模式串长度', 'P[0..j] 中最长的「相等真前缀与真后缀」的长度', '失配位置', '匹配次数'],
      answer: 1,
      hint: '注意是「真」前缀 / 真后缀——不能是整个串本身，否则滑动距离为 0 就没意义了。',
      why: '它决定了失配时 j 该回退到哪。'
    },
    {
      q: '模式串 "abababca" 的 lps 最后一个值（lps[7]）是？',
      options: ['0', '1', '2', '3'],
      answer: 1,
      hint: '看整个串 "abababca"：它的真前缀有 a、ab、aba…，真后缀有 a、ca、bca…。最长的相等的一对有多长？',
      why: '只有 "a" 前后缀相同 → 1。'
    },
    {
      q: '匹配成功后为什么要 j = lps[j-1] 而不是 j = 0？',
      options: ['写错了', '为了不漏掉重叠的匹配，且复用已匹配部分的信息', '为了省空间', '为了计数'],
      answer: 1,
      hint: '比如在 "ababab" 里找 "abab"：第一处起点 0，第二处起点 2——它们有重叠。若 j 直接归 0 会怎样？',
      why: '支持重叠匹配 + 保持 O(n)。'
    }
  ],

  practice: [
    {
      title: '动手题 1 · 手写 lps 并验证',
      desc: '对模式串 "aabaabaaa" 手算 lps 数组，再用代码验证。说明 lps[i] 的求解过程为什幺能在线性时间内完成。',
      hint: '求 lps 时 len 的回退（len = lps[len-1]）和匹配时的 j 回退是同一个思想，都是「复用更短的相等前后缀」。',
      solution:
        '"aabaabaaa" 的 lps = [0,1,0,1,2,3,4,5,2]\n' +
        '\n' +
        'function buildLps(P) {\n' +
        '  const m = P.length, lps = new Array(m).fill(0);\n' +
        '  let len = 0;                       // 当前已匹配的前缀长度\n' +
        '  for (let i = 1; i < m; i++) {\n' +
        '    while (len > 0 && P[i] !== P[len]) len = lps[len - 1];  // 回退\n' +
        '    if (P[i] === P[len]) len++;\n' +
        '    lps[i] = len;\n' +
        '  }\n' +
        '  return lps;\n' +
        '}\n' +
        '// len 的增加总量 ≤ m，回退也不会超过这个量 → O(m)'
    },
    {
      title: '动手题 2 · 用 KMP 求「最短回文串补充」',
      desc: '给定字符串 s，只能在末尾添加字符，求能让它变成回文串的最短结果。提示：构造 s + "#" + reverse(s)，求其 lps 的最后一个值。',
      hint: 'lps 最后一个值 = 「s 的后缀」与「reverse(s) 的前缀」的最长重合长度。这部分已经是回文的，只需把剩下那段补到末尾。',
      solution:
        'function shortestPalindrome(s) {\n' +
        '  const r = s.split("").reverse().join("");\n' +
        '  const t = s + "#" + r;                 // # 防止前后缀跨过中心\n' +
        '  const lps = new Array(t.length).fill(0);\n' +
        '  let len = 0;\n' +
        '  for (let i = 1; i < t.length; i++) {\n' +
        '    while (len > 0 && t[i] !== t[len]) len = lps[len - 1];\n' +
        '    if (t[i] === t[len]) len++;\n' +
        '    lps[i] = len;\n' +
        '  }\n' +
        '  const match = lps[lps.length - 1];     // 已回文的后缀长度\n' +
        '  return r.slice(0, r.length - match) + s;\n' +
        '}\n' +
        '// 时间 O(n)'
    }
  ]
});
