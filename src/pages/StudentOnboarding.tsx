import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Tag, ProgressBar } from '../components/UI';
import { Brain, Zap, Target, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const STEPS = [
  {
    title: 'Your Learning Pace',
    description: 'How fast do you usually like to go through new topics?',
    options: ['Slow & Steady', 'Moderate', 'Fast-Paced'],
    icon: Zap,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    title: 'Learning Preference',
    description: 'How do you understand new things best?',
    options: ['Visual (Videos/Images)', 'Reading (Text/Articles)', 'Interactive (Quizzes/Tasks)'],
    icon: Brain,
    color: 'bg-purple-100 text-purple-600'
  },
  {
    title: 'Your Approach',
    description: 'What describes your study style best? (Select all that apply)',
    options: ['Detail-Oriented', 'Big-Picture', 'Hands-On', 'Theoretical'],
    icon: Target,
    color: 'bg-green-100 text-green-600',
    multi: true
  }
];

export const StudentOnboarding = () => {

  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<number, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSelect = (option: string) => {
    const step = STEPS[currentStep];
    if (step.multi) {
      const current = (selections[currentStep] as string[]) || [];
      if (current.includes(option)) {
        setSelections({ ...selections, [currentStep]: current.filter(o => o !== option) });
      } else {
        setSelections({ ...selections, [currentStep]: [...current, option] });
      }
    } else {
      setSelections({ ...selections, [currentStep]: option });
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      submitOnboarding();
    }
  };

  const submitOnboarding = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/students/me/cognitive-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          pace: selections[0],
          preference: selections[1],
          approach: selections[2]
        })
      });

      if (res.ok) {
        navigate('/student/dashboard');
      }
    } catch (err) {
      console.error('Error submitting onboarding:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const step = STEPS[currentStep];
  const isSelected = (option: string) => {
    const current = selections[currentStep];
    if (Array.isArray(current)) return current.includes(option);
    return current === option;
  };

  const canContinue = selections[currentStep] && (Array.isArray(selections[currentStep]) ? (selections[currentStep] as string[]).length > 0 : true);

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black tracking-tighter">Welcome to EDYZEN</h1>
        <p className="font-bold text-gray-600">Let's personalize your learning experience in just 3 steps.</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between font-black text-sm uppercase text-gray-500">
          <span>Step {currentStep + 1} of {STEPS.length}</span>
          <span>{Math.round(((currentStep + 1) / STEPS.length) * 100)}%</span>
        </div>
        <ProgressBar value={currentStep + 1} max={STEPS.length} />
      </div>

      <Card className="p-10 space-y-8">
        <div className="flex items-center gap-6">
          <div className={cn("p-4 neo-border rounded-full", step.color)}>
            <step.icon size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black">{step.title}</h2>
            <p className="font-bold text-gray-600">{step.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {step.options.map(option => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className="p-6 text-left font-black neo-border transition-all flex items-center justify-between"
              style={isSelected(option)
                ? { backgroundColor: 'var(--accent-blue)', color: '#fff', borderColor: 'var(--accent-blue)', transform: 'translateX(8px)' }
                : { backgroundColor: 'var(--surface-card)', color: 'var(--text-primary)' }
              }
            >
              <span className="text-xl">{option}</span>
              {isSelected(option) && <CheckCircle size={24} />}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex justify-between items-center">
        <Button
          onClick={() => setCurrentStep(prev => prev - 1)}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={18} /> Previous
        </Button>

        <Button
          variant="primary"
          className="flex items-center gap-2"
          disabled={!canContinue || submitting}
          onClick={handleNext}
        >
          {currentStep === STEPS.length - 1 ? (submitting ? 'Finishing...' : 'Finish Onboarding') : 'Next Step'}
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
};
