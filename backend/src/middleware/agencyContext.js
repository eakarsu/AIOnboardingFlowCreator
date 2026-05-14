const pool = require('../config/database');

/**
 * Extracts agencyId from the authenticated JWT payload (req.user) and attaches
 * it to req.agencyId.  Falls back to a DB lookup by user id when the JWT was
 * issued before the agency_id claim was added.
 *
 * Must be placed AFTER authenticateToken.
 */
const agencyContext = async (req, res, next) => {
  try {
    if (!req.user) {
      // Unauthenticated route — nothing to do.
      return next();
    }

    // Fast path: JWT already carries agency_id
    if (req.user.agency_id) {
      req.agencyId = req.user.agency_id;
      return next();
    }

    // Slow path: look it up from the DB (once per request, cached in JWT on next login)
    if (req.user.id) {
      const result = await pool.query(
        'SELECT agency_id FROM users WHERE id = $1',
        [req.user.id]
      );
      if (result.rows.length > 0 && result.rows[0].agency_id) {
        req.agencyId = result.rows[0].agency_id;
      }
    }

    next();
  } catch (err) {
    // Non-fatal — log and continue without agencyId
    console.error('[agencyContext] Failed to resolve agencyId:', err.message);
    next();
  }
};

/**
 * Helper used inside controllers to build a WHERE clause fragment that scopes
 * queries to the current agency.
 *
 * Usage:
 *   const { clause, params } = agencyFilter(req, existingParams);
 *   pool.query(`SELECT * FROM onboarding_flows WHERE 1=1 ${clause}`, params);
 */
const agencyFilter = (req, existingParams = []) => {
  if (!req.agencyId) {
    return { clause: '', params: existingParams };
  }
  const params = [...existingParams, req.agencyId];
  return {
    clause: ` AND agency_id = $${params.length}`,
    params
  };
};

module.exports = { agencyContext, agencyFilter };
