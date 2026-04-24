import React, { useState, useEffect } from 'react';
import { UserCog } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { personalizationAPI } from '../services/api';
import { useToast } from '../components/Toast';

const PersonalizationForm = ({ data, onChange }) => (
  <div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Rule Name *</label>
      <input type="text" value={data.name || ''} onChange={(e) => onChange({ ...data, name: e.target.value })} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
    </div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Description</label>
      <textarea value={data.description || ''} onChange={(e) => onChange({ ...data, description: e.target.value })} rows={2} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, resize: 'vertical' }} />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Rule Type *</label>
        <select value={data.rule_type || 'content'} onChange={(e) => onChange({ ...data, rule_type: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: 'white' }}>
          <option value="content">Content</option><option value="styling">Styling</option><option value="layout">Layout</option><option value="behavior">Behavior</option>
        </select>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Priority</label>
        <input type="number" min="0" value={data.priority || 0} onChange={(e) => onChange({ ...data, priority: parseInt(e.target.value) })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
      </div>
    </div>
    <div><label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="checkbox" checked={data.is_active !== false} onChange={(e) => onChange({ ...data, is_active: e.target.checked })} /><span style={{ fontSize: 14 }}>Active</span></label></div>
  </div>
);

const Personalization = () => {
  const toast = useToast();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => { try { const res = await personalizationAPI.getAll(); setRules(res.data); } catch (e) { console.error(e); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, []);
  const handleSubmit = async (data) => { await personalizationAPI.create(data); toast.success('Personalization rule created successfully'); fetchData(); };
  const handleUpdate = async (id, data) => { await personalizationAPI.update(id, data); toast.success('Personalization rule updated successfully'); fetchData(); };
  const handleDelete = async (id) => { await personalizationAPI.delete(id); toast.success('Personalization rule deleted successfully'); fetchData(); };

  const typeColors = { content: '#6366f1', styling: '#8b5cf6', layout: '#0ea5e9', behavior: '#10b981' };

  const columns = [
    { key: 'name', label: 'Rule', render: (v, r) => (<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 36, height: 36, background: '#ede9fe', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserCog size={18} color="#7c3aed" /></div><div><div style={{ fontWeight: 500 }}>{v}</div><div style={{ fontSize: 12, color: '#64748b' }}>{r.description?.substring(0, 40)}...</div></div></div>) },
    { key: 'rule_type', label: 'Type', render: (v) => (<span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: `${typeColors[v] || '#6366f1'}15`, color: typeColors[v] || '#6366f1' }}>{v}</span>) },
    { key: 'priority', label: 'Priority', render: (v) => <span style={{ fontWeight: 500 }}>{v}</span> },
    { key: 'is_active', label: 'Status', render: (v) => (<span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: v ? '#dcfce7' : '#f1f5f9', color: v ? '#16a34a' : '#64748b' }}>{v ? 'Active' : 'Inactive'}</span>) }
  ];

  const detailFields = [
    { key: 'id', label: 'ID' }, { key: 'name', label: 'Rule Name' }, { key: 'description', label: 'Description' },
    { key: 'rule_type', label: 'Rule Type' }, { key: 'conditions', label: 'Conditions' },
    { key: 'content_variations', label: 'Content Variations' }, { key: 'priority', label: 'Priority' },
    { key: 'is_active', label: 'Active', render: (v) => v ? 'Yes' : 'No' },
    { key: 'created_at', label: 'Created At', render: (v) => new Date(v).toLocaleString() }
  ];

  return <DataTable title="Personalization Rules" data={rules} columns={columns} loading={loading} addButtonText="New Rule" FormComponent={PersonalizationForm} onSubmit={handleSubmit} onUpdate={handleUpdate} onDelete={handleDelete} detailFields={detailFields} emptyIcon={UserCog} onExportCSV={personalizationAPI.exportCSV} onExportPDF={personalizationAPI.exportPDF} />;
};

export default Personalization;
