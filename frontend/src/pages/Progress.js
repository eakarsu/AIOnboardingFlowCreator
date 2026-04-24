import React, { useState, useEffect } from 'react';
import { TrendingUp, User, CheckCircle, Clock } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { progressAPI } from '../services/api';
import { useToast } from '../components/Toast';

const ProgressForm = ({ data, onChange }) => {
  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' };
  const labelStyle = { display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 };

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>User ID</label>
        <input type="number" value={data.user_id || ''} onChange={(e) => onChange({ ...data, user_id: e.target.value })} style={inputStyle} required />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Flow ID</label>
        <input type="number" value={data.flow_id || ''} onChange={(e) => onChange({ ...data, flow_id: e.target.value })} style={inputStyle} required />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Current Step</label>
          <input type="number" value={data.current_step || 0} onChange={(e) => onChange({ ...data, current_step: parseInt(e.target.value) || 0 })} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Total Steps</label>
          <input type="number" value={data.total_steps || 0} onChange={(e) => onChange({ ...data, total_steps: parseInt(e.target.value) || 0 })} style={inputStyle} />
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Completion %</label>
        <input type="number" step="0.1" value={data.percentage_complete || 0} onChange={(e) => onChange({ ...data, percentage_complete: parseFloat(e.target.value) || 0 })} style={inputStyle} />
      </div>
    </>
  );
};

const Progress = () => {
  const toast = useToast();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await progressAPI.getAll();
      setProgress(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (data) => {
    await progressAPI.create(data);
    toast.success('Progress created successfully');
    fetchData();
  };

  const handleUpdate = async (id, data) => {
    await progressAPI.update(id, data);
    toast.success('Progress updated successfully');
    fetchData();
  };

  const handleDelete = async (id) => {
    // Progress tracking typically uses a custom delete via the API
    try {
      const api = (await import('../services/api')).default;
      await api.delete(`/progress/${id}`);
      toast.success('Progress deleted successfully');
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const columns = [
    { key: 'user_id', label: 'User', render: (v, r) => (<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 36, height: 36, background: '#ede9fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={18} color="#7c3aed" /></div><div><div style={{ fontWeight: 500 }}>User #{v}</div><div style={{ fontSize: 12, color: '#64748b' }}>Flow: {r.flow_name || `#${r.flow_id}`}</div></div></div>) },
    { key: 'current_step', label: 'Progress', render: (v, r) => (<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 13 }}>{v} / {r.total_steps}</span></div>) },
    { key: 'percentage_complete', label: 'Completion', render: (v) => (<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 80, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}><div style={{ width: `${v || 0}%`, height: '100%', background: v >= 100 ? '#10b981' : '#6366f1', borderRadius: 3 }} /></div><span style={{ fontSize: 13, color: '#64748b' }}>{(v || 0).toFixed(0)}%</span></div>) },
    { key: 'completed_at', label: 'Status', render: (v) => v ? (<span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981' }}><CheckCircle size={14} /> Completed</span>) : (<span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b' }}><Clock size={14} /> In Progress</span>) }
  ];

  const detailFields = [
    { key: 'id', label: 'ID' }, { key: 'user_id', label: 'User ID' }, { key: 'flow_id', label: 'Flow ID' },
    { key: 'current_step', label: 'Current Step' }, { key: 'total_steps', label: 'Total Steps' },
    { key: 'percentage_complete', label: 'Completion %', render: (v) => `${(v || 0).toFixed(1)}%` },
    { key: 'started_at', label: 'Started At', render: (v) => v ? new Date(v).toLocaleString() : '-' },
    { key: 'completed_at', label: 'Completed At', render: (v) => v ? new Date(v).toLocaleString() : 'Not completed' },
    { key: 'last_activity', label: 'Last Activity', render: (v) => v ? new Date(v).toLocaleString() : '-' }
  ];

  return (
    <DataTable
      title="Progress Tracking"
      data={progress}
      columns={columns}
      loading={loading}
      detailFields={detailFields}
      FormComponent={ProgressForm}
      onSubmit={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      emptyIcon={TrendingUp}
      searchable={true}
      addButtonText="Add Progress"
    />
  );
};

export default Progress;
