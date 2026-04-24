import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { tooltipsAPI } from '../services/api';
import { useToast } from '../components/Toast';

const TooltipForm = ({ data, onChange }) => (
  <div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Title *</label>
      <input type="text" value={data.title || ''} onChange={(e) => onChange({ ...data, title: e.target.value })} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
    </div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Content *</label>
      <textarea value={data.content || ''} onChange={(e) => onChange({ ...data, content: e.target.value })} rows={3} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, resize: 'vertical' }} />
    </div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Element Selector *</label>
      <input type="text" value={data.element_selector || ''} onChange={(e) => onChange({ ...data, element_selector: e.target.value })} placeholder="#my-element" required style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Position</label>
        <select value={data.position || 'top'} onChange={(e) => onChange({ ...data, position: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: 'white' }}>
          <option value="top">Top</option><option value="bottom">Bottom</option><option value="left">Left</option><option value="right">Right</option>
        </select>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Trigger</label>
        <select value={data.trigger_type || 'hover'} onChange={(e) => onChange({ ...data, trigger_type: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: 'white' }}>
          <option value="hover">Hover</option><option value="click">Click</option><option value="focus">Focus</option>
        </select>
      </div>
    </div>
  </div>
);

const Tooltips = () => {
  const toast = useToast();
  const [tooltips, setTooltips] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => { try { const res = await tooltipsAPI.getAll(); setTooltips(res.data); } catch (e) { console.error(e); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, []);
  const handleSubmit = async (data) => { await tooltipsAPI.create(data); toast.success('Tooltip created successfully'); fetchData(); };
  const handleUpdate = async (id, data) => { await tooltipsAPI.update(id, data); toast.success('Tooltip updated successfully'); fetchData(); };
  const handleDelete = async (id) => { await tooltipsAPI.delete(id); toast.success('Tooltip deleted successfully'); fetchData(); };

  const columns = [
    { key: 'title', label: 'Tooltip', render: (v, r) => (<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 36, height: 36, background: '#dbeafe', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageCircle size={18} color="#2563eb" /></div><div><div style={{ fontWeight: 500 }}>{v}</div><code style={{ fontSize: 11, color: '#64748b' }}>{r.element_selector}</code></div></div>) },
    { key: 'position', label: 'Position' },
    { key: 'trigger_type', label: 'Trigger' },
    { key: 'is_active', label: 'Active', render: (v) => (<span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: v ? '#dcfce7' : '#f1f5f9', color: v ? '#16a34a' : '#64748b' }}>{v ? 'Yes' : 'No'}</span>) }
  ];

  const detailFields = [
    { key: 'id', label: 'ID' }, { key: 'title', label: 'Title' }, { key: 'content', label: 'Content' },
    { key: 'element_selector', label: 'Element Selector' }, { key: 'position', label: 'Position' },
    { key: 'trigger_type', label: 'Trigger Type' }, { key: 'is_active', label: 'Active', render: (v) => v ? 'Yes' : 'No' },
    { key: 'created_at', label: 'Created At', render: (v) => new Date(v).toLocaleString() }
  ];

  return <DataTable title="Tooltips" data={tooltips} columns={columns} loading={loading} addButtonText="New Tooltip" FormComponent={TooltipForm} onSubmit={handleSubmit} onUpdate={handleUpdate} onDelete={handleDelete} detailFields={detailFields} emptyIcon={MessageCircle} onExportCSV={tooltipsAPI.exportCSV} onExportPDF={tooltipsAPI.exportPDF} />;
};

export default Tooltips;
