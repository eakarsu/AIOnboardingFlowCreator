import React, { useState, useEffect } from 'react';
import { FileText, Star, Crown } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { templatesAPI } from '../services/api';
import { useToast } from '../components/Toast';

const TemplateForm = ({ data, onChange }) => (
  <div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Name *</label>
      <input type="text" value={data.name || ''} onChange={(e) => onChange({ ...data, name: e.target.value })} placeholder="Template name" required style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
    </div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Description</label>
      <textarea value={data.description || ''} onChange={(e) => onChange({ ...data, description: e.target.value })} rows={3} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, resize: 'vertical' }} />
    </div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Category</label>
      <input type="text" value={data.category || ''} onChange={(e) => onChange({ ...data, category: e.target.value })} placeholder="e.g., Welcome, Tutorial" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
    </div>
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
        <input type="checkbox" checked={data.is_premium || false} onChange={(e) => onChange({ ...data, is_premium: e.target.checked })} />
        <span style={{ fontSize: 14 }}>Premium Template</span>
      </label>
    </div>
  </div>
);

const Templates = () => {
  const toast = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => { try { const response = await templatesAPI.getAll(); const data = Array.isArray(response.data) ? response.data : response.data.data || []; setTemplates(data); } catch (error) { console.error('Error:', error); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (data) => { await templatesAPI.create(data); toast.success('Template created successfully'); fetchData(); };
  const handleUpdate = async (id, data) => { await templatesAPI.update(id, data); toast.success('Template updated successfully'); fetchData(); };
  const handleDelete = async (id) => { await templatesAPI.delete(id); toast.success('Template deleted successfully'); fetchData(); };

  const columns = [
    { key: 'name', label: 'Template', render: (value, row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, background: row.is_premium ? '#fef3c7' : '#f0fdf4', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {row.is_premium ? <Crown size={18} color="#d97706" /> : <FileText size={18} color="#16a34a" />}
        </div>
        <div><div style={{ fontWeight: 500 }}>{value}</div><div style={{ fontSize: 12, color: '#64748b' }}>{row.category}</div></div>
      </div>
    )},
    { key: 'rating', label: 'Rating', render: (value) => (<div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={14} color="#f59e0b" fill="#f59e0b" /><span>{value || 0}</span></div>) },
    { key: 'usage_count', label: 'Uses', render: (value) => (value || 0).toLocaleString() },
    { key: 'is_premium', label: 'Type', render: (value) => (<span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: value ? '#fef3c7' : '#f0fdf4', color: value ? '#d97706' : '#16a34a' }}>{value ? 'Premium' : 'Free'}</span>) }
  ];

  const detailFields = [
    { key: 'id', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'description', label: 'Description' },
    { key: 'category', label: 'Category' }, { key: 'rating', label: 'Rating' }, { key: 'usage_count', label: 'Usage Count' },
    { key: 'is_premium', label: 'Premium', render: (v) => v ? 'Yes' : 'No' }, { key: 'created_at', label: 'Created At', render: (v) => new Date(v).toLocaleString() }
  ];

  return <DataTable title="Templates" data={templates} columns={columns} loading={loading} addButtonText="New Template" FormComponent={TemplateForm} onSubmit={handleSubmit} onUpdate={handleUpdate} onDelete={handleDelete} detailFields={detailFields} emptyIcon={FileText} onExportCSV={templatesAPI.exportCSV} onExportPDF={templatesAPI.exportPDF} />;
};

export default Templates;
