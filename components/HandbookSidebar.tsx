'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Subtopic, Topic } from '@/lib/types';
import { cn, topicIcon } from '@/lib/utils';

interface HandbookSidebarProps {
  topics: Topic[];
  subtopics: Subtopic[];
  activeTopicSlug: string;
  activeSubtopicSlug?: string;
  anchors?: { id: string; label: string }[];
}

export function HandbookSidebar({
  topics,
  subtopics,
  activeTopicSlug,
  activeSubtopicSlug,
  anchors = []
}: HandbookSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'transition-all duration-200',
        collapsed ? 'w-10' : 'w-64 lg:w-72'
      )}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mb-2 flex w-full items-center justify-between rounded-xl border border-border bg-card/75 px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent"
        aria-label={collapsed ? '展開側欄' : '收合側欄'}
      >
        {!collapsed && <span>主題導覽</span>}
        <span>{collapsed ? '▶' : '◀'}</span>
      </button>

      {!collapsed && (
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-3xl border border-border bg-card/75 p-3 scrollbar-thin">
          {/* Topics list */}
          <nav className="space-y-0.5">
            {topics.map((topic) => {
              const isActiveTopic = activeTopicSlug === topic.slug;
              const children = subtopics.filter((s) => s.parent_id === topic.id);

              return (
                <div key={topic.id}>
                  <Link
                    href={`/handbook/${topic.slug}`}
                    aria-current={isActiveTopic && !activeSubtopicSlug ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border-l-2 px-3 py-2 text-sm transition',
                      isActiveTopic
                        ? 'border-blue-500 bg-primary/15 font-semibold text-primary'
                        : 'border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <span className="shrink-0 text-base" aria-hidden>{topicIcon(topic.id)}</span>
                    <span className="truncate">{topic.title}</span>
                  </Link>

                  {/* Subtopics (shown when parent is active) */}
                  {isActiveTopic && children.length > 0 && (
                    <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-2">
                      {children.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/handbook/${topic.slug}/${sub.slug}`}
                          aria-current={activeSubtopicSlug === sub.slug ? 'page' : undefined}
                          className={cn(
                            'block truncate rounded-lg px-2 py-1.5 text-xs transition',
                            activeSubtopicSlug === sub.slug
                              ? 'bg-primary/10 font-semibold text-primary'
                              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                          )}
                        >
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* On This Page anchors */}
          {anchors.length > 0 && (
            <div className="mt-4 border-t border-border pt-3">
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                本頁內容
              </p>
              <nav className="space-y-0.5">
                {anchors.map((anchor) => (
                  <a
                    key={anchor.id}
                    href={`#${anchor.id}`}
                    className="block truncate rounded-lg px-2 py-1 text-xs text-muted-foreground transition hover:text-foreground"
                  >
                    {anchor.label}
                  </a>
                ))}
              </nav>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
