import React, { useState, useEffect, Component, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('React Error Boundary caught:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-white">
          <div className="neo-card max-w-md text-center border-red-200 bg-red-50">
            <h1 className="text-2xl font-bold text-red-900 mb-4">Something went wrong</h1>
            <p className="text-sm font-normal text-red-800 mb-6">Please refresh the page and try again.</p>
            <button 
              onClick={() => window.location.reload()}
              className="neo-button-primary px-6 py-2 rounded-lg w-full"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
import { LoginPage } from './pages/LoginPage';
import { Layout } from './components/Layout';
import { StudentDashboard } from './pages/StudentDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { ParentDashboard } from './pages/ParentDashboard';
import { LearningProfilePage } from './pages/LearningProfilePage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MoodGuard } from './components/MoodGuard';
import { StudentOnboarding } from './pages/StudentOnboarding';
import { StudentQuiz } from './pages/StudentQuiz';
import { StudentQuizzes } from './pages/StudentQuizzes';
import { StudentRoadmap } from './pages/StudentRoadmap';
import { StudentTopic } from './pages/StudentTopic';
import { PersonalityReportPage } from './pages/PersonalityReportPage';
import { StudentAIMental } from './pages/StudentAIMental';
import { StudentAIStudy } from './pages/StudentAIStudy';
import { StudentNotes } from './pages/StudentNotes';
import { CourseMapPage } from './pages/CourseMapPage';
import { AssignmentPage } from './pages/AssignmentPage';
import { CalendarPage } from './pages/CalendarPage';
import { DiaryPage } from './pages/DiaryPage';
import { TeacherAttendance } from './pages/TeacherAttendance';
import { TeacherCurriculum } from './pages/TeacherCurriculum';
import { TeacherAnalytics } from './pages/TeacherAnalytics';
import { TeacherStudentProfile } from './pages/TeacherStudentProfile';
import { ParentChildOverview } from './pages/ParentChildOverview';
import { ParentAnnouncements } from './pages/ParentAnnouncements';
import { TeacherCalendar } from './pages/TeacherCalendar';
import { ParentCalendar } from './pages/ParentCalendar';
import { TeacherStudents } from './pages/TeacherStudents';
import { AdminDashboard } from './pages/AdminDashboard';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
      <p className="font-medium text-gray-600">Loading...</p>
    </div>
  </div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={`/${user.role}/dashboard`} replace />
            ) : (
              <LoginPage />
            )
          }
        />
        
        {/* Student Routes */}
        <Route path="/student/onboarding" element={
          <ProtectedRoute allowedRole="student">
            <StudentOnboarding />
          </ProtectedRoute>
        } />
        
        <Route path="/student/*" element={
          <ProtectedRoute allowedRole="student">
            <MoodGuard>
              <Layout>
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="quizzes" element={<StudentQuizzes />} />
                  <Route path="profile" element={<LearningProfilePage />} />
                  <Route path="personality-report" element={<PersonalityReportPage />} />
                  <Route path="roadmap" element={<StudentRoadmap />} />
                  <Route path="topic/:topicId" element={<StudentTopic />} />
                  <Route path="topic/:topicId/course-map" element={<CourseMapPage />} />
                  <Route path="assignment/:assignmentId" element={<AssignmentPage />} />
                   <Route path="calendar" element={<CalendarPage />} />
                   <Route path="notes" element={<StudentNotes />} />
                   <Route path="ai/mental" element={<StudentAIMental />} />
                   <Route path="ai/study" element={<StudentAIStudy />} />
                   
                </Routes>
              </Layout>
            </MoodGuard>
          </ProtectedRoute>
        } />
        
        <Route path="/student/quiz/:quizId" element={
          <ProtectedRoute allowedRole="student">
            <StudentQuiz />
          </ProtectedRoute>
        } />

        {/* Teacher Routes */}
        <Route path="/teacher/*" element={
          <ProtectedRoute allowedRole="teacher">
            <Layout>
              <Routes>
                <Route path="dashboard" element={<TeacherDashboard />} />
                <Route path="attendance" element={<TeacherAttendance />} />
                <Route path="curriculum" element={<TeacherCurriculum />} />
                <Route path="analytics" element={<TeacherAnalytics />} />
                <Route path="calendar" element={<TeacherCalendar />} />
                <Route path="students" element={<TeacherStudents />} />
                <Route path="student/:studentId" element={<TeacherStudentProfile />} />
                
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />

        {/* Parent Routes */}
        <Route path="/parent/*" element={
          <ProtectedRoute allowedRole="parent">
            <Layout>
              <Routes>
                <Route path="dashboard" element={<ParentDashboard />} />
                <Route path="child" element={<ParentChildOverview />} />
                <Route path="announcements" element={<ParentAnnouncements />} />
                <Route path="calendar" element={<ParentCalendar />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
