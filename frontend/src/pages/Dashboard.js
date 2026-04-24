import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitBranch, Users, FileText, BarChart3, TrendingUp,
  ArrowUpRight, Sparkles, Plus, CheckCircle, Clock,
  CalendarCheck, UserPlus, ThumbsUp, GraduationCap,
  ClipboardCheck, Target, Plug, MessageCircle
} from 'lucide-react';
import { dashboardAPI, flowsAPI } from '../services/api';
import { DashboardSkeleton } from '../components/Skeleton';

const StatCard = ({ icon: Icon, label, value, subValue, color, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: 'white',
      borderRadius: 12,
      padding: 24,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s, box-shadow 0.2s'
    }}
    onMouseEnter={(e) => {
      if (onClick) {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 8 }}>{label}</p>
        <p style={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{value}</p>
        {subValue && (
          <p style={{ fontSize: 13, color: '#10b981', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowUpRight size={14} />
            {subValue}
          </p>
        )}
      </div>
      <div style={{
        width: 48,
        height: 48,
        background: `${color}15`,
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color
      }}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const FlowCard = ({ flow, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: 'white',
      borderRadius: 12,
      padding: 20,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <div style={{
        width: 40,
        height: 40,
        background: flow.status === 'active' ? '#dcfce7' : '#fef3c7',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {flow.status === 'active' ? (
          <CheckCircle size={20} color="#16a34a" />
        ) : (
          <Clock size={20} color="#d97706" />
        )}
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>
          {flow.name}
        </h3>
        <span style={{
          fontSize: 11,
          padding: '2px 8px',
          borderRadius: 4,
          background: flow.status === 'active' ? '#dcfce7' : '#fef3c7',
          color: flow.status === 'active' ? '#16a34a' : '#d97706',
          fontWeight: 500
        }}>
          {flow.status}
        </span>
      </div>
    </div>
    <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12, lineHeight: 1.5 }}>
      {flow.description?.substring(0, 80)}...
    </p>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8' }}>
      <span>{flow.total_steps} steps</span>
      <span>{flow.completion_rate}% completion</span>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, flowsRes] = await Promise.all([
          dashboardAPI.getStats(),
          flowsAPI.getAll()
        ]);
        setStats(statsRes.data);
        const flowData = Array.isArray(flowsRes.data) ? flowsRes.data : flowsRes.data.data || [];
        setFlows(flowData.slice(0, 6));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
          Dashboard
        </h1>
        <p style={{ color: '#64748b' }}>
          Welcome back! Here's an overview of your onboarding flows.
        </p>
      </div>

      {/* Primary Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 20,
        marginBottom: 24
      }}>
        <StatCard
          icon={GitBranch}
          label="Total Flows"
          value={stats?.totalFlows || 0}
          subValue={`${stats?.activeFlows || 0} active`}
          color="#6366f1"
          onClick={() => navigate('/flows')}
        />
        <StatCard
          icon={Users}
          label="User Segments"
          value={stats?.totalSegments || 0}
          subValue={`${(stats?.totalUsersInSegments || 0).toLocaleString()} users`}
          color="#0ea5e9"
          onClick={() => navigate('/segments')}
        />
        <StatCard
          icon={FileText}
          label="Templates"
          value={stats?.totalTemplates || 0}
          color="#8b5cf6"
          onClick={() => navigate('/templates')}
        />
        <StatCard
          icon={TrendingUp}
          label="Avg. Completion"
          value={`${(stats?.avgCompletionRate || 0).toFixed(1)}%`}
          color="#10b981"
          onClick={() => navigate('/analytics')}
        />
      </div>

      {/* AI Features Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 20,
        marginBottom: 32
      }}>
        <StatCard
          icon={CalendarCheck}
          label="PTO Requests"
          value={stats?.totalPtoRequests || 0}
          subValue={`${stats?.pendingPtoRequests || 0} pending`}
          color="#f59e0b"
          onClick={() => navigate('/pto-scheduler')}
        />
        <StatCard
          icon={UserPlus}
          label="Mentor Matches"
          value={stats?.totalMentorMatches || 0}
          subValue={`${stats?.activeMentorMatches || 0} active`}
          color="#14b8a6"
          onClick={() => navigate('/mentor-matcher')}
        />
        <StatCard
          icon={ThumbsUp}
          label="Feedback"
          value={stats?.totalFeedback || 0}
          subValue={`${stats?.openFeedback || 0} open`}
          color="#f43f5e"
          onClick={() => navigate('/feedback-collector')}
        />
        <StatCard
          icon={GraduationCap}
          label="Training Plans"
          value={stats?.totalTraining || 0}
          subValue={`${stats?.inProgressTraining || 0} in progress`}
          color="#a855f7"
          onClick={() => navigate('/training-recommender')}
        />
        <StatCard
          icon={ClipboardCheck}
          label="AI Checklists"
          value={stats?.totalAiChecklists || 0}
          subValue={`${stats?.activeAiChecklists || 0} active`}
          color="#06b6d4"
          onClick={() => navigate('/ai-checklists')}
        />
        <StatCard
          icon={Target}
          label="AI Progress"
          value={stats?.totalAiProgress || 0}
          subValue={`${stats?.inProgressAiProgress || 0} tracking`}
          color="#84cc16"
          onClick={() => navigate('/ai-progress')}
        />
        <StatCard
          icon={Plug}
          label="Integrations"
          value={stats?.totalIntegrations || 0}
          subValue={`${stats?.activeIntegrations || 0} active`}
          color="#ec4899"
          onClick={() => navigate('/integrations')}
        />
        <StatCard
          icon={MessageCircle}
          label="Tooltips"
          value={stats?.totalTooltips || 0}
          subValue={`${stats?.activeTooltips || 0} active`}
          color="#78716c"
          onClick={() => navigate('/tooltips')}
        />
      </div>

      {/* Quick Actions */}
      <div style={{
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        borderRadius: 16,
        padding: 24,
        marginBottom: 32,
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
              Create with AI
            </h2>
            <p style={{ opacity: 0.9, fontSize: 14 }}>
              Generate onboarding content using AI-powered tools
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/ai-content')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 8,
                color: 'white',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <Sparkles size={18} />
              AI Content
            </button>
            <button
              onClick={() => navigate('/flows')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                background: 'white',
                border: 'none',
                borderRadius: 8,
                color: '#6366f1',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <Plus size={18} />
              New Flow
            </button>
          </div>
        </div>
      </div>

      {/* Recent Flows */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b' }}>
            Recent Onboarding Flows
          </h2>
          <button
            onClick={() => navigate('/flows')}
            style={{
              background: 'none',
              border: 'none',
              color: '#6366f1',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            View All
            <ArrowUpRight size={16} />
          </button>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16
        }}>
          {flows.map((flow) => (
            <FlowCard
              key={flow.id}
              flow={flow}
              onClick={() => navigate(`/flows/${flow.id}`)}
            />
          ))}
        </div>
      </div>

      {/* Feature Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16
      }}>
        {[
          { icon: BarChart3, label: 'Analytics', path: '/analytics', color: '#f59e0b' },
          { icon: Sparkles, label: 'AI Content', path: '/ai-content', color: '#8b5cf6' },
          { icon: Users, label: 'Segments', path: '/segments', color: '#0ea5e9' },
          { icon: FileText, label: 'Templates', path: '/templates', color: '#10b981' }
        ].map((item) => (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              background: 'white',
              borderRadius: 12,
              padding: 20,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{
              width: 40,
              height: 40,
              background: `${item.color}15`,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: item.color
            }}>
              <item.icon size={20} />
            </div>
            <span style={{ fontWeight: 500, color: '#1e293b' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
