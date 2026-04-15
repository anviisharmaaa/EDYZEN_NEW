import bcrypt from "bcryptjs";

// Extremely robust pure-JS in-memory database to guarantee Render.com compatibility
// regardless of Node version, Docker environment, or native SQLite bindings.

let organizations: any[] = [];
let users: any[] = [];
let orgIdCounter = 1;
let userIdCounter = 1;

export const initDatabase = async () => {
  try {
    console.log("✓ Pure JS database (temp) connected & initialized");
    seedDatabase();
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
};

const seedDatabase = () => {
  if (organizations.length > 0) return;

  const orgId = orgIdCounter++;
  organizations.push({
    id: orgId,
    name: "Global Academy",
    createdAt: new Date().toISOString()
  });

  const pushUser = (name: string, email: string, pass: string, role: string) => {
    users.push({
      id: userIdCounter++,
      name,
      email,
      password: bcrypt.hashSync(pass, 10),
      role,
      organizationId: orgId,
      createdAt: new Date().toISOString()
    });
  };

  pushUser("Admin User", "admin@edyzen.com", "admin123", "admin");
  
  pushUser("Teacher Dave", "teacher@edyzen.com", "teacher123", "teacher");
  pushUser("Teacher Sarah", "sarah@edyzen.com", "teacher123", "teacher");

  pushUser("Anvi Sharma", "anvi@edyzen.com", "student123", "student");
  pushUser("Jordan Smith", "jordan@edyzen.com", "student123", "student");
  pushUser("Emma Wilson", "emma@edyzen.com", "student123", "student");
  pushUser("Aarav Patel", "aarav@edyzen.com", "student123", "student");
  pushUser("Diya Gupta", "diya@edyzen.com", "student123", "student");
  pushUser("Kabir Singh", "kabir@edyzen.com", "student123", "student");
  pushUser("Neha Desai", "neha@edyzen.com", "student123", "student");
  pushUser("Rohan Kumar", "rohan@edyzen.com", "student123", "student");

  pushUser("Priya Sharma", "priya@edyzen.com", "parent123", "parent");

  console.log("✓ Database seeded with prototype values (admin/teacher/anvi/priya @edyzen.com)");
  console.log("✓ Default passwords are: role + 123 (e.g. admin123, teacher123, student123, parent123)");
}

export const query = async (sql: string, params: any[] = []): Promise<any> => {
  sql = sql.trim();
  
  try {
    if (sql.startsWith("SELECT COUNT(*) as count FROM organizations")) {
      return { count: organizations.length };
    }
    
    if (sql.startsWith("SELECT id, name FROM organizations")) {
      return organizations;
    }

    if (sql.startsWith("SELECT id FROM organizations WHERE name = ?")) {
      return organizations.filter(o => o.name === params[0]);
    }
    
    if (sql.startsWith("SELECT * FROM users WHERE email = ?")) {
      return users.filter(u => u.email === params[0]);
    }

    if (sql.startsWith("SELECT id FROM users WHERE email = ?")) {
      return users.filter(u => u.email === params[0]).map(u => ({ id: u.id }));
    }
    
    if (sql.startsWith("SELECT id, name, email FROM users WHERE role = 'teacher' AND organizationId = ?")) {
      return users.filter(u => u.role === "teacher" && u.organizationId == params[0]);
    }

    if (sql.startsWith("SELECT id, name, email FROM users WHERE role = 'student' AND organizationId = ?")) {
      return users.filter(u => u.role === "student" && u.organizationId == params[0]);
    }

    if (sql.startsWith("SELECT id, name, email FROM users WHERE role = 'parent' AND organizationId = ?")) {
      return users.filter(u => u.role === "parent" && u.organizationId == params[0]);
    }

    if (sql.startsWith("SELECT id, name, email, role, organizationId, createdAt FROM users ORDER BY role, name")) {
      return [...users].sort((a, b) => {
        if (a.role !== b.role) return a.role.localeCompare(b.role);
        return a.name.localeCompare(b.name);
      }).map(u => {
        const { password, ...rest } = u;
        return rest;
      });
    }

    if (sql.startsWith("SELECT role FROM users WHERE id = ?")) {
      return users.filter(u => u.id == params[0]).map(u => ({ role: u.role }));
    }

    if (sql.startsWith("INSERT INTO organizations")) {
      // (name, adminEmail, adminPassword)
      // or (name)
      const name = params[0];
      const newOrg = { id: orgIdCounter++, name, createdAt: new Date().toISOString() };
      organizations.push(newOrg);
      return { insertId: newOrg.id, affectedRows: 1 };
    }

    if (sql.startsWith("INSERT INTO users")) {
      const newUser = {
        id: userIdCounter++,
        name: params[0],
        email: params[1],
        password: params[2],
        role: params[3],
        organizationId: params[4] || null,
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      return { insertId: newUser.id, affectedRows: 1 };
    }

    if (sql.startsWith("DELETE FROM users WHERE id = ? AND role = 'teacher'")) {
      const idx = users.findIndex(u => u.id == params[0] && u.role === 'teacher');
      if (idx !== -1) users.splice(idx, 1);
      return { affectedRows: 1 };
    }

    if (sql.startsWith("DELETE FROM users WHERE id = ? AND role = 'parent'")) {
      const idx = users.findIndex(u => u.id == params[0] && u.role === 'parent');
      if (idx !== -1) users.splice(idx, 1);
      return { affectedRows: 1 };
    }

    if (sql.startsWith("DELETE FROM users WHERE id = ?")) {
      const idx = users.findIndex(u => u.id == params[0]);
      if (idx !== -1) users.splice(idx, 1);
      return { affectedRows: 1 };
    }
    
    console.warn("Unhandled SQL query mock:", sql);
    return [];
    
  } catch (error) {
    console.error("Mock SQL Error running query:", sql, "\nError:", error);
    throw error;
  }
};

export const logActivity = async (userId: string, userType: string, action: string, details?: any) => {
  console.log(`[Activity] ${userType}:${userId} - ${action}`, details || "");
};
