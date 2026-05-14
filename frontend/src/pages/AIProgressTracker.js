import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, TrendingDown, Minus, Sparkles, Calendar, Award } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { aiProgressAPI, aiGenerateAPI } from '../services/api';
import { useToast } from '../components/Toast';

const goalTypes = [
  { value: 'skill_development', label: 'Skill Development' },
  { value: 'certification', label: 'Certification' },
  { value: 'sales_target', label: 'Sales Target' },
  { value: 'team_metric', label: 'Team Metric' },
  { value: 'personal_development', label: 'Personal Development' },
  { value: 'product_metrics', label: 'Product Metrics' },
  { value: 'operational_efficiency', label: 'Operational Efficiency' },
  { value: 'compliance', label: 'Compliance' }
];

const sampleData = [
  { user_name: 'James Liu', goal_type: 'certification', goal_description: 'Pass AWS Solutions Architect Professional certification exam. Currently studying networking and security domains.', current_value: 72, target_value: 100, target_date: '2025-06-15', status: 'in_progress' },
  { user_name: 'Rachel Foster', goal_type: 'sales_target', goal_description: 'Achieve Q2 sales revenue target of $500K. Currently at $187K with strong pipeline.', current_value: 187000, target_value: 500000, target_date: '2025-06-30', status: 'in_progress' },
  { user_name: 'Dev Team Alpha', goal_type: 'product_metrics', goal_description: 'Increase unit test coverage from 45% to 80% across all microservices.', current_value: 45, target_value: 80, target_date: '2025-09-01', status: 'in_progress' },
  { user_name: 'Sophie Anderson', goal_type: 'personal_development', goal_description: 'Read 24 professional development books this year covering leadership, communication, and technical topics.', current_value: 8, target_value: 24, target_date: '2025-12-31', status: 'in_progress' },
];

const getTrendIcon = (trend) => {
  if (trend === 'improving') return <TrendingUp size={14} style={{ color: '#10b981' }} />;
  if (trend === 'declining') return <TrendingDown size={14} style={{ color: '#ef4444' }} />;
  return <Minus size={14} style={{ color: '#6b7280' }} />;
};

const getTrendColor = (trend) => {
  const colors = { improving: '#10b981', declining: '#ef4444', stable: '#6b7280' };
  return colors[trend] || '#6b7280';
};

const getStatusColor = (status) => {
  const colors = { in_progress: '#3b82f6', completed: '#10b981', at_risk: '#ef4444' };
  return colors[status] || '#6b7280';
};

const ProgressForm = ({ data, onChange }) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const analyzeWithAI = async () => {
    setAiLoading(true);
    try {
      const response = await aiGenerateAPI.analyzeProgress(data);
      setAiResult(response.data.analysis);
      if (response.data.analysis && typeof response.data.analysis === 'object') {
        onChange({
          ...data,
          ai_insights: response.data.analysis.insights,
          ai_recommendations: response.data.analysis.recommendations,
          trend: response.data.analysis.trend
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  // Apply pass 5 — forward-looking projection (separate from analyze-progress).
  const predictWithAI = async () => {
    setAiLoading(true);
    try {
      const response = await aiGenerateAPI.predictProgress({
        user_name: data.user_name,
        goal_type: data.goal_type,
        goal_description: data.goal_description,
        current_value: data.current_value,
        target_value: data.target_value,
        start_date: data.start_date,
        days_horizon: 30,
      });
      setAiResult(response.data.analysis);
    } catch (error) {
      const msg = error.response?.data?.error || error.message || 'Failed';
      const detail = error.response?.data?.detail;
      setAiResult({ insights: detail ? `${msg}: ${detail}` : msg });
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
            {['AWS Cert', 'Sales Revenue', 'Test Coverage', 'Book Reading'][i]}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Name *</label>
          <input type="text" value={data.user_name || ''} onChange={(e) => onChange({ ...data, user_name: e.target.value })} required
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Goal Type</label>
          <select value={data.goal_type || 'skill_development'} onChange={(e) => onChange({ ...data, goal_type: e.target.value })}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: 'white' }}>
            {goalTypes.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Goal Description *</label>
        <textarea value={data.goal_description || ''} onChange={(e) => onChange({ ...data, goal_description: e.target.value })} rows={3} required
          placeholder="Describe your goal in detail..."
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, resize: 'vertical' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Current Value</label>
          <input type="number" value={data.current_value || 0} onChange={(e) => onChange({ ...data, current_value: parseFloat(e.target.value) })}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Target Value *</label>
          <input type="number" value={data.target_value || 100} onChange={(e) => onChange({ ...data, target_value: parseFloat(e.target.value) })} required
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Target Date</label>
          <input type="date" value={data.target_date?.split('T')[0] || ''} onChange={(e) => onChange({ ...data, target_date: e.target.value || null })}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Status</label>
        <select value={data.status || 'in_progress'} onChange={(e) => onChange({ ...data, status: e.target.value })}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: 'white' }}>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="at_risk">At Risk</option>
        </select>
      </div>
      <button type="button" onClick={analyzeWithAI} disabled={aiLoading || !data.goal_description}
        style={{ width: '100%', padding: '12px', marginBottom: 8, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600 }}>
        <Sparkles size={18} /> {aiLoading ? 'Analyzing...' : 'Get AI Analysis'}
      </button>
      <button type="button" onClick={predictWithAI} disabled={aiLoading || !data.goal_type || !data.target_value}
        style={{ width: '100%', padding: '12px', marginBottom: 16, background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600 }}>
        <Target size={18} /> {aiLoading ? 'Predicting...' : 'Predict Progress (30d)'}
      </button>
      {aiResult && (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', padding: 16, borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Sparkles size={16} style={{ color: '#10b981' }} />
            <span style={{ fontWeight: 600, color: '#166534' }}>AI Analysis</span>
            {typeof aiResult === 'object' && aiResult.trend && (
              <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: getTrendColor(aiResult.trend) }}>
                {getTrendIcon(aiResult.trend)} {aiResult.trend}
              </span>
            )}
          </div>
          {typeof aiResult === 'object' ? (
            <div>
              {aiResult.insights && <p style={{ color: '#14532d', fontSize: 14, marginBottom: 12 }}>{aiResult.insights}</p>}
              {aiResult.recommendations?.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#166534', marginBottom: 4 }}>Recommendations:</div>
                  <ul style={{ margin: 0, paddingLeft: 20, color: '#14532d', fontSize: 13 }}>
                    {aiResult.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
              {aiResult.motivation_message && (
                <div style={{ padding: 12, background: 'white', borderRadius: 8, marginTop: 8 }}>
                  <p style={{ color: '#166534', fontSize: 13, margin: 0, fontStyle: 'italic' }}>"{aiResult.motivation_message}"</p>
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: '#14532d', fontSize: 14, whiteSpace: 'pre-wrap' }}>{aiResult}</p>
          )}
        </div>
      )}
    </div>
  );
};

const AIProgressTracker = () => {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchProgress = async () => {
    try {
      const response = await aiProgressAPI.getAll();
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setProgress(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProgress(); }, []);

  const handleSubmit = async (data) => {
    await aiProgressAPI.create({ ...data, user_id: 1, target_date: data.target_date || null });
    toast.success('Goal created successfully');
    fetchProgress();
  };

  const handleUpdate = async (id, data) => {
    await aiProgressAPI.update(id, { ...data, target_date: data.target_date || null });
    toast.success('Goal updated successfully');
    fetchProgress();
  };

  const handleDelete = async (id) => {
    await aiProgressAPI.delete(id);
    toast.success('Goal deleted');
    fetchProgress();
  };

  const columns = [
    {
      key: 'user_name',
      label: 'User',
      render: (value, row) => {
        const pct = parseFloat(row.progress_percentage) || 0;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: pct >= 100 ? '#10b981' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              {pct >= 100 ? <Award size={18} /> : <Target size={18} />}
            </div>
            <div>
              <div style={{ fontWeight: 500 }}>{value}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{goalTypes.find(g => g.value === row.goal_type)?.label || row.goal_type}</div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'goal_description',
      label: 'Goal',
      render: (value) => (
        <span style={{ fontSize: 13, color: '#64748b', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
          {value?.slice(0, 60)}{value?.length > 60 ? '...' : ''}
        </span>
      )
    },
    {
      key: 'progress_percentage',
      label: 'Progress',
      render: (value, row) => {
        const pct = parseFloat(value) || 0;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 60, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: pct >= 100 ? '#10b981' : 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: pct >= 100 ? '#10b981' : '#6366f1' }}>{pct.toFixed(0)}%</span>
          </div>
        );
      }
    },
    {
      key: 'trend',
      label: 'Trend',
      render: (value) => value ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: getTrendColor(value) }}>
          {getTrendIcon(value)} {value}
        </span>
      ) : <span style={{ color: '#cbd5e1', fontSize: 12 }}>-</span>
    },
    {
      key: 'target_date',
      label: 'Due',
      render: (value) => value ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#64748b' }}>
          <Calendar size={14} /> {value?.split('T')[0]}
        </div>
      ) : <span style={{ color: '#cbd5e1', fontSize: 12 }}>-</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: getStatusColor(value) + '20', color: getStatusColor(value) }}>{value?.replace('_', ' ')}</span>
      )
    }
  ];

  const detailFields = [
    { key: 'id', label: 'ID' },
    { key: 'user_name', label: 'User' },
    { key: 'goal_type', label: 'Goal Type', render: (v) => goalTypes.find(g => g.value === v)?.label || v },
    { key: 'goal_description', label: 'Description' },
    { key: 'current_value', label: 'Current Value' },
    { key: 'target_value', label: 'Target Value' },
    { key: 'progress_percentage', label: 'Progress', render: (v) => `${parseFloat(v || 0).toFixed(1)}%` },
    { key: 'trend', label: 'Trend', render: (v) => v || '-' },
    { key: 'target_date', label: 'Target Date', render: (v) => v?.split('T')[0] || '-' },
    { key: 'status', label: 'Status', render: (v) => v?.replace('_', ' ') },
    { key: 'ai_insights', label: 'AI Insights', render: (v) => v || '-' },
    { key: 'ai_recommendations', label: 'AI Recommendations', render: (v) => {
      if (!v) return '-';
      const recs = typeof v === 'string' ? JSON.parse(v) : v;
      return Array.isArray(recs) ? recs.join('; ') : v;
    }},
    { key: 'created_at', label: 'Created At', render: (v) => v ? new Date(v).toLocaleString() : '-' }
  ];

  return (
    <DataTable
      title="AI Progress Tracker"
      data={progress}
      columns={columns}
      loading={loading}
      addButtonText="New Goal"
      FormComponent={ProgressForm}
      onSubmit={handleSubmit}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      detailFields={detailFields}
      emptyIcon={Target}
      onExportCSV={aiProgressAPI.exportCSV}
      onExportPDF={aiProgressAPI.exportPDF}
    />
  );
};

export default AIProgressTracker;
