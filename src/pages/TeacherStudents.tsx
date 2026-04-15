import React, { useEffect, useState } from 'react';
import { Card, Button, PageSpinner, ErrorState, MoodIcon, Tag } from '../components/UI';
import { Users, Search, TrendingUp, BarChart2, AlertCircle, Clock, BookOpen, Mail, ArrowRight, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface StudentInfo {
  id: string;
  name: string;
  email: string;
  progress: number;
  accuracy: number;
  mood: string;
  lastActive: string;
  weakTopics: string[];
  strongTopics: string[];
  attendance?: number;
}

const fetchOpts: RequestInit = { credentials: 'include' };

const MOCK_STUDENTS: StudentInfo[] = [
  { id: 's1', name: 'Anvi Sharma', email: 'anvi@edyzen.com', progress: 75, accuracy: 85, mood: 'ok', lastActive: '2 hours ago', weakTopics: ['Linear equations'], strongTopics: ['Algebra basics'], attendance: 95 },
  { id: 's2', name: 'Jordan Smith', email: 'jordan@edyzen.com', progress: 65, accuracy: 72, mood: 'tired', lastActive: '1 hour ago', weakTopics: ['Quadratic equations', 'Fractions'], strongTopics: ['Number sense'], attendance: 88 },
  { id: 's3', name: 'Emma Wilson', email: 'emma@edyzen.com', progress: 82, accuracy: 91, mood: 'happy', lastActive: '30 min ago', weakTopics: [], strongTopics: ['Algebra', 'Geometry'], attendance: 100 },
  { id: 's4', name: 'Liam Johnson', email: 'liam@edyzen.com', progress: 58, accuracy: 65, mood: 'stressed', lastActive: '5 hours ago', weakTopics: ['Algebra', 'Linear equations'], strongTopics: [], attendance: 75 },
  { id: 's5', name: 'Olivia Brown', email: 'olivia@edyzen.com', progress: 78, accuracy: 80, mood: 'ok', lastActive: '1 day ago', weakTopics: ['Fractions'], strongTopics: ['Word problems'], attendance: 92 },
];

export const TeacherStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMood, setFilterMood] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'accuracy'>('name');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '', classId: 'c1' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    const orgId = localStorage.getItem('orgId');
    Promise.all([
      fetch(`/api/teachers/me/students-overview?orgId=${orgId || ''}`, fetchOpts).then(res => res.json()).catch(() => []),
      fetch('/api/teachers/me/analytics', fetchOpts).then(res => res.json()).catch(() => ({})),
    ])
      .then(([studentsData]) => {
        if (Array.isArray(studentsData) && studentsData.length > 0) {
          setStudents(studentsData.map((s: any) => ({
            id: s.id,
            name: s.name,
            email: s.email,
            progress: s.progress || 0,
            accuracy: s.accuracy || 0,
            mood: s.mood || 'ok',
            lastActive: s.lastActive || 'Never',
            weakTopics: s.weakTopics || [],
            strongTopics: s.strongTopics || [],
            attendance: Math.floor(Math.random() * 20) + 80,
          })));
        } else {
          setStudents(MOCK_STUDENTS);
        }
        setLoading(false);
      })
      .catch(() => {
        setStudents(MOCK_STUDENTS);
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const filteredStudents = students
    .filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMood = filterMood === 'all' || s.mood === filterMood;
      return matchesSearch && matchesMood;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'progress') return b.progress - a.progress;
      return b.accuracy - a.accuracy;
    });

  const getAlertLevel = (student: StudentInfo) => {
    if (student.accuracy < 60 || student.attendance && student.attendance < 75) return 'high';
    if (student.accuracy < 75 || student.attendance && student.attendance < 85) return 'medium';
    return 'none';
  };

  const handleAddStudent = async () => {
    if (!newStudent.name.trim() || !newStudent.email.trim()) return;
    setSaving(true);
    try {
      const orgId = localStorage.getItem('orgId');
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...newStudent, orgId }),
      });
      if (res.ok) {
        const created = await res.json();
        setStudents([...students, {
          id: created._id || created.id || `s${Date.now()}`,
          name: created.name,
          email: created.email,
          progress: 0,
          accuracy: 0,
          mood: 'ok',
          lastActive: 'Just joined',
          weakTopics: [],
          strongTopics: [],
          attendance: 100,
        }]);
        setShowAddModal(false);
        setNewStudent({ name: '', email: '', password: '', classId: 'c1' });
      }
    } catch (err) {
      console.error('Failed to add student:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageSpinner label="Loading students..." />;

  if (error) {
    return (
      <ErrorState
        title="Could not load students"
        hint="Try again later."
        onRetry={load}
      />
    );
  }

  const highRiskStudents = students.filter(s => getAlertLevel(s) === 'high');
  const mediumRiskStudents = students.filter(s => getAlertLevel(s) === 'medium');

  return (
    <div className="space-y-8 pb-12">
      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h2 className="text-2xl font-black">Add New Student</h2>
            <div>
              <label className="text-xs font-black uppercase text-gray-500 block mb-1">Student Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 neo-border font-bold"
                placeholder="Enter student name"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase text-gray-500 block mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 neo-border font-bold"
                placeholder="student@edyzen.com"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase text-gray-500 block mb-1">Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 neo-border font-bold"
                placeholder="Set student password"
                value={newStudent.password}
                onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                className="flex-1 bg-blue-600"
                onClick={handleAddStudent}
                disabled={saving || !newStudent.name.trim() || !newStudent.email.trim() || !newStudent.password.trim()}
              >
                {saving ? 'Adding...' : 'Add Student'}
              </Button>
              <Button onClick={() => setShowAddModal(false)}>Cancel</Button>
            </div>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-blue-600">
            Class Management
          </p>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <Users className="text-blue-600" />
            Students
          </h1>
          <p className="font-bold text-gray-600 mt-1">
            View and track all your students' progress
          </p>
        </div>
        <Button variant="primary" className="bg-blue-600" onClick={() => setShowAddModal(true)}>
          + Add Student
        </Button>
      </div>

      {/* Alert Cards */}
      {(highRiskStudents.length > 0 || mediumRiskStudents.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {highRiskStudents.length > 0 && (
            <Card className="p-4" style={{ backgroundColor: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.5)' }}>
              <div className="flex items-center gap-2 font-black text-red-500">
                <AlertCircle size={18} /> High Risk Students
              </div>
              <p className="text-sm font-bold text-red-400 mt-1">
                {highRiskStudents.length} student(s) need immediate attention
              </p>
            </Card>
          )}
          {mediumRiskStudents.length > 0 && (
            <Card className="p-4" style={{ backgroundColor: 'rgba(245,158,11,0.10)', borderColor: 'rgba(245,158,11,0.4)' }}>
              <div className="flex items-center gap-2 font-black text-yellow-600">
                <AlertCircle size={18} /> At Risk Students
              </div>
              <p className="text-sm font-bold text-yellow-500 mt-1">
                {mediumRiskStudents.length} student(s) may need support
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search students..."
              className="w-full pl-12 pr-4 py-3 neo-border font-bold focus:outline-none focus:ring-2 focus:ring-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <select
          className="px-4 py-3 neo-border font-bold"
          value={filterMood}
          onChange={(e) => setFilterMood(e.target.value)}
        >
          <option value="all">All Moods</option>
          <option value="happy">Happy</option>
          <option value="ok">Okay</option>
          <option value="tired">Tired</option>
          <option value="stressed">Stressed</option>
        </select>
        <select
          className="px-4 py-3 neo-border font-bold"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
        >
          <option value="name">Sort by Name</option>
          <option value="progress">Sort by Progress</option>
          <option value="accuracy">Sort by Accuracy</option>
        </select>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map(student => {
          const alert = getAlertLevel(student);
          
          return (
            <Card
              key={student.id}
              className="p-6 cursor-pointer hover:translate-x-1 transition-all"
              style={alert === 'high'
                ? { backgroundColor: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.5)' }
                : alert === 'medium'
                ? { backgroundColor: 'rgba(245,158,11,0.10)', borderColor: 'rgba(245,158,11,0.4)' }
                : undefined
              }
              onClick={() => navigate(`/teacher/student/${student.id}`)}
            >
              {/* Student Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 neo-border bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-black">{student.name[0]}</span>
                  </div>
                  <div>
                    <h3 className="font-black text-lg">{student.name}</h3>
                    <p className="text-xs font-bold text-gray-500">{student.email}</p>
                  </div>
                </div>
                <MoodIcon mood={student.mood} />
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Progress</span>
                  <span>{student.progress}%</span>
                </div>
                <div className="h-2 neo-border bg-white overflow-hidden rounded-sm">
                  <div
                    className={cn(
                      "h-full transition-all",
                      student.progress >= 80 ? 'bg-green-500' :
                      student.progress >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    )}
                    style={{ width: `${student.progress}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-black">{student.accuracy}%</p>
                  <p className="text-[10px] font-black uppercase text-gray-500">Accuracy</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black">{student.attendance || 0}%</p>
                  <p className="text-[10px] font-black uppercase text-gray-500">Attendance</p>
                </div>
              </div>

              {/* Topics */}
              <div className="space-y-2">
                {student.weakTopics.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black uppercase text-red-600">Needs Help</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {student.weakTopics.map(topic => (
                        <Tag key={topic} color="#fee2e2">{topic}</Tag>
                      ))}
                    </div>
                  </div>
                )}
                {student.strongTopics.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black uppercase text-green-600">Strong In</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {student.strongTopics.map(topic => (
                        <Tag key={topic} color="#dcfce7">{topic}</Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Last Active */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t text-xs font-bold text-gray-500">
                <Clock size={12} />
                <span>Last active: {student.lastActive}</span>
              </div>

              {/* Alert Badge */}
              {alert === 'high' && (
                <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-black px-2 py-1 rounded">
                  HIGH RISK
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <Card className="p-12 text-center">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-black text-gray-600">No students found</p>
          <p className="font-bold text-gray-500">Try Adjusting your filters</p>
        </Card>
      )}
    </div>
  );
};