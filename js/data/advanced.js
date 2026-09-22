/* ============ 进阶篇（一） ============ */

/* ------------------------------------------------------------------ */
L({
  id: 'heap',
  level: 'advanced',
  title: '堆与堆排序：永远能 O(1) 拿到最大值',
  subtitle: '堆是一棵「父必胜子」的完全二叉树，用数组就能存——优先队列、TopK、堆排序全靠它。',
  prereq: ['recursion-basic', 'quick-sort'],
  minutes: 35,
  tags: ['堆', '优先队列', '完全二叉树'],

  analogyTitle: '部门里的「组长一定比组员强」规则',
  analogy: [
    '公司组织成一棵树：每个组长都比他手下的所有人强（<strong>堆性质：父节点 ≥ 子节点</strong>）。那么全公司最强的人在哪？<strong>一定是树根</strong>——不用比，一步就知道。这就是堆能 O(1) 取最大值的原因。',
    '但如果把最强的那个人调走了怎么办？让最后一个员工临时顶到根上，然后让他跟手下比：谁强谁上（<strong>下沉 sift-down</strong>），一层层往下换，直到重新满足「组长比组员强」。因为树的高度只有 log n，所以最多换 log n 次。这就是堆的插入 / 删除为什么是 O(log n)。'
  ],

  idea: [
    '<strong>完全二叉树 + 数组存储</strong>：下标 i 的左孩子 2i+1、右孩子 2i+2、父节点 (i-1)>>1。不需要指针，且数组连续 → 缓存友好、省内存。',
    '<strong>堆性质</strong>：大顶堆中 a[parent] ≥ a[child]（小顶堆反之）。注意：<strong>只保证父子有序，不保证兄弟或整层有序</strong>。',
    '<strong>两个核心动作</strong>：sift-up（新元素上浮，O(log n)）与 sift-down（根元素下沉，O(log n)）。',
    '<strong>堆排序</strong>：① 建堆 O(n) ② 反复「把堆顶（最大）换到末尾」+ 下沉，共 n 次 → O(n log n)，<strong>原地、空间 O(1)</strong>。'
  ],
  when: [
    '需要「不断取最大 / 最小」：优先队列、任务调度、Dijkstra、TopK、合并 K 个有序链表。',
    '内存紧张又要 O(n log n) 保证：堆排序（原地 O(1) 空间，且最坏也是 O(n log n)）。',
    '需要稳定排序？不行——堆排序不稳定。此时用归并。'
  ],

  steps: [
    { t: '建堆：从最后一个非叶子节点开始，倒着做 sift-down', why: '叶子节点天然满足堆性质（没有孩子）。从 n/2-1 倒着往下沉，能保证「处理某个节点时，它的子树已经是堆」，一次下沉就能搞定。' },
    { t: 'sift-down：与「较大的那个孩子」比较，若孩子更大就交换，继续往下', why: '必须跟较大的孩子换，否则换上来一个小的，新的父子关系还是不满足堆性质。' },
    { t: '排序阶段：交换 a[0] 与 a[end]，堆大小 -1', why: '堆顶是当前最大值，把它换到末尾就是它在有序数组里的最终位置——和快排的 pivot 归位异曲同工。' },
    { t: '对新的堆顶做 sift-down，恢复堆性质', why: '换上来的末尾元素很小，破坏了堆性质，需要下沉到合适位置。' },
    { t: '重复 n-1 次，数组即有序', why: '每次确定一个最大值的位置，且用的是原地交换，所以空间 O(1)。' }
  ],

  pseudo: [
    '// 建堆：倒着下沉所有非叶子节点',
    'for i = n/2-1 down to 0:',
    '    siftDown(i, n)',
    '',
    '// 下沉',
    'function siftDown(i, size):',
    '    while 2*i+1 < size:',
    '        child = 2*i+1',
    '        if child+1 < size and a[child+1] > a[child]: child++   // 取较大的孩子',
    '        if a[i] >= a[child]: break      // 已满足堆性质',
    '        swap(a[i], a[child]); i = child',
    '',
    '// 排序',
    'for end = n-1 down to 1:',
    '    swap(a[0], a[end])                  // 最大值归位',
    '    siftDown(0, end)                    // 堆大小变为 end'
  ],

  anim: {
    fields: [{ key: 'arr', kind: 'array', def: '[4,10,3,5,1,9,7]' }],
    legend: [['active', '当前下沉的节点'], ['cmp', '参与比较的孩子'], ['swap', '发生交换'], ['done', '已排好 / 已移出堆'], ['dim', '已移出堆']],
    gen: function (v) {
      var a = v.arr.slice(0, 15), n = a.length, steps = [];
      var heapSize = n, hl = {};
      function treeScene() {
        var nodes = [], edges = [];
        for (var i = 0; i < n; i++) {
          var d = Math.floor(Math.log2(i + 1));
          var pos = i - (Math.pow(2, d) - 1);
          var span = Math.pow(2, d);
          var x = (pos + 0.5) * (660 / span);
          var y = 40 + d * 74;
          var st = 'idle';
          if (i >= heapSize) st = 'dim';
          else if (hl.sw1 === i || hl.sw2 === i) st = 'swap';
          else if (hl.cur === i) st = 'active';
          else if (hl.child === i) st = 'cmp';
          nodes.push({ id: 'h' + i, label: String(a[i]), sub: i === 0 ? '堆顶' : '', x: x, y: y, s: st, shape: 'circle' });
        }
        for (var j = 1; j < n; j++) {
          var p = Math.floor((j - 1) / 2);
          edges.push({
            from: 'h' + p, to: 'h' + j,
            s: (hl.sw1 === p && hl.sw2 === j) || (hl.sw1 === j && hl.sw2 === p) ? 'active' : 'idle', dir: false
          });
        }
        return { kind: 'nodes', nodes: nodes, edges: edges, caption: '堆的逻辑结构（完全二叉树）' };
      }
      function arrScene() {
        return {
          kind: 'array', rows: [{
            label: '数组存储（下标 i 的左孩子 2i+1、右孩子 2i+2）',
            items: a.map(function (x, i) {
              var s = 'idle';
              if (i >= heapSize) s = 'done';
              else {
                if (hl.sw1 === i || hl.sw2 === i) s = 'swap';
                else if (hl.cur === i) s = 'active';
                else if (hl.child === i) s = 'cmp';
              }
              return { v: x, s: s };
            }),
            ptrs: hl.cur != null ? [{ name: 'i', idx: hl.cur, color: '#f97316' }] : []
          }]
        };
      }
      function push(line, log) {
        steps.push({ line: line, scenes: [treeScene(), arrScene()], log: log, vars: {} });
      }
      function siftDown(i, size) {
        while (2 * i + 1 < size) {
          var ch = 2 * i + 1;
          hl = { cur: i, child: ch };
          push(9, '节点 ' + i + '（' + a[i] + '）先看左孩子 ' + ch + '（' + a[ch] + '）');
          if (ch + 1 < size && a[ch + 1] > a[ch]) {
            hl = { cur: i, child: ch + 1 };
            push(10, '右孩子 ' + (ch + 1) + '（' + a[ch + 1] + '）更大 → 改跟右孩子比');
            ch++;
          }
          if (a[i] >= a[ch]) { hl = { cur: i }; push(11, a[i] + ' ≥ ' + a[ch] + '，已满足堆性质，停止下沉'); break; }
          var t = a[i]; a[i] = a[ch]; a[ch] = t;
          hl = { sw1: i, sw2: ch, cur: ch };
          push(12, '孩子更大 → 交换 ' + i + ' 与 ' + ch + '，继续往下沉');
          i = ch;
        }
        hl = {};
      }
      push(1, '原始数组：' + a.join(', ') + '。开始建堆（大顶堆）');
      for (var k = Math.floor(n / 2) - 1; k >= 0; k--) {
        hl = { cur: k };
        push(2, '对非叶子节点 ' + k + '（' + a[k] + '）执行下沉');
        siftDown(k, n);
      }
      hl = {};
      push(2, '建堆完成！堆顶 = ' + a[0] + ' 是最大值');
      for (var end = n - 1; end >= 1; end--) {
        var t2 = a[0]; a[0] = a[end]; a[end] = t2;
        heapSize = end;
        hl = { sw1: 0, sw2: end };
        push(16, '交换堆顶与末尾 → 最大值 ' + a[end] + ' 归位到第 ' + end + ' 位');
        siftDown(0, end);
        hl = { cur: 0 };
        push(17, '恢复堆性质，堆大小变为 ' + end);
      }
      heapSize = 0; hl = {};
      push(17, '排序完成：' + a.join(', '));
      return steps;
    }
  },

  run: {
    inputs: [{ key: 'arr', label: '待排序数组', def: '[4,10,3,5,1,9,7]' }],
    code:
      'const a = input.arr.slice();\n' +
      'let cmp = 0, swap = 0;\n' +
      'function siftDown(i, size) {\n' +
      '  while (2 * i + 1 < size) {\n' +
      '    let ch = 2 * i + 1;\n' +
      '    if (ch + 1 < size) { cmp++; if (a[ch + 1] > a[ch]) ch++; }\n' +
      '    cmp++;\n' +
      '    if (a[i] >= a[ch]) break;\n' +
      '    [a[i], a[ch]] = [a[ch], a[i]]; swap++;\n' +
      '    i = ch;\n' +
      '  }\n' +
      '}\n' +
      'for (let i = (a.length >> 1) - 1; i >= 0; i--) siftDown(i, a.length);\n' +
      'log("建堆完成：", a.join(","), "  堆顶 =", a[0]);\n' +
      'for (let end = a.length - 1; end >= 1; end--) {\n' +
      '  [a[0], a[end]] = [a[end], a[0]];\n' +
      '  siftDown(0, end);\n' +
      '  log("最大值 " + a[end] + " 归位 →", a.join(","));\n' +
      '}\n' +
      'return { 结果: a, 比较次数: cmp, 交换次数: swap,\n' +
      '         说明: "原地排序，额外空间 O(1)；最坏也是 O(n log n)" };'
  },

  complexity: {
    best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)', stable: '不稳定',
    detail: [
      '<strong>建堆是 O(n) 而不是 O(n log n)</strong>：直观上「n 个节点各下沉 O(log n)」是 O(n log n)，但越靠底部的节点越多、高度却越小。精确求和 Σ(层高 × 该层节点数) = O(n)。这是很多人会答错的点。',
      '排序阶段 n-1 次「交换 + 下沉」，每次 O(log n) → O(n log n)。总体 O(n log n)，<strong>原地、最坏也有保证</strong>。缺点是缓存局部性差（跳跃访问）且不稳定，所以实际通常比快排慢一些。'
    ],
    table: [
      ['操作', '复杂度', '说明'],
      ['建堆 buildHeap', 'O(n)', 'Σ(层高×节点数) 收敛到 O(n)'],
      ['取最大值 peek', 'O(1)', '堆顶即最大值'],
      ['插入 push', 'O(log n)', '末尾追加后上浮'],
      ['删除堆顶 pop', 'O(log n)', '末尾顶替后下沉'],
      ['堆排序', 'O(n log n)', '原地、不稳定、最坏有保证']
    ]
  },

  quiz: [
    {
      q: '把一个无序数组建成堆，时间复杂度是？',
      options: ['O(n log n)', 'O(n)', 'O(log n)', 'O(n²)'],
      answer: 1,
      hint: '别想当然地用「n 个节点 × 每个 O(log n)」。注意：靠近底部的节点非常多，但它们的高度只有 1。',
      why: '按层求和 Σ h·(n/2^h) = O(n)。'
    },
    {
      q: '大顶堆能保证什么？',
      options: ['整个数组有序', '每个父节点都不小于它的孩子（堆顶最大）', '左孩子一定小于右孩子', '同层从左到右递增'],
      answer: 1,
      hint: '堆只约束「父子」这一条纵向关系，横向（兄弟、同层）没有任何保证。',
      why: '只保证父 ≥ 子。'
    },
    {
      q: '数组下标 i 的左右孩子下标是？',
      options: ['2i 和 2i+1', '2i+1 和 2i+2', 'i/2 和 i/2+1', 'i+1 和 i+2'],
      answer: 1,
      hint: '这是「下标从 0 开始」的写法。如果从 1 开始才是 2i 和 2i+1。',
      why: '0-based：左 2i+1，右 2i+2，父 (i-1)>>1。'
    },
    {
      q: '求「海量数据里最大的 K 个」，最合适的数据结构是？',
      options: ['大顶堆（全量建堆）', '小顶堆（只维护 K 个）', '排序整个数组', '哈希表'],
      answer: 1,
      hint: '维护一个大小为 K 的小顶堆：新元素比堆顶大才替换。这样内存只要 O(K)，而不是 O(n)。',
      why: '小顶堆时间 O(n log K)、空间 O(K)。'
    }
  ],

  practice: [
    {
      title: '动手题 1 · 手写优先队列',
      desc: '用数组实现一个支持 push / pop 的小顶堆，并用于「合并 K 个有序链表」。',
      hint: 'push：放末尾后 siftUp（比父小就换）；pop：取出 a[0]，用末尾元素顶替后 siftDown。',
      solution:
        'class MinHeap {\n' +
        '  constructor() { this.a = []; }\n' +
        '  push(x) {\n' +
        '    const a = this.a; a.push(x);\n' +
        '    let i = a.length - 1;\n' +
        '    while (i > 0) { const p = (i - 1) >> 1; if (a[p] <= a[i]) break; [a[p], a[i]] = [a[i], a[p]]; i = p; }\n' +
        '  }\n' +
        '  pop() {\n' +
        '    const a = this.a, top = a[0], last = a.pop();\n' +
        '    if (a.length) { a[0] = last; let i = 0;\n' +
        '      for (;;) { const l = 2*i+1, r = l+1; let m = i;\n' +
        '        if (l < a.length && a[l] < a[m]) m = l;\n' +
        '        if (r < a.length && a[r] < a[m]) m = r;\n' +
        '        if (m === i) break; [a[i], a[m]] = [a[m], a[i]]; i = m; } }\n' +
        '    return top;\n' +
        '  }\n' +
        '  get size() { return this.a.length; }\n' +
        '}'
    },
    {
      title: '动手题 2 · 为什么建堆是 O(n)？',
      desc: '推导建堆代价：从底往上数第 h 层约有 n/2^(h+1) 个节点，每个最多下沉 h 层。写出求和式并说明它为什么收敛到 O(n)。',
      hint: 'Σ h·n/2^(h+1) = (n/2)·Σ h/2^h。而 Σ h/2^h（h 从 0 到 ∞）是收敛的，等于 2。',
      solution:
        '代价 = Σ_{h≥0} (第 h 层节点数) × (最多下沉 h 次)\n' +
        '     ≈ Σ_{h≥0} (n / 2^(h+1)) × h = (n/2) · Σ_{h≥0} h/2^h\n' +
        'Σ h/2^h = 2 （收敛）\n' +
        '→ 总代价 ≈ (n/2) × 2 = n  →  O(n)\n' +
        '直觉：绝大多数节点在底层几乎不用动；需要动很多层的节点只有极少几个。'
    }
  ]
});

/* ------------------------------------------------------------------ */
L({
  id: 'tree-bst',
  level: 'advanced',
  title: '二叉树与 BST：查找树把比较次数降到树高',
  subtitle: '每个节点「左小右大」，查找就变成一路向下——但树可能长歪，长歪了就退化成链表。',
  prereq: ['recursion-basic'],
  minutes: 35,
  tags: ['树', 'BST', '遍历'],

  analogyTitle: '猜数字的决策树，和「长歪」的瘦高树',
  analogy: [
    '二分查找其实是在走一棵隐形的<strong>决策树</strong>：每个节点问一句「比目标大还是小？」，然后往左或往右。把这棵树显式地存下来，就是<strong>二叉搜索树（BST）</strong>：每个节点左边全是比它小的，右边全是比它大的。',
    '理想情况下这棵树是「矮胖」的，高度 log n，查一次只要 log n 次比较。但如果插入的数据是 1,2,3,4,5… 递增的，每个新节点都只能挂在最右边——树会<strong>长成一根竹竿</strong>，高度 n，查找退化成 O(n)。<strong>这就是为什么需要 AVL / 红黑树：它们会在插入时自动旋转把树掰平衡。</strong>'
  ],

  idea: [
    '<strong>BST 性质</strong>：对任意节点，左子树所有值 &lt; 它，右子树所有值 &gt; 它。中序遍历结果必然<strong>升序</strong>——这是验证 BST 的利器。',
    '<strong>查找 / 插入</strong>：从根开始，比当前节点小就往左、大就往右，走到底为止。代价 = <strong>树高 h</strong>。',
    '<strong>三种遍历</strong>：前序（根左右，用于复制树）、中序（左根右，BST 得到升序）、后序（左右根，用于释放 / 计算子树）。',
    '<strong>平衡是命门</strong>：h 可以是 log n（平衡）到 n（退化）。AVL / 红黑树通过旋转保证 h = O(log n)。'
  ],
  when: [
    '需要「有序 + 动态增删查」：TreeMap、数据库索引（B+ 树是多路平衡树）。',
    '需要范围查询（找 10~20 之间的所有 key）→ BST 的中序遍历天然支持，哈希表做不到。',
    '只做精确 key 查询且不要顺序 → 哈希表更快（O(1)）。'
  ],

  steps: [
    { t: '插入：从根开始比较，小往左、大往右，直到空位', why: 'BST 性质决定了「目标值应该在哪个方向」，每一步都能排除掉一整棵子树，这就是查找高效的来源。' },
    { t: '遇到相等的值：按约定放右边（或计数 +1）', why: '必须有一个确定的约定，否则相同值的插入行为不确定，查找时可能找不到。' },
    { t: '查找：同样一路向下，命中即返回', why: '代价 = 树高。所以「树高」是 BST 性能的全部变量。' },
    { t: '中序遍历（左 → 根 → 右）得到升序序列', why: 'BST 性质保证：左子树 < 根 < 右子树，正好对应升序。这也是判断一棵树是不是 BST 的常用方法。' },
    { t: '观察树高：若退化成链，需要自平衡（旋转）', why: '旋转能在保持「左小右大」的前提下降低树高，AVL / 红黑树就是靠它保证 O(log n)。' }
  ],

  pseudo: [
    'function insert(node, x):',
    '    if node == null: return new Node(x)      // 空位 → 插入',
    '    if x < node.val: node.left  = insert(node.left, x)',
    '    else:            node.right = insert(node.right, x)',
    '    return node',
    '',
    'function search(node, x):',
    '    if node == null or node.val == x: return node',
    '    if x < node.val: return search(node.left, x)',
    '    else:            return search(node.right, x)',
    '',
    'function inorder(node):    // 中序：左 根 右',
    '    if node == null: return',
    '    inorder(node.left); visit(node); inorder(node.right)'
  ],

  anim: {
    fields: [
      { key: 'arr', kind: 'array', def: '[8,3,10,1,6,14,4]' },
      { key: 'target', kind: 'text', label: '最后查找的目标', def: '6' }
    ],
    legend: [['active', '当前比较的节点'], ['found', '找到目标'], ['idle', '树上已有节点']],
    gen: function (v) {
      var vals = v.arr.slice(0, 10), target = Number(v.target);
      var steps = [], root = null, counter = 0;
      function mk(val) { return { id: 't' + (counter++), val: val, left: null, right: null }; }
      function layout() {
        var order = [], byId = {};
        (function io(nd, d) {
          if (!nd) return;
          io(nd.left, d + 1);
          order.push(nd); byId[nd.id] = { x: 0, y: 40 + d * 76 };
          io(nd.right, d + 1);
        })(root, 0);
        order.forEach(function (nd, i) { byId[nd.id].x = 46 + i * 78; });
        return byId;
      }
      function scene(hlId, found) {
        var pos = layout(), nodes = [], edges = [];
        (function walk(nd) {
          if (!nd) return;
          var p = pos[nd.id];
          var st = 'idle';
          if (nd.id === hlId) st = found ? 'found' : 'active';
          nodes.push({ id: nd.id, label: String(nd.val), x: p.x, y: p.y, s: st, shape: 'circle' });
          if (nd.left) { edges.push({ from: nd.id, to: nd.left.id, s: 'idle', dir: false }); walk(nd.left); }
          if (nd.right) { edges.push({ from: nd.id, to: nd.right.id, s: 'idle', dir: false }); walk(nd.right); }
        })(root);
        return { kind: 'nodes', nodes: nodes, edges: edges, caption: found ? '找到目标 ' + target : 'BST 构建与查找过程' };
      }
      function push(line, log, hlId, found) {
        steps.push({ line: line, scenes: [scene(hlId, found)], log: log, vars: { 目标: target } });
      }
      push(0, '开始插入：' + vals.join(', '));
      vals.forEach(function (x) {
        if (!root) { root = mk(x); push(1, '树为空，' + x + ' 作为根', root.id); return; }
        var cur = root;
        for (;;) {
          push(x < cur.val ? 2 : 3, '比较 ' + x + ' 与节点 ' + cur.val + '：' + (x < cur.val ? '更小 → 往左' : '更大或相等 → 往右'), cur.id);
          if (x < cur.val) {
            if (!cur.left) { cur.left = mk(x); push(1, '左边是空位 → 插入 ' + x, cur.left.id); break; }
            cur = cur.left;
          } else {
            if (!cur.right) { cur.right = mk(x); push(1, '右边是空位 → 插入 ' + x, cur.right.id); break; }
            cur = cur.right;
          }
        }
      });
      push(11, '插入完成。中序遍历这棵树会得到升序序列。现在查找 ' + target);
      var c = root, found = false;
      while (c) {
        push(7, '查找：当前节点 ' + c.val + (c.val === target ? ' → 命中！' : (target < c.val ? '，目标更小 → 往左' : '，目标更大 → 往右')), c.id, c.val === target);
        if (c.val === target) { found = true; break; }
        c = target < c.val ? c.left : c.right;
      }
      if (!found) push(7, '走到空节点，' + target + ' 不在树中');
      return steps;
    }
  },

  run: {
    inputs: [
      { key: 'arr', label: '插入序列', def: '[8,3,10,1,6,14,4]' },
      { key: 'target', label: '查找目标', def: '6' }
    ],
    code:
      'const root = { val: null };\n' +
      'let nodes = 0;\n' +
      'function insert(nd, x) {\n' +
      '  if (nd.val === null) { nd.val = x; nodes++; return; }\n' +
      '  if (x < nd.val) { if (!nd.left) nd.left = { val: null }; insert(nd.left, x); }\n' +
      '  else { if (!nd.right) nd.right = { val: null }; insert(nd.right, x); }\n' +
      '}\n' +
      'for (const x of input.arr) { insert(root, x); log("插入 " + x); }\n' +
      'function inorder(nd, out) { if (!nd) return; inorder(nd.left, out); out.push(nd.val); inorder(nd.right, out); }\n' +
      'function depth(nd) { return nd ? 1 + Math.max(depth(nd.left), depth(nd.right)) : 0; }\n' +
      'function search(nd, x, d) {\n' +
      '  if (!nd) return { 找到: false, 比较次数: d };\n' +
      '  if (nd.val === x) return { 找到: true, 比较次数: d + 1 };\n' +
      '  return search(x < nd.val ? nd.left : nd.right, x, d + 1);\n' +
      '}\n' +
      'const out = []; inorder(root, out);\n' +
      'const r = search(root, Number(input.target), 0);\n' +
      'log("中序遍历：", out.join(","), "（应为升序）");\n' +
      'log("树高 =", depth(root), " 节点数 =", nodes, " 理想树高 ≈", Math.ceil(Math.log2(nodes + 1)));\n' +
      'return { 中序结果: out, 树高: depth(root), 查找结果: r,\n' +
      '         提示: "试试插入序列 [1,2,3,4,5,6,7]，看树高会变成多少（退化成链表）" };'
  },

  complexity: {
    best: 'O(log n)（平衡）', avg: 'O(log n)', worst: 'O(n)（退化成链）', space: 'O(n)', stable: '—',
    detail: [
      'BST 的所有操作（查找、插入、删除）代价都等于<strong>树高 h</strong>。平衡时 h ≈ log₂n，退化时 h = n。',
      '删除稍微复杂：叶子直接删；只有一个孩子就用孩子顶替；<strong>有两个孩子时，用「中序后继」（右子树的最小值）替换它</strong>，再删掉那个后继节点——这样既保持 BST 性质又只动局部。',
      '自平衡树（AVL、红黑树、B+ 树）通过旋转把 h 强制压到 O(log n)，代价是插入删除要多做几次旋转。工程上几乎都用它们，裸 BST 只在教学里出现。'
    ],
    table: [
      ['结构', '查找', '插入', '删除', '有序遍历'],
      ['哈希表', 'O(1)', 'O(1)', 'O(1)', '不支持'],
      ['二叉搜索树', 'O(h)', 'O(h)', 'O(h)', '支持（中序）'],
      ['平衡 BST（红黑）', 'O(log n)', 'O(log n)', 'O(log n)', '支持'],
      ['退化 BST', 'O(n)', 'O(n)', 'O(n)', '支持']
    ]
  },

  quiz: [
    {
      q: '对 BST 做中序遍历，结果是？',
      options: ['降序', '升序', '层序', '随机'],
      answer: 1,
      hint: 'BST 性质：左 < 根 < 右。中序是「左 → 根 → 右」，排出来是什么顺序？',
      why: '中序 = 升序，也是判 BST 的常用手段。'
    },
    {
      q: '依次插入 1,2,3,4,5 到普通 BST，树高和查找复杂度是？',
      options: ['高 log n，O(log n)', '高 n，O(n)', '高 n/2，O(n/2)', '自动平衡，O(log n)'],
      answer: 1,
      hint: '每次新数都比所有已有数大 → 只能一直挂到最右边。画一下是什么形状？',
      why: '退化成链表，查找 O(n)。'
    },
    {
      q: '删除一个有左右孩子的 BST 节点，标准做法是？',
      options: ['直接置空', '用中序后继（右子树最小值）替换它，再删除那个后继', '用父节点替换', '把左子树整体挂到右子树下'],
      answer: 1,
      hint: '替换它的值必须满足「比左子树都大、比右子树都小」。右子树里最小的那个值符合这个条件吗？',
      why: '中序后继是大于它的最小值，替换后 BST 性质保持。'
    },
    {
      q: '什么时候应该选哈希表而不是 BST？',
      options: ['需要范围查询时', '只需精确 key 查询、不需要顺序时', '数据量极小时', '需要有序输出时'],
      answer: 1,
      hint: '哈希表 O(1) 但完全无序，做不了「10~20 之间的所有 key」这类查询。',
      why: '纯精确查询用哈希表最快。'
    }
  ],

  practice: [
    {
      title: '动手题 1 · 验证一棵树是不是 BST',
      desc: '不能用「只比较每个节点与左右孩子」，必须带上「允许范围」。请用递归实现并解释为什么前者会出错。',
      hint: '反例：根 5，左孩子 3，左孩子的右孩子 6。每个节点与直接孩子都满足，但 6 出现在左子树里，违反 BST。正确做法是递归时传递 (min, max) 边界。',
      solution:
        'function isValidBST(nd, lo, hi) {\n' +
        '  if (!nd) return true;\n' +
        '  if (nd.val <= lo || nd.val >= hi) return false;\n' +
        '  return isValidBST(nd.left, lo, nd.val) && isValidBST(nd.right, nd.val, hi);\n' +
        '}\n' +
        '// 调用：isValidBST(root, -Infinity, Infinity)\n' +
        '// 时间 O(n)，空间 O(h)'
    },
    {
      title: '动手题 2 · 二叉树的层序遍历',
      desc: '用队列实现按层输出节点（从上到下、每层从左到右）。这是 BFS 在树上的直接应用。',
      hint: '队列里放「待访问的节点」。每次取出一个，把它的左右孩子入队——先进先出保证了按层顺序。',
      solution:
        'function levelOrder(root) {\n' +
        '  if (!root) return [];\n' +
        '  const q = [root], res = [];\n' +
        '  while (q.length) {\n' +
        '    const nd = q.shift();               // 队首出队\n' +
        '    res.push(nd.val);\n' +
        '    if (nd.left) q.push(nd.left);\n' +
        '    if (nd.right) q.push(nd.right);\n' +
        '  }\n' +
        '  return res;\n' +
        '}\n' +
        '// 时间 O(n)，空间 O(n)（队列最宽处）'
    }
  ]
});

/* ------------------------------------------------------------------ */
L({
  id: 'dp-basic',
  level: 'advanced',
  title: '动态规划入门：把「算过的答案」存起来',
  subtitle: 'DP 不是某个具体算法，而是一种思路：定义状态 → 找转移 → 确定边界与顺序。',
  prereq: ['recursion-basic'],
  minutes: 45,
  tags: ['动态规划', '背包', '状态转移'],

  analogyTitle: '做过的题记在错题本上，下次直接抄答案',
  analogy: [
    '你在做一本练习册，第 20 题要用到第 18 题的答案。你当然可以重新算一遍第 18 题——但如果每道题都要回头重算，越往后越慢。<strong>聪明的做法是把每道题的答案写在页边空白处</strong>，用到时直接抄。这本「答案册」就是 DP 数组。',
    '更妙的是：如果你<strong>从第 1 题顺着往后做</strong>，那么做第 20 题时，第 18 题的答案早就写好了，连「回头翻」都不需要。这就是「自底向上」的递推版 DP——它比「递归 + 备忘录」少了函数调用开销，也永远不会爆栈。'
  ],

  idea: [
    '<strong>两个前提</strong>：① 重叠子问题（同一个子问题被反复用到）② 最优子结构（全局最优由子问题最优拼出来）。缺任何一个都不适合 DP。',
    '<strong>三步走</strong>：① 定义 dp[i] 或 dp[i][j] 的<strong>确切含义</strong>（最关键，也最容易含糊）② 写出<strong>状态转移方程</strong> ③ 确定<strong>边界初值</strong>与<strong>计算顺序</strong>。',
    '<strong>0-1 背包</strong>：dp[i][w] = 只考虑前 i 个物品、容量为 w 时的最大价值。转移 = max(不选第 i 个, 选第 i 个)。',
    '<strong>空间压缩</strong>：若 dp[i][*] 只依赖 dp[i-1][*]，就能压成一维数组，但<strong>容量必须倒序遍历</strong>，否则同一个物品会被重复选（那就变成完全背包了）。'
  ],
  when: [
    '求「最优值」（最大 / 最小 / 方案数）且问题可拆成重叠子问题 → DP。',
    '求「所有具体方案」→ 回溯（DP 只给数值，不给方案）。',
    '看到「第 i 个位置 / 前 i 个 / 容量 j」这类描述，基本就是二维 DP。'
  ],

  steps: [
    { t: '定义状态：dp[i][w] = 只考虑前 i 个物品、容量 w 时的最大价值', why: '状态定义必须精确到「决策范围」和「约束条件」两个维度。定义含糊，转移方程一定写不对。' },
    { t: '写转移：dp[i][w] = max(dp[i-1][w], dp[i-1][w-wt[i]] + val[i])', why: '对第 i 个物品只有两种选择：不拿（价值不变）或拿（占用 wt[i] 容量、换来 val[i] 价值）。取较大者就是最优——这就是最优子结构。' },
    { t: '边界：dp[0][*] = 0（没有物品，价值为 0）', why: '第 0 行是递推的起点。没有它，第一行的转移就没有依据。' },
    { t: '按 i 从 1 到 n、w 从 0 到 W 的顺序填表', why: '必须保证「算 dp[i][w] 时，它依赖的 dp[i-1][*] 已经算好了」。外层 i、内层 w 正好满足。' },
    { t: '压缩空间：改成一维 dp[w]，w 必须<strong>倒序</strong>遍历', why: '倒序能保证用到的 dp[w-wt] 还是「上一轮」的值；正序的话它已经被本轮更新过，等于允许重复选同一个物品。' }
  ],

  pseudo: [
    '// 0-1 背包（二维）',
    'dp = (n+1) × (W+1) 的表格，全填 0',
    'for i = 1 .. n:',
    '    for w = 0 .. W:',
    '        dp[i][w] = dp[i-1][w]                       // 不选第 i 个',
    '        if w >= wt[i]:                              // 选第 i 个',
    '            dp[i][w] = max(dp[i][w], dp[i-1][w-wt[i]] + val[i])',
    'return dp[n][W]',
    '',
    '// 空间压缩（一维，容量必须倒序！）',
    'for i = 1 .. n:',
    '    for w = W down to wt[i]:                        // ← 倒序',
    '        dp[w] = max(dp[w], dp[w-wt[i]] + val[i])'
  ],

  anim: {
    fields: [
      { key: 'wt', kind: 'array', def: '[2,3,4,5]' },
      { key: 'val', kind: 'array', def: '[3,4,5,6]' },
      { key: 'W', kind: 'text', label: '背包容量 W', def: '8' }
    ],
    legend: [['active', '正在计算的格子'], ['key', '它依赖的格子'], ['done', '已填好的格子'], ['dim', '未填']],
    gen: function (v) {
      var wt = v.wt.slice(0, 5), val = v.val.slice(0, 5);
      var n = Math.min(wt.length, val.length);
      var W = Math.max(1, Math.min(10, parseInt(Number(v.W) || 8, 10)));
      var dp = []; for (var i = 0; i <= n; i++) dp.push(new Array(W + 1).fill(0));
      var steps = [], hl = {}, filled = [];
      function scene() {
        return {
          kind: 'grid', cellW: 42, cellH: 38, labelW: 62, labelH: 28,
          rowLabels: Array.from({ length: n + 1 }, function (_, i) { return i === 0 ? '无物品' : '前' + i + '个'; }),
          colLabels: Array.from({ length: W + 1 }, function (_, c) { return 'w=' + c; }),
          cells: dp.map(function (row, r) {
            return row.map(function (x, c) {
              var s = 'dim';
              if (hl.cur && hl.cur[0] === r && hl.cur[1] === c) s = 'active';
              else if (hl.dep && hl.dep.some(function (p) { return p[0] === r && p[1] === c; })) s = 'key';
              else if (filled.some(function (p) { return p[0] === r && p[1] === c; })) s = 'done';
              return { v: x, s: s };
            });
          }),
          caption: 'dp[i][w] = 只考虑前 i 个物品、容量 w 时的最大价值。重量 ' +
            JSON.stringify(wt.slice(0, n)) + '，价值 ' + JSON.stringify(val.slice(0, n))
        };
      }
      function push(line, log) {
        steps.push({ line: line, scenes: [scene()], log: log, vars: {} });
      }
      for (var c0 = 0; c0 <= W; c0++) filled.push([0, c0]);
      push(2, '初始化：没有物品时价值全为 0');
      for (var i = 1; i <= n; i++) {
        for (var w = 0; w <= W; w++) {
          hl = { cur: [i, w], dep: [[i - 1, w]] };
          push(4, 'dp[' + i + '][' + w + ']：先继承「不选第 ' + i + ' 个」= dp[' + (i - 1) + '][' + w + '] = ' + dp[i - 1][w]);
          dp[i][w] = dp[i - 1][w];
          if (w >= wt[i - 1]) {
            var cand = dp[i - 1][w - wt[i - 1]] + val[i - 1];
            hl = { cur: [i, w], dep: [[i - 1, w], [i - 1, w - wt[i - 1]]] };
            push(6, '容量 ' + w + ' ≥ 重量 ' + wt[i - 1] + ' → 也可以选：dp[' + (i - 1) + '][' + (w - wt[i - 1]) + '] + ' + val[i - 1] + ' = ' + cand);
            if (cand > dp[i][w]) { dp[i][w] = cand; push(6, '选更大！dp[' + i + '][' + w + '] = ' + cand); }
            else push(6, '不如不选，保持 ' + dp[i][w]);
          } else {
            push(6, '容量 ' + w + ' < 重量 ' + wt[i - 1] + ' → 装不下，只能不选');
          }
          filled.push([i, w]);
          hl = {};
        }
      }
      push(7, '答案 dp[' + n + '][' + W + '] = ' + dp[n][W]);
      return steps;
    }
  },

  run: {
    inputs: [
      { key: 'wt', label: '重量数组', def: '[2,3,4,5]' },
      { key: 'val', label: '价值数组', def: '[3,4,5,6]' },
      { key: 'W', label: '背包容量', def: '8' }
    ],
    code:
      'const wt = input.wt, val = input.val, W = Number(input.W), n = wt.length;\n' +
      '// 二维版\n' +
      'const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));\n' +
      'for (let i = 1; i <= n; i++)\n' +
      '  for (let w = 0; w <= W; w++) {\n' +
      '    dp[i][w] = dp[i - 1][w];\n' +
      '    if (w >= wt[i - 1]) dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - wt[i - 1]] + val[i - 1]);\n' +
      '  }\n' +
      'log("二维 dp 最后一行：", dp[n].join(","));\n' +
      '// 一维压缩版（容量必须倒序！）\n' +
      'const dp1 = new Array(W + 1).fill(0);\n' +
      'for (let i = 0; i < n; i++)\n' +
      '  for (let w = W; w >= wt[i]; w--)          // ← 倒序\n' +
      '    dp1[w] = Math.max(dp1[w], dp1[w - wt[i]] + val[i]);\n' +
      'log("一维 dp：", dp1.join(","));\n' +
      '// 对照：正序会变成「完全背包」（同一物品可重复选）\n' +
      'const dp2 = new Array(W + 1).fill(0);\n' +
      'for (let i = 0; i < n; i++)\n' +
      '  for (let w = wt[i]; w <= W; w++)          // 正序\n' +
      '    dp2[w] = Math.max(dp2[w], dp2[w - wt[i]] + val[i]);\n' +
      'return { "0-1背包答案": dp[n][W], 一维压缩: dp1[W], "正序(完全背包)": dp2[W],\n' +
      '         一致: dp[n][W] === dp1[W] };'
  },

  complexity: {
    best: 'O(nW)', avg: 'O(nW)', worst: 'O(nW)', space: 'O(nW) → 压缩后 O(W)', stable: '—',
    detail: [
      '时间 O(n × W)：两层循环各跑 n 和 W 次，每格 O(1)。注意这<strong>不是多项式复杂度</strong>——W 是数值而不是输入长度，所以背包问题是「伪多项式」的 NP 完全问题，W 很大时需要另想办法。',
      '空间从 O(nW) 压到 O(W)：因为 dp[i][*] 只依赖 dp[i-1][*]（滚动数组）。这是 DP 最常用的优化手段之一，代价是无法回溯出具体选了哪些物品（需要方案时得保留完整表）。'
    ],
    table: [
      ['问题', '状态定义', '转移', '复杂度'],
      ['爬楼梯', 'dp[i] = 到第 i 阶的走法', 'dp[i]=dp[i-1]+dp[i-2]', 'O(n) / O(1)'],
      ['0-1 背包', 'dp[i][w] = 前 i 个、容量 w 的最大价值', 'max(不选, 选)', 'O(nW) / O(W)'],
      ['最长公共子序列', 'dp[i][j] = 前 i、前 j 的 LCS 长度', '相等+1 / max(上,左)', 'O(nm) / O(m)'],
      ['最长递增子序列', 'dp[i] = 以 i 结尾的 LIS 长度', 'max(dp[j])+1', 'O(n²) / 可优化 O(n log n)']
    ]
  },

  quiz: [
    {
      q: '一个问题能用 DP 解决，必须具备什么？',
      options: ['只要能递归', '重叠子问题 + 最优子结构', '数据必须是数组', '必须用二维数组'],
      answer: 1,
      hint: '两个条件缺一不可：没有重叠子问题，记忆化就没意义（分治即可）；没有最优子结构，局部最优拼不出全局最优。',
      why: '这是 DP 的两大前提。'
    },
    {
      q: '0-1 背包做一维空间压缩时，容量 w 为什么要倒序遍历？',
      options: ['倒序更快', '保证用到的 dp[w-wt] 还是上一轮的旧值，避免同一物品被选多次', '因为数组下标从大到小', '倒序才能覆盖所有容量'],
      answer: 1,
      hint: '正序时，算 dp[w] 用到的 dp[w-wt] 可能已经在本轮被更新过（里面已经选过第 i 个物品了）——那就变成了「可以重复选」。',
      why: '倒序 = 0-1，正序 = 完全背包。'
    },
    {
      q: 'dp[i][w] 定义为「只考虑前 i 个物品、容量 w 时的最大价值」，那么 dp[0][5] 应该是？',
      options: ['5', '0', '第 5 个物品的价值', '不确定'],
      answer: 1,
      hint: '「前 0 个物品」就是一个都不考虑——不管容量多大，能装什么？',
      why: '没有物品，价值为 0。'
    },
    {
      q: '关于「自顶向下（记忆化）」与「自底向上（递推）」，正确的是？',
      options: [
        '自顶向下一定更快',
        '自底向上没有递归开销、不会爆栈，但要想清楚计算顺序',
        '两者递推顺序完全一样',
        '自底向上无法做记忆化'
      ],
      answer: 1,
      hint: '自底向上直接按依赖顺序填表；缺点是有时会算出一些根本用不到的状态，而记忆化只算需要的。',
      why: '各有取舍，常用自底向上。'
    }
  ],

  practice: [
    {
      title: '动手题 1 · 打家劫舍',
      desc: '一排房子，不能抢相邻的两家，求最大收益。请定义 dp[i] 并写出转移方程，再压缩到 O(1) 空间。',
      hint: 'dp[i] = 抢到第 i 家为止的最大收益。第 i 家要么不抢（= dp[i-1]），要么抢（= dp[i-2] + money[i]，因为 i-1 不能抢）。',
      solution:
        'function rob(m) {\n' +
        '  let prev2 = 0, prev1 = 0;             // dp[i-2], dp[i-1]\n' +
        '  for (const x of m) {\n' +
        '    const cur = Math.max(prev1, prev2 + x);\n' +
        '    prev2 = prev1; prev1 = cur;\n' +
        '  }\n' +
        '  return prev1;\n' +
        '}\n' +
        '// dp[i] = max(dp[i-1], dp[i-2] + money[i])\n' +
        '// 时间 O(n)，空间 O(1)'
    },
    {
      title: '动手题 2 · 零钱兑换（最少硬币数）',
      desc: '给定若干面额（每种无限个）和金额 amount，求凑出该金额所需的最少硬币数，凑不出返回 -1。',
      hint: 'dp[a] = 凑出金额 a 的最少硬币数。每种硬币可重复用 → 一维数组<strong>正序</strong>遍历。',
      solution:
        'function coinChange(coins, amount) {\n' +
        '  const INF = amount + 1;\n' +
        '  const dp = new Array(amount + 1).fill(INF);\n' +
        '  dp[0] = 0;                            // 边界：凑 0 元需要 0 枚\n' +
        '  for (let a = 1; a <= amount; a++)     // 外层金额\n' +
        '    for (const c of coins)\n' +
        '      if (a >= c) dp[a] = Math.min(dp[a], dp[a - c] + 1);\n' +
        '  return dp[amount] === INF ? -1 : dp[amount];\n' +
        '}\n' +
        '// 时间 O(amount × 硬币种类)，空间 O(amount)'
    }
  ]
});
