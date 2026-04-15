import React, { useCallback, useEffect, useState } from 'react';
import { Card, Button, PageSpinner, EmptyState, ErrorState } from '../components/UI';
import {
  BookOpen,
  CheckCircle2,
  CircleDot,
  Clock,
  Lock,
  Sparkles,
} from 'lucide-react';

import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface RoadmapTopic {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'locked';
  progress: number;
  description: string;
  difficulty?: string;
  estMinutes?: number;
  stressful?: boolean;
}

interface RoadmapSubtopicSection {
  title: string;
  items: string[];
}

const TOPIC_SUBTOPICS: Record<string, RoadmapSubtopicSection[]> = {
  top1: [
    {
      title: 'Core Concepts',
      items: [
        'Variables and constants',
        'Algebraic expressions',
        'Terms, coefficients, factors',
      ],
    },
    {
      title: 'Operations',
      items: [
        'Addition & subtraction of algebraic expressions',
        'Multiplication of expressions',
        'Division of expressions',
      ],
    },
    {
      title: 'Identities & Simplification',
      items: [
        'Basic algebraic identities',
        'Expanding brackets',
        'Simplifying expressions',
      ],
    },
    {
      title: 'Equations Intro',
      items: [
        'Simple equations (one-step)',
        'Translating words into algebra',
      ],
    },
  ],
  top2: [
    {
      title: 'Fundamentals',
      items: [
        'What is a linear equation',
        'Standard form (ax + b = 0)',
      ],
    },
    {
      title: 'Solving Equations',
      items: [
        'One-variable equations',
        'Equations with variables on both sides',
        'Fractions and brackets in equations',
      ],
    },
    {
      title: 'Word Problems',
      items: [
        'Translating real-life problems',
        'Age, speed, and number problems',
      ],
    },
    {
      title: 'Graphing',
      items: [
        'Coordinate plane basics',
        'Plotting points',
        'Graph of a linear equation',
      ],
    },
  ],
  top3: [
    {
      title: 'Basics',
      items: [
        'What is a quadratic equation (ax² + bx + c = 0)',
        'Standard form',
      ],
    },
    {
      title: 'Methods of Solving',
      items: [
        'Factorization method',
        'Completing the square',
        'Quadratic formula',
      ],
    },
    {
      title: 'Nature of Roots',
      items: [
        'Discriminant (b² − 4ac)',
        'Real and complex roots',
      ],
    },
  ],
};

const statusMeta = {
  locked: { label: 'Locked', Icon: Lock, chip: 'bg-gray-100 text-gray-500 border-gray-200' },
  current: {
    label: 'In Progress',
    Icon: CircleDot,
    chip: 'bg-violet-100 text-violet-700 border-violet-200 shadow-[0_0_8px_rgba(139,92,246,0.3)]',
  },
  completed: {
    label: 'Completed',
    Icon: CheckCircle2,
    chip: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
};

const diffColor: Record<string, string> = {
  Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Hard: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const StudentRoadmap = () => {
  const [roadmap, setRoadmap] = useState<RoadmapTopic[]>([]);
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    fetch('/api/students/me/roadmap', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) throw new Error('Unauthorized');
        if (!res.ok) throw new Error('roadmap');
        return res.json();
      })
      .then((data) => {
        setRoadmap(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.log("ROADMAP ERROR:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <PageSpinner label="Loading your roadmap…" />;

  if (error) {
    return (
      <ErrorState
        title="Failed to load roadmap"
        hint="We couldn’t reach your learning path."
        onRetry={load}
      />
    );
  }

  if (!roadmap.length) {
    return (
      <div className="max-w-lg mx-auto py-12 space-y-6">
        <h1 className="text-3xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">Your learning path</h1>
        <EmptyState
          title="No roadmap yet"
          hint="Topics will appear here once your teacher publishes your class sequence."
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-violet-100 rounded-full mb-2 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
          <BookOpen className="text-violet-600 animate-pulse" size={32} />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-violet-500">
          Learning Core
        </p>
        <h1 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 drop-shadow-sm pb-2">
          Your Mastery Path
        </h1>
        <p className="font-bold text-gray-500 max-w-lg mx-auto text-base leading-relaxed">
          Embark on your journey. Complete each node to unlock new concepts, build your foundation, and master the curriculum.
        </p>
      </div>

      <div className="relative pl-6 sm:pl-0 mt-12">
        {/* Dynamic Glowing Progress Line */}
        <div className="absolute left-[39px] sm:left-1/2 top-10 bottom-10 w-1 sm:-translate-x-1/2 rounded-full hidden sm:block overflow-hidden bg-gray-100" aria-hidden>
          <div className="w-full h-full bg-gradient-to-b from-emerald-400 via-violet-500 to-transparent opacity-80" />
        </div>

        <ul className="space-y-0 relative z-10 w-full">
          {roadmap.map((topic, idx) => {
            const next = roadmap[idx + 1];
            const meta = statusMeta[topic.status];
            const Icon = meta.Icon;
            const isEven = idx % 2 === 0;
            const unlocked = topic.status !== 'locked';

            return (
              <li
                key={topic.id}
                className={cn(
                  'relative flex flex-col sm:flex-row sm:items-stretch gap-6 pb-20 last:pb-8 group',
                  !isEven && 'sm:flex-row-reverse'
                )}
              >
                {/* Card Container */}
                <div className="flex sm:flex-1 sm:justify-end sm:px-12 w-full">
                  <div className="w-full max-w-lg">
                    <Card
                      className={cn(
                        'w-full transition-all duration-300 relative overflow-hidden backdrop-blur-md shadow-xl hover:shadow-2xl border border-gray-100 cursor-pointer',
                        topic.status === 'current' &&
                        'ring-2 ring-violet-500/50 hover:-translate-y-1',
                        topic.status === 'completed' && 'hover:-translate-y-1',
                        topic.status === 'locked' && 'opacity-70 backdrop-blur-none cursor-not-allowed hover:shadow-none hover:-translate-y-0 filter grayscale-[0.5]'
                      )}
                      style={{
                        backgroundColor: topic.status === 'completed' ? 'rgba(16, 185, 129, 0.05)' : topic.status === 'current' ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255,255,255,0.02)'
                      }}
                      onClick={() => {
                        if (!unlocked) return;
                        setExpandedTopicId(
                          expandedTopicId === topic.id ? null : topic.id
                        );
                      }}
                      role={unlocked ? 'button' : undefined}
                      tabIndex={unlocked ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && unlocked) {
                          setExpandedTopicId(
                            expandedTopicId === topic.id ? null : topic.id
                          );
                        }
                      }}
                    >
                      {/* Subtle background glow effect for current topic */}
                      {topic.status === 'current' && (
                         <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-400/20 rounded-full blur-3xl pointer-events-none" />
                      )}
                      {topic.status === 'completed' && (
                         <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
                      )}

                      <div className="relative z-10 p-2">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <span
                            className={cn(
                              'text-[10px] font-black uppercase px-3 py-1 border rounded-full transition-colors',
                              meta.chip
                            )}
                          >
                            {meta.label}
                          </span>
                          {topic.difficulty && (
                            <span
                              className={cn(
                                'text-[10px] font-black uppercase px-3 py-1 border rounded-full',
                                diffColor[topic.difficulty] ||
                                'bg-gray-100 text-gray-700 border-gray-200'
                              )}
                            >
                              {topic.difficulty}
                            </span>
                          )}
                          {topic.stressful && (
                            <span className="text-[10px] font-black uppercase px-3 py-1 border border-rose-200 bg-rose-50 text-rose-700 rounded-full flex items-center gap-1 shadow-sm shadow-rose-200/50">
                              <Sparkles size={12} className="text-rose-500" />
                              Stretch
                            </span>
                          )}
                        </div>

                        <h3 className={cn("text-2xl font-black leading-tight transition-colors", topic.status === 'locked' ? 'text-gray-500' : 'text-gray-900', topic.status === 'current' && 'group-hover:text-violet-600')}>
                          {topic.title}
                        </h3>
                        <p className="text-sm font-bold text-gray-500 mt-2 leading-relaxed">
                          {topic.description}
                        </p>

                        <div className="mt-6 flex items-center gap-4 text-xs font-black text-gray-400 uppercase tracking-wide">
                          <span className="flex items-center gap-1.5"><Clock size={14} className="text-gray-500" /> ~{topic.estMinutes ?? 45} MIN</span>
                          <div className="w-1 h-1 rounded-full bg-gray-300" />
                          <span className={cn(
                            topic.progress === 100 ? "text-emerald-500" : topic.progress > 0 ? "text-violet-500" : "text-gray-400"
                          )}>{topic.progress}% DONE</span>
                        </div>

                        <div className="mt-3 h-2 bg-gray-100 overflow-hidden rounded-full shadow-inner border border-gray-200/50 dark:bg-gray-800 dark:border-gray-700">
                          <div
                            className={cn(
                              'h-full transition-all duration-1000 ease-out relative',
                              topic.status === 'completed'
                                ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                : topic.status === 'current'
                                  ? 'bg-gradient-to-r from-violet-400 to-fuchsia-500'
                                  : 'bg-transparent'
                            )}
                            style={{ width: `${topic.progress}%` }}
                          >
                             {topic.status === 'current' && (
                                <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_ease-in-out_infinite]" />
                             )}
                          </div>
                        </div>

                        <div className="mt-6 flex justify-between items-center">
                          {unlocked ? (
                            <Link
                              to={`/student/topic/${topic.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="w-full"
                            >
                              <Button
                                className={cn(
                                  'w-full py-3.5 text-sm font-black rounded-xl text-white transition-all duration-300 shadow-md border-none',
                                  topic.status === 'completed'
                                    ? 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-emerald-500/30'
                                    : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 hover:shadow-violet-600/40'
                                )}
                              >
                                {topic.status === 'completed'
                                  ? 'Review Topic'
                                  : 'Continue Learning'}
                              </Button>
                            </Link>
                          ) : (
                            <Button disabled className="w-full py-3 text-sm font-black rounded-xl bg-gray-100 text-gray-400 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500">
                              <Lock size={16} className="inline mr-2" />
                              Locked
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>

                    {/* Expandable Subtopics Section */}
                    {expandedTopicId === topic.id && (
                      <div className="mt-4 rounded-[1.5rem] border border-violet-100 bg-violet-50/50 p-6 shadow-inner transition-all animate-in fade-in slide-in-from-top-4 duration-300 dark:bg-violet-900/10 dark:border-violet-500/20">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-500">
                              Curriculum Map
                            </p>
                            <h4 className="text-xl font-black mt-1 text-gray-800 dark:text-gray-200">Topic Outline</h4>
                          </div>
                          <Link
                            to={`/student/notes?query=${encodeURIComponent(topic.title)}&topic=${encodeURIComponent(topic.title)}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button className="text-xs py-2 px-5 bg-white text-violet-700 border border-violet-200 hover:bg-violet-50 rounded-full shadow-sm dark:bg-gray-800 dark:text-violet-400 dark:border-violet-500/30 dark:hover:bg-gray-700">
                              View Notes
                            </Button>
                          </Link>
                        </div>
                        
                        <div className="space-y-4">
                          {(TOPIC_SUBTOPICS[topic.id] || []).map((section) => (
                            <div key={section.title} className="rounded-2xl bg-white/80 p-5 border border-violet-50 shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800/80 dark:border-gray-700">
                              <div className="flex items-center justify-between gap-3 mb-3">
                                <p className="font-black text-xs uppercase tracking-[0.1em] text-gray-700 dark:text-gray-300">
                                  {section.title}
                                </p>
                              </div>
                              <ul className="space-y-2.5 text-sm font-semibold text-gray-500 dark:text-gray-400">
                                {section.items.map((item) => (
                                  <li key={item} className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                                    <span className="leading-tight">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Central Node Icon */}
                <div className="absolute left-6 sm:left-1/2 sm:-translate-x-1/2 top-10 z-20 flex flex-col items-center justify-center w-10 sm:w-16">
                  <div
                    className={cn(
                      'w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg transition-transform duration-500 relative z-10 group-hover:scale-110',
                      topic.status === 'current' && 'bg-gradient-to-tr from-violet-500 to-fuchsia-500 shadow-[0_0_25px_rgba(139,92,246,0.5)] text-white border-0',
                      topic.status === 'completed' && 'bg-gradient-to-tr from-emerald-400 to-teal-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] border-0',
                      topic.status === 'locked' && 'bg-gray-100 text-gray-400 border-[3px] border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500 shadow-none'
                    )}
                  >
                     {topic.status === 'current' && (
                        <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-pulse" />
                     )}
                     {topic.status === 'completed' && (
                        <div className="absolute inset-0 rounded-full border border-white/50" />
                     )}
                    <Icon
                      size={isEven ? 28 : 24}
                      className={cn(
                        "relative z-10",
                        topic.status === 'current' && 'animate-bounce'
                      )}
                      strokeWidth={2.5}
                    />
                  </div>
                </div>

                <div className="hidden sm:flex sm:flex-1 sm:px-12 w-full" />
              </li>
            );
          })}
        </ul>
      </div>

      <Card className="max-w-md mx-auto text-center border-none shadow-2xl relative overflow-hidden p-10 rounded-[2.5rem]" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(217, 70, 239, 0.05) 100%)' }}>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-violet-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-fuchsia-400/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 backdrop-blur-sm">
          <p className="font-black text-4xl text-gray-900 tracking-tight flex items-baseline justify-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">{roadmap.filter((t) => t.status === 'completed').length}</span>
            <span className="text-gray-400 text-2xl mx-2">/</span>
            {roadmap.length} <span className="text-2xl ml-2 tracking-wide font-extrabold uppercase text-gray-500">topics</span>
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 px-5 py-2 rounded-full border border-violet-100 dark:border-slate-700">
             <Sparkles size={16} className="text-violet-500" />
             <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
               Steady progress beats perfect plans. Keep going!
             </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
