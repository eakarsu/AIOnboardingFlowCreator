import React, { useState, useEffect } from 'react';
import { CheckSquare, Sparkles, Calendar, Check, Square } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { aiChecklistsAPI, aiGenerateAPI } from '../services/api';
import { useToast } from '../components/Toast';

const sampleData = [
  { name: 'New Hire First Day Checklist', description: 'Essential tasks for an employee\'s first day including system access, team introductions, and workspace setup', user_name: 'HR Coordinator', checklist_type: 'onboarding', priority: 'high', status: 'active' },
  { name: 'Product Launch Readiness', description: 'Pre-launch checklist covering marketing assets, QA sign-off, documentation, and go-to-market coordination', user_name: 'Product Manager', checklist_type: 'launch', priority: 'high', status: 'active' },
  { name: 'Quarterly Security Audit', description: 'Comprehensive security review including access controls, vulnerability scanning, compliance verification', user_name: 'Security Engineer', checklist_type: 'security', priority: 'high', status: 'active' },
  { name: 'Sprint Planning Ceremony', description: 'Step-by-step checklist for running an effective sprint planning session', user_name: 'Scrum Master', checklist_type: 'meeting_prep', priority: 'medium', status: 'active' },
];

const getPriorityColor = (priority) => {
  const colors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
  return colors[priority] || '#6b7280';
};

const ChecklistForm = ({ data, onChange }) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const items = Array.isArray(data.items) ? data.items :
    (typeof data.items === 'string' ? (() => { try { return JSON.parse(data.items); } catch { return []; } })() : []);

  const generateWithAI = async () => {
    setAiLoading(true);
    try {
      const response = await aiGenerateAPI.generateAIChecklist({
        checklist_type: data.checklist_type, context: data.description || data.name,
        user_role: data.user_name, number_of_items: 5
      });
      setAiResult(response.data.checklist);
      if (response.data.checklist?.items) {
        onChange({ ...data, items: response.data.checklist.items, ai_suggestions: response.data.checklist.suggestions });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 12px', background: '#f8fafc', borderRadius: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 11, color: '#94a3b8', alignSelf: 'center', marginRight: 4 }}>Load sample:</span>
        {sampleData.map((sample, i) => (
          <button key={i} type="button" onClick={() => { onChange({ ...data, ...sample, items: [], due_date: '' }); setAiResult(null); }}
            style={{ padding: '4px 10px', fontSize: 11, fontWeight: 500, background: 'linear-gradient(135deg, #ede9fe, #f3e8ff)', color: '#7c3aed', border: '1px solid #ddd6fe', borderRadius: 20, cursor: 'pointer' }}>
            {['New Hire', 'Launch', 'Security', 'Sprint'][i]}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Checklist Name *</label>
          <input type="text" value={data.name || ''} onChange={(e) => onChange({ ...data, name: e.target.value })} required
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Type</label>
          <select value={data.checklist_type || 'onboarding'} onChange={(e) => onChange({ ...data, checklist_type: e.target.value })}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: 'white' }}>
            <option value="onboarding">Onboarding</option>
            <option value="project">Project</option>
            <option value="daily">Daily Tasks</option>
            <option value="meeting">Meeting Prep</option>
            <option value="review">Code Review</option>
            <option value="security">Security</option>
            <option value="hiring">Hiring</option>
            <option value="launch">Launch</option>
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Description / Context</label>
        <textarea value={data.description || ''} onChange={(e) => onChange({ ...data, description: e.target.value })} rows={2}
          placeholder="Describe the purpose or context..."
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, resize: 'vertical' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Assigned To</label>
          <input type="text" value={data.user_name || ''} onChange={(e) => onChange({ ...data, user_name: e.target.value })}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
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
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Due Date</label>
          <input type="date" value={data.due_date?.split('T')[0] || ''} onChange={(e) => onChange({ ...data, due_date: e.target.value || null })}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
        </div>
      </div>
      {items.length > 0 && (
        <div style={{ marginBottom: 16, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 8 }}>Items ({items.length})</label>
          {items.slice(0, 5).map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 13 }}>
              {item.done ? <Check size={14} style={{ color: '#10b981' }} /> : <Square size={14} style={{ color: '#cbd5e1' }} />}
              <span style={{ color: item.done ? '#94a3b8' : '#1e293b' }}>{item.title}</span>
            </div>
          ))}
          {items.length > 5 && <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>+{items.length - 5} more</div>}
        </div>
      )}
      <button type="button" onClick={generateWithAI} disabled={aiLoading || !data.name}
        style={{ width: '100%', padding: '12px', marginBottom: 16, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600 }}>
        <Sparkles size={18} /> {aiLoading ? 'Generating...' : 'Generate with AI'}
      </button>
      {aiResult && (
        <div style={{ background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)', padding: 16, borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Sparkles size={16} style={{ color: '#8b5cf6' }} />
            <span style={{ fontWeight: 600, color: '#7c3aed' }}>AI Generated</span>
          </div>
          {aiResult.suggestions && <p style={{ color: '#581c87', fontSize: 13, marginBottom: 8 }}>{aiResult.suggestions}</p>}
          {aiResult.tips?.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: 20, color: '#581c87', fontSize: 13 }}>
              {aiResult.tips.map((tip, i) => <li key={i}>{tip}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

const AIChecklists = () => {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchChecklists = async () => {
    try {
      const response = await aiChecklistsAPI.getAll();
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setChecklists(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load checklists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChecklists(); }, []);

  const parseItems = (items) => {
    if (Array.isArray(items)) return items;
    if (typeof items === 'string') { try { return JSON.parse(items); } catch { return []; } }
    return [];
  };

  const handleSubmit = async (data) => {
    const items = parseItems(data.items);
    await aiChecklistsAPI.create({
      ...data, user_id: 1, items, total_items: items.length,
      completed_items: items.filter(i => i.done).length,
      due_date: data.due_date || null
    });
    toast.success('Checklist created successfully');
    fetchChecklists();
  };

  const handleUpdate = async (id, data) => {
    const items = parseItems(data.items);
    await aiChecklistsAPI.update(id, {
      ...data, items, total_items: items.length,
      completed_items: items.filter(i => i.done).length,
      due_date: data.due_date || null
    });
    toast.success('Checklist updated successfully');
    fetchChecklists();
  };

  const handleDelete = async (id) => {
    await aiChecklistsAPI.delete(id);
    toast.success('Checklist deleted');
    fetchChecklists();
  };

  const columns = [
    {
      key: 'name',
      label: 'Checklist',
      render: (value, row) => {
        const items = parseItems(row.items);
        const completed = items.filter(i => i.done).length;
        const pct = items.length > 0 ? (completed / items.length) * 100 : 0;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: pct === 100 ? '#10b981' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              {pct === 100 ? <Check size={18} /> : <CheckSquare size={18} />}
            </div>
            <div>
              <div style={{ fontWeight: 500 }}>{value}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{row.checklist_type}</div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'user_name',
      label: 'Assigned To',
      render: (value) => <span>{value || '-'}</span>
    },
    {
      key: 'items',
      label: 'Progress',
      render: (value) => {
        const items = parseItems(value);
        const completed = items.filter(i => i.done).length;
        const pct = items.length > 0 ? (completed / items.length) * 100 : 0;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 60, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#10b981' : 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: pct === 100 ? '#10b981' : '#6366f1' }}>{completed}/{items.length}</span>
          </div>
        );
      }
    },
    {
      key: 'due_date',
      label: 'Due Date',
      render: (value) => value ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#64748b' }}>
          <Calendar size={14} /> {value?.split('T')[0]}
        </div>
      ) : <span style={{ color: '#cbd5e1', fontSize: 12 }}>-</span>
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (value) => (
        <span style={{ padding: '4px 10px', borderRadius: 16, fontSize: 12, fontWeight: 500, background: getPriorityColor(value) + '20', color: getPriorityColor(value) }}>{value}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: value === 'completed' ? '#dcfce7' : value === 'active' ? '#dbeafe' : '#fef3c7', color: value === 'completed' ? '#16a34a' : value === 'active' ? '#2563eb' : '#d97706' }}>{value}</span>
      )
    }
  ];

  const detailFields = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'user_name', label: 'Assigned To', render: (v) => v || '-' },
    { key: 'checklist_type', label: 'Type' },
    { key: 'items', label: 'Items', render: (v) => {
      const items = parseItems(v);
      return items.map(i => `${i.done ? '[x]' : '[ ]'} ${i.title}`).join('\n') || '-';
    }},
    { key: 'priority', label: 'Priority' },
    { key: 'due_date', label: 'Due Date', render: (v) => v?.split('T')[0] || '-' },
    { key: 'status', label: 'Status' },
    { key: 'ai_suggestions', label: 'AI Suggestions', render: (v) => v || '-' },
    { key: 'created_at', label: 'Created At', render: (v) => v ? new Date(v).toLocaleString() : '-' }
  ];

  return (
    <DataTable
      title="AI Checklist Generator"
      data={checklists}
      columns={columns}
      loading={loading}
      addButtonText="New Checklist"
      FormComponent={ChecklistForm}
      onSubmit={handleSubmit}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      detailFields={detailFields}
      emptyIcon={CheckSquare}
      onExportCSV={aiChecklistsAPI.exportCSV}
      onExportPDF={aiChecklistsAPI.exportPDF}
    />
  );
};

export default AIChecklists;
