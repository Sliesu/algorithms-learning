/* 学习进度存储（localStorage，失败时降级为内存） */
(function (w) {
  var KEY = 'algo-kitchen-progress-v1';
  var mem = null;

  function blank() {
    return { done: {}, quiz: {}, last: '', visited: {}, updated: 0 };
  }

  function read() {
    if (mem) return mem;
    var raw = null;
    try { raw = w.localStorage.getItem(KEY); } catch (e) { raw = null; }
    if (raw) {
      try {
        mem = JSON.parse(raw);
        if (!mem || typeof mem !== 'object') mem = blank();
      } catch (e) { mem = blank(); }
    } else {
      mem = blank();
    }
    if (!mem.done) mem.done = {};
    if (!mem.quiz) mem.quiz = {};
    if (!mem.visited) mem.visited = {};
    return mem;
  }

  function write() {
    try { w.localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* 隐私模式等场景忽略 */ }
  }

  w.Store = {
    all: function () { return read(); },
    isDone: function (id) { return !!read().done[id]; },
    setDone: function (id, v) {
      var s = read();
      if (v) { s.done[id] = Date.now(); } else { delete s.done[id]; }
      s.updated = Date.now();
      write();
    },
    toggleDone: function (id) {
      var v = !this.isDone(id);
      this.setDone(id, v);
      return v;
    },
    visit: function (id) {
      var s = read();
      s.last = id;
      s.visited[id] = true;
      write();
    },
    getLast: function () { return read().last; },
    /* 测验记录：qid -> {ok:true/false, tries:n} */
    quizGet: function (lessonId) { return read().quiz[lessonId] || {}; },
    quizSet: function (lessonId, qid, ok, tries) {
      var s = read();
      if (!s.quiz[lessonId]) s.quiz[lessonId] = {};
      s.quiz[lessonId][qid] = { ok: ok, tries: tries };
      write();
    },
    clear: function () {
      mem = blank();
      try { w.localStorage.removeItem(KEY); } catch (e) { }
    },
    stats: function (lessons) {
      var s = read(), n = 0;
      for (var i = 0; i < lessons.length; i++) if (s.done[lessons[i].id]) n++;
      return { done: n, total: lessons.length };
    }
  };
})(window);
