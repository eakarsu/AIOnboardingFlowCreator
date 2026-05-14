import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { triggersAPI, fireTrigger } from '../services/api';
import { useToast } from '../components/Toast';

const TriggerForm = ({ data, onChange }) => (
  <div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Name *</label>
      <input type="text" value={data.name || ''} onChange={(e) => onChange({ ...data, name: e.target.value })} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
    </div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Description</label>
      <textarea value={data.description || ''} onChange={(e) => onChange({ ...data, description: e.target.value })} rows={2} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, resize: 'vertical' }} />
    </div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Event Type *</label>
      <select value={data.event_type || 'user_login'} onChange={(e) => onChange({ ...data, event_type: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: 'white' }}>
        <option value="user_login">User Login</option><option value="page_view">Page View</option><option value="element_click">Element Click</option>
        <option value="form_submit">Form Submit</option><option value="trial_start">Trial Start</option><option value="feature_access">Feature Access</option>
      </select>
    </div>
    <div><label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="checkbox" checked={data.is_active !== false} onChange={(e) => onChange({ ...data, is_active: e.target.checked })} /><span style={{ fontSize: 14 }}>Active</span></label></div>
  </div>
);

const Triggers = () => {
  const toast = useToast();
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firingId, setFiringId] = useState(null);
  const [fireResult, setFireResult] = useState(null);

  const fetchData = async () => {
    try {
      const res = await triggersAPI.getAll();
      setTriggers(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);
  const handleSubmit = async (data) => { await triggersAPI.create(data); toast.success('Trigger created successfully'); fetchData(); };
  const handleUpdate = async (id, data) => { await triggersAPI.update(id, data); toast.success('Trigger updated successfully'); fetchData(); };
  const handleDelete = async (id) => { await triggersAPI.delete(id); toast.success('Trigger deleted successfully'); fetchData(); };

  const handleFire = async (id) => {
    setFiringId(id);
    try {
      const res = await fireTrigger(id, {});
      setFireResult(res.data);
      if (res.data.fired) {
        toast.success(`Trigger fired! Event ID: ${res.data.eventId}`);
      } else {
        toast.warning('Trigger conditions not met');
      }
      fetchData();
    } catch (e) {
      toast.error('Failed to fire trigger: ' + (e.response?.data?.error || e.message));
    } finally {
      setFiringId(null);
    }
  };

  const columns = [
    { key: 'name', label: 'Trigger', render: (v, r) => (<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 36, height: 36, background: r.is_active ? '#fef3c7' : '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={18} color={r.is_active ? '#d97706' : '#94a3b8'} /></div><div><div style={{ fontWeight: 500 }}>{v}</div><div style={{ fontSize: 12, color: '#64748b' }}>{r.event_type}</div></div></div>) },
    { key: 'fire_count', label: 'Fires', render: (v) => <span style={{ fontWeight: 500 }}>{(v || 0).toLocaleString()}</span> },
    { key: 'is_active', label: 'Status', render: (v) => (<span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: v ? '#dcfce7' : '#f1f5f9', color: v ? '#16a34a' : '#64748b' }}>{v ? 'Active' : 'Inactive'}</span>) },
    { key: 'last_fired', label: 'Last Fired', render: (v) => v ? new Date(v).toLocaleDateString() : 'Never' },
    {
      key: 'id', label: 'Actions', render: (id) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleFire(id); }}
          disabled={firingId === id}
          style={{ padding: '5px 10px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <Zap size={12} />
          {firingId === id ? 'Firing…' : 'Fire'}
        </button>
      )
    }
  ];

  const detailFields = [
    { key: 'id', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'description', label: 'Description' },
    { key: 'event_type', label: 'Event Type' }, { key: 'conditions', label: 'Conditions' },
    { key: 'actions', label: 'Actions' }, { key: 'fire_count', label: 'Fire Count' },
    { key: 'is_active', label: 'Active', render: (v) => v ? 'Yes' : 'No' },
    { key: 'last_fired', label: 'Last Fired', render: (v) => v ? new Date(v).toLocaleString() : 'Never' },
    { key: 'created_at', label: 'Created At', render: (v) => new Date(v).toLocaleString() }
  ];

  return (
    <div>
      {/* Fire result banner */}
      {fireResult && (
        <div style={{ background: fireResult.fired ? '#fefce8' : '#fef2f2', border: `1px solid ${fireResult.fired ? '#fde047' : '#fecaca'}`, borderRadius: 10, padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={16} color={fireResult.fired ? '#d97706' : '#dc2626'} />
            <span style={{ fontWeight: 600, color: fireResult.fired ? '#92400e' : '#991b1b' }}>
              {fireResult.fired ? `Trigger "${fireResult.triggerName}" fired successfully` : 'Trigger conditions not met'}
            </span>
          </div>
          <button onClick={() => setFireResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 18 }}>&times;</button>
        </div>
      )}
      <DataTable title="Triggers" data={triggers} columns={columns} loading={loading} addButtonText="New Trigger" FormComponent={TriggerForm} onSubmit={handleSubmit} onUpdate={handleUpdate} onDelete={handleDelete} detailFields={detailFields} emptyIcon={Zap} onExportCSV={triggersAPI.exportCSV} onExportPDF={triggersAPI.exportPDF} />
    </div>
  );
};

export default Triggers;
