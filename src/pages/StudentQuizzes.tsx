import React, { useCallback, useEffect, useState } from 'react';
import { Card, Button, Tag, PageSpinner, EmptyState, ErrorState } from '../components/UI';
import { ClipboardList, ArrowRight, CheckCircle, Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface Quiz {
  id: string;
  title: string;
  topicId: string;
  questionCount: number;
  status: 'available' | 'completed' | 'locked';
  score?: number;
  difficulty?: string;
  estMinutes?: number;
}

const fetchOpts: RequestInit = { credentials: 'include' };

export const StudentQuizzes = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    fetch('/api/quizzes', fetchOpts)
      .then((res) => {
        if (res.status === 401) throw new Error('Unauthorized');
        if (!res.ok) throw new Error('quizzes');
        return res.json();
      })
      .then((data) => setQuizzes(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.log("QUIZZES ERROR:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <PageSpinner label="Loading quizzes…" />;

  if (error) {
    return (
      <ErrorState
        title="Failed to load quizzes"
        hint="Please refresh or sign in again."
        onRetry={load}
      />
    );
  }

  if (!quizzes.length) {
    return (
      <div className="max-w-xl mx-auto py-12 space-y-6">
        <h1 className="text-4xl font-black text-center">Quizzes</h1>
        <EmptyState
          title="No quizzes yet"
          hint="When your teacher assigns assessments, they will show up here."
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6 px-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
            <ClipboardList size={40} className="text-violet-600" />
            Quizzes
          </h1>
          <p className="font-bold text-gray-500 text-sm">
            Structured checks that power your recommendations
          </p>
        </div>

        <div className="flex gap-4">
          <div className="neo-card bg-white px-6 py-3 text-center neo-card-interactive">
            <p className="text-2xl font-black">
              {quizzes.filter((q) => q.status === 'completed').length}
            </p>
            <p className="text-[10px] font-black uppercase text-gray-500">
              Completed
            </p>
          </div>
          <div className="neo-card bg-white px-6 py-3 text-center neo-card-interactive">
            <p className="text-2xl font-black">
              {quizzes.filter((q) => q.status === 'available').length}
            </p>
            <p className="text-[10px] font-black uppercase text-gray-500">
              Available
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <Card
            key={quiz.id}
            className={cn(
              'p-6 space-y-5 neo-card-interactive',
              quiz.status === 'completed' && 'bg-emerald-50/80',
              quiz.status === 'locked' && 'opacity-65 grayscale'
            )}
          >
            <div className="flex justify-between items-start gap-2">
              <div
                className={cn(
                  'p-3 neo-border rounded-full',
                  quiz.status === 'completed'
                    ? 'bg-emerald-100'
                    : 'bg-violet-100'
                )}
              >
                <ClipboardList
                  size={24}
                  className={
                    quiz.status === 'completed'
                      ? 'text-emerald-600'
                      : 'text-violet-600'
                  }
                />
              </div>
              {quiz.status === 'completed' && (
                <div className="bg-amber-400 neo-border p-1 rounded-full">
                  <Star size={16} className="fill-white text-white" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black leading-tight">{quiz.title}</h3>
              <p className="text-xs font-bold text-gray-500">
                Topic ID: {quiz.topicId}
              </p>
              <div className="flex flex-wrap gap-2">
                {quiz.difficulty && (
                  <Tag color="#e9d5ff">{quiz.difficulty}</Tag>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-black uppercase text-gray-500">
              <div className="flex items-center gap-1">
                <Clock size={14} />~{quiz.estMinutes ?? 5} min
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle size={14} /> {quiz.questionCount} Qs
              </div>
            </div>

            {quiz.status === 'completed' ? (
              <div className="space-y-3">
                <div className="h-2 neo-border bg-white overflow-hidden rounded-sm">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${quiz.score || 0}%` }}
                  />
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm font-black">
                    Score: {quiz.score ?? 0}%
                  </span>
                  <Button
                    variant="outline"
                    className="text-xs py-1"
                    onClick={() => navigate(`/student/quiz/${quiz.id}`)}
                  >
                    Review
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="primary"
                className={cn(
                  'w-full flex items-center justify-center gap-2',
                  quiz.status === 'locked'
                    ? 'bg-zinc-300 cursor-not-allowed'
                    : 'bg-violet-600 hover:bg-violet-700'
                )}
                disabled={quiz.status === 'locked'}
                onClick={() => navigate(`/student/quiz/${quiz.id}`)}
              >
                {quiz.status === 'locked' ? 'Locked' : 'Start quiz'}{' '}
                <ArrowRight size={18} />
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
