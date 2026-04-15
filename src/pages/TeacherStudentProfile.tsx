import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Tag, MoodIcon, PageSpinner, ErrorState } from '../components/UI';
import { ArrowLeft, TrendingUp, BookOpen, Clock, BarChart2, AlertCircle, Heart, ChevronRight, User, Mail, Calendar, Brain, Sparkles, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from 'recharts';

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  classId: string;
  className: string;
  mood: string;
  progress: number;
  accuracy: number;
  timePerQuestion: number;
  weakTopics: string[];
  recentActivity: { id: string; title: string; type: string; date: string; score?: number }[];
  cognitiveStyle: {
    pace: string;
    preference: string;
    approach: string[];
  };
  personalityReport?: {
    type: string;
    report: string;
    strengths: string[];
    recommendations: string[];
  };
  quizHistory?: { date: string; score: number; topic: string }[];
}

const fetchOpts: RequestInit = { credentials: 'include' };

const MOCK_PROFILE: StudentProfile = {
  id: 's1',
  name: 'Student Name',
  email: 'student@edyzen.com',
  role: 'student',
  classId: 'c1',
  className: 'Grade 7 - Mathematics',
  mood: 'ok',
  progress: 65,
  accuracy: 78,
  timePerQuestion: 25,
  weakTopics: ['Linear equations', 'Quadratic word problems'],
  recentActivity: [
    { id: 'a1', title: 'Algebra Quiz', type: 'quiz', date: 'Apr 3, 2026', score: 75 },
    { id: 'a2', title: 'Linear Equations Lesson', type: 'lesson', date: 'Apr 2, 2026' },
  ],
  cognitiveStyle: {
    pace: 'Medium',
    preference: 'Visual',
    approach: ['Explorer', 'Hands-on'],
  },
  personalityReport: {
    type: 'Visual Learner',
    report: 'Student learns best through visual aids, diagrams, and color-coded notes.',
    strengths: ['Visual thinking', 'Pattern recognition'],
    recommendations: ['Use color-coded notes', 'Watch video explanations'],
  },
  quizHistory: [
    { date: 'Week 1', score: 65, topic: 'Algebra' },
    { date: 'Week 2', score: 72, topic: 'Algebra' },
  ],
};

export const TeacherStudentProfile = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState('');
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialUrl, setMaterialUrl] = useState('');

  useEffect(() => {
    fetch(`/api/teachers/me/students/${studentId || 's1'}`, fetchOpts)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch student profile');
        return res.json();
      })
      .then(data => {
        if (data && typeof data === 'object' && !data.error) {
          setProfile({
            ...MOCK_PROFILE,
            ...data,
            cognitiveStyle: data.cognitiveStyle || MOCK_PROFILE.cognitiveStyle,
            weakTopics: data.weakTopics || [],
            recentActivity: data.recentActivity || [],
            personalityReport: data.personalityReport || undefined,
            quizHistory: data.quizHistory || [],
          });
        } else {
          setProfile(MOCK_PROFILE);
        }
        setLoading(false);
      })
      .catch(() => {
        setProfile(MOCK_PROFILE);
        setLoading(false);
      });
  }, [studentId]);

  if (loading) return <PageSpinner label="Loading student profile..." />;

  if (!profile) return <ErrorState title="Profile not found" hint="Could not find this student." onRetry={() => navigate(-1)} />;

  return (
    <div className="space-y-8 py-6">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Student Profile: {profile.name}</h1>
          <p className="font-bold text-gray-600">Class: {profile.className}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="w-32 h-32 neo-border bg-blue-100 flex items-center justify-center text-5xl font-black rounded-full">
              {profile.name[0]}
            </div>
            <div>
              <h2 className="text-2xl font-black">{profile.name}</h2>
              <div className="flex items-center justify-center gap-2 text-gray-500 font-bold text-sm">
                <Mail size={16} /> {profile.email}
              </div>
            </div>
            <div className="flex gap-2">
              <Tag color="#3b82f6">{profile.role}</Tag>
              <Tag color="#facc15">{profile.className}</Tag>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <Button
                onClick={() => navigate("/attendance")}
                className="text-xs py-1"
              >
                View Attendance
              </Button>

              <Button
                className="text-xs py-1"
                onClick={() => {
                  window.location.href = `mailto:${profile.email}`;
                }}
              >
                Contact Student
              </Button>
            </div>
            <div className="w-full pt-6 border-t-2 border-black space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-black text-sm text-gray-500 uppercase">Current Mood</span>
                <MoodIcon mood={profile.mood} size="sm" />
              </div>
            {(profile.accuracy < 50 || profile.mood === "stressed") && (
            <div className="p-4 neo-border mt-4" style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}>
              <p className="font-black text-red-500">
                ⚠️ High Risk Student
              </p>
              <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                Low performance or negative mood detected
              </p>
            </div>
            )}
              <div className="flex justify-between items-center">
                <span className="font-black text-sm text-gray-500 uppercase">Last Active</span>
                <span className="font-bold">2 hours ago</span>
              </div>
            </div>
          </Card>

          {actionNotice && (
            <p className="text-sm font-black text-indigo-900 bg-indigo-50 neo-border px-4 py-3">
              {actionNotice}
            </p>
          )}

          <Card className="p-8 space-y-6">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Heart className="text-red-500" /> Cognitive Style
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-500">Learning Pace</p>
                <p className="font-bold">{profile.cognitiveStyle.pace}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-500">Preference</p>
                <p className="font-bold">{profile.cognitiveStyle.preference}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-500">Approach</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.cognitiveStyle.approach.map(tag => (
                    <Tag key={tag} color="#ddd">{tag}</Tag>
                  ))}
                </div>
              </div>
</div>
            </Card>

            {/* Personality Report */}
            {(profile.personalityReport) && (
              <Card className="p-8 space-y-6">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <Sparkles className="text-violet-600" /> Personality Report
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-500">Learning Type</p>
                    <p className="font-bold text-lg text-violet-700">{profile.personalityReport.type}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-500">Report</p>
                    <p className="font-bold text-sm">{profile.personalityReport.report}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Strengths</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.personalityReport.strengths.map((s, i) => (
                      <Tag key={i} color="#dcfce7">{s}</Tag>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Recommendations</p>
                  <ul className="space-y-1">
                    {profile.personalityReport.recommendations.map((r, i) => (
                      <li key={i} className="text-sm font-bold">• {r}</li>
                    ))}
                  </ul>
                </div>
              </Card>
            )}

            {/* Quiz Progress Chart */}
            {(profile.quizHistory) && (
              <Card className="p-8 space-y-6">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <TrendingUp className="text-green-600" /> Progress Report
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={profile.quizHistory}>
                      <XAxis dataKey="date" tick={{ fontSize: 12, fontWeight: 700 }} />
                      <YAxis tick={{ fontSize: 12, fontWeight: 700 }} domain={[0, 100]} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: '2px solid black', fontWeight: 700 }} />
                      <Line type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={3} name="Score %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6 space-y-4">
            <h3 className="font-black text-lg">Quick Actions</h3>

            <div className="flex gap-4 flex-wrap">
              <Button onClick={() => navigate("/attendance")}>
                Take Attendance
              </Button>

              <Button onClick={() => navigate("/teacher/calendar")}>
                View Schedule
              </Button>

              <Button
                onClick={() =>
                  setActionNotice('Assign quizzes from Curriculum — module wiring next.')
                }
              >
                Assign Quiz
              </Button>
            </div>
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <Card className="p-6 space-y-2" style={{ backgroundColor: 'rgba(37,99,235,0.12)', borderColor: 'rgba(37,99,235,0.4)' }}>
              <BarChart2 size={24} className="text-blue-600" />
              <p className="text-xs font-black uppercase text-gray-500">Accuracy</p>
              <p className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{profile.accuracy}%</p>
            </Card>
            <Card className="p-6 space-y-2" style={{ backgroundColor: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.4)' }}>
              <TrendingUp size={24} className="text-green-600" />
              <p className="text-xs font-black uppercase text-gray-500">Progress</p>
              <p className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{profile.progress}%</p>
            </Card>
            <Card className="p-6 space-y-2" style={{ backgroundColor: 'rgba(124,58,237,0.12)', borderColor: 'rgba(124,58,237,0.4)' }}>
              <Clock size={24} className="text-purple-600" />
              <p className="text-xs font-black uppercase text-gray-500">Time / Q</p>
              <p className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{profile.timePerQuestion}s</p>
            </Card>
          </div>

          <Card className="p-8 space-y-6">
            <h3 className="text-2xl font-black flex items-center gap-2">
              <Clock /> Recent Activity
            </h3>
            <div className="space-y-4">
              {profile.recentActivity.map(activity => (
                <div key={activity.id} className="flex items-center justify-between p-4 neo-border bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 neo-border rounded-full",
                      activity.type === 'quiz' ? "bg-purple-100" : "bg-blue-100"
                    )}>
                      {activity.type === 'quiz' ? <BarChart2 size={18} /> : <BookOpen size={18} />}
                    </div>
                    <div>
                      <h3 className="font-black">{activity.title}</h3>
                      <p className="text-xs font-bold text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                  {activity.score !== undefined && (
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-gray-500">Score</p>
                      <p className={cn(
                        "font-black",
                        activity.score >= 80 ? "text-green-600" : activity.score >= 50 ? "text-yellow-600" : "text-red-600"
                      )}>{activity.score}%</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-8 space-y-6">
            <h3 className="text-2xl font-black flex items-center gap-2">
              <AlertCircle className="text-red-600" /> Areas for Improvement
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.weakTopics.map(topic => (
                <div key={topic} className="p-4 neo-border flex items-center justify-between" style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}>
                  <span className="font-black" style={{ color: 'var(--text-primary)' }}>{topic}</span>
                  <Tag color="#ef4444">Weak</Tag>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t-2 border-black space-y-3">
              <p className="font-bold text-sm text-gray-600">
                Recommendation: Assign extra practice materials for {profile.weakTopics.join(', ')}.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black uppercase text-gray-500 block mb-1">
                    Material title
                  </label>
                  <input
                    value={materialTitle}
                    onChange={(e) => setMaterialTitle(e.target.value)}
                    className="w-full neo-border p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-gray-500 block mb-1">
                    Link / URL
                  </label>
                  <input
                    value={materialUrl}
                    onChange={(e) => setMaterialUrl(e.target.value)}
                    className="w-full neo-border p-2 font-bold"
                  />
                </div>
              </div>
              <Button
                className="mt-2 text-xs py-1"
                onClick={async () => {
                  if (!materialTitle.trim() || !materialUrl.trim()) {
                    setActionNotice('Add a title and URL before assigning.');
                    return;
                  }
                  await fetch('/api/materials', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                      title: materialTitle.trim(),
                      url: materialUrl.trim(),
                      studentId: profile.id,
                    }),
                  });
                  setActionNotice('Material assignment recorded.');
                  setMaterialTitle('');
                  setMaterialUrl('');
                }}
              >
                Assign materials
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
