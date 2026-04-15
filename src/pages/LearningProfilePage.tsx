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
import { cn } from '../lib/utils';

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
    <div className="space-y-10 max-w-5xl mx-auto pb-16 px-4 sm:px-6 relative">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10 pt-4">
        <div className="flex items-center gap-5">
          <div className="p-4 rounded-[1.5rem] border border-[var(--border-strong)] flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--surface-card)' }}>
            <Brain size={32} style={{ color: 'var(--accent-blue)' }} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Learning Profile</h1>
            <p className="font-bold mt-1 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <Sparkles size={14} style={{ color: 'var(--accent-blue)' }} />
              Accuracy, pace, and AI-inferred style
            </p>
          </div>
        </div>
      </div>

      {/* Main Profile Info Card */}
      <Card className="relative overflow-hidden border shadow-xl rounded-[2rem] p-8 sm:p-10 z-10" style={{ backgroundColor: 'var(--text-primary)', borderColor: 'var(--border-strong)' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <div className="flex gap-4 items-start group">
            <div className="p-3 rounded-2xl border" style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-color)' }}>
              <User size={24} style={{ color: 'var(--text-primary)' }} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--bg-tertiary)' }}>
                Student
              </p>
              <p className="text-2xl font-black tracking-tight" style={{ color: 'var(--bg-primary)' }}>{profile.name ?? 'Guest'}</p>
            </div>
          </div>
          <div className="flex gap-4 items-start group">
            <div className="p-3 rounded-2xl border" style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-color)' }}>
              <GraduationCap size={24} style={{ color: 'var(--text-primary)' }} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--bg-tertiary)' }}>
                Class Level
              </p>
              <p className="text-2xl font-black tracking-tight" style={{ color: 'var(--bg-primary)' }}>
                {profile.classLabel ?? '—'}
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start group">
            <div className="p-3 rounded-2xl border" style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-color)' }}>
              <Zap size={24} style={{ color: 'var(--text-primary)' }} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--bg-tertiary)' }}>
                Learning Type
              </p>
              <p className="text-2xl font-black tracking-tight capitalize" style={{ color: 'var(--bg-primary)' }}>
                {profile.learningType ?? profile.approach?.[0] ?? 'Explorer'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Cognitive Test Promo */}
      <Card className="border shadow-lg rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-8 p-8 relative z-10" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <div className="space-y-3 relative z-10">
          <h2 className="text-2xl font-black flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <Sparkles style={{ color: 'var(--accent-blue)' }} /> Cognitive Test
          </h2>
          <p className="font-bold max-w-xl text-[15px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Take a short, dynamic cognitive test to assess your unique learning abilities and get personalized AI recommendations.
          </p>
        </div>
        <Button
          className="shadow-lg px-8 py-4 rounded-xl font-black whitespace-nowrap relative z-10 border-0 transition-all hover:opacity-90"
          style={{ backgroundColor: 'var(--accent-blue)', color: '#ffffff' }}
          onClick={() => navigate('/student/cognitive-test')}
        >
          Begin Assessment
        </Button>
      </Card>

      {/* Cognitive Test History */}
      <Card className="border shadow-xl rounded-[2rem] p-8 relative z-10" style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-color)' }}>
        <h2 className="text-2xl font-black flex items-center gap-3 mb-6" style={{ color: 'var(--text-primary)' }}>
          <div className="border p-2 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
            <Brain size={28} style={{ color: 'var(--text-primary)' }} /> 
          </div>
          Cognitive Test History
        </h2>
        <div className="space-y-4">
          {profile.cognitiveTestResults?.length ? (
            profile.cognitiveTestResults.map((result: any, idx: number) => (
              <div key={idx} className="p-5 rounded-2xl shadow-sm border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                <div className="flex justify-between items-center font-bold">
                  <span style={{ color: 'var(--text-muted)' }}>{result.date}</span>
                  <span className="text-[15px] border px-4 py-1.5 rounded-full" style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}>{result.score}% Score</span>
                </div>
                <p className="text-sm font-semibold mt-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{result.description}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 rounded-2xl border-2 border-dashed" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-strong)' }}>
              <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>
                No past records found. Take your first test to unlock insights!
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        <Card className="border shadow-xl rounded-[2rem] p-8 space-y-8" style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-color)' }}>
          <h2 className="text-2xl font-black flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <div className="border p-2 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
               <Zap size={28} style={{ color: 'var(--accent-tired)' }} /> 
            </div>
            Learning Tendencies
          </h2>
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                Pace
              </p>
              <div className="p-4 font-bold capitalize rounded-2xl border shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                {profile.pace}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                Preference
              </p>
              <div className="p-4 font-bold capitalize rounded-2xl border shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                {profile.preference}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                Strategic Approaches
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.approach?.map((tag) => (
                  <span key={tag} className="px-4 py-2 text-sm font-bold rounded-full border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="border shadow-xl rounded-[2rem] p-8 space-y-8" style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-color)' }}>
          <h2 className="text-2xl font-black flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <div className="border p-2 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
              <TrendingUp size={28} style={{ color: 'var(--accent-ok)' }} /> 
            </div>
            Accuracy Stats
          </h2>
          
          <div className="p-8 text-center rounded-[1.5rem] shadow-lg relative overflow-hidden" style={{ backgroundColor: 'var(--text-primary)' }}>
             <p className="text-xs font-black uppercase tracking-widest mb-2 relative z-10" style={{ color: 'var(--bg-tertiary)' }}>
              Overall Accuracy
            </p>
            <p className="text-5xl font-black tracking-tight relative z-10 drop-shadow-md" style={{ color: 'var(--bg-primary)' }}>
              {profile.performance.accuracy}%
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="font-black uppercase tracking-wider text-xs flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <Target size={16} />
                Strong topics
              </p>
              <div className="flex flex-wrap gap-2">
                {(profile.strongTopics ?? []).map((topic) => (
                  <span key={topic} className="px-3 py-1.5 text-xs font-bold rounded-full border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                    {topic}
                  </span>
                ))}
                {!profile.strongTopics?.length && (
                  <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                    Complete more quizzes!
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <p className="font-black uppercase tracking-wider text-xs flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <AlertTriangle size={16} />
                Focus areas
              </p>
              <div className="flex flex-wrap gap-2">
                {(profile.weakTopics ?? []).map((topic) => (
                  <span key={topic} className="px-3 py-1.5 text-xs font-bold rounded-full border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <p className="font-black uppercase tracking-widest text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Accuracy by question type
            </p>
            <div className="space-y-5">
              {profile.performance?.byType?.map((item) => (
                <div key={item.type} className="space-y-2 group">
                  <div className="flex justify-between text-sm font-bold capitalize transition-colors" style={{ color: 'var(--text-primary)' }}>
                    <span>{item.type}</span>
                    <span>{item.accuracy}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full shadow-inner" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <div
                      className="h-full transition-all duration-1000 relative"
                      style={{ width: `${item.accuracy}%`, backgroundColor: 'var(--text-primary)' }}
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
