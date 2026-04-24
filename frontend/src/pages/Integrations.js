import React, { useState, useEffect } from 'react';
import { Plug, Check, X, ExternalLink } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { integrationsAPI } from '../services/api';
import { useToast } from '../components/Toast';

const IntegrationForm = ({ data, onChange }) => (
  <div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Name *</label>
      <input type="text" value={data.name || ''} onChange={(e) => onChange({ ...data, name: e.target.value })} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
    </div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Provider *</label>
      <input type="text" value={data.provider || ''} onChange={(e) => onChange({ ...data, provider: e.target.value })} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
    </div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Description</label>
      <textarea value={data.description || ''} onChange={(e) => onChange({ ...data, description: e.target.value })} rows={3} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, resize: 'vertical' }} />
    </div>
    <div>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Status</label>
      <select value={data.status || 'inactive'} onChange={(e) => onChange({ ...data, status: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: 'white' }}>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  </div>
);

const Integrations = () => {
  const toast = useToast();
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => { try { const response = await integrationsAPI.getAll(); const data = Array.isArray(response.data) ? response.data : response.data.data || []; setIntegrations(data); } catch (error) { console.error('Error:', error); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (data) => { await integrationsAPI.create(data); toast.success('Integration created successfully'); fetchData(); };
  const handleUpdate = async (id, data) => { await integrationsAPI.update(id, data); toast.success('Integration updated successfully'); fetchData(); };
  const handleDelete = async (id) => { await integrationsAPI.delete(id); toast.success('Integration deleted successfully'); fetchData(); };

  const columns = [
    { key: 'name', label: 'Integration', render: (value, row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, background: row.status === 'active' ? '#dcfce7' : '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Plug size={18} color={row.status === 'active' ? '#16a34a' : '#64748b'} />
        </div>
        <div><div style={{ fontWeight: 500 }}>{value}</div><div style={{ fontSize: 12, color: '#64748b' }}>{row.provider}</div></div>
      </div>
    )},
    { key: 'description', label: 'Description', render: (v) => <span style={{ color: '#64748b' }}>{v?.substring(0, 50)}...</span> },
    { key: 'status', label: 'Status', render: (value) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: value === 'active' ? '#10b981' : '#94a3b8' }} />
        <span style={{ fontSize: 13, color: value === 'active' ? '#10b981' : '#64748b' }}>{value}</span>
      </div>
    )}
  ];

  const detailFields = [
    { key: 'id', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'provider', label: 'Provider' },
    { key: 'description', label: 'Description' }, { key: 'status', label: 'Status' },
    { key: 'last_synced', label: 'Last Synced', render: (v) => v ? new Date(v).toLocaleString() : 'Never' },
    { key: 'created_at', label: 'Created At', render: (v) => new Date(v).toLocaleString() }
  ];

  return <DataTable title="Integrations" data={integrations} columns={columns} loading={loading} addButtonText="Add Integration" FormComponent={IntegrationForm} onSubmit={handleSubmit} onUpdate={handleUpdate} onDelete={handleDelete} detailFields={detailFields} emptyIcon={Plug} onExportCSV={integrationsAPI.exportCSV} onExportPDF={integrationsAPI.exportPDF} />;
};

export default Integrations;
