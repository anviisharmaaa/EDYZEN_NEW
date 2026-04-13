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
    {
      title: 'Forms of Linear Equations',
      items: [
        'Slope-intercept form (y = mx + b)',
        'Point-slope form',
        'Standard form',
      ],
    },
    {
      title: 'Concepts',
      items: [
        'Slope (gradient)',
        'Parallel and perpendicular lines',
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
    {
      title: 'Graphs (Parabolas)',
      items: [
        'Shape of parabola',
        'Vertex and axis of symmetry',
        'Maximum & minimum values',
      ],
    },
    {
      title: 'Applications',
      items: [
        'Word problems (area, motion, etc.)',
      ],
    },
  ],
};

const statusMeta = {
  locked: { label: 'Locked', Icon: Lock, chip: 'bg-zinc-200 text-zinc-700' },
  current: {
    label: 'In progress',
    Icon: CircleDot,
    chip: 'bg-amber-300 text-black',
  },
  completed: {
    label: 'Completed',
    Icon: CheckCircle2,
    chip: 'bg-emerald-400 text-black',
  },
};

const diffColor: Record<string, string> = {
  Easy: 'bg-emerald-100 text-emerald-900 border-emerald-500',
  Medium: 'bg-amber-100 text-amber-950 border-amber-500',
  Hard: 'bg-rose-100 text-rose-900 border-rose-500',
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
        <h1 className="text-3xl font-black text-center">Your learning path</h1>
        <EmptyState
          title="No roadmap yet"
          hint="Topics will appear here once your teacher publishes your class sequence."
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 py-4 pb-16">
      <div className="text-center space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-600">
          Learning core
        </p>
        <h1 className="text-4xl font-black tracking-tight flex items-center justify-center gap-3">
          <BookOpen className="text-violet-600" />
          Your path
        </h1>
        <p className="font-bold text-gray-600 max-w-md mx-auto text-sm">
          Complete each node to unlock the next — like a skill tree, but for
          class.
        </p>
      </div>

      <div className="relative pl-4 sm:pl-0">
        <div
          className="absolute left-[27px] sm:left-1/2 top-8 bottom-8 w-1 bg-black sm:-translate-x-1/2 rounded-full hidden sm:block"
          aria-hidden
        />
        <ul className="space-y-0 relative">
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
                  'relative flex flex-col sm:flex-row sm:items-stretch gap-4 pb-14 last:pb-4',
                  !isEven && 'sm:flex-row-reverse'
                )}
              >
                <div className="flex sm:flex-1 sm:justify-end sm:pr-10">
                  <div className="w-full max-w-sm">
                    <Card
                      className={cn(
                        'w-full neo-card-interactive transition-all duration-200 cursor-pointer',
                        topic.status === 'current' &&
                          'ring-2 ring-violet-500 ring-offset-2 bg-violet-50/80',
                        topic.status === 'completed' && 'bg-emerald-50/70',
                        topic.status === 'locked' && 'opacity-75 grayscale-[0.3]'
                      )}
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
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span
                          className={cn(
                            'text-[10px] font-black uppercase px-2 py-0.5 border-2 border-black rounded',
                            meta.chip
                          )}
                        >
                          {meta.label}
                        </span>
                        {topic.difficulty && (
                          <span
                            className={cn(
                              'text-[10px] font-black uppercase px-2 py-0.5 border-2 border-black rounded',
                              diffColor[topic.difficulty] ||
                                'bg-gray-100 text-gray-800'
                            )}
                          >
                            {topic.difficulty}
                          </span>
                        )}
                        {topic.stressful && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 border-2 border-rose-500 bg-rose-100 text-rose-900 rounded flex items-center gap-1">
                            <Sparkles size={12} />
                            Stretch topic
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-black leading-tight">
                        {topic.title}
                      </h3>
                      <p className="text-sm font-bold text-gray-600 mt-2 leading-snug">
                        {topic.description}
                      </p>
                      <div className="mt-4 flex items-center gap-3 text-xs font-black text-gray-500">
                        <Clock size={14} />
                        ~{topic.estMinutes ?? 45} min
                        <span className="text-gray-300">|</span>
                        {topic.progress}% done
                      </div>
                      <div className="mt-3 h-2 neo-border bg-white overflow-hidden rounded-sm">
                        <div
                          className={cn(
                            'h-full transition-all duration-500',
                            topic.status === 'completed'
                              ? 'bg-emerald-500'
                              : topic.status === 'current'
                              ? 'bg-violet-500'
                              : 'bg-zinc-300'
                          )}
                          style={{ width: `${topic.progress}%` }}
                        />
                      </div>
                      <div className="mt-4">
                        {unlocked ? (
                          <Link
                            to={`/student/topic/${topic.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedTopicId(topic.id);
                            }}
                          >
                            <Button
                              variant="primary"
                              className={cn(
                                topic.status === 'completed' &&
                                  'bg-emerald-600 hover:bg-emerald-700'
                              )}
                            >
                              {topic.status === 'completed'
                                ? 'Review topic'
                                : 'Continue'}
                            </Button>
                          </Link>
                        ) : (
                          <Button disabled className="opacity-60 cursor-not-allowed">
                            <Lock size={16} className="inline mr-1" />
                            Locked
                          </Button>
                        )}
                      </div>
                    </Card>

                    {expandedTopicId === topic.id && (
                      <div className="mt-4 rounded-3xl border border-violet-200 bg-violet-50/80 p-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-600">
                              Subtopics
                            </p>
                            <h4 className="text-lg font-black mt-1">{topic.title} outline</h4>
                          </div>
                          <Link
                            to={`/student/notes?query=${encodeURIComponent(topic.title)}&topic=${encodeURIComponent(topic.title)}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="outline" className="text-xs py-2 px-3 text-violet-700 border-violet-700 hover:bg-violet-50">
                              Notes for topic
                            </Button>
                          </Link>
                        </div>
                        <div className="space-y-4">
                          {(TOPIC_SUBTOPICS[topic.id] || []).map((section) => (
                            <div key={section.title} className="space-y-2 rounded-2xl bg-white p-4 border border-violet-100">
                              <div className="flex items-center justify-between gap-3">
                                <p className="font-bold text-sm uppercase tracking-[0.15em] text-gray-500">
                                  {section.title}
                                </p>
                                <Link
                                  to={`/student/notes?query=${encodeURIComponent(section.title)}&topic=${encodeURIComponent(topic.title)}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-xs font-black uppercase text-violet-700"
                                >
                                  Notes
                                </Link>
                              </div>
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                {section.items.map((item) => (
                                  <li key={item} className="flex items-center justify-between gap-3">
                                    <span>{item}</span>
                                    <Link
                                      to={`/student/notes?query=${encodeURIComponent(item)}&topic=${encodeURIComponent(topic.title)}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-xs font-black uppercase text-violet-700"
                                    >
                                      Notes
                                    </Link>
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

                <div className="absolute left-0 sm:left-1/2 sm:-translate-x-1/2 top-6 z-10 flex flex-col items-center w-14 sm:w-auto">
                  <div
                    className={cn(
                      'w-14 h-14 rounded-full border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform',
                      topic.status === 'current' && 'bg-amber-400 scale-110',
                      topic.status === 'completed' && 'bg-emerald-400',
                      topic.status === 'locked' && 'bg-zinc-200'
                    )}
                  >
                    <Icon
                      size={26}
                      className={cn(
                        topic.status === 'current' && 'animate-pulse'
                      )}
                    />
                  </div>
                  {next && (
                    <div
                      className={cn(
                        'w-1 flex-1 min-h-[48px] mt-2 sm:hidden rounded-full',
                        next.status === 'locked' ? 'bg-zinc-300' : 'bg-black'
                      )}
                      aria-hidden
                    />
                  )}
                </div>

                <div className="hidden sm:flex sm:flex-1 sm:pl-10" />
              </li>
            );
          })}
        </ul>
      </div>

      <Card className="text-center bg-violet-50 border-violet-400 neo-card-interactive">
        <p className="font-black text-lg">
          {roadmap.filter((t) => t.status === 'completed').length}/
          {roadmap.length} topics complete
        </p>
        <p className="text-sm font-bold text-gray-600 mt-1">
          Steady progress beats perfect plans.
        </p>
      </Card>
    </div>
  );
};
