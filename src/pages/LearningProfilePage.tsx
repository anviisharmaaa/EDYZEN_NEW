import React, { useCallback, useEffect, useState } from 'react';
import { Card, Tag, Button, PageSpinner, ErrorState } from '../components/UI';

import {
  Brain,
  Target,
  TrendingUp,
  AlertTriangle,
  Zap,
  Sparkles,
  User,
  GraduationCap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileData {
  name?: string;
  classLabel?: string;
  learningType?: string;
  pace: string;
  preference: string;
  approach: string[];
  performance: {
    accuracy: number;
    byType: { type: string; accuracy: number }[];
  };
  weakTopics: string[];
  strongTopics?: string[];
  cognitiveTestResults?: { date: string; score: number; description: string }[];
}

const fetchOpts: RequestInit = { credentials: 'include' };

export const LearningProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    fetch('/api/students/me/profile', fetchOpts)
      .then((res) => {
        if (res.status === 401) throw new Error('Unauthorized');
        if (!res.ok) throw new Error('profile');
        return res.json();
      })
      .then(setProfile)
      .catch((err) => {
        console.log("PROFILE ERROR:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <PageSpinner label="Loading your profile…" />;

  if (error || !profile) {
    return (
      <div className="space-y-6 max-w-lg mx-auto py-12">
        <ErrorState
          title="Could not load profile"
          hint="Sign in again or retry — your session may have expired."
          onRetry={load}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="p-4 bg-violet-400 neo-border rounded-full shrink-0">
          <Brain size={32} />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-black">Learning profile</h1>
          <p className="font-bold text-gray-600 text-sm">
            Accuracy, pace, and AI-inferred style
          </p>
        </div>
      </div>

      <Card className="neo-card-interactive bg-gradient-to-r from-slate-900 to-violet-900 text-white border-black">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-3 items-start">
            <User className="text-violet-300 shrink-0 mt-1" size={22} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-300">
                Name
              </p>
              <p className="text-xl font-black">{profile.name ?? 'Student'}</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <GraduationCap className="text-violet-300 shrink-0 mt-1" size={22} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-300">
                Class
              </p>
              <p className="text-xl font-black">
                {profile.classLabel ?? '—'}
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <Zap className="text-violet-300 shrink-0 mt-1" size={22} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-300">
                Learning type
              </p>
              <p className="text-xl font-black capitalize">
                {profile.learningType ?? profile.approach?.[0] ?? 'Explorer'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-indigo-50 border-indigo-400 neo-card-interactive flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Sparkles /> Cognitive Test
          </h2>
          <p className="font-bold text-gray-700 max-w-xl text-sm">
            Take a cognitive test to assess your learning abilities and get personalized recommendations.
          </p>
        </div>
        <Button
          variant="primary"
          className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3 whitespace-nowrap"
          onClick={() => navigate('/student/cognitive-test')}
        >
          Take Cognitive Test
        </Button>
      </Card>

      <Card className="bg-emerald-50 border-emerald-400 neo-card-interactive">
        <h2 className="text-xl font-black flex items-center gap-2 mb-4">
          <Brain className="text-emerald-600" /> Previous Cognitive Test Results
        </h2>
        <div className="space-y-3">
          {profile.cognitiveTestResults?.length ? (
            profile.cognitiveTestResults.map((result: any, idx: number) => (
              <div key={idx} className="neo-card p-4 bg-white">
                <div className="flex justify-between font-bold">
                  <span>{result.date}</span>
                  <span className="text-emerald-600">{result.score}%</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{result.description}</p>
              </div>
            ))
          ) : (
            <p className="text-sm font-bold text-gray-500">
              No cognitive tests taken yet. Take a test to see your results here.
            </p>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="space-y-5 neo-card-interactive">
          <h2 className="text-xl font-black flex items-center gap-2">
            <Zap className="text-amber-500" /> Learning Profile
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-[10px] font-black uppercase text-gray-500 mb-1">
                Pace
              </p>
              <div className="neo-card p-3 bg-blue-50 font-bold capitalize">
                {profile.pace}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-500 mb-1">
                Preference
              </p>
              <div className="neo-card p-3 bg-green-50 font-bold capitalize">
                {profile.preference}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-500 mb-1">
                Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.approach?.map((tag) => (
                  <Tag key={tag} color="#e0e7ff">
                    {tag}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-6 neo-card-interactive">
          <h2 className="text-xl font-black flex items-center gap-2">
            <TrendingUp className="text-emerald-500" /> Learning stats
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
            <div className="neo-card p-6 text-center bg-emerald-50/80">
              <p className="text-[10px] font-black uppercase text-gray-500 mb-2">
                Accuracy
              </p>
              <p className="text-4xl font-black text-emerald-600">
                {profile.performance.accuracy}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="font-black uppercase text-xs text-gray-500 flex items-center gap-2">
                <Target size={14} className="text-emerald-600" />
                Strong topics
              </p>
              <div className="flex flex-wrap gap-2">
                {(profile.strongTopics ?? []).map((topic) => (
                  <span
                    key={topic}
                    className="neo-border bg-emerald-50 px-3 py-1.5 text-sm font-bold rounded"
                  >
                    {topic}
                  </span>
                ))}
                {!profile.strongTopics?.length && (
                  <span className="text-sm font-bold text-gray-500">
                    Complete more quizzes to populate this.
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-black uppercase text-xs text-gray-500 flex items-center gap-2">
                <AlertTriangle size={14} className="text-rose-600" />
                Weak topics
              </p>
              <div className="flex flex-wrap gap-2">
                {(profile.weakTopics ?? []).map((topic) => (
                  <span
                    key={topic}
                    className="neo-border bg-rose-50 px-3 py-1.5 text-sm font-bold rounded"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-black uppercase text-xs text-gray-500">
              Accuracy by question type
            </p>
            <div className="space-y-3">
              {profile.performance?.byType?.map((item) => (
                <div key={item.type} className="space-y-1">
                  <div className="flex justify-between text-sm font-bold capitalize">
                    <span>{item.type}</span>
                    <span>{item.accuracy}%</span>
                  </div>
                  <div className="h-2.5 neo-border bg-gray-100 overflow-hidden rounded-sm">
                    <div
                      className="h-full bg-violet-600 transition-all duration-1000"
                      style={{ width: `${item.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
