import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  name: string;
  email?: string;
  portalSlug?: string;
  portalId?: number;
  organizationId?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

const login = async (email: string, password: string): Promise<User> => {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      email,
      password
    })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }

  const normalized: User = {
    id: String(data.id),
    role: data.role,
    name: data.name,
    email: data.email,
    organizationId: data.organizationId
  };
  localStorage.setItem("user", JSON.stringify(normalized));
  if (data.organizationId) {
    localStorage.setItem("orgId", String(data.organizationId));
  }
  setUser(normalized);
  return normalized;
};

  const logout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
