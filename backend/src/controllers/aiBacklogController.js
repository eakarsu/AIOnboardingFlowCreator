// Apply pass 5 — additive backlog AI controllers for AIOnboardingFlowCreator.
//
// Env vars used:
//   - OPENROUTER_API_KEY  (required for AI; missing => HTTP 503 + missing: OPENROUTER_API_KEY)
//   - OPENROUTER_BASE_URL (optional, default https://openrouter.ai/api/v1)
//   - OPENROUTER_MODEL    (optional, default anthropic/claude-3-5-sonnet-20241022)
//
// Endpoints:
//   POST /ai/predict-progress      MECHANICAL — forward-looking projection of progress
//                                  (distinct from analyze-progress's retrospective view).
//   POST /ai/compliance-audit      PRODUCT-DECISION — picks default compliance domains
//                                  (HR onboarding, security, code-of-conduct) when none
//                                  provided. Real ATS/HR-system integration remains
//                                  NEEDS-CREDS.

require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';

function isAIConfigured() {
  return !!OPENROUTER_API_KEY && OPENROUTER_API_KEY !== 'your_openrouter_api_key_here';
}

function aiKeyMissing(res) {
  return res.status(503).json({
    error: 'AI service not configured',
    detail: 'OPENROUTER_API_KEY environment variable is not set. Configure it to enable AI analysis.',
    missing: 'OPENROUTER_API_KEY',
  });
}

function parseJSONLoose(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch (_) {}
  const m = String(text).match(/\{[\s\S]*\}/);
  if (m) {
    try { return JSON.parse(m[0]); } catch (_) {}
  }
  return null;
}

async function callOpenRouter(messages) {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'AI Onboarding Flow Creator - Backlog',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages,
      max_tokens: 3000,
      temperature: 0.5,
    }),
  });
  if (!response.ok) {
    const t = await response.text().catch(() => '');
    throw new Error(`OpenRouter ${response.status}: ${t}`);
  }
  return response.json();
}

// MECHANICAL — forward-looking progress prediction (distinct from analyze-progress).
// Body: { user_name, goal_type, goal_description, current_value, target_value, start_date,
//         milestones_completed?, milestones_remaining?, days_horizon? }
const predictProgress = async (req, res) => {
  try {
    if (!isAIConfigured()) return aiKeyMissing(res);
    const {
      user_name, goal_type, goal_description, current_value, target_value, start_date,
      milestones_completed, milestones_remaining, days_horizon,
    } = req.body || {};

    if (!goal_type || target_value === undefined) {
      return res.status(400).json({ error: 'goal_type and target_value are required' });
    }

    const horizon = Number.isFinite(Number(days_horizon)) ? Math.min(180, Math.max(1, Number(days_horizon))) : 30;

    const messages = [
      {
        role: 'system',
        content: `You are a forward-looking onboarding analytics assistant. Project the trainee's
trajectory ${horizon} days into the future. Return ONLY JSON:
{
  "projected_progress_pct_in_horizon": 0-100,
  "expected_completion_date_iso": "...",
  "confidence": 0-1,
  "risk_factors": ["..."],
  "recommended_interventions": ["..."],
  "milestone_eta": [{ "milestone": "...", "eta_iso": "..." }],
  "narrative": "..."
}`,
      },
      {
        role: 'user',
        content: `User: ${user_name || 'unknown'}
Goal type: ${goal_type}
Goal description: ${goal_description || ''}
Current value: ${current_value ?? 0}
Target value: ${target_value}
Start date: ${start_date || ''}
Milestones completed: ${JSON.stringify(milestones_completed || [])}
Milestones remaining: ${JSON.stringify(milestones_remaining || [])}
Forecast horizon (days): ${horizon}`,
      },
    ];

    const result = await callOpenRouter(messages);
    const raw = result.choices?.[0]?.message?.content || '';
    const parsed = parseJSONLoose(raw) || { narrative: raw };
    const tokensUsed = result.usage?.total_tokens || 0;
    res.json({ analysis: parsed, tokensUsed, model: OPENROUTER_MODEL, horizon_days: horizon });
  } catch (error) {
    console.error('predictProgress error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to predict progress' });
  }
};

// PRODUCT-DECISION — Onboarding Compliance Audit.
// PRODUCT-DECISION: when `domains` is not supplied, defaults to
// ["hr_onboarding", "security_training", "code_of_conduct"]. Real
// HRIS/ATS integration to read actual completion state remains NEEDS-CREDS
// (Workday / BambooHR keys).
//
// Body: { flow_summary?: string, completed_steps?: string[], outstanding_steps?: string[],
//         domains?: string[], compliance_policy_text?: string }
const complianceAudit = async (req, res) => {
  try {
    if (!isAIConfigured()) return aiKeyMissing(res);
    const {
      flow_summary, completed_steps, outstanding_steps, domains, compliance_policy_text,
    } = req.body || {};

    // PRODUCT-DECISION default domains
    const effectiveDomains = Array.isArray(domains) && domains.length > 0
      ? domains
      : ['hr_onboarding', 'security_training', 'code_of_conduct'];

    const messages = [
      {
        role: 'system',
        content: `You are an onboarding compliance auditor. Given the flow context and
the listed compliance domains, identify gaps, risks, and recommended remediations.
Return ONLY JSON:
{
  "overall_compliance_score": 0-100,
  "by_domain": [
    { "domain": "...", "compliance_score": 0-100, "gaps": ["..."], "remediations": ["..."], "blocking": true|false }
  ],
  "high_risk_findings": ["..."],
  "next_actions": ["..."],
  "policy_alignment_notes": "..."
}`,
      },
      {
        role: 'user',
        content: `Flow summary: ${flow_summary || '(none)'}
Completed steps: ${JSON.stringify(completed_steps || [])}
Outstanding steps: ${JSON.stringify(outstanding_steps || [])}
Domains in scope: ${JSON.stringify(effectiveDomains)}
Compliance policy text (excerpt): ${compliance_policy_text || '(none provided)'}`,
      },
    ];

    const result = await callOpenRouter(messages);
    const raw = result.choices?.[0]?.message?.content || '';
    const parsed = parseJSONLoose(raw) || { narrative: raw };
    const tokensUsed = result.usage?.total_tokens || 0;
    res.json({ analysis: parsed, tokensUsed, model: OPENROUTER_MODEL, domains: effectiveDomains });
  } catch (error) {
    console.error('complianceAudit error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to run compliance audit' });
  }
};

module.exports = { predictProgress, complianceAudit };
