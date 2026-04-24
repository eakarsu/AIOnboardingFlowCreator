import React, { useState, useEffect } from 'react';
import { Sparkles, Wand2, MessageSquare, Mail, CheckSquare, Bell, FileText, Loader, Copy, Check, ChevronRight, Circle } from 'lucide-react';
import { aiContentAPI, aiGenerateAPI } from '../services/api';

const GeneratorCard = ({ icon: Icon, title, description, onClick, loading }) => (
  <div
    onClick={loading ? null : onClick}
    style={{
      background: 'white',
      borderRadius: 12,
      padding: 20,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      cursor: loading ? 'wait' : 'pointer',
      transition: 'all 0.2s',
      opacity: loading ? 0.7 : 1
    }}
    onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; } }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'; }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        {loading ? <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <Icon size={20} />}
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>{title}</h3>
    </div>
    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{description}</p>
  </div>
);

// Beautiful content renderer based on content type
const ContentRenderer = ({ data, type }) => {
  // For simple text content
  if (typeof data === 'string') {
    return (
      <div style={{ fontSize: 15, lineHeight: 1.8, color: '#1e293b' }}>
        {data}
      </div>
    );
  }

  // For checklist items
  if (type === 'checklist' && Array.isArray(data)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {data.map((item, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: 16,
            background: '#f8fafc',
            borderRadius: 10,
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              border: '2px solid #6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 2
            }}>
              <Check size={14} color="#6366f1" />
            </div>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
                {item.title || item.name || `Item ${index + 1}`}
              </h4>
              {item.description && (
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // For flow steps
  if (type === 'steps' && Array.isArray(data)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {data.map((step, index) => (
          <div key={index} style={{
            display: 'flex',
            gap: 16,
            padding: 20,
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: 12,
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 600,
              fontSize: 14,
              flexShrink: 0
            }}>
              {index + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <h4 style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>
                  {step.title || `Step ${index + 1}`}
                </h4>
                {step.step_type && (
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 500,
                    background: '#ede9fe',
                    color: '#7c3aed'
                  }}>
                    {step.step_type}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{step.content}</p>
              {step.element_selector && (
                <code style={{
                  display: 'inline-block',
                  marginTop: 8,
                  padding: '4px 8px',
                  background: '#1e293b',
                  color: '#10b981',
                  borderRadius: 4,
                  fontSize: 11
                }}>
                  {step.element_selector}
                </code>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // For notification
  if (type === 'notification' && typeof data === 'object') {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRadius: 12,
        padding: 24,
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Bell size={18} color="#fbbf24" />
          <span style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Notification Preview</span>
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{data.title}</h3>
        <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 16 }}>{data.message}</p>
        {data.cta && (
          <button style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none',
            borderRadius: 8,
            color: 'white',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer'
          }}>
            {data.cta}
          </button>
        )}
      </div>
    );
  }

  // For email sequence
  if (type === 'email' && Array.isArray(data)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {data.map((email, index) => (
          <div key={index} style={{
            background: 'white',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <Mail size={16} color="white" />
              <span style={{ color: 'white', fontSize: 13, fontWeight: 500 }}>
                {email.timing || email.send_timing || `Email ${index + 1}`}
              </span>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Subject</span>
                <h4 style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>{email.subject || email.subject_line}</h4>
              </div>
              {(email.preview || email.preview_text) && (
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Preview</span>
                  <p style={{ fontSize: 13, color: '#64748b' }}>{email.preview || email.preview_text}</p>
                </div>
              )}
              {(email.content || email.main_content) && (
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Content</span>
                  <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{email.content || email.main_content}</p>
                </div>
              )}
              {email.cta && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  background: '#6366f1',
                  borderRadius: 6,
                  color: 'white',
                  fontSize: 13,
                  fontWeight: 500
                }}>
                  {email.cta}
                  <ChevronRight size={14} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Fallback for any other array data
  if (Array.isArray(data)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((item, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: 12,
            background: '#f8fafc',
            borderRadius: 8
          }}>
            <Circle size={8} color="#6366f1" style={{ marginTop: 6, flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: '#1e293b', lineHeight: 1.6 }}>
              {typeof item === 'object' ? (item.title || item.name || item.content || JSON.stringify(item)) : item}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Fallback for objects
  if (typeof data === 'object') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Object.entries(data).map(([key, value]) => (
          <div key={key} style={{
            padding: 12,
            background: '#f8fafc',
            borderRadius: 8,
            border: '1px solid #e2e8f0'
          }}>
            <span style={{
              display: 'block',
              fontSize: 11,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: 4
            }}>
              {key.replace(/_/g, ' ')}
            </span>
            <span style={{ fontSize: 14, color: '#1e293b' }}>
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return <div style={{ color: '#64748b' }}>No content to display</div>;
};

const AIContent = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await aiContentAPI.getAll();
        setContent(response.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const generators = [
    { id: 'welcome', icon: MessageSquare, title: 'Welcome Message', description: 'Generate engaging welcome messages for new users', type: 'text',
      samples: [
        { label: 'SaaS Onboarding', params: { appName: 'CloudFlow', targetAudience: 'marketing teams switching from spreadsheets', tone: 'friendly and empowering' } },
        { label: 'E-commerce', params: { appName: 'ShopVibe', targetAudience: 'first-time online shoppers aged 25-45', tone: 'warm and trustworthy' } },
        { label: 'Health App', params: { appName: 'VitalSync', targetAudience: 'health-conscious professionals tracking fitness goals', tone: 'motivating and supportive' } },
        { label: 'Finance Tool', params: { appName: 'WealthPath', targetAudience: 'millennials starting their investment journey', tone: 'confident yet approachable' } }
      ],
      defaultParams: { appName: 'MyApp', targetAudience: 'new users', tone: 'friendly' },
      apiCall: (params) => aiGenerateAPI.welcomeMessage(params)
    },
    { id: 'tooltip', icon: Wand2, title: 'Tooltip Content', description: 'Create helpful tooltip messages for UI elements', type: 'text',
      samples: [
        { label: 'Dashboard Widget', params: { feature: 'Revenue Analytics Dashboard Widget', context: 'B2B SaaS analytics platform showing real-time MRR trends', maxLength: 120 } },
        { label: 'Settings Toggle', params: { feature: 'Two-Factor Authentication Toggle', context: 'Security settings page in a banking application', maxLength: 100 } },
        { label: 'Data Export', params: { feature: 'Export to CSV Button', context: 'Project management tool with complex filtered data views', maxLength: 100 } }
      ],
      defaultParams: { feature: 'Dashboard', context: 'SaaS application' },
      apiCall: (params) => aiGenerateAPI.tooltipContent(params)
    },
    { id: 'checklist', icon: CheckSquare, title: 'Checklist Items', description: 'Generate onboarding checklist items', type: 'checklist',
      samples: [
        { label: 'Developer Setup', params: { goal: 'Set up local development environment and ship first feature', userType: 'junior developer joining a startup', numberOfItems: 6 } },
        { label: 'Marketing Launch', params: { goal: 'Launch first email campaign and track conversions', userType: 'marketing manager at a D2C brand', numberOfItems: 5 } },
        { label: 'HR Onboarding', params: { goal: 'Complete all first-week onboarding tasks for new hire', userType: 'HR coordinator at a 200-person company', numberOfItems: 7 } }
      ],
      defaultParams: { goal: 'Complete setup', userType: 'new user', numberOfItems: 5 },
      apiCall: (params) => aiGenerateAPI.checklistItems(params)
    },
    { id: 'notification', icon: Bell, title: 'Notification Copy', description: 'Create compelling notification messages', type: 'notification',
      samples: [
        { label: 'Abandoned Setup', params: { notificationType: 're-engagement', context: 'User signed up 3 days ago but never completed profile setup', urgency: 'medium' } },
        { label: 'Feature Launch', params: { notificationType: 'announcement', context: 'New AI-powered search feature released for all Pro users', urgency: 'low' } },
        { label: 'Trial Expiring', params: { notificationType: 'urgency', context: 'Free trial expires in 48 hours, user has used 80% of features', urgency: 'high' } }
      ],
      defaultParams: { notificationType: 'reminder', context: 'User inactive', urgency: 'medium' },
      apiCall: (params) => aiGenerateAPI.notificationCopy(params)
    },
    { id: 'email', icon: Mail, title: 'Email Sequence', description: 'Generate multi-email onboarding sequences', type: 'email',
      samples: [
        { label: 'SaaS Activation', params: { numberOfEmails: 4, productName: 'DataPulse Analytics', goal: 'Guide trial users from signup to creating their first dashboard and inviting teammates' } },
        { label: 'E-commerce Welcome', params: { numberOfEmails: 3, productName: 'ArtisanBox', goal: 'Welcome new subscribers and drive their first curated box purchase with a discount' } },
        { label: 'B2B Onboarding', params: { numberOfEmails: 5, productName: 'TeamForge CRM', goal: 'Onboard sales teams from CRM import to closing their first deal using the platform' } }
      ],
      defaultParams: { numberOfEmails: 3, productName: 'MyApp', goal: 'User activation' },
      apiCall: (params) => aiGenerateAPI.emailSequence(params)
    },
    { id: 'steps', icon: FileText, title: 'Flow Steps', description: 'Generate complete onboarding flow steps', type: 'steps',
      samples: [
        { label: 'CRM Platform', params: { flowName: 'CRM Quick Start', flowDescription: 'Help sales reps import contacts, set up pipeline stages, and log their first deal', numberOfSteps: 6, features: 'contact import, deal pipeline, email integration, task management' } },
        { label: 'Design Tool', params: { flowName: 'Design Studio Tour', flowDescription: 'Guide designers through canvas tools, asset library, and team collaboration features', numberOfSteps: 5, features: 'canvas editor, asset library, team sharing, export options, templates' } },
        { label: 'Analytics Suite', params: { flowName: 'Analytics Onboarding', flowDescription: 'Walk data analysts through connecting data sources, building dashboards, and scheduling reports', numberOfSteps: 7, features: 'data connectors, query builder, dashboard designer, scheduled reports, alerts' } }
      ],
      defaultParams: { flowName: 'Welcome Flow', numberOfSteps: 5 },
      apiCall: (params) => aiGenerateAPI.flowSteps(params)
    }
  ];

  const handleGenerate = async (generator, params) => {
    setGenerating(generator.id);
    setResult(null);
    try {
      const response = await generator.apiCall(params || generator.defaultParams);
      setResult({ title: generator.title, type: generator.type, data: response.data });
      const res = await aiContentAPI.getAll();
      setContent(res.data);
    } catch (error) {
      console.error('Error generating:', error);
      alert('Failed to generate content. Make sure your OpenRouter API key is configured in the .env file.');
    } finally {
      setGenerating(null);
    }
  };

  const getContentData = (data) => {
    return data.content || data.items || data.steps || data.notification || data.emails || data.improved;
  };

  const handleCopy = (data) => {
    const content = getContentData(data);
    navigator.clipboard.writeText(typeof content === 'object' ? JSON.stringify(content, null, 2) : content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>AI Content Generator</h1>
        <p style={{ color: '#64748b' }}>Generate onboarding content using AI. Click any card below to generate.</p>
      </div>

      {/* Generators Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
        {generators.map((gen) => (
          <div key={gen.id}>
            <GeneratorCard {...gen} loading={generating === gen.id} onClick={() => handleGenerate(gen)} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, padding: '8px 12px', background: '#f8fafc', borderRadius: 8 }}>
              <span style={{ fontSize: 11, color: '#94a3b8', alignSelf: 'center', marginRight: 4 }}>Samples:</span>
              {gen.samples.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); handleGenerate(gen, sample.params); }}
                  disabled={generating === gen.id}
                  style={{
                    padding: '4px 10px',
                    fontSize: 11,
                    fontWeight: 500,
                    background: 'linear-gradient(135deg, #ede9fe, #f3e8ff)',
                    color: '#7c3aed',
                    border: '1px solid #ddd6fe',
                    borderRadius: 20,
                    cursor: generating === gen.id ? 'wait' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: generating === gen.id ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => { e.target.style.background = 'linear-gradient(135deg, #ddd6fe, #e9d5ff)'; }}
                  onMouseLeave={(e) => { e.target.style.background = 'linear-gradient(135deg, #ede9fe, #f3e8ff)'; }}
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Result */}
      {result && (
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={18} color="white" />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b' }}>Generated: {result.title}</h2>
            </div>
            <button
              onClick={() => handleCopy(result.data)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                background: copied ? '#dcfce7' : '#f1f5f9',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                color: copied ? '#16a34a' : '#475569',
                transition: 'all 0.2s'
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <ContentRenderer data={getContentData(result.data)} type={result.type} />
          {result.data.tokensUsed && (
            <div style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>Tokens used:</span>
              <span style={{
                padding: '2px 8px',
                background: '#ede9fe',
                color: '#7c3aed',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 500
              }}>
                {result.data.tokensUsed}
              </span>
            </div>
          )}
        </div>
      )}

      {/* History */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>Generation History</h2>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : content.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 12, padding: 40, textAlign: 'center', color: '#64748b' }}>
            <Sparkles size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p>No generated content yet. Click a generator above to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {content.slice(0, 10).map((item) => (
              <div key={item.id} style={{
                background: 'white',
                borderRadius: 12,
                padding: 16,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{item.title}</span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(item.created_at).toLocaleString()}</span>
                </div>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 12 }}>
                  {item.generated_content?.substring(0, 150)}...
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, background: '#f1f5f9', color: '#64748b' }}>
                    {item.content_type}
                  </span>
                  <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, background: '#ede9fe', color: '#7c3aed' }}>
                    {item.tokens_used} tokens
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AIContent;
