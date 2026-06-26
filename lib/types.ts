export type Source = 'leetcode' | 'codeforces' | 'luogu' | 'atcoder' | 'cses';

export type ProblemType = 'template' | 'classic' | 'insight_transfer';

export type Tier = 'warmup' | 'core' | 'challenge';

export type SubmissionStatus = 'AC' | 'WA' | 'TLE' | 'SKIP';

export interface ReferenceLink {
  label: string;
  url: string;
}

export interface SupplementalPattern {
  name: string;
  description: string;
}

export interface DeepDiveSection {
  title: string;
  body: string;
}

export interface Topic {
  id: string;
  title: string;
  slug: string;
  description: string;
  motivation?: string;
  core_idea: string;
  complexity: string;
  deep_dive?: DeepDiveSection[];
  reference_links: ReferenceLink[];
  template_code: string;
  supplemental_patterns: SupplementalPattern[];
  pitfalls?: string[];
  children?: string[];
}

export interface Problem {
  id: string;
  title: string;
  source: Source;
  source_id: string;
  frontend_id?: string;
  rating: number;
  solve_count?: number;
  tags: string[];
  topic_id: string;
  problem_type: ProblemType;
  tier: Tier;
  strategy_hints: string[];
  insight_note?: string;
  similar_problems: string[];
}

export interface PracticeProblem {
  title: string;
  source: Source;
  source_id: string;
  frontend_id?: string;
  rating?: number;
  tier?: Tier;
  tags?: string[];
}

export interface ProblemNote {
  solution: string;
  thought: string;
  language?: string;
  updatedAt: string;
}

export interface RatingBand {
  id: 'consolidate' | 'target' | 'stretch';
  label: string;
  min: number;
  max: number | null;
  description: string;
}

// Subtopic: a fully self-contained section within a parent topic
export interface Subtopic {
  id: string;           // e.g. "string-kmp", "string-suffix-array"
  parent_id: string;    // matches a Topic.id
  title: string;
  slug: string;         // URL: /handbook/[parent-slug]/[subtopic-slug]
  description: string;
  core_idea: string;
  complexity: string;
  deep_dive?: DeepDiveSection[];
  reference_links: ReferenceLink[];
  template_code: string;
  supplemental_patterns: SupplementalPattern[];
  pitfalls?: string[];
  practice_problems?: PracticeProblem[];
}

// GitHub OAuth User
export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  email: string | null;
}

// Submission log entry (shared shape used by the progress store and snapshots)
export interface SubmissionLogEntry {
  id: string;
  problemId: string;
  status: SubmissionStatus;
  createdAt: string;
}

// Sync-capable progress snapshot
export interface ProgressSnapshot {
  userId: number;             // GitHub user id
  login: string;
  currentRating: number;
  reviewedProblemIds: string[];
  coveredTopicIds: string[];
  submissions: SubmissionLogEntry[];
  practiceCompletionEvents?: { problemId: string; completedAt: string }[];
  problemNotes?: Record<string, ProblemNote>;
  completedPracticeProblemIds?: string[];
  updatedAt: string;          // ISO 8601
}
