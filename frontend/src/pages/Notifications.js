import React, { useState, useEffect } from 'react';
import { Bell, Send, Clock, FileEdit } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { notificationsAPI } from '../services/api';
import { useToast } from '../components/Toast';

const NotificationForm = ({ data, onChange }) => (
  <div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Title *</label>
      <input type="text" value={data.title || ''} onChange={(e) => onChange({ ...data, title: e.target.value })} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
    </div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Message *</label>
      <textarea value={data.message || ''} onChange={(e) => onChange({ ...data, message: e.target.value })} rows={3} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, resize: 'vertical' }} />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Type *</label>
        <select value={data.notification_type || 'reminder'} onChange={(e) => onChange({ ...data, notification_type: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: 'white' }}>
          <option value="welcome">Welcome</option><option value="reminder">Reminder</option><option value="feature">Feature</option>
          <option value="alert">Alert</option><option value="report">Report</option><option value="promotion">Promotion</option>
        </select>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Channel</label>
        <select value={data.channel || 'in-app'} onChange={(e) => onChange({ ...data, channel: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: 'white' }}>
          <option value="in-app">In-App</option><option value="email">Email</option><option value="push">Push</option>
        </select>
      </div>
    </div>
    <div>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Status</label>
      <select value={data.status || 'draft'} onChange={(e) => onChange({ ...data, status: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: 'white' }}>
        <option value="draft">Draft</option><option value="scheduled">Scheduled</option><option value="sent">Sent</option>
      </select>
    </div>
  </div>
);

const Notifications = () => {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => { try { const res = await notificationsAPI.getAll(); setNotifications(res.data); } catch (e) { console.error(e); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, []);
  const handleSubmit = async (data) => { await notificationsAPI.create(data); toast.success('Notification created successfully'); fetchData(); };
  const handleUpdate = async (id, data) => { await notificationsAPI.update(id, data); toast.success('Notification updated successfully'); fetchData(); };
  const handleDelete = async (id) => { await notificationsAPI.delete(id); toast.success('Notification deleted successfully'); fetchData(); };

  const statusIcons = { draft: FileEdit, scheduled: Clock, sent: Send };
  const statusColors = { draft: { bg: '#f1f5f9', color: '#64748b' }, scheduled: { bg: '#fef3c7', color: '#d97706' }, sent: { bg: '#dcfce7', color: '#16a34a' } };

  const columns = [
    { key: 'title', label: 'Notification', render: (v, r) => (<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 36, height: 36, background: '#dbeafe', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bell size={18} color="#2563eb" /></div><div><div style={{ fontWeight: 500 }}>{v}</div><div style={{ fontSize: 12, color: '#64748b' }}>{r.message?.substring(0, 50)}...</div></div></div>) },
    { key: 'notification_type', label: 'Type', render: (v) => <span style={{ textTransform: 'capitalize' }}>{v}</span> },
    { key: 'channel', label: 'Channel', render: (v) => <span style={{ textTransform: 'capitalize' }}>{v}</span> },
    { key: 'status', label: 'Status', render: (v) => { const c = statusColors[v] || statusColors.draft; const Icon = statusIcons[v] || FileEdit; return (<span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: c.bg, color: c.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon size={12} />{v}</span>); } },
    { key: 'sent_count', label: 'Sent', render: (v) => <span style={{ fontWeight: 500 }}>{(v || 0).toLocaleString()}</span> },
    { key: 'open_rate', label: 'Open Rate', render: (v) => <span>{(v || 0).toFixed(1)}%</span> }
  ];

  const detailFields = [
    { key: 'id', label: 'ID' }, { key: 'title', label: 'Title' }, { key: 'message', label: 'Message' },
    { key: 'notification_type', label: 'Type' }, { key: 'channel', label: 'Channel' }, { key: 'status', label: 'Status' },
    { key: 'sent_count', label: 'Sent Count' }, { key: 'open_rate', label: 'Open Rate', render: (v) => `${(v || 0).toFixed(1)}%` },
    { key: 'click_rate', label: 'Click Rate', render: (v) => `${(v || 0).toFixed(1)}%` },
    { key: 'created_at', label: 'Created At', render: (v) => new Date(v).toLocaleString() }
  ];

  return <DataTable title="Notifications" data={notifications} columns={columns} loading={loading} addButtonText="New Notification" FormComponent={NotificationForm} onSubmit={handleSubmit} onUpdate={handleUpdate} onDelete={handleDelete} detailFields={detailFields} emptyIcon={Bell} onExportCSV={notificationsAPI.exportCSV} onExportPDF={notificationsAPI.exportPDF} />;
};

export default Notifications;
