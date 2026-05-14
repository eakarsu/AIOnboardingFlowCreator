const pool = require('./database');

const createTables = async () => {
  const queries = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      department VARCHAR(100),
      position VARCHAR(100),
      skills JSONB,
      avatar VARCHAR(500),
      reset_token VARCHAR(255),
      reset_token_expires TIMESTAMP,
      email_verified BOOLEAN DEFAULT false,
      verification_token VARCHAR(255),
      verification_token_expires TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Onboarding Flows table
    `CREATE TABLE IF NOT EXISTS onboarding_flows (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(50) DEFAULT 'draft',
      target_audience VARCHAR(255),
      trigger_event VARCHAR(255),
      created_by INTEGER REFERENCES users(id),
      total_steps INTEGER DEFAULT 0,
      completion_rate DECIMAL(5,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Flow Steps table
    `CREATE TABLE IF NOT EXISTS flow_steps (
      id SERIAL PRIMARY KEY,
      flow_id INTEGER REFERENCES onboarding_flows(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      step_type VARCHAR(50) NOT NULL,
      step_order INTEGER NOT NULL,
      element_selector VARCHAR(500),
      position VARCHAR(50),
      action_type VARCHAR(50),
      action_config JSONB,
      is_required BOOLEAN DEFAULT true,
      delay_seconds INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // User Segments table
    `CREATE TABLE IF NOT EXISTS user_segments (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      criteria JSONB,
      user_count INTEGER DEFAULT 0,
      status VARCHAR(50) DEFAULT 'active',
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Templates table
    `CREATE TABLE IF NOT EXISTS templates (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      thumbnail VARCHAR(500),
      content JSONB,
      is_premium BOOLEAN DEFAULT false,
      usage_count INTEGER DEFAULT 0,
      rating DECIMAL(3,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // AI Generated Content table
    `CREATE TABLE IF NOT EXISTS ai_content (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content_type VARCHAR(100) NOT NULL,
      prompt TEXT,
      generated_content TEXT,
      model_used VARCHAR(100),
      tokens_used INTEGER DEFAULT 0,
      status VARCHAR(50) DEFAULT 'completed',
      flow_id INTEGER REFERENCES onboarding_flows(id),
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Analytics table
    `CREATE TABLE IF NOT EXISTS analytics (
      id SERIAL PRIMARY KEY,
      flow_id INTEGER REFERENCES onboarding_flows(id),
      metric_name VARCHAR(100) NOT NULL,
      metric_value DECIMAL(15,2),
      dimension VARCHAR(100),
      dimension_value VARCHAR(255),
      date DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Integrations table
    `CREATE TABLE IF NOT EXISTS integrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      provider VARCHAR(100) NOT NULL,
      description TEXT,
      icon VARCHAR(500),
      status VARCHAR(50) DEFAULT 'inactive',
      config JSONB,
      api_key_encrypted VARCHAR(500),
      last_synced TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Tooltips table
    `CREATE TABLE IF NOT EXISTS tooltips (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      element_selector VARCHAR(500) NOT NULL,
      position VARCHAR(50) DEFAULT 'top',
      trigger_type VARCHAR(50) DEFAULT 'hover',
      style_config JSONB,
      flow_id INTEGER REFERENCES onboarding_flows(id),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Checklists table
    `CREATE TABLE IF NOT EXISTS checklists (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      items JSONB,
      flow_id INTEGER REFERENCES onboarding_flows(id),
      completion_action VARCHAR(255),
      display_position VARCHAR(50) DEFAULT 'bottom-right',
      is_dismissible BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Progress Tracking table
    `CREATE TABLE IF NOT EXISTS progress_tracking (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      flow_id INTEGER REFERENCES onboarding_flows(id),
      current_step INTEGER DEFAULT 0,
      total_steps INTEGER DEFAULT 0,
      percentage_complete DECIMAL(5,2) DEFAULT 0,
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP,
      last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // A/B Tests table
    `CREATE TABLE IF NOT EXISTS ab_tests (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      flow_id INTEGER REFERENCES onboarding_flows(id),
      variant_a_config JSONB,
      variant_b_config JSONB,
      traffic_split INTEGER DEFAULT 50,
      status VARCHAR(50) DEFAULT 'draft',
      winner VARCHAR(10),
      start_date TIMESTAMP,
      end_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Triggers table
    `CREATE TABLE IF NOT EXISTS triggers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      event_type VARCHAR(100) NOT NULL,
      conditions JSONB,
      actions JSONB,
      flow_id INTEGER REFERENCES onboarding_flows(id),
      is_active BOOLEAN DEFAULT true,
      fire_count INTEGER DEFAULT 0,
      last_fired TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Personalization Rules table
    `CREATE TABLE IF NOT EXISTS personalization_rules (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      rule_type VARCHAR(100) NOT NULL,
      conditions JSONB,
      content_variations JSONB,
      priority INTEGER DEFAULT 0,
      segment_id INTEGER REFERENCES user_segments(id),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Notifications table
    `CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      notification_type VARCHAR(50) NOT NULL,
      channel VARCHAR(50) DEFAULT 'in-app',
      target_segment_id INTEGER REFERENCES user_segments(id),
      schedule_time TIMESTAMP,
      status VARCHAR(50) DEFAULT 'draft',
      sent_count INTEGER DEFAULT 0,
      open_rate DECIMAL(5,2) DEFAULT 0,
      click_rate DECIMAL(5,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // ============ NEW AI FEATURE TABLES ============

    // PTO (Paid Time Off) Requests table for AI PTO Scheduler
    `CREATE TABLE IF NOT EXISTS pto_requests (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER REFERENCES users(id),
      employee_name VARCHAR(255) NOT NULL,
      department VARCHAR(100),
      request_type VARCHAR(50) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      days_requested INTEGER NOT NULL,
      reason TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      ai_recommendation TEXT,
      ai_approval_score DECIMAL(5,2),
      approved_by INTEGER REFERENCES users(id),
      approved_at TIMESTAMP,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Mentor Matching table for AI Mentor Matcher
    `CREATE TABLE IF NOT EXISTS mentor_matches (
      id SERIAL PRIMARY KEY,
      mentee_id INTEGER REFERENCES users(id),
      mentee_name VARCHAR(255) NOT NULL,
      mentor_id INTEGER REFERENCES users(id),
      mentor_name VARCHAR(255),
      department VARCHAR(100),
      skills_to_develop JSONB,
      matching_score DECIMAL(5,2),
      match_reason TEXT,
      ai_recommendation TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      session_count INTEGER DEFAULT 0,
      last_session_date TIMESTAMP,
      feedback_score DECIMAL(3,2),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Feedback table for AI Feedback Collector
    `CREATE TABLE IF NOT EXISTS feedback (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      user_name VARCHAR(255) NOT NULL,
      feedback_type VARCHAR(100) NOT NULL,
      category VARCHAR(100),
      subject VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      sentiment VARCHAR(50),
      sentiment_score DECIMAL(5,2),
      ai_analysis TEXT,
      ai_action_items JSONB,
      priority VARCHAR(50) DEFAULT 'medium',
      status VARCHAR(50) DEFAULT 'new',
      assigned_to INTEGER REFERENCES users(id),
      resolved_at TIMESTAMP,
      response TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Training Recommendations table for AI Training Recommender
    `CREATE TABLE IF NOT EXISTS training_recommendations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      user_name VARCHAR(255) NOT NULL,
      "current_role" VARCHAR(500),
      "target_role" VARCHAR(500),
      skill_gap JSONB,
      recommended_courses JSONB,
      ai_learning_path TEXT,
      priority VARCHAR(50) DEFAULT 'medium',
      estimated_duration VARCHAR(500),
      completion_percentage DECIMAL(5,2) DEFAULT 0,
      status VARCHAR(50) DEFAULT 'pending',
      started_at TIMESTAMP,
      completed_at TIMESTAMP,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // AI Checklists table - enhanced version
    `CREATE TABLE IF NOT EXISTS ai_checklists (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      user_id INTEGER REFERENCES users(id),
      user_name VARCHAR(255),
      checklist_type VARCHAR(100) NOT NULL,
      items JSONB,
      ai_generated BOOLEAN DEFAULT true,
      ai_suggestions TEXT,
      total_items INTEGER DEFAULT 0,
      completed_items INTEGER DEFAULT 0,
      completion_percentage DECIMAL(5,2) DEFAULT 0,
      due_date DATE,
      priority VARCHAR(50) DEFAULT 'medium',
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // AI Progress Records - enhanced progress tracking
    `CREATE TABLE IF NOT EXISTS ai_progress (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      user_name VARCHAR(255) NOT NULL,
      goal_type VARCHAR(100) NOT NULL,
      goal_description TEXT,
      current_value DECIMAL(10,2) DEFAULT 0,
      target_value DECIMAL(10,2) NOT NULL,
      progress_percentage DECIMAL(5,2) DEFAULT 0,
      ai_insights TEXT,
      ai_recommendations JSONB,
      milestones JSONB,
      trend VARCHAR(50) DEFAULT 'stable',
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      target_date DATE,
      status VARCHAR(50) DEFAULT 'in_progress',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Agencies table for multi-tenant isolation
    `CREATE TABLE IF NOT EXISTS agencies (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      site_key VARCHAR(255) UNIQUE NOT NULL,
      plan VARCHAR(50) DEFAULT 'free',
      settings JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Add agency_id to users if not exists
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS agency_id INTEGER REFERENCES agencies(id)`,

    // Add agency_id to onboarding_flows if not exists
    `ALTER TABLE onboarding_flows ADD COLUMN IF NOT EXISTS agency_id INTEGER REFERENCES agencies(id)`,

    // Add site_key to onboarding_flows for SDK lookup
    `ALTER TABLE onboarding_flows ADD COLUMN IF NOT EXISTS site_key VARCHAR(255)`,

    // Events table for real-time event ingestion
    `CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      site_key VARCHAR(255) NOT NULL,
      agency_id INTEGER REFERENCES agencies(id),
      event_type VARCHAR(100) NOT NULL,
      user_id VARCHAR(255),
      properties JSONB,
      flow_id INTEGER REFERENCES onboarding_flows(id),
      step_id INTEGER REFERENCES flow_steps(id),
      triggered_trigger_ids INTEGER[],
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Index for fast event lookups
    `CREATE INDEX IF NOT EXISTS idx_events_site_key ON events(site_key)`,
    `CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at)`,
    `CREATE INDEX IF NOT EXISTS idx_progress_flow_step ON progress_tracking(flow_id, current_step)`,

    // Unique constraint required for the ON CONFLICT upsert in the SDK event recorder
    `ALTER TABLE progress_tracking ADD CONSTRAINT IF NOT EXISTS uq_progress_user_flow UNIQUE (user_id, flow_id)`,

    // Index for agency-scoped flow lookups
    `CREATE INDEX IF NOT EXISTS idx_flows_agency_id ON onboarding_flows(agency_id)`,
    `CREATE INDEX IF NOT EXISTS idx_flows_site_key ON onboarding_flows(site_key)`
  ];

  for (const query of queries) {
    try {
      await pool.query(query);
    } catch (error) {
      console.error('Error creating table:', error.message);
    }
  }

  console.log('All tables created successfully');
};

module.exports = { createTables };
