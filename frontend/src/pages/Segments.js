import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { segmentsAPI } from '../services/api';
import { useToast } from '../components/Toast';

const SegmentForm = ({ data, onChange }) => (
  <div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
        Segment Name *
      </label>
      <input
        type="text"
        value={data.name || ''}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
        placeholder="e.g., Power Users"
        required
        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}
      />
    </div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
        Description
      </label>
      <textarea
        value={data.description || ''}
        onChange={(e) => onChange({ ...data, description: e.target.value })}
        placeholder="Describe this segment..."
        rows={3}
        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, resize: 'vertical' }}
      />
    </div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
        Status
      </label>
      <select
        value={data.status || 'active'}
        onChange={(e) => onChange({ ...data, status: e.target.value })}
        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: 'white' }}
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  </div>
);

const Segments = () => {
  const toast = useToast();
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await segmentsAPI.getAll();
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setSegments(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (data) => {
    await segmentsAPI.create(data);
    toast.success('Segment created successfully');
    fetchData();
  };

  const handleUpdate = async (id, data) => {
    await segmentsAPI.update(id, data);
    toast.success('Segment updated successfully');
    fetchData();
  };

  const handleDelete = async (id) => {
    await segmentsAPI.delete(id);
    toast.success('Segment deleted successfully');
    fetchData();
  };

  const columns = [
    {
      key: 'name',
      label: 'Segment Name',
      render: (value, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: '#dbeafe', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={18} color="#2563eb" />
          </div>
          <div>
            <div style={{ fontWeight: 500 }}>{value}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{row.description?.substring(0, 40)}...</div>
          </div>
        </div>
      )
    },
    {
      key: 'user_count',
      label: 'Users',
      render: (value) => <span style={{ fontWeight: 500 }}>{(value || 0).toLocaleString()}</span>
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
          background: value === 'active' ? '#dcfce7' : '#f1f5f9',
          color: value === 'active' ? '#16a34a' : '#64748b'
        }}>
          {value}
        </span>
      )
    },
    { key: 'created_at', label: 'Created', render: (value) => new Date(value).toLocaleDateString() }
  ];

  const detailFields = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Segment Name' },
    { key: 'description', label: 'Description' },
    { key: 'user_count', label: 'User Count', render: (v) => (v || 0).toLocaleString() },
    { key: 'status', label: 'Status' },
    { key: 'criteria', label: 'Criteria' },
    { key: 'created_at', label: 'Created At', render: (v) => new Date(v).toLocaleString() }
  ];

  return (
    <DataTable
      title="User Segments"
      data={segments}
      columns={columns}
      loading={loading}
      addButtonText="New Segment"
      FormComponent={SegmentForm}
      onSubmit={handleSubmit}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      detailFields={detailFields}
      emptyIcon={Users}
      onExportCSV={segmentsAPI.exportCSV}
      onExportPDF={segmentsAPI.exportPDF}
    />
  );
};

export default Segments;
