import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Card, Button } from '../components/UI';
import { Sun, Moon } from 'lucide-react';

interface Organization {
  id: number;
  name: string;
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<number | ''>('');
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/organizations', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setOrganizations(Array.isArray(data) ? data : []);
        if (data && data.length > 0) {
          setSelectedOrg(data[0].id);
        } else {
          setShowCreateOrg(true);
        }
      })
      .catch(() => setShowCreateOrg(true))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateOrg = async () => {
    if (!newOrgName.trim() || !adminName.trim() || !adminEmail.trim() || !adminPassword.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/create-organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newOrgName,
          adminName,
          adminEmail,
          adminPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.message || 'Failed to create organization');
        return;
      }
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('orgId', String(data.organization.id));
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      if (user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user?.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (user?.role === 'parent') {
        navigate('/parent/dashboard');
      } else if (user?.role === 'student') {
        navigate('/student/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    backgroundColor: 'var(--bg-primary)',
    position: 'relative',
  };

  const ThemeToggleBtn = () => (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
    >
      <span className="theme-toggle-knob" />
    </button>
  );

  if (loading) {
    return (
      <div style={pageStyle}>
        <div className="font-black text-4xl" style={{ color: 'var(--text-primary)' }}>Loading...</div>
      </div>
    );
  }

  if (showCreateOrg) {
    return (
      <div style={pageStyle}>
        {/* Theme toggle in corner */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {isDark ? <Moon size={14} style={{ color: 'var(--text-muted)' }} /> : <Sun size={14} style={{ color: 'var(--text-muted)' }} />}
          <ThemeToggleBtn />
        </div>
        <Card className="w-full max-w-md">
          <h1 className="text-4xl font-black mb-2 text-center" style={{ color: 'var(--accent-blue)' }}>EDYZEN</h1>
          <p className="text-center text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Adaptive Learning Platform</p>
          <p className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Create your Organisation</p>
          <div className="space-y-4">
            <div>
              <label className="block font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Organisation Name</label>
              <input
                type="text"
                className="neo-input w-full"
                value={newOrgName}
                onChange={e => setNewOrgName(e.target.value)}
                placeholder="Enter organisation name"
              />
            </div>
            <div>
              <label className="block font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Admin Name</label>
              <input
                type="text"
                className="neo-input w-full"
                value={adminName}
                onChange={e => setAdminName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Admin Email</label>
              <input
                type="email"
                className="neo-input w-full"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                placeholder="admin@organisation.com"
              />
            </div>
            <div>
              <label className="block font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Admin Password</label>
              <input
                type="password"
                className="neo-input w-full"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="Set admin password"
              />
            </div>
            {error && (
              <p className="text-red-500 font-bold text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                {error}
              </p>
            )}
            <Button
              type="button"
              variant="primary"
              className="w-full text-xl py-4"
              onClick={handleCreateOrg}
              disabled={saving || !newOrgName.trim() || !adminName.trim() || !adminEmail.trim() || !adminPassword.trim()}
            >
              {saving ? 'Creating...' : 'Create Organisation'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      {/* Theme toggle in corner */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {isDark ? <Moon size={14} style={{ color: 'var(--text-muted)' }} /> : <Sun size={14} style={{ color: 'var(--text-muted)' }} />}
        <ThemeToggleBtn />
      </div>

      <Card className="w-full max-w-md">
        <h1 className="text-4xl font-black mb-2 text-center" style={{ color: 'var(--accent-blue)' }}>EDYZEN</h1>
        <p className="text-center text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Adaptive Learning Platform</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Organisation</label>
            <select
              className="neo-input w-full"
              value={selectedOrg}
              onChange={e => setSelectedOrg(Number(e.target.value))}
            >
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
            <button
              type="button"
              className="text-xs font-bold mt-2"
              style={{ color: 'var(--accent-blue)' }}
              onClick={() => setShowCreateOrg(true)}
            >
              + Create new organisation
            </button>
          </div>
          <div>
            <label className="block font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <input
              type="email"
              className="neo-input w-full"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="block font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Password</label>
            <input
              type="password"
              className="neo-input w-full"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <p className="text-red-500 font-bold text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(239,68,68,0.3)' }}>
              {error}
            </p>
          )}
          <Button type="submit" variant="primary" className="w-full text-xl py-4">
            Login
          </Button>
        </form>
      </Card>
    </div>
  );
};
