// Title reconciliation: align every problem title in the database with its
// official source of truth.
//
//   node scripts/reconcile-titles.mjs          # dry run, writes a report only
//   node scripts/reconcile-titles.mjs --write  # apply canonical titles in place
//   node scripts/reconcile-titles.mjs --check  # CI drift gate, exit 1 if any
//                                                drift or dead id is found
//
// Sources & canonical title:
//   leetcode   -> leetcode.cn GraphQL translatedTitle (Simplified) -> OpenCC s2twp
//                 falls back to leetcode.com English title when no CN translation
//   codeforces -> api/problemset.problems  (one bulk call, English name)
//   atcoder    -> task page <title> "X - Name" (English)
//   luogu      -> lentille content-only JSON data.problem.name (Simplified) -> twp
//   cses       -> task page <title> "CSES - Name" (English)
//
// Requires: opencc-js (npm i -D opencc-js)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as OpenCC from 'opencc-js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WRITE = process.argv.includes('--write');
const CHECK = process.argv.includes('--check');
const UA = 'Mozilla/5.0 (cp-handbook title-reconcile)';
const toTWraw = OpenCC.Converter({ from: 'cn', to: 'twp' });
// s2twp over-localizes a few IT phrases in a math/algorithm context.
const TW_FIXES = [[/擴充套件/g, '擴展']];
const toTW = (s) => TW_FIXES.reduce((acc, [re, rep]) => acc.replace(re, rep), toTWraw(s));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) => (s ?? '').replace(/\s+/g, ' ').trim();

async function fetchRetry(url, opts = {}, tries = 4) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { ...opts, headers: { 'User-Agent': UA, ...(opts.headers || {}) } });
      if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (e) {
      lastErr = e;
      await sleep(500 * (i + 1));
    }
  }
  throw lastErr;
}

// ---- per-source canonical title fetchers --------------------------------

let cfMap = null;
async function loadCodeforces() {
  if (cfMap) return cfMap;
  cfMap = new Map();
  const res = await fetchRetry('https://codeforces.com/api/problemset.problems');
  const json = await res.json();
  if (json.status !== 'OK') throw new Error('codeforces api status ' + json.status);
  for (const p of json.result.problems) cfMap.set(`${p.contestId}${p.index}`, p.name);
  return cfMap;
}

const cfContestTried = new Set();
async function loadCfContest(contestId) {
  if (cfContestTried.has(contestId)) return;
  cfContestTried.add(contestId);
  // Anonymous GET, no extra params (CF API requirement for non-gym standings).
  const res = await fetchRetry(`https://codeforces.com/api/contest.standings?contestId=${contestId}`);
  const json = await res.json().catch(() => ({}));
  if (json.status === 'OK') {
    for (const p of json.result.problems) cfMap.set(`${contestId}${p.index}`, p.name);
  }
  await sleep(250);
}

async function titleCodeforces(id) {
  const map = await loadCodeforces();
  let name = map.get(id);
  if (!name) {
    // Some valid problems are absent from the bulk problemset feed; fall back
    // to that problem's contest standings.
    const m = id.match(/^(\d+)([A-Za-z]\d*)$/);
    if (m) { await loadCfContest(m[1]); name = map.get(id); }
  }
  return name ? { title: norm(name), raw: name } : { error: 'id not found in problemset' };
}

async function titleLeetcode(slug) {
  const body = (q) => JSON.stringify({
    query: `query q($t:String!){question(titleSlug:$t){questionFrontendId title translatedTitle}}`,
    variables: { t: slug },
  });
  const res = await fetchRetry('https://leetcode.cn/graphql/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.cn' },
    body: body(),
  });
  const json = await res.json();
  const q = json?.data?.question;
  if (!q) return { error: 'slug not found' };
  const cn = q.translatedTitle && q.translatedTitle.trim();
  const title = cn ? norm(toTW(cn)) : norm(q.title);
  return { title, raw: cn || q.title, en: q.title, id: q.questionFrontendId };
}

async function titleAtcoder(id) {
  const contest = id.split('_')[0];
  const res = await fetchRetry(`https://atcoder.jp/contests/${contest}/tasks/${id}`);
  if (res.status === 404) return { error: 'task 404' };
  const html = await res.text();
  const m = html.match(/<title>([^<]*)<\/title>/i);
  if (!m) return { error: 'no title tag' };
  // "B - Frog 2 - AtCoder" / "B - Frog 2"
  let t = m[1].replace(/\s*-\s*AtCoder.*$/i, '').trim();
  t = t.replace(/^[A-Za-z0-9]+\s*-\s*/, ''); // strip leading task letter
  return { title: norm(t), raw: m[1] };
}

async function titleLuogu(id) {
  const res = await fetchRetry(`https://www.luogu.com.cn/problem/${id}`, {
    headers: { Accept: 'application/json', 'x-lentille-request': 'content-only' },
  });
  const json = await res.json();
  const name = json?.data?.problem?.name;
  if (!name) return { error: 'no problem name' };
  return { title: norm(toTW(name)), raw: name };
}

async function titleCses(id) {
  const res = await fetchRetry(`https://cses.fi/problemset/task/${id}`);
  if (res.status === 404) return { error: 'task 404' };
  const html = await res.text();
  const m = html.match(/<title>([^<]*)<\/title>/i);
  if (!m) return { error: 'no title tag' };
  const t = m[1].replace(/^CSES\s*-\s*/i, '').trim();
  return { title: norm(t), raw: m[1] };
}

const FETCHERS = {
  codeforces: titleCodeforces,
  leetcode: titleLeetcode,
  atcoder: titleAtcoder,
  luogu: titleLuogu,
  cses: titleCses,
};

// ---- collect references -------------------------------------------------

const problemsPath = path.join(ROOT, 'data/problems.json');
const subtopicsPath = path.join(ROOT, 'data/subtopics.json');
const problems = JSON.parse(fs.readFileSync(problemsPath, 'utf8'));
const subtopics = JSON.parse(fs.readFileSync(subtopicsPath, 'utf8'));

const refs = []; // { source, source_id, get(), set(title), where }
for (const p of problems) {
  refs.push({ source: p.source, source_id: p.source_id, where: `problems.json#${p.id}`,
    get: () => p.title, set: (t) => { p.title = t; } });
}
for (const s of subtopics) {
  for (const pp of s.practice_problems || []) {
    refs.push({ source: pp.source, source_id: pp.source_id, where: `${s.id}/${pp.source_id}`,
      get: () => pp.title, set: (t) => { pp.title = t; } });
  }
}

// ---- reconcile ----------------------------------------------------------

const cache = new Map(); // source|id -> result
const SLEEP = { leetcode: 220, atcoder: 150, luogu: 180, cses: 120, codeforces: 0 };

async function resolve(source, id) {
  const key = `${source}|${id}`;
  if (cache.has(key)) return cache.get(key);
  let r;
  try {
    const fn = FETCHERS[source];
    r = fn ? await fn(id) : { error: `unknown source ${source}` };
  } catch (e) {
    r = { error: String(e.message || e) };
  }
  cache.set(key, r);
  if (SLEEP[source]) await sleep(SLEEP[source]);
  return r;
}

const report = { changed: [], unchanged: 0, errors: [] };
let done = 0;
for (const ref of refs) {
  const r = await resolve(ref.source, ref.source_id);
  done++;
  if (r.error) {
    report.errors.push({ where: ref.where, source: ref.source, source_id: ref.source_id, old: ref.get(), error: r.error });
  } else {
    const old = norm(ref.get());
    if (old !== r.title) {
      report.changed.push({ where: ref.where, source: ref.source, source_id: ref.source_id, old: ref.get(), new: r.title });
      if (WRITE) ref.set(r.title);
    } else {
      report.unchanged++;
    }
  }
  if (done % 25 === 0) process.stderr.write(`  ...${done}/${refs.length}\n`);
}

// ---- output -------------------------------------------------------------

const reportPath = path.join(ROOT, '.subtopic-gen/title-recon-report.json');
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');

if (WRITE) {
  fs.writeFileSync(problemsPath, JSON.stringify(problems, null, 2) + '\n');
  fs.writeFileSync(subtopicsPath, JSON.stringify(subtopics, null, 2) + '\n');
}

console.log('\n=== Title reconciliation ===');
console.log(`refs scanned : ${refs.length}  (unique fetches: ${cache.size})`);
console.log(`unchanged    : ${report.unchanged}`);
console.log(`changed      : ${report.changed.length}${WRITE ? ' (written)' : ' (dry run)'}`);
console.log(`errors       : ${report.errors.length}`);
console.log(`report       : ${path.relative(ROOT, reportPath)}`);
if (report.errors.length) {
  console.log('\n-- errors (likely bad / dead ids) --');
  for (const e of report.errors) console.log(`  [${e.source} ${e.source_id}] ${e.where}: ${e.error}  (was "${e.old}")`);
}
if (!WRITE && report.changed.length) {
  console.log('\n-- first 40 proposed changes --');
  for (const c of report.changed.slice(0, 40)) console.log(`  [${c.source} ${c.source_id}] "${c.old}" -> "${c.new}"`);
}

if (CHECK && (report.changed.length || report.errors.length)) {
  console.error(`\n✗ title drift detected: ${report.changed.length} out of sync, ${report.errors.length} unresolved id(s).`);
  console.error('  Run `npm run reconcile:titles:write` to realign, then review the diff.');
  process.exit(1);
}
