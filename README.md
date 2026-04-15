# EDYZEN: AI-Powered Adaptive Learning Platform

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_6-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google AI](https://img.shields.io/badge/Generative_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

EDYZEN is a modern, responsive educational web platform designed to unify the learning experience for **students, teachers, parents, and administrators**. By leveraging real-time data, role-based dashboards, and Google's Generative AI, EDYZEN provides personalized learning paths, behavior analytics, attendance tracking, and context-aware insights within a clean, intuitive interface.

## ✨ Key Features

- **Role-Based Workspaces:**
  - **👨‍🎓 Student Dashboard:** Progress tracking, mood insights, cognitive load monitoring, and recommended learning goals.
  - **👩‍🏫 Teacher Dashboard:** Comprehensive student analytics, curriculum planning, attendance tracking, and individual student profiles.
  - **👪 Parent Dashboard:** Live announcements, child progress overview, and integrated calendar support.
  - **🔐 Admin Dashboard:** Organization scaling and global management.
- **Intelligent Learning Paths:** Seamless course map navigation, quiz/assignment management, and adaptive content delivery.
- **AI-Enhanced Ecosystem (Powered by Gemini):**
  - **📚 Study Assistant:** Clarifies concepts, helps with study planning, and provides concise, structured educational explanations.
  - **🧠 Mental Health Companion:** Empathetic emotional support, well-being check-ins, and crisis detection.
- **Zero-Config Database:** Runs locally with an **in-memory SQLite database** pre-seeded with test users for rapid prototyping and testing.
- **Modern Architecture:** Full-stack TypeScript mono-repo with a React + Vite frontend and an Express backend.

## 🚀 Tech Stack

- **Frontend:** React 19, HTML/Vanilla CSS via Tailwind CSS, React Router DOM, Recharts, Framer Motion, Lucide React
- **Backend:** Node.js, Express, `tsx` handling execution
- **Database:** Node Built-in SQLite (`node:sqlite`)
- **Authentication:** JWT (JSON Web Tokens), `bcryptjs`
- **AI Integration:** `@google/generative-ai`

## 📂 Project Structure

```text
edyzen-web/
├── server.ts         # Express server, unified API routes, authentication logic
├── db.ts             # SQLite memory database initialization, schema, and auto-seeder
├── routes/           # Domain-specific route handlers (e.g. chat.ts)
├── src/              # React frontend source code
│   ├── components/   # Reusable UI components & layouts
│   ├── contexts/     # Application state (Authentication, etc.)
│   ├── lib/          # Utilities, API wrappers, constants
│   ├── pages/        # Route page components categorized by User Role
│   └── index.css     # Global styles and Tailwind imports
└── package.json      # Dependencies and scripts workflows
```

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v22.14.0+ recommended to fully map `node:sqlite`)
- Google Gemini API Key: Required for AI functionality. Get yours at [Google AI Studio](https://aistudio.google.com/app/apikey).

### 1. Installation

```bash
git clone <repository-url>
cd EDYZEN_NEW
npm install
```

### 2. Environment Configuration

Create a `.env` file at the root of the project by copying the example:

```bash
cp .env.example .env
```

Populate the `.env` file:

```env
JWT_SECRET=super_secret_dev_key
GEMINI_API_KEY=your_gemini_api_key_here
APP_URL=http://localhost:3000
```
> Note: The database connection values (e.g. `DB_HOST`, `DB_USER`) from previous versions are ignored in the prototype setting, as it currently runs using an SQLite in-memory database to facilitate testing.

### 3. Run Development Server

```bash
npm run dev
```

The unified React+Express local server will spin up on `http://localhost:3000`.

### 4. Build for Production

```bash
npm run build     # Generates customized production bundles in /dist
npm run preview   # Previews the production build locally
```

## 🧪 Prototype Seed Data

Upon starting, the in-memory database is **automatically seeded** with working prototype accounts. You can log in immediately upon booting the app.

**Default Passwords:** All seed users use the password format: `[role]123` *(e.g., student123)*.

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@edyzen.com` | `admin123` |
| **Teacher** | `teacher@edyzen.com` | `teacher123` |
| **Student** | `anvi@edyzen.com` | `student123` |
| **Parent** | `priya@edyzen.com` | `parent123` |

## 🔌 API Endpoints
The backend runs alongside Vite and provides the following core routes under `/api`:

### Authentication
- `POST /api/login` — Verifies credentials and returns a signed JWT.
- `GET /api/me` — Fetches current user profile based on active session.

### AI Processing
- `POST /api/chat` — Unified chat inference stream.
  - **Body:** `{ "message": "Explain osmosis", "type": "study" | "mental" }`
  - **Response:** `{ "reply": "Osmosis is the spontaneous net movement..." }`

---

*Redefining accessible and adaptive learning for the next generation.*
