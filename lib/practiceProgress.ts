import type { PracticeProblem } from '@/lib/types';

export function practiceProblemId(problem: PracticeProblem) {
  return `practice:${problem.source}:${problem.source_id}`;
}

export function hasPracticeNote(note?: { solution: string; thought: string }) {
  return Boolean(note && (note.solution.trim() || note.thought.trim()));
}
