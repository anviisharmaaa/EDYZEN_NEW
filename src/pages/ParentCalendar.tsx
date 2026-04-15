import React, { useEffect, useState } from 'react';
import { Card, Button, PageSpinner, ErrorState, Tag } from '../components/UI';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, BookOpen, ClipboardList, AlertCircle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface ChildEvent {
  id: string;
  title: string;
  date: string;
  type: 'study' | 'assignment' | 'quiz' | 'general';
  subject?: string;
  childId?: string;
  childName?: string;
}

const EVENT_TYPES = {
  study: { label: 'Study Session', color: 'bg-[var(--bg-tertiary)] border-blue-400' },
  assignment: { label: 'Assignment Due', color: 'bg-[var(--bg-warning)] border-[var(--border-warning)]' },
  quiz: { label: 'Quiz', color: 'bg-[var(--bg-tertiary)] border-purple-400' },
  general: { label: 'Event', color: 'bg-[var(--bg-tertiary)] border-gray-400' },
};

export const ParentCalendar = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedChild, setSelectedChild] = useState<string>('all');

  // Mock calendar events for parent portal
  const [events, setEvents] = useState<ChildEvent[]>([
    { id: '1', title: 'Math Quiz', date: '2026-04-05', type: 'quiz', childId: 's1', childName: 'Anvi Sharma', subject: 'Mathematics' },
    { id: '2', title: 'Assignment Due: Algebra', date: '2026-04-07', type: 'assignment', childId: 's1', childName: 'Anvi Sharma', subject: 'Mathematics' },
    { id: '3', title: 'Science Project', date: '2026-04-10', type: 'assignment', childId: 's1', childName: 'Anvi Sharma', subject: 'Science' },
    { id: '4', title: 'Parent-Teacher Meeting', date: '2026-04-05', type: 'general' },
    { id: '5', title: 'Study Session', date: '2026-04-06', type: 'study', childId: 's1', childName: 'Anvi Sharma', subject: 'Mathematics' },
  ]);

  useEffect(() => {

    setTimeout(() => setLoading(false), 500);
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
    return events.filter(e => e.date === dateStr && (selectedChild === 'all' || e.childId === selectedChild));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(currentDate);

  if (loading) return <PageSpinner label="Loading calendar..." />;

  if (error) {
    return (
      <ErrorState
        title="Could not load calendar"
        hint="Try again later."
        onRetry={() => window.location.reload()}
      />
    );
  }

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const todayEvents = getEventsForDate(new Date());

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <Button onClick={() => navigate(-1)} className="mb-4">
            <ChevronLeft size={18} /> Back
          </Button>
          <p className="text-xs font-black uppercase tracking-widest text-blue-600">
            Family Schedule
          </p>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <CalendarIcon className="text-blue-600" />
            Calendar
          </h1>
          <p className="font-bold text-[var(--text-muted)] mt-1">
            Track your child's activities and deadlines
          </p>
        </div>
        <div className="flex gap-2">
          <select
            className="px-4 py-2 neo-border font-bold"
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
          >
            <option value="all">All Children</option>
            <option value="s1">Anvi Sharma</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
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
                <div key={day} className="text-center text-xs font-black text-[var(--text-muted)] py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                const dayEvents = day ? getEventsForDate(day) : [];

                return (
                  <button
                    key={idx}
                    disabled={!day}
                    onClick={() => day && setSelectedDate(day)}
                    className={cn(
                      "aspect-square p-1 flex flex-col items-center justify-start text-xs font-bold transition-all",
                      !day && "invisible",
                      day && isToday(day) && "bg-[var(--bg-tertiary)] ring-2 ring-blue-500",
                      day && selectedDate?.toDateString() === day.toDateString() && "bg-blue-500 text-white",
                      day && !isToday(day) && selectedDate?.toDateString() !== day.toDateString() && "hover:bg-[var(--bg-tertiary)]"
                    )}
                  >
                    <span>{day?.getDate()}</span>
                    {day && dayEvents.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dayEvents.slice(0, 3).map((e, i) => (
                          <span
                            key={i}
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              e.type === 'assignment' ? 'bg-amber-500' :
                                e.type === 'quiz' ? 'bg-purple-500' :
                                  e.type === 'study' ? 'bg-blue-500' : 'bg-gray-500'
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
              {Object.entries(EVENT_TYPES).map(([type, info]) => (
                <div key={type} className="flex items-center gap-2">
                  <span className={cn("w-3 h-3 rounded-full", info.color.split(' ')[0])} />
                  <span className="text-xs font-bold">{info.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Events */}
          <Card className="p-6">
            <h3 className="text-lg font-black flex items-center gap-2 mb-4">
              <Clock size={18} className="text-blue-600" />
              Today
            </h3>
            {todayEvents.length === 0 ? (
              <p className="text-sm font-bold text-[var(--text-muted)]">No events today</p>
            ) : (
              <div className="space-y-3">
                {todayEvents.map(event => (
                  <div key={event.id} className={cn("p-3 neo-border", EVENT_TYPES[event.type]?.color || 'bg-[var(--bg-tertiary)]')}>
                    <p className="font-black text-sm">{event.title}</p>
                    {event.childName && (
                      <p className="text-xs font-bold text-[var(--text-muted)] mt-1">Child: {event.childName}</p>
                    )}
                    {event.subject && (
                      <p className="text-xs font-bold text-[var(--text-muted)]">{event.subject}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Selected Date Events */}
          {selectedDate && (
            <Card className="p-6">
              <h3 className="text-lg font-black mb-4">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </h3>
              {selectedDateEvents.length === 0 ? (
                <p className="text-sm font-bold text-[var(--text-muted)]">No events on this day</p>
              ) : (
                <div className="space-y-3">
                  {selectedDateEvents.map(event => (
                    <div key={event.id} className={cn("p-3 neo-border", EVENT_TYPES[event.type]?.color || 'bg-[var(--bg-tertiary)]')}>
                      <p className="font-black">{event.title}</p>
                      {event.childName && (
                        <p className="text-xs font-bold text-[var(--text-muted)] mt-1">
                          <Users size={12} className="inline" /> {event.childName}
                        </p>
                      )}
                      {event.subject && (
                        <p className="text-xs font-bold text-[var(--text-muted)]">{event.subject}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Upcoming Deadlines */}
          <Card className="p-6">
            <h3 className="text-lg font-black flex items-center gap-2 mb-4">
              <AlertCircle size={18} className="text-amber-600" />
              Upcoming Deadlines
            </h3>
            <div className="space-y-2">
              {events
                .filter(e => e.type === 'assignment' || e.type === 'quiz')
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map(event => (
                  <div key={event.id} className="flex items-center justify-between text-sm">
                    <span className="font-bold truncate">{event.title}</span>
                    <span className="text-xs font-black text-[var(--text-muted)]">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};