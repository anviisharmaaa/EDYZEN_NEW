import React, { useEffect, useState } from 'react';
import { Card, Button, PageSpinner, ErrorState, Tag } from '../components/UI';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, BookOpen, ClipboardList, AlertCircle, Edit, Save, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'study' | 'assignment' | 'quiz' | 'general';
  subject?: string;
}

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  timestamp: string;
  visibility: 'student' | 'teacher' | 'parent' | 'both';
}

const fetchOpts: RequestInit = { credentials: 'include' };

const EVENT_TYPES = {

  study: { label: 'Study Session', color: 'bg-blue-100 border-blue-400 text-blue-700' },
  assignment: { label: 'Assignment Due', color: 'bg-amber-100 border-amber-400 text-amber-700' },
  quiz: { label: 'Quiz', color: 'bg-purple-100 border-purple-400 text-purple-700' },
  general: { label: 'Event', color: 'bg-gray-100 border-gray-400 text-gray-700' },
};

const VISIBILITY_OPTIONS = [
  { value: 'student', label: 'Student Only' },
  { value: 'teacher', label: 'Teacher Only' },
  { value: 'parent', label: 'Parent Only' },
  { value: 'both', label: 'Teacher & Parent' },
];

export const CalendarPage = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDiaryForm, setShowDiaryForm] = useState(false);
  const [newDiaryEntry, setNewDiaryEntry] = useState({ title: '', content: '', visibility: 'student' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([
      fetch('/api/calendar', fetchOpts),
      fetch('/api/students/me/diary', fetchOpts),
    ])
      .then(([calendarRes, diaryRes]) => {
        if (!calendarRes.ok || !diaryRes.ok) throw new Error('load');
        return Promise.all([calendarRes.json(), diaryRes.json()]);
      })
      .then(([calendarData, diaryData]) => {
        setEvents(Array.isArray(calendarData) ? calendarData : []);
        setDiaryEntries(Array.isArray(diaryData) ? diaryData.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.start.startsWith(dateStr));
  };

  const getDiaryEntriesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return diaryEntries.filter(e => e.timestamp.startsWith(dateStr));
  };

  const getAssignmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.type === 'assignment' && e.start.startsWith(dateStr));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(currentDate);

  const handleSaveDiary = async () => {
    if (!newDiaryEntry.title.trim() || !newDiaryEntry.content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/students/me/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newDiaryEntry),
      });
      if (res.ok) {
        const saved = await res.json();
        setDiaryEntries([saved, ...diaryEntries]);
        setNewDiaryEntry({ title: '', content: '', visibility: 'student' });
        setShowDiaryForm(false);
      }
    } catch {
      console.error('Failed to save diary entry');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageSpinner label="Loading calendar..." />;

  if (error) {
    return (
      <ErrorState
        title="Could not load calendar"
        hint="Try again later."
        onRetry={load}
      />
    );
  }

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const selectedDateDiary = selectedDate ? getDiaryEntriesForDate(selectedDate) : [];
  const selectedDateAssignments = selectedDate ? getAssignmentsForDate(selectedDate) : [];
  const todayEvents = getEventsForDate(new Date());
  const todayDiary = getDiaryEntriesForDate(new Date());

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-sky-600">
            Schedule
          </p>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <CalendarIcon className="text-sky-600" />
            Calendar & Diary
          </h1>
          <p className="font-bold text-gray-600 mt-1">
            Your schedule, entries, and assignments
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Calendar - takes 3 columns */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="p-2">
                <ChevronLeft size={20} />
              </Button>
              <h2 className="text-xl font-black">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <Button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-2">
                <ChevronRight size={20} />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-black text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                const dayEvents = day ? getEventsForDate(day) : [];
                const dayDiary = day ? getDiaryEntriesForDate(day) : [];
                const hasEvents = dayEvents.length > 0;
                const hasDiary = dayDiary.length > 0;

                return (
                  <button
                    key={idx}
                    disabled={!day}
                    onClick={() => day && setSelectedDate(day)}
                    className={cn(
                      "aspect-square p-1 flex flex-col items-center justify-start text-xs font-bold transition-all relative",
                      !day && "invisible",
                      day && isToday(day) && "bg-sky-100 ring-2 ring-sky-500",
                      day && selectedDate?.toDateString() === day.toDateString() && "bg-sky-500 text-white",
                      day && !isToday(day) && selectedDate?.toDateString() !== day.toDateString() && "hover:bg-gray-100"
                    )}
                  >
                    <span>{day?.getDate()}</span>
                    {(hasEvents || hasDiary) && (
                      <div className="flex gap-0.5 mt-0.5">
                        {hasDiary && <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />}
                        {dayEvents.slice(0, 2).map((e, i) => (
                          <span
                            key={i}
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              e.type === 'assignment' && 'bg-amber-500',
                              e.type === 'quiz' && 'bg-purple-500',
                              e.type === 'study' && 'bg-blue-500',
                              e.type === 'general' && 'bg-gray-500'
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-violet-500" />
                <span className="text-xs font-bold">Diary</span>
              </div>
              {Object.entries(EVENT_TYPES).map(([type, info]) => (
                <div key={type} className="flex items-center gap-2">
                  <span className={cn("w-3 h-3 rounded-full", info.color.split(' ')[0])} />
                  <span className="text-xs font-bold">{info.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Side: 4 Panels */}
        <div className="lg:col-span-2 space-y-6">
          {/* Panel 1: Selected Date */}
          <Card className="p-6 border-2 border-black">
            <h3 className="text-xl font-black flex items-center gap-2 mb-4">
              <Clock size={18} className="text-sky-600" />
              {selectedDate
                ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
                : 'Today'
              }
            </h3>
            <p className="text-sm font-bold text-gray-500">
              {selectedDate ? 'Select a date from the calendar' : 'Viewing today\'s details'}
            </p>
          </Card>

          {/* Panel 2: Diary Entry / New Entry */}
          <Card className="p-6 border-violet-400">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black flex items-center gap-2">
                <BookOpen size={18} className="text-violet-600" />
                {showDiaryForm ? 'New Entry' : 'Diary Entry'}
              </h3>
              <div className="flex gap-2">
                <Link to="/student/notes">
                  <Button variant="outline" className="py-1 px-2 text-sm">
                    Open Notes <ArrowRight size={14} />
                  </Button>
                </Link>
                {!showDiaryForm && (
                  <Button
                    variant="primary"
                    className="bg-violet-600 py-1 px-3 text-sm"
                    onClick={() => setShowDiaryForm(true)}
                  >
                    <Edit size={14} />
                  </Button>
                )}
              </div>
            </div>

            {showDiaryForm ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase text-gray-500 block mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 neo-border font-bold focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="Entry title..."
                    value={newDiaryEntry.title}
                    onChange={e => setNewDiaryEntry({ ...newDiaryEntry, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-gray-500 block mb-1">
                    Visibility
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {VISIBILITY_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        className={cn(
                          "px-2 py-1 text-xs font-bold border-2 transition-all",
                          newDiaryEntry.visibility === opt.value
                            ? 'bg-violet-400 border-violet-600 text-white'
                            : 'bg-white border-gray-300 hover:bg-violet-50'
                        )}
                        onClick={() => setNewDiaryEntry({ ...newDiaryEntry, visibility: opt.value as any })}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-gray-500 block mb-1">
                    Your thoughts
                  </label>
                  <textarea
                    className="w-full px-3 py-2 neo-border font-bold focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[80px]"
                    placeholder="Write about your day..."
                    value={newDiaryEntry.content}
                    onChange={e => setNewDiaryEntry({ ...newDiaryEntry, content: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    className="flex-1 bg-violet-600 flex items-center justify-center gap-2"
                    onClick={handleSaveDiary}
                    disabled={saving || !newDiaryEntry.title.trim() || !newDiaryEntry.content.trim()}
                  >
                    <Save size={14} />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    variant="outline"
                    className="px-3"
                    onClick={() => setShowDiaryForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : selectedDate ? (
              selectedDateDiary.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateDiary.map(entry => (
                    <div key={entry.id} className="p-3 neo-border bg-violet-50 rounded-lg">
                      <p className="font-bold">{entry.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{entry.content}</p>
                      <div className="flex gap-2 mt-2">
                        <Tag color="#ede9fe">{entry.visibility}</Tag>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-bold text-gray-500">No diary entries for this date</p>
              )
            ) : (
              todayDiary.length > 0 ? (
                <div className="space-y-3">
                  {todayDiary.map(entry => (
                    <div key={entry.id} className="p-3 neo-border bg-violet-50 rounded-lg">
                      <p className="font-bold">{entry.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{entry.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-bold text-gray-500">No diary entries today. Click + to add one.</p>
              )
            )}
          </Card>

          {/* Panel 3: Scheduled Classes */}
          <Card className="p-6 border-blue-400">
            <h3 className="text-lg font-black flex items-center gap-2 mb-4">
              <Clock size={18} className="text-blue-600" />
              Scheduled Classes
            </h3>
            {selectedDate ? (
              selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.filter(e => e.type !== 'assignment').map(event => (
                    <div key={event.id} className={cn("p-3 neo-border", EVENT_TYPES[event.type]?.color || 'bg-gray-100')}>
                      <p className="font-black text-sm">{event.title}</p>
                      <p className="text-xs font-bold mt-1">
                        {new Date(event.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        {event.subject && ` • ${event.subject}`}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-bold text-gray-500">No classes scheduled</p>
              )
            ) : (
              todayEvents.length > 0 ? (
                <div className="space-y-3">
                  {todayEvents.filter(e => e.type !== 'assignment').map(event => (
                    <div key={event.id} className={cn("p-3 neo-border", EVENT_TYPES[event.type]?.color || 'bg-gray-100')}>
                      <p className="font-black text-sm">{event.title}</p>
                      <p className="text-xs font-bold mt-1">
                        {new Date(event.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        {event.subject && ` • ${event.subject}`}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-bold text-gray-500">No classes today</p>
              )
            )}
          </Card>

          {/* Panel 4: Assignments Due */}
          <Card className="p-6 border-amber-400">
            <h3 className="text-lg font-black flex items-center gap-2 mb-4">
              <ClipboardList size={18} className="text-amber-600" />
              Assignments Due
            </h3>
            {selectedDate ? (
              selectedDateAssignments.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateAssignments.map(assignment => (
                    <div key={assignment.id} className="p-3 neo-border bg-amber-50">
                      <p className="font-black">{assignment.title}</p>
                      <p className="text-xs font-bold text-amber-700 mt-1">
                        Due: {new Date(assignment.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-bold text-gray-500">No assignments due</p>
              )
            ) : (
              events.filter(e => e.type === 'assignment').length > 0 ? (
                <div className="space-y-3">
                  {events.filter(e => e.type === 'assignment').slice(0, 5).map(assignment => (
                    <div key={assignment.id} className="p-3 neo-border bg-amber-50">
                      <p className="font-black">{assignment.title}</p>
                      <p className="text-xs font-bold text-amber-700 mt-1">
                        Due: {new Date(assignment.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-bold text-gray-500">No upcoming assignments</p>
              )
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};