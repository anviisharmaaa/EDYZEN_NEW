import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, MoodIcon, Tag } from '../components/UI';
import { Users, ClipboardList, BookOpen, BarChart2, AlertCircle, TrendingUp, ArrowRight, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface ClassSummary {
  id: string;
  name: string;
  studentCount: number;
  avgMood: string;
  alerts: number;
}

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarEvents] = useState([
    { id: '1', title: 'Math Quiz - Class 7A', date: '2026-04-05', type: 'quiz' },
    { id: '2', title: 'Assignment Due', date: '2026-04-07', type: 'assignment' },
    { id: '3', title: 'Parent Meeting', date: '2026-04-05', type: 'general' },
    { id: '4', title: 'Staff Meeting', date: '2026-04-08', type: 'general' },
  ]);

  useEffect(() => {
    Promise.all([
      fetch('/api/teachers/me/classes', { credentials: 'include' }).then(res => res.json()),
      fetch('/api/attendance/analytics', { credentials: 'include' }).then(res => res.json())
    ])
      .then(([classesData, analyticsData]) => {
      
        if (Array.isArray(classesData)) {
          setClasses(classesData);
        }

      // ✅ FILTER HIGH RISK STUDENTS
        const highRisk = analyticsData.filter((s: any) => s.alert === "high");
        setAlerts(highRisk);

        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-sm font-medium text-gray-600">Teacher Dashboard</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button 
          variant="primary"
          className="flex items-center justify-between"
          onClick={() => navigate('/teacher/attendance')}
        >
          <ClipboardList size={18} />
          <span>Attendance</span>
        </Button>
        <Button 
          variant="primary"
          className="flex items-center justify-between"
          onClick={() => navigate('/teacher/curriculum')}
        >
          <BookOpen size={18} />
          <span>Curriculum</span>
        </Button>
        <Button 
          variant="primary"
          className="flex items-center justify-between"
          onClick={() => navigate('/teacher/students')}
        >
          <Users size={18} />
          <span>Students</span>
        </Button>
        <Button 
          variant="primary"
          className="flex items-center justify-between"
          onClick={() => navigate('/teacher/calendar')}
        >
          <CalendarIcon size={18} />
          <span>Calendar</span>
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-6">
          <Users size={24} className="text-blue-600 mx-auto mb-3" />
          <p className="text-xs font-medium text-gray-600 mb-1">Total Students</p>
          <p className="text-2xl font-bold text-gray-900">124</p>
        </Card>
        <Card className="text-center p-6">
          <TrendingUp size={24} className="text-green-600 mx-auto mb-3" />
          <p className="text-xs font-medium text-gray-600 mb-1">Avg Accuracy</p>
          <p className="text-2xl font-bold text-gray-900">76%</p>
        </Card>
        <Card className="text-center p-6">
          <MoodIcon mood="ok" size="md" />
          <p className="text-xs font-medium text-gray-600 mb-1 mt-2">Overall Mood</p>
          <p className="text-2xl font-bold text-gray-900">OK</p>
        </Card>
        <Card className="text-center p-6">
          <AlertCircle size={24} className="text-red-600 mx-auto mb-3" />
          <p className="text-xs font-medium text-gray-600 mb-1">Active Alerts</p>
          <p className="text-2xl font-bold text-red-600">12</p>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes Section */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users size={20} />
            Your Classes
          </h2>
          <div className="space-y-3">
            {classes.map(cls => (
              <Card key={cls.id} className="flex items-center justify-between p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-lg font-bold text-blue-600">
                    {cls.name.split(' ')[0][0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                    <p className="text-sm text-gray-600">{cls.studentCount} students</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-600 text-center mb-1">Mood</p>
                    <MoodIcon mood={cls.avgMood} size="sm" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Alerts</p>
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-sm font-medium text-white",
                      cls.alerts > 0 ? "bg-red-600" : "bg-green-600"
                    )}>
                      {cls.alerts}
                    </span>
                  </div>
                  <Link to={`/teacher/analytics?classId=${cls.id}`}>
                    <Button variant="outline" className="p-2">
                      <ArrowRight size={18} />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Calendar Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CalendarIcon size={20} />
            This Week
          </h2>
          <Card className="p-4">
            <div className="space-y-2 text-sm">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
                const date = new Date();
                date.setDate(date.getDate() - date.getDay() + idx);
                const dayEvents = calendarEvents.filter(e => e.date === date.toISOString().split('T')[0]);
                return (
                  <div key={day} className="flex gap-2">
                    <span className="font-medium text-gray-600 w-10">{day}</span>
                    <div className="flex-1 flex flex-wrap gap-1">
                      {dayEvents.length > 0 ? (
                        dayEvents.map(ev => (
                          <span key={ev.id} className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 truncate">
                            {ev.type === 'quiz' && '📋'}
                            {ev.type === 'assignment' && '✏️'}
                            {ev.type === 'general' && '📅'}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">No events</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/teacher/calendar')}>
              Full Calendar
            </Button>
          </Card>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <AlertCircle size={20} />
          Student Alerts
        </h2>
        {alerts.length > 0 ? (
          <div className="grid gap-3">
            {alerts.slice(0, 5).map((alert, idx) => (
              <Card key={idx} className="p-4 border-l-4 border-l-red-600" style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}>
                <p className="font-medium text-red-500 mb-1">{alert.name}</p>
                <p className="text-sm text-red-400">{alert.reason}</p>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-gray-600">No active alerts</p>
          </Card>
        )}
      </div>
    </div>
  );
};
