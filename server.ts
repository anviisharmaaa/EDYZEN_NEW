import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import chatRoute from "./routes/chat";

dotenv.config();
console.log("Gemini Key:", process.env.GEMINI_API_KEY);
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "edyzen-secret-key-123";

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true,
}));

// Chat route for Claude AI
app.use("/api", chatRoute);

// Database import
import { initDatabase, query, logActivity } from "./db.js";

let topics = [
  { id: "top1", classId: "c1", title: "Algebra Basics", description: "Learn the basics of algebra", orderIndex: 1, status: "completed", difficulty: "Easy", estMinutes: 45, materials: [] },
  { id: "top2", classId: "c1", title: "Linear Equations", description: "Solve for x and graph lines", orderIndex: 2, status: "in-progress", difficulty: "Medium", estMinutes: 60, materials: [] },
  { id: "top3", classId: "c1", title: "Quadratic Equations", description: "Learn about parabolas", orderIndex: 3, status: "locked", difficulty: "Hard", estMinutes: 90, materials: [] },
];

let quizzes = [
  { id: 1, topicId: "top1", title: "Algebra Basics Check-in", difficulty: "Easy", estMinutes: 5 },
  { id: 2, topicId: "top2", title: "Linear Equations Quiz", difficulty: "Medium", estMinutes: 8 },
];

let questions = [
  { id: 1, quizId: 1, text: "What is 1/2 + 1/4?", options: ["1/6", "3/4", "2/4", "1/2"], correctIndex: 1, questionType: "analytical" },
  { id: 2, quizId: 1, text: "Identify the shaded part of the circle.", options: ["1/3", "1/4", "1/2", "2/3"], correctIndex: 2, questionType: "visual" },
  { id: 3, quizId: 2, text: "If x = 5, what is 2x + 3?", options: ["10", "13", "8", "15"], correctIndex: 1, questionType: "analytical" },
];

let quizAttempts: any[] = [];
let moodCheckins: any[] = [];
let diaryEntries: any[] = [];
let activityLogs: any[] = [];
let materials: any[] = [];
let studentNotes: any[] = [];

// SHARED STUDENT DATA
const STUDENTS = {
  "s1": { id: "s1", name: "Anvi Sharma", email: "anvi@edyzen.com", accuracy: 85, mood: "ok", progress: 75, timePerQuestion: 25, className: "Grade 7 - Mathematics" },
  "s2": { id: "s2", name: "Jordan Smith", email: "jordan@edyzen.com", accuracy: 55, mood: "stressed", progress: 45, timePerQuestion: 45, className: "Grade 7 - Mathematics" },
  "s3": { id: "s3", name: "Emma Wilson", email: "emma@edyzen.com", accuracy: 95, mood: "happy", progress: 90, timePerQuestion: 20, className: "Grade 7 - Mathematics" },
};

// --- Auth Middleware ---
const authenticate = (req: any, res: any, next: any) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: "No token" });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// --- Admin Middleware ---
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// ======================
// AUTH ROUTES
// ======================

// POST /api/login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const users: any[] = await query("SELECT * FROM users WHERE email = ?", [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }
    
    const user = users[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        name: user.name,
        email: user.email,
        organizationId: user.organizationId
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    res.cookie("token", token, { 
      httpOnly: true, 
      sameSite: "lax", 
      secure: false, 
      path: "/" 
    });
    
    logActivity(user.id, user.role, 'login', { email });
    
    res.json({
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
      organizationId: user.organizationId
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

app.get("/api/me", authenticate, (req: any, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    role: req.user.role,
    email: req.user.email,
    organizationId: req.user.organizationId,
  });
});

// POST /api/logout
app.post("/api/logout", authenticate, (req: any, res) => {
  logActivity(req.user.id, req.user.role, 'logout');
  res.clearCookie("token", { path: "/" });
  res.json({ success: true });
});

// ======================
// ADMIN ROUTES
// ======================

// POST /api/admin/create-user - Only admin can create teacher or student
app.post("/api/admin/create-user", authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role, organizationId } = req.body;
    
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Name, email, password and role are required" });
    }
    
    if (!['teacher', 'student'].includes(role)) {
      return res.status(400).json({ error: "Role must be teacher or student" });
    }
    
    const existingUsers: any[] = await query("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "User with this email already exists" });
    }
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const result: any = await query(
      "INSERT INTO users (name, email, password, role, organizationId) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, role, organizationId || null]
    );
    
    logActivity(req.user.id, 'admin', 'user_created', { userId: result.insertId, role, name });
    
    res.json({ 
      success: true, 
      message: `${role} created successfully`,
      user: { id: result.insertId, name, email, role }
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// GET /api/admin/users - Return all users grouped by role
app.get("/api/admin/users", authenticate, requireAdmin, async (req, res) => {
  try {
    const users: any[] = await query("SELECT id, name, email, role, organizationId, createdAt FROM users ORDER BY role, name");
    
    const grouped = {
      teachers: users.filter(u => u.role === 'teacher'),
      students: users.filter(u => u.role === 'student'),
      admins: users.filter(u => u.role === 'admin')
    };
    
    res.json(grouped);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// DELETE /api/admin/users/:id
app.delete("/api/admin/users/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    const users: any[] = await query("SELECT role FROM users WHERE id = ?", [userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (users[0].role === 'admin') {
      return res.status(400).json({ error: "Cannot delete admin users" });
    }
    
    await query("DELETE FROM users WHERE id = ?", [userId]);
    
    logActivity(req.user.id, 'admin', 'user_deleted', { userId });
    
    res.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// ======================
// ORGANIZATION ROUTES
// ======================

app.get("/api/organizations", async (req, res) => {
  try {
    const orgs: any[] = await query("SELECT id, name FROM organizations");
    res.json(orgs);
  } catch (error) {
    res.json([]);
  }
});

// GET TEACHERS BY ORG
app.get("/api/organizations/:id/teachers", async (req, res) => {
  try {
    const orgId = req.params.id;
    const rows: any[] = await query(
      "SELECT id, name, email FROM users WHERE role = 'teacher' AND organizationId = ?",
      [orgId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch teachers" });
  }
});

// GET STUDENTS BY ORG
app.get("/api/organizations/:id/students", async (req, res) => {
  try {
    const orgId = req.params.id;
    const rows: any[] = await query(
      "SELECT id, name, email FROM users WHERE role = 'student' AND organizationId = ?",
      [orgId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// ADD TEACHER
app.post("/api/organizations/:id/teachers", async (req, res) => {
  try {
    const orgId = req.params.id;
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password required" });
    }
    
    const existing: any[] = await query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "User with this email already exists" });
    }
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const result: any = await query(
      "INSERT INTO users (name, email, password, role, organizationId) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, "teacher", orgId]
    );
    
    res.json({ id: result.insertId, name, email, role: "teacher" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add teacher" });
  }
});

// ADD STUDENT
app.post("/api/organizations/:id/students", async (req, res) => {
  try {
    const orgId = req.params.id;
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password required" });
    }
    
    const existing: any[] = await query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "User with this email already exists" });
    }
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const result: any = await query(
      "INSERT INTO users (name, email, password, role, organizationId) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, "student", orgId]
    );
    
    res.json({ id: result.insertId, name, email, role: "student" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add student" });
  }
});

// DELETE TEACHER
app.delete("/api/organizations/:id/teachers/:teacherId", async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    await query("DELETE FROM users WHERE id = ? AND role = 'teacher'", [teacherId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete teacher" });
  }
});

// GET PARENTS BY ORG
app.get("/api/organizations/:id/parents", async (req, res) => {
  try {
    const orgId = req.params.id;
    const rows: any[] = await query(
      "SELECT id, name, email FROM users WHERE role = 'parent' AND organizationId = ?",
      [orgId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch parents" });
  }
});

// ADD PARENT
app.post("/api/organizations/:id/parents", async (req, res) => {
  try {
    const orgId = req.params.id;
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password required" });
    }
    
    const existing: any[] = await query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "User with this email already exists" });
    }
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const result: any = await query(
      "INSERT INTO users (name, email, password, role, organizationId) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, "parent", orgId]
    );
    
    res.json({ id: result.insertId, name, email, role: "parent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add parent" });
  }
});

// DELETE PARENT
app.delete("/api/organizations/:id/parents/:parentId", async (req, res) => {
  try {
    const parentId = req.params.parentId;
    await query("DELETE FROM users WHERE id = ? AND role = 'parent'", [parentId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete parent" });
  }
});

// POST /api/admin/create-organization - Create organization + admin user
app.post("/api/admin/create-organization", async (req, res) => {
  try {
    const { name, adminName, adminEmail, adminPassword } = req.body;
    
    if (!name || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }
    
    const existingOrg: any[] = await query("SELECT id FROM organizations WHERE name = ?", [name]);
    if (existingOrg.length > 0) {
      return res.status(400).json({ error: "Organization already exists" });
    }
    
    const existingUser: any[] = await query("SELECT id FROM users WHERE email = ?", [adminEmail]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "User with this email already exists" });
    }
    
    const orgResult: any = await query("INSERT INTO organizations (name) VALUES (?)", [name]);
    const orgId = orgResult.insertId;
    
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);
    
    const userResult: any = await query(
      "INSERT INTO users (name, email, password, role, organizationId) VALUES (?, ?, ?, ?, ?)",
      [adminName, adminEmail, hashedPassword, "admin", orgId]
    );
    
    const token = jwt.sign(
      { 
        id: userResult.insertId, 
        role: "admin", 
        name: adminName,
        email: adminEmail,
        organizationId: orgId
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    res.cookie("token", token, { 
      httpOnly: true, 
      sameSite: "lax", 
      secure: false, 
      path: "/" 
    });
    
    res.json({ 
      success: true, 
      message: "Organization and admin created",
      organization: { id: orgId, name },
      user: { id: userResult.insertId, name: adminName, email: adminEmail, role: "admin" }
    });
  } catch (error) {
    console.error("Create organization error:", error);
    res.status(500).json({ error: "Failed to create organization" });
  }
});

app.post("/api/organizations", async (req, res) => {
  try {
    const { name, adminEmail, adminPassword } = req.body;
    const hashedPassword = adminPassword ? bcrypt.hashSync(adminPassword, 10) : null;
    
    const result: any = await query(
      "INSERT INTO organizations (name, adminEmail, adminPassword) VALUES (?, ?, ?)",
      [name, adminEmail, hashedPassword]
    );
    
    const org = { id: result.insertId, name };
    res.json(org);
  } catch (error) {
    console.error("Create org error:", error);
    res.status(500).json({ error: "Failed to create organization" });
  }
});

// --- Calendar Events ---
app.get("/api/calendar", authenticate, (req: any, res) => {
  const today = new Date();
  const events = [
    { id: "1", title: "Math Quiz - Algebra", start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0).toISOString(), end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0).toISOString(), type: "quiz", subject: "Mathematics" },
    { id: "2", title: "Study Session: Linear Equations", start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0).toISOString(), end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 30).toISOString(), type: "study", subject: "Mathematics" },
    { id: "3", title: "Assignment Due: Chapter 3", start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 23, 59).toISOString(), end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 23, 59).toISOString(), type: "assignment", subject: "Mathematics" },
    { id: "4", title: "Parent-Teacher Meeting", start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 16, 0).toISOString(), end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 17, 0).toISOString(), type: "general" },
  ];
  res.json(events);
});

// --- Assignments ---
app.get("/api/assignments/:id", authenticate, (req: any, res) => {
  const id = req.params.id;
  const assignments: any = {
    a1: { id: "a1", title: "Algebra Basics Quiz", dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), status: "PENDING", instructions: "Complete all questions on algebraic expressions and equations.", rubric: "Correct answers earn full marks. Show all work." },
    a2: { id: "a2", title: "Linear Equations Worksheet", dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), status: "PENDING", instructions: "Solve 10 linear equation problems. Show your work for each.", rubric: "Each correct solution earns 10 points." },
  };
  if (assignments[id]) {
    res.json(assignments[id]);
  } else {
    res.status(404).json({ error: "Assignment not found" });
  }
});

// --- Teacher APIs ---
app.get("/api/teachers/me/classes", authenticate, (req: any, res) => {
  res.json([{ id: "c1", name: "7B Mathematics", studentCount: 25, avgMood: "ok", alerts: 3 }]);
});

app.get("/api/teachers/me/analytics", authenticate, (req: any, res) => {
  res.json({
    id: "c1",
    name: "Mathematics 7B",
    avgAccuracy: 78,
    avgTimePerQuestion: 25,
    moodDistribution: { ok: 70, tired: 20, stressed: 10 },
    weakTopics: ["Algebraic Expressions"],
    topPerformers: [{ id: 1, name: "Alex Rivers", score: 95 }],
    strugglingStudents: [{ id: 2, name: "Jordan Smith", score: 45, mood: "stressed" }]
  });
});

app.get("/api/teachers/me/students/:id", authenticate, (req, res) => {
  const studentId = req.params.id;
  
  const cognitiveStyles = {
    "s1": { pace: "Fast", preference: "Visual", approach: ["Explorer", "Hands-on"] },
    "s2": { pace: "Slow", preference: "Audio", approach: ["Read aloud", "Discussion"] },
    "s3": { pace: "Fast", preference: "Kinesthetic", approach: ["Practice", "Experiments"] },
  };
  
  const personalityReports = {
    "s1": { type: "Visual Learner", report: "Anvi learns best through visual aids, diagrams, and color-coded notes.", strengths: ["Visual thinking", "Pattern recognition", "Creative problem solving"], recommendations: ["Use color-coded notes", "Watch video explanations", "Draw diagrams while studying"] },
    "s2": { type: "Auditory Learner", report: "Jordan benefits from verbal explanations and discussion-based learning.", strengths: ["Verbal communication", "Listening skills", "Teamwork"], recommendations: ["Use audiobook resources", "Discuss concepts verbally", "Group study sessions"] },
    "s3": { type: "Kinesthetic Learner", report: "Emma learns best through hands-on activities and physical practice.", strengths: ["Hands-on skills", "Physical coordination", "Quick learner"], recommendations: ["Use physical models", "Conduct experiments", "Take breaks with movement"] },
  };
  
  const base = STUDENTS[studentId] || STUDENTS["s1"];
  res.json({
    ...base,
    role: "student",
    cognitiveStyle: cognitiveStyles[studentId] || cognitiveStyles["s1"],
    personalityReport: personalityReports[studentId] || personalityReports["s1"],
    weakTopics: studentId === "s1" ? ["Linear equations", "Quadratic word problems"] : studentId === "s2" ? ["Fractions", "Word problems", "Basic algebra"] : ["Geometry proofs"],
    recentActivity: studentId === "s1" ? [{ id: "a1", title: "Algebra Quiz", type: "quiz", date: "Apr 3, 2026", score: 85 }] : studentId === "s2" ? [{ id: "b1", title: "Fractions Quiz", type: "quiz", date: "Apr 3, 2026", score: 45 }] : [{ id: "c1", title: "Geometry Quiz", type: "quiz", date: "Apr 3, 2026", score: 95 }],
    quizHistory: studentId === "s1" ? [{ date: "Week 1", score: 65 }, { date: "Week 2", score: 72 }, { date: "Week 3", score: 78 }, { date: "Week 4", score: 85 }] : studentId === "s2" ? [{ date: "Week 1", score: 40 }, { date: "Week 2", score: 45 }, { date: "Week 3", score: 50 }, { date: "Week 4", score: 55 }] : [{ date: "Week 1", score: 80 }, { date: "Week 2", score: 85 }, { date: "Week 3", score: 90 }, { date: "Week 4", score: 95 }],
  });
});

app.get("/api/teachers/me/attendance", authenticate, (req: any, res) => {
  res.json([
    { id: 1, name: "Alex Rivers", present: true, mood: "ok" },
    { id: 2, name: "Jordan Smith", present: true, mood: "tired" }
  ]);
});

app.get("/api/teachers/me/curriculum", authenticate, (req: any, res) => {
  res.json(topics);
});

app.get("/api/topics", (req, res) => {
  res.json(topics);
});

app.get("/api/topics/:id", (req, res) => {
  const topic = topics.find(t => t.id === req.params.id);
  if (topic) {
    res.json({
      ...topic,
      subTopics: [
        { id: "s1", title: "Introduction", description: "Basic concepts and definitions", completed: true, materials: [] },
        { id: "s2", title: "Practice Problems", description: "Work through example problems", completed: false, materials: [] },
        { id: "s3", title: "Advanced Applications", description: "Real-world applications", completed: false, materials: [] },
      ]
    });
  } else {
    res.status(404).json({ error: "Topic not found" });
  }
});

app.get("/api/quizzes", (req, res) => {
  res.json(quizzes);
});

app.get("/api/quizzes/:id", (req, res) => {
  const quiz = quizzes.find(q => q.id === parseInt(req.params.id));
  if (!quiz) return res.status(404).json({ error: "Quiz not found" });
  const quizQuestions = questions.filter(q => q.quizId === quiz.id);
  res.json({ ...quiz, questions: quizQuestions });
});

app.post("/api/quiz-attempts", authenticate, (req: any, res) => {
  const { quizId, questionAttempts } = req.body;
  const quiz = quizzes.find(q => q.id === quizId);
  if (!quiz) return res.status(404).json({ error: "Quiz not found" });
  
  const quizQuestions = questions.filter(q => q.quizId === quizId);
  let correct = 0;
  
  for (const qa of questionAttempts || []) {
    const qn = quizQuestions.find(q => q.id === qa.questionId);
    if (!qn) continue;
    const isCorrect = qa.answer === qn.options[qn.correctIndex];
    if (isCorrect) correct++;
  }
  
  const pct = quizQuestions.length ? Math.round((correct / quizQuestions.length) * 100) : 0;
  
  const attempt = {
    id: Date.now(),
    studentId: req.user.id,
    quizId,
    score: correct,
    totalQuestions: quizQuestions.length,
    percent: pct,
    completedAt: new Date().toISOString()
  };
  quizAttempts.push(attempt);
  
  logActivity(req.user.id, 'student', 'quiz_completed', { quizId, score: pct });
  
  res.json({
    success: true,
    score: correct,
    total: quizQuestions.length,
    percent: pct
  });
});

app.post("/api/mood-checkins", authenticate, (req: any, res) => {
  const { mood, context } = req.body;
  const checkin = {
    id: Date.now(),
    studentId: req.user.id,
    mood,
    context: context || 'daily',
    timestamp: new Date().toISOString()
  };
  moodCheckins.push(checkin);
  logActivity(req.user.id, 'student', 'mood_checkin', { mood });
  res.json(checkin);
});

app.get("/api/students/me/mood/today", authenticate, (req: any, res) => {
  const today = new Date().toISOString().split('T')[0];
  const mood = moodCheckins.find(m => m.studentId === req.user.id && m.timestamp.startsWith(today));
  res.json(mood || null);
});

app.get("/api/students/me/diary", authenticate, (req: any, res) => {
  res.json(diaryEntries.filter(d => d.studentId === req.user.id));
});

app.post("/api/students/me/diary", authenticate, (req: any, res) => {
  const { title, content, mood } = req.body;
  const entry = {
    id: Date.now(),
    studentId: req.user.id,
    title,
    content,
    mood,
    timestamp: new Date().toISOString()
  };
  diaryEntries.push(entry);
  logActivity(req.user.id, 'student', 'diary_entry', { title });
  res.json(entry);
});

app.get("/api/students/me/status", authenticate, (req: any, res) => {
  res.json({
    status: "active",
    currentTopic: "Linear Equations",
    nextMilestone: "Complete Quiz 2",
    streak: 3,
    weeklyProgress: [30, 45, 20, 60, 50, 0, 0],
    achievements: ["Quick Learner", "Perfect Score"],
  });
});

app.get("/api/students/me/notes", authenticate, (req: any, res) => {
  res.json(studentNotes.filter(n => n.studentId === req.user.id));
});

app.post("/api/students/me/notes", authenticate, (req: any, res) => {
  const { title, content } = req.body;
  const note = {
    id: Date.now(),
    studentId: req.user.id,
    title,
    content,
    createdAt: new Date().toISOString()
  };
  studentNotes.push(note);
  res.json(note);
});

app.delete("/api/students/me/notes/:id", authenticate, (req: any, res) => {
  const noteId = parseInt(req.params.id);
  studentNotes = studentNotes.filter(n => !(n.studentId === req.user.id && n.id === noteId));
  res.json({ success: true });
});

app.get("/api/students/me/behavior-summary", authenticate, (req: any, res) => {
  res.json({
    totalTimeMin: 145,
    totalClicks: 89,
    quizAttempts: 3,
    avgTimePerQuestion: 25,
    focusScore: 82,
    engagementTrend: "improving",
  });
});

app.get("/api/students/me/profile", authenticate, (req: any, res) => {
  res.json({
    name: req.user.name,
    classLabel: "Grade 7 - Mathematics",
    learningType: "Visual Learner",
    pace: "Fast",
    preference: "Visual",
    approach: ["Explorer", "Hands-on"],
    performance: {
      accuracy: 78,
      byType: [
        { type: "Visual", accuracy: 85 },
        { type: "Analytical", accuracy: 72 },
        { type: "Kinesthetic", accuracy: 75 }
      ]
    },
    weakTopics: ["Linear Equations", "Quadratic Word Problems"],
    strongTopics: ["Algebra Basics", "Number Patterns"],
    cognitiveTestResults: [
      { date: "2026-01-15", score: 85, description: "Strong visual-spatial reasoning" }
    ]
  });
});

app.get("/api/students/me/personality", authenticate, (req: any, res) => {
  res.json({
    type: "Explorer",
    approachTag: "Hands-on Learner",
    primaryStyle: "Visual",
    motivations: ["Achievement", "Curiosity"],
    optimalEnvironment: "Quiet with visual aids",
  });
});

app.get("/api/students/me/cognitive-results", authenticate, (req: any, res) => {
  res.json({
    pace: "Fast",
    preference: "Visual",
    approach: ["Explorer", "Hands-on"],
    scores: { visual: 85, auditory: 65, kinesthetic: 75 },
  });
});

app.post("/api/students/me/cognitive-results", authenticate, (req: any, res) => {
  const { pace, preference, approach } = req.body;
  res.json({
    pace,
    preference,
    approach,
    scores: { visual: 85, auditory: 65, kinesthetic: 75 },
    submittedAt: new Date().toISOString()
  });
});

app.get("/api/students/me/roadmap", authenticate, (req: any, res) => {
  res.json([
    { id: "top1", title: "Algebra Basics", status: "completed", progress: 100, description: "Learn the basics of algebra", difficulty: "Easy", estMinutes: 45 },
    { id: "top2", title: "Linear Equations", status: "current", progress: 60, description: "Solve for x and graph lines", difficulty: "Medium", estMinutes: 60 },
    { id: "top3", title: "Quadratic Equations", status: "locked", progress: 0, description: "Learn about parabolas", difficulty: "Hard", estMinutes: 90 },
  ]);
});

app.get("/api/students/me/summary", authenticate, (req: any, res) => {
  const studentAttempts = quizAttempts.filter(a => a.studentId === req.user.id);
  const acc = studentAttempts.length > 0
    ? studentAttempts.reduce((sum, a) => sum + a.percent, 0) / studentAttempts.length
    : 0;
  
  res.json({
    greeting: "Hello",
    mood: "ok",
    progress: 40,
    assignmentsDue: 2,
    quizzesAvailable: 3,
    dailyGoal: {
      title: "Practice Linear Equations",
      topicId: "top2",
      progressPct: 35,
      quizzesRemaining: 2,
      minutesEstimate: 15,
    },
    insights: [
      { type: "warning", text: "Spend extra time on weak topics to stay on track." },
      { type: "info", text: "Your accuracy improved this week—keep going." },
    ],
    recommendations: [
      "Review the example problems in the course map.",
      "Try a short practice quiz after your next study session.",
    ],
    weakTopics: ["Linear equations"],
    weeklyMinutes: [10, 20, 15, 30, 25, 0, 0],
    behaviorSnapshot: {
      timeSpentMin: 90,
      clicks: 120,
      quizAttempts: 2,
    },
    adaptiveHint: "more_practice",
    risk: acc > 80 ? "low" : acc < 50 ? "high" : "medium",
    streak: 3,
  });
});

app.get("/api/students", authenticate, (req: any, res) => {
  res.json(Object.values(STUDENTS).map(s => ({ _id: s.id, name: s.name, email: s.email, accuracy: s.accuracy, mood: s.mood })));
});

app.get("/api/attendance", authenticate, (req: any, res) => {
  res.json([
    { studentId: "s1", present: true, date: new Date().toISOString() },
    { studentId: "s2", present: true, date: new Date().toISOString() },
    { studentId: "s3", present: false, date: new Date().toISOString() },
  ]);
});

app.get("/api/attendance/analytics", authenticate, (req: any, res) => {
  res.json([
    { studentId: "s1", percentage: 85, mood: "ok", status: "good", alert: "none" },
    { studentId: "s2", percentage: 55, mood: "stressed", status: "critical", alert: "high" },
    { studentId: "s3", percentage: 95, mood: "happy", status: "good", alert: "none" },
  ]);
});

app.get("/api/students/me/activity", authenticate, (req: any, res) => {
  const logs = activityLogs.filter(l => l.userId === req.user.id).slice(-50);
  res.json(logs);
});

app.post("/api/activity", authenticate, (req: any, res) => {
  const { action, details } = req.body;
  logActivity(req.user.id, req.user.role, action, details);
  res.json({ success: true });
});

app.post("/api/materials", authenticate, (req: any, res) => {
  const { title, url, studentId } = req.body;
  const material = {
    id: Date.now(),
    title,
    url,
    studentId,
    createdAt: new Date().toISOString(),
  };
  materials.push(material);
  res.json(material);
});

app.get("/api/teachers/me/students-overview", authenticate, (req: any, res) => {
  const orgId = req.query.orgId;
  const students = Object.values(STUDENTS)
    .filter((s: any) => !orgId || s.organizationId == orgId)
    .map((s: any) => ({ id: s.id, name: s.name, email: s.email, progress: s.progress || 0, accuracy: s.accuracy || 0, mood: s.mood || 'ok', weakTopics: s.weakTopics || [] }));
  res.json(students.length ? students : Object.values(STUDENTS));
});

app.post("/api/students", authenticate, async (req: any, res) => {
  const { name, email, password, orgId } = req.body;
  const hashedPassword = bcrypt.hashSync(password || 'password', 10);
  const result: any = await query(
    "INSERT INTO users (name, email, password, role, organizationId) VALUES (?, ?, ?, ?, ?)",
    [name, email, hashedPassword, 'student', orgId || null]
  );
  res.json({ id: result.insertId, name, email, role: 'student', organizationId: orgId || null });
});

app.get("/api/parents/me/children", authenticate, (req: any, res) => {
  res.json([
    { id: 's1', name: 'Anvi Sharma', mood: 'ok', progress: 75, lastActivity: '2 hours ago' },
    { id: 's2', name: 'Jordan Smith', mood: 'stressed', progress: 45, lastActivity: '1 day ago' },
  ]);
});

app.get("/api/parents/me/announcements", authenticate, (req: any, res) => {
  res.json([
    { id: 'n1', title: 'School closed on Friday', content: 'Due to maintenance, the school will be closed on Friday.', date: 'April 10, 2026', type: 'event', author: 'School Admin' },
    { id: 'n2', title: 'New math resources available', content: 'Updated study materials are now available for your child.', date: 'April 8, 2026', type: 'general', author: 'Teacher Team' },
  ]);
});

app.get("/api/parents/me/child-details", authenticate, (req: any, res) => {
  const childId = req.query.childId || 's1';
  const child = STUDENTS[childId as string] || STUDENTS['s1'];
  res.json({
    id: child.id,
    name: child.name,
    mood: child.mood,
    progress: child.progress,
    accuracy: child.accuracy,
    timePerQuestion: child.timePerQuestion,
    weakTopics: ["Linear equations", "Quadratic word problems"],
    recentActivity: [
      { id: 'a1', title: 'Algebra Quiz', type: 'quiz', date: 'Apr 3, 2026', score: 85 },
      { id: 'a2', title: 'Linear Equations Lesson', type: 'lesson', date: 'Apr 2, 2026' },
      { id: 'a3', title: 'Fractions Worksheet', type: 'assignment', date: 'Apr 1, 2026', score: 92 },
    ]
  });
});

app.all("/api/*", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: "Internal server error" });
});

// --- Vite Integration ---
async function startServer() {
  try {
    await initDatabase();
    
    const orgs: any[] = await query("SELECT id FROM organizations LIMIT 1");
    if (orgs.length === 0) {
      await query("INSERT INTO organizations (name) VALUES (?)", ["Default School"]);
      console.log("Created default organization");
    }
  } catch (error) {
    console.warn("MySQL not available, using fallback mode");
  }

  app.get("/test", async (req, res) => {
    try {
      const users = await query(`
        SELECT id, name, email, role, organizationId, createdAt 
        FROM users
      `);
      res.json(users);
    } catch (err) {
      res.status(500).send(err);
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
