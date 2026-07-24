const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const routes = require('./routes');
const { requestIdMiddleware } = require('./middleware/requestId');
const pool = require('./config/database');
const { createTables } = require('./config/schema');

const app = express();
const PORT = process.env.PORT || 3001;
if ((process.env.JWT_SECRET || '').length < 32 || !process.env.GOVERNANCE_TENANT_ID) {
  throw new Error('JWT_SECRET (32+ characters) and GOVERNANCE_TENANT_ID are required');
}

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
app.use('/api/manager-readiness', require('./routes/managerReadiness'));

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

app.use('/api/governed-onboarding-flows', require('./governance'));

if (process.env.ENABLE_GENERATED_ROUTES === 'true' && process.env.NODE_ENV !== 'production') {
  app.use('/api/cf-ai-flow-generator-from-jd', require('./routes/customFeat01_AiFlowGeneratorFromJd'));
  app.use('/api/cf-real-time-feedback-loop', require('./routes/customFeat02_RealTimeFeedbackLoop'));
  app.use('/api/cf-adaptive-pacing', require('./routes/customFeat03_AdaptivePacing'));
  app.use('/api/cf-department-specific-content-recommendation', require('./routes/customFeat04_DepartmentSpecificContentRecommendation'));
  app.use('/api/cf-onboarding-compliance-auditing', require('./routes/customFeat05_OnboardingComplianceAuditing'));
}

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


async function initializeRuntime() {
  if (process.env.MIGRATE_ON_START !== 'true') return;
  const email = process.env.PROVISION_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
  const password = process.env.PROVISION_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error('Runtime admin credentials are required');
  await createTables();
  const passwordHash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users(email,password,name,role,email_verified)
     VALUES($1,$2,$3,'admin',TRUE)
     ON CONFLICT(email) DO UPDATE SET password=EXCLUDED.password,name=EXCLUDED.name,role='admin',email_verified=TRUE,updated_at=CURRENT_TIMESTAMP`,
    [email, passwordHash, process.env.PROVISION_ADMIN_NAME || 'Runtime Administrator']
  );
}
initializeRuntime()
  .then(() => app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
  }))
  .catch((error) => { console.error('Runtime initialization failed:', error.message); process.exit(1); });

module.exports = app;
