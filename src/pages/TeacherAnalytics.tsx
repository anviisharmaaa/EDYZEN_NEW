import React, { useEffect, useState } from 'react';
import { Card, Button, Tag, MoodIcon } from '../components/UI';
import { BarChart2, TrendingUp, AlertCircle, Users, ArrowDown, ArrowUp, Search, ChevronRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { cn } from '../lib/utils';

interface ClassAnalytics {
  id: string;
  name: string;
  avgAccuracy: number;
  avgTimePerQuestion: number;
  moodDistribution: Record<string, number>;
  weakTopics: string[];
  topPerformers: { id: string; name: string; score: number }[];
  strugglingStudents: { id: string; name: string; score: number; mood: string }[];
}

export const TeacherAnalytics = () => {

  const [searchParams] = useSearchParams();
  const classId = searchParams.get('classId');
  const [analytics, setAnalytics] = useState<ClassAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/teachers/me/analytics?classId=${classId || 'class_10a'}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch analytics');
        return res.json();
      })
      .then(data => {
        if (data && typeof data === 'object' && !data.error) {
          setAnalytics(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching analytics:', err);
        setLoading(false);
      });
  }, [classId]);

  if (loading) return <div className="p-8">Loading analytics...</div>;
  if (!analytics) return <div className="p-8">Analytics data not found.</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Class Analytics: {analytics.name}</h1>
          <p className="font-bold text-[var(--text-muted)]">Deep dive into class performance, mood, and learning trends.</p>
        </div>
        <div className="flex gap-4">
          <select className="neo-input font-bold px-4 py-2">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Semester</option>
          </select>
          <Button variant="primary">Export Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[var(--bg-tertiary)] border-blue-400 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <BarChart2 size={24} className="text-blue-600" />
            <span className="flex items-center gap-1 text-[var(--text-success)] font-black text-xs">
              <ArrowUp size={14} /> 5%
            </span>
          </div>
          <p className="text-xs font-black uppercase text-[var(--text-muted)]">Avg. Accuracy</p>
          <p className="text-4xl font-black">{analytics.avgAccuracy}%</p>
        </Card>
        <Card className="bg-[var(--bg-tertiary)] border-purple-400 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <TrendingUp size={24} className="text-purple-600" />
            <span className="flex items-center gap-1 text-[var(--text-danger)] font-black text-xs">
              <ArrowUp size={14} /> 12s
            </span>
          </div>
          <p className="text-xs font-black uppercase text-[var(--text-muted)]">Avg. Time / Question</p>
          <p className="text-4xl font-black">{analytics.avgTimePerQuestion}s</p>
        </Card>
        <Card className="bg-[var(--bg-warning)] border-[var(--border-warning)] p-6 space-y-2">
          <div className="flex items-center justify-between">
            <MoodIcon mood="ok" size="sm" />
            <span className="text-xs font-black text-[var(--text-muted)]">Stable</span>
          </div>
          <p className="text-xs font-black uppercase text-[var(--text-muted)]">Dominant Mood</p>
          <p className="text-4xl font-black uppercase">OK</p>
        </Card>
        <Card className="bg-[var(--bg-danger)] border-[var(--border-danger)] p-6 space-y-2">
          <div className="flex items-center justify-between">
            <AlertCircle size={24} className="text-[var(--text-danger)]" />
            <span className="text-xs font-black text-[var(--text-danger)]">Action Needed</span>
          </div>
          <p className="text-xs font-black uppercase text-[var(--text-muted)]">Weak Topics</p>
          <p className="text-4xl font-black">{analytics.weakTopics.length}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8 space-y-6">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <AlertCircle className="text-[var(--text-danger)]" /> Struggling Students
          </h2>
          <div className="space-y-4">
            {analytics.strugglingStudents?.map(student => (
              <div key={student.id} className="flex items-center justify-between p-4 neo-border bg-[var(--bg-danger)]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 neo-border bg-[var(--surface-card)] flex items-center justify-center font-black">
                    {student.name[0]}
                  </div>
                  <div>
                    <h3 className="font-black">{student.name}</h3>
                    <div className="flex items-center gap-2">
                      <MoodIcon mood={student.mood} size="xs" />
                      <span className="text-[10px] font-black uppercase text-[var(--text-muted)]">{student.mood}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-[var(--text-muted)]">Accuracy</p>
                    <p className="font-black text-[var(--text-danger)]">{student.score}%</p>
                  </div>
                  <Link to={`/teacher/students/${student.id}`}>
                    <Button className="p-2">
                      <ChevronRight size={18} />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-8 space-y-6">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <TrendingUp className="text-[var(--text-success)]" /> Top Performers
          </h2>
          <div className="space-y-4">
            {analytics.topPerformers?.map(student => (
              <div key={student.id} className="flex items-center justify-between p-4 neo-border bg-[var(--bg-tertiary)]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 neo-border bg-[var(--surface-card)] flex items-center justify-center font-black">
                    {student.name[0]}
                  </div>
                  <div>
                    <h3 className="font-black">{student.name}</h3>
                    <Tag color="#4ade80">High Performer</Tag>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-[var(--text-muted)]">Accuracy</p>
                    <p className="font-black text-[var(--text-success)]">{student.score}%</p>
                  </div>
                  <Link to={`/teacher/students/${student.id}`}>
                    <Button className="p-2">
                      <ChevronRight size={18} />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-8 space-y-6">
        <h2 className="text-2xl font-black flex items-center gap-2">
          <BarChart2 /> Weak Topics Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analytics.weakTopics?.map(topic => (
            <div key={topic} className="p-6 neo-border bg-[var(--bg-secondary)] space-y-4">
              <h3 className="text-xl font-black">{topic}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-black uppercase text-[var(--text-muted)]">
                  <span>Class Mastery</span>
                  <span>42%</span>
                </div>
                <div className="h-3 neo-border bg-[var(--surface-card)] overflow-hidden">
                  <div className="h-full bg-red-400" style={{ width: '42%' }} />
                </div>
              </div>
              <p className="text-sm font-bold text-[var(--text-muted)] italic">
                Recommendation: Schedule a review session or provide extra materials.
              </p>
              <Button className="w-full text-xs py-1">View Topic Insights</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
