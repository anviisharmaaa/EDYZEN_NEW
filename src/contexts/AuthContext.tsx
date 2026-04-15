import React, {
  createContext, useContext, useState, useEffect
} from 'react';

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
    const restoreSession = async () => {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          setUser(JSON.parse(stored));
          setLoading(false);
          return;
        }
        
        // Fallback to API if no local cache (won't happen actively in demo)
        const res = await fetch("/api/me", { credentials: "include" });
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        const normalized: User = {
          id: String(data.id), role: data.role, name: data.name, email: data.email, organizationId: data.organizationId,
        };
        localStorage.setItem("user", JSON.stringify(normalized));
        setUser(normalized);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    // --- PROTOTYPE MAGIC LOGIN ---
    let normalized: User | null = null;
    const lowerEmail = email.toLowerCase();
    
    if (lowerEmail.includes("admin")) {
      normalized = { id: "admin-1", role: "admin", name: "Global Admin", email: lowerEmail };
    } else if (lowerEmail.includes("teacher")) {
      normalized = { id: "teacher-1", role: "teacher", name: "Teacher Dave", email: lowerEmail };
    } else if (lowerEmail.includes("parent")) {
      normalized = { id: "parent-1", role: "parent", name: "Priya Sharma", email: lowerEmail };
    } else {
      // Default fallback to Anvi Sharma as the student
      normalized = { id: "s1", role: "student", name: "Anvi Sharma", email: "anvi@edyzen.com" };
    }

    localStorage.setItem("user", JSON.stringify(normalized));
    localStorage.setItem("orgId", "1");
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
