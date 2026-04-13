# EDYZEN

EDYZEN is a modern educational web platform designed for students, teachers, parents, and administrators. It provides personalized learning paths, quiz management, attendance tracking, behavior analytics, and AI-assisted insights in a clean and easy-to-use interface.

## Key Features
- Student dashboard with progress tracking, mood insight, and recommended learning goals
- Teacher dashboard with student analytics, curriculum planning, attendance, and student profiles
- Parent dashboard with announcements, child progress overview, and calendar support
- Role-based authentication for students, teachers, parents, and admins
- Quiz and assignment management
- Learning roadmap and course map navigation
- AI-enhanced study and mental health assistance
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

## Folder Structure

- `server.ts` — Express server, authentication, and API routes
- `db.ts` — MySQL database initialization and query helper
- `src/` — React application source code
  - `src/pages/` — Role-specific pages for students, teachers, parents, admins
  - `src/components/` — Shared UI components and layout
  - `src/contexts/` — Auth context and session handling
  - `src/lib/` — Utility helpers

## Setup and Run Locally

### Prerequisites

- Node.js 20+ or compatible version
- MySQL server running locally or accessible remotely

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

## Scripts

- `npm run dev` — start development server
- `npm run build` — build the front-end for production
- `npm run preview` — preview the production build locally
- `npm run clean` — remove generated `dist` output
- `npm run lint` — run TypeScript checks with `tsc --noEmit`

## Notes

- The project is built with role-based pages for students, teachers, parents, and admins.
- Visual analytics are rendered with `recharts` and the UI is designed for clarity and simplicity.
- The server uses Express, Vite, and `tsx` to run TypeScript directly.
