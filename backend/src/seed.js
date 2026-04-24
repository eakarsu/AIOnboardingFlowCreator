const pool = require('./config/database');
const bcrypt = require('bcryptjs');
const { createTables } = require('./config/schema');

const seedDatabase = async () => {
  try {
    console.log('Creating tables...');
    await createTables();

    console.log('Clearing existing data...');
    await pool.query(`
      DROP TABLE IF EXISTS ai_progress CASCADE;
      DROP TABLE IF EXISTS ai_checklists CASCADE;
      DROP TABLE IF EXISTS training_recommendations CASCADE;
      DROP TABLE IF EXISTS feedback CASCADE;
      DROP TABLE IF EXISTS mentor_matches CASCADE;
      DROP TABLE IF EXISTS pto_requests CASCADE;
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS personalization_rules CASCADE;
      DROP TABLE IF EXISTS triggers CASCADE;
      DROP TABLE IF EXISTS ab_tests CASCADE;
      DROP TABLE IF EXISTS progress_tracking CASCADE;
      DROP TABLE IF EXISTS checklists CASCADE;
      DROP TABLE IF EXISTS tooltips CASCADE;
      DROP TABLE IF EXISTS integrations CASCADE;
      DROP TABLE IF EXISTS analytics CASCADE;
      DROP TABLE IF EXISTS ai_content CASCADE;
      DROP TABLE IF EXISTS templates CASCADE;
      DROP TABLE IF EXISTS user_segments CASCADE;
      DROP TABLE IF EXISTS flow_steps CASCADE;
      DROP TABLE IF EXISTS onboarding_flows CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    await createTables();

    // Seed Users (15 items)
    console.log('Seeding users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = [
      { email: 'admin@onboardflow.com', name: 'Admin User', role: 'admin', department: 'IT', position: 'System Admin' },
      { email: 'demo@onboardflow.com', name: 'Demo User', role: 'user', department: 'Engineering', position: 'Developer' },
      { email: 'john.doe@example.com', name: 'John Doe', role: 'user', department: 'Engineering', position: 'Senior Developer' },
      { email: 'jane.smith@example.com', name: 'Jane Smith', role: 'manager', department: 'HR', position: 'HR Manager' },
      { email: 'mike.wilson@example.com', name: 'Mike Wilson', role: 'user', department: 'Sales', position: 'Sales Rep' },
      { email: 'sarah.jones@example.com', name: 'Sarah Jones', role: 'user', department: 'Marketing', position: 'Marketing Specialist' },
      { email: 'david.brown@example.com', name: 'David Brown', role: 'manager', department: 'Engineering', position: 'Tech Lead' },
      { email: 'emily.davis@example.com', name: 'Emily Davis', role: 'user', department: 'Design', position: 'UX Designer' },
      { email: 'chris.miller@example.com', name: 'Chris Miller', role: 'user', department: 'Support', position: 'Support Agent' },
      { email: 'lisa.taylor@example.com', name: 'Lisa Taylor', role: 'user', department: 'Finance', position: 'Accountant' },
      { email: 'james.anderson@example.com', name: 'James Anderson', role: 'admin', department: 'IT', position: 'CTO' },
      { email: 'amy.thomas@example.com', name: 'Amy Thomas', role: 'user', department: 'Product', position: 'Product Manager' },
      { email: 'robert.jackson@example.com', name: 'Robert Jackson', role: 'user', department: 'Engineering', position: 'Junior Developer' },
      { email: 'jennifer.white@example.com', name: 'Jennifer White', role: 'manager', department: 'Operations', position: 'Ops Manager' },
      { email: 'william.harris@example.com', name: 'William Harris', role: 'user', department: 'Legal', position: 'Legal Counsel' }
    ];

    for (const user of users) {
      await pool.query(
        'INSERT INTO users (email, password, name, role, department, position, email_verified) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [user.email, hashedPassword, user.name, user.role, user.department, user.position, true]
      );
    }

    // Seed Onboarding Flows (15 items)
    console.log('Seeding onboarding flows...');
    const flows = [
      { name: 'New User Welcome Flow', description: 'Comprehensive onboarding for new users', status: 'active', target_audience: 'New Users', trigger_event: 'user_signup', total_steps: 5, completion_rate: 78.5 },
      { name: 'Premium Feature Tour', description: 'Showcase premium features to trial users', status: 'active', target_audience: 'Trial Users', trigger_event: 'trial_start', total_steps: 8, completion_rate: 65.2 },
      { name: 'Dashboard Overview', description: 'Guide users through dashboard features', status: 'active', target_audience: 'All Users', trigger_event: 'first_login', total_steps: 6, completion_rate: 82.1 },
      { name: 'API Integration Setup', description: 'API integration process walkthrough', status: 'draft', target_audience: 'Developers', trigger_event: 'api_key_created', total_steps: 10, completion_rate: 45.8 },
      { name: 'Team Collaboration Guide', description: 'Team collaboration features intro', status: 'active', target_audience: 'Team Admins', trigger_event: 'team_created', total_steps: 7, completion_rate: 71.3 },
      { name: 'Mobile App Quick Start', description: 'Mobile application getting started', status: 'active', target_audience: 'Mobile Users', trigger_event: 'mobile_install', total_steps: 4, completion_rate: 88.9 },
      { name: 'Billing Setup Wizard', description: 'Payment and billing setup guide', status: 'active', target_audience: 'Account Owners', trigger_event: 'billing_access', total_steps: 5, completion_rate: 92.4 },
      { name: 'Custom Reports Training', description: 'Custom reports and analytics', status: 'draft', target_audience: 'Power Users', trigger_event: 'reports_access', total_steps: 12, completion_rate: 38.7 },
      { name: 'Security Best Practices', description: 'Security setup recommendations', status: 'active', target_audience: 'All Users', trigger_event: 'security_settings', total_steps: 6, completion_rate: 67.8 },
      { name: 'Automation Workflow Builder', description: 'Automated workflows step by step', status: 'active', target_audience: 'Advanced Users', trigger_event: 'automation_access', total_steps: 9, completion_rate: 54.2 },
      { name: 'E-commerce Integration', description: 'E-commerce store connection', status: 'draft', target_audience: 'E-commerce Users', trigger_event: 'ecommerce_connect', total_steps: 8, completion_rate: 0 },
      { name: 'Data Import Guide', description: 'Import data from other platforms', status: 'active', target_audience: 'New Users', trigger_event: 'import_start', total_steps: 5, completion_rate: 76.4 },
      { name: 'Notification Settings Tour', description: 'Configure notifications and alerts', status: 'active', target_audience: 'All Users', trigger_event: 'notification_settings', total_steps: 4, completion_rate: 85.3 },
      { name: 'Marketplace Introduction', description: 'App marketplace exploration', status: 'active', target_audience: 'All Users', trigger_event: 'marketplace_visit', total_steps: 6, completion_rate: 62.1 },
      { name: 'Admin Console Mastery', description: 'Admin console features guide', status: 'active', target_audience: 'Admins', trigger_event: 'admin_access', total_steps: 15, completion_rate: 41.9 }
    ];

    for (const flow of flows) {
      await pool.query(
        'INSERT INTO onboarding_flows (name, description, status, target_audience, trigger_event, created_by, total_steps, completion_rate) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [flow.name, flow.description, flow.status, flow.target_audience, flow.trigger_event, 1, flow.total_steps, flow.completion_rate]
      );
    }

    // Seed Flow Steps
    console.log('Seeding flow steps...');
    const steps = [
      { flow_id: 1, title: 'Welcome Message', content: 'Welcome to our platform!', step_type: 'modal', step_order: 1, position: 'center' },
      { flow_id: 1, title: 'Profile Setup', content: 'Complete your profile.', step_type: 'tooltip', step_order: 2, element_selector: '#profile-btn', position: 'bottom' },
      { flow_id: 1, title: 'Dashboard Tour', content: 'Your main dashboard.', step_type: 'spotlight', step_order: 3, element_selector: '.dashboard-main', position: 'right' },
      { flow_id: 1, title: 'Create First Project', content: 'Create your first project.', step_type: 'tooltip', step_order: 4, element_selector: '#new-project-btn', position: 'bottom' },
      { flow_id: 1, title: 'Completion', content: 'Great job completing onboarding!', step_type: 'modal', step_order: 5, position: 'center' },
      { flow_id: 2, title: 'Premium Features Intro', content: 'Discover premium features.', step_type: 'modal', step_order: 1, position: 'center' },
      { flow_id: 2, title: 'Advanced Analytics', content: 'Access detailed analytics.', step_type: 'spotlight', step_order: 2, element_selector: '#analytics-tab', position: 'right' },
      { flow_id: 3, title: 'Dashboard Welcome', content: 'Your dashboard overview.', step_type: 'modal', step_order: 1, position: 'center' },
      { flow_id: 3, title: 'Quick Actions', content: 'Frequently used actions.', step_type: 'tooltip', step_order: 2, element_selector: '.quick-actions', position: 'left' },
      { flow_id: 4, title: 'API Key Generation', content: 'Generate your API key.', step_type: 'tooltip', step_order: 1, element_selector: '#generate-key', position: 'bottom' },
      { flow_id: 5, title: 'Team Settings', content: 'Configure team settings.', step_type: 'modal', step_order: 1, position: 'center' },
      { flow_id: 5, title: 'Invite Members', content: 'Add team members.', step_type: 'tooltip', step_order: 2, element_selector: '#invite-btn', position: 'bottom' },
      { flow_id: 6, title: 'App Features', content: 'Mobile app features.', step_type: 'modal', step_order: 1, position: 'center' },
      { flow_id: 7, title: 'Payment Setup', content: 'Add payment method.', step_type: 'modal', step_order: 1, position: 'center' },
      { flow_id: 8, title: 'Reports Intro', content: 'Custom reports intro.', step_type: 'modal', step_order: 1, position: 'center' }
    ];

    for (const step of steps) {
      await pool.query(
        'INSERT INTO flow_steps (flow_id, title, content, step_type, step_order, element_selector, position) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [step.flow_id, step.title, step.content, step.step_type, step.step_order, step.element_selector || null, step.position]
      );
    }

    // Seed User Segments (15 items)
    console.log('Seeding user segments...');
    const segments = [
      { name: 'New Users', description: 'Users who signed up in the last 7 days', criteria: { days_since_signup: 7 }, user_count: 1250, status: 'active' },
      { name: 'Power Users', description: 'Users with high engagement levels', criteria: { sessions_per_week: { min: 10 } }, user_count: 340, status: 'active' },
      { name: 'Trial Users', description: 'Users on trial period', criteria: { subscription: 'trial' }, user_count: 890, status: 'active' },
      { name: 'Enterprise Accounts', description: 'Enterprise tier customers', criteria: { plan: 'enterprise' }, user_count: 45, status: 'active' },
      { name: 'Churned Users', description: 'Users who cancelled', criteria: { status: 'churned' }, user_count: 234, status: 'active' },
      { name: 'Mobile Only', description: 'Mobile app only users', criteria: { platform: 'mobile_only' }, user_count: 567, status: 'active' },
      { name: 'API Heavy Users', description: '1000+ API calls daily', criteria: { api_calls_daily: { min: 1000 } }, user_count: 89, status: 'active' },
      { name: 'Inactive 30 Days', description: 'Inactive for 30+ days', criteria: { days_inactive: { min: 30 } }, user_count: 1456, status: 'active' },
      { name: 'Feature Early Adopters', description: 'Try new features first', criteria: { beta_features: true }, user_count: 234, status: 'active' },
      { name: 'High Value Customers', description: 'MRR > $500', criteria: { mrr: { min: 500 } }, user_count: 78, status: 'active' },
      { name: 'Small Teams', description: 'Teams with 2-5 members', criteria: { team_size: { min: 2, max: 5 } }, user_count: 445, status: 'active' },
      { name: 'Large Teams', description: 'Teams with 20+ members', criteria: { team_size: { min: 20 } }, user_count: 67, status: 'active' },
      { name: 'US Customers', description: 'Located in United States', criteria: { country: 'US' }, user_count: 2340, status: 'active' },
      { name: 'EU Customers', description: 'Located in European Union', criteria: { region: 'EU' }, user_count: 1890, status: 'active' },
      { name: 'Free Tier', description: 'Users on free plan', criteria: { plan: 'free' }, user_count: 5670, status: 'active' }
    ];

    for (const segment of segments) {
      await pool.query(
        'INSERT INTO user_segments (name, description, criteria, user_count, status, created_by) VALUES ($1, $2, $3, $4, $5, $6)',
        [segment.name, segment.description, JSON.stringify(segment.criteria), segment.user_count, segment.status, 1]
      );
    }

    // Seed Templates (15 items)
    console.log('Seeding templates...');
    const templates = [
      { name: 'SaaS Welcome Flow', description: 'Perfect for SaaS applications', category: 'Welcome', is_premium: false, usage_count: 1234, rating: 4.8 },
      { name: 'E-commerce Onboarding', description: 'Guide customers through store', category: 'E-commerce', is_premium: true, usage_count: 890, rating: 4.6 },
      { name: 'Mobile App Introduction', description: 'Mobile-first onboarding', category: 'Mobile', is_premium: false, usage_count: 2345, rating: 4.9 },
      { name: 'Developer API Quickstart', description: 'Technical developer onboarding', category: 'Developer', is_premium: true, usage_count: 456, rating: 4.7 },
      { name: 'Team Collaboration Setup', description: 'Onboard entire teams', category: 'Team', is_premium: true, usage_count: 678, rating: 4.5 },
      { name: 'Freemium to Premium', description: 'Convert free to paid users', category: 'Conversion', is_premium: true, usage_count: 789, rating: 4.4 },
      { name: 'Feature Announcement', description: 'Announce new features', category: 'Features', is_premium: false, usage_count: 1567, rating: 4.6 },
      { name: 'Trial Extension Offer', description: 'Encourage trial extension', category: 'Retention', is_premium: false, usage_count: 345, rating: 4.3 },
      { name: 'Dashboard Tutorial', description: 'Interactive dashboard walkthrough', category: 'Tutorial', is_premium: false, usage_count: 2890, rating: 4.8 },
      { name: 'Settings Configuration', description: 'Guide through settings', category: 'Configuration', is_premium: false, usage_count: 1234, rating: 4.2 },
      { name: 'Security Setup Guide', description: 'Secure user accounts', category: 'Security', is_premium: true, usage_count: 567, rating: 4.9 },
      { name: 'Integration Wizard', description: 'Connect integrations', category: 'Integration', is_premium: true, usage_count: 890, rating: 4.7 },
      { name: 'Billing Walkthrough', description: 'Explain billing options', category: 'Billing', is_premium: false, usage_count: 456, rating: 4.1 },
      { name: 'Feedback Collection', description: 'Gather user feedback', category: 'Feedback', is_premium: false, usage_count: 678, rating: 4.5 },
      { name: 'Admin Console Guide', description: 'Comprehensive admin training', category: 'Admin', is_premium: true, usage_count: 234, rating: 4.6 }
    ];

    for (const template of templates) {
      await pool.query(
        'INSERT INTO templates (name, description, category, is_premium, usage_count, rating, content) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [template.name, template.description, template.category, template.is_premium, template.usage_count, template.rating, JSON.stringify({ steps: [], settings: {} })]
      );
    }

    // Seed AI Content (15 items)
    console.log('Seeding AI content...');
    const aiContents = [
      { title: 'Welcome Message for New Users', content_type: 'welcome_message', prompt: 'Generate a friendly welcome message', generated_content: 'Welcome aboard! We are thrilled to have you join our community.', model_used: 'claude-haiku', tokens_used: 150, status: 'completed' },
      { title: 'Feature Tour Script', content_type: 'tour_script', prompt: 'Create a product feature tour script', generated_content: 'Step 1: Dashboard Overview - Your command center...', model_used: 'claude-haiku', tokens_used: 450, status: 'completed' },
      { title: 'Onboarding Email Sequence', content_type: 'email_sequence', prompt: 'Write a 5-email onboarding sequence', generated_content: 'Email 1: Welcome to the family!', model_used: 'claude-haiku', tokens_used: 890, status: 'completed' },
      { title: 'Tooltip Content Pack', content_type: 'tooltips', prompt: 'Generate helpful tooltip messages', generated_content: 'Analytics: Track your performance metrics...', model_used: 'claude-haiku', tokens_used: 320, status: 'completed' },
      { title: 'Error Message Improvements', content_type: 'error_messages', prompt: 'Rewrite error messages to be friendly', generated_content: 'Oops! Something went wrong. Please try again.', model_used: 'claude-haiku', tokens_used: 210, status: 'completed' },
      { title: 'Checklist Items for Setup', content_type: 'checklist', prompt: 'Create a comprehensive setup checklist', generated_content: '1. Complete your profile\n2. Connect integration...', model_used: 'claude-haiku', tokens_used: 180, status: 'completed' },
      { title: 'Push Notification Copy', content_type: 'notifications', prompt: 'Write engaging push notification copy', generated_content: 'You are almost there! Complete your setup.', model_used: 'claude-haiku', tokens_used: 95, status: 'completed' },
      { title: 'Success Celebration Messages', content_type: 'celebrations', prompt: 'Create celebration messages', generated_content: 'Congratulations! You completed your first week.', model_used: 'claude-haiku', tokens_used: 120, status: 'completed' },
      { title: 'Help Article Summaries', content_type: 'help_content', prompt: 'Summarize help articles', generated_content: 'Quick tip: Use keyboard shortcuts to navigate faster.', model_used: 'claude-haiku', tokens_used: 280, status: 'completed' },
      { title: 'Upsell Message for Premium', content_type: 'upsell', prompt: 'Create upsell messages', generated_content: 'Unlock advanced analytics with our Pro plan.', model_used: 'claude-haiku', tokens_used: 165, status: 'completed' },
      { title: 'Survey Questions', content_type: 'survey', prompt: 'Generate survey questions', generated_content: 'How would you rate your onboarding experience?', model_used: 'claude-haiku', tokens_used: 140, status: 'completed' },
      { title: 'Video Script for Tutorial', content_type: 'video_script', prompt: 'Write a tutorial video script', generated_content: 'Hi there! In this quick tutorial...', model_used: 'claude-haiku', tokens_used: 520, status: 'completed' },
      { title: 'Chatbot Responses', content_type: 'chatbot', prompt: 'Create chatbot responses', generated_content: 'I can help you with that!', model_used: 'claude-haiku', tokens_used: 380, status: 'completed' },
      { title: 'Loading Screen Tips', content_type: 'loading_tips', prompt: 'Write tips for loading screens', generated_content: 'Did you know? You can customize your dashboard.', model_used: 'claude-haiku', tokens_used: 75, status: 'completed' },
      { title: 'Goodbye Messages', content_type: 'farewell', prompt: 'Create friendly exit messages', generated_content: 'Thanks for stopping by! See you again soon.', model_used: 'claude-haiku', tokens_used: 60, status: 'completed' }
    ];

    for (const content of aiContents) {
      await pool.query(
        'INSERT INTO ai_content (title, content_type, prompt, generated_content, model_used, tokens_used, status, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [content.title, content.content_type, content.prompt, content.generated_content, content.model_used, content.tokens_used, content.status, 1]
      );
    }

    // Seed Analytics (15 items)
    console.log('Seeding analytics...');
    const analyticsData = [
      { flow_id: 1, metric_name: 'completion_rate', metric_value: 78.5, dimension: 'overall', dimension_value: 'all' },
      { flow_id: 1, metric_name: 'drop_off_step', metric_value: 3, dimension: 'step', dimension_value: 'Dashboard Tour' },
      { flow_id: 1, metric_name: 'avg_time_seconds', metric_value: 145, dimension: 'overall', dimension_value: 'all' },
      { flow_id: 2, metric_name: 'completion_rate', metric_value: 65.2, dimension: 'overall', dimension_value: 'all' },
      { flow_id: 2, metric_name: 'conversions', metric_value: 234, dimension: 'monthly', dimension_value: 'January' },
      { flow_id: 3, metric_name: 'completion_rate', metric_value: 82.1, dimension: 'overall', dimension_value: 'all' },
      { flow_id: 3, metric_name: 'user_satisfaction', metric_value: 4.5, dimension: 'rating', dimension_value: 'survey' },
      { flow_id: 4, metric_name: 'completion_rate', metric_value: 45.8, dimension: 'overall', dimension_value: 'all' },
      { flow_id: 5, metric_name: 'completion_rate', metric_value: 71.3, dimension: 'overall', dimension_value: 'all' },
      { flow_id: 5, metric_name: 'team_adoption', metric_value: 89, dimension: 'percentage', dimension_value: 'members' },
      { flow_id: 6, metric_name: 'completion_rate', metric_value: 88.9, dimension: 'overall', dimension_value: 'all' },
      { flow_id: 7, metric_name: 'completion_rate', metric_value: 92.4, dimension: 'overall', dimension_value: 'all' },
      { flow_id: 8, metric_name: 'completion_rate', metric_value: 38.7, dimension: 'overall', dimension_value: 'all' },
      { flow_id: 9, metric_name: 'completion_rate', metric_value: 67.8, dimension: 'overall', dimension_value: 'all' },
      { flow_id: 10, metric_name: 'completion_rate', metric_value: 54.2, dimension: 'overall', dimension_value: 'all' }
    ];

    for (const analytic of analyticsData) {
      await pool.query(
        'INSERT INTO analytics (flow_id, metric_name, metric_value, dimension, dimension_value) VALUES ($1, $2, $3, $4, $5)',
        [analytic.flow_id, analytic.metric_name, analytic.metric_value, analytic.dimension, analytic.dimension_value]
      );
    }

    // Seed Integrations, Tooltips, Checklists, Progress, AB Tests, Triggers, Personalization, Notifications
    console.log('Seeding integrations...');
    const integrations = [
      { name: 'Slack', provider: 'slack', description: 'Send notifications to Slack', icon: 'slack', status: 'active' },
      { name: 'Segment', provider: 'segment', description: 'Track user events', icon: 'segment', status: 'active' },
      { name: 'Intercom', provider: 'intercom', description: 'User communication sync', icon: 'intercom', status: 'active' },
      { name: 'HubSpot', provider: 'hubspot', description: 'Connect with HubSpot CRM', icon: 'hubspot', status: 'inactive' },
      { name: 'Salesforce', provider: 'salesforce', description: 'Sync with Salesforce', icon: 'salesforce', status: 'inactive' },
      { name: 'Mixpanel', provider: 'mixpanel', description: 'Advanced analytics', icon: 'mixpanel', status: 'active' },
      { name: 'Amplitude', provider: 'amplitude', description: 'Product analytics', icon: 'amplitude', status: 'inactive' },
      { name: 'Zapier', provider: 'zapier', description: 'Connect with 3000+ apps', icon: 'zapier', status: 'active' },
      { name: 'Google Analytics', provider: 'google_analytics', description: 'Track in GA', icon: 'google', status: 'active' },
      { name: 'Zendesk', provider: 'zendesk', description: 'Support tickets', icon: 'zendesk', status: 'inactive' },
      { name: 'Mailchimp', provider: 'mailchimp', description: 'Email marketing', icon: 'mailchimp', status: 'active' },
      { name: 'Stripe', provider: 'stripe', description: 'Track payment events', icon: 'stripe', status: 'active' },
      { name: 'GitHub', provider: 'github', description: 'Developer onboarding', icon: 'github', status: 'inactive' },
      { name: 'Jira', provider: 'jira', description: 'Create tasks from feedback', icon: 'jira', status: 'inactive' },
      { name: 'Notion', provider: 'notion', description: 'Sync with Notion', icon: 'notion', status: 'active' }
    ];

    for (const integration of integrations) {
      await pool.query(
        'INSERT INTO integrations (name, provider, description, icon, status) VALUES ($1, $2, $3, $4, $5)',
        [integration.name, integration.provider, integration.description, integration.icon, integration.status]
      );
    }

    // Seed Tooltips (15 items)
    console.log('Seeding tooltips...');
    const tooltips = [
      { title: 'Dashboard Overview', content: 'This is your main dashboard.', element_selector: '#dashboard-main', position: 'bottom', trigger_type: 'hover', flow_id: 1 },
      { title: 'Quick Actions', content: 'Access frequently used actions.', element_selector: '.quick-actions-menu', position: 'right', trigger_type: 'click', flow_id: 1 },
      { title: 'Analytics Tab', content: 'View detailed analytics.', element_selector: '#analytics-tab', position: 'bottom', trigger_type: 'hover', flow_id: 2 },
      { title: 'User Segments', content: 'Create and manage user segments.', element_selector: '#segments-menu', position: 'right', trigger_type: 'hover', flow_id: 3 },
      { title: 'Flow Builder', content: 'Drag and drop to create flows.', element_selector: '.flow-builder', position: 'left', trigger_type: 'hover', flow_id: 1 },
      { title: 'Template Gallery', content: 'Choose from designed templates.', element_selector: '#templates-btn', position: 'bottom', trigger_type: 'click', flow_id: 4 },
      { title: 'AI Assistant', content: 'Let AI help you generate content.', element_selector: '#ai-assistant', position: 'left', trigger_type: 'hover', flow_id: 5 },
      { title: 'Preview Mode', content: 'Test your flow as users see it.', element_selector: '#preview-btn', position: 'top', trigger_type: 'hover', flow_id: 1 },
      { title: 'Publish Flow', content: 'Make your flow live.', element_selector: '#publish-btn', position: 'bottom', trigger_type: 'hover', flow_id: 1 },
      { title: 'Settings', content: 'Configure account settings.', element_selector: '#settings-icon', position: 'left', trigger_type: 'click', flow_id: 6 },
      { title: 'Notifications', content: 'View your notifications.', element_selector: '#notifications-bell', position: 'bottom', trigger_type: 'click', flow_id: 7 },
      { title: 'Team Members', content: 'Manage your team members.', element_selector: '#team-section', position: 'right', trigger_type: 'hover', flow_id: 5 },
      { title: 'Billing Info', content: 'Manage subscription and billing.', element_selector: '#billing-tab', position: 'bottom', trigger_type: 'hover', flow_id: 7 },
      { title: 'API Keys', content: 'Generate and manage API keys.', element_selector: '#api-keys', position: 'left', trigger_type: 'click', flow_id: 4 },
      { title: 'Help Center', content: 'Access documentation and support.', element_selector: '#help-icon', position: 'left', trigger_type: 'hover', flow_id: 1 }
    ];

    for (const tooltip of tooltips) {
      await pool.query(
        'INSERT INTO tooltips (title, content, element_selector, position, trigger_type, flow_id) VALUES ($1, $2, $3, $4, $5, $6)',
        [tooltip.title, tooltip.content, tooltip.element_selector, tooltip.position, tooltip.trigger_type, tooltip.flow_id]
      );
    }

    // Seed Checklists (15 items)
    console.log('Seeding checklists...');
    const checklists = [
      { name: 'New User Setup', description: 'Essential steps for new users', items: [{ id: 1, title: 'Complete profile', done: false }, { id: 2, title: 'Set preferences', done: false }], flow_id: 1, completion_action: 'show_celebration', display_position: 'bottom-right' },
      { name: 'Team Onboarding', description: 'Steps to onboard your team', items: [{ id: 1, title: 'Invite team members', done: false }, { id: 2, title: 'Set up permissions', done: false }], flow_id: 5, completion_action: 'unlock_features', display_position: 'bottom-right' },
      { name: 'Developer Quickstart', description: 'Get developers running quickly', items: [{ id: 1, title: 'Generate API key', done: false }, { id: 2, title: 'Read documentation', done: false }], flow_id: 4, completion_action: 'show_badge', display_position: 'bottom-left' },
      { name: 'Security Hardening', description: 'Secure your account', items: [{ id: 1, title: 'Enable 2FA', done: false }, { id: 2, title: 'Set strong password', done: false }], flow_id: 9, completion_action: 'show_security_badge', display_position: 'top-right' },
      { name: 'First Flow Creation', description: 'Create your first flow', items: [{ id: 1, title: 'Choose template', done: false }, { id: 2, title: 'Customize content', done: false }], flow_id: 1, completion_action: 'show_celebration', display_position: 'bottom-right' },
      { name: 'Integration Setup', description: 'Connect your favorite tools', items: [{ id: 1, title: 'Choose integration', done: false }, { id: 2, title: 'Authenticate', done: false }], flow_id: 14, completion_action: 'show_success', display_position: 'bottom-right' },
      { name: 'Analytics Setup', description: 'Set up tracking', items: [{ id: 1, title: 'Define KPIs', done: false }, { id: 2, title: 'Set up dashboards', done: false }], flow_id: 8, completion_action: 'show_dashboard', display_position: 'bottom-left' },
      { name: 'Mobile App Setup', description: 'Configure mobile app', items: [{ id: 1, title: 'Download app', done: false }, { id: 2, title: 'Sign in', done: false }], flow_id: 6, completion_action: 'show_celebration', display_position: 'center' },
      { name: 'Billing Configuration', description: 'Set up payment', items: [{ id: 1, title: 'Add payment method', done: false }, { id: 2, title: 'Choose plan', done: false }], flow_id: 7, completion_action: 'activate_plan', display_position: 'center' },
      { name: 'Content Creation', description: 'Create your first content', items: [{ id: 1, title: 'Write welcome message', done: false }, { id: 2, title: 'Add tooltips', done: false }], flow_id: 1, completion_action: 'show_preview', display_position: 'bottom-right' },
      { name: 'A/B Test Setup', description: 'Create first experiment', items: [{ id: 1, title: 'Define hypothesis', done: false }, { id: 2, title: 'Create variants', done: false }], flow_id: 1, completion_action: 'start_test', display_position: 'bottom-right' },
      { name: 'Automation Setup', description: 'Set up automated workflows', items: [{ id: 1, title: 'Choose trigger', done: false }, { id: 2, title: 'Define conditions', done: false }], flow_id: 10, completion_action: 'activate_automation', display_position: 'bottom-left' },
      { name: 'User Segment Creation', description: 'Create targeted segments', items: [{ id: 1, title: 'Define criteria', done: false }, { id: 2, title: 'Preview users', done: false }], flow_id: 3, completion_action: 'show_segment', display_position: 'bottom-right' },
      { name: 'Report Setup', description: 'Configure custom reports', items: [{ id: 1, title: 'Choose metrics', done: false }, { id: 2, title: 'Set date range', done: false }], flow_id: 8, completion_action: 'generate_report', display_position: 'bottom-left' },
      { name: 'Personalization Setup', description: 'Create personalized experiences', items: [{ id: 1, title: 'Define rules', done: false }, { id: 2, title: 'Create variations', done: false }], flow_id: 1, completion_action: 'activate_personalization', display_position: 'bottom-right' }
    ];

    for (const checklist of checklists) {
      await pool.query(
        'INSERT INTO checklists (name, description, items, flow_id, completion_action, display_position) VALUES ($1, $2, $3, $4, $5, $6)',
        [checklist.name, checklist.description, JSON.stringify(checklist.items), checklist.flow_id, checklist.completion_action, checklist.display_position]
      );
    }

    // Seed Progress Tracking (15 items)
    console.log('Seeding progress tracking...');
    const progressData = [
      { user_id: 2, flow_id: 1, current_step: 3, total_steps: 5, percentage_complete: 60 },
      { user_id: 3, flow_id: 1, current_step: 5, total_steps: 5, percentage_complete: 100 },
      { user_id: 4, flow_id: 2, current_step: 4, total_steps: 8, percentage_complete: 50 },
      { user_id: 5, flow_id: 3, current_step: 6, total_steps: 6, percentage_complete: 100 },
      { user_id: 6, flow_id: 4, current_step: 2, total_steps: 10, percentage_complete: 20 },
      { user_id: 7, flow_id: 5, current_step: 7, total_steps: 7, percentage_complete: 100 },
      { user_id: 8, flow_id: 6, current_step: 1, total_steps: 4, percentage_complete: 25 },
      { user_id: 9, flow_id: 7, current_step: 5, total_steps: 5, percentage_complete: 100 },
      { user_id: 10, flow_id: 8, current_step: 3, total_steps: 12, percentage_complete: 25 },
      { user_id: 11, flow_id: 9, current_step: 4, total_steps: 6, percentage_complete: 66.67 },
      { user_id: 12, flow_id: 10, current_step: 1, total_steps: 9, percentage_complete: 11.11 },
      { user_id: 13, flow_id: 1, current_step: 2, total_steps: 5, percentage_complete: 40 },
      { user_id: 14, flow_id: 2, current_step: 8, total_steps: 8, percentage_complete: 100 },
      { user_id: 15, flow_id: 3, current_step: 3, total_steps: 6, percentage_complete: 50 },
      { user_id: 2, flow_id: 4, current_step: 10, total_steps: 10, percentage_complete: 100 }
    ];

    for (const progress of progressData) {
      await pool.query(
        'INSERT INTO progress_tracking (user_id, flow_id, current_step, total_steps, percentage_complete) VALUES ($1, $2, $3, $4, $5)',
        [progress.user_id, progress.flow_id, progress.current_step, progress.total_steps, progress.percentage_complete]
      );
    }

    // Seed A/B Tests (15 items)
    console.log('Seeding A/B tests...');
    const abTests = [
      { name: 'Welcome Modal vs Tooltip', description: 'Test modal vs tooltip for welcome', flow_id: 1, variant_a_config: { type: 'modal' }, variant_b_config: { type: 'tooltip' }, traffic_split: 50, status: 'running' },
      { name: 'Short vs Long Tour', description: 'Compare 3-step vs 7-step onboarding', flow_id: 2, variant_a_config: { steps: 3 }, variant_b_config: { steps: 7 }, traffic_split: 50, status: 'running' },
      { name: 'Video vs Text Tutorial', description: 'Test video against text guide', flow_id: 3, variant_a_config: { format: 'video' }, variant_b_config: { format: 'text' }, traffic_split: 50, status: 'completed', winner: 'A' },
      { name: 'Button Color Test', description: 'Test blue vs green CTA buttons', flow_id: 1, variant_a_config: { color: 'blue' }, variant_b_config: { color: 'green' }, traffic_split: 50, status: 'completed', winner: 'B' },
      { name: 'Immediate vs Delayed Start', description: 'Start immediately or after 5 seconds', flow_id: 4, variant_a_config: { delay: 0 }, variant_b_config: { delay: 5000 }, traffic_split: 50, status: 'running' },
      { name: 'Progress Bar Styles', description: 'Test progress bar designs', flow_id: 5, variant_a_config: { style: 'linear' }, variant_b_config: { style: 'circular' }, traffic_split: 50, status: 'draft' },
      { name: 'Gamification Test', description: 'With vs without badges', flow_id: 6, variant_a_config: { gamification: true }, variant_b_config: { gamification: false }, traffic_split: 50, status: 'running' },
      { name: 'Skip Option Test', description: 'Allow skip vs force completion', flow_id: 7, variant_a_config: { skippable: true }, variant_b_config: { skippable: false }, traffic_split: 50, status: 'completed', winner: 'A' },
      { name: 'Personalized vs Generic', description: 'Personalized vs generic content', flow_id: 8, variant_a_config: { personalized: true }, variant_b_config: { personalized: false }, traffic_split: 50, status: 'running' },
      { name: 'Checklist Position', description: 'Bottom-right vs bottom-left', flow_id: 9, variant_a_config: { position: 'bottom-right' }, variant_b_config: { position: 'bottom-left' }, traffic_split: 50, status: 'draft' },
      { name: 'Tone of Voice', description: 'Formal vs casual tone', flow_id: 10, variant_a_config: { tone: 'formal' }, variant_b_config: { tone: 'casual' }, traffic_split: 50, status: 'running' },
      { name: 'Image vs Icon', description: 'Use images or icons in steps', flow_id: 1, variant_a_config: { visual: 'image' }, variant_b_config: { visual: 'icon' }, traffic_split: 50, status: 'completed', winner: 'A' },
      { name: 'Auto-advance vs Manual', description: 'Auto-advance or require click', flow_id: 2, variant_a_config: { auto_advance: true }, variant_b_config: { auto_advance: false }, traffic_split: 50, status: 'running' },
      { name: 'Celebration Style', description: 'Confetti vs simple message', flow_id: 3, variant_a_config: { celebration: 'confetti' }, variant_b_config: { celebration: 'simple' }, traffic_split: 50, status: 'draft' },
      { name: 'Help Button Placement', description: 'Test help button locations', flow_id: 4, variant_a_config: { help_position: 'header' }, variant_b_config: { help_position: 'floating' }, traffic_split: 50, status: 'running' }
    ];

    for (const test of abTests) {
      await pool.query(
        'INSERT INTO ab_tests (name, description, flow_id, variant_a_config, variant_b_config, traffic_split, status, winner) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [test.name, test.description, test.flow_id, JSON.stringify(test.variant_a_config), JSON.stringify(test.variant_b_config), test.traffic_split, test.status, test.winner || null]
      );
    }

    // Seed Triggers (15 items)
    console.log('Seeding triggers...');
    const triggers = [
      { name: 'First Login Trigger', description: 'Trigger on first login', event_type: 'user_login', conditions: { is_first_login: true }, actions: { start_flow: 1 }, flow_id: 1, is_active: true, fire_count: 1250 },
      { name: 'Trial Started', description: 'Start premium tour', event_type: 'trial_start', conditions: {}, actions: { start_flow: 2 }, flow_id: 2, is_active: true, fire_count: 890 },
      { name: 'Feature Access', description: 'Show tooltip for new feature', event_type: 'feature_access', conditions: { feature: 'analytics' }, actions: { show_tooltip: 3 }, flow_id: 3, is_active: true, fire_count: 2340 },
      { name: 'Inactivity Alert', description: 'Show help after 30s inactivity', event_type: 'user_inactive', conditions: { seconds: 30 }, actions: { show_help: true }, flow_id: 1, is_active: true, fire_count: 567 },
      { name: 'Page Visit', description: 'Trigger on page visit', event_type: 'page_view', conditions: { page: '/dashboard' }, actions: { start_flow: 3 }, flow_id: 3, is_active: true, fire_count: 3456 },
      { name: 'Button Click', description: 'Show guide on help button', event_type: 'element_click', conditions: { selector: '#help-btn' }, actions: { show_guide: true }, flow_id: 1, is_active: true, fire_count: 890 },
      { name: 'Form Submission', description: 'Celebrate after form completion', event_type: 'form_submit', conditions: { form_id: 'signup-form' }, actions: { show_celebration: true }, flow_id: 7, is_active: true, fire_count: 1234 },
      { name: 'Error Occurred', description: 'Show help on error', event_type: 'error', conditions: { error_type: 'validation' }, actions: { show_help_tooltip: true }, flow_id: 1, is_active: true, fire_count: 234 },
      { name: 'Scroll Depth', description: 'Show CTA at 50% scroll', event_type: 'scroll', conditions: { depth: 50 }, actions: { show_cta: true }, flow_id: 1, is_active: false, fire_count: 567 },
      { name: 'Time on Page', description: 'Trigger after 60 seconds', event_type: 'time_on_page', conditions: { seconds: 60 }, actions: { show_survey: true }, flow_id: 1, is_active: true, fire_count: 890 },
      { name: 'Exit Intent', description: 'Show offer on exit intent', event_type: 'exit_intent', conditions: {}, actions: { show_offer: true }, flow_id: 2, is_active: true, fire_count: 456 },
      { name: 'User Segment Match', description: 'Trigger for power users', event_type: 'segment_match', conditions: { segment_id: 2 }, actions: { start_flow: 8 }, flow_id: 8, is_active: true, fire_count: 340 },
      { name: 'Milestone Reached', description: 'Celebrate milestone', event_type: 'milestone', conditions: { milestone: 'first_project' }, actions: { show_celebration: true }, flow_id: 1, is_active: true, fire_count: 678 },
      { name: 'Upgrade Click', description: 'Show upgrade benefits', event_type: 'element_click', conditions: { selector: '#upgrade-btn' }, actions: { show_benefits: true }, flow_id: 2, is_active: true, fire_count: 1234 },
      { name: 'Invite Sent', description: 'Show team tips after invite', event_type: 'invite_sent', conditions: {}, actions: { start_flow: 5 }, flow_id: 5, is_active: true, fire_count: 567 }
    ];

    for (const trigger of triggers) {
      await pool.query(
        'INSERT INTO triggers (name, description, event_type, conditions, actions, flow_id, is_active, fire_count) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [trigger.name, trigger.description, trigger.event_type, JSON.stringify(trigger.conditions), JSON.stringify(trigger.actions), trigger.flow_id, trigger.is_active, trigger.fire_count]
      );
    }

    // Seed Personalization Rules (15 items)
    console.log('Seeding personalization rules...');
    const personalizationRules = [
      { name: 'New User Welcome', description: 'Personalized welcome for new users', rule_type: 'content', conditions: { user_type: 'new' }, content_variations: { message: 'Welcome! Let us help you get started.' }, priority: 1, segment_id: 1, is_active: true },
      { name: 'Power User Tips', description: 'Advanced tips for power users', rule_type: 'content', conditions: { user_type: 'power' }, content_variations: { message: 'Here are some advanced tips.' }, priority: 2, segment_id: 2, is_active: true },
      { name: 'Trial User Urgency', description: 'Show urgency for trial users', rule_type: 'styling', conditions: { subscription: 'trial' }, content_variations: { theme: 'urgent', cta: 'Upgrade Now' }, priority: 1, segment_id: 3, is_active: true },
      { name: 'Enterprise Features', description: 'Highlight enterprise features', rule_type: 'content', conditions: { plan: 'enterprise' }, content_variations: { features: ['SSO', 'API', 'Support'] }, priority: 3, segment_id: 4, is_active: true },
      { name: 'Mobile Optimization', description: 'Mobile-specific content', rule_type: 'layout', conditions: { platform: 'mobile' }, content_variations: { layout: 'compact', gestures: true }, priority: 1, segment_id: 6, is_active: true },
      { name: 'Developer Mode', description: 'Technical content for devs', rule_type: 'content', conditions: { role: 'developer' }, content_variations: { show_code: true, technical_docs: true }, priority: 2, segment_id: 7, is_active: true },
      { name: 'Re-engagement', description: 'Message for returning users', rule_type: 'content', conditions: { days_inactive: { min: 7 } }, content_variations: { message: 'Welcome back!' }, priority: 1, segment_id: 8, is_active: true },
      { name: 'High Value Treatment', description: 'VIP treatment', rule_type: 'styling', conditions: { mrr: { min: 500 } }, content_variations: { theme: 'premium', support: 'priority' }, priority: 3, segment_id: 10, is_active: true },
      { name: 'Small Team Focus', description: 'Collaboration focus', rule_type: 'content', conditions: { team_size: { max: 5 } }, content_variations: { focus: 'collaboration', tips: 'team_growth' }, priority: 1, segment_id: 11, is_active: true },
      { name: 'Large Team Management', description: 'Management features', rule_type: 'content', conditions: { team_size: { min: 20 } }, content_variations: { focus: 'management', features: ['roles', 'permissions'] }, priority: 2, segment_id: 12, is_active: true },
      { name: 'Regional Content US', description: 'US-specific content', rule_type: 'content', conditions: { country: 'US' }, content_variations: { currency: 'USD', timezone: 'America/New_York' }, priority: 1, segment_id: 13, is_active: true },
      { name: 'Regional Content EU', description: 'EU-specific content', rule_type: 'content', conditions: { region: 'EU' }, content_variations: { currency: 'EUR', gdpr_notice: true }, priority: 1, segment_id: 14, is_active: true },
      { name: 'Free Tier Upsell', description: 'Upsell for free users', rule_type: 'content', conditions: { plan: 'free' }, content_variations: { show_upsell: true, highlight_premium: true }, priority: 1, segment_id: 15, is_active: true },
      { name: 'Feature Adopter', description: 'Encourage beta adoption', rule_type: 'content', conditions: { beta_features: true }, content_variations: { show_beta: true, early_access: true }, priority: 2, segment_id: 9, is_active: true },
      { name: 'Churned Win-back', description: 'Win-back messaging', rule_type: 'content', conditions: { status: 'churned' }, content_variations: { offer: 'discount', message: 'We miss you!' }, priority: 3, segment_id: 5, is_active: true }
    ];

    for (const rule of personalizationRules) {
      await pool.query(
        'INSERT INTO personalization_rules (name, description, rule_type, conditions, content_variations, priority, segment_id, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [rule.name, rule.description, rule.rule_type, JSON.stringify(rule.conditions), JSON.stringify(rule.content_variations), rule.priority, rule.segment_id, rule.is_active]
      );
    }

    // Seed Notifications (15 items)
    console.log('Seeding notifications...');
    const notifications = [
      { title: 'Welcome to OnboardFlow!', message: 'Thanks for signing up. Get started with your first flow.', notification_type: 'welcome', channel: 'in-app', status: 'sent', sent_count: 5670, open_rate: 78.5, click_rate: 45.2 },
      { title: 'Complete Your Setup', message: 'You are 80% done with setup. Complete it now.', notification_type: 'reminder', channel: 'email', status: 'sent', sent_count: 2340, open_rate: 65.3, click_rate: 32.1 },
      { title: 'New Feature: AI Content', message: 'Generate content with AI. Try it now!', notification_type: 'feature', channel: 'in-app', status: 'sent', sent_count: 8900, open_rate: 82.1, click_rate: 28.4 },
      { title: 'Your Trial Expires Soon', message: 'Your trial ends in 3 days. Upgrade now.', notification_type: 'urgent', channel: 'email', status: 'sent', sent_count: 890, open_rate: 72.8, click_rate: 38.9 },
      { title: 'Weekly Analytics Report', message: 'Your flows had 1,234 completions this week.', notification_type: 'report', channel: 'email', status: 'sent', sent_count: 4560, open_rate: 55.6, click_rate: 22.3 },
      { title: 'Team Member Joined', message: 'John Doe has joined your team.', notification_type: 'team', channel: 'in-app', status: 'sent', sent_count: 567, open_rate: 88.9, click_rate: 52.1 },
      { title: 'Flow Performance Alert', message: 'Your Welcome Flow completion rate dropped 15%.', notification_type: 'alert', channel: 'in-app', status: 'sent', sent_count: 234, open_rate: 92.3, click_rate: 67.8 },
      { title: 'New Integration Available', message: 'Connect with Slack for notifications.', notification_type: 'feature', channel: 'email', status: 'draft', sent_count: 0, open_rate: 0, click_rate: 0 },
      { title: 'Milestone Achieved!', message: '10,000 users completed your flows.', notification_type: 'celebration', channel: 'in-app', status: 'sent', sent_count: 45, open_rate: 100, click_rate: 78.5 },
      { title: 'Security Update Required', message: 'Please enable 2FA to secure your account.', notification_type: 'security', channel: 'email', status: 'sent', sent_count: 1234, open_rate: 68.9, click_rate: 41.2 },
      { title: 'New Templates Added', message: '5 new templates are now available.', notification_type: 'feature', channel: 'in-app', status: 'sent', sent_count: 7890, open_rate: 58.3, click_rate: 25.6 },
      { title: 'Feedback Request', message: 'How are you liking OnboardFlow?', notification_type: 'survey', channel: 'email', status: 'scheduled', sent_count: 0, open_rate: 0, click_rate: 0 },
      { title: 'API Usage Alert', message: 'You have used 80% of your API quota.', notification_type: 'alert', channel: 'in-app', status: 'sent', sent_count: 89, open_rate: 95.2, click_rate: 34.5 },
      { title: 'A/B Test Results Ready', message: 'Your test reached statistical significance.', notification_type: 'report', channel: 'in-app', status: 'sent', sent_count: 156, open_rate: 89.4, click_rate: 72.1 },
      { title: 'Holiday Special Offer', message: 'Get 30% off annual plans this holiday season!', notification_type: 'promotion', channel: 'email', status: 'draft', sent_count: 0, open_rate: 0, click_rate: 0 }
    ];

    for (const notification of notifications) {
      await pool.query(
        'INSERT INTO notifications (title, message, notification_type, channel, status, sent_count, open_rate, click_rate) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [notification.title, notification.message, notification.notification_type, notification.channel, notification.status, notification.sent_count, notification.open_rate, notification.click_rate]
      );
    }

    // ============ SEED NEW AI FEATURE TABLES ============

    // Seed PTO Requests (15 items)
    console.log('Seeding PTO requests...');
    const ptoRequests = [
      { employee_id: 2, employee_name: 'Demo User', department: 'Engineering', request_type: 'vacation', start_date: '2024-02-15', end_date: '2024-02-20', days_requested: 5, reason: 'Family vacation to Hawaii', status: 'approved', ai_recommendation: 'Recommended to approve - adequate coverage available', ai_approval_score: 92.5 },
      { employee_id: 3, employee_name: 'John Doe', department: 'Engineering', request_type: 'sick', start_date: '2024-02-10', end_date: '2024-02-11', days_requested: 2, reason: 'Not feeling well, need rest', status: 'approved', ai_recommendation: 'Auto-approved - sick leave policy', ai_approval_score: 100 },
      { employee_id: 4, employee_name: 'Jane Smith', department: 'HR', request_type: 'personal', start_date: '2024-03-01', end_date: '2024-03-02', days_requested: 2, reason: 'Personal appointment', status: 'pending', ai_recommendation: 'Consider approving - no conflicts detected', ai_approval_score: 85.0 },
      { employee_id: 5, employee_name: 'Mike Wilson', department: 'Sales', request_type: 'vacation', start_date: '2024-03-15', end_date: '2024-03-22', days_requested: 7, reason: 'Spring break with kids', status: 'pending', ai_recommendation: 'Warning: Q1 close period - recommend partial approval', ai_approval_score: 65.0 },
      { employee_id: 6, employee_name: 'Sarah Jones', department: 'Marketing', request_type: 'vacation', start_date: '2024-04-01', end_date: '2024-04-05', days_requested: 5, reason: 'Wedding attendance', status: 'approved', ai_recommendation: 'Approved - coverage confirmed with team', ai_approval_score: 95.0 },
      { employee_id: 7, employee_name: 'David Brown', department: 'Engineering', request_type: 'parental', start_date: '2024-05-01', end_date: '2024-06-30', days_requested: 60, reason: 'Paternity leave for new baby', status: 'approved', ai_recommendation: 'Auto-approved - parental leave policy', ai_approval_score: 100 },
      { employee_id: 8, employee_name: 'Emily Davis', department: 'Design', request_type: 'vacation', start_date: '2024-02-28', end_date: '2024-03-01', days_requested: 2, reason: 'Long weekend trip', status: 'approved', ai_recommendation: 'Approved - no project deadlines affected', ai_approval_score: 90.0 },
      { employee_id: 9, employee_name: 'Chris Miller', department: 'Support', request_type: 'sick', start_date: '2024-02-05', end_date: '2024-02-06', days_requested: 2, reason: 'Doctor appointment and recovery', status: 'approved', ai_recommendation: 'Auto-approved - medical appointment', ai_approval_score: 100 },
      { employee_id: 10, employee_name: 'Lisa Taylor', department: 'Finance', request_type: 'vacation', start_date: '2024-12-23', end_date: '2024-12-31', days_requested: 7, reason: 'Christmas holiday', status: 'pending', ai_recommendation: 'Warning: High volume request period', ai_approval_score: 70.0 },
      { employee_id: 11, employee_name: 'James Anderson', department: 'IT', request_type: 'personal', start_date: '2024-02-14', end_date: '2024-02-14', days_requested: 1, reason: 'Valentine day plans', status: 'approved', ai_recommendation: 'Approved - single day, no conflicts', ai_approval_score: 95.0 },
      { employee_id: 12, employee_name: 'Amy Thomas', department: 'Product', request_type: 'vacation', start_date: '2024-03-10', end_date: '2024-03-17', days_requested: 7, reason: 'Skiing trip to Colorado', status: 'pending', ai_recommendation: 'Recommend approval - sprint ends before leave', ai_approval_score: 88.0 },
      { employee_id: 13, employee_name: 'Robert Jackson', department: 'Engineering', request_type: 'bereavement', start_date: '2024-02-01', end_date: '2024-02-05', days_requested: 5, reason: 'Family bereavement', status: 'approved', ai_recommendation: 'Auto-approved - bereavement policy', ai_approval_score: 100 },
      { employee_id: 14, employee_name: 'Jennifer White', department: 'Operations', request_type: 'vacation', start_date: '2024-04-15', end_date: '2024-04-19', days_requested: 5, reason: 'Spring vacation', status: 'rejected', ai_recommendation: 'Not recommended - critical audit period', ai_approval_score: 35.0 },
      { employee_id: 15, employee_name: 'William Harris', department: 'Legal', request_type: 'personal', start_date: '2024-02-20', end_date: '2024-02-21', days_requested: 2, reason: 'Moving to new apartment', status: 'approved', ai_recommendation: 'Approved - personal days available', ai_approval_score: 92.0 },
      { employee_id: 2, employee_name: 'Demo User', department: 'Engineering', request_type: 'vacation', start_date: '2024-07-01', end_date: '2024-07-10', days_requested: 10, reason: 'Summer vacation', status: 'pending', ai_recommendation: 'Recommend approval - sufficient advance notice', ai_approval_score: 85.0 }
    ];

    for (const pto of ptoRequests) {
      await pool.query(
        'INSERT INTO pto_requests (employee_id, employee_name, department, request_type, start_date, end_date, days_requested, reason, status, ai_recommendation, ai_approval_score) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [pto.employee_id, pto.employee_name, pto.department, pto.request_type, pto.start_date, pto.end_date, pto.days_requested, pto.reason, pto.status, pto.ai_recommendation, pto.ai_approval_score]
      );
    }

    // Seed Mentor Matches (15 items)
    console.log('Seeding mentor matches...');
    const mentorMatches = [
      { mentee_id: 2, mentee_name: 'Demo User', mentor_id: 7, mentor_name: 'David Brown', department: 'Engineering', skills_to_develop: ['leadership', 'system design'], matching_score: 95.5, match_reason: 'Same department, complementary skills', ai_recommendation: 'Excellent match - David has 10+ years experience in system design', status: 'active', session_count: 5, feedback_score: 4.8 },
      { mentee_id: 3, mentee_name: 'John Doe', mentor_id: 11, mentor_name: 'James Anderson', department: 'Engineering', skills_to_develop: ['devops', 'cloud architecture'], matching_score: 92.0, match_reason: 'CTO can provide strategic guidance', ai_recommendation: 'Strong match - James can mentor on technical leadership path', status: 'active', session_count: 3, feedback_score: 4.9 },
      { mentee_id: 13, mentee_name: 'Robert Jackson', mentor_id: 3, mentor_name: 'John Doe', department: 'Engineering', skills_to_develop: ['coding best practices', 'testing'], matching_score: 88.5, match_reason: 'Senior to junior pairing', ai_recommendation: 'Good match - John excels at code reviews and mentoring', status: 'active', session_count: 8, feedback_score: 4.7 },
      { mentee_id: 5, mentee_name: 'Mike Wilson', mentor_id: 4, mentor_name: 'Jane Smith', department: 'Sales', skills_to_develop: ['negotiation', 'client management'], matching_score: 85.0, match_reason: 'Cross-functional skills development', ai_recommendation: 'Unique pairing - HR perspective can enhance client empathy', status: 'pending', session_count: 0 },
      { mentee_id: 8, mentee_name: 'Emily Davis', mentor_id: 12, mentor_name: 'Amy Thomas', department: 'Design', skills_to_develop: ['product thinking', 'stakeholder management'], matching_score: 91.0, match_reason: 'Designer to PM transition support', ai_recommendation: 'Excellent match - Amy transitioned from design to PM herself', status: 'active', session_count: 4, feedback_score: 4.6 },
      { mentee_id: 6, mentee_name: 'Sarah Jones', mentor_id: 14, mentor_name: 'Jennifer White', department: 'Marketing', skills_to_develop: ['operations', 'process optimization'], matching_score: 82.0, match_reason: 'Marketing ops alignment', ai_recommendation: 'Good match - cross-functional learning opportunity', status: 'active', session_count: 2, feedback_score: 4.5 },
      { mentee_id: 9, mentee_name: 'Chris Miller', mentor_id: 5, mentor_name: 'Mike Wilson', department: 'Support', skills_to_develop: ['sales skills', 'upselling'], matching_score: 79.5, match_reason: 'Support to sales transition', ai_recommendation: 'Moderate match - Mike can share sales techniques', status: 'pending', session_count: 0 },
      { mentee_id: 10, mentee_name: 'Lisa Taylor', mentor_id: 1, mentor_name: 'Admin User', department: 'Finance', skills_to_develop: ['technical finance', 'automation'], matching_score: 86.0, match_reason: 'Finance tech skills', ai_recommendation: 'Good match - Admin can help with financial systems', status: 'active', session_count: 6, feedback_score: 4.4 },
      { mentee_id: 12, mentee_name: 'Amy Thomas', mentor_id: 11, mentor_name: 'James Anderson', department: 'Product', skills_to_develop: ['executive presence', 'strategy'], matching_score: 94.0, match_reason: 'PM to executive path', ai_recommendation: 'Excellent match - James can guide executive development', status: 'active', session_count: 7, feedback_score: 4.9 },
      { mentee_id: 15, mentee_name: 'William Harris', mentor_id: 14, mentor_name: 'Jennifer White', department: 'Legal', skills_to_develop: ['operations knowledge', 'business acumen'], matching_score: 80.0, match_reason: 'Legal to operations understanding', ai_recommendation: 'Good match - broaden business perspective', status: 'active', session_count: 3, feedback_score: 4.3 },
      { mentee_id: 4, mentee_name: 'Jane Smith', mentor_id: 11, mentor_name: 'James Anderson', department: 'HR', skills_to_develop: ['technical hiring', 'engineering culture'], matching_score: 89.0, match_reason: 'HR tech alignment', ai_recommendation: 'Strong match - improve technical hiring skills', status: 'active', session_count: 4, feedback_score: 4.7 },
      { mentee_id: 7, mentee_name: 'David Brown', mentor_id: 11, mentor_name: 'James Anderson', department: 'Engineering', skills_to_develop: ['executive leadership', 'board communication'], matching_score: 96.0, match_reason: 'Tech lead to CTO path', ai_recommendation: 'Excellent match - natural progression mentorship', status: 'active', session_count: 12, feedback_score: 5.0 },
      { mentee_id: 14, mentee_name: 'Jennifer White', mentor_id: 11, mentor_name: 'James Anderson', department: 'Operations', skills_to_develop: ['technology strategy', 'digital transformation'], matching_score: 87.0, match_reason: 'Ops digital transformation', ai_recommendation: 'Good match - tech-enabled operations learning', status: 'pending', session_count: 0 },
      { mentee_id: 6, mentee_name: 'Sarah Jones', mentor_id: 12, mentor_name: 'Amy Thomas', department: 'Marketing', skills_to_develop: ['product marketing', 'positioning'], matching_score: 90.0, match_reason: 'Marketing to product marketing', ai_recommendation: 'Strong match - Amy has PMM experience', status: 'completed', session_count: 10, feedback_score: 4.8 },
      { mentee_id: 9, mentee_name: 'Chris Miller', mentor_id: 7, mentor_name: 'David Brown', department: 'Support', skills_to_develop: ['technical skills', 'escalation handling'], matching_score: 84.0, match_reason: 'Support to technical support', ai_recommendation: 'Good match - enhance technical troubleshooting', status: 'active', session_count: 5, feedback_score: 4.5 }
    ];

    for (const match of mentorMatches) {
      await pool.query(
        'INSERT INTO mentor_matches (mentee_id, mentee_name, mentor_id, mentor_name, department, skills_to_develop, matching_score, match_reason, ai_recommendation, status, session_count, feedback_score) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
        [match.mentee_id, match.mentee_name, match.mentor_id, match.mentor_name, match.department, JSON.stringify(match.skills_to_develop), match.matching_score, match.match_reason, match.ai_recommendation, match.status, match.session_count, match.feedback_score || null]
      );
    }

    // Seed Feedback (15 items)
    console.log('Seeding feedback...');
    const feedbackItems = [
      { user_id: 2, user_name: 'Demo User', feedback_type: 'suggestion', category: 'feature', subject: 'Add dark mode support', content: 'It would be great to have a dark mode option for the dashboard. Working late at night, the bright interface is hard on the eyes.', sentiment: 'positive', sentiment_score: 0.75, ai_analysis: 'User requesting popular feature - dark mode. 78% of similar products have this feature.', ai_action_items: ['Create dark mode feature ticket', 'Survey other users', 'Estimate development effort'], priority: 'medium', status: 'open' },
      { user_id: 3, user_name: 'John Doe', feedback_type: 'bug', category: 'functionality', subject: 'Flow builder crashes on large flows', content: 'When I try to create a flow with more than 20 steps, the builder becomes unresponsive and sometimes crashes.', sentiment: 'negative', sentiment_score: -0.6, ai_analysis: 'Performance issue identified. Likely memory leak in flow builder component.', ai_action_items: ['Create high priority bug ticket', 'Investigate memory usage', 'Add flow size limits'], priority: 'high', status: 'in_progress' },
      { user_id: 4, user_name: 'Jane Smith', feedback_type: 'praise', category: 'support', subject: 'Excellent customer support', content: 'I want to thank the support team for helping me set up our onboarding flows. They were patient and very knowledgeable!', sentiment: 'positive', sentiment_score: 0.95, ai_analysis: 'Positive feedback for support team. Share with team for morale.', ai_action_items: ['Share with support team', 'Consider for testimonial', 'Thank the user'], priority: 'low', status: 'resolved' },
      { user_id: 5, user_name: 'Mike Wilson', feedback_type: 'complaint', category: 'pricing', subject: 'Pricing is too high for small teams', content: 'As a small sales team of 3, the enterprise pricing doesnt make sense for us. We need a tier for small businesses.', sentiment: 'negative', sentiment_score: -0.4, ai_analysis: 'Pricing feedback - common pattern from small teams. Consider SMB tier.', ai_action_items: ['Forward to pricing team', 'Research SMB pricing models', 'Create feedback summary'], priority: 'medium', status: 'open' },
      { user_id: 6, user_name: 'Sarah Jones', feedback_type: 'suggestion', category: 'integration', subject: 'HubSpot integration improvements', content: 'The HubSpot integration works but its missing contact syncing. Would love to see bi-directional sync with HubSpot contacts.', sentiment: 'neutral', sentiment_score: 0.3, ai_analysis: 'Integration enhancement request. HubSpot is top requested integration.', ai_action_items: ['Add to integration roadmap', 'Research HubSpot API capabilities', 'Estimate effort'], priority: 'medium', status: 'open' },
      { user_id: 7, user_name: 'David Brown', feedback_type: 'suggestion', category: 'feature', subject: 'API rate limiting dashboard', content: 'We need a dashboard to monitor our API usage and rate limits. Currently we have no visibility.', sentiment: 'neutral', sentiment_score: 0.2, ai_analysis: 'Developer experience improvement. Common request from API users.', ai_action_items: ['Add to dev portal roadmap', 'Design usage dashboard', 'Implement alerting'], priority: 'medium', status: 'open' },
      { user_id: 8, user_name: 'Emily Davis', feedback_type: 'praise', category: 'product', subject: 'Love the new template gallery', content: 'The new template gallery is amazing! It saved us hours of work. The designs are beautiful and easy to customize.', sentiment: 'positive', sentiment_score: 0.9, ai_analysis: 'Positive product feedback. Templates feature well received.', ai_action_items: ['Share with design team', 'Feature in marketing', 'Request case study'], priority: 'low', status: 'resolved' },
      { user_id: 9, user_name: 'Chris Miller', feedback_type: 'bug', category: 'functionality', subject: 'Notifications not sending', content: 'Scheduled notifications are not being sent. I set up 3 campaigns and none of them triggered on time.', sentiment: 'negative', sentiment_score: -0.7, ai_analysis: 'Critical bug - notification scheduling failure. Immediate attention needed.', ai_action_items: ['Create P0 bug ticket', 'Check cron jobs', 'Investigate queue system', 'Contact affected users'], priority: 'high', status: 'in_progress' },
      { user_id: 10, user_name: 'Lisa Taylor', feedback_type: 'suggestion', category: 'analytics', subject: 'Export analytics to Excel', content: 'Please add the ability to export analytics data to Excel format. We need this for monthly board reports.', sentiment: 'neutral', sentiment_score: 0.4, ai_analysis: 'Data export feature request. Common enterprise requirement.', ai_action_items: ['Add export functionality', 'Support CSV and XLSX', 'Add to next sprint'], priority: 'medium', status: 'open' },
      { user_id: 11, user_name: 'James Anderson', feedback_type: 'suggestion', category: 'security', subject: 'SAML SSO support needed', content: 'For enterprise deployment, we require SAML SSO integration. This is a blocker for our security compliance.', sentiment: 'negative', sentiment_score: -0.2, ai_analysis: 'Enterprise security requirement. SAML is must-have for enterprise.', ai_action_items: ['Prioritize SSO development', 'Research SAML providers', 'Update security roadmap'], priority: 'high', status: 'open' },
      { user_id: 12, user_name: 'Amy Thomas', feedback_type: 'praise', category: 'onboarding', subject: 'Smooth onboarding experience', content: 'Just finished the onboarding and it was so smooth! The AI suggestions were spot on. Great product!', sentiment: 'positive', sentiment_score: 0.85, ai_analysis: 'Meta feedback - user enjoyed our onboarding. Validates product approach.', ai_action_items: ['Track as success metric', 'Request detailed review', 'Consider for case study'], priority: 'low', status: 'resolved' },
      { user_id: 13, user_name: 'Robert Jackson', feedback_type: 'complaint', category: 'performance', subject: 'Dashboard loading is slow', content: 'The dashboard takes 10+ seconds to load every time. This is really frustrating when checking stats multiple times a day.', sentiment: 'negative', sentiment_score: -0.55, ai_analysis: 'Performance issue affecting user experience. Dashboard optimization needed.', ai_action_items: ['Performance audit', 'Add caching', 'Optimize database queries'], priority: 'high', status: 'open' },
      { user_id: 14, user_name: 'Jennifer White', feedback_type: 'suggestion', category: 'workflow', subject: 'Approval workflow for flows', content: 'We need an approval workflow before flows go live. Currently anyone can publish which is risky for us.', sentiment: 'neutral', sentiment_score: 0.3, ai_analysis: 'Governance feature request. Important for enterprise customers.', ai_action_items: ['Design approval workflow', 'Add role-based publishing', 'Create admin controls'], priority: 'medium', status: 'open' },
      { user_id: 15, user_name: 'William Harris', feedback_type: 'bug', category: 'ui', subject: 'Mobile view broken on iOS', content: 'The mobile dashboard is completely broken on iOS Safari. Buttons are overlapping and text is cut off.', sentiment: 'negative', sentiment_score: -0.65, ai_analysis: 'Mobile compatibility bug. iOS Safari specific issue.', ai_action_items: ['Test on iOS Safari', 'Fix responsive CSS', 'Cross-browser testing'], priority: 'high', status: 'in_progress' },
      { user_id: 2, user_name: 'Demo User', feedback_type: 'suggestion', category: 'ai', subject: 'More AI writing styles', content: 'Love the AI content generation but would like more writing style options - formal, casual, playful, etc.', sentiment: 'positive', sentiment_score: 0.6, ai_analysis: 'AI feature enhancement. User engaged with AI features and wants more.', ai_action_items: ['Add tone selector to AI', 'Train different style models', 'A/B test effectiveness'], priority: 'medium', status: 'open' }
    ];

    for (const feedback of feedbackItems) {
      await pool.query(
        'INSERT INTO feedback (user_id, user_name, feedback_type, category, subject, content, sentiment, sentiment_score, ai_analysis, ai_action_items, priority, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
        [feedback.user_id, feedback.user_name, feedback.feedback_type, feedback.category, feedback.subject, feedback.content, feedback.sentiment, feedback.sentiment_score, feedback.ai_analysis, JSON.stringify(feedback.ai_action_items), feedback.priority, feedback.status]
      );
    }

    // Seed Training Recommendations (15 items)
    console.log('Seeding training recommendations...');
    const trainingRecs = [
      { user_id: 2, user_name: 'Demo User', current_role: 'Developer', target_role: 'Senior Developer', skill_gap: ['system design', 'mentoring', 'code review'], recommended_courses: [{ name: 'System Design Fundamentals', provider: 'Coursera', duration: '40 hours' }, { name: 'Technical Leadership', provider: 'LinkedIn Learning', duration: '20 hours' }], ai_learning_path: 'Start with System Design course to build architecture skills, then move to Technical Leadership for soft skills development.', priority: 'high', estimated_duration: '3 months', completion_percentage: 35.0, status: 'in_progress' },
      { user_id: 3, user_name: 'John Doe', current_role: 'Senior Developer', target_role: 'Tech Lead', skill_gap: ['team management', 'stakeholder communication', 'project planning'], recommended_courses: [{ name: 'Engineering Management 101', provider: 'Udemy', duration: '30 hours' }, { name: 'Agile Project Management', provider: 'Scrum.org', duration: '16 hours' }], ai_learning_path: 'Focus on management fundamentals first, then apply learnings through Agile methodology training.', priority: 'high', estimated_duration: '4 months', completion_percentage: 60.0, status: 'in_progress' },
      { user_id: 4, user_name: 'Jane Smith', current_role: 'HR Manager', target_role: 'HR Director', skill_gap: ['strategic planning', 'executive communication', 'analytics'], recommended_courses: [{ name: 'HR Analytics', provider: 'SHRM', duration: '25 hours' }, { name: 'Executive Presence', provider: 'Harvard Online', duration: '15 hours' }], ai_learning_path: 'Build analytical foundation with HR Analytics, then develop executive skills for director-level interactions.', priority: 'medium', estimated_duration: '5 months', completion_percentage: 20.0, status: 'in_progress' },
      { user_id: 5, user_name: 'Mike Wilson', current_role: 'Sales Rep', target_role: 'Sales Manager', skill_gap: ['team leadership', 'forecasting', 'coaching'], recommended_courses: [{ name: 'Sales Leadership', provider: 'Salesforce Trailhead', duration: '20 hours' }, { name: 'Revenue Forecasting', provider: 'LinkedIn Learning', duration: '10 hours' }], ai_learning_path: 'Start with Sales Leadership to understand management role, add forecasting skills for business acumen.', priority: 'medium', estimated_duration: '3 months', completion_percentage: 0.0, status: 'pending' },
      { user_id: 6, user_name: 'Sarah Jones', current_role: 'Marketing Specialist', target_role: 'Marketing Manager', skill_gap: ['budget management', 'campaign strategy', 'team coordination'], recommended_courses: [{ name: 'Digital Marketing Strategy', provider: 'Google', duration: '40 hours' }, { name: 'Marketing Budget Planning', provider: 'HubSpot Academy', duration: '8 hours' }], ai_learning_path: 'Complete Google certification for strategic foundation, then focus on budget management skills.', priority: 'medium', estimated_duration: '4 months', completion_percentage: 75.0, status: 'in_progress' },
      { user_id: 7, user_name: 'David Brown', current_role: 'Tech Lead', target_role: 'Engineering Director', skill_gap: ['executive leadership', 'cross-functional collaboration', 'budget ownership'], recommended_courses: [{ name: 'Engineering Leadership', provider: 'MIT OpenCourseware', duration: '60 hours' }, { name: 'Financial Management for Non-Finance', provider: 'Wharton Online', duration: '30 hours' }], ai_learning_path: 'Deep dive into engineering leadership principles, complement with financial literacy for director responsibilities.', priority: 'high', estimated_duration: '6 months', completion_percentage: 45.0, status: 'in_progress' },
      { user_id: 8, user_name: 'Emily Davis', current_role: 'UX Designer', target_role: 'Design Lead', skill_gap: ['design systems', 'team management', 'stakeholder presentation'], recommended_courses: [{ name: 'Design Systems with Figma', provider: 'Figma', duration: '15 hours' }, { name: 'Design Leadership', provider: 'Interaction Design Foundation', duration: '25 hours' }], ai_learning_path: 'Master design systems for technical leadership, then develop management and presentation skills.', priority: 'medium', estimated_duration: '4 months', completion_percentage: 55.0, status: 'in_progress' },
      { user_id: 9, user_name: 'Chris Miller', current_role: 'Support Agent', target_role: 'Support Team Lead', skill_gap: ['team coordination', 'escalation management', 'process improvement'], recommended_courses: [{ name: 'Customer Service Leadership', provider: 'Zendesk Training', duration: '12 hours' }, { name: 'Process Improvement Basics', provider: 'LinkedIn Learning', duration: '8 hours' }], ai_learning_path: 'Build leadership foundation with customer service focus, add process skills for efficiency improvements.', priority: 'low', estimated_duration: '2 months', completion_percentage: 100.0, status: 'completed' },
      { user_id: 10, user_name: 'Lisa Taylor', current_role: 'Accountant', target_role: 'Finance Manager', skill_gap: ['financial planning', 'team leadership', 'systems knowledge'], recommended_courses: [{ name: 'Financial Planning & Analysis', provider: 'CPA Institute', duration: '50 hours' }, { name: 'Finance Team Management', provider: 'CFI', duration: '20 hours' }], ai_learning_path: 'Strengthen FP&A skills first as core competency, then develop team management capabilities.', priority: 'high', estimated_duration: '5 months', completion_percentage: 30.0, status: 'in_progress' },
      { user_id: 11, user_name: 'James Anderson', current_role: 'CTO', target_role: 'CEO', skill_gap: ['general management', 'investor relations', 'market strategy'], recommended_courses: [{ name: 'CEO Bootcamp', provider: 'Stanford GSB', duration: '80 hours' }, { name: 'Investor Relations', provider: 'NYSE', duration: '10 hours' }], ai_learning_path: 'Executive-level training focusing on company-wide leadership and external stakeholder management.', priority: 'low', estimated_duration: '12 months', completion_percentage: 15.0, status: 'in_progress' },
      { user_id: 12, user_name: 'Amy Thomas', current_role: 'Product Manager', target_role: 'Director of Product', skill_gap: ['product portfolio management', 'executive reporting', 'team scaling'], recommended_courses: [{ name: 'Product Leadership', provider: 'Reforge', duration: '40 hours' }, { name: 'Scaling Product Teams', provider: 'Mind the Product', duration: '20 hours' }], ai_learning_path: 'Focus on product leadership strategy first, then learn team scaling for director responsibilities.', priority: 'high', estimated_duration: '5 months', completion_percentage: 50.0, status: 'in_progress' },
      { user_id: 13, user_name: 'Robert Jackson', current_role: 'Junior Developer', target_role: 'Developer', skill_gap: ['advanced programming', 'testing', 'debugging'], recommended_courses: [{ name: 'Advanced JavaScript', provider: 'Udemy', duration: '30 hours' }, { name: 'Test-Driven Development', provider: 'Pluralsight', duration: '15 hours' }], ai_learning_path: 'Strengthen core programming skills, then learn TDD for code quality improvement.', priority: 'high', estimated_duration: '2 months', completion_percentage: 80.0, status: 'in_progress' },
      { user_id: 14, user_name: 'Jennifer White', current_role: 'Ops Manager', target_role: 'VP of Operations', skill_gap: ['strategic operations', 'executive leadership', 'change management'], recommended_courses: [{ name: 'Operations Strategy', provider: 'Wharton Online', duration: '35 hours' }, { name: 'Change Management Certification', provider: 'Prosci', duration: '25 hours' }], ai_learning_path: 'Build strategic operations thinking, complement with change management for organizational transformation.', priority: 'medium', estimated_duration: '6 months', completion_percentage: 25.0, status: 'in_progress' },
      { user_id: 15, user_name: 'William Harris', current_role: 'Legal Counsel', target_role: 'General Counsel', skill_gap: ['corporate governance', 'risk management', 'executive advisory'], recommended_courses: [{ name: 'Corporate Governance', provider: 'Harvard Law Online', duration: '40 hours' }, { name: 'Enterprise Risk Management', provider: 'RIMS', duration: '20 hours' }], ai_learning_path: 'Develop governance expertise for GC role, add risk management for comprehensive legal leadership.', priority: 'medium', estimated_duration: '8 months', completion_percentage: 10.0, status: 'in_progress' },
      { user_id: 2, user_name: 'Demo User', current_role: 'Developer', target_role: 'Full Stack Developer', skill_gap: ['frontend frameworks', 'cloud deployment', 'API design'], recommended_courses: [{ name: 'React Complete Guide', provider: 'Udemy', duration: '40 hours' }, { name: 'AWS Solutions Architect', provider: 'AWS', duration: '50 hours' }], ai_learning_path: 'Expand frontend skills with React, then add cloud knowledge for full stack capabilities.', priority: 'medium', estimated_duration: '4 months', completion_percentage: 65.0, status: 'in_progress' }
    ];

    for (const rec of trainingRecs) {
      await pool.query(
        'INSERT INTO training_recommendations (user_id, user_name, "current_role", "target_role", skill_gap, recommended_courses, ai_learning_path, priority, estimated_duration, completion_percentage, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [rec.user_id, rec.user_name, rec.current_role, rec.target_role, JSON.stringify(rec.skill_gap), JSON.stringify(rec.recommended_courses), rec.ai_learning_path, rec.priority, rec.estimated_duration, rec.completion_percentage, rec.status]
      );
    }

    // Seed AI Checklists (15 items)
    console.log('Seeding AI checklists...');
    const aiChecklists = [
      { name: 'New Employee Onboarding', description: 'Complete onboarding checklist for new hires', user_id: 2, user_name: 'Demo User', checklist_type: 'onboarding', items: [{ id: 1, title: 'Complete HR paperwork', done: true }, { id: 2, title: 'Set up workstation', done: true }, { id: 3, title: 'Meet team members', done: false }, { id: 4, title: 'Review company handbook', done: false }, { id: 5, title: 'Complete security training', done: false }], ai_suggestions: 'Consider adding IT setup and first project assignment as additional items.', total_items: 5, completed_items: 2, completion_percentage: 40.0, due_date: '2024-02-28', priority: 'high', status: 'active' },
      { name: 'Q1 Goals Setup', description: 'Set up quarterly goals and OKRs', user_id: 3, user_name: 'John Doe', checklist_type: 'goals', items: [{ id: 1, title: 'Define key results', done: true }, { id: 2, title: 'Align with team goals', done: true }, { id: 3, title: 'Get manager approval', done: true }, { id: 4, title: 'Set milestones', done: false }], ai_suggestions: 'Add progress check-in dates and accountability partner assignment.', total_items: 4, completed_items: 3, completion_percentage: 75.0, due_date: '2024-01-15', priority: 'high', status: 'active' },
      { name: 'Project Launch Checklist', description: 'Pre-launch verification steps', user_id: 7, user_name: 'David Brown', checklist_type: 'project', items: [{ id: 1, title: 'Code review completed', done: true }, { id: 2, title: 'QA sign-off', done: true }, { id: 3, title: 'Performance testing', done: true }, { id: 4, title: 'Security audit', done: true }, { id: 5, title: 'Documentation updated', done: false }, { id: 6, title: 'Stakeholder approval', done: false }], ai_suggestions: 'Consider adding rollback plan verification and monitoring setup.', total_items: 6, completed_items: 4, completion_percentage: 66.67, due_date: '2024-02-15', priority: 'high', status: 'active' },
      { name: 'Daily Standup Prep', description: 'Daily preparation checklist', user_id: 2, user_name: 'Demo User', checklist_type: 'daily', items: [{ id: 1, title: 'Review yesterday tasks', done: true }, { id: 2, title: 'Check blockers', done: true }, { id: 3, title: 'Update Jira tickets', done: false }], ai_suggestions: 'Add time estimates for today tasks and note any dependencies.', total_items: 3, completed_items: 2, completion_percentage: 66.67, due_date: '2024-02-10', priority: 'medium', status: 'active' },
      { name: 'Client Meeting Prep', description: 'Preparation for client presentation', user_id: 5, user_name: 'Mike Wilson', checklist_type: 'meeting', items: [{ id: 1, title: 'Prepare slides', done: true }, { id: 2, title: 'Review contract terms', done: true }, { id: 3, title: 'Confirm attendees', done: true }, { id: 4, title: 'Test video setup', done: false }, { id: 5, title: 'Prepare demo environment', done: false }], ai_suggestions: 'Add backup presentation format and prepare FAQ responses.', total_items: 5, completed_items: 3, completion_percentage: 60.0, due_date: '2024-02-12', priority: 'high', status: 'active' },
      { name: 'Code Review Checklist', description: 'Standards for code review', user_id: 3, user_name: 'John Doe', checklist_type: 'development', items: [{ id: 1, title: 'Check coding standards', done: true }, { id: 2, title: 'Review test coverage', done: true }, { id: 3, title: 'Check for security issues', done: true }, { id: 4, title: 'Verify documentation', done: true }, { id: 5, title: 'Performance review', done: true }], ai_suggestions: 'Consider adding accessibility check and mobile responsiveness review.', total_items: 5, completed_items: 5, completion_percentage: 100.0, due_date: '2024-02-08', priority: 'medium', status: 'completed' },
      { name: 'Monthly Report Preparation', description: 'Steps to prepare monthly report', user_id: 10, user_name: 'Lisa Taylor', checklist_type: 'reporting', items: [{ id: 1, title: 'Gather financial data', done: true }, { id: 2, title: 'Verify calculations', done: false }, { id: 3, title: 'Create visualizations', done: false }, { id: 4, title: 'Write executive summary', done: false }], ai_suggestions: 'Add variance analysis and comparison to previous periods.', total_items: 4, completed_items: 1, completion_percentage: 25.0, due_date: '2024-02-28', priority: 'high', status: 'active' },
      { name: 'Security Audit Prep', description: 'Prepare for security audit', user_id: 11, user_name: 'James Anderson', checklist_type: 'security', items: [{ id: 1, title: 'Review access logs', done: true }, { id: 2, title: 'Check SSL certificates', done: true }, { id: 3, title: 'Verify backup procedures', done: true }, { id: 4, title: 'Document incident response', done: false }, { id: 5, title: 'Review third-party integrations', done: false }], ai_suggestions: 'Add penetration testing results review and compliance checklist.', total_items: 5, completed_items: 3, completion_percentage: 60.0, due_date: '2024-03-01', priority: 'high', status: 'active' },
      { name: 'Interview Process Checklist', description: 'Steps for conducting interviews', user_id: 4, user_name: 'Jane Smith', checklist_type: 'hiring', items: [{ id: 1, title: 'Review resume', done: true }, { id: 2, title: 'Prepare questions', done: true }, { id: 3, title: 'Set up video call', done: true }, { id: 4, title: 'Share candidate info with panel', done: true }, { id: 5, title: 'Complete scorecard', done: false }], ai_suggestions: 'Add diversity and inclusion check and cultural fit assessment.', total_items: 5, completed_items: 4, completion_percentage: 80.0, due_date: '2024-02-14', priority: 'medium', status: 'active' },
      { name: 'Sprint Planning Checklist', description: 'Sprint planning preparation', user_id: 7, user_name: 'David Brown', checklist_type: 'agile', items: [{ id: 1, title: 'Review backlog', done: true }, { id: 2, title: 'Estimate stories', done: true }, { id: 3, title: 'Identify dependencies', done: false }, { id: 4, title: 'Assign tasks', done: false }, { id: 5, title: 'Set sprint goal', done: false }], ai_suggestions: 'Consider adding capacity planning and risk assessment.', total_items: 5, completed_items: 2, completion_percentage: 40.0, due_date: '2024-02-11', priority: 'high', status: 'active' },
      { name: 'Marketing Campaign Launch', description: 'Campaign launch checklist', user_id: 6, user_name: 'Sarah Jones', checklist_type: 'marketing', items: [{ id: 1, title: 'Finalize creatives', done: true }, { id: 2, title: 'Set up tracking', done: true }, { id: 3, title: 'Configure audience', done: true }, { id: 4, title: 'Schedule posts', done: false }, { id: 5, title: 'Prepare budget', done: false }], ai_suggestions: 'Add A/B testing setup and competitor analysis review.', total_items: 5, completed_items: 3, completion_percentage: 60.0, due_date: '2024-02-20', priority: 'high', status: 'active' },
      { name: 'Product Demo Preparation', description: 'Prepare for product demonstration', user_id: 12, user_name: 'Amy Thomas', checklist_type: 'demo', items: [{ id: 1, title: 'Set up demo account', done: true }, { id: 2, title: 'Prepare talking points', done: true }, { id: 3, title: 'Test all features', done: true }, { id: 4, title: 'Prepare backup plan', done: true }], ai_suggestions: 'Add customer-specific customization and FAQs preparation.', total_items: 4, completed_items: 4, completion_percentage: 100.0, due_date: '2024-02-09', priority: 'high', status: 'completed' },
      { name: 'Employee Offboarding', description: 'Checklist for employee departure', user_id: 4, user_name: 'Jane Smith', checklist_type: 'offboarding', items: [{ id: 1, title: 'Collect equipment', done: false }, { id: 2, title: 'Revoke access', done: false }, { id: 3, title: 'Knowledge transfer', done: false }, { id: 4, title: 'Exit interview', done: false }, { id: 5, title: 'Final paycheck', done: false }], ai_suggestions: 'Add reference letter preparation and alumni network invitation.', total_items: 5, completed_items: 0, completion_percentage: 0.0, due_date: '2024-02-28', priority: 'medium', status: 'active' },
      { name: 'Compliance Review', description: 'Quarterly compliance checklist', user_id: 15, user_name: 'William Harris', checklist_type: 'compliance', items: [{ id: 1, title: 'Review policies', done: true }, { id: 2, title: 'Check certifications', done: true }, { id: 3, title: 'Audit documentation', done: false }, { id: 4, title: 'Update procedures', done: false }], ai_suggestions: 'Add regulatory update review and training compliance check.', total_items: 4, completed_items: 2, completion_percentage: 50.0, due_date: '2024-03-15', priority: 'high', status: 'active' },
      { name: 'Design System Update', description: 'Steps to update design system', user_id: 8, user_name: 'Emily Davis', checklist_type: 'design', items: [{ id: 1, title: 'Audit current components', done: true }, { id: 2, title: 'Document changes', done: true }, { id: 3, title: 'Update Figma library', done: false }, { id: 4, title: 'Communicate to team', done: false }, { id: 5, title: 'Update code library', done: false }], ai_suggestions: 'Add version control and migration guide creation.', total_items: 5, completed_items: 2, completion_percentage: 40.0, due_date: '2024-02-25', priority: 'medium', status: 'active' }
    ];

    for (const checklist of aiChecklists) {
      await pool.query(
        'INSERT INTO ai_checklists (name, description, user_id, user_name, checklist_type, items, ai_suggestions, total_items, completed_items, completion_percentage, due_date, priority, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
        [checklist.name, checklist.description, checklist.user_id, checklist.user_name, checklist.checklist_type, JSON.stringify(checklist.items), checklist.ai_suggestions, checklist.total_items, checklist.completed_items, checklist.completion_percentage, checklist.due_date, checklist.priority, checklist.status]
      );
    }

    // Seed AI Progress (15 items)
    console.log('Seeding AI progress...');
    const aiProgressItems = [
      { user_id: 2, user_name: 'Demo User', goal_type: 'skill_development', goal_description: 'Learn React and build 3 projects', current_value: 2, target_value: 3, progress_percentage: 66.67, ai_insights: 'Great progress! You are on track to complete by deadline. Consider adding a larger project for your portfolio.', ai_recommendations: ['Complete the e-commerce project next', 'Add testing to existing projects', 'Document your learnings'], milestones: [{ name: 'First project', completed: true }, { name: 'Second project', completed: true }, { name: 'Final project', completed: false }], trend: 'improving', target_date: '2024-03-31', status: 'in_progress' },
      { user_id: 3, user_name: 'John Doe', goal_type: 'certification', goal_description: 'Obtain AWS Solutions Architect certification', current_value: 75, target_value: 100, progress_percentage: 75.0, ai_insights: 'Strong progress on certification prep. Focus more on networking and security domains.', ai_recommendations: ['Take 2 practice exams', 'Review VPC configuration', 'Study IAM policies'], milestones: [{ name: 'Complete course', completed: true }, { name: 'Pass practice tests', completed: false }, { name: 'Schedule exam', completed: false }], trend: 'improving', target_date: '2024-02-28', status: 'in_progress' },
      { user_id: 4, user_name: 'Jane Smith', goal_type: 'team_metric', goal_description: 'Reduce time-to-hire to 21 days', current_value: 28, target_value: 21, progress_percentage: 75.0, ai_insights: 'Good improvement from 35 days. Bottleneck appears to be in technical interview scheduling.', ai_recommendations: ['Implement interview scheduling tool', 'Create interview panel rotation', 'Pre-screen more candidates'], milestones: [{ name: 'Baseline measured', completed: true }, { name: 'Process improvements', completed: true }, { name: 'Target achieved', completed: false }], trend: 'improving', target_date: '2024-03-31', status: 'in_progress' },
      { user_id: 5, user_name: 'Mike Wilson', goal_type: 'sales_target', goal_description: 'Close $500K in Q1 revenue', current_value: 325000, target_value: 500000, progress_percentage: 65.0, ai_insights: 'Slightly behind pace. Pipeline looks strong for February. Focus on closing pending deals.', ai_recommendations: ['Follow up on 5 pending proposals', 'Schedule demos for new leads', 'Upsell existing accounts'], milestones: [{ name: 'Q1 pipeline built', completed: true }, { name: 'First $250K', completed: true }, { name: 'Target achieved', completed: false }], trend: 'stable', target_date: '2024-03-31', status: 'in_progress' },
      { user_id: 6, user_name: 'Sarah Jones', goal_type: 'campaign_performance', goal_description: 'Achieve 100K website visitors from campaigns', current_value: 78500, target_value: 100000, progress_percentage: 78.5, ai_insights: 'Excellent campaign performance. Social media channels driving most traffic.', ai_recommendations: ['Double down on LinkedIn ads', 'Create more video content', 'Launch referral program'], milestones: [{ name: 'Campaign launched', completed: true }, { name: '50K visitors', completed: true }, { name: '100K target', completed: false }], trend: 'improving', target_date: '2024-02-28', status: 'in_progress' },
      { user_id: 7, user_name: 'David Brown', goal_type: 'code_quality', goal_description: 'Achieve 90% test coverage across all services', current_value: 82, target_value: 90, progress_percentage: 91.1, ai_insights: 'Great improvement from 65%. Focus on legacy services for remaining coverage.', ai_recommendations: ['Add tests to payment service', 'Refactor notification tests', 'Set up coverage reporting'], milestones: [{ name: 'Baseline measured', completed: true }, { name: '80% achieved', completed: true }, { name: '90% target', completed: false }], trend: 'improving', target_date: '2024-03-15', status: 'in_progress' },
      { user_id: 8, user_name: 'Emily Davis', goal_type: 'design_system', goal_description: 'Complete design system with 50 components', current_value: 42, target_value: 50, progress_percentage: 84.0, ai_insights: 'On track for completion. Remaining components are complex data visualization elements.', ai_recommendations: ['Complete chart components', 'Add accessibility variants', 'Document usage guidelines'], milestones: [{ name: 'Core components', completed: true }, { name: 'Form elements', completed: true }, { name: 'Data viz components', completed: false }], trend: 'improving', target_date: '2024-02-29', status: 'in_progress' },
      { user_id: 9, user_name: 'Chris Miller', goal_type: 'customer_satisfaction', goal_description: 'Achieve 4.5 CSAT score for support', current_value: 4.3, target_value: 4.5, progress_percentage: 95.6, ai_insights: 'Very close to target. Focus on first response time to push score higher.', ai_recommendations: ['Implement canned responses', 'Add self-service articles', 'Reduce ticket backlog'], milestones: [{ name: 'Baseline established', completed: true }, { name: '4.0 achieved', completed: true }, { name: '4.5 target', completed: false }], trend: 'improving', target_date: '2024-03-31', status: 'in_progress' },
      { user_id: 10, user_name: 'Lisa Taylor', goal_type: 'process_improvement', goal_description: 'Reduce month-end close to 3 days', current_value: 4, target_value: 3, progress_percentage: 75.0, ai_insights: 'Improved from 7 days. Accounts receivable reconciliation is the bottleneck.', ai_recommendations: ['Automate AR reconciliation', 'Implement continuous close', 'Pre-close more items'], milestones: [{ name: 'Process mapped', completed: true }, { name: '5-day close', completed: true }, { name: '3-day target', completed: false }], trend: 'improving', target_date: '2024-04-30', status: 'in_progress' },
      { user_id: 11, user_name: 'James Anderson', goal_type: 'strategic_initiative', goal_description: 'Launch 3 new product features', current_value: 2, target_value: 3, progress_percentage: 66.67, ai_insights: 'Two features launched successfully. Third feature in final testing phase.', ai_recommendations: ['Complete final testing', 'Prepare launch communications', 'Plan post-launch support'], milestones: [{ name: 'Feature 1 launched', completed: true }, { name: 'Feature 2 launched', completed: true }, { name: 'Feature 3 launched', completed: false }], trend: 'stable', target_date: '2024-03-31', status: 'in_progress' },
      { user_id: 12, user_name: 'Amy Thomas', goal_type: 'product_metrics', goal_description: 'Increase user activation rate to 60%', current_value: 52, target_value: 60, progress_percentage: 86.7, ai_insights: 'Strong improvement from 38%. Onboarding changes having positive impact.', ai_recommendations: ['A/B test new onboarding flow', 'Add activation emails', 'Improve first-time user experience'], milestones: [{ name: 'Baseline measured', completed: true }, { name: '50% achieved', completed: true }, { name: '60% target', completed: false }], trend: 'improving', target_date: '2024-02-28', status: 'in_progress' },
      { user_id: 13, user_name: 'Robert Jackson', goal_type: 'skill_development', goal_description: 'Complete 5 coding challenges per week', current_value: 45, target_value: 60, progress_percentage: 75.0, ai_insights: 'Consistent progress. Difficulty level increasing appropriately. Focus on dynamic programming.', ai_recommendations: ['Practice DP problems', 'Review graph algorithms', 'Join coding competitions'], milestones: [{ name: 'Easy challenges', completed: true }, { name: 'Medium challenges', completed: true }, { name: 'Hard challenges', completed: false }], trend: 'improving', target_date: '2024-03-31', status: 'in_progress' },
      { user_id: 14, user_name: 'Jennifer White', goal_type: 'operational_efficiency', goal_description: 'Reduce operational costs by 15%', current_value: 12, target_value: 15, progress_percentage: 80.0, ai_insights: '12% reduction achieved through vendor renegotiation. Automation next focus.', ai_recommendations: ['Automate manual processes', 'Consolidate tools', 'Optimize cloud spending'], milestones: [{ name: 'Cost baseline', completed: true }, { name: '10% reduction', completed: true }, { name: '15% target', completed: false }], trend: 'improving', target_date: '2024-06-30', status: 'in_progress' },
      { user_id: 15, user_name: 'William Harris', goal_type: 'compliance', goal_description: 'Complete SOC 2 Type II certification', current_value: 85, target_value: 100, progress_percentage: 85.0, ai_insights: 'Most controls implemented. Final documentation and audit pending.', ai_recommendations: ['Complete policy documentation', 'Schedule audit', 'Train team on procedures'], milestones: [{ name: 'Gap assessment', completed: true }, { name: 'Controls implemented', completed: true }, { name: 'Audit completed', completed: false }], trend: 'stable', target_date: '2024-04-30', status: 'in_progress' },
      { user_id: 2, user_name: 'Demo User', goal_type: 'personal_development', goal_description: 'Read 12 technical books this year', current_value: 3, target_value: 12, progress_percentage: 25.0, ai_insights: 'On pace for yearly goal. Consider audiobooks for commute time.', ai_recommendations: ['Schedule daily reading time', 'Join a book club', 'Share learnings with team'], milestones: [{ name: 'First book', completed: true }, { name: 'Q1 goal (3 books)', completed: true }, { name: 'Half-year (6 books)', completed: false }], trend: 'stable', target_date: '2024-12-31', status: 'in_progress' }
    ];

    for (const progress of aiProgressItems) {
      await pool.query(
        'INSERT INTO ai_progress (user_id, user_name, goal_type, goal_description, current_value, target_value, progress_percentage, ai_insights, ai_recommendations, milestones, trend, target_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
        [progress.user_id, progress.user_name, progress.goal_type, progress.goal_description, progress.current_value, progress.target_value, progress.progress_percentage, progress.ai_insights, JSON.stringify(progress.ai_recommendations), JSON.stringify(progress.milestones), progress.trend, progress.target_date, progress.status]
      );
    }

    console.log('Database seeded successfully!');
    console.log('\n========================================');
    console.log('Demo credentials: demo@onboardflow.com / password123');
    console.log('========================================\n');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
