'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ProblemType, SubmissionStatus } from '@/lib/types';

export type CompletionFilter = 'all' | 'reviewed' | 'unreviewed' | 'accepted';
export type RatingBandId = 'consolidate' | 'target' | 'stretch';

export interface PracticeFilters {
  tag: string;
  minRating: number;
  maxRating: number | null;
  problemType: ProblemType | 'all';
  completion: CompletionFilter;
  band: RatingBandId;
}

export interface SubmissionLog {
  id: string;
  problemId: string;
  status: SubmissionStatus;
  createdAt: string;
}

export interface ReviewEvent {
  problemId: string;
  reviewedAt: string;
}

export interface ActiveContestSession {
  id: string;
  problemIds: string[];
  durationMinutes: number;
  startedAt: string;
}

export interface ContestSessionRecord extends ActiveContestSession {
  endedAt: string;
}

interface ProgressState {
  currentRating: number;
  reviewedProblemIds: string[];
  coveredTopicIds: string[];
  submissions: SubmissionLog[];
  reviewEvents: ReviewEvent[];
  contestSessions: ContestSessionRecord[];
  activeContest?: ActiveContestSession;
  filters: PracticeFilters;
  setCurrentRating: (rating: number) => void;
  setFilters: (filters: Partial<PracticeFilters>) => void;
  markReviewed: (problemId: string, topicId?: string) => void;
  logSubmission: (problemId: string, status: SubmissionStatus, topicId?: string) => void;
  startContest: (problemIds: string[], durationMinutes: number) => void;
  endContest: () => void;
  syncToCloud: () => Promise<{ ok: boolean; error?: string }>;
  loadFromCloud: () => Promise<{ ok: boolean; error?: string }>;
}

const defaultFilters: PracticeFilters = {
  tag: 'all',
  minRating: 1800,
  maxRating: 2000,
  problemType: 'all',
  completion: 'all',
  band: 'target'
};

function uniqueAppend(items: string[], item: string) {
  return items.includes(item) ? items : [...items, item];
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      currentRating: 1800,
      reviewedProblemIds: [],
      coveredTopicIds: [],
      submissions: [],
      reviewEvents: [],
      contestSessions: [],
      filters: defaultFilters,
      setCurrentRating: (rating) => set({ currentRating: rating }),
      setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
      markReviewed: (problemId, topicId) =>
        set((state) => {
          const alreadyReviewed = state.reviewedProblemIds.includes(problemId);
          return {
            reviewedProblemIds: uniqueAppend(state.reviewedProblemIds, problemId),
            coveredTopicIds: topicId ? uniqueAppend(state.coveredTopicIds, topicId) : state.coveredTopicIds,
            reviewEvents: alreadyReviewed
              ? state.reviewEvents
              : [...state.reviewEvents, { problemId, reviewedAt: new Date().toISOString() }]
          };
        }),
      logSubmission: (problemId, status, topicId) => {
        const submission: SubmissionLog = {
          id: createId('submission'),
          problemId,
          status,
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          submissions: [submission, ...state.submissions].slice(0, 200),
          coveredTopicIds: topicId ? uniqueAppend(state.coveredTopicIds, topicId) : state.coveredTopicIds
        }));

        if (status === 'AC') {
          get().markReviewed(problemId, topicId);
        }
      },
      startContest: (problemIds, durationMinutes) =>
        set({
          activeContest: {
            id: createId('contest'),
            problemIds,
            durationMinutes,
            startedAt: new Date().toISOString()
          }
        }),
      endContest: () =>
        set((state) => {
          if (!state.activeContest) return state;
          return {
            activeContest: undefined,
            contestSessions: [
              { ...state.activeContest, endedAt: new Date().toISOString() },
              ...state.contestSessions
            ].slice(0, 50)
          };
        }),
      syncToCloud: async () => {
        const state = get();
        const payload = {
          currentRating: state.currentRating,
          reviewedProblemIds: state.reviewedProblemIds,
          coveredTopicIds: state.coveredTopicIds,
          submissions: state.submissions.slice(0, 50) // Limit size
        };
        const res = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        return json.ok ? { ok: true } : { ok: false, error: json.error };
      },
      loadFromCloud: async () => {
        const res = await fetch('/api/progress');
        const json = await res.json();
        if (!json.data) return { ok: true }; // No saved data yet
        const data = json.data;
        set({
          currentRating: data.currentRating ?? 1800,
          reviewedProblemIds: data.reviewedProblemIds ?? [],
          coveredTopicIds: data.coveredTopicIds ?? [],
          submissions: data.submissions ?? []
        });
        return { ok: true };
      }
    }),
    {
      name: 'cp-handbook-progress',
      storage: createJSONStorage(() => localStorage),
      version: 1
    }
  )
);
