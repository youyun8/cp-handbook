import topicsData from '@/data/topics.json';
import problemsData from '@/data/problems.json';
import subtopicsData from '@/data/subtopics.json';
import contestsData from '@/data/contests.json';
import type { Contest, Problem, Subtopic, Topic } from '@/lib/types';

export const topics = topicsData as Topic[];
export const problems = problemsData as Problem[];
export const subtopics = subtopicsData as Subtopic[];
export const contests = contestsData as Contest[];

export const topicById = new Map(topics.map((topic) => [topic.id, topic]));
export const problemById = new Map(problems.map((problem) => [problem.id, problem]));

export function getTopics() {
  return topics;
}

export function getProblems() {
  return problems;
}

export function getTopicBySlug(slug: string) {
  return topics.find((topic) => topic.slug === slug);
}

export function getProblemsByTopic(topicId: string) {
  return problems.filter((problem) => problem.topic_id === topicId);
}

export function getProblemsBySubtopic(subtopicId: string) {
  return problems.filter((problem) => problem.subtopic_ids?.includes(subtopicId));
}

export function getProblemsByStudyPlanSection(plan: string, sectionId: number) {
  return problems.filter((problem) =>
    problem.study_plan_refs?.some((ref) => ref.plan === plan && ref.section_id === sectionId)
  );
}

export function getPracticeProblemPool({
  topicId,
  subtopicId,
  studyPlan
}: {
  topicId?: string;
  subtopicId?: string;
  studyPlan?: string;
} = {}) {
  return problems.filter((problem) => {
    if (topicId && problem.topic_id !== topicId) return false;
    if (subtopicId && !problem.subtopic_ids?.includes(subtopicId)) return false;
    if (studyPlan && !problem.study_plan_refs?.some((ref) => ref.plan === studyPlan)) return false;
    return true;
  });
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

export function getSubtopics(): Subtopic[] {
  return subtopics;
}

export function getSubtopicsByParent(parentId: string): Subtopic[] {
  return subtopics.filter((s) => s.parent_id === parentId);
}

export function getSubtopicBySlug(parentSlug: string, subtopicSlug: string): Subtopic | undefined {
  const topicId = getTopicBySlug(parentSlug)?.id;
  if (!topicId) return undefined;
  return subtopics.find((s) => s.parent_id === topicId && s.slug === subtopicSlug);
}
