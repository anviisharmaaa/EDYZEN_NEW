# EDYZEN

EDYZEN is a modern educational web platform designed for students, teachers, parents, and administrators. It provides personalized learning paths, quiz management, attendance tracking, behavior analytics, and AI-assisted insights in a clean and easy-to-use interface.

## Key Features
- Student dashboard with progress tracking, mood insight, and recommended learning goals
- Teacher dashboard with student analytics, curriculum planning, attendance, and student profiles
- Parent dashboard with announcements, child progress overview, and calendar support
- Role-based authentication for students, teachers, parents, and admins
- Quiz and assignment management
- Learning roadmap and course map navigation
- **AI-enhanced study and mental health assistance** with context-aware responses
- MySQL database integration with automatic schema initialization
- Server-side Express API and React front-end powered by Vite

## Tech Stack

- React 19
- TypeScript
- Vite
- Express
- MySQL / mysql2
- Tailwind CSS
- React Router DOM
- Recharts
- JWT authentication
- bcryptjs for password hashing
- **Google Generative AI (Gemini)** for AI assistance

## AI Features

EDYZEN includes two specialized AI assistants:

### Study Assistant
- Educational explanations and concept clarification
- Study planning and organization guidance
- Clear, concise responses optimized for learning

### Mental Health Companion
- Empathetic support for student well-being
- Crisis detection and professional help recommendations
- Warm, conversational responses focused on emotional support

Both assistants use a unified API endpoint with intelligent prompt differentiation based on context.

## Folder Structure

- `server.ts` — Express server, authentication, and API routes
- `db.ts` — MySQL database initialization and query helper
- `routes/chat.ts` — Unified AI chat endpoint for study and mental health assistance
- `src/` — React application source code
  - `src/pages/` — Role-specific pages for students, teachers, parents, admins
  - `src/components/` — Shared UI components and layout
  - `src/contexts/` — Auth context and session handling
  - `src/lib/` — Utility helpers

## Setup and Run Locally

### Prerequisites

- Node.js 20+ or compatible version
- MySQL server running locally or accessible remotely
- Google Gemini API key (get one at [Google AI Studio](https://makersuite.google.com/app/apikey))

### Install Dependencies

```bash
npm install
```

### Configure Environment

Create a `.env` file at the project root or update `.env.example` with your values.

Required environment variables:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=edyzen
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
```

> `JWT_SECRET` is used for signing authentication tokens. If it is not provided, a default secret is used, but production deployments should always set a secure secret.
>
> `GEMINI_API_KEY` is required for AI functionality. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

### Start the App

```bash
npm run dev
```

The server will start on `http://localhost:3000` by default.

## Production Build

```bash
npm run build
npm run preview
```

## Database Notes

The app automatically creates the configured MySQL database and required tables when it starts. The database connection is configured through the `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` environment variables.

## API Endpoints

### Authentication
- `POST /api/login` — User authentication
- `GET /api/me` — Get current user info

### AI Chat
- `POST /api/chat` — Unified AI chat endpoint
  - Body: `{ "message": "user message", "type": "study" | "mental" }`
  - Returns: `{ "reply": "AI response" }`

## Scripts

- `npm run dev` — start development server
- `npm run build` — build the front-end for production
- `npm run preview` — preview the production build locally
- `npm run clean` — remove generated `dist` output
- `npm run lint` — run TypeScript checks with `tsc --noEmit`

## Notes

- The project is built with role-based pages for students, teachers, parents, and admins.
- Visual analytics are rendered with `recharts` and the UI is designed for clarity and simplicity.
- AI responses are optimized for natural conversation without markdown formatting.
- The AI system automatically differentiates between study and mental health contexts for appropriate responses.
- The server uses Express, Vite, and `tsx` to run TypeScript directly.
