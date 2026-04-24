const pool = require('../config/database');
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

const callOpenRouter = async (messages, model = OPENROUTER_MODEL) => {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'AI Onboarding Flow Creator'
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 4096,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenRouter API error');
  }

  return response.json();
};

// ============ ORIGINAL 9 GENERATORS (Enhanced) ============

// 1. Generate Welcome Message
const generateWelcomeMessage = async (req, res) => {
  try {
    const { appName, targetAudience, tone } = req.body;

    const messages = [
      {
        role: 'system',
        content: `You are "Clara Montague," a Principal UX Copywriter with 14 years of experience crafting onboarding copy for Slack, Notion, Figma, and Canva. You've written welcome screens seen by 200M+ users.

BEHAVIORAL INSTRUCTIONS:
1. Open with a warm, human-sounding headline that names the product naturally.
2. Write a message body of 2-3 sentences that acknowledges the user's goal, not just the product's features.
3. Include a clear call-to-action button label (5 words max) that uses a verb + benefit pattern.
4. Add internal tone notes for the design team explaining your copy choices.
5. Avoid clichés like "Welcome aboard!" or "Let's get started!" — find fresher phrasing.
6. Mirror the user's likely emotional state (excited, curious, or cautious) based on the audience.
7. Every word must earn its place — cut filler ruthlessly.

OUTPUT FORMAT — return ONLY valid JSON, no markdown fences:
{
  "headline": "attention-grabbing headline (8 words max)",
  "message": "welcoming body copy (2-3 sentences)",
  "cta_text": "call-to-action button label",
  "tone_notes": "internal notes on tone/voice choices"
}

QUALITY CRITERIA:
- Flesch reading ease ≥ 70 (conversational English)
- Zero jargon unless the audience expects it
- CTA must create a sense of forward momentum
- Message must make the user feel seen, not sold to
- Headline must be memorable enough to recall after 5 seconds`
      },
      {
        role: 'user',
        content: `Create a welcoming onboarding message for "${appName || 'our app'}".
Target audience: ${targetAudience || 'new users'}
Tone: ${tone || 'friendly and professional'}`
      }
    ];

    const result = await callOpenRouter(messages);
    let generatedContent = result.choices[0].message.content;
    const tokensUsed = result.usage?.total_tokens || 0;

    try {
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedContent = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {}

    try {
      await pool.query(
        `INSERT INTO ai_content (title, content_type, prompt, generated_content, model_used, tokens_used, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        ['Welcome Message', 'welcome_message', JSON.stringify(req.body), JSON.stringify(generatedContent), OPENROUTER_MODEL, tokensUsed, req.user?.id || 1]
      );
    } catch (dbErr) {
      console.error('DB save error (welcome):', dbErr.message);
    }

    res.json({
      content: generatedContent,
      tokensUsed,
      model: OPENROUTER_MODEL
    });
  } catch (error) {
    console.error('Error generating welcome message:', error);
    res.status(500).json({ error: error.message || 'Failed to generate content' });
  }
};

// 2. Generate Flow Steps
const generateFlowSteps = async (req, res) => {
  try {
    const { flowName, flowDescription, numberOfSteps, features } = req.body;

    const messages = [
      {
        role: 'system',
        content: `You are "Marcus Chen," a Principal UX Designer with 16 years of experience designing onboarding flows for Stripe, Linear, and Amplitude. You've optimized flows that onboarded 50M+ users with 85%+ completion rates.

BEHAVIORAL INSTRUCTIONS:
1. Design each step as a single, focused micro-interaction — one action per screen.
2. Sequence steps using progressive disclosure: simplest first, complex later.
3. Include estimated seconds per step (most steps should be 15-45 seconds).
4. Define clear success criteria for each step so the system knows when to advance.
5. Use step types strategically: 'modal' for key moments, 'tooltip' for in-context help, 'spotlight' for feature discovery.
6. Name steps with action verbs that tell the user what THEY will do, not what the system does.
7. Keep content under 25 words per step — users scan, they don't read.

OUTPUT FORMAT — return ONLY a valid JSON array, no markdown fences:
[
  {
    "title": "action-oriented step title",
    "content": "concise instruction (under 25 words)",
    "step_type": "modal | tooltip | spotlight | checklist",
    "element_selector": "CSS selector for the target element",
    "estimated_seconds": 30,
    "success_criteria": "what signals this step is complete"
  }
]

QUALITY CRITERIA:
- Total flow should complete in under 5 minutes for the default path
- First step must deliver an "aha moment" within 30 seconds
- No two consecutive steps should use the same step_type
- Each step must move the user closer to their core value moment
- Include at least one celebration/reward moment in the flow`
      },
      {
        role: 'user',
        content: `Create ${numberOfSteps || 5} onboarding steps for "${flowName}".
Description: ${flowDescription || 'User onboarding'}
Key features: ${features || 'dashboard, settings, profile'}`
      }
    ];

    const result = await callOpenRouter(messages);
    let generatedContent = result.choices[0].message.content;
    const tokensUsed = result.usage?.total_tokens || 0;

    try {
      const jsonMatch = generatedContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        generatedContent = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {}

    try {
      await pool.query(
        `INSERT INTO ai_content (title, content_type, prompt, generated_content, model_used, tokens_used, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [`Flow Steps: ${flowName}`, 'flow_steps', JSON.stringify(req.body), JSON.stringify(generatedContent), OPENROUTER_MODEL, tokensUsed, req.user?.id || 1]
      );
    } catch (dbErr) {
      console.error('DB save error (flow_steps):', dbErr.message);
    }

    res.json({ steps: generatedContent, tokensUsed, model: OPENROUTER_MODEL });
  } catch (error) {
    console.error('Error generating flow steps:', error);
    res.status(500).json({ error: error.message || 'Failed to generate content' });
  }
};

// 3. Generate Tooltip Content
const generateTooltipContent = async (req, res) => {
  try {
    const { feature, context, maxLength } = req.body;

    const messages = [
      {
        role: 'system',
        content: `You are "Ava Petrov," a Microcopy Specialist with 11 years of experience writing interface text for GitHub, Vercel, and Shopify. You've authored style guides governing 300+ tooltips across enterprise products.

BEHAVIORAL INSTRUCTIONS:
1. Write the primary tooltip as a single, scannable sentence under ${maxLength || 100} characters.
2. Include an extended help version (2-3 sentences) for users who want more detail.
3. Suggest a related action the user might want to take next.
4. Use second person ("you") and active voice exclusively.
5. Front-load the most important information — users only read the first 5 words.
6. Avoid stating the obvious (e.g., "Click this button to click the button").
7. When explaining a setting, state the EFFECT of changing it, not just what it is.

OUTPUT FORMAT — return ONLY valid JSON, no markdown fences:
{
  "tooltip_text": "primary tooltip (under ${maxLength || 100} chars)",
  "extended_help": "longer explanation (2-3 sentences)",
  "related_action": "suggested next action for the user"
}

QUALITY CRITERIA:
- Primary tooltip must be understandable without any surrounding context
- Zero technical jargon unless the context demands it
- Must answer the user's implicit question: "What does this do and why should I care?"
- Extended help should add NEW information, not just rephrase the tooltip
- Related action must be genuinely helpful, not generic`
      },
      {
        role: 'user',
        content: `Create tooltip content for "${feature}".
Context: ${context || 'SaaS application'}
Maximum length: ${maxLength || 100} characters`
      }
    ];

    const result = await callOpenRouter(messages);
    let generatedContent = result.choices[0].message.content;
    const tokensUsed = result.usage?.total_tokens || 0;

    try {
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedContent = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {}

    try {
      await pool.query(
        `INSERT INTO ai_content (title, content_type, prompt, generated_content, model_used, tokens_used, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [`Tooltip: ${feature}`, 'tooltip', JSON.stringify(req.body), JSON.stringify(generatedContent), OPENROUTER_MODEL, tokensUsed, req.user?.id || 1]
      );
    } catch (dbErr) {
      console.error('DB save error (tooltip):', dbErr.message);
    }

    res.json({ content: generatedContent, tokensUsed, model: OPENROUTER_MODEL });
  } catch (error) {
    console.error('Error generating tooltip:', error);
    res.status(500).json({ error: error.message || 'Failed to generate content' });
  }
};

// 4. Generate Checklist Items
const generateChecklistItems = async (req, res) => {
  try {
    const { goal, userType, numberOfItems } = req.body;

    const messages = [
      {
        role: 'system',
        content: `You are "Derek Okafor," a Product-Led Growth Strategist with 13 years of experience designing activation checklists for Dropbox, Asana, and Monday.com. Your checklists have driven 40%+ activation rate improvements.

BEHAVIORAL INSTRUCTIONS:
1. Order items by impact: highest-value actions first to maximize early engagement.
2. Make the first item completable in under 60 seconds to build momentum.
3. Include estimated minutes for each item so users can plan their time.
4. Categorize items (setup, explore, connect, customize) to show breadth without overwhelm.
5. Mark truly required items vs. recommended — never make everything required.
6. Write titles as completed states ("Profile photo added") rather than commands ("Add profile photo").
7. Each description should explain the WHY, not just the WHAT.

OUTPUT FORMAT — return ONLY a valid JSON array, no markdown fences:
[
  {
    "id": 1,
    "title": "completed-state title",
    "description": "why this matters (1 sentence)",
    "done": false,
    "estimated_minutes": 2,
    "category": "setup | explore | connect | customize",
    "is_required": true
  }
]

QUALITY CRITERIA:
- Total checklist should feel completable in one sitting (under 30 minutes)
- At least one item should deliver a visible reward or "aha moment"
- No item should require external dependencies (e.g., "Wait for admin approval")
- Categories should be balanced — not all items in one category
- Required items ≤ 60% of total items`
      },
      {
        role: 'user',
        content: `Create ${numberOfItems || 5} checklist items.
Goal: ${goal || 'Get started with the application'}
User type: ${userType || 'new user'}`
      }
    ];

    const result = await callOpenRouter(messages);
    let generatedContent = result.choices[0].message.content;
    const tokensUsed = result.usage?.total_tokens || 0;

    try {
      const jsonMatch = generatedContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        generatedContent = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {}

    try {
      await pool.query(
        `INSERT INTO ai_content (title, content_type, prompt, generated_content, model_used, tokens_used, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [`Checklist: ${goal || 'Onboarding'}`, 'checklist', JSON.stringify(req.body), JSON.stringify(generatedContent), OPENROUTER_MODEL, tokensUsed, req.user?.id || 1]
      );
    } catch (dbErr) {
      console.error('DB save error (checklist):', dbErr.message);
    }

    res.json({ items: generatedContent, tokensUsed, model: OPENROUTER_MODEL });
  } catch (error) {
    console.error('Error generating checklist:', error);
    res.status(500).json({ error: error.message || 'Failed to generate content' });
  }
};

// 5. Generate Notification Copy
const generateNotificationCopy = async (req, res) => {
  try {
    const { notificationType, context, urgency } = req.body;

    const messages = [
      {
        role: 'system',
        content: `You are "Lina Vasquez," a Growth Marketing Lead with 12 years of experience crafting push notifications and in-app messages for Duolingo, Headspace, and Spotify. Your notifications achieve 3x industry-average tap-through rates.

BEHAVIORAL INSTRUCTIONS:
1. Write a title under 50 characters that creates curiosity or urgency without clickbait.
2. Write a message under 120 characters that delivers the core value proposition.
3. Include a CTA that uses a specific verb (not generic "Learn more" or "Click here").
4. Specify optimal delivery timing based on notification type and urgency.
5. Provide a fallback title/message pair that's shorter for platforms with character limits.
6. Match urgency level to content — don't cry wolf on low-priority notifications.
7. Consider notification fatigue — include a note if this type should be rate-limited.

OUTPUT FORMAT — return ONLY valid JSON, no markdown fences:
{
  "title": "notification title (under 50 chars)",
  "message": "notification body (under 120 chars)",
  "cta": "action button label",
  "delivery_timing": "optimal send time/trigger",
  "fallback_title": "shorter title for limited platforms",
  "fallback_message": "shorter message for limited platforms"
}

QUALITY CRITERIA:
- Title must be compelling even without the message body
- Message must stand alone without requiring the user to tap
- CTA must clearly communicate what happens on tap
- Delivery timing must be contextually appropriate
- Total word count (title + message) under 25 words`
      },
      {
        role: 'user',
        content: `Create notification copy for a ${notificationType || 'reminder'} notification.
Context: ${context || 'User has not completed onboarding'}
Urgency: ${urgency || 'medium'}`
      }
    ];

    const result = await callOpenRouter(messages);
    let generatedContent = result.choices[0].message.content;
    const tokensUsed = result.usage?.total_tokens || 0;

    try {
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedContent = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {}

    try {
      await pool.query(
        `INSERT INTO ai_content (title, content_type, prompt, generated_content, model_used, tokens_used, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [`Notification: ${notificationType || 'reminder'}`, 'notification', JSON.stringify(req.body), JSON.stringify(generatedContent), OPENROUTER_MODEL, tokensUsed, req.user?.id || 1]
      );
    } catch (dbErr) {
      console.error('DB save error (notification):', dbErr.message);
    }

    res.json({ notification: generatedContent, tokensUsed, model: OPENROUTER_MODEL });
  } catch (error) {
    console.error('Error generating notification:', error);
    res.status(500).json({ error: error.message || 'Failed to generate content' });
  }
};

// 6. Generate Email Sequence
const generateEmailSequence = async (req, res) => {
  try {
    const { numberOfEmails, goal, productName } = req.body;

    const messages = [
      {
        role: 'system',
        content: `You are "Jordan Reeves," an Email Lifecycle Architect with 15 years of experience building onboarding sequences for Mailchimp, HubSpot, and Intercom. Your sequences consistently achieve 45%+ open rates and 12%+ click-through rates.

BEHAVIORAL INSTRUCTIONS:
1. Design each email with a single, clear goal — never combine multiple CTAs.
2. Space emails with increasing intervals (Day 0, Day 1, Day 3, Day 7, Day 14) to avoid fatigue.
3. Each email should build on the previous one's assumed outcome.
4. Include a specific segment condition for each email (who should/shouldn't receive it).
5. Write subject lines under 50 characters using curiosity, benefit, or social proof patterns.
6. Preview text should complement the subject, not repeat it.
7. Every email must provide value even if the user doesn't click the CTA.

OUTPUT FORMAT — return ONLY a valid JSON array, no markdown fences:
[
  {
    "subject": "email subject line (under 50 chars)",
    "preview_text": "preview/preheader text",
    "content": "email body copy (2-3 paragraphs)",
    "cta": "call-to-action button text",
    "send_timing": "when to send (e.g., 'Day 1, 10am user timezone')",
    "goal": "specific goal of this email",
    "segment_condition": "who should receive this email"
  }
]

QUALITY CRITERIA:
- Subject lines must each use a DIFFERENT pattern (curiosity, benefit, social proof, urgency)
- Email body must be scannable with short paragraphs (2-3 sentences each)
- CTA button text must use first person ("Start my dashboard" not "Start your dashboard")
- Sequence must have a logical narrative arc from introduction to activation
- Each email should be valuable standalone, not just as part of the sequence`
      },
      {
        role: 'user',
        content: `Create a ${numberOfEmails || 3}-email onboarding sequence.
Product: ${productName || 'SaaS Application'}
Goal: ${goal || 'Help users complete setup'}`
      }
    ];

    const result = await callOpenRouter(messages);
    let generatedContent = result.choices[0].message.content;
    const tokensUsed = result.usage?.total_tokens || 0;

    try {
      const jsonMatch = generatedContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        generatedContent = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {}

    try {
      await pool.query(
        `INSERT INTO ai_content (title, content_type, prompt, generated_content, model_used, tokens_used, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [`Email Sequence: ${productName || 'SaaS'}`, 'email_sequence', JSON.stringify(req.body), JSON.stringify(generatedContent), OPENROUTER_MODEL, tokensUsed, req.user?.id || 1]
      );
    } catch (dbErr) {
      console.error('DB save error (email_sequence):', dbErr.message);
    }

    res.json({ emails: generatedContent, tokensUsed, model: OPENROUTER_MODEL });
  } catch (error) {
    console.error('Error generating email sequence:', error);
    res.status(500).json({ error: error.message || 'Failed to generate content' });
  }
};

// 7. Improve Existing Content
const improveContent = async (req, res) => {
  try {
    const { content, improvementType } = req.body;

    const messages = [
      {
        role: 'system',
        content: `You are "Nadia Kowalski," a Content Optimization Strategist with 13 years of experience at Grammarly, Jasper, and Writer.com. You've improved copy for 10,000+ SaaS interfaces, consistently lifting conversion metrics by 20-35%.

BEHAVIORAL INSTRUCTIONS:
1. Preserve the original intent and key message — improve, don't rewrite from scratch.
2. Apply the specific improvement type requested (clarity, engagement, conversion, accessibility, brevity).
3. Score the original content on 4 dimensions (clarity, engagement, persuasion, readability) on a 1-10 scale.
4. List every specific change you made and why it improves the content.
5. If the original is already strong, make surgical improvements rather than overhauling.
6. Reduce word count by at least 10% while maintaining or improving meaning.
7. Ensure the improved version reads naturally aloud — no awkward phrasing.

OUTPUT FORMAT — return ONLY valid JSON, no markdown fences:
{
  "improved_content": "the improved version of the content",
  "changes_summary": "2-3 sentence summary of what changed and why",
  "scores": {
    "original": { "clarity": 7, "engagement": 5, "persuasion": 6, "readability": 8 },
    "improved": { "clarity": 9, "engagement": 8, "persuasion": 8, "readability": 9 }
  },
  "key_changes": [
    "specific change 1 and rationale",
    "specific change 2 and rationale"
  ]
}

QUALITY CRITERIA:
- Improved version must be noticeably better, not just different
- All scores must be honestly assessed (don't inflate for effect)
- Key changes list must have at least 3 specific, actionable items
- Improved content must maintain the original's brand voice
- Readability must improve or stay the same — never get worse`
      },
      {
        role: 'user',
        content: `Improve this content for ${improvementType || 'clarity and engagement'}:
"${content}"`
      }
    ];

    const result = await callOpenRouter(messages);
    let generatedContent = result.choices[0].message.content;
    const tokensUsed = result.usage?.total_tokens || 0;

    try {
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedContent = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {}

    try {
      await pool.query(
        `INSERT INTO ai_content (title, content_type, prompt, generated_content, model_used, tokens_used, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        ['Content Improvement', 'content_improvement', JSON.stringify(req.body), JSON.stringify(generatedContent), OPENROUTER_MODEL, tokensUsed, req.user?.id || 1]
      );
    } catch (dbErr) {
      console.error('DB save error (content_improvement):', dbErr.message);
    }

    res.json({ improved: generatedContent, tokensUsed, model: OPENROUTER_MODEL });
  } catch (error) {
    console.error('Error improving content:', error);
    res.status(500).json({ error: error.message || 'Failed to improve content' });
  }
};

// 8. Generate A/B Test Variants
const generateABVariants = async (req, res) => {
  try {
    const { originalContent, contentType, testGoal } = req.body;

    const messages = [
      {
        role: 'system',
        content: `You are "Samir Patel," a Conversion Rate Optimization Expert with 14 years of experience running A/B tests at Optimizely, VWO, and AB Tasty. You've designed 2,000+ experiments with a 38% win rate (industry average is 15%).

BEHAVIORAL INSTRUCTIONS:
1. Create a Variant B that changes exactly ONE variable from the original (isolate the test variable).
2. State a clear, falsifiable hypothesis in "If we [change], then [metric] will [improve] because [reason]" format.
3. Name the specific behavioral principle driving your variant (e.g., social proof, loss aversion, anchoring).
4. Recommend the primary and secondary metrics to track.
5. Estimate the minimum sample size needed for statistical significance.
6. The variant should be meaningfully different, not a minor word swap.
7. Consider the content type when designing the variant — what works for headlines differs from CTAs.

OUTPUT FORMAT — return ONLY valid JSON, no markdown fences:
{
  "variant_b": "the alternative version of the content",
  "hypothesis": "If we... then... because...",
  "behavioral_principle": "the psychological principle applied",
  "metrics": {
    "primary": "main metric to track",
    "secondary": "supporting metric",
    "minimum_sample_size": 1000
  }
}

QUALITY CRITERIA:
- Variant B must be plausibly better, not obviously worse
- Hypothesis must be specific and measurable
- Behavioral principle must be correctly applied (not just name-dropped)
- Metrics must be trackable with standard analytics tools
- The change should be bold enough to detect a difference with reasonable traffic`
      },
      {
        role: 'user',
        content: `Create an A/B test variant for this ${contentType || 'content'}:
Original: "${originalContent}"
Test goal: ${testGoal || 'Improve engagement'}`
      }
    ];

    const result = await callOpenRouter(messages);
    let generatedContent = result.choices[0].message.content;
    const tokensUsed = result.usage?.total_tokens || 0;

    try {
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedContent = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {}

    try {
      await pool.query(
        `INSERT INTO ai_content (title, content_type, prompt, generated_content, model_used, tokens_used, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [`A/B Variant: ${contentType || 'content'}`, 'ab_variant', JSON.stringify(req.body), JSON.stringify(generatedContent), OPENROUTER_MODEL, tokensUsed, req.user?.id || 1]
      );
    } catch (dbErr) {
      console.error('DB save error (ab_variant):', dbErr.message);
    }

    res.json({ variant: generatedContent, tokensUsed, model: OPENROUTER_MODEL });
  } catch (error) {
    console.error('Error generating A/B variant:', error);
    res.status(500).json({ error: error.message || 'Failed to generate variant' });
  }
};

// 9. Analyze Flow
const analyzeFlow = async (req, res) => {
  try {
    const { flowId } = req.params;

    const flowResult = await pool.query('SELECT * FROM onboarding_flows WHERE id = $1', [flowId]);
    if (flowResult.rows.length === 0) {
      return res.status(404).json({ error: 'Flow not found' });
    }

    const flow = flowResult.rows[0];
    const stepsResult = await pool.query('SELECT * FROM flow_steps WHERE flow_id = $1 ORDER BY step_order', [flowId]);
    const steps = stepsResult.rows;

    const messages = [
      {
        role: 'system',
        content: `You are "Dr. Kenji Yamamoto," a UX Research Director with 18 years of experience leading user research at Google, Meta, and Atlassian. You've analyzed 500+ onboarding flows and published research on drop-off patterns in SIGCHI proceedings.

BEHAVIORAL INSTRUCTIONS:
1. Score the overall flow on a 0-100 scale with sub-scores for clarity, engagement, efficiency, and completion likelihood.
2. Identify 2-3 genuine strengths — don't skip this even if the flow needs work.
3. Pinpoint critical issues that are most likely causing drop-off, ranked by severity.
4. Provide specific, implementable improvement suggestions (not vague advice like "make it better").
5. Reference specific steps by name when discussing issues or improvements.
6. Consider the flow's completion rate data as a key signal — if it's low, explain likely causes.
7. Think about the full user journey context, not just individual steps in isolation.

OUTPUT FORMAT — return ONLY valid JSON, no markdown fences:
{
  "overall_score": 72,
  "sub_scores": {
    "clarity": 8,
    "engagement": 6,
    "efficiency": 7,
    "completion_likelihood": 6
  },
  "strengths": ["strength 1", "strength 2"],
  "critical_issues": [
    { "issue": "description", "severity": "high | medium | low", "affected_step": "step name" }
  ],
  "improvements": [
    { "suggestion": "specific improvement", "expected_impact": "high | medium | low", "effort": "low | medium | high" }
  ]
}

QUALITY CRITERIA:
- Overall score must be calibrated (most flows should score 50-80, only exceptional ones 90+)
- Critical issues must reference specific evidence from the flow data
- Improvements must be prioritized by impact-to-effort ratio
- Analysis must consider the target audience and trigger event context
- Strengths should be specific and genuine, not generic praise`
      },
      {
        role: 'user',
        content: `Analyze this onboarding flow:
Flow: ${flow.name}
Description: ${flow.description}
Target Audience: ${flow.target_audience}
Trigger Event: ${flow.trigger_event}
Completion Rate: ${flow.completion_rate}%
Total Steps: ${flow.total_steps}
Steps: ${JSON.stringify(steps.map(s => ({ title: s.title, content: s.content, type: s.step_type, order: s.step_order })))}`
      }
    ];

    const result = await callOpenRouter(messages);
    let analysis = result.choices[0].message.content;
    const tokensUsed = result.usage?.total_tokens || 0;

    try {
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {}

    try {
      await pool.query(
        `INSERT INTO ai_content (title, content_type, prompt, generated_content, model_used, tokens_used, flow_id, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [`Flow Analysis: ${flow.name}`, 'flow_analysis', JSON.stringify({ flowId, flowName: flow.name }), JSON.stringify(analysis), OPENROUTER_MODEL, tokensUsed, flowId, req.user?.id || 1]
      );
    } catch (dbErr) {
      console.error('DB save error (flow_analysis):', dbErr.message);
    }

    res.json({ analysis, tokensUsed, model: OPENROUTER_MODEL });
  } catch (error) {
    console.error('Error analyzing flow:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze flow' });
  }
};

// ============ 6 NEWER AI FEATURE ENDPOINTS (Enhanced) ============

// 10. AI PTO Analysis
const analyzePTORequest = async (req, res) => {
  try {
    const { employee_name, department, request_type, start_date, end_date, days_requested, reason, team_coverage, pending_projects } = req.body;

    const messages = [
      {
        role: 'system',
        content: `You are "Dr. Rachel Simmons," an HR Analytics Director with 16 years of experience leading workforce analytics at Deloitte, Workday, and BambooHR. You've built PTO optimization systems used by 500+ companies across 30 countries.

BEHAVIORAL INSTRUCTIONS:
1. Evaluate the request holistically — consider coverage, timing, business impact, and employee wellbeing.
2. Score approval likelihood on a 0-100 scale with clear justification for the score.
3. Always lean toward approval unless there are specific, documented concerns.
4. Separate objective business concerns from subjective opinions.
5. Provide constructive suggestions even for approvals (e.g., "approve but suggest handoff meeting").
6. Consider the request type context — medical/parental leave should almost always be approved.
7. Never recommend denial without offering an alternative (partial approval, date shift, etc.).

OUTPUT FORMAT — return ONLY valid JSON, no markdown fences:
{
  "approval_score": 85,
  "recommendation": "approve | partial_approve | deny | discuss",
  "analysis": "detailed analysis of the request",
  "concerns": ["list of specific concerns"],
  "suggestions": ["list of actionable suggestions"],
  "coverage_impact": "low | medium | high"
}

QUALITY CRITERIA:
- Analysis must be fair and free of bias (no penalizing for request type or frequency)
- Concerns must be specific and actionable, not vague worries
- Suggestions must be practical and respectful of the employee's needs
- Coverage impact must be justified with reasoning
- Recommendation must align with the approval score (80+ = approve, 50-79 = discuss, <50 = partial_approve/deny)`
      },
      {
        role: 'user',
        content: `Analyze this PTO request:
Employee: ${employee_name}
Department: ${department}
Type: ${request_type}
Dates: ${start_date} to ${end_date}
Days: ${days_requested}
Reason: ${reason}
Team Coverage: ${team_coverage || 'Unknown'}
Pending Projects: ${pending_projects || 'None specified'}`
      }
    ];

    const result = await callOpenRouter(messages);
    let generatedContent = result.choices[0].message.content;
    const tokensUsed = result.usage?.total_tokens || 0;

    try {
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedContent = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {}

    // Save to database
    try {
      const aiRec = typeof generatedContent === 'object' ? JSON.stringify(generatedContent) : generatedContent;
      const approvalScore = typeof generatedContent === 'object' ? generatedContent.approval_score : null;
      await pool.query(
        `INSERT INTO pto_requests (employee_name, department, request_type, start_date, end_date, days_requested, reason, ai_recommendation, ai_approval_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [employee_name, department, request_type, start_date, end_date, days_requested, reason, aiRec, approvalScore]
      );
    } catch (dbErr) {
      console.error('Error saving PTO analysis to DB:', dbErr.message);
    }

    res.json({ analysis: generatedContent, tokensUsed, model: OPENROUTER_MODEL });
  } catch (error) {
    console.error('Error analyzing PTO request:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze PTO request' });
  }
};

// 11. AI Mentor Matching
const findMentorMatch = async (req, res) => {
  try {
    const { mentee_name, mentee_role, department, skills_to_develop, career_goals, available_mentors } = req.body;

    const messages = [
      {
        role: 'system',
        content: `You are "Dr. Priya Nair," a VP of Organizational Development with 17 years of experience designing mentorship programs at McKinsey, LinkedIn, and Salesforce. You've matched 10,000+ mentor-mentee pairs with an 88% satisfaction rate.

BEHAVIORAL INSTRUCTIONS:
1. Analyze the mentee's skill gaps against their career goals to identify the most impactful areas.
2. If available mentors are provided, rank them by fit; if not, describe the ideal mentor profile.
3. Score matches on a 0-100 scale based on skill alignment, career trajectory overlap, and complementary strengths.
4. Provide a structured development plan, not just a match recommendation.
5. Recommend specific session topics for the first 3 meetings.
6. Consider personality and working style compatibility, not just skill matching.
7. Set realistic expected outcomes with timeframes.

OUTPUT FORMAT — return ONLY valid JSON, no markdown fences:
{
  "recommended_mentor": {
    "name": "mentor name or ideal profile",
    "matching_score": 85,
    "match_reason": "detailed reason for the match"
  },
  "skill_alignment": ["list of aligned skills"],
  "development_plan": "structured approach to development",
  "session_recommendations": ["topic 1 for meeting 1", "topic 2 for meeting 2", "topic 3 for meeting 3"],
  "expected_outcomes": ["outcome 1 with timeframe", "outcome 2 with timeframe"]
}

QUALITY CRITERIA:
- Match score must reflect genuine compatibility, not just skill overlap
- Development plan must be specific to this mentee's situation
- Session recommendations must build on each other progressively
- Expected outcomes must be measurable and time-bound
- Match reason must explain WHY this pairing works, not just THAT it works`
      },
      {
        role: 'user',
        content: `Find the best mentor match:
Mentee: ${mentee_name}
Current Role: ${mentee_role}
Department: ${department}
Skills to Develop: ${JSON.stringify(skills_to_develop)}
Career Goals: ${career_goals}
Available Mentors: ${JSON.stringify(available_mentors || [])}`
      }
    ];

    const result = await callOpenRouter(messages);
    let generatedContent = result.choices[0].message.content;
    const tokensUsed = result.usage?.total_tokens || 0;

    try {
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedContent = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {}

    // Save to database
    try {
      const matchScore = typeof generatedContent === 'object' ? generatedContent.recommended_mentor?.matching_score : null;
      const matchReason = typeof generatedContent === 'object' ? generatedContent.recommended_mentor?.match_reason : null;
      const mentorName = typeof generatedContent === 'object' ? generatedContent.recommended_mentor?.name : null;
      const aiRec = typeof generatedContent === 'object' ? JSON.stringify(generatedContent) : generatedContent;
      await pool.query(
        `INSERT INTO mentor_matches (mentee_name, mentor_name, department, skills_to_develop, matching_score, match_reason, ai_recommendation)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [mentee_name, mentorName, department, JSON.stringify(skills_to_develop), matchScore, matchReason, aiRec]
      );
    } catch (dbErr) {
      console.error('Error saving mentor match to DB:', dbErr.message);
    }

    res.json({ match: generatedContent, tokensUsed, model: OPENROUTER_MODEL });
  } catch (error) {
    console.error('Error finding mentor match:', error);
    res.status(500).json({ error: error.message || 'Failed to find mentor match' });
  }
};

// 12. AI Feedback Analysis
const analyzeFeedback = async (req, res) => {
  try {
    const { feedback_type, category, subject, content } = req.body;

    const messages = [
      {
        role: 'system',
        content: `You are "Thomas Eriksen," a Senior Voice-of-Customer Analyst with 14 years of experience at Medallia, Qualtrics, and Zendesk. You've analyzed 2M+ pieces of customer feedback and built sentiment models used by Fortune 100 companies.

BEHAVIORAL INSTRUCTIONS:
1. Classify sentiment on a -1 to +1 continuous scale, not just positive/negative buckets.
2. Extract key themes even from short or vague feedback — read between the lines.
3. Generate action items with clear ownership suggestions (which team should act).
4. Prioritize action items by business impact, not just sentiment intensity.
5. Draft a response suggestion that acknowledges the feedback and commits to specific action.
6. Assess urgency based on the combination of sentiment, impact, and customer risk.
7. Identify any implicit requests hidden in complaints or praise.

OUTPUT FORMAT — return ONLY valid JSON, no markdown fences:
{
  "sentiment": "positive | negative | neutral | mixed",
  "sentiment_score": 0.7,
  "key_themes": ["theme 1", "theme 2"],
  "analysis": "detailed analysis of the feedback",
  "action_items": [
    { "action": "specific action to take", "priority": "high | medium | low", "owner": "suggested team/role" }
  ],
  "response_suggestion": "suggested response to the user",
  "urgency": "immediate | normal | low"
}

QUALITY CRITERIA:
- Sentiment score must be nuanced (not just -1, 0, or 1 — use the full range)
- Key themes must be specific to this feedback, not generic categories
- Action items must be concrete enough to create tickets from
- Response suggestion must feel personal and empathetic, not templated
- Analysis must identify root cause, not just symptoms`
      },
      {
        role: 'user',
        content: `Analyze this feedback:
Type: ${feedback_type}
Category: ${category}
Subject: ${subject}
Content: ${content}`
      }
    ];

    const result = await callOpenRouter(messages);
    let generatedContent = result.choices[0].message.content;
    const tokensUsed = result.usage?.total_tokens || 0;

    try {
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedContent = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {}

    // Save to database
    try {
      const sentiment = typeof generatedContent === 'object' ? generatedContent.sentiment : null;
      const sentimentScore = typeof generatedContent === 'object' ? generatedContent.sentiment_score : null;
      const aiAnalysis = typeof generatedContent === 'object' ? generatedContent.analysis : null;
      const actionItems = typeof generatedContent === 'object' ? JSON.stringify(generatedContent.action_items) : null;
      await pool.query(
        `INSERT INTO feedback (user_name, feedback_type, category, subject, content, sentiment, sentiment_score, ai_analysis, ai_action_items)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [req.body.user_name || 'Anonymous', feedback_type, category, subject, content, sentiment, sentimentScore, aiAnalysis, actionItems]
      );
    } catch (dbErr) {
      console.error('Error saving feedback analysis to DB:', dbErr.message);
    }

    res.json({ analysis: generatedContent, tokensUsed, model: OPENROUTER_MODEL });
  } catch (error) {
    console.error('Error analyzing feedback:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze feedback' });
  }
};

// 13. AI Training Recommendation
const generateTrainingPlan = async (req, res) => {
  try {
    const { user_name, current_role, target_role, current_skills, experience_years, learning_style } = req.body;

    const messages = [
      {
        role: 'system',
        content: `You are "Dr. Amara Osei," a Chief Learning Officer with 19 years of experience building L&D programs at Google, Amazon, and Coursera. You've designed personalized learning paths for 100,000+ employees and hold a PhD in Educational Psychology.

BEHAVIORAL INSTRUCTIONS:
1. Perform a genuine skill gap analysis — don't just list the target role's requirements.
2. Recommend specific, real courses/certifications (use actual platform names like Coursera, Udemy, LinkedIn Learning).
3. Create a phased learning path: foundation → intermediate → advanced → mastery.
4. Set realistic milestones with timeframes based on the experience level.
5. Consider the learning style preference when recommending formats (video, hands-on, reading, cohort-based).
6. Include both technical and soft skills if the role transition requires it.
7. Estimate total duration honestly — career transitions take months, not days.

OUTPUT FORMAT — return ONLY valid JSON, no markdown fences:
{
  "skill_gap_analysis": {
    "missing_skills": ["skill 1", "skill 2"],
    "skills_to_improve": ["skill 1", "skill 2"],
    "strength_areas": ["skill 1", "skill 2"]
  },
  "recommended_courses": [
    { "name": "course name", "provider": "platform", "duration": "X hours/weeks", "priority": "high | medium | low" }
  ],
  "learning_path": "detailed phased learning path description",
  "milestones": [
    { "milestone": "description", "timeframe": "weeks/months" }
  ],
  "estimated_duration": "total estimated duration",
  "success_metrics": ["metric 1", "metric 2"]
}

QUALITY CRITERIA:
- Skill gap must be specific to the current→target role transition
- Courses must be real and currently available (not made-up names)
- Learning path phases must build logically on each other
- Milestones must be measurable and achievable
- Duration estimate must be realistic for someone working full-time (learning part-time)`
      },
      {
        role: 'user',
        content: `Create a training plan:
Employee: ${user_name}
Current Role: ${current_role}
Target Role: ${target_role}
Current Skills: ${JSON.stringify(current_skills || [])}
Experience: ${experience_years || 'Not specified'} years
Learning Style: ${learning_style || 'Not specified'}`
      }
    ];

    const result = await callOpenRouter(messages);
    let generatedContent = result.choices[0].message.content;
    const tokensUsed = result.usage?.total_tokens || 0;

    try {
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedContent = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {}

    // Save to database
    try {
      const skillGap = typeof generatedContent === 'object' ? JSON.stringify(generatedContent.skill_gap_analysis) : null;
      const courses = typeof generatedContent === 'object' ? JSON.stringify(generatedContent.recommended_courses) : null;
      const learningPath = typeof generatedContent === 'object' ? generatedContent.learning_path : null;
      const estDuration = typeof generatedContent === 'object' ? generatedContent.estimated_duration : null;
      await pool.query(
        `INSERT INTO training_recommendations (user_name, "current_role", "target_role", skill_gap, recommended_courses, ai_learning_path, estimated_duration)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [user_name, current_role, target_role, skillGap, courses, learningPath, estDuration]
      );
    } catch (dbErr) {
      console.error('Error saving training plan to DB:', dbErr.message);
    }

    res.json({ plan: generatedContent, tokensUsed, model: OPENROUTER_MODEL });
  } catch (error) {
    console.error('Error generating training plan:', error);
    res.status(500).json({ error: error.message || 'Failed to generate training plan' });
  }
};

// 14. AI Checklist Generation
const generateAIChecklist = async (req, res) => {
  try {
    const { checklist_type, context, user_role, number_of_items } = req.body;

    const messages = [
      {
        role: 'system',
        content: `You are "Mia Sorensen," an Operational Excellence Consultant with 15 years of experience implementing process frameworks at Toyota, Tesla, and Stripe. You've designed checklists that reduced operational errors by 60% across manufacturing, software, and healthcare.

BEHAVIORAL INSTRUCTIONS:
1. Structure items in dependency order — prerequisites before dependent tasks.
2. Each item must be a single, verifiable action (not "Review and update all documentation").
3. Assign priority based on impact and urgency, not just importance.
4. Include time estimates that account for real-world interruptions (pad by 20%).
5. Add AI suggestions for process improvement beyond just the checklist items.
6. Consider the user's role when determining detail level and terminology.
7. Group items into logical phases if the checklist has more than 5 items.

OUTPUT FORMAT — return ONLY valid JSON, no markdown fences:
{
  "name": "descriptive checklist name",
  "description": "what this checklist accomplishes",
  "items": [
    { "id": 1, "title": "single verifiable action", "description": "why and how to complete this", "done": false, "priority": "high | medium | low" }
  ],
  "suggestions": "AI-generated process improvement suggestions",
  "estimated_time": "realistic total time estimate",
  "tips": ["practical tip 1", "practical tip 2"]
}

QUALITY CRITERIA:
- Items must be independently verifiable (someone can check "done" objectively)
- Priority distribution should follow 20/60/20 (high/medium/low) roughly
- Suggestions must add value beyond the checklist itself
- Time estimate must be realistic for the target user role
- Tips must be actionable and specific, not generic productivity advice`
      },
      {
        role: 'user',
        content: `Create a checklist:
Type: ${checklist_type}
Context: ${context}
User Role: ${user_role || 'General user'}
Number of Items: ${number_of_items || 5}`
      }
    ];

    const result = await callOpenRouter(messages);
    let generatedContent = result.choices[0].message.content;
    const tokensUsed = result.usage?.total_tokens || 0;

    try {
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedContent = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {}

    // Save to database
    try {
      const name = typeof generatedContent === 'object' ? generatedContent.name : checklist_type;
      const description = typeof generatedContent === 'object' ? generatedContent.description : null;
      const items = typeof generatedContent === 'object' ? JSON.stringify(generatedContent.items) : null;
      const suggestions = typeof generatedContent === 'object' ? generatedContent.suggestions : null;
      const totalItems = typeof generatedContent === 'object' && Array.isArray(generatedContent.items) ? generatedContent.items.length : 0;
      await pool.query(
        `INSERT INTO ai_checklists (name, description, checklist_type, items, ai_suggestions, total_items, ai_generated)
         VALUES ($1, $2, $3, $4, $5, $6, true)`,
        [name, description, checklist_type, items, suggestions, totalItems]
      );
    } catch (dbErr) {
      console.error('Error saving checklist to DB:', dbErr.message);
    }

    res.json({ checklist: generatedContent, tokensUsed, model: OPENROUTER_MODEL });
  } catch (error) {
    console.error('Error generating AI checklist:', error);
    res.status(500).json({ error: error.message || 'Failed to generate checklist' });
  }
};

// 15. AI Progress Analysis
const analyzeProgress = async (req, res) => {
  try {
    const { user_name, goal_type, goal_description, current_value, target_value, start_date, milestones_completed } = req.body;

    const messages = [
      {
        role: 'system',
        content: `You are "Dr. Elena Vasquez," a Performance Analytics Director with 16 years of experience building goal-tracking systems at OKR platforms (Lattice, 15Five, Culture Amp). You've coached 5,000+ professionals on goal achievement and hold a PhD in Organizational Behavior.

BEHAVIORAL INSTRUCTIONS:
1. Calculate precise progress percentage from the provided current/target values.
2. Determine trend direction based on milestones completed and time elapsed since start.
3. Provide insights that explain WHY the trend is what it is, not just what it is.
4. Give 3-5 specific, actionable recommendations tailored to the goal type and current progress.
5. Identify risk factors that could derail progress and suggest mitigations.
6. Project a realistic completion date based on current trajectory.
7. End with a genuine, personalized motivation message — not generic cheerleading.

OUTPUT FORMAT — return ONLY valid JSON, no markdown fences:
{
  "progress_percentage": 65,
  "trend": "improving | stable | declining",
  "insights": "detailed analysis of progress trajectory",
  "recommendations": ["specific recommendation 1", "specific recommendation 2"],
  "risk_factors": ["risk 1 with mitigation", "risk 2 with mitigation"],
  "next_milestones": ["next milestone 1", "next milestone 2"],
  "projected_completion": "estimated completion date",
  "motivation_message": "personalized encouragement based on actual progress"
}

QUALITY CRITERIA:
- Progress percentage must match the math (current_value / target_value * 100)
- Trend must be justified by the data, not assumed
- Recommendations must be specific to this goal type and progress level
- Risk factors must include mitigations, not just problems
- Motivation message must reference the person's specific situation and achievements`
      },
      {
        role: 'user',
        content: `Analyze this progress:
User: ${user_name}
Goal Type: ${goal_type}
Goal: ${goal_description}
Current: ${current_value}
Target: ${target_value}
Start Date: ${start_date}
Milestones Completed: ${JSON.stringify(milestones_completed || [])}`
      }
    ];

    const result = await callOpenRouter(messages);
    let generatedContent = result.choices[0].message.content;
    const tokensUsed = result.usage?.total_tokens || 0;

    try {
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedContent = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {}

    // Save to database
    try {
      const progressPct = typeof generatedContent === 'object' ? generatedContent.progress_percentage : null;
      const trend = typeof generatedContent === 'object' ? generatedContent.trend : null;
      const insights = typeof generatedContent === 'object' ? generatedContent.insights : null;
      const recommendations = typeof generatedContent === 'object' ? JSON.stringify(generatedContent.recommendations) : null;
      const milestones = typeof generatedContent === 'object' ? JSON.stringify(generatedContent.next_milestones) : null;
      await pool.query(
        `INSERT INTO ai_progress (user_name, goal_type, goal_description, current_value, target_value, progress_percentage, ai_insights, ai_recommendations, milestones, trend)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [user_name, goal_type, goal_description, current_value || 0, target_value, progressPct, insights, recommendations, milestones, trend]
      );
    } catch (dbErr) {
      console.error('Error saving progress analysis to DB:', dbErr.message);
    }

    res.json({ analysis: generatedContent, tokensUsed, model: OPENROUTER_MODEL });
  } catch (error) {
    console.error('Error analyzing progress:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze progress' });
  }
};

module.exports = {
  generateWelcomeMessage,
  generateFlowSteps,
  generateTooltipContent,
  generateChecklistItems,
  generateNotificationCopy,
  generateEmailSequence,
  improveContent,
  generateABVariants,
  analyzeFlow,
  analyzePTORequest,
  findMentorMatch,
  analyzeFeedback,
  generateTrainingPlan,
  generateAIChecklist,
  analyzeProgress
};
