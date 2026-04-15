import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import initSqlJs, { SqlJsStatic } from "sql.js";
import bcrypt from "bcryptjs";

dotenv.config();

const DB_PATH = path.resolve("database.sqlite");
let db: any;
let SQL: SqlJsStatic;

const persistDatabase = () => {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
};

export const initDatabase = async () => {
  try {
    SQL = await initSqlJs({ locateFile: (filename) => path.join(process.cwd(), "node_modules", "sql.js", "dist", filename) });
    const filebuffer = fs.existsSync(DB_PATH) ? fs.readFileSync(DB_PATH) : undefined;
    db = filebuffer ? new SQL.Database(filebuffer) : new SQL.Database();
    db.run("PRAGMA foreign_keys = ON;");

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

    console.log("✓ SQLite database connected & initialized");
    
    // Seed the database with prototype values
    seedDatabase();
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
};

const seedDatabase = () => {
  // Check if already seeded
  const countResult = db.exec("SELECT COUNT(*) AS count FROM users;");
  const userCount = Number(countResult?.[0]?.values?.[0]?.[0] ?? 0);
  if (userCount > 0) return;

  // Insert base organization
  const insertOrg = db.prepare("INSERT INTO organizations (name) VALUES (?)");
  insertOrg.run(["Global Academy"]);
  insertOrg.free();
  const orgId = db.exec("SELECT last_insert_rowid() AS id;")[0]?.values?.[0]?.[0];

  // Insert Admin
  const adminPass = bcrypt.hashSync("admin123", 10);
  const insertUser = db.prepare("INSERT INTO users (name, email, password, role, organizationId) VALUES (?, ?, ?, ?, ?)");
  insertUser.run(["Admin User", "admin@edyzen.com", adminPass, "admin", orgId]);

  // Insert Teacher
  const teacherPass = bcrypt.hashSync("teacher123", 10);
  insertUser.run(["Teacher Dave", "teacher@edyzen.com", teacherPass, "teacher", orgId]);
  insertUser.run(["Teacher Sarah", "sarah@edyzen.com", teacherPass, "teacher", orgId]);

  // Insert Students
  const studentPass = bcrypt.hashSync("student123", 10);
  insertUser.run(["Anvi Sharma", "anvi@edyzen.com", studentPass, "student", orgId]);
  insertUser.run(["Jordan Smith", "jordan@edyzen.com", studentPass, "student", orgId]);
  insertUser.run(["Emma Wilson", "emma@edyzen.com", studentPass, "student", orgId]);
  insertUser.run(["Aarav Patel", "aarav@edyzen.com", studentPass, "student", orgId]);
  insertUser.run(["Diya Gupta", "diya@edyzen.com", studentPass, "student", orgId]);
  insertUser.run(["Kabir Singh", "kabir@edyzen.com", studentPass, "student", orgId]);
  insertUser.run(["Neha Desai", "neha@edyzen.com", studentPass, "student", orgId]);
  insertUser.run(["Rohan Kumar", "rohan@edyzen.com", studentPass, "student", orgId]);

  // Insert Parent
  const parentPass = bcrypt.hashSync("parent123", 10);
  insertUser.run(["Priya Sharma", "priya@edyzen.com", parentPass, "parent", orgId]);
  insertUser.run(["Sharanya Parent", "sharanya.parent@gardens.com", parentPass, "parent", orgId]);

  // Insert additional sample users
  insertUser.run(["Sanya Student", "sanya.student@gardens.com", studentPass, "student", orgId]);
  insertUser.run(["Naveen Teacher", "naveen.teacher@gardens.com", teacherPass, "teacher", orgId]);

  console.log("✓ Database seeded with prototype values (admin, teachers, parents, and sample garden emails)");
  console.log("✓ Default passwords are: role + 123 (e.g. admin123, teacher123, student123, parent123)");
  persistDatabase();
}

export const query = async (sql: string, params: any[] = []): Promise<any> => {
  try {
    const isModification = /^\s*(INSERT|UPDATE|DELETE|CREATE|DROP)/i.test(sql);
    const stmt = db.prepare(sql);

    if (params.length) {
      stmt.bind(params);
    }

    if (isModification) {
      stmt.run();
      stmt.free();
      const lastIdResult = db.exec("SELECT last_insert_rowid() AS id;");
      const insertId = lastIdResult[0]?.values?.[0]?.[0] ?? null;
      const affectedRows = db.getRowsModified();
      persistDatabase();
      return { insertId, affectedRows };
    }

    const rows: any[] = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  } catch (error) {
    console.error("SQL Error running query:", sql, "\nError:", error);
    throw error;
  }
};

export const logActivity = async (userId: string, userType: string, action: string, details?: any) => {
  console.log(`[Activity] ${userType}:${userId} - ${action}`, details || "");
};
