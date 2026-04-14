import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, PageSpinner } from '../components/UI';
import { HeartHandshake, Send, Bot, User, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const StudentAIMental = () => {
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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: userMessage.content,
          type: 'mental',
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
          content: "I'm here to listen. Take your time to share what's on your mind.",
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
        <div className="p-3 bg-rose-400 neo-border rounded-full">
          <HeartHandshake size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black">Mental Evaluator</h1>
          <p className="font-bold text-gray-600">
            Your AI companion for emotional well-being
          </p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-rose-50 to-white">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-rose-400 rounded-full flex items-center justify-center shrink-0">
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
                <div className="w-8 h-8 bg-violet-400 rounded-full flex items-center justify-center shrink-0">
                  <User size={16} className="text-white" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-rose-400 rounded-full flex items-center justify-center shrink-0">
                <Bot size={16} className="text-white" />
              </div>
              <div className="p-4 neo-border bg-white">
                <Loader2 className="animate-spin text-rose-500" size={20} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-3 neo-border font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Share your thoughts..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <Button
              variant="primary"
              className="bg-rose-500 hover:bg-rose-600 px-4"
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