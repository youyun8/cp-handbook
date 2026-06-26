'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Problem, Subtopic, Topic } from '@/lib/types';
import { hasPracticeNote, practiceProblemId } from '@/lib/practiceProgress';
import { useProgressStore } from '@/store/useProgressStore';

export function ProgressOverview({
  problems,
  topics,
  subtopics
}: {
  problems: Problem[];
  topics: Topic[];
  subtopics: Subtopic[];
}) {
  const reviewedProblemIds = useProgressStore((state) => state.reviewedProblemIds);
  const submissions = useProgressStore((state) => state.submissions);
  const contestSessions = useProgressStore((state) => state.contestSessions);
  const problemNotes = useProgressStore((state) => state.problemNotes);
  const completedPracticeProblemIds = useProgressStore((state) => state.completedPracticeProblemIds);

  const handbookTotals = useMemo(() => {
    const completedPracticeSet = new Set(completedPracticeProblemIds);
    const allPracticeProblems = subtopics.flatMap((subtopic) => subtopic.practice_problems ?? []);
    const completed = allPracticeProblems.filter((practiceProblem) => {
      const id = practiceProblemId(practiceProblem);
      return completedPracticeSet.has(id) || hasPracticeNote(problemNotes[id]);
    }).length;

    const coveredTopicIds = new Set<string>();
    for (const subtopic of subtopics) {
      const covered = (subtopic.practice_problems ?? []).some((practiceProblem) => {
        const id = practiceProblemId(practiceProblem);
        return completedPracticeSet.has(id) || hasPracticeNote(problemNotes[id]);
      });
      if (covered) coveredTopicIds.add(subtopic.parent_id);
    }

    return {
      completed,
      total: allPracticeProblems.length,
      percent:
        allPracticeProblems.length === 0 ? 0 : Math.round((completed / allPracticeProblems.length) * 100),
      coveredTopics: coveredTopicIds.size
    };
  }, [completedPracticeProblemIds, problemNotes, subtopics]);

  const performanceTotals = useMemo(() => {
    const problemById = new Map(problems.map((problem) => [problem.id, problem]));
    const coveredTopicIds = new Set(
      reviewedProblemIds
        .map((id) => problemById.get(id)?.topic_id)
        .filter((topicId): topicId is string => Boolean(topicId))
    );
    const acceptedCount = new Set(
      submissions.filter((submission) => submission.status === 'AC').map((submission) => submission.problemId)
    ).size;

    return {
      acceptedCount,
      coveredTopics: coveredTopicIds.size
    };
  }, [problems, reviewedProblemIds, submissions]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>手冊學習進度</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <OverviewMetric label="完成題目" value={`${handbookTotals.completed}/${handbookTotals.total}`} />
            <OverviewMetric label="覆蓋主題" value={`${handbookTotals.coveredTopics}/${topics.length}`} />
            <OverviewMetric label="完成率" value={`${handbookTotals.percent}%`} />
            <OverviewMetric
              label="筆記數"
              value={Object.entries(problemNotes)
                .filter(([id, note]) => id.startsWith('practice:') && hasPracticeNote(note))
                .length.toString()}
            />
          </div>
          <Link
            href="/progress/handbook"
            className="inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            查看手冊進度
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>實戰提交分析</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <OverviewMetric label="已複習題目" value={reviewedProblemIds.length.toString()} />
            <OverviewMetric label="AC 題目" value={performanceTotals.acceptedCount.toString()} />
            <OverviewMetric label="提交紀錄" value={submissions.length.toString()} />
            <OverviewMetric label="競賽場次" value={contestSessions.length.toString()} />
          </div>
          <Link
            href="/progress/performance"
            className="inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            查看實戰分析
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function OverviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/45 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
