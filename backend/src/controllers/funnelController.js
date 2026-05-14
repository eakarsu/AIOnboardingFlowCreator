const pool = require('../config/database');

/**
 * GET /api/analytics/funnel/:flowId
 *
 * Authenticated endpoint.
 * Aggregates progress_tracking to produce a step-by-step funnel report:
 *   - total starts
 *   - per-step: users who reached it, completion rate, drop-off %
 *   - avg time to complete the entire flow (for users who finished)
 */
const getFunnelAnalytics = async (req, res) => {
  const { flowId } = req.params;

  if (!flowId || isNaN(Number(flowId))) {
    return res.status(400).json({ error: 'Valid flowId is required' });
  }

  try {
    // Verify the flow exists (and belongs to the agency if multi-tenant)
    const flowQuery = req.agencyId
      ? `SELECT id, name, total_steps FROM onboarding_flows WHERE id = $1 AND agency_id = $2`
      : `SELECT id, name, total_steps FROM onboarding_flows WHERE id = $1`;
    const flowParams = req.agencyId ? [flowId, req.agencyId] : [flowId];
    const flowResult = await pool.query(flowQuery, flowParams);

    if (flowResult.rows.length === 0) {
      return res.status(404).json({ error: 'Flow not found' });
    }

    const flow = flowResult.rows[0];

    // Total unique users who started this flow
    const startsResult = await pool.query(
      `SELECT COUNT(DISTINCT user_id)::int AS total_starts
       FROM progress_tracking
       WHERE flow_id = $1`,
      [flowId]
    );
    const totalStarts = startsResult.rows[0].total_starts;

    // Fetch steps in order
    const stepsResult = await pool.query(
      `SELECT id, title, step_order FROM flow_steps WHERE flow_id = $1 ORDER BY step_order`,
      [flowId]
    );
    const steps = stepsResult.rows;

    // Per-step aggregation: how many users have current_step >= this step_order
    const stepFunnel = await Promise.all(
      steps.map(async (step) => {
        const reachedResult = await pool.query(
          `SELECT COUNT(DISTINCT user_id)::int AS reached
           FROM progress_tracking
           WHERE flow_id = $1 AND current_step >= $2`,
          [flowId, step.step_order]
        );
        const reached = reachedResult.rows[0].reached;
        const reachRate = totalStarts > 0 ? ((reached / totalStarts) * 100).toFixed(1) : '0.0';

        return {
          stepId: step.id,
          stepOrder: step.step_order,
          title: step.title,
          usersReached: reached,
          reachRate: parseFloat(reachRate)
        };
      })
    );

    // Calculate drop-off between consecutive steps
    const funnelWithDropoff = stepFunnel.map((step, idx) => {
      const prev = idx === 0 ? totalStarts : stepFunnel[idx - 1].usersReached;
      const dropOff = prev > 0 ? (((prev - step.usersReached) / prev) * 100).toFixed(1) : '0.0';
      return { ...step, dropOffPct: parseFloat(dropOff) };
    });

    // Average time to complete (users with completed_at set)
    const avgTimeResult = await pool.query(
      `SELECT AVG(EXTRACT(EPOCH FROM (completed_at - started_at)) / 60.0) AS avg_minutes
       FROM progress_tracking
       WHERE flow_id = $1 AND completed_at IS NOT NULL`,
      [flowId]
    );
    const avgMinutes = avgTimeResult.rows[0].avg_minutes
      ? parseFloat(avgTimeResult.rows[0].avg_minutes).toFixed(1)
      : null;

    // Completion count and rate
    const completionsResult = await pool.query(
      `SELECT COUNT(DISTINCT user_id)::int AS completions
       FROM progress_tracking
       WHERE flow_id = $1 AND completed_at IS NOT NULL`,
      [flowId]
    );
    const completions = completionsResult.rows[0].completions;
    const completionRate = totalStarts > 0
      ? parseFloat(((completions / totalStarts) * 100).toFixed(1))
      : 0;

    // Worst drop-off step
    let worstStep = null;
    if (funnelWithDropoff.length > 0) {
      worstStep = funnelWithDropoff.reduce((worst, s) =>
        s.dropOffPct > (worst ? worst.dropOffPct : -1) ? s : worst, null
      );
    }

    res.json({
      flowId: Number(flowId),
      flowName: flow.name,
      totalStarts,
      completions,
      completionRate,
      avgCompletionMinutes: avgMinutes ? parseFloat(avgMinutes) : null,
      steps: funnelWithDropoff,
      worstDropOffStep: worstStep
        ? { stepId: worstStep.stepId, title: worstStep.title, dropOffPct: worstStep.dropOffPct }
        : null
    });
  } catch (error) {
    console.error('[Funnel] getFunnelAnalytics error:', error);
    res.status(500).json({ error: 'Internal server error', requestId: req.requestId });
  }
};

module.exports = { getFunnelAnalytics };
