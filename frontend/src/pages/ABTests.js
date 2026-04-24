import React, { useState, useEffect } from 'react';
import { FlaskConical, Play, Pause, Trophy } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { abTestsAPI } from '../services/api';
import { useToast } from '../components/Toast';

const ABTestForm = ({ data, onChange }) => (
  <div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Test Name *</label>
      <input type="text" value={data.name || ''} onChange={(e) => onChange({ ...data, name: e.target.value })} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
    </div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Description</label>
      <textarea value={data.description || ''} onChange={(e) => onChange({ ...data, description: e.target.value })} rows={3} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, resize: 'vertical' }} />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Traffic Split (%)</label>
        <input type="number" min="0" max="100" value={data.traffic_split || 50} onChange={(e) => onChange({ ...data, traffic_split: parseInt(e.target.value) })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Status</label>
        <select value={data.status || 'draft'} onChange={(e) => onChange({ ...data, status: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: 'white' }}>
          <option value="draft">Draft</option><option value="running">Running</option><option value="completed">Completed</option>
        </select>
      </div>
    </div>
  </div>
);

const ABTests = () => {
  const toast = useToast();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => { try { const res = await abTestsAPI.getAll(); setTests(res.data); } catch (e) { console.error(e); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, []);
  const handleSubmit = async (data) => { await abTestsAPI.create(data); toast.success('A/B Test created successfully'); fetchData(); };
  const handleUpdate = async (id, data) => { await abTestsAPI.update(id, data); toast.success('A/B Test updated successfully'); fetchData(); };
  const handleDelete = async (id) => { await abTestsAPI.delete(id); toast.success('A/B Test deleted successfully'); fetchData(); };

  const statusColors = { draft: { bg: '#f1f5f9', color: '#64748b' }, running: { bg: '#dbeafe', color: '#2563eb' }, completed: { bg: '#dcfce7', color: '#16a34a' } };

  const columns = [
    { key: 'name', label: 'Test', render: (v, r) => (<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 36, height: 36, background: '#fef3c7', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FlaskConical size={18} color="#d97706" /></div><div><div style={{ fontWeight: 500 }}>{v}</div><div style={{ fontSize: 12, color: '#64748b' }}>{r.description?.substring(0, 40)}...</div></div></div>) },
    { key: 'traffic_split', label: 'Split', render: (v) => (<div style={{ display: 'flex', gap: 4, fontSize: 13 }}><span style={{ color: '#6366f1' }}>A: {v}%</span><span style={{ color: '#94a3b8' }}>|</span><span style={{ color: '#8b5cf6' }}>B: {100 - v}%</span></div>) },
    { key: 'status', label: 'Status', render: (v) => { const c = statusColors[v] || statusColors.draft; return (<span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: c.bg, color: c.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>{v === 'running' && <Play size={12} />}{v === 'completed' && <Trophy size={12} />}{v}</span>); } },
    { key: 'winner', label: 'Winner', render: (v) => v ? (<span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#dcfce7', color: '#16a34a' }}>Variant {v}</span>) : '-' }
  ];

  const detailFields = [
    { key: 'id', label: 'ID' }, { key: 'name', label: 'Test Name' }, { key: 'description', label: 'Description' },
    { key: 'traffic_split', label: 'Traffic Split', render: (v) => `A: ${v}% / B: ${100 - v}%` },
    { key: 'status', label: 'Status' }, { key: 'winner', label: 'Winner' },
    { key: 'variant_a_config', label: 'Variant A Config' }, { key: 'variant_b_config', label: 'Variant B Config' },
    { key: 'created_at', label: 'Created At', render: (v) => new Date(v).toLocaleString() }
  ];

  return <DataTable title="A/B Tests" data={tests} columns={columns} loading={loading} addButtonText="New Test" FormComponent={ABTestForm} onSubmit={handleSubmit} onUpdate={handleUpdate} onDelete={handleDelete} detailFields={detailFields} emptyIcon={FlaskConical} onExportCSV={abTestsAPI.exportCSV} onExportPDF={abTestsAPI.exportPDF} />;
};

export default ABTests;
