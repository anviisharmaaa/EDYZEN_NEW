import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, MoodIcon, PageSpinner, ErrorState, EmptyState } from '../components/UI';
import {

  BookOpen,
  ClipboardList,
  Clock,
  Lightbulb,
  MousePointer2,
  PlayCircle,
  Target,
  Timer,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface Summary {
  greeting: string;
  mood: string;
  progress: number;
  assignmentsDue: number;
  quizzesAvailable: number;
  dailyGoal: {
    title: string;
    topicId?: string;
    progressPct: number;
    quizzesRemaining: number;
    minutesEstimate: number;
  };
  insights: { type: string; text: string }[];
  recommendations: string[];
  weeklyMinutes: number[];
  behaviorSnapshot: {
    timeSpentMin: number;
    clicks: number;
    quizAttempts: number;
  };
  adaptiveHint: string | null;
  weakTopics?: string[];
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  status: string;
}

function RingProgress({
  value,
  size = 112,
  stroke = 10,
}: {
  value: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, value) / 100) * c;
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        className="text-gray-200"
        stroke="currentColor"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        className="text-emerald-500 transition-all duration-700"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

const fetchOpts: RequestInit = { credentials: 'include' };

export const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    const run = async () => {
      try {
        const [statusRes, summaryRes] = await Promise.all([
          fetch('/api/students/me/status', fetchOpts),
          fetch('/api/students/me/summary', fetchOpts),
        ]);

        let summaryData = null;
        if (summaryRes.ok) {
          summaryData = await summaryRes.json();
          setSummary(summaryData);
        }

        try {
          const a1 = await (
            await fetch('/api/assignments/a1', fetchOpts)
          ).json();
          const a2 = await (
            await fetch('/api/assignments/a2', fetchOpts)
          ).json();
          setAssignments([a1, a2].filter((a) => a && !a.error));
        } catch {
          setAssignments([]);
        }
      } catch (err) {
        console.log("DASHBOARD ERROR:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    run();
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <PageSpinner label="Loading your dashboard…" />;
  }

  if (error || !summary) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        hint="Check your connection and try again."
        onRetry={load}
      />
    );
  }

  const weekData = (summary.weeklyMinutes || []).map((m, i) => ({
    day: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i] ?? `D${i + 1}`,
    min: m,
  }));

  const dailyGoal = summary.dailyGoal ?? {
    title: 'Continue learning',
    topicId: undefined,
    progressPct: 0,
    quizzesRemaining: 0,
    minutesEstimate: 0,
  };

  const insights = summary.insights ?? [];
  const recommendations = summary.recommendations ?? [];
  const weakTopics = summary.weakTopics ?? [];
  const adaptiveHint = summary.adaptiveHint ?? null;
  const behaviorSnapshot = summary.behaviorSnapshot ?? {
    timeSpentMin: 0,
    clicks: 0,
    quizAttempts: 0,
  };
  const quizzesAvailable = summary.quizzesAvailable ?? 0;
  const assignmentsDue = summary.assignmentsDue ?? 0;

  const continuePath = dailyGoal.topicId
    ? `/student/topic/${dailyGoal.topicId}/course-map`
    : '/student/roadmap';

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            {summary.greeting}
          </p>
          <h1 className="text-3xl font-bold">
            Welcome, {user?.name}
          </h1>
        </div>

        {weakTopics.length > 0 && (
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <p className="text-sm font-medium text-red-500">
              <span className="font-semibold">Focus areas:</span> {weakTopics.join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Goal Card */}
        <Card className="lg:col-span-2 space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
              Today's Learning Goal
            </p>
            <h2 className="text-xl font-bold mb-2">
              {dailyGoal.title}
            </h2>
            <p className="text-sm text-gray-600">
              {dailyGoal.quizzesRemaining} quiz{dailyGoal.quizzesRemaining === 1 ? '' : 'zes'} · ~{dailyGoal.minutesEstimate} min
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              <span>Progress</span>
              <span>{dailyGoal.progressPct}%</span>
            </div>
            <div className="w-full h-2 rounded overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <div
                className="h-full transition-all duration-700"
                style={{ width: `${dailyGoal.progressPct}%`, backgroundColor: 'var(--accent-blue)' }}
              />
            </div>
          </div>

          <Button
            variant="primary"
            className="w-full"
            onClick={() => navigate(continuePath)}
          >
            Continue Learning
          </Button>
        </Card>

        {/* Quick Info Card */}
        <Card className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
              Overview
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Assignments Due</span>
                <span className="text-lg font-bold text-blue-600">{assignmentsDue}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Available Quizzes</span>
                <span className="text-lg font-bold text-blue-600">{quizzesAvailable}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Mood Today</span>
                <MoodIcon mood={summary.mood as any || 'ok'} size="sm" />
              </div>
            </div>
          </div>

          {adaptiveHint && (
            <div className="pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                💡 {adaptiveHint === 'more_practice' ? 'Extra practice recommended based on your recent performance.' : adaptiveHint}
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          className="cursor-pointer hover:bg-gray-50 transition-colors text-center p-4"
          onClick={() => navigate(continuePath)}
        >
          <PlayCircle className="text-blue-600 mb-2 mx-auto" size={24} />
          <p className="font-semibold text-sm">Resume</p>
          <p className="text-xs text-gray-600 mt-1">Last topic</p>
        </Card>

        <Card
          className="cursor-pointer hover:bg-gray-50 transition-colors text-center p-4"
          onClick={() => navigate('/student/quizzes')}
        >
          <ClipboardList className="text-green-600 mb-2 mx-auto" size={24} />
          <p className="font-semibold text-sm">Quizzes</p>
          <p className="text-xs text-gray-600 mt-1">{quizzesAvailable} available</p>
        </Card>

        <Card
          className="cursor-pointer hover:bg-gray-50 transition-colors text-center p-4"
          onClick={() => navigate('/student/profile')}
        >
          <Target className="text-orange-600 mb-2 mx-auto" size={24} />
          <p className="font-semibold text-sm">Analysis</p>
          <p className="text-xs text-gray-600 mt-1">Weak areas</p>
        </Card>

        <Card
          className="cursor-pointer hover:bg-gray-50 transition-colors text-center p-4"
          onClick={() => navigate('/student/roadmap')}
        >
          <BookOpen className="text-purple-600 mb-2 mx-auto" size={24} />
          <p className="font-semibold text-sm">Roadmap</p>
          <p className="text-xs text-gray-600 mt-1">Full path</p>
        </Card>
      </div>

      {/* Insights & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
            <Lightbulb size={18} className="text-amber-600" />
            Insights
          </h3>
          <div className="space-y-3">
            {insights.length > 0 ? insights.map((ins, i) => (
              <div
                key={i}
                className="flex gap-3 text-sm p-3 rounded-lg"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                {ins.type === 'warning' ? (
                  <AlertTriangle className="text-amber-600 shrink-0" size={18} />
                ) : (
                  <CheckCircle2 className="text-green-600 shrink-0" size={18} />
                )}
                <span className="text-gray-700">{ins.text}</span>
              </div>
            )) : (
              <p className="text-sm text-gray-500">No insights at this time.</p>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-base mb-4">Recommended For You</h3>
          <ul className="space-y-2">
            {recommendations.length > 0 ? recommendations.map((r, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2 items-start">
                <span className="text-blue-600 shrink-0">→</span>
                <span>{r}</span>
              </li>
            )) : (
              <p className="text-sm text-gray-500">No recommendations yet.</p>
            )}
          </ul>
        </Card>
      </div>

      {/* Weekly Stats & Behavior */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-green-600" />
            Weekly Minutes
          </h3>
          {weekData.length > 0 ? (
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekData}>
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontWeight: 600,
                    }}
                  />
                  <Bar dataKey="min" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="No activity yet" />
          )}
        </Card>

        <Card>
          <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
            <Clock size={18} className="text-blue-600" />
            Activity Summary
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <Clock size={20} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{behaviorSnapshot.timeSpentMin}</p>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>minutes</p>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <MousePointer2 size={20} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{behaviorSnapshot.clicks}</p>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>interactions</p>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <ClipboardList size={20} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{behaviorSnapshot.quizAttempts}</p>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>attempts</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
