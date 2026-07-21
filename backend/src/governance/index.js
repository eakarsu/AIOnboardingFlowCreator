'use strict';
const { createRouter } = require('./router');
const { postgres } = require('./store');
const { evaluate } = require('./domain');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

module.exports = createRouter({
  db: postgres(pool),
  auth: authenticateToken,
  evaluate,
  workflow: 'onboarding-flow',
  providers: ['lms','hris','ats','calendar','content-catalog','communications','webhook'],
  approverRoles: ['manager','hr_reviewer','learning_admin','privacy_officer','admin']
});
