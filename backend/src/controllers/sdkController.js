const pool = require('../config/database');

/**
 * GET /api/sdk/flow?siteKey=...
 *
 * Public endpoint — no auth required.
 * Returns the active flow (with steps) for the given site key so the
 * embeddable SDK can render it in the host page.
 */
const getFlowBySiteKey = async (req, res) => {
  const { siteKey } = req.query;

  if (!siteKey) {
    return res.status(400).json({ error: 'siteKey query parameter is required' });
  }

  try {
    // Look up active flow by site_key
    const flowResult = await pool.query(
      `SELECT f.* FROM onboarding_flows f
       WHERE f.site_key = $1 AND f.status = 'active'
       ORDER BY f.created_at DESC
       LIMIT 1`,
      [siteKey]
    );

    if (flowResult.rows.length === 0) {
      return res.status(404).json({ error: 'No active flow found for this site key' });
    }

    const flow = flowResult.rows[0];

    // Fetch steps ordered by step_order
    const stepsResult = await pool.query(
      `SELECT id, title, content, step_type, step_order, element_selector, position,
              action_type, action_config, is_required, delay_seconds
       FROM flow_steps
       WHERE flow_id = $1
       ORDER BY step_order ASC`,
      [flow.id]
    );

    res.json({
      flow: {
        id: flow.id,
        name: flow.name,
        description: flow.description,
        trigger_event: flow.trigger_event
      },
      steps: stepsResult.rows
    });
  } catch (error) {
    console.error('[SDK] getFlowBySiteKey error:', error);
    res.status(500).json({ error: 'Internal server error', requestId: req.requestId });
  }
};

/**
 * POST /api/sdk/events
 *
 * Public endpoint — no auth required.
 * Called by the embedded SDK when a user completes a step.
 * Body: { siteKey, eventType, userId, stepId, flowId, properties }
 */
const recordSdkEvent = async (req, res) => {
  const { siteKey, eventType, userId, stepId, flowId, properties } = req.body;

  if (!siteKey || !eventType) {
    return res.status(400).json({ error: 'siteKey and eventType are required' });
  }

  try {
    // Verify siteKey is valid
    const flowCheck = await pool.query(
      `SELECT id FROM onboarding_flows WHERE site_key = $1 LIMIT 1`,
      [siteKey]
    );

    if (flowCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Invalid site key' });
    }

    // Insert event
    const eventResult = await pool.query(
      `INSERT INTO events (site_key, event_type, user_id, flow_id, step_id, properties)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        siteKey,
        eventType,
        userId || null,
        flowId || flowCheck.rows[0].id,
        stepId || null,
        properties ? JSON.stringify(properties) : '{}'
      ]
    );

    // If this is a step_complete event, upsert progress_tracking
    if (eventType === 'step_complete' && stepId && flowId && userId) {
      const stepResult = await pool.query(
        'SELECT step_order FROM flow_steps WHERE id = $1',
        [stepId]
      );
      const totalResult = await pool.query(
        'SELECT total_steps FROM onboarding_flows WHERE id = $1',
        [flowId]
      );

      if (stepResult.rows.length > 0 && totalResult.rows.length > 0) {
        const stepOrder = stepResult.rows[0].step_order;
        const totalSteps = totalResult.rows[0].total_steps || 1;
        const pct = Math.min(100, (stepOrder / totalSteps) * 100);

        await pool.query(
          `INSERT INTO progress_tracking (user_id, flow_id, current_step, total_steps, percentage_complete, last_activity)
           VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
           ON CONFLICT (user_id, flow_id)
           DO UPDATE SET current_step = EXCLUDED.current_step,
                         percentage_complete = EXCLUDED.percentage_complete,
                         last_activity = CURRENT_TIMESTAMP,
                         completed_at = CASE WHEN EXCLUDED.percentage_complete >= 100 THEN CURRENT_TIMESTAMP ELSE NULL END`,
          [userId, flowId, stepOrder, totalSteps, pct]
        );
      }
    }

    res.status(201).json({ ok: true, eventId: eventResult.rows[0].id });
  } catch (error) {
    console.error('[SDK] recordSdkEvent error:', error);
    res.status(500).json({ error: 'Internal server error', requestId: req.requestId });
  }
};

module.exports = { getFlowBySiteKey, recordSdkEvent };
