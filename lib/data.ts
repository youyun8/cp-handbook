import topicsData from '@/data/topics.json';
import problemsData from '@/data/problems.json';
import type { Problem, Topic } from '@/lib/types';

export const topics = topicsData as Topic[];
export const problems = problemsData as Problem[];

export const topicById = new Map(topics.map((topic) => [topic.id, topic]));
export const problemById = new Map(problems.map((problem) => [problem.id, problem]));

export function getTopicBySlug(slug: string) {
  return topics.find((topic) => topic.slug === slug);
}

export function getProblemsByTopic(topicId: string) {
  return problems.filter((problem) => problem.topic_id === topicId);
}

export function getSimilarProblems(problem: Problem) {
  return problem.similar_problems
    .map((id) => problemById.get(id))
    .filter((item): item is Problem => Boolean(item));
}

export function getTopicCoverage(problemIds: string[]) {
  return new Set(
    problemIds
      .map((id) => problemById.get(id)?.topic_id)
      .filter((topicId): topicId is string => Boolean(topicId))
  );
}
