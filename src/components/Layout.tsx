import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, LogOut, Users, ClipboardList, BarChart2, Heart, Brain, Calendar, StickyNote, Menu, X, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const Layout = ({ children }: { children: React.ReactNode }) => {

  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
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
    <div className="min-h-screen flex flex-col bg-[var(--surface-card)]">
      {/* Top Bar */}
      <header className="border-b border-[var(--border-color)] bg-[var(--surface-card)] sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-blue-600">EDYZEN</span>
            <span className="text-sm font-medium text-[var(--text-muted)]">·</span>
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase">{role}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-[var(--text-secondary)] hidden sm:block">{user?.name}</span>
            <button
              onClick={toggleTheme}
              className={cn(
                "relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                isDark ? "bg-blue-600" : "bg-gray-300"
              )}
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              <span className="sr-only">Toggle Theme</span>
              <span
                className={cn(
                  "inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ease-in-out shadow-sm flex items-center justify-center",
                  isDark ? "translate-x-8" : "translate-x-1"
                )}
              >
                {isDark ? (
                  <Moon size={12} className="text-blue-600" />
                ) : (
                  <Sun size={12} className="text-amber-500" />
                )}
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={18} className="text-[var(--text-muted)]" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={cn(
          "w-64 border-r border-[var(--border-color)] bg-[var(--bg-secondary)] transition-all duration-300",
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
                    ? "bg-[var(--bg-tertiary)] text-blue-700"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
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
          <aside className="lg:hidden absolute left-0 top-16 w-48 bg-[var(--surface-card)] border-r border-[var(--border-color)] shadow-lg z-30">
            <nav className="p-4 space-y-1">
              {navItems[role].map(item => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-[var(--bg-tertiary)] text-blue-700"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
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
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-[var(--surface-card)]">
          {children}
        </main>
      </div>
    </div>
  );
};
