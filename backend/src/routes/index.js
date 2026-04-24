const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validatePasswordStrength } = require('../middleware/validation');
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
  aiChecklistsController, aiProgressController, getDashboardStats
} = require('../controllers/apiController');
const { createExportController } = require('../controllers/exportController');
const aiController = require('../controllers/aiController');

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
const registerResourceRoutes = (path, controller, tableName) => {
  const exportCtrl = createExportController(tableName);

  // Export routes MUST come before /:id
  router.get(`/${path}/export/csv`, authenticateToken, exportCtrl.exportCSV);
  router.get(`/${path}/export/pdf`, authenticateToken, exportCtrl.exportPDF);

  // Bulk operations (admin/manager only)
  router.post(`/${path}/bulk-delete`, authenticateToken, authorize('admin', 'manager'), controller.bulkDelete);
  router.put(`/${path}/bulk`, authenticateToken, authorize('admin', 'manager'), controller.bulkUpdate);

  // Standard CRUD
  router.get(`/${path}`, authenticateToken, controller.getAll);
  router.get(`/${path}/:id`, authenticateToken, controller.getById);
  if (controller.create) router.post(`/${path}`, authenticateToken, controller.create);
  if (controller.update) router.put(`/${path}/:id`, authenticateToken, controller.update);
  router.delete(`/${path}/:id`, authenticateToken, authorize('admin', 'manager'), controller.delete);
};

// Register all resource routes
registerResourceRoutes('flows', flowsController, 'onboarding_flows');
registerResourceRoutes('steps', stepsController, 'flow_steps');
registerResourceRoutes('segments', segmentsController, 'user_segments');
registerResourceRoutes('templates', templatesController, 'templates');
registerResourceRoutes('ai-content', aiContentController, 'ai_content');
registerResourceRoutes('analytics', analyticsController, 'analytics');
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

// Additional custom routes
router.get('/flows/:flowId/steps', authenticateToken, stepsController.getByFlowId);
router.get('/flows/:flowId/analytics', authenticateToken, analyticsController.getByFlowId);
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

module.exports = router;
