import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage, SignupPage } from '@/components/pages/AuthPages';
import HomePage from '@/components/pages/HomePage';
import WritePage from '@/components/pages/WritePage';
import ProfilePage from '@/components/pages/ProfilePage';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import BlogDetailPage from './components/pages/BlogDetailPage';
import TopBlogsPage from './components/pages/TopBlogsPage';
import UserProfilePage from './components/pages/userProfilePage';
import EditPage from './components/pages/EditPage';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/blog/:post_id" element={<BlogDetailPage />} />
              <Route path="/user/:user_id" element={<UserProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/top-blogs" element={<TopBlogsPage />} />
              <Route 
                path="/write" 
                element={
                  <ProtectedRoute>
                    <WritePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/edit/:blog_id" 
                element={
                  <ProtectedRoute>
                    <EditPage />
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