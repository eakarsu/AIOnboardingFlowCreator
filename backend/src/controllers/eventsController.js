const pool = require('../config/database');

/**
 * POST /api/events/ingest
 *
 * Public endpoint — no auth required.
 * Accepts: { siteKey, eventType, userId, properties }
 *
 * 1. Validates siteKey against onboarding_flows.site_key
 * 2. Stores the event in the events table
 * 3. Evaluates active trigger conditions — if a trigger matches, increments fire_count
 */
const ingestEvent = async (req, res) => {
  const { siteKey, eventType, userId, properties } = req.body;

  if (!siteKey) {
    return res.status(400).json({ error: 'siteKey is required' });
  }
  if (!eventType) {
    return res.status(400).json({ error: 'eventType is required' });
  }

  try {
    // Validate siteKey
    const flowResult = await pool.query(
      `SELECT id, agency_id FROM onboarding_flows WHERE site_key = $1 LIMIT 1`,
      [siteKey]
    );

    if (flowResult.rows.length === 0) {
      return res.status(403).json({ error: 'Unknown site key' });
    }

    const { id: flowId, agency_id: agencyId } = flowResult.rows[0];
    const props = properties || {};

    // Persist the event
    const eventInsert = await pool.query(
      `INSERT INTO events (site_key, agency_id, event_type, user_id, flow_id, properties)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [siteKey, agencyId, eventType, userId || null, flowId, JSON.stringify(props)]
    );
    const eventId = eventInsert.rows[0].id;

    // Evaluate triggers
    const triggersResult = await pool.query(
      `SELECT id, conditions FROM triggers
       WHERE flow_id = $1 AND is_active = true AND event_type = $2`,
      [flowId, eventType]
    );

    const firedTriggerIds = [];

    for (const trigger of triggersResult.rows) {
      const conditions = trigger.conditions || {};

      if (evaluateConditions(conditions, { eventType, userId, properties: props })) {
        // Fire the trigger
        await pool.query(
          `UPDATE triggers
           SET fire_count = fire_count + 1,
               last_fired = CURRENT_TIMESTAMP,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [trigger.id]
        );
        firedTriggerIds.push(trigger.id);
      }
    }

    // Tag the event with which triggers fired
    if (firedTriggerIds.length > 0) {
      await pool.query(
        `UPDATE events SET triggered_trigger_ids = $1 WHERE id = $2`,
        [firedTriggerIds, eventId]
      );
    }

    res.status(201).json({
      ok: true,
      eventId,
      triggersEvaluated: triggersResult.rows.length,
      triggersFired: firedTriggerIds.length,
      firedTriggerIds
    });
  } catch (error) {
    console.error('[Events] ingestEvent error:', error);
    res.status(500).json({ error: 'Internal server error', requestId: req.requestId });
  }
};

/**
 * Evaluates a conditions JSONB object against the incoming event.
 *
 * Supported condition shapes:
 *   { "property.key": "expectedValue" }       — equality
 *   { "property.key": { "$gte": number } }    — greater-or-equal
 *   { "property.key": { "$lte": number } }    — less-or-equal
 *   { "property.key": { "$contains": str } }  — string includes
 *
 * An empty conditions object means "always fire".
 */
function evaluateConditions(conditions, context) {
  const entries = Object.entries(conditions);
  if (entries.length === 0) return true;

  for (const [path, expected] of entries) {
    const actual = resolvePath(path, context);

    if (expected !== null && typeof expected === 'object') {
      if ('$gte' in expected && !(Number(actual) >= Number(expected.$gte))) return false;
      if ('$lte' in expected && !(Number(actual) <= Number(expected.$lte))) return false;
      if ('$contains' in expected && !String(actual).includes(String(expected.$contains))) return false;
    } else {
      // eslint-disable-next-line eqeqeq
      if (actual != expected) return false;
    }
  }

  return true;
}

function resolvePath(path, context) {
  const parts = path.split('.');
  let cur = context;
  for (const part of parts) {
    if (cur == null) return undefined;
    cur = cur[part];
  }
  return cur;
}

module.exports = { ingestEvent };
