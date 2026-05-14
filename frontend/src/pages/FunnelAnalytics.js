import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, TrendingDown, Users, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { flowsAPI, funnelAPI } from '../services/api';

// ── Tiny stat card ──────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div style={{ background: 'white', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,.1)', display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{ width: 48, height: 48, background: color + '18', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
      <Icon size={22} />
    </div>
    <div>
      <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 700, color: '#1e293b', margin: '2px 0 0' }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{sub}</p>}
    </div>
  </div>
);

// ── Horizontal bar ──────────────────────────────────────────────────────────

const Bar = ({ pct, color }) => (
  <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden', flex: 1 }}>
    <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: color, borderRadius: 5, transition: 'width .6s ease' }} />
  </div>
);

function dropOffColor(pct) {
  if (pct >= 50) return '#ef4444';
  if (pct >= 25) return '#f59e0b';
  return '#10b981';
}

// ── Main page ───────────────────────────────────────────────────────────────

const FunnelAnalytics = () => {
  const [flows, setFlows]         = useState([]);
  const [selectedFlow, setSelected] = useState('');
  const [funnel, setFunnel]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [flowsLoading, setFlowsLoading] = useState(true);

  // Load flow list for selector
  useEffect(() => {
    flowsAPI.getAll()
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setFlows(list);
        if (list.length > 0) setSelected(String(list[0].id));
      })
      .catch(err => console.error('Failed to load flows:', err))
      .finally(() => setFlowsLoading(false));
  }, []);

  const loadFunnel = useCallback(() => {
    if (!selectedFlow) return;
    setLoading(true);
    setError(null);
    funnelAPI.getFunnel(selectedFlow)
      .then(res => setFunnel(res.data))
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load funnel data');
        setFunnel(null);
      })
      .finally(() => setLoading(false));
  }, [selectedFlow]);

  useEffect(() => {
    loadFunnel();
  }, [loadFunnel]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>Funnel Analytics</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Step-by-step drop-off analysis for your onboarding flows.</p>
      </div>

      {/* Flow selector */}
      <div style={{ background: 'white', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,.1)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
        <BarChart3 size={18} color="#6366f1" style={{ flexShrink: 0 }} />
        <label htmlFor="flow-select" style={{ fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>Select Flow</label>
        <select
          id="flow-select"
          value={selectedFlow}
          onChange={e => setSelected(e.target.value)}
          disabled={flowsLoading}
          style={{ flex: 1, maxWidth: 360, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 14, color: '#1e293b', background: '#f8fafc' }}
        >
          {flowsLoading && <option>Loading flows…</option>}
          {flows.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
        <button
          onClick={loadFunnel}
          disabled={loading || !selectedFlow}
          style={{ padding: '8px 18px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', opacity: loading ? .6 : 1, whiteSpace: 'nowrap' }}
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 18px', color: '#dc2626', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ background: '#f1f5f9', borderRadius: 12, height: 96, animation: 'pulse 1.5s infinite' }} />
          ))}
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
        </div>
      )}

      {/* Results */}
      {!loading && funnel && (
        <>
          {/* Summary stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
            <StatCard icon={Users}        label="Total Starts"      value={funnel.totalStarts}        color="#6366f1" />
            <StatCard icon={CheckCircle}  label="Completions"       value={funnel.completions}
              sub={`${funnel.completionRate}% completion rate`} color="#10b981" />
            <StatCard icon={Clock}        label="Avg Time to Complete"
              value={funnel.avgCompletionMinutes !== null ? `${funnel.avgCompletionMinutes}m` : '—'}
              sub="for users who finished" color="#0ea5e9" />
            <StatCard icon={TrendingDown} label="Worst Drop-Off Step"
              value={funnel.worstDropOffStep ? `${funnel.worstDropOffStep.dropOffPct}%` : '—'}
              sub={funnel.worstDropOffStep?.title || 'N/A'} color="#f59e0b" />
          </div>

          {/* Step funnel */}
          <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)', marginBottom: 28 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={18} color="#6366f1" />
              Step-by-Step Funnel — {funnel.flowName}
            </h2>

            {funnel.steps.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '32px 0' }}>No progress data yet for this flow.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {funnel.steps.map((step, idx) => {
                  const reachPct = funnel.totalStarts > 0
                    ? ((step.usersReached / funnel.totalStarts) * 100)
                    : 0;
                  const isWorst = funnel.worstDropOffStep && funnel.worstDropOffStep.stepId === step.stepId;

                  return (
                    <div key={step.stepId} style={{ padding: '16px 0', borderBottom: idx < funnel.steps.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      {/* Step header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                        {/* Step number bubble */}
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                          background: isWorst ? '#fef2f2' : '#f0f0ff',
                          color: isWorst ? '#dc2626' : '#6366f1',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700
                        }}>
                          {step.stepOrder}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                              {step.title}
                              {isWorst && (
                                <span style={{ background: '#fef2f2', color: '#dc2626', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>
                                  Highest drop-off
                                </span>
                              )}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', marginLeft: 12 }}>
                              {step.usersReached} users ({step.reachRate}%)
                            </span>
                          </div>

                          {/* Reach bar */}
                          <Bar pct={reachPct} color="#6366f1" />
                        </div>
                      </div>

                      {/* Drop-off indicator (between steps) */}
                      {idx > 0 && step.dropOffPct > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 40, marginTop: -4 }}>
                          <TrendingDown size={13} color={dropOffColor(step.dropOffPct)} />
                          <span style={{ fontSize: 12, color: dropOffColor(step.dropOffPct), fontWeight: 600 }}>
                            {step.dropOffPct}% dropped off before this step
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Insight callout */}
          {funnel.worstDropOffStep && (
            <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontWeight: 700, color: '#92400e', margin: '0 0 4px' }}>Insight: Largest drop-off detected</p>
                <p style={{ color: '#78350f', fontSize: 14, margin: 0 }}>
                  Step <strong>{funnel.worstDropOffStep.stepOrder}: "{funnel.worstDropOffStep.title}"</strong> has the
                  highest drop-off ({funnel.worstDropOffStep.dropOffPct}%). Consider simplifying its content or
                  running it through AI Flow Analyzer for improvement suggestions.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!loading && !funnel && !error && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <BarChart3 size={40} style={{ marginBottom: 12, opacity: .4 }} />
          <p style={{ fontSize: 16 }}>Select a flow above to view its funnel.</p>
        </div>
      )}
    </div>
  );
};

export default FunnelAnalytics;
