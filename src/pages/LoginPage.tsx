import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button } from '../components/UI';

interface Organization {

  id: number;
  name: string;

}

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-black text-4xl">Loading...</div>
      </div>
    );
  }

  if (showCreateOrg) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <h1 className="text-4xl font-black mb-6 text-center">EDYZEN</h1>
          <p className="font-bold mb-4">Create your Organisation</p>
          <div className="space-y-4">
            <div>
              <label className="block font-bold mb-1">Organisation Name</label>
              <input
                type="text"
                className="neo-input w-full"
                value={newOrgName}
                onChange={e => setNewOrgName(e.target.value)}
                placeholder="Enter organisation name"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Admin Name</label>
              <input
                type="text"
                className="neo-input w-full"
                value={adminName}
                onChange={e => setAdminName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Admin Email</label>
              <input
                type="email"
                className="neo-input w-full"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                placeholder="admin@organisation.com"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Admin Password</label>
              <input
                type="password"
                className="neo-input w-full"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="Set admin password"
              />
            </div>
            {error && <p className="text-red-600 font-bold text-sm">{error}</p>}
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-4xl font-black mb-6 text-center">EDYZEN</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-bold mb-1">Organisation</label>
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
              className="text-xs font-bold text-blue-600 mt-2"
              onClick={() => setShowCreateOrg(true)}
            >
              + Create new organisation
            </button>
          </div>
          <div>
            <label className="block font-bold mb-1">Email</label>
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
            <label className="block font-bold mb-1">Password</label>
            <input
              type="password"
              className="neo-input w-full"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-red-600 font-bold text-sm bg-red-100 p-3 border border-red-400">{error}</p>}
          <Button type="submit" variant="primary" className="w-full text-xl py-4">
            Login
          </Button>
        </form>
      </Card>
    </div>
  );
};
