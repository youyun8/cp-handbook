import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
}

function fail(errors) {
  for (const error of errors) console.error(`- ${error}`);
  process.exit(errors.length > 0 ? 1 : 0);
}

const topics = readJson('data/topics.json');
const subtopics = readJson('data/subtopics.json');
const problems = readJson('data/problems.json');

const errors = [];
const topicIds = new Set(topics.map((topic) => topic.id));
const topicSlugs = new Set();
const subtopicIds = new Set(subtopics.map((subtopic) => subtopic.id));
const subtopicRoutes = new Set();
const problemIds = new Set();
const leetcodeSlugs = new Map();

for (const topic of topics) {
  if (topicSlugs.has(topic.slug)) errors.push(`duplicate topic slug: ${topic.slug}`);
  topicSlugs.add(topic.slug);
  for (const childId of topic.children ?? []) {
    if (!subtopicIds.has(childId)) errors.push(`${topic.id} references missing subtopic ${childId}`);
  }
}

for (const subtopic of subtopics) {
  if (!topicIds.has(subtopic.parent_id)) {
    errors.push(`${subtopic.id} has missing parent topic ${subtopic.parent_id}`);
  }
  const route = `${subtopic.parent_id}/${subtopic.slug}`;
  if (subtopicRoutes.has(route)) errors.push(`duplicate subtopic route: ${route}`);
  subtopicRoutes.add(route);
  for (const problemId of subtopic.problem_ids ?? []) {
    if (!problems.some((problem) => problem.id === problemId)) {
      errors.push(`${subtopic.id} references missing problem ${problemId}`);
    }
  }
}

for (const problem of problems) {
  if (problemIds.has(problem.id)) errors.push(`duplicate problem id: ${problem.id}`);
  problemIds.add(problem.id);
  if (!topicIds.has(problem.topic_id)) errors.push(`${problem.id} has missing topic ${problem.topic_id}`);
  for (const subtopicId of problem.subtopic_ids ?? []) {
    if (!subtopicIds.has(subtopicId)) errors.push(`${problem.id} has missing subtopic ${subtopicId}`);
  }
  if (problem.source === 'leetcode') {
    const existing = leetcodeSlugs.get(problem.source_id);
    if (existing) {
      errors.push(`duplicate LeetCode slug ${problem.source_id}: ${existing}, ${problem.id}`);
    } else {
      leetcodeSlugs.set(problem.source_id, problem.id);
    }
  }
}

if (errors.length === 0) {
  console.log(
    `data ok: ${topics.length} topics, ${subtopics.length} subtopics, ${problems.length} problems, ${leetcodeSlugs.size} LeetCode slugs`
  );
}

fail(errors);
