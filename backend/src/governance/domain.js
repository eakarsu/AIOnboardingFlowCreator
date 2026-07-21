'use strict';
function evaluate(input = {}) {
  const errors = [], person = input.person || {}, goals = input.goals || [], items = input.workItems || [];
  if (!person.id || !person.roleProfileVersion || !person.consent?.version || !person.consent?.grantedAt ||
      person.consent?.revokedAt || !(person.retentionDays > 0 && person.retentionDays <= 2555)) {
    errors.push('role profile, active versioned consent, and bounded retention required');
  }
  const goalIds = new Set(goals.map((goal) => String(goal.id)));
  for (const goal of goals) if (!goal.id || !goal.metric || !Number.isFinite(Number(goal.baseline)) ||
      !Number.isFinite(Number(goal.target))) errors.push(`goal ${goal.id || '?'} is not measurable`);
  for (const item of items) if (!item.id || !goalIds.has(String(item.goalId)) || !item.ownerId ||
      !item.contentVersion || !item.rightsBasis || item.accessibilityChecked !== true ||
      !['not_started','active','completed','blocked'].includes(item.status)) {
    errors.push(`work item ${item.id || '?'} lacks goal, owner, rights/version, accessibility, or progress`);
  }
  for (const assessment of input.assessments || []) if (!assessment.id || !(assessment.score >= 0 && assessment.score <= 1) ||
      !assessment.rubricVersion || !assessment.evidenceRef) errors.push(`assessment ${assessment.id || '?'} invalid`);
  for (const recommendation of input.recommendations || []) if (!recommendation.id ||
      !Array.isArray(recommendation.reasonCodes) || !recommendation.reasonCodes.length ||
      !recommendation.sourceRef || recommendation.employmentDecision === true) errors.push('unexplained or consequential recommendation');
  for (const appeal of input.appeals || []) if (!appeal.id || !appeal.ownerId ||
      !['open','corrected','upheld'].includes(appeal.status)) errors.push('appeal/correction path invalid');
  for (const trigger of input.outboundTriggers || []) if (!trigger.id || !trigger.eventVersion ||
      !trigger.destinationRef || !trigger.idempotencyKey || trigger.delivered === true) errors.push('outbound trigger must remain versioned and queued');
  const validation = input.validation || {};
  if (!validation.datasetVersion || !validation.cohortVersion ||
      !(validation.biasDelta >= 0 && validation.biasDelta <= validation.maxBiasDelta) ||
      validation.accessibilityPassRate !== 1 || validation.progressionViolations !== 0 ||
      validation.edgeCasesPassed !== true || !Number.isFinite(Number(validation.outcomeImprovement))) {
    errors.push('versioned validity, bias, accessibility, progression, edge, and outcome evaluation required');
  }
  if (!input.approval?.reviewerId || input.approval.reviewerId === person.id) errors.push('independent human oversight required');
  return { errors, result: { goalCount: goals.length, completed: items.filter((item) => item.status === 'completed').length,
    openAppeals: (input.appeals || []).filter((item) => item.status === 'open').length,
    queuedTriggers: (input.outboundTriggers || []).length, validation,
    decision: errors.length ? 'revise' : 'reviewable' },
    assumptions: ['onboarding outcomes do not establish employment suitability'],
    uncertainty: { representativeCohortsRequireOwnerReview: true, hrisNotConnected: true } };
}
module.exports = { evaluate };
