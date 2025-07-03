import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Questions from './pages/Questions';
import Tests from './pages/Tests';
import AvailableTests from './pages/AvailableTests';
import TakeTest from './pages/TakeTest';
import Results from './pages/Results';
import Subjects from './pages/Subjects';
import Profile from './pages/Profile';
import StudentReports from './pages/StudentReports';
import TestAttendance from './pages/TestAttendance';
import ImprovementAnalysis from './pages/ImprovementAnalysis';

// Layout component
const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar />}
      <main>{children}</main>
    </div>
  );
};

// Unauthorized page
const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full text-center">
      <div className="bg-white shadow-md rounded-lg p-8">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100 mb-4">
          <svg
            className="h-6 w-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>
        <button
          onClick={() => window.history.back()}
          className="btn-primary"
        >
          Go Back
        </button>
      </div>
    </div>
  </div>
);

// Not Found page
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full text-center">
      <div className="bg-white shadow-md rounded-lg p-8">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 mb-4">
          <svg
            className="h-6 w-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-1.01-6-2.709M15 11V9a6 6 0 00-12 0v2m0 0v10a2 2 0 002 2h8a2 2 0 002-2V11z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist.
        </p>
        <a href="/dashboard" className="btn-primary">
          Go to Dashboard
        </a>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Teacher-only routes */}
            <Route
              path="/questions"
              element={
                <ProtectedRoute roles={['teacher']}>
                  <Questions />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/tests"
              element={
                <ProtectedRoute roles={['teacher']}>
                  <Tests />
                </ProtectedRoute>
              }
            />


            <Route
              path="/subjects"
              element={
                <ProtectedRoute roles={['teacher']}>
                  <Subjects />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student-reports"
              element={
                <ProtectedRoute roles={['teacher']}>
                  <StudentReports />
                </ProtectedRoute>
              }
            />

            <Route
              path="/test-attendance/:testId"
              element={
                <ProtectedRoute roles={['teacher']}>
                  <TestAttendance />
                </ProtectedRoute>
              }
            />

            {/* Student-only routes */}

            {/* Student-only routes */}
            <Route
              path="/available-tests"
              element={
                <ProtectedRoute roles={['student']}>
                  <AvailableTests />
                </ProtectedRoute>
              }
            />

            <Route
              path="/test/:attemptId"
              element={
                <ProtectedRoute roles={['student']}>
                  <TakeTest />
                </ProtectedRoute>
              }
            />

            <Route
              path="/improvement/:testId"
              element={
                <ProtectedRoute roles={['student']}>
                  <ImprovementAnalysis />
                </ProtectedRoute>
              }
            />

            {/* Results routes - accessible by both students and teachers */}

            {/* Results routes - accessible by both students and teachers */}
            <Route
              path="/results"
              element={
                <ProtectedRoute>
                  <Results />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/tests/:testId/attempts"
              element={
                <ProtectedRoute roles={['teacher']}>
                  <Results />
                </ProtectedRoute>
              }
            />

            {/* Profile route - accessible by all authenticated users */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            
            {/* Default redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#4aed88',
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;