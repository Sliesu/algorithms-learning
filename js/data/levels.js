/* 分级定义与课程注册表 */
window.LEVELS = [
  {
    id: 'beginner', name: '入门篇 · 建立直觉', badge: '入', color: '#22c55e',
    desc: '不需要任何基础。先搞懂「算法是什么」「怎么衡量快慢」，再掌握查找、排序和递归的直觉。'
  },
  {
    id: 'intermediate', name: '基础篇 · 常用工具', badge: '基', color: '#4f46e5',
    desc: '分治、链表、栈队列、哈希表、回溯——面试与工程里最高频的一批工具，学会「什么时候该用谁」。'
  },
  {
    id: 'advanced', name: '进阶篇 · 硬核专题', badge: '进', color: '#f97316',
    desc: '动态规划、贪心、图论、字符串匹配。难度上来了，但每个都有可复用的套路，跟着动画一步步拆。'
  }
];

window.LESSONS = [];
window.L = function (lesson) {
  /* 规范化字段，缺失项补默认值 */
  lesson.prereq = lesson.prereq || [];
  lesson.tags = lesson.tags || [];
  lesson.steps = lesson.steps || [];
  lesson.quiz = lesson.quiz || [];
  lesson.practice = lesson.practice || [];
  lesson.pseudo = lesson.pseudo || [];
  window.LESSONS.push(lesson);
  return lesson;
};
window.lessonById = function (id) {
  for (var i = 0; i < window.LESSONS.length; i++) if (window.LESSONS[i].id === id) return window.LESSONS[i];
  return null;
};
