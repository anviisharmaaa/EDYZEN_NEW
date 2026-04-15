import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, LogOut, Users, ClipboardList, BarChart2, Heart, Brain, Calendar, StickyNote, Menu, X, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';

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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Top Bar */}
      <header
        className="sticky top-0 z-40"
        style={{
          backgroundColor: 'var(--header-bg)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold" style={{ color: 'var(--accent-blue)' }}>EDYZEN</span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>·</span>
            <span className="text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>{role}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--text-secondary)' }}>{user?.name}</span>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle dark mode"
            >
              <span className="theme-toggle-knob" />
            </button>
            <span style={{ color: 'var(--text-muted)' }}>
              {isDark ? <Moon size={14} /> : <Sun size={14} />}
            </span>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className="w-64 transition-all duration-300 hidden lg:block"
          style={{
            backgroundColor: 'var(--sidebar-bg)',
            borderRight: '1px solid var(--border-color)',
          }}
        >
          <nav className="p-4 space-y-1">
            {navItems[role].map(item => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  isActive ? "nav-active" : "nav-inactive"
                )}
                style={({ isActive }) => isActive
                  ? { backgroundColor: 'var(--accent-blue-bg)', color: 'var(--accent-blue)' }
                  : { color: 'var(--text-secondary)' }
                }
                onMouseEnter={e => {
                  const el = e.currentTarget;
                  if (!el.classList.contains('nav-active')) {
                    el.style.backgroundColor = 'var(--surface-hover)';
                  }
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget;
                  if (!el.classList.contains('nav-active')) {
                    el.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <item.icon size={18} />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <aside
            className="lg:hidden absolute left-0 top-16 w-48 shadow-lg z-30"
            style={{
              backgroundColor: 'var(--header-bg)',
              border: '1px solid var(--border-color)',
            }}
          >
            <nav className="p-4 space-y-1">
              {navItems[role].map(item => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors"
                  )}
                  style={({ isActive }) => isActive
                    ? { backgroundColor: 'var(--accent-blue-bg)', color: 'var(--accent-blue)' }
                    : { color: 'var(--text-secondary)' }
                  }
                >
                  <item.icon size={18} />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main
          className="flex-1 p-6 lg:p-8 overflow-y-auto"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
