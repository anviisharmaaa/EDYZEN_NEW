import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, PageSpinner } from '../components/UI';
import { MessageCircle, Send, Bot, User, Loader2, BookOpen, Calendar, Brain, Target, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { label: 'Roadmap', icon: BookOpen, path: '/student/roadmap' },
  { label: 'Calendar', icon: Calendar, path: '/student/calendar' },
  { label: 'Profile', icon: Brain, path: '/student/profile' },
  { label: 'Quizzes', icon: Target, path: '/student/quizzes' },
];

export const StudentAIStudy = () => {

  const { user } = useAuth();
  const initialMessage: Message = {
    id: '1',
    role: 'assistant',
    content: "Welcome to your study session! I'm your AI tutor. I can help clarify topics, quiz you, or help you plan your roadmap.",
    timestamp: new Date(),
  };
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: userMessage.content,
          type: 'study',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'd be happy to help with your studies! Could you tell me more about what you need?",
          timestamp: new Date(),
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Please try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16 px-4 sm:px-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10 pt-4">
        <div className="flex items-center gap-5">
          <div className="p-4 rounded-[1.5rem] border flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-strong)' }}>
            <MessageCircle size={32} style={{ color: 'var(--accent-blue)' }} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Study Assistant</h1>
            <p className="font-bold mt-1 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <Sparkles size={14} style={{ color: 'var(--accent-blue)' }} />
              Your AI tutor for learning and academic mastery
            </p>
          </div>
        </div>
      </div>

      {/* Premium Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10 mt-6">
        {QUICK_ACTIONS.map(action => (
          <Link key={action.label} to={action.path} className="group">
            <Card className="px-4 py-5 text-center relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg rounded-[1.5rem] border shadow-sm" style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-color)' }}>
              <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center border shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                <action.icon size={22} className="group-hover:scale-110 transition-transform duration-300" style={{ color: 'var(--text-primary)' }} />
              </div>
              <p className="font-black text-sm uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>{action.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="p-0 overflow-hidden shadow-xl shadow-black/5 relative z-10 rounded-[2rem] border-none" style={{ backgroundColor: 'var(--surface-card)' }}>
        <div className="h-[600px] overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border" style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-strong)' }}>
                  <Bot size={20} style={{ color: 'var(--text-primary)' }} />
                </div>
              )}
              <div
                className={`max-w-[75%] p-5 rounded-2xl shadow-sm border`}
                style={{
                  backgroundColor: message.role === 'user' ? 'var(--text-primary)' : 'var(--surface-card)',
                  borderColor: message.role === 'user' ? 'transparent' : 'var(--border-color)',
                  color: message.role === 'user' ? 'var(--bg-primary)' : 'var(--text-primary)',
                  borderBottomRightRadius: message.role === 'user' ? '2px' : undefined,
                  borderBottomLeftRadius: message.role === 'user' ? undefined : '2px',
                }}
              >
                <p className="text-[15px] font-semibold whitespace-pre-wrap leading-relaxed">{message.content}</p>
                <p className="text-[10px] mt-2 font-bold" style={{ color: message.role === 'user' ? 'var(--bg-tertiary)' : 'var(--text-muted)' }}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border" style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-strong)' }}>
                  <User size={20} style={{ color: 'var(--text-primary)' }} />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-4 justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border" style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-strong)' }}>
                <Bot size={20} style={{ color: 'var(--text-primary)' }} />
              </div>
              <div className="p-5 rounded-2xl rounded-bl-sm border flex items-center gap-2 shadow-sm" style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-color)' }}>
                <Loader2 className="animate-spin" size={18} style={{ color: 'var(--accent-blue)' }} />
                <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-5 md:p-6 border-t" style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex gap-3 max-w-4xl mx-auto items-end">
            <textarea
              className="flex-1 px-5 py-4 border-2 rounded-[1.5rem] font-medium focus:outline-none transition-all resize-none min-h-[60px] max-h-[160px] shadow-sm"
               style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
              placeholder="Ask me to explain a concept or quiz you..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              rows={1}
            />
            <Button
              className="h-[60px] w-[60px] rounded-[1.5rem] shadow-sm flex items-center justify-center shrink-0 border border-transparent transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              <Send size={22} className={cn(input.trim() && "translate-x-0.5 -translate-y-0.5 transition-transform")} />
            </Button>
          </div>
          <p className="text-center text-[11px] font-bold mt-3 hidden sm:block" style={{ color: 'var(--text-muted)' }}>
            Press Enter to send, Shift + Enter for a new line. You've got this!
          </p>
        </div>
      </Card>
    </div>
  );
};