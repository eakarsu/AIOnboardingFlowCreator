import React, { useState, useEffect } from 'react';
import { CheckSquare } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { checklistsAPI } from '../services/api';
import { useToast } from '../components/Toast';

const ChecklistForm = ({ data, onChange }) => (
  <div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Name *</label>
      <input type="text" value={data.name || ''} onChange={(e) => onChange({ ...data, name: e.target.value })} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
    </div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Description</label>
      <textarea value={data.description || ''} onChange={(e) => onChange({ ...data, description: e.target.value })} rows={3} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, resize: 'vertical' }} />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Display Position</label>
        <select value={data.display_position || 'bottom-right'} onChange={(e) => onChange({ ...data, display_position: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: 'white' }}>
          <option value="bottom-right">Bottom Right</option><option value="bottom-left">Bottom Left</option><option value="top-right">Top Right</option><option value="center">Center</option>
        </select>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Completion Action</label>
        <input type="text" value={data.completion_action || ''} onChange={(e) => onChange({ ...data, completion_action: e.target.value })} placeholder="show_celebration" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
      </div>
    </div>
  </div>
);

const Checklists = () => {
  const toast = useToast();
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => { try { const res = await checklistsAPI.getAll(); setChecklists(res.data); } catch (e) { console.error(e); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, []);
  const handleSubmit = async (data) => { await checklistsAPI.create(data); toast.success('Checklist created successfully'); fetchData(); };
  const handleUpdate = async (id, data) => { await checklistsAPI.update(id, data); toast.success('Checklist updated successfully'); fetchData(); };
  const handleDelete = async (id) => { await checklistsAPI.delete(id); toast.success('Checklist deleted successfully'); fetchData(); };

  const columns = [
    { key: 'name', label: 'Checklist', render: (v, r) => (<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 36, height: 36, background: '#dcfce7', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckSquare size={18} color="#16a34a" /></div><div><div style={{ fontWeight: 500 }}>{v}</div><div style={{ fontSize: 12, color: '#64748b' }}>{r.description?.substring(0, 40)}...</div></div></div>) },
    { key: 'items', label: 'Items', render: (v) => <span>{Array.isArray(v) ? v.length : (typeof v === 'object' ? Object.keys(v).length : 0)} items</span> },
    { key: 'display_position', label: 'Position' },
    { key: 'completion_action', label: 'On Complete' }
  ];

  const detailFields = [
    { key: 'id', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'description', label: 'Description' },
    { key: 'items', label: 'Items' }, { key: 'display_position', label: 'Display Position' },
    { key: 'completion_action', label: 'Completion Action' }, { key: 'is_dismissible', label: 'Dismissible', render: (v) => v ? 'Yes' : 'No' },
    { key: 'created_at', label: 'Created At', render: (v) => new Date(v).toLocaleString() }
  ];

  return <DataTable title="Checklists" data={checklists} columns={columns} loading={loading} addButtonText="New Checklist" FormComponent={ChecklistForm} onSubmit={handleSubmit} onUpdate={handleUpdate} onDelete={handleDelete} detailFields={detailFields} emptyIcon={CheckSquare} onExportCSV={checklistsAPI.exportCSV} onExportPDF={checklistsAPI.exportPDF} />;
};

export default Checklists;
