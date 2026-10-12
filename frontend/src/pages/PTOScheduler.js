import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Sparkles } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { ptoRequestsAPI, aiGenerateAPI } from '../services/api';
import { useToast } from '../components/Toast';
import FormattedAIReport, { FormattedAIValue } from '../components/FormattedAIReport';

const futureDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const sampleData = [
  { employee_name: 'Sarah Chen', department: 'Engineering', request_type: 'vacation', start_date: futureDate(45), end_date: futureDate(56), days_requested: 10, reason: 'Annual family vacation — travel is booked. Current sprint work will be completed before departure, and a handoff document is being prepared for the team.', status: 'pending' },
  { employee_name: 'Marcus Williams', department: 'Sales', request_type: 'sick', start_date: futureDate(14), end_date: futureDate(25), days_requested: 10, reason: 'Scheduled knee surgery with an expected two-week recovery. Documentation is available, and critical account handoffs will be completed before leave.', status: 'pending' },
  { employee_name: 'Priya Patel', department: 'Product', request_type: 'parental', start_date: futureDate(75), end_date: futureDate(166), days_requested: 65, reason: 'Planned parental leave. A backup product manager has been training for six weeks, and current roadmap documentation is up to date.', status: 'pending' },
  { employee_name: 'Alex Rivera', department: 'Marketing', request_type: 'personal', start_date: futureDate(21), end_date: futureDate(24), days_requested: 2, reason: 'Relocating to a new apartment. Two business days are needed for movers, utility setup, and address changes.', status: 'pending' },
];

const getStatusColor = (status) => {
  const colors = { approved: '#10b981', pending: '#f59e0b', rejected: '#ef4444' };
  return colors[status] || '#6b7280';
};

const getStatusIcon = (status) => {
  const icons = { approved: CheckCircle, pending: Clock, rejected: XCircle };
  const Icon = icons[status] || AlertCircle;
  return <Icon size={14} />;
};

const PTOForm = ({ data, onChange }) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const analyzeWithAI = async () => {
    setAiLoading(true);
    try {
      const response = await aiGenerateAPI.analyzePTO(data);
      setAiResult(response.data.analysis);
      if (response.data.analysis && typeof response.data.analysis === 'object') {
        onChange({
          ...data,
          ai_recommendation: JSON.stringify(response.data.analysis),
          ai_approval_score: response.data.analysis.approval_score
        });
      }
    } catch (error) {
      console.error('Error analyzing PTO:', error);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 12px', background: '#f8fafc', borderRadius: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 11, color: '#94a3b8', alignSelf: 'center', marginRight: 4 }}>Load sample:</span>
        {sampleData.map((sample, i) => (
          <button key={i} type="button" onClick={() => { onChange({ ...data, ...sample }); setAiResult(null); }}
            style={{ padding: '4px 10px', fontSize: 11, fontWeight: 500, background: 'linear-gradient(135deg, #ede9fe, #f3e8ff)', color: '#7c3aed', border: '1px solid #ddd6fe', borderRadius: 20, cursor: 'pointer' }}>
            {['Summer Vacation', 'Sick Leave', 'Parental Leave', 'Moving Day'][i]}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Employee Name *</label>
          <input type="text" value={data.employee_name || ''} onChange={(e) => onChange({ ...data, employee_name: e.target.value })} required
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Department *</label>
          <input type="text" value={data.department || ''} onChange={(e) => onChange({ ...data, department: e.target.value })} required
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Request Type</label>
        <select value={data.request_type || 'vacation'} onChange={(e) => onChange({ ...data, request_type: e.target.value })}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: 'white' }}>
          <option value="vacation">Vacation</option>
          <option value="sick">Sick Leave</option>
          <option value="personal">Personal</option>
          <option value="parental">Parental Leave</option>
          <option value="bereavement">Bereavement</option>
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Start Date *</label>
          <input type="date" value={data.start_date?.split('T')[0] || ''} onChange={(e) => onChange({ ...data, start_date: e.target.value })} required
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>End Date *</label>
          <input type="date" value={data.end_date?.split('T')[0] || ''} onChange={(e) => onChange({ ...data, end_date: e.target.value })} required
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Days</label>
          <input type="number" value={data.days_requested || 1} onChange={(e) => onChange({ ...data, days_requested: parseInt(e.target.value) })} min="1"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Reason</label>
        <textarea value={data.reason || ''} onChange={(e) => onChange({ ...data, reason: e.target.value })} rows={3}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, resize: 'vertical' }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Status</label>
        <select value={data.status || 'pending'} onChange={(e) => onChange({ ...data, status: e.target.value })}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: 'white' }}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <button type="button" onClick={analyzeWithAI} disabled={aiLoading || !data.employee_name}
        style={{ width: '100%', padding: '12px', marginBottom: 16, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600 }}>
        <Sparkles size={18} /> {aiLoading ? 'Analyzing...' : 'Get AI Recommendation'}
      </button>
      {aiResult !== null && <FormattedAIReport response={aiResult} title="PTO analysis" />}
    </div>
  );
};

const PTOScheduler = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchRequests = async () => {
    try {
      const response = await ptoRequestsAPI.getAll();
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setRequests(data);
    } catch (error) {
      console.error('Error fetching PTO requests:', error);
      toast.error('Failed to load PTO requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleSubmit = async (data) => {
    await ptoRequestsAPI.create({ ...data, employee_id: 1, status: data.status || 'pending' });
    toast.success('PTO request created successfully');
    fetchRequests();
  };

  const handleUpdate = async (id, data) => {
    await ptoRequestsAPI.update(id, data);
    toast.success('PTO request updated successfully');
    fetchRequests();
  };

  const handleDelete = async (id) => {
    await ptoRequestsAPI.delete(id);
    toast.success('PTO request deleted');
    fetchRequests();
  };

  const columns = [
    {
      key: 'employee_name',
      label: 'Employee',
      render: (value, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: 14 }}>
            {value?.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 500 }}>{value}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{row.department}</div>
          </div>
        </div>
      )
    },
    {
      key: 'request_type',
      label: 'Type',
      render: (value) => (
        <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: '#eef2ff', color: '#6366f1', textTransform: 'capitalize' }}>
          {value}
        </span>
      )
    },
    {
      key: 'start_date',
      label: 'Dates',
      render: (value, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <Calendar size={14} color="#64748b" />
          <span>{value?.split('T')[0]} - {row.end_date?.split('T')[0]}</span>
        </div>
      )
    },
    {
      key: 'days_requested',
      label: 'Days',
      render: (value) => <span style={{ fontWeight: 500 }}>{value}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: `${getStatusColor(value)}20`, color: getStatusColor(value) }}>
          {getStatusIcon(value)} {value}
        </span>
      )
    },
    {
      key: 'ai_approval_score',
      label: 'AI Score',
      render: (value) => value ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 60, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${value}%`, height: '100%', background: value > 70 ? '#10b981' : value > 40 ? '#f59e0b' : '#ef4444', borderRadius: 3 }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>{value}%</span>
        </div>
      ) : <span style={{ color: '#cbd5e1', fontSize: 12 }}>-</span>
    }
  ];

  const detailFields = [
    { key: 'id', label: 'ID' },
    { key: 'employee_name', label: 'Employee' },
    { key: 'department', label: 'Department' },
    { key: 'request_type', label: 'Request Type', render: (v) => v?.charAt(0).toUpperCase() + v?.slice(1) },
    { key: 'start_date', label: 'Start Date', render: (v) => v?.split('T')[0] },
    { key: 'end_date', label: 'End Date', render: (v) => v?.split('T')[0] },
    { key: 'days_requested', label: 'Days Requested' },
    { key: 'status', label: 'Status', render: (v) => v?.charAt(0).toUpperCase() + v?.slice(1) },
    { key: 'reason', label: 'Reason' },
    { key: 'ai_approval_score', label: 'AI Score', render: (v) => v == null ? '-' : `${v}%` },
    { key: 'ai_recommendation', label: 'AI Recommendation', render: (v) => v == null ? '-' : <FormattedAIValue value={v} /> },
    { key: 'created_at', label: 'Created At', render: (v) => v ? new Date(v).toLocaleString() : '-' }
  ];

  return (
    <DataTable
      title="AI PTO Scheduler"
      data={requests}
      columns={columns}
      loading={loading}
      addButtonText="New Request"
      FormComponent={PTOForm}
      onSubmit={handleSubmit}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      detailFields={detailFields}
      emptyIcon={Calendar}
      onExportCSV={ptoRequestsAPI.exportCSV}
      onExportPDF={ptoRequestsAPI.exportPDF}
    />
  );
};

export default PTOScheduler;
