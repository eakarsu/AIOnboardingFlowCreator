import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Flows from './pages/Flows';
import FlowDetail from './pages/FlowDetail';
import Segments from './pages/Segments';
import Templates from './pages/Templates';
import AIContent from './pages/AIContent';
import Analytics from './pages/Analytics';
import Integrations from './pages/Integrations';
import Tooltips from './pages/Tooltips';
import Checklists from './pages/Checklists';
import Progress from './pages/Progress';
import ABTests from './pages/ABTests';
import Triggers from './pages/Triggers';
import Personalization from './pages/Personalization';
import Notifications from './pages/Notifications';
import AIChecklists from './pages/AIChecklists';
import PTOScheduler from './pages/PTOScheduler';
import MentorMatcher from './pages/MentorMatcher';
import AIProgressTracker from './pages/AIProgressTracker';
import FeedbackCollector from './pages/FeedbackCollector';
import TrainingRecommender from './pages/TrainingRecommender';
import Profile from './pages/Profile';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid #e2e8f0',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#64748b' }}>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <ErrorBoundary>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <PrivateRoute>
                    <Layout>
                      <ErrorBoundary>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/flows" element={<Flows />} />
                          <Route path="/flows/:id" element={<FlowDetail />} />
                          <Route path="/segments" element={<Segments />} />
                          <Route path="/templates" element={<Templates />} />
                          <Route path="/ai-content" element={<AIContent />} />
                          <Route path="/analytics" element={<Analytics />} />
                          <Route path="/integrations" element={<Integrations />} />
                          <Route path="/tooltips" element={<Tooltips />} />
                          <Route path="/checklists" element={<Checklists />} />
                          <Route path="/progress" element={<Progress />} />
                          <Route path="/ab-tests" element={<ABTests />} />
                          <Route path="/triggers" element={<Triggers />} />
                          <Route path="/personalization" element={<Personalization />} />
                          <Route path="/notifications" element={<Notifications />} />
                          <Route path="/ai-checklists" element={<AIChecklists />} />
                          <Route path="/pto-scheduler" element={<PTOScheduler />} />
                          <Route path="/mentor-matcher" element={<MentorMatcher />} />
                          <Route path="/ai-progress" element={<AIProgressTracker />} />
                          <Route path="/feedback-collector" element={<FeedbackCollector />} />
                          <Route path="/training-recommender" element={<TrainingRecommender />} />
                          <Route path="/profile" element={<Profile />} />
                        </Routes>
                      </ErrorBoundary>
                    </Layout>
                  </PrivateRoute>
                }
              />
            </Routes>
          </Router>
        </ErrorBoundary>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
