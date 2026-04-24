import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Users, Target } from 'lucide-react';
import { analyticsAPI, flowsAPI } from '../services/api';

const Analytics = () => {
  const [analytics, setAnalytics] = useState([]);
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, flowsRes] = await Promise.all([analyticsAPI.getAll(), flowsAPI.getAll()]);
        setAnalytics(analyticsRes.data);
        setFlows(flowsRes.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const avgCompletion = flows.reduce((sum, f) => sum + (f.completion_rate || 0), 0) / (flows.length || 1);
  const activeFlows = flows.filter(f => f.status === 'active').length;

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /><style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style></div>;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Analytics</h1>
        <p style={{ color: '#64748b' }}>Track the performance of your onboarding flows.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { icon: Target, label: 'Avg Completion Rate', value: `${avgCompletion.toFixed(1)}%`, color: '#10b981' },
          { icon: BarChart3, label: 'Active Flows', value: activeFlows, color: '#6366f1' },
          { icon: Users, label: 'Total Flows', value: flows.length, color: '#0ea5e9' },
          { icon: TrendingUp, label: 'Analytics Events', value: analytics.length, color: '#f59e0b' }
        ].map((stat) => (
          <div key={stat.label} style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>{stat.label}</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{stat.value}</p>
              </div>
              <div style={{ width: 44, height: 44, background: `${stat.color}15`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                <stat.icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Flow Performance */}
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 20 }}>Flow Performance</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {flows.slice(0, 10).map((flow) => (
            <div key={flow.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 500, color: '#1e293b' }}>{flow.name}</span>
                  <span style={{ fontSize: 14, color: flow.completion_rate >= 70 ? '#10b981' : flow.completion_rate >= 40 ? '#f59e0b' : '#ef4444', fontWeight: 500 }}>
                    {flow.completion_rate || 0}%
                  </span>
                </div>
                <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    width: `${flow.completion_rate || 0}%`,
                    height: '100%',
                    background: flow.completion_rate >= 70 ? '#10b981' : flow.completion_rate >= 40 ? '#f59e0b' : '#ef4444',
                    borderRadius: 4,
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: flow.completion_rate >= 50 ? '#10b981' : '#ef4444' }}>
                {flow.completion_rate >= 50 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
