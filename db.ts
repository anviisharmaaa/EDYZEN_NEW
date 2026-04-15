import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { DatabaseSync } from "node:sqlite";
import bcrypt from "bcryptjs";

dotenv.config();

// Use an in-memory temp DB for prototyping
const db = new DatabaseSync(":memory:");

const supabaseUrl = process.env.SUPABASE_URL || "https://aysucntiklrymddmzuuq.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dGBlb3BhYmFzZSIsImlhdCI6MTc3NjEyNzIwMiwiZXhwIjoyMDkxNzAzMjAyfQ.sNbXvL8Nls3P9XJ9DB2K9wiw_VZkcr0FwdjStPmKBNE";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "edyzen",
};

export let pool: mysql.Pool;

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

export const testSupabaseConnection = async () => {
  const { data, error } = await supabase.from("students").select("*");
  if (error) throw error;
  return data;
};

export const logActivity = async (userId: string, userType: string, action: string, details?: any) => {
  console.log(`[Activity] ${userType}:${userId} - ${action}`, details || "");
};
