/* ============ 基础篇 ============ */

/* ------------------------------------------------------------------ */
L({
  id: 'insertion-sort',
  level: 'intermediate',
  title: '插入排序：打扑克时的理牌动作',
  subtitle: '手里的牌永远有序，每摸一张就插到合适位置——小规模数据上它比快排还快。',
  prereq: ['simple-sort'],
  minutes: 15,
  tags: ['排序', '稳定', '原地'],

  analogyTitle: '摸牌理牌：你从来不会重排整副牌',
  analogy: [
    '打扑克时你左手握着的牌是<strong>从小到大排好的</strong>。每摸一张新牌，你会从右往左看，把它插到第一个比它小的牌后面——前面的牌你根本不用动。这就是插入排序。',
    '对比冒泡排序：冒泡是「把整排人反复推来推去」，插入是「新来的人自己找位置坐下，其他人挪一格」。后者的挪动范围小得多，所以<strong>数据越接近有序，插入排序越快</strong>。'
  ],

  idea: [
    '<strong>不变式</strong>：下标 [0, i-1] 永远是有序的，第 i 轮把 a[i] 插进这个有序段。',
    '插入时<strong>从右往左比较并「边比边挪」</strong>：比 a[i] 大的元素整体右移一格，直到遇到 ≤ 它的，把 a[i] 放进去。',
    '<strong>稳定</strong>：只有「严格大于」才右移，相等的不动，所以相等元素保持原顺序。',
    '<strong>原地、自适应</strong>：空间 O(1)；已有序时每轮只比较 1 次 → 最好 O(n)。'
  ],
  when: [
    '数组长度很小（&lt; 50）或几乎已经有序 → 插入排序常数极小，很多语言的排序函数在小区间会退化成它。',
    '需要稳定排序又不方便开额外数组时。',
    '在线场景：数据一个一个来，来了就插进去保持有序（插入排序天然支持）。'
  ],

  steps: [
    { t: '从 i = 1 开始（下标 0 的单个元素天然有序）', why: '只有一个元素时「有序」是成立的，这就是我们起步的不变式。' },
    { t: '把 a[i] 存为 key，留出 i 这个空位', why: '后面的元素要右移，先把要插的值备份出来，否则会被覆盖掉。' },
    { t: 'j 从 i-1 往左走，只要 a[j] > key 就把 a[j] 右移一格', why: '「边比边挪」把「查找位置」和「移动元素」合并成一遍，比「先找位置再整体搬」省一次遍历。' },
    { t: '遇到 a[j] ≤ key（或 j < 0）就停下，把 key 放到 j+1', why: '此时 j+1 正好是被挪出来的空位，且左边都 ≤ key、右边都 ≥ key，插入后有序段仍然有序。' },
    { t: 'i++，重复到末尾', why: '每轮把有序段长度 +1，n-1 轮后整个数组有序。' }
  ],

  pseudo: [
    'for i = 1 .. n-1:',
    '    key = arr[i]                     // 备份要插入的值',
    '    j = i - 1',
    '    while j >= 0 and arr[j] > key:   // 只挪「严格大于」的 → 稳定',
    '        arr[j+1] = arr[j]            // 右移一格',
    '        j = j - 1',
    '    arr[j+1] = key                   // 空位正好在这里'
  ],

  anim: {
    fields: [{ key: 'arr', kind: 'array', def: '[5,2,4,6,1,3]' }],
    gen: function (v) {
      var a = v.arr.slice(), n = a.length, steps = [], hl = {};
      var sortedTo = 1;
      function push(line, log) {
        steps.push({
          line: line,
          rows: [{
            items: a.map(function (x, i) {
              var s = i < sortedTo ? 'done' : 'idle';
              if (hl.key === i) s = 'target';
              if (hl.cmp === i) s = 'cmp';
              if (hl.move === i) s = 'swap';
              return { v: x, s: s };
            }),
            ptrs: (hl.j != null && hl.j >= 0) ? [{ name: 'j', idx: hl.j, color: '#4f46e5' }] : []
          }],
          log: log,
          vars: { key: hl.keyVal !== undefined ? hl.keyVal : '—' },
          caption: '绿色=已排好的有序段，蓝=本轮要插入的 key，黄=正在比较'
        });
      }
      push(0, '初始：[0] 这一段天然有序，从 i=1 开始');
      for (var i = 1; i < n; i++) {
        var key = a[i];
        hl = { key: i, keyVal: key };
        push(1, '第 ' + i + ' 轮：key = a[' + i + '] = ' + key + '，要在前面的有序段里找位置');
        var j = i - 1;
        while (j >= 0 && a[j] > key) {
          hl = { cmp: j, key: i, keyVal: key, j: j };
          push(3, 'a[' + j + ']=' + a[j] + ' > ' + key + ' → 右移到 ' + (j + 1));
          a[j + 1] = a[j];
          hl = { move: j + 1, key: i, keyVal: key };
          push(4, '移动后：' + a.join(', '));
          j--;
        }
        a[j + 1] = key;
        hl = { key: j + 1, keyVal: key };
        push(6, (j >= 0 ? 'a[' + j + ']=' + a[j] + ' ≤ ' + key + '，' : '已到最左端，') + '把 key 放入 ' + (j + 1) + '：' + a.join(', '));
        sortedTo = i + 1;
        hl = {};
        push(6, '有序段扩展到 [0, ' + i + ']');
      }
      push(6, '排序完成：' + a.join(', '));
      return steps;
    }
  },

  run: {
    inputs: [{ key: 'arr', label: '待排序数组', def: '[5,2,4,6,1,3]' }],
    code:
      'const a = input.arr.slice();\n' +
      'let cmp = 0, move = 0;\n' +
      'for (let i = 1; i < a.length; i++) {\n' +
      '  const key = a[i];\n' +
      '  let j = i - 1;\n' +
      '  while (j >= 0) { cmp++; if (a[j] <= key) break; a[j+1] = a[j]; move++; j--; }\n' +
      '  a[j + 1] = key;\n' +
      '  log("第" + i + "轮  插入 " + key + " →", a.join(","));\n' +
      '}\n' +
      'return { 结果: a, 比较次数: cmp, 移动次数: move, 提示: "逆序对越多，move 越大；已有序时 cmp ≈ n" };'
  },

  complexity: {
    best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: '稳定',
    detail: [
      '比较次数 ≈ 逆序对个数 + n。完全逆序时逆序对 n(n-1)/2 → O(n²)；已有序时每轮只比 1 次 → O(n)。这就是「自适应」的含义。',
      '它是<strong>原地</strong>的：只用了 key 和 j 两个变量，空间 O(1)。也正因为常数极小，主流语言（Java Arrays.sort、C++ std::sort）在小数组上都切回插入排序。'
    ],
    table: [
      ['场景', '比较次数', '移动次数', '总复杂度'],
      ['已有序', 'n-1', '0', 'O(n)'],
      ['随机乱序', '约 n²/4', '约 n²/4', 'O(n²)'],
      ['完全逆序', 'n(n-1)/2', 'n(n-1)/2', 'O(n²)']
    ]
  },

  quiz: [
    {
      q: '插入排序在什么数据上最快？',
      options: ['完全逆序', '随机乱序', '已经有序', '都一样'],
      answer: 2,
      hint: '已有序时，每轮 while 循环会执行几次？还会不会挪元素？',
      why: '每轮比较 1 次即停，总 O(n)。'
    },
    {
      q: '插入排序为什么是「稳定」的？',
      options: ['它不开额外数组', '只在「严格大于」时才右移，相等的不动', '它从右往左扫描', '它时间复杂度低'],
      answer: 1,
      hint: '两个相等的元素，后摸到的那张牌会不会被插到前面那张的前面去？关键看 while 条件是 > 还是 ≥。',
      why: '条件用 > 而非 ≥，相等元素不跨越。'
    },
    {
      q: '插入排序一趟结束后，能保证什么？',
      options: ['整个数组有序', '前 i+1 个元素有序', '最大值在末尾', '最小值在开头'],
      answer: 1,
      hint: '这是「循环不变式」：每轮开始时 [0,i-1] 有序，插入后变成什么？',
      why: '有序段长度每轮 +1。'
    },
    {
      q: '工程上什么时候反而应该选插入排序而不是快排？',
      options: ['数据量上百万时', '数组很小或几乎有序时', '需要不稳定排序时', '内存充足时'],
      answer: 1,
      hint: '插入排序的常数极小（没有递归、没有函数调用），在 n 很小时 n² 的平方项还没显现出来。',
      why: '小数组 / 近似有序 → 常数优势压过量级劣势。'
    }
  ],

  practice: [
    {
      title: '动手题 1 · 二分插入排序',
      desc: '插入排序找位置那一步是「线性扫描」，能不能改成二分查找？改完以后移动次数变了吗？整体复杂度有没有降阶？',
      hint: '二分只能把「找位置」从 O(n) 降到 O(log n)，但「挪元素」仍然要 O(n)。加起来每轮还是 O(n)。',
      solution:
        '// 找位置用 lowerBound（第一个 > key 的位置），移动仍是 O(n)\n' +
        'const pos = lowerBound(a, 0, i - 1, key);\n' +
        'for (let k = i; k > pos; k--) a[k] = a[k - 1];\n' +
        'a[pos] = key;\n' +
        '// 比较 O(n log n)，移动 O(n²) → 总体仍是 O(n²)，但比较次数明显下降'
    },
    {
      title: '动手题 2 · 链表插入排序',
      desc: '如果数据存在单向链表里，插入排序还能做吗？它的空间复杂度会变成多少？为什么这时「从前往后找位置」更自然？',
      hint: '链表不能随机访问，但插入/删除本身是 O(1)（改指针）。注意：不能往回走，所以要从头结点开始找插入点。',
      solution:
        'function insertionSortList(head) {\n' +
        '  const dummy = { val: -Infinity, next: null };\n' +
        '  let cur = head;\n' +
        '  while (cur) {\n' +
        '    const next = cur.next;\n' +
        '    let p = dummy;\n' +
        '    while (p.next && p.next.val < cur.val) p = p.next;   // 找插入点\n' +
        '    cur.next = p.next; p.next = cur;                      // O(1) 插入\n' +
        '    cur = next;\n' +
        '  }\n' +
        '  return dummy.next;\n' +
        '}\n' +
        '// 时间 O(n²)，空间 O(1)（原地改指针，不需要额外数组）'
    }
  ]
});

/* ------------------------------------------------------------------ */
L({
  id: 'merge-sort',
  level: 'intermediate',
  title: '归并排序：分治思想的第一课',
  subtitle: '先把大问题拆成一堆小问题各自解决，再把结果「合并」起来——合并这一步才是关键。',
  prereq: ['recursion-basic'],
  minutes: 30,
  tags: ['排序', '分治', 'O(n log n)', '稳定'],

  analogyTitle: '两摞排好序的考卷，怎么合成一摞？',
  analogy: [
    '老师把 40 份考卷分成两摞给两个助教，各自按分数排好，再交回来。合成一摞时，你只需要<strong>同时看两摞最上面那份，取较小的放下去</strong>——一共只要 40 次比较，比重新排一遍省太多了。这就是「归并」。',
    '那两个助教又是怎么排好自己那 20 份的？答案：再对半分给 4 个人……一直分到每人手上只有 1 份（1 份天然有序）。<strong>「分」几乎不花力气，力气全花在「合」上</strong>——这就是分治的本质。'
  ],

  idea: [
    '<strong>分治三步</strong>：分解（把区间对半）→ 解决（递归排两边）→ 合并（有序段二路归并）。',
    '合并是核心：两个有序段各有一个指针，每次取较小的那个写回，<strong>线性时间 O(n)</strong>。',
    '<strong>递归树深度 log₂n，每层所有合并加起来是 O(n)</strong> → 总时间 O(n log n)，而且是「稳定」的（取左边相等元素优先）。',
    '<strong>代价：需要 O(n) 辅助数组</strong>（不是原地排序），这也是它不如快排常用的原因之一。'
  ],
  when: [
    '需要<strong>稳定</strong>的 O(n log n) 排序 → 归并（或 Timsort）。',
    '<strong>链表排序</strong>首选归并：链表合并只需改指针，不需要额外数组，空间可降到 O(1)（不计递归栈）。',
    '外部排序（数据大到内存放不下，存在磁盘上）→ 归并是唯一现实的选择。',
    '大数据量 + 内存敏感时，可能改用堆排序（原地 O(1)）或快排（原地 + 常数小）。'
  ],

  steps: [
    { t: '递归地把区间对半拆到只剩 1 个元素', why: '单个元素天然有序，这是递归的基线条件。拆的深度是 log₂n。' },
    { t: '申请一个临时数组，把左右两段拷进去', why: '直接在原数组上写会覆盖还没读到的元素，所以必须先备份——这正是 O(n) 空间的来源。' },
    { t: '双指针 i、j 分别指向左右段开头，取较小者写入原数组', why: '两段都已有序，所以「当前最小的」只可能是 i 或 j 指向的元素之一，一次比较就够，无需回头看。' },
    { t: '相等时优先取左边', why: '这是保持「稳定性」的关键：左边元素原本就在前面，优先取它就不会颠倒相对顺序。' },
    { t: '某一段取完后，把另一段剩余部分整体拷回', why: '剩下的元素本来就有序且都大于已写入的所有元素，直接搬即可，不用再比较。' }
  ],

  pseudo: [
    'function mergeSort(arr, lo, hi):',
    '    if lo >= hi: return                  // 1 个元素天然有序',
    '    mid = lo + (hi - lo) / 2',
    '    mergeSort(arr, lo, mid)              // 排左半',
    '    mergeSort(arr, mid+1, hi)            // 排右半',
    '    merge(arr, lo, mid, hi)              // 合并（核心）',
    '',
    'function merge(arr, lo, mid, hi):',
    '    L = arr[lo..mid]; R = arr[mid+1..hi]',
    '    i = 0; j = 0; k = lo',
    '    while i < |L| and j < |R|:',
    '        if L[i] <= R[j]: arr[k++] = L[i++]   // <= 保证稳定',
    '        else:            arr[k++] = R[j++]',
    '    把没取完的那一段剩余元素直接接上'
  ],

  anim: {
    fields: [{ key: 'arr', kind: 'array', def: '[8,3,5,1,9,2,7,4]' }],
    legend: [['active', '本趟正在合并的区间'], ['cmp', '左段指针 i'], ['pivot', '右段指针 j'], ['swap', '刚写入的位置'], ['done', '已合并完成']],
    gen: function (v) {
      var a = v.arr.slice(), n = a.length, steps = [];
      var doneSet = {};
      function push(line, log, rows, vars) {
        steps.push({
          line: line,
          rows: rows || [{
            items: a.map(function (x, i) {
              var s = doneSet[i] ? 'done' : 'idle';
              if (hl.lo != null && i >= hl.lo && i <= hl.hi) s = 'active';
              if (hl.k === i) s = 'swap';
              return { v: x, s: s };
            })
          }],
          log: log,
          vars: vars || {},
          caption: '橙=本趟合并区间 [' + (hl.lo == null ? '-' : hl.lo) + ', ' + (hl.hi == null ? '-' : hl.hi) + ']'
        });
      }
      var hl = {};
      push(0, '初始数组：' + a.join(', '));

      function ms(lo, hi) {
        if (lo >= hi) return;
        var mid = lo + Math.floor((hi - lo) / 2);
        hl = { lo: lo, hi: hi };
        push(2, '拆分区间 [' + lo + ', ' + hi + '] → 左 [' + lo + ',' + mid + '] 右 [' + (mid + 1) + ',' + hi + ']');
        ms(lo, mid);
        ms(mid + 1, hi);
        merge(lo, mid, hi);
      }

      function merge(lo, mid, hi) {
        var L = a.slice(lo, mid + 1), R = a.slice(mid + 1, hi + 1);
        hl = { lo: lo, hi: hi };
        push(8, '准备合并：左段 ' + JSON.stringify(L) + ' 右段 ' + JSON.stringify(R), [
          {
            label: '原数组',
            items: a.map(function (x, i) {
              var s = doneSet[i] ? 'done' : 'idle';
              if (i >= lo && i <= hi) s = 'active';
              return { v: x, s: s };
            })
          },
          {
            label: '待合并（左段 | 右段）',
            items: L.map(function (x, i) { return { v: x, s: 'idle' }; })
              .concat(R.map(function (x, i) { return { v: x, s: 'idle' }; }))
          }
        ], { 左段: JSON.stringify(L), 右段: JSON.stringify(R) });

        var i = 0, j = 0, k = lo;
        while (i < L.length && j < R.length) {
          hl = { lo: lo, hi: hi, k: k };
          var rows = [
            {
              label: '原数组（橙=本趟区间，红=刚写入）',
              items: a.map(function (x, idx) {
                var s = doneSet[idx] ? 'done' : 'idle';
                if (idx >= lo && idx <= hi) s = 'active';
                if (idx === k) s = 'swap';
                return { v: x, s: s };
              })
            },
            {
              label: '左段（黄=i 指向） | 右段（紫=j 指向）',
              items: L.map(function (x, idx) { return { v: x, s: idx === i ? 'cmp' : (idx < i ? 'dim' : 'idle') }; })
                .concat(R.map(function (x, idx) { return { v: x, s: idx === j ? 'pivot' : (idx < j ? 'dim' : 'idle') }; })),
              ptrs: [{ name: 'i', idx: i, color: '#f59e0b' }, { name: 'j', idx: L.length + j, color: '#8b5cf6' }]
            }
          ];
          push(10, '比较 L[' + i + ']=' + L[i] + ' 与 R[' + j + ']=' + R[j], rows, { i: i, j: j, k: k });
          if (L[i] <= R[j]) { a[k] = L[i]; push(11, '左边 ≤ 右边 → 取左段 ' + L[i] + ' 写入 ' + k, rows, { i: i, j: j, k: k }); i++; }
          else { a[k] = R[j]; push(12, '右边更小 → 取右段 ' + R[j] + ' 写入 ' + k, rows, { i: i, j: j, k: k }); j++; }
          k++;
        }
        while (i < L.length) { a[k] = L[i]; hl = { lo: lo, hi: hi, k: k }; push(13, '左段有剩余，直接搬 ' + L[i] + ' → ' + k); i++; k++; }
        while (j < R.length) { a[k] = R[j]; hl = { lo: lo, hi: hi, k: k }; push(13, '右段有剩余，直接搬 ' + R[j] + ' → ' + k); j++; k++; }
        for (var t = lo; t <= hi; t++) if (n === hi - lo + 1) doneSet[t] = true;
        hl = { lo: lo, hi: hi };
        push(13, '区间 [' + lo + ',' + hi + '] 合并完成：' + a.slice(lo, hi + 1).join(', '));
      }
      ms(0, n - 1);
      var fin = {}; for (var q = 0; q < n; q++) fin[q] = true;
      Object.keys(fin).forEach(function (kk) { doneSet[kk] = true; });
      hl = {};
      push(13, '全部完成：' + a.join(', '));
      return steps;
    }
  },

  run: {
    inputs: [{ key: 'arr', label: '待排序数组', def: '[8,3,5,1,9,2,7,4]' }],
    code:
      'const a = input.arr.slice();\n' +
      'const aux = new Array(a.length);\n' +
      'let cmp = 0, depth = 0;\n' +
      'function merge(lo, mid, hi) {\n' +
      '  for (let k = lo; k <= hi; k++) aux[k] = a[k];\n' +
      '  let i = lo, j = mid + 1;\n' +
      '  for (let k = lo; k <= hi; k++) {\n' +
      '    if (i > mid) a[k] = aux[j++];\n' +
      '    else if (j > hi) a[k] = aux[i++];\n' +
      '    else { cmp++; if (aux[j] < aux[i]) a[k] = aux[j++]; else a[k] = aux[i++]; }\n' +
      '  }\n' +
      '}\n' +
      'function ms(lo, hi, d) {\n' +
      '  depth = Math.max(depth, d);\n' +
      '  if (lo >= hi) return;\n' +
      '  const mid = lo + ((hi - lo) >> 1);\n' +
      '  ms(lo, mid, d + 1); ms(mid + 1, hi, d + 1);\n' +
      '  merge(lo, mid, hi);\n' +
      '  log("合并 [" + lo + "," + hi + "] →", a.slice(lo, hi + 1).join(","));\n' +
      '}\n' +
      'ms(0, a.length - 1, 1);\n' +
      'return { 结果: a, 比较次数: cmp, 递归深度: depth, "理论 n·log n": Math.round(a.length * Math.log2(a.length)) };'
  },

  complexity: {
    best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', stable: '稳定',
    detail: [
      '递归关系：T(n) = 2·T(n/2) + O(n)（两个子问题 + 线性合并）。展开后每层合计 O(n)，共 log₂n 层 → <strong>T(n) = O(n log n)</strong>。注意它<strong>最好最坏都是 O(n log n)</strong>，不受数据分布影响，这是它比快排稳的地方。',
      '空间：合并需要 O(n) 临时数组；递归栈 O(log n)。总空间 O(n)。链表版可以把辅助数组省掉（只改指针），空间降到 O(log n) 栈 + O(1) 额外。'
    ],
    table: [
      ['算法', '平均', '最坏', '空间', '稳定', '说明'],
      ['归并排序', 'O(n log n)', 'O(n log n)', 'O(n)', '是', '稳定、可外排、需辅助空间'],
      ['快速排序', 'O(n log n)', 'O(n²)', 'O(log n)', '否', '原地、常数小、最坏会退化'],
      ['堆排序', 'O(n log n)', 'O(n log n)', 'O(1)', '否', '原地省内存，缓存不友好']
    ]
  },

  quiz: [
    {
      q: '归并排序的递归式是 T(n)=2T(n/2)+O(n)，它的解是？',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
      answer: 1,
      hint: '递归树有多少层？每层所有节点的合并代价加起来是多少？层数 × 每层代价 = ?',
      why: 'log n 层 × 每层 O(n) = O(n log n)。'
    },
    {
      q: '归并排序为什么需要 O(n) 的额外空间？',
      options: ['因为用了递归', '合并时直接在原数组写会覆盖未读元素，需要临时数组备份', '为了保持稳定', '为了存递归栈'],
      answer: 1,
      hint: '假设不用临时数组，直接把右边的小元素写到左边位置——那个位置上原来的元素还没被读过，会发生什么？',
      why: '原地合并无法保证不覆盖，必须备份。'
    },
    {
      q: '合并两个长度各为 m 的有序段，最少 / 最多比较次数是？',
      options: ['1 / 2m', 'm / 2m-1', 'm / 2m', '2m / 2m'],
      answer: 1,
      hint: '最好情况：其中一段的所有元素都小于另一段的最小值，取完一段后剩下的直接搬。一段 m 个全取完需要几次比较？',
      why: '最少 m 次（一段整体更小），最多 2m-1 次（交替取）。'
    },
    {
      q: '给一个超大的单向链表排序，最合适的是？',
      options: ['快排', '归并排序', '冒泡排序', '堆排序'],
      answer: 1,
      hint: '链表不能按下标随机访问（快排、堆排都依赖随机访问），但合并两个有序链表只需要改指针。',
      why: '归并只需顺序访问 + O(1) 改指针，链表天然适配。'
    }
  ],

  practice: [
    {
      title: '动手题 1 · 自底向上的归并（不用递归）',
      desc: '把递归版改成迭代版：先两两合并长度为 1 的段，再合并长度 2、4、8……直到覆盖整个数组。',
      hint: '外层变量 sz = 1,2,4,8...；内层 for (lo=0; lo+sz<n; lo+=2*sz) 合并 [lo, lo+sz-1] 与 [lo+sz, min(lo+2sz-1, n-1)]。',
      solution:
        'function mergeSortBU(a) {\n' +
        '  const n = a.length, aux = a.slice();\n' +
        '  for (let sz = 1; sz < n; sz *= 2) {\n' +
        '    for (let lo = 0; lo < n - sz; lo += 2 * sz) {\n' +
        '      const mid = lo + sz - 1;\n' +
        '      const hi = Math.min(lo + 2 * sz - 1, n - 1);\n' +
        '      // 合并 [lo..mid] 与 [mid+1..hi]\n' +
        '      for (let k = lo; k <= hi; k++) aux[k] = a[k];\n' +
        '      let i = lo, j = mid + 1;\n' +
        '      for (let k = lo; k <= hi; k++) {\n' +
        '        if (i > mid) a[k] = aux[j++];\n' +
        '        else if (j > hi) a[k] = aux[i++];\n' +
        '        else a[k] = (aux[j] < aux[i]) ? aux[j++] : aux[i++];\n' +
        '      }\n' +
        '    }\n' +
        '  }\n' +
        '  return a;   // 时间 O(n log n)，无递归栈\n' +
        '}'
    },
    {
      title: '动手题 2 · 小数组改用插入排序',
      desc: '真实库函数会在递归到小区间（如长度 < 15）时改用插入排序。请实现一个带该优化的归并排序，并解释为什么这样更快。',
      hint: '递归到很小的数组时，继续递归拆分的「函数调用开销」比插入排序本身的 n² 还大。',
      solution:
        'function ms(a, lo, hi) {\n' +
        '  if (hi - lo < 15) {                 // 小区间直接插入排序\n' +
        '    for (let i = lo + 1; i <= hi; i++) {\n' +
        '      const key = a[i]; let j = i - 1;\n' +
        '      while (j >= lo && a[j] > key) { a[j+1] = a[j]; j--; }\n' +
        '      a[j+1] = key;\n' +
        '    }\n' +
        '    return;\n' +
        '  }\n' +
        '  const mid = lo + ((hi - lo) >> 1);\n' +
        '  ms(a, lo, mid); ms(a, mid + 1, hi);\n' +
        '  merge(a, lo, mid, hi);\n' +
        '}\n' +
        '// 量级不变，但常数明显下降：少了很多次函数调用与递归栈操作'
    }
  ]
});

/* ------------------------------------------------------------------ */
L({
  id: 'quick-sort',
  level: 'intermediate',
  title: '快速排序：选个「基准」把数组一分为二',
  subtitle: '工程界最常用的排序：原地、常数小、缓存友好——前提是别让它退化。',
  prereq: ['recursion-basic', 'merge-sort'],
  minutes: 35,
  tags: ['排序', '分治', '原地', '分区'],

  analogyTitle: '体育课排队：挑个「基准同学」，高的站右边、矮的站左边',
  analogy: [
    '老师随便点一个同学当「基准」。所有比他矮的站他左边，比他高的站他右边——<strong>一趟下来，这个同学的位置就彻底定死了</strong>（他左边都比他矮，右边都比他高），左右两边各自再重复这个过程。',
    '注意和归并的区别：<strong>归并的力气花在「合」，快排的力气花在「分」</strong>。快排连「合并」这步都省了，因为分完之后左右两边本身就各就各位了。所以它不需要额外数组——这是它快的第一个原因。'
  ],

  idea: [
    '<strong>分区（partition）</strong>是灵魂：选一个 pivot，把 ≤ pivot 的放左边、&gt; pivot 的放右边，并返回 pivot 的最终位置。',
    '分区完成后 pivot 位置不再变动，左右两个子区间<strong>互不干涉</strong>，可以独立递归 → 原地排序。',
    '<strong>平均 O(n log n)</strong>：每次大致对半分，深度 log n，每层 O(n)。',
    '<strong>最坏 O(n²)</strong>：每次选到的 pivot 恰好是当前最大/最小值（比如已有序数组总选最后一个），区间只缩小 1。',
    '<strong>不稳定的</strong>：远距离交换会打乱相等元素的相对顺序。'
  ],
  when: [
    '通用排序首选（各类语言的默认 sort 大多是快排变体 / introsort）。',
    '需要原地、且内存紧张时；比归并省一个 O(n) 数组。',
    '数据几乎有序时<strong>务必随机选 pivot 或用三数取中</strong>，否则会退化。',
    '需要稳定排序时改用归并 / Timsort。'
  ],

  steps: [
    { t: '选 pivot（这里取区间最后一个元素；工程上应随机化）', why: 'pivot 决定了分区质量。固定取首/尾在有序数据上必然退化成 O(n²)，随机化能把「坏运气」的概率压到极低。' },
    { t: '设 i = lo-1 表示「≤ pivot 区间的右边界」', why: '维护一个不变式：[lo..i] 都 ≤ pivot，(i+1..j-1] 都 > pivot。有了它，扫描结束时把 pivot 放到 i+1 就对了。' },
    { t: 'j 从 lo 扫到 hi-1，若 a[j] ≤ pivot 则 i++ 并交换 a[i],a[j]', why: '把小的元素「交换到左边区间」，一次交换同时完成「扩界」和「归位」，是原地分区的关键技巧。' },
    { t: '扫描结束，交换 a[i+1] 与 a[hi]（pivot 归位）', why: '此时 i+1 正好是 ≤ 区间的下一个位置，pivot 放这里，左边全 ≤ 它、右边全 > 它，它的最终位置确定。' },
    { t: '递归处理 [lo, i] 与 [i+2, hi]', why: 'pivot 已在最终位置，不参与后续递归。两个子区间独立，这就是为什么不需要「合并」。' }
  ],

  pseudo: [
    'function quickSort(arr, lo, hi):',
    '    if lo >= hi: return',
    '    p = partition(arr, lo, hi)     // 分区，得到 pivot 最终位置',
    '    quickSort(arr, lo, p - 1)',
    '    quickSort(arr, p + 1, hi)',
    '',
    'function partition(arr, lo, hi):',
    '    pivot = arr[hi]',
    '    i = lo - 1                     // ≤ pivot 区间的右边界',
    '    for j = lo .. hi-1:',
    '        if arr[j] <= pivot:',
    '            i = i + 1',
    '            swap(arr[i], arr[j])   // 小的换到左边',
    '    swap(arr[i+1], arr[hi])        // pivot 归位',
    '    return i + 1'
  ],

  anim: {
    fields: [{ key: 'arr', kind: 'array', def: '[7,2,9,4,6,3,8,5]' }],
    legend: [['pivot', '基准值 pivot'], ['cmp', '当前扫描 j'], ['target', '≤pivot 区间边界 i'], ['swap', '发生交换'], ['done', '已归位'], ['dim', '本趟不处理']],
    gen: function (v) {
      var a = v.arr.slice(), n = a.length, steps = [], fixed = {};
      var hl = {};
      function push(line, log, vars) {
        steps.push({
          line: line,
          rows: [{
            items: a.map(function (x, i) {
              var s = 'idle';
              if (fixed[i]) s = 'done';
              if (hl.lo != null && (i < hl.lo || i > hl.hi)) s = 'dim';
              if (hl.pivot === i) s = 'pivot';
              if (hl.i === i) s = 'target';
              if (hl.j === i) s = 'cmp';
              if (hl.sw1 === i || hl.sw2 === i) s = 'swap';
              return { v: x, s: s };
            }),
            ptrs: (hl.j != null ? [{ name: 'j', idx: hl.j, color: '#f59e0b' }] : [])
              .concat(hl.i != null && hl.i >= hl.lo ? [{ name: 'i', idx: hl.i, color: '#3b82f6' }] : [])
          }],
          log: log,
          vars: vars || {},
          caption: hl.pivot != null ? 'pivot = ' + a[hl.pivot] + '（紫），蓝=i 边界，黄=j 扫描位' : '快排过程'
        });
      }
      push(0, '初始数组：' + a.join(', '));

      function qs(lo, hi) {
        if (lo >= hi) { if (lo === hi) fixed[lo] = true; return; }
        hl = { lo: lo, hi: hi, pivot: hi };
        push(7, '区间 [' + lo + ',' + hi + ']：选 pivot = a[' + hi + '] = ' + a[hi]);
        var pivot = a[hi], i = lo - 1;
        hl = { lo: lo, hi: hi, pivot: hi };
        push(8, 'i 初始化为 ' + i + '（≤pivot 区间为空）');
        for (var j = lo; j < hi; j++) {
          hl = { lo: lo, hi: hi, pivot: hi, j: j, i: i };
          push(10, '扫描 j=' + j + '：a[' + j + ']=' + a[j] + (a[j] <= pivot ? ' ≤ ' : ' > ') + pivot);
          if (a[j] <= pivot) {
            i++;
            hl = { lo: lo, hi: hi, pivot: hi, j: j, i: i, sw1: i, sw2: j };
            push(12, '≤ pivot → i 前进到 ' + i + '，交换 a[' + i + '] 与 a[' + j + ']');
            var t = a[i]; a[i] = a[j]; a[j] = t;
            hl = { lo: lo, hi: hi, pivot: hi, j: j, i: i };
            push(12, '交换后：' + a.join(', '));
          }
        }
        var t2 = a[i + 1]; a[i + 1] = a[hi]; a[hi] = t2;
        fixed[i + 1] = true;
        hl = { lo: lo, hi: hi, pivot: i + 1 };
        push(13, 'pivot ' + pivot + ' 归位到 ' + (i + 1) + '，它的最终位置确定：' + a.join(', '));
        qs(lo, i);
        qs(i + 2, hi);
      }
      qs(0, n - 1);
      hl = {};
      push(13, '排序完成：' + a.join(', '));
      return steps;
    }
  },

  run: {
    inputs: [
      { key: 'arr', label: '待排序数组', def: '[7,2,9,4,6,3,8,5]' },
      { key: 'mode', label: 'pivot 策略：random / last', def: 'random' }
    ],
    code:
      'const a = input.arr.slice();\n' +
      'const mode = String(input.mode || "random");\n' +
      'let cmp = 0, swap = 0, maxDepth = 0;\n' +
      'function partition(lo, hi) {\n' +
      '  let pi = hi;\n' +
      '  if (mode === "random") { pi = lo + Math.floor(Math.random() * (hi - lo + 1)); [a[pi], a[hi]] = [a[hi], a[pi]]; }\n' +
      '  const pivot = a[hi];\n' +
      '  let i = lo - 1;\n' +
      '  for (let j = lo; j < hi; j++) {\n' +
      '    cmp++;\n' +
      '    if (a[j] <= pivot) { i++; if (i !== j) { [a[i], a[j]] = [a[j], a[i]]; swap++; } }\n' +
      '  }\n' +
      '  [a[i + 1], a[hi]] = [a[hi], a[i + 1]]; swap++;\n' +
      '  return i + 1;\n' +
      '}\n' +
      'function qs(lo, hi, d) {\n' +
      '  maxDepth = Math.max(maxDepth, d);\n' +
      '  if (lo >= hi) return;\n' +
      '  const p = partition(lo, hi);\n' +
      '  log("pivot=" + a[p] + " 落在 " + p + " →", a.join(","));\n' +
      '  qs(lo, p - 1, d + 1); qs(p + 1, hi, d + 1);\n' +
      '}\n' +
      'qs(0, a.length - 1, 1);\n' +
      'return { 结果: a, 策略: mode, 比较次数: cmp, 交换次数: swap, 递归深度: maxDepth,\n' +
      '         备注: "递归深度远大于 log2(n)≈" + Math.ceil(Math.log2(a.length + 1)) + " 就说明分区很不均衡" };'
  },

  complexity: {
    best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)', space: 'O(log n) 平均 / O(n) 最坏栈', stable: '不稳定',
    detail: [
      '<strong>最好 / 平均</strong>：每次分区大致对半 → 递归树深 log₂n，每层合计 O(n) → O(n log n)。即使每次分成 1:9，深度也只是 log₁.₁n ≈ 常数倍 log n，量级仍是 O(n log n)。',
      '<strong>最坏</strong>：每次 pivot 都是极值，区间只缩小 1 → 递归深度 n，总代价 n+(n-1)+…+1 = O(n²)。典型触发场景：数组已有序 + 固定取末尾作 pivot。<strong>解法：随机选 pivot、三数取中、或递归到小区间切换插入排序；工程上还有 introsort（深度超限时自动切成堆排）。</strong>',
      '<strong>空间</strong>：原地分区，额外空间只有递归栈。平均 O(log n)，最坏 O(n)。可以用「先递归较小区间 + 循环处理较大区间」把栈压到 O(log n) 保证。'
    ],
    table: [
      ['情况', '分区结果', '递归深度', '时间'],
      ['理想', '每次对半', 'log n', 'O(n log n)'],
      ['一般', '1:9 之类的固定比例', '仍为 Θ(log n)', 'O(n log n)'],
      ['最坏', '每次只剩 1 个', 'n', 'O(n²)']
    ]
  },

  quiz: [
    {
      q: '快排「分区」结束后，能确定的是什么？',
      options: ['整个数组有序', 'pivot 的最终位置', '最小值在最左边', '左右两边长度相等'],
      answer: 1,
      hint: '分区保证了 pivot 左边都 ≤ 它、右边都 > 它——那它在最终的有序数组里应该排在哪？',
      why: 'pivot 已归位，后续递归不再碰它。'
    },
    {
      q: '已排序数组 [1,2,3,4,5] 上，若固定取「最后一个元素」作 pivot，快排复杂度是？',
      options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'],
      answer: 2,
      hint: 'pivot 是最大值 5，分区后左边 4 个、右边 0 个——区间每次只缩小多少？',
      why: '每次只缩小 1，深度 n → O(n²)。'
    },
    {
      q: '下面哪种做法<strong>不能</strong>改善快排的退化问题？',
      options: ['随机选择 pivot', '三数取中', '递归到小区间改用插入排序', '把数组先整体反转一次'],
      answer: 3,
      hint: '前三个都是在「让分区更均衡 / 减少递归开销」。反转一下，固定取末尾的情况变成取最小值——退化消失了吗？',
      why: '反转后 pivot 变成最小值，一样退化。'
    },
    {
      q: '关于快排的空间复杂度，正确的是？',
      options: ['一定是 O(1)', '平均 O(log n) 递归栈，最坏 O(n)', '一定 O(n) 辅助数组', '和归并一样 O(n)'],
      answer: 1,
      hint: '快排是原地分区的，没有辅助数组；但递归调用本身要占栈，栈深 = 递归树深度。',
      why: '空间主要来自递归栈。'
    }
  ],

  practice: [
    {
      title: '动手题 1 · 随机化 + 三数取中',
      desc: '改造 partition：随机选一个下标与 hi 交换后再取 pivot；再实现「三数取中」（取 lo、mid、hi 三个位置的中位数作 pivot）。在 [1,2,3,...,200] 上对比递归深度。',
      hint: '三数取中：比较 a[lo]、a[mid]、a[hi]，把中位数换到 hi 位置，然后照常分区。',
      solution:
        'function median3(lo, hi) {\n' +
        '  const mid = lo + ((hi - lo) >> 1);\n' +
        '  if (a[mid] < a[lo]) [a[lo], a[mid]] = [a[mid], a[lo]];\n' +
        '  if (a[hi] < a[lo]) [a[lo], a[hi]] = [a[hi], a[lo]];\n' +
        '  if (a[hi] < a[mid]) [a[mid], a[hi]] = [a[hi], a[mid]];\n' +
        '  [a[mid], a[hi]] = [a[hi], a[mid]];   // 中位数放到 hi\n' +
        '  return a[hi];\n' +
        '}\n' +
        '// 已有序数组上：普通版深度 200，三数取中版深度 ≈ log2(200) ≈ 8'
    },
    {
      title: '动手题 2 · 快速选择（快排思想的变形）',
      desc: '不排序，只求数组里第 k 小的元素。提示：分区后 pivot 位置 p 已知，若 p == k-1 就找到了，否则只递归其中一边。',
      hint: '快排要递归两边，快速选择只递归一边——这正是把平均复杂度从 O(n log n) 降到 O(n) 的原因。',
      solution:
        'function quickSelect(a, k) {         // k 从 0 开始\n' +
        '  let lo = 0, hi = a.length - 1;\n' +
        '  while (lo <= hi) {\n' +
        '    const p = partition(lo, hi);\n' +
        '    if (p === k) return a[p];\n' +
        '    else if (p < k) lo = p + 1;\n' +
        '    else hi = p - 1;\n' +
        '  }\n' +
        '}\n' +
        '// 平均 O(n)：n + n/2 + n/4 + ... = 2n；最坏仍是 O(n²)'
    }
  ]
});

/* ------------------------------------------------------------------ */
L({
  id: 'linked-list',
  level: 'intermediate',
  title: '链表：指针一改，结构就变',
  subtitle: '数组是「连号抽屉」，链表是「藏宝图」；理解指针改顺序，就能拿下反转、环检测等经典题。',
  prereq: ['recursion-basic'],
  minutes: 30,
  tags: ['链表', '指针', '反转'],

  analogyTitle: '寻宝游戏 vs 连号信箱',
  analogy: [
    '数组像一排<strong>连号的信箱</strong>：知道编号就能一步走到（随机访问 O(1)）；但你要在中间插一个新信箱，后面全部得挪（插入 O(n)）。',
    '链表像<strong>寻宝游戏</strong>：每个地点（节点）只写着「下一个地点在哪」。想找第 5 个地点，你必须从 1 走到 4（访问 O(n)）；但想在 2 和 3 之间插入一个新地点，只要改两张纸条（插入 O(1)）。<strong>「改指针」是链表一切操作的核心。</strong>'
  ],

  idea: [
    '<strong>节点 = 值 + next 指针</strong>。单向链表只知道「下一个」，双向链表还知道「上一个」。',
    '<strong>头指针 head 是唯一的入口</strong>：丢了它就丢了整条链。所以插入/删除常配一个「虚拟头结点 dummy」统一处理。',
    '<strong>反转三行代码</strong>：next = cur.next → cur.next = prev → prev = cur; cur = next。顺序不能错，先存 next 否则链断了。',
    '<strong>快慢指针</strong>是链表的独门武器：slow 走 1 步、fast 走 2 步，能判环、找中点、找倒数第 k 个。'
  ],
  when: [
    '频繁在头部 / 中间插入删除、不常按下标查 → 链表（LRU 缓存、任务队列）。',
    '数组内存要连续，链表可以零散分布（但每个节点多一个指针的内存开销 + 缓存不友好）。',
    '需要频繁随机访问 → 千万别用链表。'
  ],

  steps: [
    { t: '定义 prev = null，cur = head', why: '反转后的链表尾部要指向 null，prev 从 null 开始正好；cur 是当前要处理的节点。' },
    { t: '每轮先 next = cur.next 存住后继', why: '下一步要把 cur.next 改成 prev，如果不先存，原来的后继就永远找不回来了——这是新手最常犯的错。' },
    { t: 'cur.next = prev（真正的反转动作）', why: '把箭头掉个头。此时 cur 与原来的后继断开、与前面的 prev 连上。' },
    { t: 'prev = cur; cur = next（整体前移）', why: '两个指针各往前挪一格，为下一轮做准备。注意顺序：先移 prev 再移 cur，否则 cur 的值已经被覆盖。' },
    { t: 'cur == null 时结束，返回 prev', why: 'cur 走到链尾之外，而 prev 正好停在原链表的最后一个节点上——它就是新链表的头。' }
  ],

  pseudo: [
    'prev = null; cur = head',
    'while cur != null:',
    '    next = cur.next        // ① 先存住后继（关键！）',
    '    cur.next = prev        // ② 掉转箭头',
    '    prev = cur             // ③ prev 前移',
    '    cur = next             // ④ cur 前移',
    'return prev                // cur 走完时 prev 就是新头'
  ],

  anim: {
    fields: [{ key: 'arr', kind: 'array', def: '[1,2,3,4,5]' }],
    legend: [['active', 'cur 当前节点'], ['done', 'prev 及已反转部分'], ['cmp', 'next 暂存的节点'], ['dim', '未处理']],
    gen: function (v) {
      var vals = v.arr.slice(0, 8), n = vals.length;
      var steps = [];
      var link = vals.map(function (_, i) { return i + 1 < n ? i + 1 : -1; });
      var mark = {}, hi = null;
      function push(line, log, vars) {
        var nodes = vals.map(function (x, i) {
          return {
            id: 'n' + i, label: String(x), sub: '第' + (i + 1) + '个', x: 70 + i * 118, y: 70,
            s: mark[i] || 'idle', shape: 'rect', w: 62, h: 46,
            badge: (i === mark.p) ? 'P' : (i === mark.c ? 'C' : (i === mark.x ? 'N' : null))
          };
        });
        nodes.push({ id: 'null', label: 'null', x: 70 + n * 118, y: 70, s: 'dead', shape: 'rect', w: 46, h: 40 });
        var edges = [];
        link.forEach(function (to, i) {
          if (to < 0) return;
          edges.push({ from: 'n' + i, to: 'n' + to, s: hi && hi.from === i ? 'active' : (mark[i] === 'done' ? 'done' : 'idle') });
        });
        steps.push({
          line: line,
          scenes: [{ kind: 'nodes', nodes: nodes, edges: edges, caption: 'P=prev  C=cur  N=next（每轮只改一根箭头）' }],
          log: log,
          vars: vars || {},
          stack: null
        });
      }
      var prevI = -1, curI = 0;
      mark = { c: 0, p: null, x: null };
      push(0, '初始化：prev = null，cur = 第 1 个节点');
      while (curI >= 0) {
        var nextI = link[curI];
        mark = { c: curI, p: prevI, x: nextI };
        push(2, '① 暂存 next = ' + (nextI >= 0 ? '第' + (nextI + 1) + '个节点' : 'null'));
        link[curI] = prevI;
        hi = { from: curI };
        push(3, '② 把 cur 的箭头改指 prev（' + (prevI >= 0 ? '第' + (prevI + 1) + '个' : 'null') + '）');
        hi = null;
        prevI = curI; curI = nextI;
        var m2 = {};
        for (var q = 0; q <= prevI; q++) m2[q] = 'done';
        m2.c = curI; m2.p = prevI; m2.x = null;
        mark = m2;
        push(5, '③④ prev 前进到 ' + (prevI + 1) + '，cur 前进到 ' + (curI >= 0 ? '第' + (curI + 1) + '个' : 'null（结束）'));
      }
      var mf = {}; for (var r = 0; r < n; r++) mf[r] = 'done';
      mark = mf;
      push(6, '反转完成！新链表的头是 prev = 第 ' + (prevI + 1) + ' 个节点');
      return steps;
    }
  },

  run: {
    inputs: [{ key: 'arr', label: '链表元素（按顺序）', def: '[1,2,3,4,5]' }],
    code:
      '// 先按数组构建链表，再原地反转\n' +
      'function build(arr) { let head = null; for (const v of arr.slice().reverse()) head = { val: v, next: head }; return head; }\n' +
      'function toArr(head) { const out = []; while (head) { out.push(head.val); head = head.next; } return out; }\n' +
      'let head = build(input.arr);\n' +
      'log("原链表：", toArr(head).join(" -> "));\n' +
      'let prev = null, cur = head, step = 0;\n' +
      'while (cur) {\n' +
      '  step++;\n' +
      '  const next = cur.next;   // ① 先存住后继\n' +
      '  cur.next = prev;         // ② 掉转箭头\n' +
      '  log("  第" + step + "步  反转节点 " + cur.val + "（原后继：" + (next ? next.val : "null") + "）");\n' +
      '  prev = cur; cur = next;  // ③④ 前移\n' +
      '}\n' +
      'log("新链表：", toArr(prev).join(" -> "));\n' +
      'return { 反转结果: toArr(prev), 步数: step, 备注: "只改指针，未新建节点 → 空间 O(1)" };'
  },

  complexity: {
    best: 'O(n)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)', stable: '—',
    detail: [
      '反转链表：每个节点访问一次、改一次指针 → 时间 O(n)，只用了 3 个指针变量 → 空间 O(1)。递归版时间也是 O(n)，但栈空间 O(n)。',
      '常见操作对比（单向链表，已知节点位置）：头部插入 O(1)、已知前驱的删除 O(1)、按下标访问 O(n)、查找 O(n)。<strong>「删除」之所以要找前驱，是单向链表无法回头——常用技巧是「把后继的值拷贝过来再删后继」。</strong>'
    ],
    table: [
      ['操作', '数组', '单向链表'],
      ['按下标访问', 'O(1)', 'O(n)'],
      ['头部插入', 'O(n)', 'O(1)'],
      ['已知节点后插入', 'O(n)', 'O(1)'],
      ['查找值', 'O(n)', 'O(n)'],
      ['反转', 'O(n) 空间 O(1)', 'O(n) 空间 O(1)']
    ]
  },

  quiz: [
    {
      q: '反转链表时为什么要先 next = cur.next？',
      options: ['为了计数', '因为下一步要修改 cur.next，不先存就找不到后继了', '为了保持有序', '没有实际作用'],
      answer: 1,
      hint: 'cur.next = prev 执行之后，原本的「下一个节点」还能通过 cur 找到吗？',
      why: '改指针会断链，必须先备份。'
    },
    {
      q: '循环结束时应该返回谁作为新头？',
      options: ['cur', 'prev', 'head', 'next'],
      answer: 1,
      hint: 'cur 最终会走到 null。最后一个被处理的节点是谁？它此刻被哪个指针指着？',
      why: 'prev 停在原链表尾节点，即新头。'
    },
    {
      q: '单向链表中，要删除「给定节点 p」（不给头结点，也不给前驱），可行做法是？',
      options: ['不可能', '把 p.next 的值拷到 p，然后删除 p.next', '把 p 置为 null', '从 p 往后全部重连'],
      answer: 1,
      hint: '删不掉自己，但可以「变成」下一个节点——把下一个节点的值复制过来，再跳过它。注意尾节点不适用。',
      why: '值拷贝 + 跳过后继，等效于删除。'
    },
    {
      q: '快慢指针判断链表是否有环，依据是？',
      options: ['快指针会先到尾', '若有环，快指针一定会追上慢指针', '两指针走过的长度相同', '环的长度等于指针间距'],
      answer: 1,
      hint: '把环想象成操场跑道：跑得快的和跑得慢的一直跑下去，会发生什么？',
      why: '相对速度 1，必在环内相遇。'
    }
  ],

  practice: [
    {
      title: '动手题 1 · 递归版反转',
      desc: '用递归实现链表反转：先反转 head.next 开头的子链，再把 head 接到新链的尾部。写出代码并分析空间复杂度。',
      hint: '递归函数的返回值应该是「反转后的新头」。base case：head 为空或只有一个节点时直接返回 head。',
      solution:
        'function reverse(head) {\n' +
        '  if (!head || !head.next) return head;      // 基线\n' +
        '  const newHead = reverse(head.next);        // 先反转后面\n' +
        '  head.next.next = head;                     // 让后继指回自己\n' +
        '  head.next = null;                          // 断掉原指向（否则成环）\n' +
        '  return newHead;\n' +
        '}\n' +
        '// 时间 O(n)，空间 O(n)（递归栈）；n 很大时会爆栈'
    },
    {
      title: '动手题 2 · 合并两个有序链表',
      desc: '输入两个升序链表，合并成一个升序链表。要求复用原有节点（不新建），空间 O(1)。',
      hint: '用一个 dummy 虚拟头结点，每次把较小的那个节点「摘下来」挂到结果链尾，最后把没完的那段直接接上。',
      solution:
        'function merge(l1, l2) {\n' +
        '  const dummy = { val: 0, next: null };\n' +
        '  let tail = dummy;\n' +
        '  while (l1 && l2) {\n' +
        '    if (l1.val <= l2.val) { tail.next = l1; l1 = l1.next; }\n' +
        '    else { tail.next = l2; l2 = l2.next; }\n' +
        '    tail = tail.next;\n' +
        '  }\n' +
        '  tail.next = l1 || l2;            // 接上剩余\n' +
        '  return dummy.next;\n' +
        '}\n' +
        '// 时间 O(n+m)，空间 O(1)'
    }
  ]
});

/* ------------------------------------------------------------------ */
L({
  id: 'stack-queue',
  level: 'intermediate',
  title: '栈与队列：单调栈这一把「瑞士军刀」',
  subtitle: '栈是「后到的先走」，队列是「先到的先走」；单调栈能把很多 O(n²) 的暴力题降到 O(n)。',
  prereq: ['linked-list'],
  minutes: 25,
  tags: ['栈', '队列', '单调栈'],

  analogyTitle: '洗碗池（栈）与排队买票（队列）',
  analogy: [
    '吃完饭把盘子一个个摞进池子，洗的时候只能从<strong>最上面</strong>拿——这就是栈（LIFO，后进先出）。浏览器的「后退」按钮、函数调用栈，全是这个模型。',
    '买票排队则是<strong>先来的先买</strong>（FIFO，先进先出），这就是队列。消息队列、BFS 的待访问列表、打印任务，都靠它。',
    '而<strong>单调栈</strong>是「摞盘子时保持一个规矩」：只允许比顶部小的盘子放上去，一旦来了个大盘子，就把压在它上面的小盘子全拿走。这个「边摞边清」的动作，正是它能一趟扫描解决问题的原因。'
  ],

  idea: [
    '<strong>栈</strong>：push / pop / top，都是 O(1)；用来做「最近的未完成任务」的容器（括号匹配、DFS、表达式求值）。',
    '<strong>队列</strong>：enqueue / dequeue，O(1)；用来做「按顺序待处理」的容器（BFS、任务调度）。',
    '<strong>单调栈</strong>：栈内元素保持单调（递增或递减）。每加入一个新元素，就把所有「破坏单调性」的旧元素弹出——<strong>每个元素最多进栈一次、出栈一次，总代价 O(n)</strong>。',
    '弹栈的那一刻，就是「找到了答案」的那一刻：对「下一个更大元素」问题，新来的元素正是被弹出元素的答案。'
  ],
  when: [
    '「下一个更大 / 更小元素」「柱状图最大矩形」「接雨水」→ 单调栈。',
    '括号匹配、表达式求值、函数调用 → 栈。',
    '层序遍历、广度优先搜索、缓冲队列 → 队列。',
    '需要「取最大 / 最小」的队列 → 单调队列（滑动窗口最值）。'
  ],

  steps: [
    { t: '从左到右扫描数组，栈里存的是「还没找到答案的元素下标」', why: '存下标而不是值，是为了后面能直接算出距离 / 定位，同时也方便比较值。' },
    { t: '新元素 x 来了，while 栈顶元素 < x：弹出它，并记录「它的下一个更大元素就是 x」', why: 'x 是这些元素右边第一个比它们大的——因为中间不可能有更大的（否则早就被弹出了）。这就是单调栈正确性的全部依据。' },
    { t: '把 x 入栈', why: 'x 自己还没找到答案，等着右边出现更大的。' },
    { t: '扫描结束，栈里剩下的元素没有更大元素，答案为 -1', why: '它们右侧确实没有比自己更大的，否则早就被弹掉了。' },
    { t: '复杂度分析：每个下标入栈一次、出栈一次', why: '总操作数 ≤ 2n，所以是 O(n)，而不是看起来那样的 O(n²)（内层的 while 在整个循环里总共才跑 n 次）。' }
  ],

  pseudo: [
    'stack = []                          // 存下标，栈内对应值单调递减',
    'ans = [-1] * n',
    'for i = 0 .. n-1:',
    '    while stack 非空 and arr[stack.top] < arr[i]:',
    '        ans[stack.pop()] = i        // i 就是它的「下一个更大元素」',
    '    stack.push(i)',
    'return ans                          // 剩余为 -1'
  ],

  anim: {
    fields: [{ key: 'arr', kind: 'array', def: '[2,1,5,6,2,3]' }],
    legend: [['active', '当前扫描 i'], ['key', '栈内元素'], ['swap', '刚被弹出（已找到答案）'], ['done', '已确定答案']],
    gen: function (v) {
      var a = v.arr.slice(), n = a.length, steps = [];
      var ans = new Array(n).fill(-1), st = [], hl = {};
      function push(line, log) {
        steps.push({
          line: line,
          rows: [{
            items: a.map(function (x, i) {
              var s = 'idle';
              if (st.indexOf(i) >= 0) s = 'key';
              if (hl.i === i) s = 'active';
              if (hl.pop === i) s = 'swap';
              if (ans[i] !== -1) s = 'done';
              return { v: x, s: s };
            }),
            ptrs: hl.i != null ? [{ name: 'i', idx: hl.i, color: '#f97316' }] : []
          }],
          log: log,
          vars: { 栈内下标: JSON.stringify(st), 已确定答案: JSON.stringify(ans) },
          stack: st.map(function (k) { return 'a[' + k + ']=' + a[k]; }),
          caption: '紫=待定（在栈里），红=刚弹出（找到了更大元素），绿=已完成'
        });
      }
      push(2, '初始：栈空，答案全为 -1');
      for (var i = 0; i < n; i++) {
        hl = { i: i };
        push(4, '扫描 i=' + i + '（值 ' + a[i] + '），检查栈顶是否需要弹出');
        while (st.length && a[st[st.length - 1]] < a[i]) {
          var t = st.pop();
          ans[t] = i;
          hl = { i: i, pop: t };
          push(5, 'a[' + t + ']=' + a[t] + ' < ' + a[i] + ' → 弹出，它的下一个更大元素是 a[' + i + ']=' + a[i]);
        }
        st.push(i);
        hl = { i: i };
        push(6, '把 ' + i + ' 入栈，等待右边出现更大的元素');
      }
      hl = {};
      push(7, '扫描结束，栈内剩余 ' + JSON.stringify(st) + ' 右侧没有更大元素，答案保持 -1。结果：' + JSON.stringify(ans));
      return steps;
    }
  },

  run: {
    inputs: [{ key: 'arr', label: '数组', def: '[2,1,5,6,2,3]' }],
    code:
      'const a = input.arr, n = a.length;\n' +
      'const ans = new Array(n).fill(-1);\n' +
      'const st = [];                       // 单调栈：存下标，对应值递减\n' +
      'let popCount = 0;\n' +
      'for (let i = 0; i < n; i++) {\n' +
      '  while (st.length && a[st[st.length - 1]] < a[i]) {\n' +
      '    const t = st.pop(); popCount++;\n' +
      '    ans[t] = a[i];\n' +
      '    log("  a[" + t + "]=" + a[t] + " 找到下一个更大元素 " + a[i]);\n' +
      '  }\n' +
      '  st.push(i);\n' +
      '  log("扫描 i=" + i + "（" + a[i] + "），栈内下标：[" + st.join(",") + "]");\n' +
      '}\n' +
      'return { 数组: a, 下一个更大元素: ans, 弹栈总次数: popCount,\n' +
      '         说明: "弹栈总次数 ≤ n，所以整体 O(n) 而非 O(n²)" };'
  },

  complexity: {
    best: 'O(n)', avg: 'O(n)', worst: 'O(n)', space: 'O(n)', stable: '—',
    detail: [
      '单调栈看起来是「外层 for + 内层 while」，容易误判成 O(n²)。但<strong>每个元素最多入栈一次、出栈一次</strong>，内层 while 的总执行次数 ≤ n，因此<strong>均摊 O(n)</strong>。这就是「摊还分析」的经典例子。',
      '空间 O(n)（栈最多装 n 个下标）。栈 / 队列本身的基础操作（push/pop/peek）都是 O(1)。'
    ],
    table: [
      ['结构', '核心操作', '顺序', '典型应用'],
      ['栈', 'push/pop', 'LIFO 后进先出', '括号匹配、DFS、函数调用、撤销'],
      ['队列', 'enqueue/dequeue', 'FIFO 先进先出', 'BFS、任务调度、缓冲'],
      ['单调栈', 'push + 条件 pop', '值单调', '下一个更大元素、最大矩形、接雨水']
    ]
  },

  quiz: [
    {
      q: '单调栈（递减）处理「下一个更大元素」时，元素被弹出的瞬间意味着什么？',
      options: ['它比所有元素都小', '新来的元素就是它右边第一个更大的元素', '它出错了', '数组结束了'],
      answer: 1,
      hint: '为什么能确定是「第一个」？如果它右边还有更近的更大元素，那个元素会先被处理到——那时候会发生什么？',
      why: '更近的更大元素会先触发弹出。'
    },
    {
      q: '单调栈的时间复杂度为什么是 O(n) 而不是 O(n²)？',
      options: ['因为内层循环只跑一次', '每个元素最多入栈一次、出栈一次，弹栈总次数 ≤ n', '因为用了数组', '因为数据有序'],
      answer: 1,
      hint: '不要看「循环套循环」就判 n²。统计一下整个过程中 pop 一共被调用了多少次。',
      why: '摊还 O(1)/元素。'
    },
    {
      q: '想求「滑动窗口内的最大值」，应该用？',
      options: ['普通栈', '单调队列（双端队列）', '哈希表', '并查集'],
      answer: 1,
      hint: '窗口会从左往右滑动，队首要能过期（超出窗口就弹出）——所以需要在<strong>两端</strong>都能操作的结构。',
      why: '单调队列：队首维护最大值，队尾维护单调性。'
    },
    {
      q: '用栈判断括号串 "{[()]}" 是否合法，核心做法是？',
      options: ['数左右括号个数是否相等', '遇左括号入栈，遇右括号看栈顶是否匹配', '从右往左扫描', '用队列'],
      answer: 1,
      hint: '只数个数够吗？想想 "([)]" 这种交错的情况。',
      why: '必须检查「最近的未匹配左括号」是否配对 → 栈。'
    }
  ],

  practice: [
    {
      title: '动手题 1 · 每日温度',
      desc: '给定每天的温度，求「还要等几天才能遇到更暖的一天」，没有则记 0。用单调栈一趟解决。',
      hint: '和「下一个更大元素」完全一样，只是答案从「值」换成「下标差」。栈里存下标就很好算。',
      solution:
        'function dailyTemperatures(t) {\n' +
        '  const n = t.length, ans = new Array(n).fill(0), st = [];\n' +
        '  for (let i = 0; i < n; i++) {\n' +
        '    while (st.length && t[st[st.length - 1]] < t[i]) {\n' +
        '      const j = st.pop();\n' +
        '      ans[j] = i - j;\n' +
        '    }\n' +
        '    st.push(i);\n' +
        '  }\n' +
        '  return ans;\n' +
        '}\n' +
        '// [73,74,75,71,69,72,76,73] → [1,1,4,2,1,1,0,0]'
    },
    {
      title: '动手题 2 · 用两个栈实现队列',
      desc: '只用一个「入栈」和一个「出栈」实现队列的 enqueue / dequeue，要求均摊 O(1)。',
      hint: '入队就压入 inStack；出队时若 outStack 为空，就把 inStack 全部倒过来倒进 outStack——倒一次之后顺序就正过来了。',
      solution:
        'class MyQueue {\n' +
        '  constructor() { this.in = []; this.out = []; }\n' +
        '  push(x) { this.in.push(x); }\n' +
        '  pop() {\n' +
        '    if (!this.out.length) while (this.in.length) this.out.push(this.in.pop());\n' +
        '    return this.out.pop();\n' +
        '  }\n' +
        '}\n' +
        '// 每个元素最多被「倒」一次 → 均摊 O(1)'
    }
  ]
});

/* ------------------------------------------------------------------ */
L({
  id: 'hash-table',
  level: 'intermediate',
  title: '哈希表：用「编号」换 O(1) 查询',
  subtitle: '把「找东西」变成「算个编号直接去那个格子」——冲突怎么解决，决定了它的性能。',
  prereq: ['search'],
  minutes: 25,
  tags: ['哈希表', '散列', '冲突'],

  analogyTitle: '图书馆的「索书号」代替了满馆乱找',
  analogy: [
    '图书馆不会让你从第一排书架开始一本本翻。每本书有个<strong>索书号</strong>，你按号直接走到那一排——这就是哈希函数：把「书名（key）」直接算成「架子编号（下标）」。',
    '但如果两本书算出了同一个编号（<strong>哈希冲突</strong>），就得想办法：<strong>拉链法</strong>是在这个架子上挂一个清单，同号的书都列在上面；<strong>开放寻址</strong>是「这个位置有人了，那我看看下一个空位」。'
  ],

  idea: [
    '<strong>哈希函数</strong>把任意 key 映射成数组下标：index = hash(key) % capacity。好的哈希函数要让 key 尽量<strong>均匀散开</strong>。',
    '<strong>冲突不可避免</strong>（鸽笼原理：key 的空间远大于槽位数），必须有解决策略：拉链法（链表 / 红黑树）或开放寻址（线性探测 / 二次探测）。',
    '<strong>负载因子 α = 元素数 / 槽位数</strong>。α 越大冲突越多；一般 α &gt; 0.75 就<strong>扩容（rehash）</strong>到 2 倍并重排所有元素。',
    '<strong>均摊 O(1)</strong>：单次插入可能因扩容是 O(n)，但扩容频率是指数级递减的，摊还下来每次仍是 O(1)。'
  ],
  when: [
    '需要「按 key 快速查 / 插入 / 删除」→ 哈希表（JS 的 Map / Set、Python 的 dict）。',
    '需要有序遍历、范围查询 → 哈希表不行，改用树（TreeMap）。',
    'key 必须可哈希且不可变；自定义对象要正确实现 hash 与 equals。'
  ],

  steps: [
    { t: '计算 index = hash(key) % m', why: '取模把任意大的 hash 值压到 [0, m-1] 的合法下标范围。m 取质数或 2 的幂各有讲究（2 的幂可用位运算加速）。' },
    { t: '走到第 index 个槽位', why: '这就是「一步到位」的由来：不需要比较、不需要遍历，算出来就能直接访问——O(1)。' },
    { t: '若该槽已有元素（冲突），沿链表逐个比较 key', why: '哈希值相同不代表 key 相同（可能只是取模后同余），必须真正比较 key 才能确认是不是同一个。' },
    { t: '找到了就更新，没找到就挂到链尾', why: '「先查重再插入」保证同一个 key 不会存两份。' },
    { t: '插入后若 元素数/槽数 > 0.75，扩容到 2m 并全部重排', why: '降低负载因子能显著减少链长，把查询从 O(链长) 拉回 O(1)。重排虽然贵，但摊还后仍是 O(1)。' }
  ],

  pseudo: [
    'function put(key, value):',
    '    idx = hash(key) % capacity',
    '    for (k, v) in bucket[idx]:          // 沿链查找',
    '        if k == key: v = value; return  // 已存在 → 更新',
    '    bucket[idx].append((key, value))    // 不存在 → 挂链尾',
    '    size++',
    '    if size / capacity > 0.75:          // 扩容',
    '        resize(capacity * 2)            // 重新计算所有元素的位置'
  ],

  anim: {
    fields: [
      { key: 'keys', kind: 'array', def: '[12,25,37,44,58,63]' },
      { key: 'm', kind: 'text', label: '槽位数 m', def: '7' }
    ],
    legend: [['key', '哈希到的槽位'], ['cmp', '沿链比较中'], ['swap', '新插入的节点'], ['done', '已存好的节点'], ['idle', '空槽']],
    gen: function (v) {
      var keys = v.keys.slice(0, 8);
      var m = Math.max(2, parseInt(Number(v.m) || 7, 10));
      var buckets = []; for (var i = 0; i < m; i++) buckets.push([]);
      var steps = [];
      var hl = {};
      function push(line, log) {
        var nodes = [], edges = [];
        buckets.forEach(function (b, bi) {
          nodes.push({ id: 'b' + bi, label: '槽' + bi, sub: '', x: 62, y: 40 + bi * 62, s: hl.b === bi ? 'key' : 'idle', shape: 'rect', w: 56, h: 38 });
          b.forEach(function (kv, pi) {
            var id = 'b' + bi + '_' + pi;
            var st = 'done';
            if (hl.b === bi && hl.pi === pi && hl.cmp) st = 'cmp';
            if (hl.b === bi && hl.pi === pi && hl.ins) st = 'swap';
            nodes.push({ id: id, label: String(kv[0]), sub: 'v' + kv[1], x: 62 + 130 * (pi + 1), y: 40 + bi * 62, s: st, shape: 'rect', w: 58, h: 40 });
            edges.push({ from: pi === 0 ? 'b' + bi : 'b' + bi + '_' + (pi - 1), to: id, s: 'idle' });
          });
        });
        steps.push({
          line: line,
          scenes: [{ kind: 'nodes', nodes: nodes, edges: edges, caption: '拉链法：每个槽挂一条链，冲突的元素排在链上' }],
          log: log,
          vars: { 负载因子: (count() / m).toFixed(2), 槽数: m }
        });
      }
      function count() { var c = 0; buckets.forEach(function (b) { c += b.length; }); return c; }
      push(0, '初始化 ' + m + ' 个空槽');
      keys.forEach(function (k) {
        var idx = ((k % m) + m) % m;
        hl = { b: idx };
        push(1, '插入 key=' + k + '：hash % ' + m + ' = ' + idx + ' → 落在槽 ' + idx);
        var found = false;
        for (var p = 0; p < buckets[idx].length; p++) {
          hl = { b: idx, pi: p, cmp: true };
          push(2, '沿链比较：槽' + idx + ' 第 ' + (p + 1) + ' 个 key=' + buckets[idx][p][0] + (buckets[idx][p][0] === k ? ' → 相同，更新' : ' → 不同，继续'));
          if (buckets[idx][p][0] === k) { buckets[idx][p][1]++; found = true; break; }
        }
        if (!found) {
          buckets[idx].push([k, 1]);
          hl = { b: idx, pi: buckets[idx].length - 1, ins: true };
          push(3, '链上没有重复 → 挂到链尾' + (buckets[idx].length > 1 ? '（发生冲突，链长 ' + buckets[idx].length + '）' : ''));
        }
        hl = {};
        if (count() / m > 0.75) {
          push(6, '负载因子 ' + (count() / m).toFixed(2) + ' > 0.75 → 触发扩容（rehash），所有元素重新计算位置');
          var all = []; buckets.forEach(function (b) { b.forEach(function (kv) { all.push(kv); }); });
          m *= 2;
          buckets = []; for (var q = 0; q < m; q++) buckets.push([]);
          all.forEach(function (kv) { buckets[((kv[0] % m) + m) % m].push(kv); });
          hl = {};
          push(7, '扩容到 ' + m + ' 个槽，重新分布完成');
        }
      });
      return steps;
    }
  },

  run: {
    inputs: [
      { key: 'keys', label: '要插入的 key 数组', def: '[12,25,37,44,58,63,70,81]' },
      { key: 'm', label: '初始槽位数 m', def: '7' }
    ],
    code:
      'let m = Number(input.m);\n' +
      'let buckets = Array.from({ length: m }, () => []);\n' +
      'let size = 0, rehash = 0;\n' +
      'function put(key, val) {\n' +
      '  let idx = ((key % m) + m) % m;\n' +
      '  for (const kv of buckets[idx]) { if (kv[0] === key) { kv[1] = val; return; } }\n' +
      '  buckets[idx].push([key, val]); size++;\n' +
      '  log("put(" + key + ") → 槽" + idx + (buckets[idx].length > 1 ? "（冲突，链长" + buckets[idx].length + "）" : ""));\n' +
      '  if (size / m > 0.75) {\n' +
      '    rehash++;\n' +
      '    const all = [].concat(...buckets);\n' +
      '    m *= 2;\n' +
      '    buckets = Array.from({ length: m }, () => []);\n' +
      '    for (const kv of all) buckets[((kv[0] % m) + m) % m].push(kv);\n' +
      '    log("  ↳ 负载因子超限，扩容到 " + m + " 槽并 rehash");\n' +
      '  }\n' +
      '}\n' +
      'for (const k of input.keys) put(k, 1);\n' +
      'const lens = buckets.map(b => b.length);\n' +
      'return { 槽数: m, 元素数: size, 扩容次数: rehash,\n' +
      '         各链长度: lens, 最长链: Math.max(...lens),\n' +
      '         说明: "最长链越短，查询越接近 O(1)" };'
  },

  complexity: {
    best: 'O(1)', avg: 'O(1)', worst: 'O(n)（极端冲突）', space: 'O(n)', stable: '—',
    detail: [
      '在「哈希函数均匀 + 负载因子受控」的前提下，链长期望为 α，单次操作 O(1+α) ≈ O(1)。最坏情况所有 key 都撞到同一个槽，退化为 O(n)（开放寻址还会被「聚集」拖累）。',
      '<strong>扩容是均摊 O(1) 的关键</strong>：从 m 扩到 2m 需要移动 m 个元素，但这次扩容「攒下」的额度足够支撑接下来 m/2 次插入，摊还到每次插入只有 O(1)。',
      '工程实现（Java 8+、Go map）会在链长超过阈值时把链表转成红黑树，把最坏查询压到 O(log n)，防止恶意构造的哈希碰撞攻击。'
    ],
    table: [
      ['操作', '平均', '最坏', '说明'],
      ['查找 get', 'O(1)', 'O(n)', '极端冲突退化成链表遍历'],
      ['插入 put', 'O(1) 均摊', 'O(n)', '扩容那一次是 O(n)，但摊还后 O(1)'],
      ['删除 remove', 'O(1)', 'O(n)', '拉链法直接改指针'],
      ['扩容 rehash', 'O(n)', 'O(n)', '但发生频率指数递减']
    ]
  },

  quiz: [
    {
      q: '哈希表为什么能「一步定位」？',
      options: ['它把所有数据排序了', '哈希函数把 key 直接算成数组下标，访问数组是 O(1)', '它用二分查找', '它数据量小'],
      answer: 1,
      hint: '关键在于「不需要比较」，而是「算出来」。算完之后访问的是数组，数组按下标访问是什么复杂度？',
      why: 'hash → 下标 → 随机访问。'
    },
    {
      q: '关于哈希冲突，正确的是？',
      options: ['好的哈希函数可以完全避免冲突', '冲突不可避免，必须有解决策略', '冲突只会在数据量大时出现', '扩容能彻底消除冲突'],
      answer: 1,
      hint: 'key 的可能取值几乎是无限的，而槽位数是有限的——鸽笼原理。',
      why: '必然发生，只能靠拉链 / 开放寻址处理。'
    },
    {
      q: '负载因子 α 变大时，哈希表性能如何变化？',
      options: ['变快', '冲突变多、查询变慢', '完全不变', '内存变少'],
      answer: 1,
      hint: 'α = 元素数/槽数。槽位不变、元素变多，链会怎样？',
      why: '链变长 → 查询趋近 O(n)。'
    },
    {
      q: '「扩容时要把所有元素重新计算位置（rehash）」为什么值得做？',
      options: ['因为要排序', '虽然单次 O(n)，但扩容频率递减，摊还后每次插入仍是 O(1)', '因为数组不能动态增长', '为了减少内存'],
      answer: 1,
      hint: '每次扩容容量翻倍，能撑住多少次新插入才需要下一次扩容？把这些移动成本摊到这些插入上，每次是多少？',
      why: '摊还分析 → 均摊 O(1)。'
    }
  ],

  practice: [
    {
      title: '动手题 1 · 两数之和（哈希表的经典首题）',
      desc: '给定数组和 target，找出两个下标使 a[i]+a[j]=target。暴力是 O(n²)，请用哈希表做到 O(n)。',
      hint: '不要「找两个数」，改成「扫到一个数 x 时，查一下 target-x 之前有没有出现过」。查什么结构能做到 O(1)？',
      solution:
        'function twoSum(a, target) {\n' +
        '  const seen = new Map();               // 值 → 下标\n' +
        '  for (let i = 0; i < a.length; i++) {\n' +
        '    const need = target - a[i];\n' +
        '    if (seen.has(need)) return [seen.get(need), i];\n' +
        '    seen.set(a[i], i);\n' +
        '  }\n' +
        '  return null;\n' +
        '}\n' +
        '// 时间 O(n)，空间 O(n)：典型的「空间换时间」'
    },
    {
      title: '动手题 2 · 找出第一个只出现一次的字符',
      desc: '给定字符串，返回第一个只出现一次的字符下标。用哈希表计数，注意要「按原顺序」再扫一遍。',
      hint: '第一遍统计频次（哈希表 O(n)），第二遍按原字符串顺序找频次为 1 的。注意：不能直接遍历哈希表，因为哈希表的顺序不等于原顺序。',
      solution:
        'function firstUniqChar(s) {\n' +
        '  const cnt = new Map();\n' +
        '  for (const c of s) cnt.set(c, (cnt.get(c) || 0) + 1);\n' +
        '  for (let i = 0; i < s.length; i++) if (cnt.get(s[i]) === 1) return i;\n' +
        '  return -1;\n' +
        '}\n' +
        '// 时间 O(n)，空间 O(k)（k = 字符集大小，常数级）'
    }
  ]
});

/* ------------------------------------------------------------------ */
L({
  id: 'backtracking',
  level: 'intermediate',
  title: '回溯与剪枝：把「所有可能」走一遍，但别走冤枉路',
  subtitle: '回溯 = 递归 + 试错 + 撤销；剪枝决定它是「秒出」还是「跑到天荒地老」。',
  prereq: ['recursion-basic'],
  minutes: 35,
  tags: ['回溯', '剪枝', 'N 皇后'],

  analogyTitle: '走迷宫：撞墙就退回上一个路口',
  analogy: [
    '走迷宫没有地图时，你的策略是：遇到岔路就选一条走下去，走到死胡同就<strong>退回上一个岔路口</strong>，换另一条没试过的路。这个「选 → 走 → 退回 → 换」的循环，就是回溯。',
    '聪明人会做一件事：<strong>远远看到这条路通往的区域已经被封死了，就干脆不进去</strong>——这就是<strong>剪枝</strong>。剪枝不改变答案，只是把「注定无解的分支」提前砍掉，往往能把指数级的搜索空间砍掉 99%。'
  ],

  idea: [
    '<strong>回溯模板</strong>：做选择 → 递归进入下一层 → 撤销选择（恢复现场）。「撤销」是最容易被忘记、也最关键的一步。',
    '<strong>路径 / 选择列表 / 结束条件</strong>三要素：path 记录已做的选择，每次从 choices 里挑一个，到达叶子就收获一个解。',
    '<strong>剪枝</strong>：在「做选择之前」判断这个选择是否可行（约束函数），不可行就直接跳过整棵子树。',
    '复杂度通常是<strong>指数级 O(2ⁿ) 或 O(n!)</strong>（子集 / 排列 / N 皇后），因此剪枝与问题规模控制非常重要。'
  ],
  when: [
    '求「所有可行解」或「是否存在解」：排列组合、子集、N 皇后、数独、迷宫、正则匹配。',
    '问题能拆成「若干步决策」，且每步的选择有限 → 回溯。',
    '如果只求最优解且存在「重叠子问题 + 最优子结构」，优先考虑动态规划（比回溯快得多）。'
  ],

  steps: [
    { t: '定义「第 k 层在做什么决定」', why: '回溯是逐层决策的：N 皇后里第 k 层 = 给第 k 行选列；子集里第 k 层 = 决定第 k 个元素要不要。先明确这个，递归才有意义。' },
    { t: '遍历本层所有可选分支', why: '「所有可能」必须穷举完整，否则会漏解。' },
    { t: '先做可行性判断（剪枝），不可行就 continue', why: '在递归之前判断，能跳过整棵子树——这是剪枝威力最大的位置。放到递归之后再判断就只剩「回溯」了。' },
    { t: '做出选择：path.push(...) 并更新占用标记', why: '把决策记下来，才能让下一层知道「已经用过什么」。' },
    { t: '递归进入下一层', why: '信任递归：假设它能把后续所有层都处理好。' },
    { t: '撤销选择：path.pop() 并清除标记', why: '不恢复现场的话，回到上一层时状态是脏的，会污染兄弟分支——这是回溯 bug 的头号来源。' }
  ],

  pseudo: [
    'function backtrack(path, k):',
    '    if k == n:                       // 结束条件：收获一个解',
    '        result.add(path.copy()); return',
    '    for 每个候选选择 c:',
    '        if 不满足约束: continue       // ← 剪枝（关键）',
    '        path.add(c); 标记 c 已占用    // 做选择',
    '        backtrack(path, k + 1)        // 进入下一层',
    '        path.remove(c); 取消占用标记  // 撤销选择（关键）'
  ],

  anim: {
    fields: [{ key: 'n', kind: 'text', label: '棋盘大小 N', def: '6' }],
    legend: [['done', '已放置的皇后'], ['cmp', '正在尝试的位置'], ['swap', '冲突，放弃'], ['dim', '未尝试']],
    gen: function (v) {
      var N = Math.max(4, Math.min(6, parseInt(Number(v.n) || 6, 10)));
      var board = [], steps = [], sols = 0;
      for (var i = 0; i < N; i++) board.push(new Array(N).fill(0));
      function conflict(r, c) {
        for (var i = 0; i < r; i++) if (board[i][c]) return true;
        for (var i = r - 1, j = c - 1; i >= 0 && j >= 0; i--, j--) if (board[i][j]) return true;
        for (var i = r - 1, j = c + 1; i >= 0 && j < N; i--, j++) if (board[i][j]) return true;
        return false;
      }
      function snap(line, log, hlCell) {
        steps.push({
          line: line,
          scenes: [{
            kind: 'grid', cellW: 46, cellH: 42, labelW: 34, labelH: 26,
            rowLabels: Array.from({ length: N }, function (_, i) { return '行' + i; }),
            colLabels: Array.from({ length: N }, function (_, i) { return i; }),
            cells: board.map(function (row, r) {
              return row.map(function (x, c) {
                var s = 'idle';
                if (x === 1) s = 'done';
                else if (x === 2) s = 'cmp';
                else if (x === 3) s = 'swap';
                else s = 'dim';
                return { v: x === 1 ? '♛' : (x === 2 ? '?' : (x === 3 ? '✗' : '')), s: s };
              });
            }),
            caption: 'N=' + N + ' 皇后：♛已放置  ?尝试中  ✗冲突'
          }],
          log: log,
          vars: { 已找到解: sols }
        });
      }
      snap(0, '开始：在 ' + N + '×' + N + ' 棋盘上放 ' + N + ' 个皇后，要求不同行、不同列、不同斜线');
      function bt(r) {
        if (r === N) { sols++; snap(1, '第 ' + r + ' 行也已放好 → 找到一个完整解！'); return true; }
        for (var c = 0; c < N; c++) {
          board[r][c] = 2;
          snap(3, '第 ' + r + ' 行：尝试放在第 ' + c + ' 列');
          if (conflict(r, c)) {
            board[r][c] = 3;
            snap(3, '与已有皇后冲突（同列或同斜线）→ 剪枝，跳过这个位置');
          } else {
            board[r][c] = 1;
            snap(5, '可以放！放到 (' + r + ',' + c + ')，进入下一行');
            if (bt(r + 1)) return true;
            board[r][c] = 0;
            snap(7, '从 (' + r + ',' + c + ') 回溯：撤销这个皇后，试试下一列');
          }
          board[r][c] = 0;
        }
        return false;
      }
      bt(0);
      snap(7, '演示结束（为控制动画长度，找到 1 个解后停止）。N=' + N + ' 其实共有 ' + ({ 4: 2, 5: 10, 6: 4 }[N] || '若干') + ' 个解。');
      return steps;
    }
  },

  run: {
    inputs: [{ key: 'n', label: 'N（建议 ≤ 8）', def: '6' }],
    code:
      'const N = Number(input.n);\n' +
      'const cols = new Set(), d1 = new Set(), d2 = new Set();   // 占用标记\n' +
      'let nodes = 0, pruned = 0, solutions = 0;\n' +
      'function bt(r) {\n' +
      '  if (r === N) { solutions++; return; }\n' +
      '  for (let c = 0; c < N; c++) {\n' +
      '    nodes++;\n' +
      '    if (cols.has(c) || d1.has(r - c) || d2.has(r + c)) { pruned++; continue; }  // 剪枝\n' +
      '    cols.add(c); d1.add(r - c); d2.add(r + c);          // 做选择\n' +
      '    bt(r + 1);                                          // 递归\n' +
      '    cols.delete(c); d1.delete(r - c); d2.delete(r + c); // 撤销\n' +
      '  }\n' +
      '}\n' +
      'bt(0);\n' +
      'log("N =", N);\n' +
      'log("搜索节点数 =", nodes, "  被剪掉的分支 =", pruned);\n' +
      'log("剪枝率 =", (pruned / nodes * 100).toFixed(1) + "%");\n' +
      'return { 解的个数: solutions, 搜索节点: nodes, 剪枝数: pruned,\n' +
      '         说明: "对比：不做任何剪枝要搜索 N! = " + (function f(n){return n<=1?1:n*f(n-1);})(N) + " 个排列" };'
  },

  complexity: {
    best: 'O(n!) 上界', avg: '远小于 n!（靠剪枝）', worst: 'O(n!)', space: 'O(n)（递归栈 + 标记）', stable: '—',
    detail: [
      'N 皇后不做剪枝要枚举 n! 种摆法；加了「列 / 两条对角线」的占用标记后，每一层能立刻排除掉不可行的列，实际搜索节点数远小于 n!（N=8 时从 40320 降到约 2057）。',
      '<strong>斜线的编号技巧</strong>：同一条「左上→右下」对角线上 r-c 恒定；「右上→左下」对角线上 r+c 恒定。用两个 Set 记录就实现了 O(1) 冲突检测——这是把「判断冲突」从 O(n) 降到 O(1) 的关键。',
      '空间：递归栈 O(n) + 标记集合 O(n)，与解的数量无关（因为我们边搜边输出，不存所有解）。'
    ],
    table: [
      ['问题', '搜索空间', '加剪枝后', '关键剪枝'],
      ['子集', '2ⁿ', '2ⁿ（无法再减）', '按需剪枝（如和超限）'],
      ['全排列', 'n!', 'n!（可部分剪）', 'used 标记 + 约束'],
      ['N 皇后', 'n!', '约 1/20', '列 + 双对角线占用'],
      ['数独', '9⁸¹', '极小', '行/列/宫 + 最少候选优先']
    ]
  },

  quiz: [
    {
      q: '回溯里「撤销选择」忘了写，会发生什么？',
      options: ['只是慢一点', '上一层继续尝试时会带着脏状态，导致漏解或错解', '会死循环', '没有任何影响'],
      answer: 1,
      hint: '试想：第 0 行试了第 0 列，没撤销；接着试第 1 列时，棋盘上是不是多了个本不该存在的皇后？',
      why: '状态污染 → 结果错误。'
    },
    {
      q: '剪枝应该放在递归调用的哪里？',
      options: ['递归之后', '做选择之前（进入子树之前）', '只在最外层', '无所谓'],
      answer: 1,
      hint: '放在递归之前能跳过整棵子树；放在之后，子树已经白跑一趟了。',
      why: '提前判断才能省掉整棵子树。'
    },
    {
      q: 'N 皇后中判断「同一条左上→右下斜线」的技巧是？',
      options: ['r + c 恒定', 'r - c 恒定', 'r * c 恒定', '只能逐个遍历'],
      answer: 1,
      hint: '在这条斜线上往下走一格：r+1、c+1。那么 r-c 变了吗？',
      why: 'r-c 为定值，可直接用 Set 判重。'
    },
    {
      q: '下面哪个问题<strong>不适合</strong>用回溯？',
      options: ['求一个集合的所有子集', '求数组的最长递增子序列长度', '解数独', '求 N 皇后所有解'],
      answer: 1,
      hint: '注意题目问的是「长度」而不是「所有方案」——只问最优值且有重叠子问题时，有更快的办法。',
      why: 'LIS 用 DP（O(n log n)）远优于回溯。'
    }
  ],

  practice: [
    {
      title: '动手题 1 · 子集与全排列',
      desc: '分别写出「求数组所有子集」和「求所有全排列」的回溯代码。注意区别：子集每层是「选/不选」，排列每层是「从没用过的元素里挑一个」。',
      hint: '子集：backtrack(start, path)，每层决定要不要把 a[start] 加进来。排列：用 used 数组标记，每层遍历所有未使用的元素。',
      solution:
        '// 子集\n' +
        'function subsets(a) {\n' +
        '  const res = [];\n' +
        '  (function bt(i, path) {\n' +
        '    if (i === a.length) { res.push(path.slice()); return; }\n' +
        '    path.push(a[i]); bt(i + 1, path); path.pop();   // 选\n' +
        '    bt(i + 1, path);                                 // 不选\n' +
        '  })(0, []);\n' +
        '  return res;\n' +
        '}\n' +
        '// 全排列\n' +
        'function perms(a) {\n' +
        '  const res = [], used = new Array(a.length).fill(false);\n' +
        '  (function bt(path) {\n' +
        '    if (path.length === a.length) { res.push(path.slice()); return; }\n' +
        '    for (let i = 0; i < a.length; i++) {\n' +
        '      if (used[i]) continue;\n' +
        '      used[i] = true; path.push(a[i]);\n' +
        '      bt(path);\n' +
        '      path.pop(); used[i] = false;      // 撤销\n' +
        '    }\n' +
        '  })([]);\n' +
        '  return res;\n' +
        '}'
    },
    {
      title: '动手题 2 · 组合总和（带剪枝）',
      desc: '从无重复的正数数组里选若干个数（可重复选同一个数），使和等于 target，求所有组合。要求：先排序，并在「当前和已超过 target」时立即停止该分支。',
      hint: '排序后，一旦发现 a[i] 让 sum 超过 target，后面的 a[i+1]、a[i+2] 更大，也必然超——可以直接 break（不只是 continue）。',
      solution:
        'function combSum(a, target) {\n' +
        '  a.sort((x, y) => x - y);\n' +
        '  const res = [];\n' +
        '  (function bt(start, path, sum) {\n' +
        '    if (sum === target) { res.push(path.slice()); return; }\n' +
        '    for (let i = start; i < a.length; i++) {\n' +
        '      if (sum + a[i] > target) break;       // ← 排序后的强力剪枝\n' +
        '      path.push(a[i]);\n' +
        '      bt(i, path, sum + a[i]);              // 传 i 而非 i+1：允许重复选\n' +
        '      path.pop();\n' +
        '    }\n' +
        '  })(0, [], 0);\n' +
        '  return res;\n' +
        '}'
    }
  ]
});
