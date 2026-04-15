import React, { useState, useEffect } from 'react';
import { Card, Button, Tag } from '../components/UI';
import { Users, UserPlus, Trash2, Building2, LogOut, GraduationCap, UserCog } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Teacher {

  _id: string;
  name: string;
  email: string;
  classId?: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  classId?: string;
}

interface Parent {
  _id: string;
  name: string;
  email: string;
  childId?: string;
}

interface Organization {
  _id: string;
  name: string;
  adminEmail: string;
}

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('orgId');
    navigate('/');
  };
  const [org, setOrg] = useState<Organization | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddParent, setShowAddParent] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', password: '', classId: '' });
  const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '', classId: '' });
  const [newParent, setNewParent] = useState({ name: '', email: '', password: '', childId: '' });
  const [saving, setSaving] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("LOADING START");

        const orgRes = await fetch("/api/organizations", {
          credentials: "include",
        });

        console.log("ORG STATUS:", orgRes.status);

        let orgData = [];
        if (orgRes.ok) {
          orgData = await orgRes.json();
        }

        const safeOrgs = Array.isArray(orgData) ? orgData : [];
        setOrganizations(safeOrgs);

        if (safeOrgs.length > 0) {
          const orgId = Number(safeOrgs[0].id);
          setSelectedOrgId(orgId);

          const teacherRes = await fetch(`/api/organizations/${orgId}/teachers`, {
            credentials: "include",
          });

          const studentRes = await fetch(`/api/organizations/${orgId}/students`, {
            credentials: "include",
          });

          const parentRes = await fetch(`/api/organizations/${orgId}/parents`, {
            credentials: "include",
          });

          let teacherData = [];
          let studentData = [];
          let parentData = [];

          if (teacherRes.ok) teacherData = await teacherRes.json();
          if (studentRes.ok) studentData = await studentRes.json();
          if (parentRes.ok) parentData = await parentRes.json();

          setTeachers(Array.isArray(teacherData) ? teacherData : []);
          setStudents(Array.isArray(studentData) ? studentData : []);
          setParents(Array.isArray(parentData) ? parentData : []);
        }

      } catch (err) {
        console.error("LOAD ERROR:", err);
        setTeachers([]);
        setStudents([]);
        setOrganizations([]);
      } finally {
        console.log("LOADING END");
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddTeacher = async () => {
    if (!newTeacher.name.trim() || !newTeacher.email.trim() || !newTeacher.password.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/organizations/${selectedOrgId}/teachers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify(newTeacher)
      });
      if (res.ok) {
        const teacher = await res.json();
        setTeachers([...teachers, teacher]);
        setShowAddTeacher(false);
        setNewTeacher({ name: '', email: '', password: '', classId: '' });
      }
    } catch (err) {
      console.error('Failed to add teacher:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.name.trim() || !newStudent.email.trim() || !newStudent.password.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/organizations/${selectedOrgId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify(newStudent)
      });
      if (res.ok) {
        const student = await res.json();
        setStudents([...students, student]);
        setShowAddStudent(false);
        setNewStudent({ name: '', email: '', password: '', classId: '' });
      }
    } catch (err) {
      console.error('Failed to add student:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    if (!confirm('Are you sure you want to remove this teacher?')) return;
    try {
      await fetch(`/api/organizations/${selectedOrgId}/teachers/${teacherId}`, { method: 'DELETE', credentials: "include" });
      setTeachers(teachers.filter(t => t._id !== teacherId));
    } catch (err) {
      console.error('Failed to delete teacher:', err);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to remove this student?')) return;
    try {
      await fetch(`/api/organizations/${selectedOrgId}/students/${studentId}`, { method: 'DELETE', credentials: "include" });
      setStudents(students.filter(s => s._id !== studentId));
    } catch (err) {
      console.error('Failed to delete student:', err);
    }
  };

  const handleAddParent = async () => {
    if (!newParent.name.trim() || !newParent.email.trim() || !newParent.password.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/organizations/${selectedOrgId}/parents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify(newParent)
      });
      if (res.ok) {
        const parent = await res.json();
        setParents([...parents, parent]);
        setShowAddParent(false);
        setNewParent({ name: '', email: '', password: '', childId: '' });
      }
    } catch (err) {
      console.error('Failed to add parent:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteParent = async (parentId: string) => {
    if (!confirm('Are you sure you want to remove this parent?')) return;
    try {
      await fetch(`/api/organizations/${selectedOrgId}/parents/${parentId}`, { method: 'DELETE', credentials: "include" });
      setParents(parents.filter(p => p._id !== parentId));
    } catch (err) {
      console.error('Failed to delete parent:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-black text-4xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-blue-600">Admin Dashboard</p>
            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
              <Building2 className="text-blue-600" />
              {org?.name || 'Organisation'}
            </h1>
            <p className="font-bold text-gray-600 mt-1">Manage your organisation members</p>
          </div>
          <Button onClick={handleLogout} className="flex items-center gap-2">
            <LogOut size={18} /> Logout
          </Button>
        </div>

        {/* Teachers Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="text-purple-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black">Teachers</h2>
                <p className="font-bold text-gray-500">{teachers.length} teacher(s) in your organisation</p>
              </div>
            </div>
            <Button variant="primary" className="bg-purple-600" onClick={() => setShowAddTeacher(true)}>
              <UserPlus size={18} className="mr-2" /> Add Teacher
            </Button>
          </div>

          {teachers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 font-bold">No teachers added yet</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Array.isArray(teachers) ? teachers : []).map(teacher => (
                <div key={teacher._id} className="p-4 neo-border bg-white flex items-center justify-between">
                  <div>
                    <h3 className="font-black">{teacher.name}</h3>
                    <p className="text-sm font-bold text-gray-500">{teacher.email}</p>
                    {teacher.classId && <Tag color="#ede9fe">Class: {teacher.classId}</Tag>}
                  </div>
                  <button onClick={() => handleDeleteTeacher(teacher._id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Students Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <GraduationCap className="text-green-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black">Students</h2>
                <p className="font-bold text-gray-500">{students.length} student(s) in your organisation</p>
              </div>
            </div>
            <Button variant="primary" className="bg-green-600" onClick={() => setShowAddStudent(true)}>
              <UserPlus size={18} className="mr-2" /> Add Student
            </Button>
          </div>

          {students.length === 0 ? (
            <div className="text-center py-8 text-gray-500 font-bold">No students added yet</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Array.isArray(students) ? students : []).map(student => (
                <div key={student._id} className="p-4 neo-border bg-white flex items-center justify-between">
                  <div>
                    <h3 className="font-black">{student.name}</h3>
                    <p className="text-sm font-bold text-gray-500">{student.email}</p>
                    {student.classId && <Tag color="#dcfce7">Class: {student.classId}</Tag>}
                  </div>
                  <button onClick={() => handleDeleteStudent(student._id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Parents Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-full">
                <UserCog className="text-orange-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black">Parents</h2>
                <p className="font-bold text-gray-500">{parents.length} parent(s) in your organisation</p>
              </div>
            </div>
            <Button variant="primary" className="bg-orange-600" onClick={() => setShowAddParent(true)}>
              <UserPlus size={18} className="mr-2" /> Add Parent
            </Button>
          </div>

          {parents.length === 0 ? (
            <div className="text-center py-8 text-gray-500 font-bold">No parents added yet</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Array.isArray(parents) ? parents : []).map(parent => (
                <div key={parent._id} className="p-4 neo-border bg-white flex items-center justify-between">
                  <div>
                    <h3 className="font-black">{parent.name}</h3>
                    <p className="text-sm font-bold text-gray-500">{parent.email}</p>
                  </div>
                  <button onClick={() => handleDeleteParent(parent._id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Add Teacher Modal */}
        {showAddTeacher && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-6 space-y-4">
              <h2 className="text-2xl font-black">Add New Teacher</h2>
              <div>
                <label className="text-xs font-black uppercase text-gray-500 block mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 neo-border font-bold"
                  placeholder="Teacher name"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-gray-500 block mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 neo-border font-bold"
                  placeholder="teacher@school.com"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-gray-500 block mb-1">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 neo-border font-bold"
                  placeholder="Set password"
                  value={newTeacher.password}
                  onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-gray-500 block mb-1">Class (Optional)</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 neo-border font-bold"
                  placeholder="e.g., 7A"
                  value={newTeacher.classId}
                  onChange={(e) => setNewTeacher({ ...newTeacher, classId: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  className="flex-1 bg-purple-600"
                  onClick={handleAddTeacher}
                  disabled={saving || !newTeacher.name.trim() || !newTeacher.email.trim() || !newTeacher.password.trim()}
                >
                  {saving ? 'Adding...' : 'Add Teacher'}
                </Button>
                <Button onClick={() => setShowAddTeacher(false)}>Cancel</Button>
              </div>
            </Card>
          </div>
        )}

        {/* Add Student Modal */}
        {showAddStudent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-6 space-y-4">
              <h2 className="text-2xl font-black">Add New Student</h2>
              <div>
                <label className="text-xs font-black uppercase text-gray-500 block mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 neo-border font-bold"
                  placeholder="Student name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-gray-500 block mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 neo-border font-bold"
                  placeholder="student@school.com"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-gray-500 block mb-1">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 neo-border font-bold"
                  placeholder="Set password"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-gray-500 block mb-1">Class (Optional)</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 neo-border font-bold"
                  placeholder="e.g., 7A"
                  value={newStudent.classId}
                  onChange={(e) => setNewStudent({ ...newStudent, classId: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  className="flex-1 bg-green-600"
                  onClick={handleAddStudent}
                  disabled={saving || !newStudent.name.trim() || !newStudent.email.trim() || !newStudent.password.trim()}
                >
                  {saving ? 'Adding...' : 'Add Student'}
                </Button>
                <Button onClick={() => setShowAddStudent(false)}>Cancel</Button>
              </div>
            </Card>
          </div>
        )}

        {/* Add Parent Modal */}
        {showAddParent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-6 space-y-4">
              <h2 className="text-2xl font-black">Add New Parent</h2>
              <div>
                <label className="text-xs font-black uppercase text-gray-500 block mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 neo-border font-bold"
                  placeholder="Parent name"
                  value={newParent.name}
                  onChange={(e) => setNewParent({ ...newParent, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-gray-500 block mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 neo-border font-bold"
                  placeholder="parent@email.com"
                  value={newParent.email}
                  onChange={(e) => setNewParent({ ...newParent, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-gray-500 block mb-1">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 neo-border font-bold"
                  placeholder="Set password"
                  value={newParent.password}
                  onChange={(e) => setNewParent({ ...newParent, password: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-gray-500 block mb-1">Child Email (Optional)</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 neo-border font-bold"
                  placeholder="child@school.com"
                  value={newParent.childId}
                  onChange={(e) => setNewParent({ ...newParent, childId: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  className="flex-1 bg-orange-600"
                  onClick={handleAddParent}
                  disabled={saving || !newParent.name.trim() || !newParent.email.trim() || !newParent.password.trim()}
                >
                  {saving ? 'Adding...' : 'Add Parent'}
                </Button>
                <Button onClick={() => setShowAddParent(false)}>Cancel</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};