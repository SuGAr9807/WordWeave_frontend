import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage, SignupPage } from '@/components/pages/AuthPages';
import HomePage from '@/components/pages/HomePage';
import WritePage from '@/components/pages/WritePage';
import MostViewedPage from '@/components/pages/MostViewedPage';
import ProfilePage from '@/components/pages/ProfilePage';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import Navbar from './components/common/Navbar';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/most-viewed" element={<MostViewedPage />} />
              <Route 
                path="/write" 
                element={
                  <ProtectedRoute>
                    <WritePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              {/* Redirect any unknown routes to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;