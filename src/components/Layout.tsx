import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, LogOut, Users, ClipboardList, BarChart2, Heart, Brain, Calendar, StickyNote, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';

export const Layout = ({ children }: { children: React.ReactNode }) => {

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = {

    student: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
      { name: 'Roadmap', icon: BookOpen, path: '/student/roadmap' },
      { name: 'Calendar', icon: Calendar, path: '/student/calendar' },
      { name: 'Notes', icon: StickyNote, path: '/student/notes' },
      { name: 'Profile', icon: Brain, path: '/student/profile' },
      { name: 'Mental Support', icon: Heart, path: '/student/ai/mental' },
      { name: 'Study Help', icon: BarChart2, path: '/student/ai/study' },
    ],
    teacher: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/teacher/dashboard' },
      { name: 'Attendance', icon: ClipboardList, path: '/teacher/attendance' },
      { name: 'Curriculum', icon: BookOpen, path: '/teacher/curriculum' },
      { name: 'Analytics', icon: BarChart2, path: '/teacher/analytics' },
      { name: 'Calendar', icon: Calendar, path: '/teacher/calendar' },
      { name: 'Students', icon: Users, path: '/teacher/students' },
    ],
    parent: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/parent/dashboard' },
      { name: 'Child Overview', icon: Users, path: '/parent/child' },
      { name: 'Calendar', icon: Calendar, path: '/parent/calendar' },
      { name: 'Announcements', icon: Heart, path: '/parent/announcements' },
    ]
  };

  const role = user?.role || 'student';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Bar */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-blue-600">EDYZEN</span>
            <span className="text-sm font-medium text-gray-600">·</span>
            <span className="text-xs font-medium text-gray-600 uppercase">{role}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={18} className="text-gray-600" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={cn(
          "w-64 border-r border-gray-200 bg-gray-50 transition-all duration-300",
          "hidden lg:block"
        )}>
          <nav className="p-4 space-y-1">
            {navItems[role].map(item => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon size={18} />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <aside className="lg:hidden absolute left-0 top-16 w-48 bg-white border-r border-gray-200 shadow-lg z-30">
            <nav className="p-4 space-y-1">
              {navItems[role].map(item => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon size={18} />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-white">
          {children}
        </main>
      </div>
    </div>
  );
};
