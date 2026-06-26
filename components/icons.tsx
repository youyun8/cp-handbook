import { createElement } from 'react';
import {
  Backpack,
  BarChart3,
  Binary,
  BookOpen,
  Brain,
  Calculator,
  GitBranch,
  Grid3x3,
  Hash,
  Layers,
  Link2,
  type LucideIcon,
  MoveHorizontal,
  Mountain,
  Network,
  Route,
  Ruler,
  Search,
  Spline,
  TreeDeciduous,
  TreePine,
  Type,
  Undo2,
  Waves
} from 'lucide-react';

const topicIcons: Record<string, LucideIcon> = {
  'binary-search': Search,
  'graph-traversal': Network,
  intervals: Ruler,
  'heap-priority-queue': Mountain,
  'dp-fundamentals': Layers,
  'two-pointers': MoveHorizontal,
  dsu: Link2,
  'binary-lifting-lca': GitBranch,
  'monotonic-structure': BarChart3,
  'segment-tree-bit': TreePine,
  'shortest-path': Route,
  'minimum-spanning-tree': Spline,
  'tree-dp': TreeDeciduous,
  'string-algorithms': Type,
  'math-number-theory': Hash,
  'bitmask-dp': Binary,
  'computational-geometry': Grid3x3,
  greedy: Brain,
  backtracking: Undo2,
  'network-flow': Waves,
  'dynamic-programming': Layers,
  knapsack: Backpack,
  'number-theory': Calculator
};

export function getTopicIcon(topicId: string): LucideIcon {
  return topicIcons[topicId] ?? BookOpen;
}

export function TopicGlyph({ topicId, className }: { topicId: string; className?: string }) {
  return createElement(getTopicIcon(topicId), { className, 'aria-hidden': true });
}

export function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .5C5.73.5.5 5.73.5 12.02c0 5.1 3.29 9.42 7.86 10.95.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.69-3.87-1.54-3.87-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.67.8.56A11.53 11.53 0 0 0 23.5 12.02C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}
