
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import { Button } from '../components/UI';
import {
  Brain,
  Sparkles,
  Loader2,
  Download,
  Share2,
  TrendingUp,
  ShieldAlert,
  Lightbulb,
  Heart,
  Book,
  Users,
  ChevronLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

const strengthData = [
  { subject: 'Visual Memory', A: 120, fullMark: 150 },
  { subject: 'Holistic Thinking', A: 98, fullMark: 150 },
  { subject: 'Persistence', A: 86, fullMark: 150 },
  { subject: 'Analytical', A: 99, fullMark: 150 },
  { subject: 'Creativity', A: 85, fullMark: 150 },
  { subject: 'Communication', A: 65, fullMark: 150 },
];

export const PersonalityReportPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [behaviorData, setBehaviorData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);

  const displayName = user?.name || 'Student';

  useEffect(() => {
    fetch('/api/students/me/behavior-summary', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setBehaviorData(data))
      .catch(() => {});
    fetch('/api/students/me/profile', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setProfileData(data))
      .catch(() => {});
    fetch('/api/students/me/personality', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.report) setReport(data.report);
      })
      .catch(() => {});
  }, []);

  const aiPersonalityPills = useMemo(() => {
    const approach = behaviorData?.profile?.approachTag || 'explorer';
    const preference = behaviorData?.profile?.preferenceTag || 'visual';
    return [
      approach.charAt(0).toUpperCase() + approach.slice(1),
      preference === 'visual'
        ? 'Visual'
        : preference === 'analytical'
          ? 'Analytical'
          : 'Reflective',
      'Adaptive',
    ];
  }, [behaviorData]);

const generateReport = async () => {
    if (!behaviorData) return;
    setLoading(true);
    try {
      const accuracy =
        profileData?.performance?.accuracy ??
        Math.round(behaviorData.stats?.accuracy ?? 0);
      const avgTime = profileData?.performance?.avgTime ?? 0;
      const weakTopics = (
        profileData?.weakTopics?.length
          ? profileData.weakTopics
          : ['(not enough quiz data yet)']
      ).join(', ');
      
      // Generate a simple mock report based on student data
      const report = `
## Personality Type
**The Analytical Explorer** - ${displayName} shows a balanced learning style with strong analytical capabilities. With ${accuracy}% accuracy, they demonstrate solid understanding while taking an average of ${avgTime} seconds per question.

## Strengths
- Strong problem-solving abilities (${accuracy}% accuracy)
- Consistent engagement with learning materials
- Good time management during quizzes

## Weaknesses
- ${weakTopics !== '(not enough quiz data yet)' ? weakTopics : 'Need more quiz data to identify specific areas'}
- May need support with time-intensive topics

## Study Strategy
- Focus on weak topics for 15-20 minutes daily
- Take short breaks between intense study sessions
- Use visual aids for complex concepts

## Actionable Advice
- Review ${weakTopics !== '(not enough quiz data yet)' ? weakTopics : 'practice quizzes'} regularly
- Set small daily goals to build momentum
- Track progress weekly to stay motivated
`;

      setReport(report);
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!behaviorData) {
    return (
      <div className="min-h-screen bg-report-bg flex items-center justify-center p-12">
        <p className="font-black text-gray-500 animate-pulse">
          Loading behavioral data…
        </p>
      </div>
    );
  }

  const approach = behaviorData.profile?.approachTag || 'Explorer';

  return (
    <div className="min-h-screen bg-report-bg text-report-ink selection:bg-lilac pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 min-h-16 flex flex-wrap items-center justify-between gap-3 px-6 md:px-12 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="pill-tag border-gray-200 hover:bg-gray-50 flex items-center gap-2"
          >
            <ChevronLeft size={14} /> Back
          </button>
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-black text-xl">
            E
          </div>
          <div>
            <span className="font-black tracking-tighter">EDYZEN</span>
            <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Learning Personality Report
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="pill-tag border-gray-200 hover:bg-gray-50 flex items-center gap-2"
          >
            <Download size={14} /> Export PDF
          </button>
          <button
            type="button"
            className="pill-tag bg-periwinkle border-periwinkle text-white hover:bg-indigo-500 flex items-center gap-2"
          >
            <Share2 size={14} /> Share Report
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 pt-8">
        <div className="relative w-full min-h-[16rem] bg-gradient-to-br from-lilac to-mint rounded-[32px] p-8 md:p-12 mb-12 flex flex-col md:flex-row items-center justify-between overflow-hidden gap-8">
          <div className="z-10 space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-[0.2em] opacity-60">
                Student profile
              </p>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                {displayName}
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              {aiPersonalityPills.map((pill) => (
                <span key={pill} className="pill-tag bg-white/50 border-transparent">
                  {pill}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 text-sm font-bold opacity-70 flex-wrap">
              <span>AI personality: {approach}</span>
              <span>•</span>
              <span>Report date: {new Date().toLocaleDateString()}</span>
            </div>
          </div>

          <div className="relative h-40 w-40 flex items-center justify-center shrink-0">
            <div className="z-10 w-32 h-32 bg-white rounded-full border-4 border-ink flex flex-col items-center justify-center text-center p-4 shadow-xl">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">
                Core
              </span>
              <span className="text-sm font-black leading-tight capitalize">{approach}</span>
            </div>
          </div>
        </div>

        {!report ? (
          <div className="report-card flex flex-col items-center text-center space-y-8">
            <div className="w-24 h-24 bg-lilac rounded-full flex items-center justify-center text-ink shadow-inner">
              <Brain size={48} />
            </div>
            <div className="max-w-md space-y-4">
              <h2 className="text-3xl font-black">Ready to dive deep?</h2>
              <p className="text-gray-600 font-medium">
                We&apos;ll synthesize your clicks, quiz attempts, and mood signals into strengths,
                weaknesses, study tips, and actionable advice for {displayName}.
              </p>
            </div>
            <Button
              variant="primary"
              className="h-16 px-12 text-xl bg-periwinkle hover:bg-indigo-500 border-none shadow-xl shadow-indigo-100 flex items-center gap-3"
              onClick={generateReport}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Synthesizing insights…
                </>
              ) : (
                <>
                  <Sparkles size={24} />
                  Generate full report
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            <section className="report-card">
              <h2 className="text-2xl font-black mb-2">Your AI report</h2>
              <p className="text-sm font-bold text-gray-500 mb-6">
                Strengths, weaknesses, study tips, and actionable advice — personalized for{' '}
                {displayName}.
              </p>
              <div className="report-body">
                <ReactMarkdown>{report}</ReactMarkdown>
              </div>
            </section>

            <section className="report-card">
              <h2 className="text-2xl font-black mb-6">Learning signal snapshot</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={strengthData}>
                      <PolarGrid stroke="#eee" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#999', fontSize: 10, fontWeight: 'bold' }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 150]}
                        tick={false}
                        axisLine={false}
                      />
                      <Radar
                        name={displayName}
                        dataKey="A"
                        stroke="#A5A6F6"
                        fill="#A5A6F6"
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <ul className="space-y-3 text-sm font-bold text-gray-700">
                  <li className="flex gap-2">
                    <TrendingUp className="text-mint shrink-0" size={18} />
                    Attempts logged: {behaviorData.stats?.totalAttempts ?? 0}
                  </li>
                  <li className="flex gap-2">
                    <ShieldAlert className="text-coral shrink-0" size={18} />
                    Recent mood: {behaviorData.stats?.recentMood ?? '—'}
                  </li>
                  <li className="flex gap-2">
                    <Lightbulb className="text-periwinkle shrink-0" size={18} />
                    Accuracy (all attempts):{' '}
                    {Math.round(behaviorData.stats?.accuracy ?? 0)}%
                  </li>
                </ul>
              </div>
            </section>

            <section className="report-card grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <h3 className="font-black flex items-center gap-2">
                  <Users size={18} className="text-periwinkle" /> Strengths (quick view)
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {displayName}, you show strong persistence when problems feel meaningful. Lean into
                  visual maps and worked examples before timed quizzes.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="font-black flex items-center gap-2">
                  <Book size={18} className="text-periwinkle" /> Study tips
                </h3>
                <ul className="text-sm font-bold text-gray-700 space-y-2">
                  <li>• Study in short bursts with a visible timer.</li>
                  <li>• Alternate reading with practice problems.</li>
                  <li>• Summarize each lesson in 3 bullet points.</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-black flex items-center gap-2">
                  <Heart size={18} className="text-periwinkle" /> Well-being
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Pair challenge with recovery: after a hard quiz, take a short walk or journal one win
                  from the session.
                </p>
              </div>
            </section>

            <footer className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between gap-4 items-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              <span>Generated by EDYZEN – Learning &amp; well-being engine</span>
              <span>{new Date().toLocaleDateString()}</span>
              <span className="text-center md:text-right">
                Educational insight tool • Not a clinical diagnosis
              </span>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
};
