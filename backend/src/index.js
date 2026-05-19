const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const routes = require('./routes');
const { requestIdMiddleware } = require('./middleware/requestId');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many auth attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

// Attach unique requestId to every request (before routes)
app.use(requestIdMiddleware);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api', generalLimiter);

// Request logging (include requestId for correlation)
app.use((req, res, next) => {
  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    userId: req.user?.id || null
  }));
  next();
});

// API Routes
app.use('/api', routes);

// === Custom Views (mounted BEFORE 404 handler) ===
app.use('/api/custom-views', require('./routes/customViews'));

// Serve the embeddable SDK and other static assets.
// flow-sdk.js is served with a permissive CORS header so any host page can load it.
app.use('/flow-sdk.js', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static(path.join(__dirname, '../public')));

app.use('/public', express.static(path.join(__dirname, '../public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Structured error handler — never leaks stack traces to clients
app.use((err, req, res, next) => {
  const requestId = req.requestId || 'unknown';
  const logEntry = {
    requestId,
    ts: new Date().toISOString(),
    method: req.method,
    path: req.path,
    userId: req.user?.id || null,
    errorMessage: err.message,
    errorStack: err.stack
  };

  // Log full detail server-side
  console.error(JSON.stringify(logEntry));

  // Return safe, correlation-friendly response to client
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: status < 500 ? err.message : 'Internal server error',
    requestId
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});


// === Custom Feature Mounts (batch_06) ===
app.use('/api/cf-ai-flow-generator-from-jd', require('./routes/customFeat01_AiFlowGeneratorFromJd'));
app.use('/api/cf-real-time-feedback-loop', require('./routes/customFeat02_RealTimeFeedbackLoop'));
app.use('/api/cf-adaptive-pacing', require('./routes/customFeat03_AdaptivePacing'));
app.use('/api/cf-department-specific-content-recommendation', require('./routes/customFeat04_DepartmentSpecificContentRecommendation'));
app.use('/api/cf-onboarding-compliance-auditing', require('./routes/customFeat05_OnboardingComplianceAuditing'));


// === Batch 06 Gaps & Frontend Mounts ===
app.use('/api/gap-no-cohort', require('./routes/gapFeat_no_cohort'));
app.use('/api/gap-no-sentiment', require('./routes/gapFeat_no_sentiment'));
app.use('/api/gap-no-auto', require('./routes/gapFeat_no_auto'));
app.use('/api/gap-no-role', require('./routes/gapFeat_no_role'));
app.use('/api/gap-backend-logic-concentrated-in-single-index-js', require('./routes/gapFeat_backend_logic_concentrated_in_single_index_js'));
app.use('/api/gap-missing-dedicated-checklist-routes-only-ai-generat', require('./routes/gapFeat_missing_dedicated_checklist_routes_only_ai_generat'));
app.use('/api/gap-no-hr-system-integrations-workday-bamboohr', require('./routes/gapFeat_no_hr_system_integrations_workday_bamboohr'));
app.use('/api/gap-no-webhooks-for-outbound-triggers-to-customer-syst', require('./routes/gapFeat_no_webhooks_for_outbound_triggers_to_customer_syst'));
app.use('/api/gap-limited-reporting-export-pdf-csv', require('./routes/gapFeat_limited_reporting_export_pdf_csv'));
app.use('/api/gap-no-rbac-granularity-beyond-admin-manager', require('./routes/gapFeat_no_rbac_granularity_beyond_admin_manager'));
app.use('/api/gap-no-file-upload-for-onboarding-documents-videos', require('./routes/gapFeat_no_file_upload_for_onboarding_documents_videos'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

module.exports = app;
