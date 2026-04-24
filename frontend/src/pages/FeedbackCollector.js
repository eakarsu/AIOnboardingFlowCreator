import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, AlertTriangle, Sparkles, CheckCircle } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { feedbackAPI, aiGenerateAPI } from '../services/api';
import { useToast } from '../components/Toast';

const sampleData = [
  { user_name: 'Emily Chang', feedback_type: 'suggestion', category: 'feature', subject: 'Dark mode support for the dashboard', content: 'I work late hours and the bright white dashboard is really hard on my eyes. Would love a dark mode toggle, especially for the analytics charts and data tables.', priority: 'medium', status: 'new' },
  { user_name: 'David Martinez', feedback_type: 'bug_report', category: 'functionality', subject: 'Export to PDF fails for reports over 50 pages', content: 'When generating quarterly reports with more than 50 pages, the PDF export times out after 30 seconds. Smaller reports under 30 pages export fine. This is blocking our monthly board reporting.', priority: 'high', status: 'new' },
  { user_name: 'Lisa Nakamura', feedback_type: 'praise', category: 'UI/UX', subject: 'The new onboarding flow is fantastic!', content: 'Just wanted to say the redesigned onboarding experience is amazing. It took me less than 5 minutes to set up my workspace compared to 20+ minutes before.', priority: 'low', status: 'new' },
  { user_name: 'Robert Taylor', feedback_type: 'complaint', category: 'performance', subject: 'Dashboard loading times are unacceptable', content: 'The main dashboard now takes 8-12 seconds to load, up from 2-3 seconds last month. This is destroying our team\'s productivity.', priority: 'high', status: 'new' },
];

const getSentimentColor = (sentiment) => {
  const colors = { positive: '#10b981', negative: '#ef4444', neutral: '#6b7280', mixed: '#f59e0b' };
  return colors[sentiment] || '#6b7280';
};

const getSentimentIcon = (sentiment) => {
  const icons = { positive: ThumbsUp, negative: ThumbsDown, neutral: MessageSquare, mixed: AlertTriangle };
  const Icon = icons[sentiment] || MessageSquare;
  return <Icon size={14} />;
};

const getTypeColor = (type) => {
  const colors = { suggestion: '#3b82f6', bug: '#ef4444', bug_report: '#ef4444', praise: '#10b981', complaint: '#f59e0b' };
  return colors[type] || '#6b7280';
};

const getPriorityColor = (priority) => {
  const colors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
  return colors[priority] || '#6b7280';
};

const FeedbackForm = ({ data, onChange }) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const analyzeWithAI = async () => {
    setAiLoading(true);
    try {
      const response = await aiGenerateAPI.analyzeFeedback(data);
      setAiResult(response.data.analysis);
      if (response.data.analysis && typeof response.data.analysis === 'object') {
        onChange({
          ...data,
          sentiment: response.data.analysis.sentiment,
          sentiment_score: response.data.analysis.sentiment_score,
          ai_analysis: response.data.analysis.analysis,
          ai_action_items: response.data.analysis.action_items
        });
      }
    } catch (error) {
      console.error('Error analyzing:', error);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 12px', background: '#f8fafc', borderRadius: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 11, color: '#94a3b8', alignSelf: 'center', marginRight: 4 }}>Load sample:</span>
        {sampleData.map((sample, i) => (
          <button key={i} type="button" onClick={() => { onChange({ ...data, ...sample }); setAiResult(null); }}
            style={{ padding: '4px 10px', fontSize: 11, fontWeight: 500, background: 'linear-gradient(135deg, #ede9fe, #f3e8ff)', color: '#7c3aed', border: '1px solid #ddd6fe', borderRadius: 20, cursor: 'pointer' }}>
            {['Feature Request', 'Bug Report', 'Positive', 'Complaint'][i]}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Your Name *</label>
          <input type="text" value={data.user_name || ''} onChange={(e) => onChange({ ...data, user_name: e.target.value })} required
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Feedback Type</label>
          <select value={data.feedback_type || 'suggestion'} onChange={(e) => onChange({ ...data, feedback_type: e.target.value })}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: 'white' }}>
            <option value="suggestion">Suggestion</option>
            <option value="bug">Bug Report</option>
            <option value="praise">Praise</option>
            <option value="complaint">Complaint</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Category</label>
          <select value={data.category || 'product'} onChange={(e) => onChange({ ...data, category: e.target.value })}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: 'white' }}>
            <option value="product">Product</option>
            <option value="feature">Feature</option>
            <option value="functionality">Functionality</option>
            <option value="ui">UI/UX</option>
            <option value="performance">Performance</option>
            <option value="support">Support</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Priority</label>
          <select value={data.priority || 'medium'} onChange={(e) => onChange({ ...data, priority: e.target.value })}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: 'white' }}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Subject *</label>
        <input type="text" value={data.subject || ''} onChange={(e) => onChange({ ...data, subject: e.target.value })} required
          placeholder="Brief summary of your feedback"
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Details *</label>
        <textarea value={data.content || ''} onChange={(e) => onChange({ ...data, content: e.target.value })} rows={4} required
          placeholder="Provide detailed feedback..."
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, resize: 'vertical' }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Status</label>
        <select value={data.status || 'new'} onChange={(e) => onChange({ ...data, status: e.target.value })}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: 'white' }}>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
      <button type="button" onClick={analyzeWithAI} disabled={aiLoading || !data.content}
        style={{ width: '100%', padding: '12px', marginBottom: 16, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600 }}>
        <Sparkles size={18} /> {aiLoading ? 'Analyzing...' : 'Analyze with AI'}
      </button>
      {aiResult && (
        <div style={{ background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)', padding: 16, borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Sparkles size={16} style={{ color: '#8b5cf6' }} />
            <span style={{ fontWeight: 600, color: '#7c3aed' }}>AI Analysis</span>
          </div>
          {typeof aiResult === 'object' ? (
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {aiResult.sentiment && <span style={{ padding: '4px 12px', borderRadius: 16, fontSize: 12, background: getSentimentColor(aiResult.sentiment) + '30', color: getSentimentColor(aiResult.sentiment) }}>{aiResult.sentiment}</span>}
                {aiResult.urgency && <span style={{ padding: '4px 12px', borderRadius: 16, fontSize: 12, background: '#f1f5f9', color: '#64748b' }}>Urgency: {aiResult.urgency}</span>}
              </div>
              {aiResult.analysis && <p style={{ color: '#581c87', fontSize: 14, marginBottom: 12 }}>{aiResult.analysis}</p>}
              {aiResult.action_items?.length > 0 && (
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#7c3aed', marginBottom: 8 }}>Suggested Actions:</div>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {aiResult.action_items.map((item, i) => (
                      <li key={i} style={{ fontSize: 13, color: '#581c87', marginBottom: 4 }}>
                        {typeof item === 'object' ? `${item.action} - ${item.owner} (${item.priority})` : item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {aiResult.response_suggestion && (
                <div style={{ marginTop: 12, padding: 12, background: 'white', borderRadius: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#7c3aed', marginBottom: 4 }}>Suggested Response:</div>
                  <p style={{ color: '#581c87', fontSize: 13, margin: 0 }}>{aiResult.response_suggestion}</p>
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: '#581c87', fontSize: 14, whiteSpace: 'pre-wrap' }}>{aiResult}</p>
          )}
        </div>
      )}
    </div>
  );
};

const FeedbackCollector = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchFeedbacks = async () => {
    try {
      const response = await feedbackAPI.getAll();
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setFeedbacks(data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeedbacks(); }, []);

  const handleSubmit = async (data) => {
    await feedbackAPI.create({ ...data, user_id: 1 });
    toast.success('Feedback submitted successfully');
    fetchFeedbacks();
  };

  const handleUpdate = async (id, data) => {
    await feedbackAPI.update(id, data);
    toast.success('Feedback updated successfully');
    fetchFeedbacks();
  };

  const handleDelete = async (id) => {
    await feedbackAPI.delete(id);
    toast.success('Feedback deleted');
    fetchFeedbacks();
  };

  const columns = [
    {
      key: 'subject',
      label: 'Subject',
      render: (value, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: getTypeColor(row.feedback_type) + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: getTypeColor(row.feedback_type) }}>
            <MessageSquare size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>by {row.user_name}</div>
          </div>
        </div>
      )
    },
    {
      key: 'feedback_type',
      label: 'Type',
      render: (value) => (
        <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: getTypeColor(value) + '20', color: getTypeColor(value), textTransform: 'capitalize' }}>
          {value?.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'sentiment',
      label: 'Sentiment',
      render: (value) => value ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 16, fontSize: 12, background: getSentimentColor(value) + '20', color: getSentimentColor(value) }}>
          {getSentimentIcon(value)} {value}
        </span>
      ) : <span style={{ color: '#cbd5e1', fontSize: 12 }}>-</span>
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (value) => (
        <span style={{ padding: '4px 10px', borderRadius: 16, fontSize: 12, fontWeight: 500, background: getPriorityColor(value) + '20', color: getPriorityColor(value) }}>
          {value}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: value === 'resolved' ? '#10b981' : value === 'in_progress' ? '#f59e0b' : '#64748b' }}>
          {value === 'resolved' && <CheckCircle size={14} />}
          {value?.replace('_', ' ')}
        </span>
      )
    }
  ];

  const detailFields = [
    { key: 'id', label: 'ID' },
    { key: 'subject', label: 'Subject' },
    { key: 'user_name', label: 'From' },
    { key: 'feedback_type', label: 'Type', render: (v) => v?.replace('_', ' ') },
    { key: 'category', label: 'Category' },
    { key: 'content', label: 'Content' },
    { key: 'sentiment', label: 'Sentiment', render: (v) => v || '-' },
    { key: 'sentiment_score', label: 'Sentiment Score', render: (v) => v ? `${(v * 100).toFixed(0)}%` : '-' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status', render: (v) => v?.replace('_', ' ') },
    { key: 'ai_analysis', label: 'AI Analysis', render: (v) => v || '-' },
    { key: 'ai_action_items', label: 'Action Items', render: (v) => {
      if (!v) return '-';
      const items = typeof v === 'string' ? JSON.parse(v) : v;
      return items.map(i => typeof i === 'object' ? i.action : i).join('; ');
    }},
    { key: 'created_at', label: 'Created At', render: (v) => v ? new Date(v).toLocaleString() : '-' }
  ];

  return (
    <DataTable
      title="AI Feedback Collector"
      data={feedbacks}
      columns={columns}
      loading={loading}
      addButtonText="New Feedback"
      FormComponent={FeedbackForm}
      onSubmit={handleSubmit}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      detailFields={detailFields}
      emptyIcon={MessageSquare}
      onExportCSV={feedbackAPI.exportCSV}
      onExportPDF={feedbackAPI.exportPDF}
    />
  );
};

export default FeedbackCollector;
