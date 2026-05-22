const router = require('express').Router();

router.post('/score', (req, res) => {
  const { checklistCompletePct = 0, managerTouchpoints = 0, firstWeekMeetings = 0, openQuestions = 0, roleClarity = 3 } = req.body || {};
  const score = Math.max(0, Math.min(100, Math.round(
    Number(checklistCompletePct) * 0.45 +
    Math.min(5, Number(managerTouchpoints)) * 8 +
    Math.min(4, Number(firstWeekMeetings)) * 6 +
    Number(roleClarity) * 7 -
    Number(openQuestions) * 5
  )));
  res.json({
    feature: 'manager_readiness',
    score,
    level: score >= 75 ? 'ready' : score >= 45 ? 'needs-follow-up' : 'at-risk',
    actions: [
      score < 75 && 'Schedule a manager-new-hire expectation review.',
      Number(openQuestions) > 2 && 'Convert open questions into assigned checklist tasks.',
      Number(firstWeekMeetings) < 2 && 'Add first-week 1:1, team intro, and role success meeting.',
    ].filter(Boolean),
  });
});

module.exports = router;
