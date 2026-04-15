import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Button, Tag, MoodIcon, PageSpinner, ErrorState } from '../components/UI';
import { ArrowLeft, TrendingUp, BookOpen, Clock, BarChart2, AlertCircle, Heart, ChevronRight, GraduationCap, Award, TrendingDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface ChildDetails {
  id: string;
  name: string;
  mood: string;
  progress: number;
  accuracy: number;
  timePerQuestion: number;
  weakTopics: string[];
  recentActivity: { id: string; title: string; type: string; date: string; score?: number }[];
  grades?: { subject: string; score: number; date: string }[];
  weeklyProgress?: number[];
}

interface GradeData {
  subject: string;
  score: number;
  date: string;
  trend: 'up' | 'down' | 'stable';
}

const fetchOpts: RequestInit = { credentials: 'include' };

const SUBJECT_GRADES: GradeData[] = [
  { subject: 'Mathematics', score: 85, date: '2026-04-01', trend: 'up' },
  { subject: 'Science', score: 78, date: '2026-04-01', trend: 'stable' },
  { subject: 'English', score: 92, date: '2026-04-01', trend: 'up' },
  { subject: 'History', score: 71, date: '2026-04-01', trend: 'down' },
];

const SUBJECT_PROGRESS = [
  { week: 'W1', math: 65, science: 58, english: 70, history: 55 },
  { week: 'W2', math: 70, science: 62, english: 75, history: 58 },
  { week: 'W3', math: 75, science: 68, english: 80, history: 62 },
  { week: 'W4', math: 80, science: 72, english: 85, history: 65 },
  { week: 'W5', math: 85, science: 78, english: 92, history: 71 },
];

export const ParentChildOverview = () => {

  const [searchParams] = useSearchParams();
  const childId = searchParams.get('childId');
  const navigate = useNavigate();
  const [child, setChild] = useState<ChildDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/parents/me/child-details?childId=${childId || 's1'}`, fetchOpts)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch child details');
        return res.json();
      })
      .then(data => {
        if (data && typeof data === 'object' && !data.error) {
          setChild(data);
        } else {
          setChild({
            id: 's1',
            name: 'Anvi Sharma',
            mood: 'ok',
            progress: 75,
            accuracy: 78,
            timePerQuestion: 25,
            weakTopics: ['Linear equations', 'Quadratic word problems'],
            recentActivity: [
              { id: 'a1', title: 'Algebra Quiz', type: 'quiz', date: '2026-04-03', score: 85 },
              { id: 'a2', title: 'Linear Equations Lesson', type: 'lesson', date: '2026-04-02' },
              { id: 'a3', title: 'Fractions Worksheet', type: 'assignment', date: '2026-04-01', score: 92 },
            ]
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching child details:', err);
        setChild({
          id: 's1',
          name: 'Anvi Sharma',
          mood: 'ok',
          progress: 75,
          accuracy: 78,
          timePerQuestion: 25,
          weakTopics: ['Linear equations', 'Quadratic word problems'],
          recentActivity: [
            { id: 'a1', title: 'Algebra Quiz', type: 'quiz', date: '2026-04-03', score: 85 },
            { id: 'a2', title: 'Linear Equations Lesson', type: 'lesson', date: '2026-04-02' },
            { id: 'a3', title: 'Fractions Worksheet', type: 'assignment', date: '2026-04-01', score: 92 },
          ]
        });
        setLoading(false);
      });
  }, [childId]);

  if (loading) return <PageSpinner label="Loading child details..." />;

  if (!child) return <ErrorState title="Child not found" hint="Could not find the requested child." onRetry={() => navigate(-1)} />;

  return (
    <div className="space-y-8 py-6">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-4xl font-black tracking-tighter">{child.name}'s Progress</h1>
          <p className="font-bold text-[var(--text-muted)]">Detailed overview of learning performance and grades.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[var(--bg-tertiary)] border-blue-400 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <BarChart2 size={24} className="text-blue-600" />
            <span className="text-xs font-black text-blue-600">Above Avg</span>
          </div>
          <p className="text-xs font-black uppercase text-[var(--text-muted)]">Overall Accuracy</p>
          <p className="text-4xl font-black">{child.accuracy}%</p>
        </Card>
        <Card className="bg-[var(--bg-tertiary)] border-[var(--border-success)] p-6 space-y-2">
          <div className="flex items-center justify-between">
            <TrendingUp size={24} className="text-[var(--text-success)]" />
            <span className="text-xs font-black text-[var(--text-success)]">Improving</span>
          </div>
          <p className="text-xs font-black uppercase text-[var(--text-muted)]">Progress</p>
          <p className="text-4xl font-black">{child.progress}%</p>
        </Card>
        <Card className="bg-[var(--bg-warning)] border-[var(--border-warning)] p-6 space-y-2">
          <div className="flex items-center justify-between">
            <MoodIcon mood={child.mood} size="sm" />
            <span className="text-xs font-black text-[var(--text-muted)] capitalize">{child.mood}</span>
          </div>
          <p className="text-xs font-black uppercase text-[var(--text-muted)]">Current Mood</p>
          <p className="text-4xl font-black uppercase">{child.mood}</p>
        </Card>
        <Card className="bg-[var(--bg-tertiary)] border-purple-400 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <Clock size={24} className="text-purple-600" />
            <span className="text-xs font-black text-purple-600">Consistent</span>
          </div>
          <p className="text-xs font-black uppercase text-[var(--text-muted)]">Avg Time / Question</p>
          <p className="text-4xl font-black">{child.timePerQuestion}s</p>
        </Card>
      </div>

      {/* Grades Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-black flex items-center gap-2 mb-4">
            <GraduationCap className="text-violet-600" /> Subject Grades
          </h2>
          <div className="space-y-3">
            {SUBJECT_GRADES.map(grade => (
              <div key={grade.subject} className="flex items-center justify-between p-3 neo-border bg-[var(--surface-card)]">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 flex items-center justify-center rounded-full font-black",
                    grade.score >= 80 ? "bg-[var(--bg-success)] text-[var(--text-success)]" :
                      grade.score >= 60 ? "bg-[var(--bg-warning)] text-[var(--text-warning)]" :
                        "bg-[var(--bg-danger)] text-[var(--text-danger)]"
                  )}>
                    {grade.score}
                  </div>
                  <div>
                    <p className="font-black">{grade.subject}</p>
                    <p className="text-xs font-bold text-[var(--text-muted)]">{grade.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {grade.trend === 'up' && <TrendingUp size={18} className="text-green-500" />}
                  {grade.trend === 'down' && <TrendingDown size={18} className="text-red-500" />}
                  {grade.trend === 'stable' && <TrendingUp size={18} className="text-gray-400" />}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Progress Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-black flex items-center gap-2 mb-4">
            <TrendingUp className="text-[var(--text-success)]" /> Weekly Progress
          </h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SUBJECT_PROGRESS}>
                <XAxis dataKey="week" tick={{ fontSize: 12, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 12, fontWeight: 700 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '2px solid black', fontWeight: 700 }}
                />
                <Line type="monotone" dataKey="math" stroke="#3b82f6" strokeWidth={2} name="Math" />
                <Line type="monotone" dataKey="science" stroke="#22c55e" strokeWidth={2} name="Science" />
                <Line type="monotone" dataKey="english" stroke="#a855f7" strokeWidth={2} name="English" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Clock /> Recent Activity
          </h2>
          <div className="space-y-4">
            {child.recentActivity.map(activity => (
              <Card key={activity.id} className="flex items-center justify-between p-4 hover:translate-x-2 transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 neo-border rounded-full",
                    activity.type === 'quiz' ? "bg-[var(--bg-tertiary)]" : "bg-[var(--bg-tertiary)]"
                  )}>
                    {activity.type === 'quiz' ? <BarChart2 size={18} /> : <BookOpen size={18} />}
                  </div>
                  <div>
                    <h3 className="font-black">{activity.title}</h3>
                    <p className="text-xs font-bold text-[var(--text-muted)]">{activity.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  {activity.score !== undefined && (
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-[var(--text-muted)]">Score</p>
                      <p className={cn(
                        "font-black",
                        activity.score >= 80 ? "text-[var(--text-success)]" : activity.score >= 50 ? "text-yellow-600" : "text-[var(--text-danger)]"
                      )}>{activity.score}%</p>
                    </div>
                  )}
                  <Button className="p-1">
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <AlertCircle /> Needs Support
          </h2>
          <div className="space-y-4">
            {child.weakTopics.map(topic => (
              <Card key={topic} className="bg-[var(--bg-danger)] border-[var(--border-danger)] p-6 space-y-4">
                <h3 className="text-xl font-black">{topic}</h3>
                <p className="text-sm font-bold text-[var(--text-muted)]">
                  {child.name} is finding this topic challenging.
                </p>
                <div className="flex gap-2">
                  <Button className="text-xs py-1 flex-1 bg-[var(--surface-card)]" onClick={() => navigate(`/student/roadmap`)}>View Topic</Button>
                  <Button className="text-xs py-1 flex-1 bg-red-400 text-white">Get Help</Button>
                </div>
              </Card>
            ))}
            <Card className="bg-[var(--bg-tertiary)] border-[var(--border-success)] p-6 space-y-4">
              <div className="flex items-center gap-2 font-black text-[var(--text-success)]">
                <Heart size={18} /> Study Tip
              </div>
              <p className="text-sm font-bold text-[var(--text-muted)]">
                Encourage {child.name} to practice daily for best results.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
