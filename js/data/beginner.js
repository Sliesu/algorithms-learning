/* ============ 入门篇 ============ */

/* ------------------------------------------------------------------ */
L({
  id: 'intro',
  level: 'beginner',
  title: '算法是什么？怎么判断一个算法「快不快」',
  subtitle: '算法就是一份「把事情做完的步骤清单」，而复杂度就是这份清单的「工作量随数据变多时怎么涨」。',
  prereq: [],
  minutes: 15,
  tags: ['概念', '时间复杂度', '空间复杂度'],

  analogyTitle: '算法 ≈ 菜谱，复杂度 ≈ 这顿饭要忙多久',
  analogy: [
    '想象你要教一个从没进过厨房的朋友做番茄炒蛋。你不能只说「去炒一下」，你得写清楚：先切番茄 → 打两个蛋 → 热锅下油 → 先炒蛋盛出 → 再炒番茄 → 倒回蛋 → 加盐出锅。这份<strong>「一步一步、谁照着做都能做出来的说明」就是算法</strong>。',
    '那怎么判断两份菜谱谁更好？你不会去掐表（换个灶台时间就不一样了），你会数<strong>「动作次数」</strong>：A 菜谱 8 步，B 菜谱 20 步，显然 A 更省事。更重要的是——<strong>当客人从 2 位变成 200 位时，谁的步骤数涨得更慢</strong>。做 2 人份和做 200 人份，切菜的时间可不是简单地「多切一点」，这就是「复杂度」要回答的问题。'
  ],

  idea: [
    '<strong>算法 = 输入 → 有限步骤 → 输出</strong>。它必须能在有限时间内结束，且每一步都明确无歧义。',
    '<strong>衡量快慢不掐表，而是数「基本操作执行了多少次」</strong>，并且看这个次数随着数据规模 n 变大怎么增长。',
    '<strong>只关心增长量级（数量级）</strong>：n=1000 时，跑 3n 次和跑 5n 次差别不大，但跑 3n 次和跑 n² 次是天壤之别。所以常数、系数统统丢掉，只留最高阶项，写作 O(...)。',
    '<strong>空间复杂度同理</strong>：数的是「除了输入之外，额外借用了多少内存」。'
  ],
  when: [
    '写代码前先估个量级，可以避免「本地跑得挺快，上线就卡死」。',
    '面试 / 刷题时用来证明你的解法真的更优，而不是「感觉更快」。',
    '在内存吃紧的环境（嵌入式、超大数据）里，空间复杂度常常比时间更要命。'
  ],

  steps: [
    { t: '确定「数据规模 n」是什么', why: 'n 通常是数组长度、节点个数、字符串长度……先说清楚 n 是谁，后面才有讨论的基础。' },
    { t: '找出「基本操作」', why: '基本操作是重复次数最多的那个动作：比较一次、交换一次、访问一个格子。数它就够了，其它都是零头。' },
    { t: '写出操作次数关于 n 的表达式', why: '比如两层循环各跑 n 次 → n²；每次砍掉一半 → log₂n。有了表达式才谈得上化简。' },
    { t: '只保留增长最快的那一项，去掉系数', why: '因为 n 很大时，最高阶项支配一切：n²+3n+10 在 n=10000 时，n² 那一项占 99.96%。这就是大 O 记法的含义——它描述的是「增长趋势」。' },
    { t: '再单独估一次「额外内存」', why: '原地交换是 O(1)，新开一个等长数组就是 O(n)，递归 100 层就是 O(100)≈O(n) 的栈。时间省了、内存爆了，一样跑不起来。' }
  ],

  pseudo: [
    '// 判断快慢的标准流程（伪代码）',
    'n = 输入数据的规模',
    'count = 0                       // 统计基本操作次数',
    '对每一层循环：',
    '    count += 这一层会执行多少次',
    '把 count 写成关于 n 的式子',
    '只保留最高阶项、去掉系数 → 得到 O( ? )',
    '另算：额外申请的格子数 → 空间复杂度'
  ],

  anim: {
    fields: [{ key: 'n', kind: 'text', label: '最大数据规模', def: '1024' }],
    legend: [['idle', '当前规模'], ['cmp', '仍在可接受范围'], ['swap', '开始吃力'], ['dead', '基本不可行']],
    gen: function (v) {
      var N = parseInt(Number(v.n) || 1024, 10);
      var ns = [];
      for (var x = 1; x <= N; x *= 2) ns.push(x);
      if (ns[ns.length - 1] !== N) ns.push(N);
      var fn = [
        { name: 'O(1)    常数', f: function () { return 1; } },
        { name: 'O(log n) 对数', f: function (n) { return Math.floor(Math.log2(n)) + 1; } },
        { name: 'O(n)    线性', f: function (n) { return n; } },
        { name: 'O(n log n) 线性对数', f: function (n) { return Math.round(n * Math.log2(Math.max(2, n))); } },
        { name: 'O(n²)   平方', f: function (n) { return n * n; } }
      ];
      function fmt(x) {
        if (x >= 1e8) return (x / 1e8).toFixed(1) + '亿';
        if (x >= 1e4) return (x / 1e4).toFixed(1) + '万';
        return String(x);
      }
      var steps = [];
      ns.forEach(function (n, ci) {
        var cells = fn.map(function (o) {
          var val = o.f(n), st = 'idle';
          if (val > 1e8) st = 'dead'; else if (val > 1e6) st = 'swap'; else if (val > 1e4) st = 'cmp';
          return { v: fmt(val), s: st };
        });
        steps.push({
          line: 5,
          scenes: [{
            kind: 'grid', labelW: 128, cellW: 74,
            colLabels: ns.map(function (x) { return 'n=' + x; }),
            rowLabels: fn.map(function (o) { return o.name; }),
            cells: fn.map(function (o) { return ns.map(function (nn) { return { v: fmt(o.f(nn)), s: 'dim' }; }); }),
            hl: null,
            caption: '数据规模 n 变化时，各种复杂度的「基本操作次数」'
          }],
          log: 'n = ' + n + '：常数 ' + fmt(fn[0].f(n)) + ' 次，对数 ' + fmt(fn[1].f(n)) +
            ' 次，线性 ' + fmt(fn[2].f(n)) + ' 次，线性对数 ' + fmt(fn[3].f(n)) + ' 次，平方 ' + fmt(fn[4].f(n)) + ' 次',
          vars: { n: n }
        });
        /* 高亮当前列 */
        steps[steps.length - 1].scenes[0].cells = fn.map(function (o, ri) {
          return ns.map(function (nn, c) {
            var val = o.f(nn), st = 'dim';
            if (c === ci) {
              st = val > 1e8 ? 'swap' : (val > 1e4 ? 'cmp' : 'done');
            }
            return { v: fmt(val), s: st };
          });
        });
        steps[steps.length - 1].scenes[0].hl = { r: 0, c: ci };
      });
      steps.push({
        line: 6,
        scenes: steps[steps.length - 1].scenes,
        log: '结论：n 翻倍时，O(n) 也翻倍，O(n²) 变成 4 倍。选算法，本质上是在选「这条曲线有多陡」。',
        vars: {}
      });
      return steps;
    }
  },

  run: {
    inputs: [{ key: 'n', label: '数据规模 n（数字）', def: '1024' }],
    code:
      '// 同一个问题：在 n 个有序数据里找目标，两种做法差多少？\n' +
      'const n = input.n;\n' +
      'let linear = 0;            // 从头扫到尾，最坏要比较 n 次\n' +
      'for (let i = 0; i < n; i++) linear++;\n' +
      'let size = n, binary = 0;  // 每次砍掉一半\n' +
      'while (size > 0) { binary++; size = Math.floor(size / 2); }\n' +
      'log("数据规模 n =", n);\n' +
      'log("线性查找最坏比较次数 =", linear, "→ O(n)");\n' +
      'log("二分查找最坏比较次数 =", binary, "→ O(log n)");\n' +
      'let c1 = 0, c2 = 0;        // 再看看 n^2 有多可怕\n' +
      'for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) c1++;\n' +
      'log("双重循环（冒泡排序量级）操作次数 =", c1, "→ O(n^2)");\n' +
      'return { n, 线性查找: linear, 二分查找: binary, 平方量级: c1, 倍数: (linear / binary).toFixed(1) };'
  },

  complexity: {
    best: 'O(1)', avg: '—', worst: '—', space: '—',
    detail: [
      '本节没有具体算法，先记住一张「量级排行榜」。假设 1 秒能做 1 亿次基本操作：O(n) 处理 1 亿数据要 1 秒；O(n log n) 处理 1 亿数据约 27 亿次 ≈ 27 秒；O(n²) 处理 10 万数据就要 100 亿次 ≈ 100 秒，而处理 100 万数据是 10<sup>12</sup> 次 ≈ 近 3 小时。',
      '所以一句大白话：<strong>n 一旦上万，就必须跟 O(n²) 说再见</strong>。这也是为什么后面要学快排、归并、哈希表、堆这些「降量级」的工具。'
    ],
    table: [
      ['量级', 'n=16', 'n=1024', 'n=100 万', '直觉例子'],
      ['O(1)', '1', '1', '1', '按下标取数组元素'],
      ['O(log n)', '4', '10', '20', '二分查找（每步砍一半）'],
      ['O(n)', '16', '1024', '100 万', '从头到尾扫一遍'],
      ['O(n log n)', '64', '约 1 万', '约 2000 万', '归并 / 快排 / 堆排序'],
      ['O(n²)', '256', '约 100 万', '10<sup>12</sup>', '冒泡 / 选择 / 朴素比对']
    ]
  },

  quiz: [
    {
      q: '两个算法的操作次数分别是 3n+10 和 n²，当 n 很大时，哪个更快？',
      options: ['3n+10 更快', 'n² 更快', '一样快', '取决于系数 3'],
      answer: 0,
      hint: '别盯着系数 3。试试把 n=1000 代进去算一下两个式子的值，看谁大。',
      why: 'n 足够大时，n² 一定超过任何一次式。'
    },
    {
      q: '某算法需要一个和输入等长的辅助数组，它的空间复杂度是？',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      answer: 2,
      hint: '空间复杂度数的是「额外」借了多少格子。辅助数组长度 = 输入长度 = ?',
      why: '辅助数组长度随 n 线性增长。'
    },
    {
      q: '「每执行一步，就把待处理范围砍掉一半」，这种算法的操作次数量级是？',
      options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
      answer: 1,
      hint: '从 n 砍到 1，需要砍多少次？想想 n=1024 时：512→256→128→…→1 一共几步。',
      why: '砍 k 次后剩 n/2ᵏ，令其 =1 得 k=log₂n。'
    },
    {
      q: '下面哪个说法是对的？',
      options: [
        '运行时间越短，时间复杂度一定越低',
        '时间复杂度低的算法在任何数据上都更快',
        '复杂度描述的是「操作次数随 n 增长的趋势」，与机器快慢无关',
        'O(n²) 算法在小数据上一定比 O(n log n) 慢'
      ],
      answer: 2,
      hint: '复杂度讨论的是「趋势」而不是某一次的具体秒数。注意「一定」这种绝对词。',
      why: '复杂度衡量增长趋势，与机器、常数无关；小数据上常数小的 O(n²) 反而可能更快。'
    }
  ],

  practice: [
    {
      title: '动手题 1 · 数一数操作次数',
      desc: '下面这段代码，基本操作（内层 sum +=）一共执行了多少次？写成关于 n 的表达式，并给出大 O 记法。',
      hint: '外层 i 从 0 到 n-1。当 i=0 时内层跑几次？i=1 呢？把它们加起来：1+2+…+n 等于什么？',
      solution:
        'for (let i = 0; i < n; i++)\n' +
        '  for (let j = 0; j <= i; j++)\n' +
        '    sum += a[j];\n' +
        '\n' +
        '次数 = 1 + 2 + ... + n = n(n+1)/2 = (n²+n)/2\n' +
        '最高阶项是 n²，系数 1/2 丢掉 → 时间复杂度 O(n²)\n' +
        '只用了几个变量 → 空间复杂度 O(1)'
    },
    {
      title: '动手题 2 · 给自己的代码估个量级',
      desc: '写一个函数，判断数组里有没有重复元素。先写你第一反应想到的版本（两层循环两两比对），估它的复杂度；再想想能不能借助一个「记账本」把它降到 O(n)，代价是什么？',
      hint: '两层循环是两两比对。记账本指的是：扫到某个数时，先查一下「我之前见过它吗」——什么数据结构查一次是 O(1)？代价是你要额外准备这本账。',
      solution:
        '// 版本一：两两比对\n' +
        'function dup1(a) {\n' +
        '  for (let i = 0; i < a.length; i++)\n' +
        '    for (let j = i + 1; j < a.length; j++)\n' +
        '      if (a[i] === a[j]) return true;\n' +
        '  return false;\n' +
        '}\n' +
        '// 时间 O(n²)，空间 O(1)\n' +
        '\n' +
        '// 版本二：用 Set 记账\n' +
        'function dup2(a) {\n' +
        '  const seen = new Set();\n' +
        '  for (const x of a) {\n' +
        '    if (seen.has(x)) return true;\n' +
        '    seen.add(x);\n' +
        '  }\n' +
        '  return false;\n' +
        '}\n' +
        '// 时间 O(n)，空间 O(n)  ← 典型「空间换时间」'
    }
  ]
});

/* ------------------------------------------------------------------ */
L({
  id: 'search',
  level: 'beginner',
  title: '查找：从头找到「对半砍」',
  subtitle: '数据乱序只能一个个问；一旦有序，就可以每次砍掉一半——这就是二分查找。',
  prereq: ['intro'],
  minutes: 20,
  tags: ['查找', '二分', '分治思想'],

  analogyTitle: '猜数字游戏：你是一次一次猜，还是每次砍一半？',
  analogy: [
    '我心里想一个 1~100 的数，你猜，我只回答「大了 / 小了 / 对了」。你会从 1 开始猜吗？不会，你一定先猜 50——一句话就把范围从 100 砍到 50；再猜 25 或 75……<strong>7 次之内必中</strong>。这就是二分查找的全部思想。',
    '但注意一个前提：<strong>我回答的「大了 / 小了」之所以有用，是因为数字本来就是排好序的</strong>。如果这 100 个数乱七八糟地堆着，我说「大了」你什么也排除不掉，只能挨个问——那就退化为线性查找。所以<strong>「有序」是二分查找的门票</strong>，而排序本身要花钱，这也决定了「先排序再二分」未必划算。'
  ],

  idea: [
    '<strong>线性查找</strong>：从头扫到尾，最坏 n 次比较，O(n)。唯一优点：不要求有序，还能顺手找「所有满足条件的」。',
    '<strong>二分查找</strong>：维护一个可能区间 [left, right]，每次取中点 mid，一次比较就能排除掉一半区间，O(log n)。',
    '<strong>循环不变式</strong>：始终保证「如果答案存在，它一定还在 [left, right] 里」。所有边界写法都只是在维护这句话。',
    '<strong>难点在边界</strong>：mid 该不该 ±1、循环条件是 &lt; 还是 &lt;=，全看你怎么定义区间（左闭右闭 / 左闭右开）。选一种写熟就行。'
  ],
  when: [
    '数组（或任何支持随机访问的结构）已排序，且需要频繁查询 → 二分。',
    '链表上不要二分：跳到中点本身就要 O(n)，白砍了。',
    '不止能找值：还能找「第一个 ≥ x 的位置」「最后一个 ≤ x 的位置」——几乎所有「单调判定」问题都能二分。'
  ],

  steps: [
    { t: '设 left=0，right=n-1（闭区间）', why: '用闭区间定义，含义最直观：答案若存在必在 [left,right] 内，两个端点都是「还没排除的候选」。' },
    { t: '取 mid = left + ((right-left)>>1)', why: '取中点才能「砍掉一半」，砍得不均匀就退化。写成 left+(right-left)/2 而不是 (left+right)/2，是为了防止 left+right 溢出。' },
    { t: '比较 arr[mid] 与目标', why: '这是唯一的「基本操作」，也是砍掉一半的依据：一次比较换一半区间，这就是 log 的来源。' },
    { t: 'arr[mid] < target → left = mid+1', why: 'mid 位置的值已经比目标小了，mid 本身不可能是答案，所以可以安全地排除掉（+1）。漏掉这个 +1 就可能死循环。' },
    { t: 'arr[mid] > target → right = mid-1', why: '同理，mid 比目标大，mid 也被排除。' },
    { t: '相等 → 返回 mid；若 left>right → 返回 -1', why: '区间被砍空说明整个数组都不可能是答案，此时必须给出「没找到」的确定结论，否则函数会返回垃圾值。' }
  ],

  pseudo: [
    'left = 0; right = n - 1',
    'while left <= right:',
    '    mid = left + (right - left) / 2      // 取中点',
    '    if arr[mid] == target: return mid    // 命中',
    '    else if arr[mid] < target:',
    '        left = mid + 1                   // 目标在右半边，mid 可排除',
    '    else:',
    '        right = mid - 1                  // 目标在左半边，mid 可排除',
    'return -1                                // 区间空了，确实没有'
  ],

  anim: {
    fields: [
      { key: 'arr', kind: 'array', def: '[2,5,8,12,16,23,38,56,72,91]' },
      { key: 'target', kind: 'text', def: '23' }
    ],
    gen: function (v) {
      var a = v.arr.slice().sort(function (x, y) { return x - y; });
      var target = Number(v.target);
      var n = a.length, l = 0, r = n - 1, steps = [], hl = {};
      function push(line, log, extra) {
        steps.push({
          line: line,
          rows: [{ label: '有序数组（灰色=已被排除的区间）', items: a.map(function (x, i) {
            var s = 'idle';
            if (i < l || i > r) s = 'dim';
            if (hl.mid === i) s = 'cmp';
            if (hl.hit === i) s = 'found';
            return { v: x, s: s };
          }), ptrs: [{ name: 'L', idx: l, color: '#4f46e5' }, { name: 'R', idx: r, color: '#0ea5e9' }] }],
          log: log,
          vars: { left: l, right: r, target: target },
          caption: '当前可能区间 [' + l + ', ' + r + ']，还剩 ' + Math.max(0, r - l + 1) + ' 个候选'
        });
        if (extra) Object.keys(extra).forEach(function (k) { steps[steps.length - 1][k] = extra[k]; });
      }
      push(0, '开始：区间 [0, ' + (n - 1) + ']，目标 ' + target);
      while (l <= r) {
        var mid = l + Math.floor((r - l) / 2);
        hl = { mid: mid };
        push(2, '取中点 mid = ' + mid + '，值是 ' + a[mid]);
        if (a[mid] === target) {
          hl = { hit: mid };
          push(3, 'a[' + mid + '] = ' + a[mid] + ' 正好等于目标 ' + target + '，找到了！');
          return steps;
        }
        if (a[mid] < target) {
          push(5, 'a[' + mid + '] = ' + a[mid] + ' < ' + target + ' → 左半边（含 mid）全部排除，left = ' + (mid + 1));
          l = mid + 1; hl = {};
        } else {
          push(7, 'a[' + mid + '] = ' + a[mid] + ' > ' + target + ' → 右半边（含 mid）全部排除，right = ' + (mid - 1));
          r = mid - 1; hl = {};
        }
      }
      push(8, '区间已空（left > right），数组中不存在 ' + target + '，返回 -1');
      return steps;
    }
  },

  run: {
    inputs: [
      { key: 'arr', label: '有序数组', def: '[2,5,8,12,16,23,38,56,72,91]' },
      { key: 'target', label: '目标值', def: '23' }
    ],
    code:
      '// 二分查找：每步砍掉一半区间\n' +
      'const arr = input.arr, target = Number(input.target);\n' +
      'let left = 0, right = arr.length - 1, round = 0;\n' +
      'while (left <= right) {\n' +
      '  round++;\n' +
      '  const mid = left + Math.floor((right - left) / 2);\n' +
      '  log("第" + round + "轮  区间 [" + left + "," + right + "]  mid=" + mid + "  arr[mid]=" + arr[mid]);\n' +
      '  if (arr[mid] === target) { log("命中！下标 =", mid); return { 下标: mid, 比较轮数: round }; }\n' +
      '  if (arr[mid] < target) { left = mid + 1; log("  偏小 → 砍掉左半边"); }\n' +
      '  else { right = mid - 1; log("  偏大 → 砍掉右半边"); }\n' +
      '}\n' +
      'log("区间为空，没找到");\n' +
      'return { 下标: -1, 比较轮数: round, 备注: "n=" + arr.length + " 时最多只需 " + Math.ceil(Math.log2(arr.length + 1)) + " 轮" };'
  },

  complexity: {
    best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)', space: 'O(1)',
    detail: [
      '每轮把候选区间减半，区间长度变化：n → n/2 → n/4 → … → 1。设砍了 k 次，则 n/2ᵏ ≤ 1，得 k ≥ log₂n。所以<strong>轮数 ≈ log₂n</strong>：100 万个数据只要约 20 次比较，10 亿个也只要 30 次。',
      '如果先排序再二分（排序 O(n log n) + 查找 O(log n)），只查一次的话还不如直接线性扫（O(n)）。<strong>二分的优势在于「一次排序，多次查找」</strong>：查 m 次时总成本 O(n log n + m log n)。'
    ],
    table: [
      ['算法', '最好', '平均', '最坏', '空间', '前提'],
      ['线性查找', 'O(1)', 'O(n)', 'O(n)', 'O(1)', '无'],
      ['二分查找', 'O(1)', 'O(log n)', 'O(log n)', 'O(1)', '必须有序 + 随机访问']
    ]
  },

  quiz: [
    {
      q: '在 100 万个有序元素里二分查找，最多大约需要比较多少次？',
      options: ['约 20 次', '约 200 次', '约 1 万次', '约 50 万次'],
      answer: 0,
      hint: '2 的多少次方约等于 100 万？2¹⁰=1024，2²⁰≈100 万。',
      why: 'log₂(10⁶) ≈ 20。'
    },
    {
      q: '二分查找时 arr[mid] < target，接下来应该？',
      options: ['right = mid - 1', 'left = mid + 1', 'left = mid', '直接返回 mid'],
      answer: 1,
      hint: 'arr[mid] 比目标小，说明答案如果存在，一定在 mid 的哪一边？mid 自己还要不要保留？',
      why: '目标更大 → 在右侧；mid 已被排除，所以 +1。'
    },
    {
      q: '为什么链表上通常不用二分查找？',
      options: ['链表不能存数字', '链表无法按下标 O(1) 跳到中点', '链表一定无序', '链表内存不连续就不能比较'],
      answer: 1,
      hint: '二分省下的比较次数，会被什么额外开销吃掉？想想怎么拿到 mid 位置的元素。',
      why: '链表中点要 O(n) 遍历得到，总代价仍是 O(n)。'
    },
    {
      q: '只查一次的情况下，「先排序(O(n log n))再二分(O(log n))」与「直接线性扫描(O(n))」相比？',
      options: ['前者一定更快', '后者更划算', '两者完全一样', '无法比较'],
      answer: 1,
      hint: '把两个总代价写在纸上：n log n + log n 对比 n，n 较大时谁大？',
      why: '排序成本 n log n > n，查一次不值当。'
    }
  ],

  practice: [
    {
      title: '动手题 1 · 找边界（二分的最常见变体）',
      desc: '在有序数组 [1,2,2,2,3,4] 中，找出「第一个 ≥ 2 的下标」和「最后一个 ≤ 2 的下标」。提示：命中时不要立刻返回，而是继续往左 / 往右压缩。',
      hint: '普通二分「命中就返回」。边界版是「命中就记下来，然后继续缩」。找第一个：命中后 right = mid - 1；找最后一个：命中后 left = mid + 1。',
      solution:
        'function lowerBound(a, x) {           // 第一个 >= x 的位置\n' +
        '  let l = 0, r = a.length - 1, ans = a.length;\n' +
        '  while (l <= r) {\n' +
        '    const m = l + ((r - l) >> 1);\n' +
        '    if (a[m] >= x) { ans = m; r = m - 1; }   // 命中先记，再往左压\n' +
        '    else l = m + 1;\n' +
        '  }\n' +
        '  return ans;\n' +
        '}\n' +
        '// [1,2,2,2,3,4] 中 lowerBound(a,2)=1；upperBound 同理返回 4'
    },
    {
      title: '动手题 2 · 二分答案（不是二分下标）',
      desc: '有 n 天的工作量数组，要在 m 天内完成，每天最多连续做若干天。求「每天工作量上限」的最小值。想想：给定上限 L，能否在 m 天内做完？这个判定是单调的吗？',
      hint: '不要直接求答案，改成「猜一个 L，判断行不行」。L 越大越容易完成 → 判定单调 → 可以对 L 二分。',
      solution:
        '// 判定：上限 L 时，最少需要几天？\n' +
        'function days(a, L) {\n' +
        '  let d = 1, cur = 0;\n' +
        '  for (const x of a) {\n' +
        '    if (cur + x > L) { d++; cur = 0; }\n' +
        '    cur += x;\n' +
        '  }\n' +
        '  return d;\n' +
        '}\n' +
        'let l = Math.max(...a), r = a.reduce((s,x)=>s+x,0);   // 答案必在此区间\n' +
        'while (l < r) {                       // 对「答案」二分\n' +
        '  const m = l + ((r - l) >> 1);\n' +
        '  if (days(a, m) <= m_days) r = m; else l = m + 1;\n' +
        '}\n' +
        'return l;   // 时间 O(n log Σ)，思想：把最优化问题转成判定问题'
    }
  ]
});

/* ------------------------------------------------------------------ */
L({
  id: 'simple-sort',
  level: 'beginner',
  title: '排序入门：冒泡与选择（看懂就行，别用）',
  subtitle: '它们存在的意义是帮你建立「比较—交换」的直觉，真实工程里几乎用不到。',
  prereq: ['intro'],
  minutes: 15,
  tags: ['排序', '入门', 'O(n²)'],

  analogyTitle: '体育课排队：一遍遍把「最高的」往后挪',
  analogy: [
    '<strong>冒泡排序</strong>像老师让大家从左到右两两比身高，高的往右挪一格。走一趟下来，最高的那个一定被「浮」到了最右边；再走一趟，第二高的也归位……走 n-1 趟就排好了。',
    '<strong>选择排序</strong>则更省力气：先在所有人里用眼睛扫一遍找出最高的，直接跟他换到最后一位；然后不管他了，在剩下的人里再找最高的换到倒数第二位……它<strong>不啰嗦地交换，只记位置，最后换一次</strong>。'
  ],

  idea: [
    '两者都是 O(n²)，<strong>只适合几十个元素的小规模或教学</strong>。',
    '冒泡：相邻比较 + 交换，一趟把最大值顶到末尾；若某趟没发生交换说明已有序，可提前结束（最好 O(n)）。',
    '选择：每趟扫描找最小值下标，与该趟起始位置交换一次；交换次数只有 O(n) 次，但比较仍是 O(n²)。',
    '冒泡是<strong>稳定</strong>的（相等元素不交换，相对顺序不变）；选择排序<strong>不稳定</strong>（跨距离交换可能把相等元素颠倒）。'
  ],
  when: [
    '只在「数据几乎已经有序」时用冒泡（带提前退出），其余场景都不推荐。',
    '选择排序的优势是「交换次数最少」，在写操作很昂贵（比如 Flash 存储）的极端场景可能被考虑。',
    '真正要用的是后面的插入排序（小数组快）、归并 / 快排 / 堆排序（大规模）。'
  ],

  steps: [
    { t: '外层：控制「已经归位了几个」', why: '每趟结束都会确定一个最终位置的元素，所以待处理区间每趟缩短 1。' },
    { t: '内层：在待处理区间里从头扫到尾（冒泡）或找最小值（选择）', why: '这是 O(n²) 的来源——外层 n 趟 × 内层约 n 次 = n²/2 次比较。' },
    { t: '冒泡：相邻两个逆序就交换', why: '一次交换只消除一个「逆序对」，而逆序对最多有 n(n-1)/2 个，所以慢是结构性的。' },
    { t: '选择：只记 minIndex，扫完再换一次', why: '把「n 次交换」压缩成「1 次交换」，写入代价更低，但比较次数没变。' },
    { t: '冒泡加 swapped 标记提前退出', why: '一趟下来没有任何交换 == 没有任何逆序 == 已经有序。这是唯一能让冒泡跑进 O(n) 的情况。' }
  ],

  pseudo: [
    '// 冒泡排序（带提前退出）',
    'for i = 0 .. n-2:',
    '    swapped = false',
    '    for j = 0 .. n-2-i:          // 末尾 i 个已就位，不用再看',
    '        if arr[j] > arr[j+1]:',
    '            swap(arr[j], arr[j+1])',
    '            swapped = true',
    '    if not swapped: break       // 整趟没交换 → 已有序'
  ],

  anim: {
    fields: [{ key: 'arr', kind: 'array', def: '[5,2,9,1,6,3]' }],
    gen: function (v) {
      var a = v.arr.slice(), n = a.length, steps = [], hl = {};
      var doneFrom = n;
      function push(line, log) {
        steps.push({
          line: line,
          rows: [{
            items: a.map(function (x, i) {
              var s = i >= doneFrom ? 'done' : 'idle';
              if (hl.cmp === i) s = 'cmp';
              if (hl.swap === i) s = 'swap';
              return { v: x, s: s };
            }),
            ptrs: hl.j != null ? [{ name: 'j', idx: hl.j, color: '#4f46e5' }, { name: 'j+1', idx: hl.j + 1, color: '#0ea5e9' }] : []
          }],
          log: log,
          vars: { 已就位: n - doneFrom },
          caption: '蓝=j，青=j+1；灰色=已排好的尾部'
        });
      }
      push(1, '初始数组：' + a.join(', '));
      for (var i = 0; i < n - 1; i++) {
        var swapped = false;
        push(1, '第 ' + (i + 1) + ' 趟开始，待处理区间 [0, ' + (n - 1 - i) + ']');
        for (var j = 0; j < n - 1 - i; j++) {
          hl = { cmp: j, j: j };
          push(4, '比较 a[' + j + ']=' + a[j] + ' 与 a[' + (j + 1) + ']=' + a[j + 1]);
          if (a[j] > a[j + 1]) {
            var t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
            hl = { swap: j };
            push(5, '逆序！交换 → ' + a.join(', '));
            swapped = true;
          }
        }
        doneFrom = n - 1 - i;
        hl = {};
        push(6, '第 ' + (i + 1) + ' 趟结束，a[' + (n - 1 - i) + ']=' + a[n - 1 - i] + ' 已就位');
        if (!swapped) { push(7, '整趟没有发生交换 → 数组已有序，提前结束'); break; }
      }
      var allDone = n; doneFrom = 0; hl = {};
      push(7, '排序完成：' + a.join(', '));
      return steps;
    }
  },

  run: {
    inputs: [{ key: 'arr', label: '待排序数组', def: '[5,2,9,1,6,3]' }],
    code:
      'const a = input.arr.slice();\n' +
      'let cmp = 0, swap = 0;\n' +
      'for (let i = 0; i < a.length - 1; i++) {\n' +
      '  let swapped = false;\n' +
      '  for (let j = 0; j < a.length - 1 - i; j++) {\n' +
      '    cmp++;\n' +
      '    if (a[j] > a[j + 1]) { [a[j], a[j+1]] = [a[j+1], a[j]]; swap++; swapped = true; }\n' +
      '  }\n' +
      '  log("第" + (i+1) + "趟后：", a.join(","));\n' +
      '  if (!swapped) { log("没有交换，提前结束"); break; }\n' +
      '}\n' +
      'return { 结果: a, 比较次数: cmp, 交换次数: swap, "理论比较上界 n(n-1)/2": a.length*(a.length-1)/2 };'
  },

  complexity: {
    best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)',
    stable: '冒泡：稳定；选择：不稳定',
    detail: [
      '冒泡比较次数固定约 n²/2（除非提前退出），交换次数等于逆序对个数，最坏也是 O(n²)。选择排序比较 n²/2 次、交换最多 n 次。',
      '两者都<strong>原地排序</strong>（只用一个临时变量），空间 O(1)。这就是它们唯一的卖点：省内存、代码短、好理解。'
    ],
    table: [
      ['算法', '最好', '平均', '最坏', '空间', '稳定性'],
      ['冒泡排序', 'O(n)', 'O(n²)', 'O(n²)', 'O(1)', '稳定'],
      ['选择排序', 'O(n²)', 'O(n²)', 'O(n²)', 'O(1)', '不稳定'],
      ['插入排序（下一节）', 'O(n)', 'O(n²)', 'O(n²)', 'O(1)', '稳定']
    ]
  },

  quiz: [
    {
      q: '冒泡排序一趟（从前往后扫描并交换）结束后，能确定什么？',
      options: ['最小值到了最左', '最大值到了最右', '数组完全有序', '什么都不确定'],
      answer: 1,
      hint: '大的元素被不断往右推，一趟走完它还能往右吗？',
      why: '最大值像气泡一样浮到右端。'
    },
    {
      q: '冒泡排序加「swapped 标记」后，最好情况复杂度是多少？',
      options: ['O(1)', 'O(n)', 'O(n log n)', 'O(n²)'],
      answer: 1,
      hint: '数组本来就有序时，第一趟扫描会做多少次比较？会不会有第二趟？',
      why: '第一趟 n-1 次比较、0 次交换，直接 break → O(n)。'
    },
    {
      q: '关于「稳定性」，下列说法正确的是？',
      options: [
        '稳定 = 排序结果一定正确',
        '稳定 = 相等元素的原有相对顺序保持不变',
        '选择排序是稳定的',
        '稳定性与是否原地无关意义'
      ],
      answer: 1,
      hint: '两个值相同的元素排完序后，原来在前的还应该在前——这就是稳定。选择排序是「隔着很远直接换」，会不会打乱它们？',
      why: '选择排序的远距离交换会打乱相等元素的相对顺序。'
    },
    {
      q: '用冒泡给 5 万个乱序数字排序，最可能发生什么？',
      options: ['瞬间完成', '明显卡顿（约 12.5 亿次比较）', '内存溢出', '结果错误'],
      answer: 1,
      hint: 'n²/2 = 50000²/2 = ?',
      why: '约 12.5 亿次比较，秒级以上卡顿。'
    }
  ],

  practice: [
    {
      title: '动手题 1 · 改写成选择排序',
      desc: '把上面的冒泡代码改成选择排序：每趟只在「剩下的区间」里找最小值下标，扫完后再交换一次。打印比较次数与交换次数，和冒泡对比。',
      hint: '注意内循环起点是 i+1（不是 0），并且内循环里只更新 minIdx，循环结束才 swap。',
      solution:
        'const a = input.arr.slice();\n' +
        'let cmp = 0, swap = 0;\n' +
        'for (let i = 0; i < a.length - 1; i++) {\n' +
        '  let min = i;\n' +
        '  for (let j = i + 1; j < a.length; j++) { cmp++; if (a[j] < a[min]) min = j; }\n' +
        '  if (min !== i) { [a[i], a[min]] = [a[min], a[i]]; swap++; }\n' +
        '}\n' +
        '// 比较仍是 O(n²)，但交换只有 O(n) 次'
    },
    {
      title: '动手题 2 · 证明「n-1 趟就够」',
      desc: '为什么冒泡排序外层只需要 n-1 趟？如果前 n-1 个元素都已就位，最后一个元素还需要排吗？',
      hint: '假设前 n-1 个已经是「从小到大」且都不大于最后一个——想想最后的那个数，它可能比前面的小吗？',
      solution:
        '每趟固定好一个位置的元素。n-1 趟后已有 n-1 个元素就位，\n' +
        '剩下唯一的元素无处可去，必然已在正确位置。\n' +
        '反证：若最后一个数比已就位的某个数小，那它在之前的某趟里\n' +
        '一定会被交换过去，与「已就位」矛盾。所以最多 n-1 趟。'
    }
  ]
});

/* ------------------------------------------------------------------ */
L({
  id: 'recursion-basic',
  level: 'beginner',
  title: '递归：把大问题拆成「一模一样的小问题」',
  subtitle: '递归不是魔法，它只是「函数调用自己」——关键是找到「最小问题」和「怎么缩小」。',
  prereq: ['intro', 'search'],
  minutes: 25,
  tags: ['递归', '调用栈', '分治雏形'],

  analogyTitle: '俄罗斯套娃与「传话」',
  analogy: [
    '你想知道第 5 个套娃里有多少个娃娃。你不需要一个个拆开数——你只需要知道「第 5 个 = 1 + 第 4 个里面有多少个」，然后去问第 4 个；第 4 个再去问第 3 个……直到第 1 个，答案显然是 1。<strong>这就是递归：把「第 n 个问题」翻译成「规模更小的同类型问题」+ 一点加工。</strong>',
    '但有一条铁律：<strong>必须有一个「不用再问下去」的最小问题（基线条件 / base case）</strong>。否则就像两个人在互相问「你先说」，永远问不到头，程序会栈溢出（Stack Overflow）。'
  ],

  idea: [
    '递归三要素：<strong>① 基线条件（最小问题直接给答案）② 递推关系（大问题 = 小问题 + 加工）③ 每次调用都朝基线靠近</strong>。',
    '函数调用自己时，每层调用的参数、局部变量都<strong>独立保存在调用栈里</strong>，返回时逐层「回填」。',
    '<strong>递归的代价 = 递归树的节点数 × 每节点成本</strong>。斐波那契的朴素递归会重复计算同一子问题，节点数指数爆炸。',
    '消重复的两条路：<strong>记忆化（加个备忘录，自顶向下）</strong> 或 <strong>改成循环递推（自底向上，也就是 DP 的雏形）</strong>。'
  ],
  when: [
    '问题本身是「自相似」的：树、图、链表、分治、回溯、DFS——写递归最自然。',
    '递归深度可能很大（比如 n=10⁵ 的链表）时要用循环，否则栈会爆。',
    '看到「重复子问题」立刻上记忆化，能把指数级降到多项式级。'
  ],

  steps: [
    { t: '先写基线条件', why: '没有出口的递归必崩。先回答「最小的问题是什么」，再考虑别的。' },
    { t: '写出递推关系：f(n) = ... f(更小) ...', why: '必须保证「更小」是严格变小，否则永远到不了基线。' },
    { t: '信任递归：假设 f(n-1) 已经算对了', why: '不要在大脑里同时展开 5 层调用——那是崩溃的根源。只验证「基线对」和「递推对」这两点即可。' },
    { t: '画递归树，数节点个数', why: '节点数就是调用次数，直接决定时间复杂度；树的最大深度就是空间复杂度（栈深）。' },
    { t: '发现重复节点 → 加备忘录', why: '同一个 f(k) 被算了几百万次，用一个对象缓存起来，这是从 O(2ⁿ) 降到 O(n) 的关键一步。' }
  ],

  pseudo: [
    '// 阶乘：n! = n × (n-1)!',
    'function f(n):',
    '    if n == 0: return 1          // 基线条件',
    '    return n * f(n - 1)          // 递推：规模变小',
    '',
    '// 斐波那契（朴素版，会重复计算）',
    'function fib(n):',
    '    if n <= 1: return n',
    '    return fib(n-1) + fib(n-2)',
    '',
    '// 记忆化版：算过的记下来',
    'function fib2(n, memo):',
    '    if n <= 1: return n',
    '    if memo[n] exists: return memo[n]',
    '    memo[n] = fib2(n-1, memo) + fib2(n-2, memo)',
    '    return memo[n]'
  ],

  anim: {
    fields: [{ key: 'n', kind: 'text', label: '计算 fib(n) 的 n', def: '5' }],
    legend: [['idle', '未计算'], ['active', '正在计算'], ['cmp', '命中备忘录'], ['done', '已算出结果']],
    gen: function (v) {
      var n = Math.max(1, Math.min(7, parseInt(Number(v.n) || 5, 10)));
      var steps = [];
      /* 递归树坐标：按全局展开顺序给 x，深度给 y */
      var nodes = [], edges = [], order = 0, depthMap = {};
      function idOf(k, d) { return 'n' + k + '_' + d + '_' + (order++); }
      var memo = {};
      var stack = [];
      var counter = 0;

      function build(k, d, parentId) {
        var me = 'id' + (counter++);
        var nd = { id: me, label: 'fib(' + k + ')', sub: '', x: 0, y: 40 + d * 74, s: 'active' };
        nodes.push(nd);
        if (parentId) edges.push({ from: parentId, to: me, s: 'idle' });
        stack.push('fib(' + k + ')');
        steps.push(mkStep(me, '调用 fib(' + k + ')：' + (k <= 1 ? '命中基线条件，直接返回 ' + k : '需要先算出 fib(' + (k - 1) + ') 和 fib(' + (k - 2) + ')'), d));
        var val;
        if (k <= 1) {
          val = k;
          nd.s = 'done'; nd.sub = '= ' + k;
          memo[k] = k;
          steps.push(mkStep(me, 'fib(' + k + ') = ' + k + '（基线），返回', d));
        } else if (memo[k] !== undefined) {
          val = memo[k];
          nd.s = 'cmp'; nd.sub = '= ' + val + ' 缓存';
          steps.push(mkStep(me, '备忘命中！fib(' + k + ') 之前算过 = ' + val + '，直接返回（省掉整棵子树）', d));
        } else {
          var a = build(k - 1, d + 1, me);
          var b = build(k - 2, d + 1, me);
          val = a + b;
          memo[k] = val;
          nd.s = 'done'; nd.sub = '= ' + val;
          steps.push(mkStep(me, 'fib(' + k + ') = ' + a + ' + ' + b + ' = ' + val + '，记入备忘录并返回', d));
        }
        stack.pop();
        return val;
      }

      function mkStep(me, log, d) {
        return {
          line: d === 0 ? 2 : 6,
          activeId: me,
          scenes: [{
            kind: 'nodes',
            nodes: nodes.map(function (nd) {
              return { id: nd.id, label: nd.label, sub: nd.sub, x: nd.x, y: nd.y, s: nd.id === me ? 'active' : nd.s, shape: 'rect', w: 62, h: 40 };
            }),
            edges: edges.slice(),
            caption: '递归展开树（每个框 = 一次函数调用；橙色=正在算，绿色=已算出，黄色=命中缓存）'
          }],
          log: log,
          vars: { 备忘录: JSON.stringify(memo), 调用栈深度: stack.length },
          stack: stack.slice()
        };
      }
      build(n, 0, null);
      /* 修正 x 坐标：让同层节点居中分布 */
      var byDepth = {};
      nodes.forEach(function (nd) { (byDepth[nd.y] = byDepth[nd.y] || []).push(nd); });
      Object.keys(byDepth).forEach(function (y) {
        var arr = byDepth[y], span = arr.length;
        arr.forEach(function (nd, i) { nd.x = (i + 1) * (700 / (span + 1)); });
      });
      steps.forEach(function (s) {
        s.scenes[0].nodes = nodes.map(function (nd) {
          return {
            id: nd.id, label: nd.label, sub: nd.sub, x: nd.x, y: nd.y,
            s: nd.id === s.activeId ? 'active' : nd.s, shape: 'rect', w: 62, h: 40
          };
        });
      });
      return steps;
    }
  },

  run: {
    inputs: [{ key: 'n', label: 'n（建议 ≤ 30）', def: '25' }],
    code:
      'const n = Number(input.n);\n' +
      'let calls = 0;\n' +
      'function fib(n) {                      // 朴素递归：会重复计算\n' +
      '  calls++;\n' +
      '  if (n <= 1) return n;\n' +
      '  return fib(n - 1) + fib(n - 2);\n' +
      '}\n' +
      'let calls2 = 0;\n' +
      'const memo = {};\n' +
      'function fib2(n) {                     // 记忆化：算过的记下来\n' +
      '  calls2++;\n' +
      '  if (n <= 1) return n;\n' +
      '  if (memo[n] !== undefined) return memo[n];\n' +
      '  memo[n] = fib2(n - 1) + fib2(n - 2);\n' +
      '  return memo[n];\n' +
      '}\n' +
      'let calls3 = 0;\n' +
      'function fib3(n) {                     // 递推（自底向上）：不用递归\n' +
      '  let a = 0, b = 1;\n' +
      '  for (let i = 2; i <= n; i++) { calls3++; const t = a + b; a = b; b = t; }\n' +
      '  return n === 0 ? 0 : b;\n' +
      '}\n' +
      'const r1 = fib(n), r2 = fib2(n), r3 = fib3(n);\n' +
      'log("n =", n, " fib(n) =", r1);\n' +
      'log("朴素递归调用次数 =", calls, "  → 约 O(2^n)，指数爆炸");\n' +
      'log("记忆化调用次数   =", calls2, "  → O(n)");\n' +
      'log("递推循环次数     =", calls3, "  → O(n)，且无栈开销");\n' +
      'return { 结果: r1, 三者一致: r1 === r2 && r2 === r3, 朴素递归调用: calls, 记忆化调用: calls2 };'
  },

  complexity: {
    best: 'O(n)', avg: 'O(2ⁿ)（朴素）', worst: 'O(2ⁿ)（朴素）', space: 'O(n)（栈深）',
    detail: [
      '朴素 fib(n) 的递归树节点数约为 2ⁿ 量级（精确是 Θ(φⁿ)，φ≈1.618），因为大量子问题被重复计算：fib(20) 要调用上万次，fib(40) 要上亿次。',
      '加备忘录后，每个 fib(k)（k=0..n）只算一次 → 时间 O(n)，但要额外 O(n) 的备忘空间 + O(n) 的栈深。改成循环递推后时间 O(n)、空间可压到 O(1)。<strong>「递归 → 记忆化 → 递推」这个三部曲，就是后面动态规划的主线。</strong>'
    ],
    table: [
      ['写法', '时间', '空间', '说明'],
      ['朴素递归', 'O(2ⁿ)', 'O(n) 栈', '重复计算同子问题'],
      ['记忆化递归', 'O(n)', 'O(n) 备忘 + O(n) 栈', '自顶向下，好写'],
      ['循环递推', 'O(n)', 'O(1)', '自底向上，最优但要先想清顺序']
    ]
  },

  quiz: [
    {
      q: '递归缺少「基线条件」会导致什么？',
      options: ['结果偏大', '无限递归直到栈溢出', '自动返回 0', '编译报错'],
      answer: 1,
      hint: '函数不停地调用自己，每层调用都要占用一点栈空间——一直占下去会怎样？',
      why: '调用栈被撑爆，抛 Stack Overflow。'
    },
    {
      q: '朴素 fib(30) 为什么慢？',
      options: ['加法本身慢', '同一子问题被重复计算了成千上万次', '递归调用太耗内存', 'JavaScript 不支持递归'],
      answer: 1,
      hint: '画一下 fib(5) 的递归树，数一数 fib(2) 出现了几次？',
      why: '递归树节点数指数级增长。'
    },
    {
      q: '关于「递归深度」与空间复杂度，正确的是？',
      options: [
        '递归不占额外空间',
        '空间复杂度 ≈ 递归树的最大深度（调用栈层数）',
        '空间复杂度 = 节点总数',
        '只看参数个数'
      ],
      answer: 1,
      hint: '同时「活着」的调用有几层？已经返回的调用占不占栈？',
      why: '栈中同时存在的层数 = 树深。'
    },
    {
      q: '把递归改成循环递推（自底向上）最大的好处是？',
      options: ['代码更好懂', '避免栈溢出且空间可降到 O(1)', '一定更快 10 倍', '能处理更大规模的输入类型'],
      answer: 1,
      hint: '循环没有调用栈，而且只保留前两个值就够了——还需要整张备忘录吗？',
      why: '无栈开销，滚动变量即可。'
    }
  ],

  practice: [
    {
      title: '动手题 1 · 手写阶乘与求和',
      desc: '分别用递归和循环实现「1+2+…+n」，对比两者在 n=100000 时的表现（递归会不会崩？）。',
      hint: '递归深度 = n。浏览器栈一般几千到一万层就到极限了。',
      solution:
        '// 递归版：n 大时爆栈\n' +
        'function sumR(n) { return n === 0 ? 0 : n + sumR(n - 1); }\n' +
        '// 循环版：安全\n' +
        'function sumL(n) { let s = 0; for (let i = 1; i <= n; i++) s += i; return s; }\n' +
        '// 闭区间公式：O(1)\n' +
        'const sumF = n => n * (n + 1) / 2;'
    },
    {
      title: '动手题 2 · 爬楼梯（递归 → 记忆化）',
      desc: '一次可以跨 1 或 2 级台阶，爬到第 n 级有多少种走法？先写朴素递归，再用记忆化改造，打印调用次数对比。',
      hint: '递推关系和第几级有关：要到达第 n 级，最后一步要么从 n-1 跨 1 级，要么从 n-2 跨 2 级。所以 f(n) = ?',
      solution:
        'function climb(n, memo = {}) {\n' +
        '  if (n <= 2) return n;              // f(1)=1, f(2)=2\n' +
        '  if (memo[n]) return memo[n];\n' +
        '  return memo[n] = climb(n - 1, memo) + climb(n - 2, memo);\n' +
        '}\n' +
        '// 其实就是斐波那契换了个皮：f(n) = f(n-1) + f(n-2)\n' +
        '// 记忆化后 O(n)；滚动变量可压到 O(1) 空间'
    }
  ]
});
