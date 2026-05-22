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
import FunnelAnalytics from './pages/FunnelAnalytics';
import SDKDocs from './pages/SDKDocs';
import ComplianceAudit from './pages/ComplianceAudit';
import ManagerReadiness from './pages/ManagerReadiness';
import CustomViewsPage from './pages/CustomViewsPage';

// // === Batch 06 Gaps & Frontend Mounts ===
import CFAiFlowGeneratorFromJdPage from './pages/CFAiFlowGeneratorFromJdPage';
import CFRealTimeFeedbackLoopPage from './pages/CFRealTimeFeedbackLoopPage';
import CFAdaptivePacingPage from './pages/CFAdaptivePacingPage';
import CFDepartmentSpecificContentRecommendationPage from './pages/CFDepartmentSpecificContentRecommendationPage';
import CFOnboardingComplianceAuditingPage from './pages/CFOnboardingComplianceAuditingPage';
import GapNoCohortPage from './pages/GapNoCohortPage';
import GapNoSentimentPage from './pages/GapNoSentimentPage';
import GapNoAutoPage from './pages/GapNoAutoPage';
import GapNoRolePage from './pages/GapNoRolePage';
import GapBackendLogicConcentratedInSingleIndexJsPage from './pages/GapBackendLogicConcentratedInSingleIndexJsPage';
import GapMissingDedicatedChecklistRoutesOnlyAiGeneratPage from './pages/GapMissingDedicatedChecklistRoutesOnlyAiGeneratPage';
import GapNoHrSystemIntegrationsWorkdayBamboohrPage from './pages/GapNoHrSystemIntegrationsWorkdayBamboohrPage';
import GapNoWebhooksForOutboundTriggersToCustomerSystPage from './pages/GapNoWebhooksForOutboundTriggersToCustomerSystPage';
import GapLimitedReportingExportPdfCsvPage from './pages/GapLimitedReportingExportPdfCsvPage';
import GapNoRbacGranularityBeyondAdminManagerPage from './pages/GapNoRbacGranularityBeyondAdminManagerPage';
import GapNoFileUploadForOnboardingDocumentsVideosPage from './pages/GapNoFileUploadForOnboardingDocumentsVideosPage';
import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

import TimelineView from './pages/TimelineView';

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
        <Route path="/insights/timeline" element={<TimelineView />} />
        <Route path="/codex/custom-viz" element={<CodexCustomVizFeature />} />
        <Route path="/codex/operations" element={<CodexOperationsFeature />} />

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
                          <Route path="/funnel-analytics" element={<FunnelAnalytics />} />
                          <Route path="/sdk-docs" element={<SDKDocs />} />
                          <Route path="/compliance-audit" element={<ComplianceAudit />} />
                          <Route path="/manager-readiness" element={<ManagerReadiness />} />
                          <Route path="/custom-views" element={<CustomViewsPage />} />
                        
          {/* // === Batch 06 Gaps & Frontend Mounts === */}
          <Route path="/cf-ai-flow-generator-from-jd" element={<CFAiFlowGeneratorFromJdPage />} />
          <Route path="/cf-real-time-feedback-loop" element={<CFRealTimeFeedbackLoopPage />} />
          <Route path="/cf-adaptive-pacing" element={<CFAdaptivePacingPage />} />
          <Route path="/cf-department-specific-content-recommendation" element={<CFDepartmentSpecificContentRecommendationPage />} />
          <Route path="/cf-onboarding-compliance-auditing" element={<CFOnboardingComplianceAuditingPage />} />
          <Route path="/gap-no-cohort" element={<GapNoCohortPage />} />
          <Route path="/gap-no-sentiment" element={<GapNoSentimentPage />} />
          <Route path="/gap-no-auto" element={<GapNoAutoPage />} />
          <Route path="/gap-no-role" element={<GapNoRolePage />} />
          <Route path="/gap-backend-logic-concentrated-in-single-index-js" element={<GapBackendLogicConcentratedInSingleIndexJsPage />} />
          <Route path="/gap-missing-dedicated-checklist-routes-only-ai-generat" element={<GapMissingDedicatedChecklistRoutesOnlyAiGeneratPage />} />
          <Route path="/gap-no-hr-system-integrations-workday-bamboohr" element={<GapNoHrSystemIntegrationsWorkdayBamboohrPage />} />
          <Route path="/gap-no-webhooks-for-outbound-triggers-to-customer-syst" element={<GapNoWebhooksForOutboundTriggersToCustomerSystPage />} />
          <Route path="/gap-limited-reporting-export-pdf-csv" element={<GapLimitedReportingExportPdfCsvPage />} />
          <Route path="/gap-no-rbac-granularity-beyond-admin-manager" element={<GapNoRbacGranularityBeyondAdminManagerPage />} />
          <Route path="/gap-no-file-upload-for-onboarding-documents-videos" element={<GapNoFileUploadForOnboardingDocumentsVideosPage />} />
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
