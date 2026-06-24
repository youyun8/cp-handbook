export type Source = 'leetcode' | 'codeforces' | 'luogu' | 'atcoder';

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

export interface Topic {
  id: string;
  title: string;
  slug: string;
  description: string;
  core_idea: string;
  complexity: string;
  reference_links: ReferenceLink[];
  template_code: string;
  supplemental_patterns: SupplementalPattern[];
  children?: string[];
}

export interface Problem {
  id: string;
  title: string;
  source: Source;
  source_id: string;
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

export interface RatingBand {
  id: 'consolidate' | 'target' | 'stretch';
  label: string;
  min: number;
  max: number | null;
  description: string;
}
