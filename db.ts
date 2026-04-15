// @ts-ignore
import { DatabaseSync } from "node:sqlite";
import bcrypt from "bcryptjs";

// Use an in-memory temp DB for prototyping
const db = new DatabaseSync(":memory:");

export let pool: any; // Retained for compatibility if needed

export const initDatabase = async () => {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS organizations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        adminEmail TEXT,
        adminPassword TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT,
        organizationId INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organizationId) REFERENCES organizations(id)
      )
    `);

    console.log("✓ SQLite database (temp) connected & initialized");
    
    // Seed the database with prototype values
    seedDatabase();
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
};

const seedDatabase = () => {
  // Check if already seeded
  const orgCount = db.prepare("SELECT COUNT(*) as count FROM organizations").get() as any;
  if (orgCount.count > 0) return;

  // Insert base organization
  const insertOrg = db.prepare("INSERT INTO organizations (name) VALUES (?)");
  const orgResult = insertOrg.run("Global Academy");
  const orgId = orgResult.lastInsertRowid;

  // Insert Admin
  const adminPass = bcrypt.hashSync("admin123", 10);
  const insertUser = db.prepare("INSERT INTO users (name, email, password, role, organizationId) VALUES (?, ?, ?, ?, ?)");
  insertUser.run("Admin User", "admin@edyzen.com", adminPass, "admin", orgId);

  // Insert Teacher
  const teacherPass = bcrypt.hashSync("teacher123", 10);
  insertUser.run("Teacher Dave", "teacher@edyzen.com", teacherPass, "teacher", orgId);
  insertUser.run("Teacher Sarah", "sarah@edyzen.com", teacherPass, "teacher", orgId);

  // Insert Students
  const studentPass = bcrypt.hashSync("student123", 10);
  insertUser.run("Anvi Sharma", "anvi@edyzen.com", studentPass, "student", orgId);
  insertUser.run("Jordan Smith", "jordan@edyzen.com", studentPass, "student", orgId);
  insertUser.run("Emma Wilson", "emma@edyzen.com", studentPass, "student", orgId);
  insertUser.run("Aarav Patel", "aarav@edyzen.com", studentPass, "student", orgId);
  insertUser.run("Diya Gupta", "diya@edyzen.com", studentPass, "student", orgId);
  insertUser.run("Kabir Singh", "kabir@edyzen.com", studentPass, "student", orgId);
  insertUser.run("Neha Desai", "neha@edyzen.com", studentPass, "student", orgId);
  insertUser.run("Rohan Kumar", "rohan@edyzen.com", studentPass, "student", orgId);

  // Insert Parent
  const parentPass = bcrypt.hashSync("parent123", 10);
  insertUser.run("Priya Sharma", "priya@edyzen.com", parentPass, "parent", orgId);

  console.log("✓ Database seeded with prototype values (admin/teacher/anvi/priya @edyzen.com)");
  console.log("✓ Default passwords are: role + 123 (e.g. admin123, teacher123, student123, parent123)");
}

export const query = async (sql: string, params: any[] = []): Promise<any> => {
  try {
    const isModification = /^\s*(INSERT|UPDATE|DELETE|CREATE|DROP)/i.test(sql);
    
    const stmt = db.prepare(sql);
    
    if (isModification) {
      const result = stmt.run(...params);
      return { insertId: result.lastInsertRowid, affectedRows: result.changes };
    } else {
      return stmt.all(...params);
    }
  } catch (error) {
    console.error("SQL Error running query:", sql, "\nError:", error);
    throw error;
  }
};

export const logActivity = async (userId: string, userType: string, action: string, details?: any) => {
  console.log(`[Activity] ${userType}:${userId} - ${action}`, details || "");
};
