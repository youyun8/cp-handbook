// Import 灵茶山艾府 (0x3F) curated problem lists into the practice database.
//
//   node scripts/import-0x3f.mjs          # dry run, prints what would change
//   node scripts/import-0x3f.mjs --write  # merge new problems into problems.json
//
// Sources of truth (both machine-readable and reproducible):
//   list     -> EndlessCheng/codeforces-go leetcode/SOLUTIONS.md
//               a 知识点 (knowledge point) -> problem table, the same data that
//               backs 0x3F's "如何科学刷题" topic lists, sorted by difficulty.
//   ratings  -> zerotrac.github.io/leetcode_problem_rating/data.json
//               the numeric difficulty 0x3F sorts his lists by.
//
// Titles are localized Simplified -> Traditional (twp) via opencc-js, matching
// scripts/reconcile-titles.mjs. New problems are tagged "靈茶山艾府" so they can
// be filtered in the practice arena. Existing problems (matched by LeetCode
// slug) are never overwritten.
//
// Requires: opencc-js (already a devDependency).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as OpenCC from 'opencc-js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WRITE = process.argv.includes('--write');
const UA = 'Mozilla/5.0 (cp-handbook import-0x3f)';

const SOLUTIONS_URL =
  'https://raw.githubusercontent.com/EndlessCheng/codeforces-go/master/leetcode/SOLUTIONS.md';
const RATINGS_URL = 'https://zerotrac.github.io/leetcode_problem_rating/data.json';

const toTWraw = OpenCC.Converter({ from: 'cn', to: 'twp' });
const TW_FIXES = [[/擴充套件/g, '擴展']];
const toTW = (s) => TW_FIXES.reduce((acc, [re, rep]) => acc.replace(re, rep), toTWraw(s ?? ''));

// 0x3F knowledge point -> our topic id. Only confident mappings are kept; rows
// whose knowledge point has no good home (e.g. 哈希表, 链表, 二叉树) are skipped
// so the handbook's topic taxonomy stays coherent.
const KNOWLEDGE_TO_TOPIC = {
  滑动窗口: 'two-pointers',
  二分: 'binary-search',
  差分数组: 'intervals',
  单调栈: 'monotonic-structure',
  单调队列: 'monotonic-structure',
  '优先队列（堆）': 'heap-priority-queue',
  位运算: 'bitmask-dp',
  动态规划: 'dp-fundamentals',
  数学: 'math-number-theory',
  贪心: 'greedy',
  脑筋急转弯: 'greedy',
  构造: 'greedy',
  思维题: 'greedy',
  网格图: 'graph-traversal',
  '图 DFS': 'graph-traversal',
  基环树: 'graph-traversal',
  树: 'tree-dp',
  最短路: 'shortest-path',
  LCA: 'binary-lifting-lca',
  树状数组: 'segment-tree-bit'
};

// Difficulty label -> representative rating, used only when a problem is not in
// the zerotrac rating set (i.e. non-contest classics).
const LABEL_RATING = { 简单: 1200, 中等: 1600, 困难: 2200 };

// 0x3F's official "如何科学刷题" roadmap (算法题单) discussion threads, attached
// to each matching topic's reference_links. Idempotent: skipped if already present.
const ROADMAP_LINKS = {
  'two-pointers': {
    label: '靈茶山艾府：滑動視窗與雙指針題單',
    url: 'https://leetcode.cn/circle/discuss/0viNMK/'
  },
  'binary-search': { label: '靈茶山艾府：二分演算法題單', url: 'https://leetcode.cn/circle/discuss/SqopEo/' },
  'monotonic-structure': {
    label: '靈茶山艾府：單調棧題單',
    url: 'https://leetcode.cn/circle/discuss/9oZFK9/'
  },
  'graph-traversal': { label: '靈茶山艾府：網格圖題單', url: 'https://leetcode.cn/circle/discuss/YiXPXW/' },
  'bitmask-dp': { label: '靈茶山艾府：位運算題單', url: 'https://leetcode.cn/circle/discuss/dHn9Vk/' },
  'shortest-path': { label: '靈茶山艾府：圖論演算法題單', url: 'https://leetcode.cn/circle/discuss/01LUak/' },
  'dp-fundamentals': { label: '靈茶山艾府：動態規劃題單', url: 'https://leetcode.cn/circle/discuss/tXLS3i/' },
  'segment-tree-bit': {
    label: '靈茶山艾府：常用資料結構題單',
    url: 'https://leetcode.cn/circle/discuss/mOr1u6/'
  },
  'math-number-theory': {
    label: '靈茶山艾府：數學演算法題單',
    url: 'https://leetcode.cn/circle/discuss/IYT3ss/'
  },
  greedy: { label: '靈茶山艾府：貪心與思維題單', url: 'https://leetcode.cn/circle/discuss/g6KTKL/' },
  'tree-dp': {
    label: '靈茶山艾府：鏈表、二叉樹與回溯題單',
    url: 'https://leetcode.cn/circle/discuss/K0n2gO/'
  },
  'string-algorithms': { label: '靈茶山艾府：字串題單', url: 'https://leetcode.cn/circle/discuss/SJFwQI/' },
  backtracking: {
    label: '靈茶山艾府：鏈表、二叉樹與回溯題單',
    url: 'https://leetcode.cn/circle/discuss/K0n2gO/'
  }
};

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`GET ${url} -> HTTP ${res.status}`);
  return res.text();
}

function tierForRating(rating) {
  if (rating < 1500) return 'warmup';
  if (rating < 2000) return 'core';
  return 'challenge';
}

// Parse SOLUTIONS.md: forward-fill the knowledge point column, pull the LeetCode
// slug + frontend id + Chinese title + difficulty cell from each row.
function parseSolutions(md) {
  const rows = [];
  let knowledge = '';
  for (const line of md.split('\n')) {
    if (!line.startsWith('|') || line.startsWith('|---') || line.startsWith('|知识点')) continue;
    const cells = line.split('|').slice(1, -1);
    if (cells.length < 4) continue;
    const kp = cells[0].trim();
    if (kp) knowledge = kp;

    const link = cells[1].trim();
    const m = link.match(/\[\s*(\d+)\.\s*(.+?)\]\(https:\/\/leetcode\.cn\/problems\/([a-z0-9-]+)\/?[^)]*\)/i);
    if (!m) continue;
    rows.push({
      knowledge,
      frontendId: m[1],
      titleZH: m[2].trim(),
      slug: m[3],
      difficulty: cells[3].trim()
    });
  }
  return rows;
}

async function main() {
  const problemsPath = path.join(ROOT, 'data', 'problems.json');
  const problems = JSON.parse(fs.readFileSync(problemsPath, 'utf8'));
  const existingSlugs = new Set(problems.filter((p) => p.source === 'leetcode').map((p) => p.source_id));
  const existingIds = new Set(problems.map((p) => p.id));

  const [md, ratingsJson] = await Promise.all([fetchText(SOLUTIONS_URL), fetchText(RATINGS_URL)]);
  const ratingBySlug = new Map(JSON.parse(ratingsJson).map((r) => [r.TitleSlug, r.Rating]));

  const rows = parseSolutions(md);
  const added = [];
  const seen = new Set();
  const skipped = { unmappedKnowledge: 0, duplicate: 0 };

  for (const row of rows) {
    const topicId = KNOWLEDGE_TO_TOPIC[row.knowledge];
    if (!topicId) {
      skipped.unmappedKnowledge++;
      continue;
    }
    if (existingSlugs.has(row.slug) || seen.has(row.slug)) {
      skipped.duplicate++;
      continue;
    }
    seen.add(row.slug);

    let rating = ratingBySlug.get(row.slug);
    if (rating == null) {
      const numeric = Number(row.difficulty);
      rating = Number.isFinite(numeric) && numeric > 0 ? numeric : (LABEL_RATING[row.difficulty] ?? 1600);
    }
    rating = Math.round(rating);

    let id = `lc0x3f-${row.frontendId}`;
    while (existingIds.has(id)) id = `${id}-b`;
    existingIds.add(id);

    const knowledgeTW = toTW(row.knowledge);
    added.push({
      id,
      title: toTW(row.titleZH),
      source: 'leetcode',
      source_id: row.slug,
      frontend_id: row.frontendId,
      rating,
      tags: Array.from(new Set([knowledgeTW, '靈茶山艾府'])),
      topic_id: topicId,
      problem_type: 'classic',
      tier: tierForRating(rating),
      strategy_hints: [`靈茶山艾府《如何科學刷題》${knowledgeTW}題單精選，依難度分排序練習。`],
      similar_problems: []
    });
  }

  const byTopic = {};
  for (const p of added) byTopic[p.topic_id] = (byTopic[p.topic_id] ?? 0) + 1;

  console.log(`parsed rows:         ${rows.length}`);
  console.log(`skipped (no topic):  ${skipped.unmappedKnowledge}`);
  console.log(`skipped (duplicate): ${skipped.duplicate}`);
  console.log(`new problems:        ${added.length}`);
  console.log('per topic:');
  for (const [topic, count] of Object.entries(byTopic).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(3)}  ${topic}`);
  }

  if (!WRITE) {
    console.log('\ndry run — pass --write to merge into data/problems.json');
    return;
  }

  const merged = [...problems, ...added];
  fs.writeFileSync(problemsPath, `${JSON.stringify(merged, null, 2)}\n`);
  console.log(`\nwrote ${merged.length} problems to data/problems.json`);

  // Attach 0x3F roadmap links to the matching topics (idempotent).
  const topicsPath = path.join(ROOT, 'data', 'topics.json');
  const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
  let linkedTopics = 0;
  for (const topic of topics) {
    const link = ROADMAP_LINKS[topic.id];
    if (!link) continue;
    topic.reference_links = topic.reference_links ?? [];
    if (topic.reference_links.some((l) => l.url === link.url)) continue;
    topic.reference_links.push({ label: link.label, url: link.url });
    linkedTopics++;
  }
  fs.writeFileSync(topicsPath, `${JSON.stringify(topics, null, 2)}\n`);
  console.log(`linked 0x3F roadmap into ${linkedTopics} topics`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
