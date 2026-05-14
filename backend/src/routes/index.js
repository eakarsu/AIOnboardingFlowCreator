const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validatePasswordStrength } = require('../middleware/validation');
const { agencyContext } = require('../middleware/agencyContext');
const {
  login, register, getProfile, updateProfile,
  changePassword, forgotPassword, resetPassword, verifyEmail, logout
} = require('../controllers/authController');
const {
  flowsController, stepsController, segmentsController, templatesController,
  aiContentController, analyticsController, integrationsController, tooltipsController,
  checklistsController, progressController, abTestsController, triggersController,
  personalizationController, notificationsController, ptoRequestsController,
  mentorMatchesController, feedbackController, trainingRecommendationsController,
  aiChecklistsController, aiProgressController, getDashboardStats,
  calculateABWinner, fireTrigger
} = require('../controllers/apiController');
const { createExportController } = require('../controllers/exportController');
const aiController = require('../controllers/aiController');
const aiBacklogController = require('../controllers/aiBacklogController');
const { getFlowBySiteKey, recordSdkEvent } = require('../controllers/sdkController');
const { ingestEvent } = require('../controllers/eventsController');
const { getFunnelAnalytics } = require('../controllers/funnelController');

// Auth routes (public)
router.post('/auth/login', login);
router.post('/auth/register', validatePasswordStrength, register);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', validatePasswordStrength, resetPassword);
router.post('/auth/verify-email', verifyEmail);

// Auth routes (authenticated)
router.get('/auth/profile', authenticateToken, getProfile);
router.put('/auth/profile', authenticateToken, updateProfile);
router.put('/auth/change-password', authenticateToken, validatePasswordStrength, changePassword);
router.post('/auth/logout', authenticateToken, logout);

// Dashboard
router.get('/dashboard/stats', authenticateToken, getDashboardStats);

// Helper to register CRUD + export + bulk routes for a resource
// Pass agencyScoped=true for the 3 key resources (flows, steps, analytics) that enforce
// per-agency data isolation via agencyContext middleware.
const registerResourceRoutes = (path, controller, tableName, agencyScoped = false) => {
  const exportCtrl = createExportController(tableName);
  const scopeMiddleware = agencyScoped ? [authenticateToken, agencyContext] : [authenticateToken];

  // Export routes MUST come before /:id
  router.get(`/${path}/export/csv`, authenticateToken, exportCtrl.exportCSV);
  router.get(`/${path}/export/pdf`, authenticateToken, exportCtrl.exportPDF);

  // Bulk operations (admin/manager only)
  router.post(`/${path}/bulk-delete`, authenticateToken, authorize('admin', 'manager'), controller.bulkDelete);
  router.put(`/${path}/bulk`, authenticateToken, authorize('admin', 'manager'), controller.bulkUpdate);

  // Standard CRUD (agency-scoped routes include the agencyContext middleware)
  router.get(`/${path}`, ...scopeMiddleware, controller.getAll);
  router.get(`/${path}/:id`, ...scopeMiddleware, controller.getById);
  if (controller.create) router.post(`/${path}`, ...scopeMiddleware, controller.create);
  if (controller.update) router.put(`/${path}/:id`, ...scopeMiddleware, controller.update);
  router.delete(`/${path}/:id`, authenticateToken, authorize('admin', 'manager'), controller.delete);
};

// Register all resource routes
// The 3 most important query resources are agency-scoped for multi-tenant isolation.
registerResourceRoutes('flows', flowsController, 'onboarding_flows', true);
registerResourceRoutes('steps', stepsController, 'flow_steps', true);
registerResourceRoutes('segments', segmentsController, 'user_segments');
registerResourceRoutes('templates', templatesController, 'templates');
registerResourceRoutes('ai-content', aiContentController, 'ai_content');
registerResourceRoutes('analytics', analyticsController, 'analytics', true);
registerResourceRoutes('integrations', integrationsController, 'integrations');
registerResourceRoutes('tooltips', tooltipsController, 'tooltips');
registerResourceRoutes('checklists', checklistsController, 'checklists');
registerResourceRoutes('progress', progressController, 'progress_tracking');
registerResourceRoutes('ab-tests', abTestsController, 'ab_tests');
registerResourceRoutes('triggers', triggersController, 'triggers');
registerResourceRoutes('personalization', personalizationController, 'personalization_rules');
registerResourceRoutes('notifications', notificationsController, 'notifications');
registerResourceRoutes('pto-requests', ptoRequestsController, 'pto_requests');
registerResourceRoutes('mentor-matches', mentorMatchesController, 'mentor_matches');
registerResourceRoutes('feedback', feedbackController, 'feedback');
registerResourceRoutes('training-recommendations', trainingRecommendationsController, 'training_recommendations');
registerResourceRoutes('ai-checklists', aiChecklistsController, 'ai_checklists');
registerResourceRoutes('ai-progress', aiProgressController, 'ai_progress');

// Additional custom routes (agency-scoped for the key resource relationships)
router.get('/flows/:flowId/steps', authenticateToken, agencyContext, stepsController.getByFlowId);
router.get('/flows/:flowId/analytics', authenticateToken, agencyContext, analyticsController.getByFlowId);
router.get('/users/:userId/progress', authenticateToken, progressController.getByUserId);

// AI Generation Routes (OpenRouter)
router.post('/ai/generate/welcome', authenticateToken, aiController.generateWelcomeMessage);
router.post('/ai/generate/steps', authenticateToken, aiController.generateFlowSteps);
router.post('/ai/generate/tooltip', authenticateToken, aiController.generateTooltipContent);
router.post('/ai/generate/checklist', authenticateToken, aiController.generateChecklistItems);
router.post('/ai/generate/notification', authenticateToken, aiController.generateNotificationCopy);
router.post('/ai/generate/email-sequence', authenticateToken, aiController.generateEmailSequence);
router.post('/ai/improve', authenticateToken, aiController.improveContent);
router.post('/ai/generate/ab-variant', authenticateToken, aiController.generateABVariants);
router.get('/ai/analyze/flow/:flowId', authenticateToken, aiController.analyzeFlow);

// New AI Feature Generation Routes
router.post('/ai/analyze/pto', authenticateToken, aiController.analyzePTORequest);
router.post('/ai/find-mentor', authenticateToken, aiController.findMentorMatch);
router.post('/ai/analyze/feedback', authenticateToken, aiController.analyzeFeedback);
router.post('/ai/generate/training-plan', authenticateToken, aiController.generateTrainingPlan);
router.post('/ai/generate/ai-checklist', authenticateToken, aiController.generateAIChecklist);
router.post('/ai/analyze/progress', authenticateToken, aiController.analyzeProgress);

// Apply pass 5 backlog (additive, 503 + missing OPENROUTER_API_KEY when key absent)
router.post('/ai/predict-progress', authenticateToken, aiBacklogController.predictProgress);
router.post('/ai/compliance-audit', authenticateToken, aiBacklogController.complianceAudit);

// ─── A/B Test winner calculation ─────────────────────────────────────────────
router.post('/ab-tests/:id/calculate-winner', authenticateToken, calculateABWinner);

// ─── Trigger fire ─────────────────────────────────────────────────────────────
router.post('/triggers/:id/fire', authenticateToken, fireTrigger);

// ─── SDK Routes (public — no auth) ────────────────────────────────────────────
// These endpoints are called from the embeddable flow-sdk.js script.
router.get('/sdk/flow', getFlowBySiteKey);
router.post('/sdk/events', recordSdkEvent);

// ─── Event Ingestion (public — no auth) ───────────────────────────────────────
// Receives arbitrary events from any integrated site; validates site key then
// evaluates trigger conditions.
router.post('/events/ingest', ingestEvent);

// ─── Funnel Analytics (authenticated) ─────────────────────────────────────────
router.get('/analytics/funnel/:flowId', authenticateToken, agencyContext, getFunnelAnalytics);

module.exports = router;
