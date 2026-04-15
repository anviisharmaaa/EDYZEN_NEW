import React, { useEffect, useState } from 'react';
import { Card, Button, MoodIcon, Tag } from '../components/UI';
import { Check, X, User, Search, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface StudentAttendance {
  id: string;
  name: string;
  email?: string;
  present: boolean;
  mood?: string;
  percentage?: number;   
  status?: string;
  alert?: string;
}

const MOCK_STUDENTS: StudentAttendance[] = [
  { id: 's1', name: 'Anvi Sharma', email: 'anvi@edyzen.com', present: true, mood: 'ok', percentage: 85, status: 'good', alert: 'none' },
  { id: 's2', name: 'Jordan Smith', email: 'jordan@edyzen.com', present: true, mood: 'stressed', percentage: 55, status: 'critical', alert: 'high' },
  { id: 's3', name: 'Emma Wilson', email: 'emma@edyzen.com', present: false, mood: 'happy', percentage: 95, status: 'good', alert: 'none' },
];

const fetchOpts: RequestInit = { credentials: 'include' };

export const TeacherAttendance = () => {
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [analytics, setAnalytics] = useState([]);
  const [saveMessage, setSaveMessage] = useState('');

useEffect(() => {
    const loadData = async () => {
      try {
        const [studentsRes, attendanceRes, analyticsRes] = await Promise.all([
          fetch(`/api/students`, fetchOpts),
          fetch(`/api/attendance`, fetchOpts),
          fetch(`/api/attendance/analytics`, fetchOpts)
        ]);

        const studentsData = studentsRes.ok ? await studentsRes.json() : [];
        const attendanceData = attendanceRes.ok ? await attendanceRes.json() : [];
        const analyticsData = analyticsRes.ok ? await analyticsRes.json() : [];

        if (Array.isArray(studentsData) && studentsData.length > 0) {
          const formatted = studentsData.map((s: any) => {
            const record = attendanceData.find(
              (r: any) => r.studentId === s._id
            );
            const stat = analyticsData.find(
              (a: any) => a.studentId === s._id
            );
            return {
              id: s._id,
              name: s.name,
              present: record ? record.present : true,
              mood: s.mood || stat?.mood || null,
              percentage: s.accuracy || stat?.percentage || 0,
              status: s.mood === "ok" || s.mood === "happy" ? "good" : stat?.status || "unknown",
              alert: s.mood === "stressed" ? "high" : stat?.alert || "none"
            };
          });
          setStudents(formatted);
        } else {
          setStudents(MOCK_STUDENTS);
        }
        setAnalytics(analyticsData);
      } catch (err) {
        console.error("Attendance load error:", err);
        setStudents(MOCK_STUDENTS);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleAttendance = (id: string) => {
    setStudents(students.map(s => s.id === id ? { ...s, present: !s.present } : s));
  };

  const markAll = (present: boolean) => {
    setStudents(students.map(s => ({ ...s, present })));
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8">Loading attendance...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Daily Attendance</h1>
          <p className="font-bold text-gray-600 flex items-center gap-2">
            <CalendarIcon size={18} /> {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {saveMessage && (
            <p className="text-sm font-black text-green-700 neo-border bg-green-50 px-3 py-2">
              {saveMessage}
            </p>
          )}
          <Button onClick={() => markAll(true)} className="bg-green-100 text-green-700 border-green-400">Mark All Present</Button>
          <Button 
  variant="primary"
  onClick={() => {
    const today = new Date().toISOString().split("T")[0];

    const records = students.map(s => ({
      studentId: s.id,
      date: today,
      present: s.present
    }));

    fetch("/api/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        records,
        orgId: localStorage.getItem("orgId")
      })
    })
    .then(res => res.json())
    .then(() => {
      setSaveMessage('Attendance saved.');
      setTimeout(() => setSaveMessage(''), 4000);
    })
    .catch(() => setSaveMessage('Could not save. Try again.'));
  }}
>
  Save Attendance
</Button>
        </div>
      </div>

      <Card className="p-4 space-y-2">
        <label className="text-xs font-black uppercase text-gray-500 block pl-1">
          Search students
        </label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            aria-label="Search students"
            className="w-full pl-12 pr-4 py-3 neo-border font-bold focus:outline-none focus:ring-2 focus:ring-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map(student => {
          return (
   
      <Card
        key={student.id}
        onClick={() => window.location.href = `/teacher/student/${student.id}`}
        className={cn(
          "cursor-pointer",

          student.alert === "high"
          ? "bg-red-200 border-red-500"
          : student.alert === "medium"
          ? "bg-yellow-200 border-yellow-500"
          : "bg-white"
        )}
      >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 neo-border bg-blue-100 flex items-center justify-center rounded-full">
                <User size={24} />
              </div>
              <div>
                <h3 className="font-black">{student.name}</h3>

                {student.alert === "high" && (
                <p className="text-red-700 text-xs font-black">
                  ⚠️ High Risk Student
                </p>
                )}

                {student.alert === "medium" && (
                <p className="text-yellow-700 text-xs font-black">
                  ⚠️ Needs Attention
                </p>
                )}

                <p className="text-xs font-bold">
                  {student.percentage ? `${student.percentage}% - ${student.status}` : ""}
                </p>
{student.alert === "high" && (
                  <p className="text-[10px] font-bold text-gray-700">
                    Low attendance or negative mood detected.
                  </p>
                )}
                {student.status === "good" && (
                  <p className="text-green-700 text-xs font-bold">
                    ✅ Excellent attendance
                  </p>
                )}
                {student.status === "warning" && (
                  <p className="text-yellow-700 text-xs font-bold">
                    ⚠️ Attendance dropping
                  </p>
                )}
                <div className="flex items-center gap-2">
                  {student.mood ? (
                    <>
                      <MoodIcon mood={student.mood} size="xs" />
                      <span className="text-[10px] font-black uppercase text-gray-500">{student.mood}</span>
                    </>
                  ) : (
                    <span className="text-[10px] font-black uppercase text-gray-400 italic">No mood check-in</span>
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={(e) => {
                e.stopPropagation(); // ✅ THIS FIXES IT
                toggleAttendance(student.id);
              }}
              className={cn(
                "w-10 h-10 neo-border flex items-center justify-center transition-all",
                student.present ? "bg-green-400" : "bg-red-400"
              )}
            >
              {student.present ? <Check size={24} className="text-white" /> : <X size={24} className="text-white" />}
            </button>
          </Card>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <p className="font-black text-gray-500 text-xl">No students found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};
