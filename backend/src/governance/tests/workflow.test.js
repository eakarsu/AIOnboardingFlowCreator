'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluate } = require('../domain');

const valid = () => ({
  person: { id: 'employee-1', roleProfileVersion: 'role-v2', retentionDays: 365, consent: { version: 'consent-v1', grantedAt: '2026-07-18T00:00:00Z' } },
  goals: [{ id: 'g1', metric: 'completion-rate', baseline: 0, target: 1 }],
  workItems: [{ id: 'w1', goalId: 'g1', ownerId: 'manager-1', contentVersion: 'v3', rightsBasis: 'licensed', accessibilityChecked: true, status: 'active' }],
  assessments: [{ id: 'a1', score: 0.8, rubricVersion: 'r2', evidenceRef: 'lms:item:1' }],
  recommendations: [{ id: 'rec1', reasonCodes: ['role-gap'], sourceRef: 'catalog:course:1', employmentDecision: false }],
  appeals: [{ id: 'appeal-1', ownerId: 'hr-1', status: 'corrected' }],
  outboundTriggers: [{ id: 't1', eventVersion: 'v1', destinationRef: 'hris:tenant', idempotencyKey: 'trigger:2026:0001', delivered: false }],
  validation: { datasetVersion: 'd1', cohortVersion: 'c1', biasDelta: 0.01, maxBiasDelta: 0.05, accessibilityPassRate: 1, progressionViolations: 0, edgeCasesPassed: true, outcomeImprovement: 0.1 },
  approval: { reviewerId: 'hr-2' }
});

test('accepts owned measurable and independently reviewed onboarding flow', () => assert.deepEqual(evaluate(valid()).errors, []));
test('blocks consequential recommendations and delivered side effects', () => { const input = valid(); input.recommendations[0].employmentDecision = true; input.outboundTriggers[0].delivered = true; assert.ok(evaluate(input).errors.length >= 2); });
