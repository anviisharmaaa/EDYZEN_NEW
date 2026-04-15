import { useParams, useNavigate, Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Card, Button } from '../components/UI';
import {

  ChevronLeft,
  Play,
  FileText,
  CheckCircle,
  Lock,
  MessageSquare,
  Highlighter,
  Award,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CourseMapPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topicData, setTopicData] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [askPanelLoading, setAskPanelLoading] = useState(false);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [aiExplanation, setAiExplanation] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplainError, setAiExplainError] = useState('');

  useEffect(() => {
    if (!topicId) return;

    const opts: RequestInit = { credentials: "include" };

    Promise.all([
      fetch(`/api/topics/${topicId}`, opts),
      fetch(`/api/topics/${topicId}/course-map`, opts),
    ])
      .then(async ([topicRes, mapRes]) => {
        const topicJson = topicRes.ok ? await topicRes.json() : {};
        const mapJson = mapRes.ok ? await mapRes.json() : { lessons: [] };
        setTopicData({
          ...topicJson,
          id: topicJson.id ?? topicId,
          title: topicJson.title ?? "Topic",
          lessons: Array.isArray(mapJson.lessons) ? mapJson.lessons : [],
        });
      })
      .catch(() => {
        setTopicData(null);
      })
      .finally(() => setLoading(false));
  }, [topicId]);

  const handleAskAI = async (text: string) => {
    setAskPanelLoading(true);
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text })
      });
      if (!res.ok) throw new Error('AI request failed');
      const data = await res.json();
      setAiResponse(data);
    } catch (err) {
      setAiResponse({ explanation: "AI service is temporarily unavailable. Please try again later." });
    }
    setAskPanelLoading(false);
  };

  const handleHighlight = () => {
    const selection = window.getSelection()?.toString();
    if (selection) {
      setHighlights([...highlights, selection]);
      // In a real app, we'd save this to the backend
    }
  };

  if (loading) return <div className="p-8">Loading topic...</div>;

  if (!topicData || !topicData.lessons?.length) {
    return (
      <div className="p-8 max-w-lg mx-auto space-y-4">
        <p className="font-black text-lg">No topic or lessons found</p>
        <Button onClick={() => navigate('/student/roadmap')}>Back to roadmap</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={() => navigate('/student/dashboard')} className="flex items-center gap-2">
            <ChevronLeft size={18} /> Back to Dashboard
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 neo-card bg-white px-4 py-2 font-black">
              <Award className="text-yellow-500" /> 1250 pts
            </div>
            <div className="flex items-center gap-2 neo-card bg-white px-4 py-2 font-black">
              <Clock className="text-blue-500" /> 5 Day Streak
            </div>
          </div>
        </div>

        <Card className="p-6 neo-border bg-white hover:shadow-lg transition space-y-6">
          <div className="space-y-6">
            <h1 className="text-2xl font-black tracking-tight">{topicData.title}</h1>
            <p className="text-gray-600 font-bold leading-relaxed">
              {topicData.description ||
                'Work through each lesson below. Use AI for a quick plain-language recap anytime.'}
            </p>
            <div className="space-y-4">
              {topicData.lessons.map((lesson: any, index: number) => (
                <div
                  key={lesson.id}
                  className="p-6 neo-border bg-white hover:shadow-lg transition"
                >
                  <h3 className="font-black">
                    Lesson {index + 1}: {lesson.title}
                  </h3>
                  <p className="text-sm text-gray-500 font-bold mt-1">
                    {lesson.description ||
                      (typeof lesson.content === 'string'
                        ? lesson.content.slice(0, 120) +
                        (lesson.content.length > 120 ? '…' : '')
                        : 'No description')}
                  </p>
                  <Button
                    className="mt-3 text-xs"
                    disabled={aiLoading}
                    onClick={() => {
                      setAiExplainError('');
                      setAiLoading(true);
                      fetch('/api/ai/explain', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                          topic: topicData.title,
                          lesson: lesson.title,
                        }),
                      })
                        .then((res) => res.json())
                        .then((data) => {
                          setAiExplanation(
                            data?.explanation ||
                            'No explanation returned. Try again.'
                          );
                        })
                        .catch(() =>
                          setAiExplainError('Could not load explanation. Try again.')
                        )
                        .finally(() => setAiLoading(false));
                    }}
                  >
                    {aiLoading ? 'Loading…' : 'Explain with AI'}
                  </Button>
                </div>
              ))}
            </div>
            {(aiLoading || aiExplanation || aiExplainError) && (
              <div className="p-6 neo-border bg-blue-50 mt-6">
                <h3 className="text-2xl font-black tracking-tight mb-2">
                  AI explanation
                </h3>
                {aiExplainError ? (
                  <p className="text-sm font-bold text-red-700">{aiExplainError}</p>
                ) : aiLoading ? (
                  <p className="text-sm font-bold text-gray-600">Loading explanation…</p>
                ) : (
                  <p className="text-sm font-bold text-gray-800 leading-relaxed">
                    {aiExplanation}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Course Map */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Course Map</h2>
              <div className="space-y-4 relative">
                {/* Vertical Line */}
                <div className="absolute left-[19px] top-4 bottom-4 w-1 bg-black opacity-10" />

                {topicData.lessons.map((lesson: any, idx: number) => (
                  <div key={lesson.id} className="relative flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full neo-border flex items-center justify-center font-black z-10 ${lesson.status === 'completed' ? 'bg-green-400' :
                        lesson.status === 'in-progress' ? 'bg-blue-400' : 'bg-gray-200'
                      }`}>
                      {lesson.status === 'completed' ? <CheckCircle size={20} /> : idx + 1}
                    </div>
                    <button
                      onClick={() => lesson.status !== 'locked' && setSelectedLesson(lesson)}
                      className={`flex-1 text-left p-4 neo-card transition-all ${selectedLesson?.id === lesson.id ? 'bg-black text-white translate-x-2' :
                          lesson.status === 'locked' ? 'opacity-50 cursor-not-allowed' : 'bg-white hover:translate-x-1'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black">{lesson.title}</span>
                        {lesson.status === 'locked' && <Lock size={16} />}
                      </div>
                      <p className={`text-xs mt-1 ${selectedLesson?.id === lesson.id ? 'text-gray-400' : 'text-gray-500'}`}>
                        {lesson.type === 'quiz' ? 'Assessment' : 'Lesson Content'}
                      </p>
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right: Content Area */}
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="wait">
              {selectedLesson && (
                <motion.div
                  key={selectedLesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <h1 className="text-4xl font-black uppercase tracking-tighter">{selectedLesson.title}</h1>
                      <Button variant="outline" onClick={handleHighlight} className="flex items-center gap-2">
                        <Highlighter size={18} /> Highlight Selection
                      </Button>
                    </div>

                    {selectedLesson.videoUrl && (
                      <div className="aspect-video neo-border overflow-hidden bg-black">
                        <iframe
                          width="100%"
                          height="100%"
                          src={selectedLesson.videoUrl}
                          title="Lesson Video"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}

                    <div className="prose prose-xl max-w-none font-bold text-gray-800 leading-relaxed">
                      {selectedLesson.content}
                    </div>

                    {/* Interactive Bit */}
                    <div className="p-6 neo-border bg-yellow-50 space-y-4">
                      <h3 className="text-xl font-black flex items-center gap-2">
                        <Play size={20} className="text-yellow-600" /> Quick Check
                      </h3>
                      <p className="font-bold">What is a variable in algebra?</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['A fixed number', 'A symbol for a number', 'A type of equation', 'A mathematical rule'].map((opt, i) => (
                          <button key={i} className="p-4 neo-card bg-white hover:bg-black hover:text-white font-black text-left transition-colors">
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t-4 border-black">
                      <div className="flex gap-2">
                        {highlights.length > 0 && (
                          <div className="flex items-center gap-2 neo-card bg-indigo-50 px-3 py-1 text-xs font-black">
                            <Highlighter size={14} /> {highlights.length} Highlights
                          </div>
                        )}
                      </div>
                      <div className="flex gap-4">
                        {selectedLesson.type === 'quiz' ? (
                          <Link to={`/student/quiz/${selectedLesson.quizId}`}>
                            <Button className="bg-green-500 flex items-center gap-2">
                              Start Quiz <ArrowRight size={18} />
                            </Button>
                          </Link>
                        ) : (
                          <Button className="flex items-center gap-2">
                            Mark as Complete <CheckCircle size={18} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Panel */}
            <Card className="p-6 bg-indigo-600 text-white space-y-4">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <MessageSquare /> Ask EDYZEN AI
              </h2>
              <p className="font-bold opacity-90">Confused about something? Ask me to explain it differently!</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-black uppercase opacity-80">
                    Your question
                  </label>
                  <input
                    type="text"
                    aria-label="Question for AI"
                    className="w-full p-4 neo-border bg-white text-black font-bold outline-none"
                    onKeyDown={(e) =>
                      e.key === 'Enter' &&
                      handleAskAI((e.target as HTMLInputElement).value)
                    }
                  />
                </div>
                <Button
                  onClick={() => handleAskAI('variables')}
                  className="bg-black hover:bg-gray-900"
                  disabled={askPanelLoading}
                >
                  {askPanelLoading ? 'Thinking...' : 'Ask AI'}
                </Button>
              </div>

              {aiResponse && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-6 bg-white text-black neo-border space-y-4"
                >
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase text-indigo-600">AI Explanation</p>
                    <p className="font-bold leading-relaxed">{aiResponse.explanation}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-black uppercase text-green-600">Examples</p>
                      <ul className="list-disc list-inside font-bold">
                        {aiResponse.examples.map((ex: string, i: number) => <li key={i}>{ex}</li>)}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-black uppercase text-red-600">Practice</p>
                      {aiResponse.practiceQuestions.map((q: any, i: number) => (
                        <div key={i} className="text-sm font-bold p-2 bg-gray-50 neo-border">
                          Q: {q.question}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
