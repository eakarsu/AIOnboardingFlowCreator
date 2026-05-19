// Custom Views — adds 4 endpoints for onboarding flow analytics + spec PDF + rules CRUD.
// Mounted at /api/custom-views BEFORE the 404 handler.

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const pool = require('./_cfDb');

// ---- JWT auth middleware (mirrors existing custom-feature pattern) ----
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.userId = decoded.userId || decoded.id;
    next();
  } catch (_) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ---- Optional auth: attaches user if token valid, otherwise continues anonymously ----
function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.userId = decoded.userId || decoded.id;
  } catch (_) {}
  next();
}

// ---- Bootstrap: create rules table + seed deterministic fixture data ----
const TABLE = 'custom_views_flow_rules';
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${TABLE} (
        id SERIAL PRIMARY KEY,
        step_key VARCHAR(120) NOT NULL,
        condition_expr TEXT NOT NULL,
        next_step VARCHAR(120) NOT NULL,
        priority INTEGER DEFAULT 1,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    const { rows } = await pool.query(`SELECT COUNT(*)::int AS c FROM ${TABLE}`);
    if (rows[0].c === 0) {
      const seeds = [
        ['welcome', 'user.role == "engineer"', 'env_setup', 1],
        ['welcome', 'user.role == "designer"', 'tools_intro', 1],
        ['welcome', 'user.role == "manager"', 'team_overview', 2],
        ['env_setup', 'completed == true', 'first_pr', 1],
        ['env_setup', 'completed == false', 'env_help', 2],
        ['tools_intro', 'completed == true', 'design_brief', 1],
        ['first_pr', 'merged == true', 'mentor_match', 1],
        ['mentor_match', 'always', 'feedback_loop', 1],
      ];
      for (const [step_key, condition_expr, next_step, priority] of seeds) {
        await pool.query(
          `INSERT INTO ${TABLE}(step_key, condition_expr, next_step, priority) VALUES ($1,$2,$3,$4)`,
          [step_key, condition_expr, next_step, priority]
        );
      }
    }
  } catch (e) {
    console.error('[custom-views] bootstrap error:', e.message);
  }
})();

// ============================================================
// Deterministic fixture generators (no LLM, no live data required)
// ============================================================

const ONBOARDING_STEPS = [
  { key: 'welcome',       label: 'Welcome'             },
  { key: 'profile_setup', label: 'Profile Setup'       },
  { key: 'env_setup',     label: 'Environment Setup'   },
  { key: 'tools_intro',   label: 'Tools Introduction'  },
  { key: 'first_task',    label: 'First Task'          },
  { key: 'mentor_match',  label: 'Mentor Matching'     },
  { key: 'feedback_loop', label: 'Feedback Loop'       },
  { key: 'graduation',    label: 'Graduation'          },
];

const COHORTS = ['Q1-Eng', 'Q1-Design', 'Q2-Sales', 'Q2-Ops', 'Q3-Mixed'];

// Stable PRNG so repeated requests return identical shapes (helpful for tests).
function seededRand(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function buildFunnel() {
  const rand = seededRand(42);
  let cohort = 1000;
  const steps = ONBOARDING_STEPS.map((s, i) => {
    const dropRate = 0.05 + rand() * 0.12; // 5-17% drop per step
    const next = Math.max(50, Math.round(cohort * (1 - dropRate)));
    const row = {
      step_key: s.key,
      step_label: s.label,
      order: i + 1,
      users_entered: cohort,
      users_completed: next,
      drop_off: cohort - next,
      conversion_rate: +(next / cohort).toFixed(4),
    };
    cohort = next;
    return row;
  });
  const overall = steps.length
    ? +(steps[steps.length - 1].users_completed / steps[0].users_entered).toFixed(4)
    : 0;
  return { generated_at: new Date().toISOString(), overall_conversion: overall, steps };
}

function buildHeatmap() {
  const rand = seededRand(2024);
  const cells = [];
  for (const cohort of COHORTS) {
    for (const step of ONBOARDING_STEPS) {
      // Drop-off rate per (step, cohort), expressed as a percentage 0-40.
      const rate = +(rand() * 40).toFixed(1);
      cells.push({
        cohort,
        step_key: step.key,
        step_label: step.label,
        drop_off_pct: rate,
        severity: rate > 25 ? 'high' : rate > 12 ? 'medium' : 'low',
      });
    }
  }
  return {
    generated_at: new Date().toISOString(),
    cohorts: COHORTS,
    steps: ONBOARDING_STEPS,
    cells,
  };
}

// ============================================================
// VIZ 1 — Funnel conversion chart per step
// ============================================================
router.get('/funnel', optionalAuth, async (req, res) => {
  try {
    res.json(buildFunnel());
  } catch (e) {
    res.status(500).json({ error: 'funnel failure', message: e.message });
  }
});

// ============================================================
// VIZ 2 — Drop-off heatmap (step x cohort)
// ============================================================
router.get('/heatmap', optionalAuth, async (req, res) => {
  try {
    res.json(buildHeatmap());
  } catch (e) {
    res.status(500).json({ error: 'heatmap failure', message: e.message });
  }
});

// ============================================================
// NON-VIZ 1 — Onboarding flow spec PDF
// Streams a PDF describing the canonical onboarding flow.
// ============================================================
router.get('/spec-pdf', optionalAuth, async (req, res) => {
  try {
    const funnel = buildFunnel();
    let rules = [];
    try {
      const r = await pool.query(`SELECT * FROM ${TABLE} WHERE active = TRUE ORDER BY step_key, priority`);
      rules = r.rows;
    } catch (_) {}

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="onboarding_flow_spec.pdf"');
    doc.pipe(res);

    doc.fontSize(22).fillColor('#1e293b').text('Onboarding Flow Specification', { align: 'left' });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#64748b').text(`Generated ${new Date().toISOString()}`);
    doc.moveDown();

    doc.fontSize(14).fillColor('#1e293b').text('1. Steps & Conversion Targets', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#111827');
    funnel.steps.forEach((s) => {
      doc.text(
        `${s.order}. ${s.step_label} (${s.step_key}) — entered: ${s.users_entered}, completed: ${s.users_completed}, conv: ${(s.conversion_rate * 100).toFixed(1)}%`
      );
    });
    doc.moveDown();
    doc.fontSize(11).fillColor('#0f172a').text(
      `Overall conversion (welcome → graduation): ${(funnel.overall_conversion * 100).toFixed(1)}%`
    );

    doc.moveDown();
    doc.fontSize(14).fillColor('#1e293b').text('2. Active Branching Rules', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#111827');
    if (rules.length === 0) {
      doc.text('No active rules defined.');
    } else {
      rules.forEach((r) => {
        doc.text(`• [${r.step_key}] IF (${r.condition_expr}) THEN goto ${r.next_step}  (priority=${r.priority})`);
      });
    }

    doc.moveDown();
    doc.fontSize(14).fillColor('#1e293b').text('3. Operational Notes', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#111827').text(
      'This spec is auto-generated from the live custom-views service. Update branching rules via PUT /api/custom-views/rules/:id.'
    );

    doc.end();
  } catch (e) {
    if (!res.headersSent) {
      res.status(500).json({ error: 'pdf failure', message: e.message });
    }
  }
});

// ============================================================
// NON-VIZ 2 — Flow Step Rules CRUD (single endpoint dispatches by method)
// ============================================================
router.all('/rules', auth, async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { rows } = await pool.query(`SELECT * FROM ${TABLE} ORDER BY step_key, priority, id`);
      return res.json({ rules: rows, count: rows.length });
    }
    if (req.method === 'POST') {
      const { step_key, condition_expr, next_step, priority = 1, active = true } = req.body || {};
      if (!step_key || !condition_expr || !next_step) {
        return res.status(400).json({ error: 'step_key, condition_expr, next_step required' });
      }
      const { rows } = await pool.query(
        `INSERT INTO ${TABLE}(step_key, condition_expr, next_step, priority, active)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [step_key, condition_expr, next_step, priority, active]
      );
      return res.status(201).json(rows[0]);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    res.status(500).json({ error: 'rules failure', message: e.message });
  }
});

router.all('/rules/:id', auth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'invalid id' });
  try {
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const { step_key, condition_expr, next_step, priority, active } = req.body || {};
      const { rows } = await pool.query(
        `UPDATE ${TABLE} SET
           step_key      = COALESCE($2, step_key),
           condition_expr= COALESCE($3, condition_expr),
           next_step     = COALESCE($4, next_step),
           priority      = COALESCE($5, priority),
           active        = COALESCE($6, active),
           updated_at    = NOW()
         WHERE id = $1 RETURNING *`,
        [id, step_key, condition_expr, next_step, priority, active]
      );
      if (rows.length === 0) return res.status(404).json({ error: 'not found' });
      return res.json(rows[0]);
    }
    if (req.method === 'DELETE') {
      const { rowCount } = await pool.query(`DELETE FROM ${TABLE} WHERE id = $1`, [id]);
      if (rowCount === 0) return res.status(404).json({ error: 'not found' });
      return res.json({ deleted: true, id });
    }
    if (req.method === 'GET') {
      const { rows } = await pool.query(`SELECT * FROM ${TABLE} WHERE id = $1`, [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'not found' });
      return res.json(rows[0]);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    res.status(500).json({ error: 'rules failure', message: e.message });
  }
});

module.exports = router;
