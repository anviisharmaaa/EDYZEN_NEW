import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Tag } from '../components/UI';
import {

  ChevronLeft,
  FileText,
  Upload,
  Link as LinkIcon,
  Mic,
  Video,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { motion } from 'motion/react';

export const AssignmentPage = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submissionType, setSubmissionType] = useState<'text' | 'file' | 'url' | 'media'>('text');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [aiHelp, setAiHelp] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/assignments/${assignmentId}`)
      .then(res => res.json())
      .then(data => {
        setAssignment(data);
        setLoading(false);
      });
  }, [assignmentId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await fetch(`/api/assignments/${assignmentId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: submissionType, content })
    });
    if (res.ok) {
      navigate('/student/dashboard');
    }
    setSubmitting(false);
  };

  const handleAIHelp = () => {
    setAiHelp("1. Introduction: Define algebra and its significance. \n2. Historical Context: Mention Al-Khwarizmi. \n3. Key Concepts: Variables, equations, and expressions. \n4. Modern Applications: Computer science, engineering, and finance. \n5. Conclusion: Summary of algebra's impact.");
  };

  if (loading) return <div className="p-8 font-black">Loading Assignment...</div>;

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button onClick={() => navigate('/student/dashboard')} className="flex items-center gap-2">
            <ChevronLeft size={18} /> Back to Dashboard
          </Button>
          <div className="flex items-center gap-4">
            <Tag color={assignment.status === 'SUBMITTED' ? '#4ade80' : '#fbbf24'}>
              {assignment.status}
            </Tag>
            <div className="flex items-center gap-2 neo-card bg-[var(--surface-card)] px-4 py-2 font-black">
              <Clock className="text-red-500" /> Due: {new Date(assignment.dueDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Description & Rubric */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 space-y-4">
              <h2 className="text-2xl font-black uppercase tracking-tight">Instructions</h2>
              <p className="font-bold text-[var(--text-secondary)] leading-relaxed">{assignment.instructions}</p>

              <div className="pt-4 border-t-2 border-black">
                <h3 className="text-lg font-black uppercase mb-2">Grading Rubric</h3>
                <p className="text-sm font-bold text-[var(--text-muted)]">{assignment.rubric}</p>
              </div>
            </Card>

            <Card className="p-6 bg-[var(--bg-tertiary)] border-indigo-400 space-y-4">
              <h2 className="text-xl font-black flex items-center gap-2 text-indigo-700">
                <Sparkles size={20} /> AI Assistant
              </h2>
              <p className="text-sm font-bold text-[var(--accent-blue)]">Need help getting started? I can suggest a structure for your work.</p>
              <Button onClick={handleAIHelp} className="w-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2">
                Help me structure <ArrowRight size={16} />
              </Button>
              {aiHelp && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-[var(--surface-card)] neo-border text-sm font-bold whitespace-pre-line"
                >
                  {aiHelp}
                </motion.div>
              )}
            </Card>
          </div>

          {/* Right: Submission Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 space-y-6">
              <h1 className="text-4xl font-black uppercase tracking-tighter">{assignment.title}</h1>

              <div className="flex flex-wrap gap-4 p-2 neo-border bg-[var(--bg-secondary)]">
                {[
                  { id: 'text', icon: FileText, label: 'Text Editor' },
                  { id: 'file', icon: Upload, label: 'File Upload' },
                  { id: 'url', icon: LinkIcon, label: 'URL Link' },
                  { id: 'media', icon: Mic, label: 'Media' }
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSubmissionType(type.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 font-black transition-all ${submissionType === type.id ? 'bg-black text-white neo-card' : 'hover:bg-[var(--bg-tertiary)]'
                      }`}
                  >
                    <type.icon size={18} /> {type.label}
                  </button>
                ))}
              </div>

              <div className="min-h-[300px]">
                {submissionType === 'text' && (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start typing your assignment here..."
                    className="w-full h-[400px] p-6 neo-border font-bold text-lg outline-none resize-none"
                  />
                )}
                {submissionType === 'file' && (
                  <div className="h-[300px] neo-border border-dashed border-4 border-[var(--border-color)] flex flex-col items-center justify-center gap-4 bg-[var(--bg-secondary)]">
                    <Upload size={48} className="text-gray-400" />
                    <p className="font-black text-[var(--text-muted)] uppercase">Drag & Drop or Click to Upload</p>
                    <p className="text-xs font-bold text-gray-400">PDF, DOCX up to 500MB</p>
                    <input type="file" className="hidden" />
                    <Button variant="outline">Select File</Button>
                  </div>
                )}
                {submissionType === 'url' && (
                  <div className="space-y-4">
                    <p className="font-black uppercase text-sm text-[var(--text-muted)]">External Link (e.g., Google Docs, GitHub)</p>
                    <input
                      type="url"
                      placeholder="https://..."
                      className="w-full p-4 neo-border font-bold text-lg outline-none"
                    />
                  </div>
                )}
                {submissionType === 'media' && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-8 neo-border bg-[var(--bg-secondary)] flex flex-col items-center gap-4">
                      <Mic size={32} className="text-blue-500" />
                      <p className="font-black">Record Audio</p>
                      <Button variant="outline">Start Recording</Button>
                    </div>
                    <div className="p-8 neo-border bg-[var(--bg-secondary)] flex flex-col items-center gap-4">
                      <Video size={32} className="text-red-500" />
                      <p className="font-black">Record Video</p>
                      <Button variant="outline">Start Recording</Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6 border-t-4 border-black">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || assignment.status === 'SUBMITTED'}
                  className="px-12 py-4 text-xl font-black bg-green-500 hover:bg-green-600 flex items-center gap-2"
                >
                  {submitting ? 'Submitting...' : assignment.status === 'SUBMITTED' ? 'Submitted' : 'Submit Assignment'}
                  <CheckCircle size={24} />
                </Button>
              </div>
            </Card>

            {assignment.submission && (
              <Card className="p-6 bg-[var(--bg-tertiary)] border-[var(--border-success)] space-y-4">
                <h2 className="text-2xl font-black flex items-center gap-2 text-[var(--text-success)]">
                  <MessageSquare /> Teacher Feedback
                </h2>
                <div className="p-4 bg-[var(--surface-card)] neo-border space-y-4">
                  <p className="font-bold text-[var(--text-secondary)]">"Great work on the introduction! However, you could expand more on the modern applications section. See my highlights below."</p>
                  <div className="p-4 bg-[var(--bg-warning)] neo-border italic font-bold">
                    Annotated: <span className="bg-yellow-200 px-1">Algebra is used in computer science</span> to build complex algorithms.
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ArrowRight = ({ size, className }: { size?: number, className?: string }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);
