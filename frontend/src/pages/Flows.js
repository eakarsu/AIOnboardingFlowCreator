import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, CheckCircle, Clock, Users, Trash2 } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { flowsAPI } from '../services/api';
import { useToast } from '../components/Toast';

const FlowForm = ({ data, onChange }) => (
  <div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
        Flow Name *
      </label>
      <input
        type="text"
        value={data.name || ''}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
        placeholder="e.g., New User Welcome Flow"
        required
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          fontSize: 14
        }}
      />
    </div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
        Description
      </label>
      <textarea
        value={data.description || ''}
        onChange={(e) => onChange({ ...data, description: e.target.value })}
        placeholder="Describe what this flow does..."
        rows={3}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          fontSize: 14,
          resize: 'vertical'
        }}
      />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
          Target Audience
        </label>
        <input
          type="text"
          value={data.target_audience || ''}
          onChange={(e) => onChange({ ...data, target_audience: e.target.value })}
          placeholder="e.g., New Users"
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            fontSize: 14
          }}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
          Trigger Event
        </label>
        <input
          type="text"
          value={data.trigger_event || ''}
          onChange={(e) => onChange({ ...data, trigger_event: e.target.value })}
          placeholder="e.g., user_signup"
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            fontSize: 14
          }}
        />
      </div>
    </div>
    <div style={{ marginTop: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
        Status
      </label>
      <select
        value={data.status || 'draft'}
        onChange={(e) => onChange({ ...data, status: e.target.value })}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          fontSize: 14,
          background: 'white'
        }}
      >
        <option value="draft">Draft</option>
        <option value="active">Active</option>
      </select>
    </div>
  </div>
);

const Flows = () => {
  const navigate = useNavigate();
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchFlows = async () => {
    try {
      const response = await flowsAPI.getAll();
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setFlows(data);
    } catch (error) {
      console.error('Error fetching flows:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlows();
  }, []);

  const handleSubmit = async (data) => {
    await flowsAPI.create(data);
    toast.success('Flow created successfully');
    fetchFlows();
  };

  const handleUpdate = async (id, data) => {
    await flowsAPI.update(id, data);
    toast.success('Flow updated successfully');
    fetchFlows();
  };

  const handleDelete = async (id) => {
    await flowsAPI.delete(id);
    toast.success('Flow deleted');
    fetchFlows();
  };

  const columns = [
    {
      key: 'name',
      label: 'Flow Name',
      render: (value, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            background: row.status === 'active' ? '#dcfce7' : '#fef3c7',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {row.status === 'active' ? (
              <CheckCircle size={18} color="#16a34a" />
            ) : (
              <Clock size={18} color="#d97706" />
            )}
          </div>
          <div>
            <div style={{ fontWeight: 500 }}>{value}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{row.trigger_event}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span style={{
          padding: '4px 10px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 500,
          background: value === 'active' ? '#dcfce7' : '#fef3c7',
          color: value === 'active' ? '#16a34a' : '#d97706'
        }}>
          {value}
        </span>
      )
    },
    {
      key: 'target_audience',
      label: 'Audience',
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Users size={14} color="#64748b" />
          <span>{value || '-'}</span>
        </div>
      )
    },
    {
      key: 'total_steps',
      label: 'Steps',
      render: (value) => <span>{value} steps</span>
    },
    {
      key: 'completion_rate',
      label: 'Completion',
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 60,
            height: 6,
            background: '#e2e8f0',
            borderRadius: 3,
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${value || 0}%`,
              height: '100%',
              background: value >= 70 ? '#10b981' : value >= 40 ? '#f59e0b' : '#ef4444',
              borderRadius: 3
            }} />
          </div>
          <span style={{ fontSize: 13, color: '#64748b' }}>{value || 0}%</span>
        </div>
      )
    }
  ];

  const detailFields = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Flow Name' },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Status' },
    { key: 'target_audience', label: 'Target Audience' },
    { key: 'trigger_event', label: 'Trigger Event' },
    { key: 'total_steps', label: 'Total Steps' },
    { key: 'completion_rate', label: 'Completion Rate', render: (v) => `${v}%` },
    { key: 'created_at', label: 'Created At', render: (v) => new Date(v).toLocaleString() }
  ];

  return (
    <DataTable
      title="Onboarding Flows"
      data={flows}
      columns={columns}
      loading={loading}
      onRowClick={(item) => navigate(`/flows/${item.id}`)}
      addButtonText="New Flow"
      FormComponent={FlowForm}
      onSubmit={handleSubmit}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      detailFields={detailFields}
      emptyIcon={GitBranch}
      onExportCSV={flowsAPI.exportCSV}
      onExportPDF={flowsAPI.exportPDF}
    />
  );
};

export default Flows;
