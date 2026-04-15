import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Tag, MoodIcon, PageSpinner, ErrorState } from '../components/UI';
import {
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  ClipboardList,
  Timer,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Question {
  id: string;
  text: string;
  options: string[];
  type: string;
  hint?: string;
}

interface Quiz {
  id: string;
  title: string;
  topicId: string;
  topicTitle?: string;
  difficulty?: string;
  estMinutes?: number;
  questions: Question[];
}

interface QuizResult {
  score: number;
  total: number;
  weakAreas: string[];
  recommendation: string;
  riskLevel?: string;
}

const fetchOpts: RequestInit = { credentials: 'include' };

function formatTime(totalSec: number) {

  const m = Math.floor(Math.max(0, totalSec) / 60);
  const s = Math.max(0, totalSec) % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;

}

export const StudentQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [postQuizMood, setPostQuizMood] = useState<string | null>(null);
  const [postResultStep, setPostResultStep] = useState<'summary' | 'mood'>(
    'summary'
  );
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionStartRef = useRef<number>(Date.now());
  const timeByQuestionRef = useRef<Record<string, number>>({});

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (!quizId) return;
    setLoadError(false);
    fetch(`/api/quizzes/${quizId}`, fetchOpts)
      .then((res) => {
        if (!res.ok) throw new Error('fetch');
        return res.json();
      })
      .then((data) => {
        if (data && typeof data === 'object' && !data.error) {
          setQuiz(data);
        }
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
    return () => clearTimer();
  }, [quizId]);

  useEffect(() => {
    if (phase !== 'quiz' || !quiz?.questions?.length) {
      clearTimer();
      return;
    }
    const budget =
      (quiz.estMinutes ?? Math.max(3, quiz.questions.length)) * 60;
    setSecondsLeft(budget);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s === null || s <= 1) {
          clearTimer();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearTimer();
  }, [phase, quiz?.id]);

  useEffect(() => {
    if (phase === 'quiz' && quiz?.questions?.length) {
      questionStartRef.current = Date.now();
    }
  }, [phase, currentQuestionIdx, quiz?.id]);

  const finalizeCurrentQuestionSeconds = () => {
    if (!quiz?.questions[currentQuestionIdx]) return;
    const q = quiz.questions[currentQuestionIdx];
    const sec = Math.max(
      1,
      Math.floor((Date.now() - questionStartRef.current) / 1000)
    );
    timeByQuestionRef.current[q.id] = sec;
  };

  const handleAnswer = (option: string) => {
    if (!quiz) return;
    const questionId = quiz.questions[currentQuestionIdx].id;
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    clearTimer();
    finalizeCurrentQuestionSeconds();

    const questionAttempts = quiz.questions.map((q) => {
      const timeSpentSec =
        timeByQuestionRef.current[q.id] ??
        Math.max(
          1,
          Math.floor((Date.now() - questionStartRef.current) / 1000)
        );
      return {
        questionId: q.id,
        answer: answers[q.id] || '',
        timeSpent: timeSpentSec,
        timeSpentSec,
        hintsUsed: 0,
      };
    });

    try {
      const res = await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          quizId: quiz.id,
          questionAttempts,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult({
          score: data.score ?? 0,
          total: data.total ?? quiz.questions.length,
          weakAreas: data.weakAreas ?? [],
          recommendation:
            data.recommendation ??
            'Review the topic notes and try again soon.',
          riskLevel: data.riskLevel,
        });
        setPostResultStep('summary');
        setPhase('result');
      }
    } catch {
      /* network error */
    } finally {
      setSubmitting(false);
    }
  };

  const handleMoodSubmit = async () => {
    if (!postQuizMood || !quizId) return;
    try {
      await fetch('/api/mood-checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mood: postQuizMood,
          context: 'post-quiz',
          quizId,
        }),
      });
      navigate('/student/dashboard');
    } catch {
      /* network error */
    }
  };

  if (loading) return <PageSpinner label="Loading quiz…" />;

  if (loadError || !quiz || !quiz.questions?.length) {
    return (
      <div className="max-w-lg mx-auto py-12 space-y-6">
        <ErrorState
          title="Quiz not found"
          hint="This quiz may be locked or unavailable."
        />
        <div className="text-center">
          <Button onClick={() => navigate('/student/quizzes')}>
            Back to quizzes
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'result' && result) {
    if (postResultStep === 'summary') {
      return (
        <div className="p-8 max-w-2xl mx-auto space-y-6">
          <h1 className="text-3xl font-black">
            Score: {result.score}/{result.total}
          </h1>
          {result.riskLevel && (
            <p className="text-sm font-black uppercase text-gray-500">
              Learning risk (rule engine):{' '}
              <span
                className={
                  result.riskLevel === 'high'
                    ? 'text-red-600'
                    : result.riskLevel === 'low'
                      ? 'text-emerald-600'
                      : 'text-amber-700'
                }
              >
                {result.riskLevel}
              </span>
            </p>
          )}

          <div className="space-y-2">
            <h3 className="font-black text-lg">Weak areas</h3>
            {result.weakAreas.length === 0 ? (
              <p className="text-green-600 font-bold">No weak areas 🎉</p>
            ) : (
              <ul className="space-y-1">
                {result.weakAreas.map((w: string) => (
                  <li key={w} className="font-bold text-gray-800 neo-border bg-white px-3 py-2">
                    {w}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-4 bg-yellow-100 neo-border">
            <p className="font-bold text-gray-900">{result.recommendation}</p>
            <p className="text-xs font-bold text-gray-600 mt-2">
              This result is stored for your profile and smart recommendations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="primary" onClick={() => navigate('/student/dashboard')}>
              Back to dashboard
            </Button>
            <Button variant="outline" onClick={() => setPostResultStep('mood')}>
              Log mood (optional)
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto space-y-8 py-10 px-4">
        <Button variant="outline" className="mb-2" onClick={() => setPostResultStep('summary')}>
          ← Back to results
        </Button>
        <Card className="space-y-6 neo-card-interactive">
          <h2 className="text-xl font-black text-center">
            How do you feel after this quiz?
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {['ok', 'tired', 'stressed', 'very stressed'].map((mood) => (
              <button
                key={mood}
                type="button"
                onClick={() => setPostQuizMood(mood)}
                className={cn(
                  'p-4 neo-border transition-all rounded-lg',
                  postQuizMood === mood
                    ? 'bg-black text-white scale-105'
                    : 'bg-white hover:bg-gray-100'
                )}
              >
                <MoodIcon mood={mood} size="md" />
                <p className="text-[10px] font-black uppercase mt-2">
                  {mood}
                </p>
              </button>
            ))}
          </div>
          <Button
            variant="primary"
            className="w-full"
            disabled={!postQuizMood}
            onClick={handleMoodSubmit}
          >
            Finish &amp; return to dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (phase === 'intro') {
    const est = quiz.estMinutes ?? Math.max(3, quiz.questions.length);
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <Card className="space-y-8 neo-card-interactive">
          <div className="flex justify-center">
            <div className="p-6 bg-violet-100 neo-border rounded-full">
              <ClipboardList size={56} className="text-violet-700" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">
              Topic
            </p>
            <h1 className="text-3xl font-black">
              {quiz.topicTitle || quiz.title}
            </h1>
            <p className="font-bold text-gray-600 text-sm">
              {quiz.title}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="neo-border bg-gray-50 p-4 rounded-lg">
              <p className="text-[10px] font-black uppercase text-gray-500">
                Questions
              </p>
              <p className="text-2xl font-black">{quiz.questions.length}</p>
            </div>
            <div className="neo-border bg-gray-50 p-4 rounded-lg">
              <p className="text-[10px] font-black uppercase text-gray-500">
                Time
              </p>
              <p className="text-2xl font-black">~{est} min</p>
            </div>
            <div className="neo-border bg-gray-50 p-4 rounded-lg col-span-2 sm:col-span-1">
              <p className="text-[10px] font-black uppercase text-gray-500">
                Difficulty
              </p>
              <p className="text-lg font-black">
                {quiz.difficulty || 'Medium'}
              </p>
            </div>
            <div className="neo-border bg-violet-50 p-4 rounded-lg col-span-2 sm:col-span-1">
              <p className="text-[10px] font-black uppercase text-violet-700">
                Tip
              </p>
              <p className="text-xs font-bold text-violet-900 text-left">
                Read each option carefully — no penalty for using a hint.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            className="w-full text-lg py-4 bg-violet-600 hover:bg-violet-700"
            onClick={() => {
              timeByQuestionRef.current = {};
              questionStartRef.current = Date.now();
              setPhase('quiz');
              setCurrentQuestionIdx(0);
            }}
          >
            Start quiz
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIdx];
  const progress =
    ((currentQuestionIdx + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-black">{quiz.title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Tag color="#e9d5ff" className="flex items-center gap-1">
            Q {currentQuestionIdx + 1}/{quiz.questions.length}
          </Tag>
          {secondsLeft !== null && (
            <Tag
              color={secondsLeft < 60 ? '#fecaca' : '#fef08a'}
              className="flex items-center gap-1"
            >
              <Timer size={14} />
              {formatTime(secondsLeft)}
            </Tag>
          )}
        </div>
      </div>

      <div className="h-2.5 neo-border bg-gray-100 overflow-hidden rounded-sm">
        <div
          className="h-full bg-violet-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Card className="space-y-8 neo-card-interactive">
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold leading-snug">
            {currentQuestion.text}
          </h2>
          {currentQuestion.hint && (
            <div>
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="text-sm font-bold flex items-center gap-1 text-violet-700 hover:underline"
              >
                <HelpCircle size={16} />{' '}
                {showHint ? 'Hide hint' : 'Need a hint?'}
              </button>
              {showHint && (
                <div className="mt-2 p-3 bg-violet-50 neo-border border-violet-200 text-sm italic font-medium">
                  {currentQuestion.hint}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAnswer(option)}
              className={cn(
                'p-4 text-left font-bold neo-border transition-all flex items-center gap-4 rounded-lg',
                answers[currentQuestion.id] === option
                  ? 'bg-black text-white translate-x-1 shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]'
                  : 'bg-white hover:bg-gray-50 neo-card-interactive'
              )}
            >
              <div
                className={cn(
                  'w-9 h-9 neo-border flex items-center justify-center flex-shrink-0 font-black text-sm',
                  answers[currentQuestion.id] === option
                    ? 'bg-white text-black'
                    : 'bg-gray-100'
                )}
              >
                {String.fromCharCode(65 + idx)}
              </div>
              {option}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex justify-between items-center gap-4 pb-8">
        <Button
          type="button"
          onClick={() =>
            setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))
          }
          disabled={currentQuestionIdx === 0}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={18} /> Previous
        </Button>

        {currentQuestionIdx === quiz.questions.length - 1 ? (
          <Button
            variant="primary"
            className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
            disabled={!answers[currentQuestion.id] || submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Submitting…' : 'Submit quiz'}{' '}
            <CheckCircle size={18} />
          </Button>
        ) : (
          <Button
            variant="primary"
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700"
            disabled={!answers[currentQuestion.id]}
            onClick={() => {
              finalizeCurrentQuestionSeconds();
              questionStartRef.current = Date.now();
              setCurrentQuestionIdx((prev) => prev + 1);
              setShowHint(false);
            }}
          >
            Next <ArrowRight size={18} />
          </Button>
        )}
      </div>
    </div>
  );
};
