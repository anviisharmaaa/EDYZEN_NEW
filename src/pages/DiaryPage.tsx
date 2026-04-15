import React, { useEffect, useState } from 'react';
import { Card, Button, PageSpinner, ErrorState } from '../components/UI';
import { BookHeart, Calendar, Clock, Save, Trash2, Edit } from 'lucide-react';

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  timestamp: string;

}

const fetchOpts: RequestInit = { credentials: 'include' };

const MOODS = [
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'ok', label: 'Okay', emoji: '🙂' },
  { value: 'tired', label: 'Tired', emoji: '😴' },
  { value: 'stressed', label: 'Stressed', emoji: '😰' },
  { value: 'excited', label: 'Excited', emoji: '🎉' },
];

export const DiaryPage = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', mood: 'ok' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    fetch('/api/students/me/diary', fetchOpts)
      .then(res => {
        if (!res.ok) throw new Error('diary');
        return res.json();
      })
      .then(data => {
        setEntries(Array.isArray(data) ? data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/students/me/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newEntry),
      });
      if (res.ok) {
        const saved = await res.json();
        setEntries([saved, ...entries]);
        setNewEntry({ title: '', content: '', mood: 'ok' });
        setShowForm(false);
      }
    } catch {
      console.error('Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const getMoodEmoji = (mood: string) => {
    const m = MOODS.find(m => m.value === mood);
    return m?.emoji || '🙂';
  };

  if (loading) return <PageSpinner label="Loading your diary..." />;

  if (error) {
    return (
      <ErrorState
        title="Could not load diary"
        hint="Try again later."
        onRetry={load}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-violet-600">
            Personal journal
          </p>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <BookHeart className="text-violet-600" />
            My Diary
          </h1>
          <p className="font-bold text-[var(--text-muted)] mt-1">
            Reflect on your learning journey
          </p>
        </div>
        <Button
          variant="primary"
          className="bg-violet-600 hover:bg-violet-700 flex items-center gap-2"
          onClick={() => setShowForm(!showForm)}
        >
          <Edit size={18} />
          {showForm ? 'Cancel' : 'New Entry'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 space-y-4 border-violet-400 bg-[var(--bg-tertiary)]">
          <div>
            <label className="text-xs font-black uppercase text-[var(--text-muted)] block mb-1">
              Title
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 neo-border font-bold focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="What's on your mind?"
              value={newEntry.title}
              onChange={e => setNewEntry({ ...newEntry, title: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase text-[var(--text-muted)] block mb-1">
              How are you feeling?
            </label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map(mood => (
                <button
                  key={mood.value}
                  type="button"
                  className={`px-3 py-2 neo-border font-bold text-sm transition-all ${newEntry.mood === mood.value
                      ? 'bg-violet-400 text-white border-violet-600'
                      : 'bg-[var(--surface-card)] hover:bg-[var(--bg-tertiary)]'
                    }`}
                  onClick={() => setNewEntry({ ...newEntry, mood: mood.value })}
                >
                  {mood.emoji} {mood.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase text-[var(--text-muted)] block mb-1">
              Your thoughts
            </label>
            <textarea
              className="w-full px-4 py-3 neo-border font-bold focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[120px]"
              placeholder="Write about your day, what you learned, or how you're feeling..."
              value={newEntry.content}
              onChange={e => setNewEntry({ ...newEntry, content: e.target.value })}
            />
          </div>

          <Button
            variant="primary"
            className="w-full bg-violet-600 hover:bg-violet-700 flex items-center justify-center gap-2"
            onClick={handleSave}
            disabled={saving || !newEntry.title.trim() || !newEntry.content.trim()}
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Entry'}
          </Button>
        </Card>
      )}

      <div className="space-y-4">
        {entries.length === 0 ? (
          <Card className="p-12 text-center space-y-4">
            <BookHeart size={48} className="mx-auto text-violet-300" />
            <p className="text-lg font-black text-[var(--text-muted)]">No diary entries yet</p>
            <p className="font-bold text-[var(--text-muted)]">
              Start writing to track your thoughts and feelings
            </p>
            <Button
              variant="primary"
              className="bg-violet-600"
              onClick={() => setShowForm(true)}
            >
              Write Your First Entry
            </Button>
          </Card>
        ) : (
          entries.map(entry => (
            <Card key={entry.id} className="p-6 hover:translate-x-1 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getMoodEmoji(entry.mood)}</span>
                  <div>
                    <h3 className="text-xl font-black">{entry.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs font-bold text-[var(--text-muted)]">
                      <Clock size={12} />
                      {new Date(entry.timestamp).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-[var(--text-secondary)] font-bold whitespace-pre-wrap">{entry.content}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};