import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, PageSpinner } from '../components/UI';
import { MessageCircle, Send, Bot, User, Loader2, BookOpen, Calendar, Brain, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { label: 'Roadmap', icon: BookOpen, path: '/student/roadmap', color: 'bg-violet-100 border-violet-400' },
  { label: 'Calendar', icon: Calendar, path: '/student/calendar', color: 'bg-sky-100 border-sky-400' },
  { label: 'Profile', icon: Brain, path: '/student/profile', color: 'bg-emerald-100 border-emerald-400' },
  { label: 'Quizzes', icon: Target, path: '/student/quizzes', color: 'bg-amber-100 border-amber-400' },
];

export const StudentAIStudy = () => {
  const { user } = useAuth();
  const initialMessage: Message = {
    id: '1',
    role: 'assistant',
    content: "Hello",
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
      const res = await fetch('/api/ai/study-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-10),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
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
        content: "Please try again",
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
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-violet-400 neo-border rounded-full">
          <MessageCircle size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black">Study Assistant</h1>
          <p className="font-bold text-gray-600">
            Your AI tutor for learning and academic support
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {QUICK_ACTIONS.map(action => (
          <Link key={action.label} to={action.path}>
            <Card className={`p-4 text-center neo-card-interactive ${action.color}`}>
              <action.icon size={24} className="mx-auto mb-2" />
              <p className="font-bold text-sm">{action.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-violet-50 to-white">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-violet-400 rounded-full flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-4 neo-border ${
                  message.role === 'user'
                    ? 'bg-black text-white'
                    : 'bg-white'
                }`}
              >
                <p className="text-sm font-bold whitespace-pre-wrap">{message.content}</p>
                <p className={`text-[10px] mt-2 ${
                  message.role === 'user' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-rose-400 rounded-full flex items-center justify-center shrink-0">
                  <User size={16} className="text-white" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-violet-400 rounded-full flex items-center justify-center shrink-0">
                <Bot size={16} className="text-white" />
              </div>
              <div className="p-4 neo-border bg-white">
                <Loader2 className="animate-spin text-violet-500" size={20} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-3 neo-border font-bold focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Ask me about your studies..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <Button
              variant="primary"
              className="bg-violet-500 hover:bg-violet-600 px-4"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              <Send size={20} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};