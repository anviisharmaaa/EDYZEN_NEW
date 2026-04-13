import React, { useEffect, useState } from 'react';
import { Card, Button, PageSpinner, ErrorState, Tag } from '../components/UI';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, BookOpen, ClipboardList, AlertCircle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface TeacherEvent {
  id: string;
  title: string;
  date: string;
  type: 'lecture' | 'exam' | 'meeting' | 'assignment';
  className?: string;
}

const EVENT_TYPES = {
  lecture: { label: 'Lecture', color: 'bg-blue-100 border-blue-400' },
  exam: { label: 'Exam/Quiz', color: 'bg-purple-100 border-purple-400' },
  meeting: { label: 'Meeting', color: 'bg-green-100 border-green-400' },
  assignment: { label: 'Assignment Due', color: 'bg-amber-100 border-amber-400' },
};

export const TeacherCalendar = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('all');

  const [events, setEvents] = useState<TeacherEvent[]>([
    { id: '1', title: 'Math Quiz - 7A', date: '2026-04-05', type: 'exam', className: '7A Mathematics' },
    { id: '2', title: 'Algebra Basics - 7B', date: '2026-04-05', type: 'lecture', className: '7B Mathematics' },
    { id: '3', title: 'Assignment Due', date: '2026-04-07', type: 'assignment', className: '7A Mathematics' },
    { id: '4', title: 'Staff Meeting', date: '2026-04-08', type: 'meeting' },
    { id: '5', title: 'Quadratic Equations - 7A', date: '2026-04-06', type: 'lecture', className: '7A Mathematics' },
    { id: '6', title: 'Science Quiz - 7B', date: '2026-04-10', type: 'exam', className: '7B Science' },
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
    return events.filter(e => e.date === dateStr);
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
          <p className="text-xs font-black uppercase tracking-widest text-violet-600">
            Teaching Schedule
          </p>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <CalendarIcon className="text-violet-600" />
            Calendar
          </h1>
          <p className="font-bold text-gray-600 mt-1">
            Manage your classes, exams, and meetings
          </p>
        </div>
        <Button variant="primary" className="bg-violet-600">
          + Add Event
        </Button>
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
                <div key={day} className="text-center text-xs font-black text-gray-500 py-2">
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
                      day && isToday(day) && "bg-violet-100 ring-2 ring-violet-500",
                      day && selectedDate?.toDateString() === day.toDateString() && "bg-violet-500 text-white",
                      day && !isToday(day) && selectedDate?.toDateString() !== day.toDateString() && "hover:bg-gray-100"
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
                              e.type === 'exam' ? 'bg-purple-500' :
                              e.type === 'lecture' ? 'bg-blue-500' :
                              e.type === 'meeting' ? 'bg-green-500' : 'bg-amber-500'
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
          {/* Today's Schedule */}
          <Card className="p-6">
            <h3 className="text-lg font-black flex items-center gap-2 mb-4">
              <Clock size={18} className="text-violet-600" />
              Today's Schedule
            </h3>
            {todayEvents.length === 0 ? (
              <p className="text-sm font-bold text-gray-500">No events today</p>
            ) : (
              <div className="space-y-3">
                {todayEvents.map(event => (
                  <div key={event.id} className={cn("p-3 neo-border", EVENT_TYPES[event.type]?.color || 'bg-gray-100')}>
                    <p className="font-black text-sm">{event.title}</p>
                    {event.className && (
                      <p className="text-xs font-bold text-gray-600 mt-1">{event.className}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Selected Date */}
          {selectedDate && (
            <Card className="p-6">
              <h3 className="text-lg font-black mb-4">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </h3>
              {selectedDateEvents.length === 0 ? (
                <p className="text-sm font-bold text-gray-500">No events on this day</p>
              ) : (
                <div className="space-y-3">
                  {selectedDateEvents.map(event => (
                    <div key={event.id} className={cn("p-3 neo-border", EVENT_TYPES[event.type]?.color || 'bg-gray-100')}>
                      <p className="font-black">{event.title}</p>
                      {event.className && (
                        <p className="text-xs font-bold text-gray-600 mt-1">
                          <Users size={12} className="inline" /> {event.className}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Quick Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-black flex items-center gap-2 mb-4">
              <AlertCircle size={18} className="text-amber-600" />
              This Week
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-black text-violet-600">
                  {events.filter(e => e.type === 'lecture').length}
                </p>
                <p className="text-xs font-bold text-gray-500">Lectures</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-purple-600">
                  {events.filter(e => e.type === 'exam').length}
                </p>
                <p className="text-xs font-bold text-gray-500">Exams</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-amber-600">
                  {events.filter(e => e.type === 'assignment').length}
                </p>
                <p className="text-xs font-bold text-gray-500">Due</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-green-600">
                  {events.filter(e => e.type === 'meeting').length}
                </p>
                <p className="text-xs font-bold text-gray-500">Meetings</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};