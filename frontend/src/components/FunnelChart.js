import React, { useEffect, useState } from 'react';

// VIZ 1 — Funnel conversion chart per onboarding step.
export default function FunnelChart() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || '';
    fetch('/api/custom-views/funnel', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div style={{ padding: 12, background: '#fef2f2', color: '#b91c1c', borderRadius: 6 }}>Funnel error: {error}</div>;
  if (!data) return <div style={{ padding: 12, color: '#64748b' }}>Loading funnel…</div>;

  const max = Math.max(...data.steps.map((s) => s.users_entered));

  return (
    <div style={{ background: '#fff', padding: 20, borderRadius: 10, border: '1px solid #e2e8f0' }}>
      <h3 style={{ margin: 0, marginBottom: 4, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
        Funnel Conversion per Step
      </h3>
      <p style={{ margin: 0, marginBottom: 16, color: '#64748b', fontSize: 12 }}>
        Overall conversion: <strong>{(data.overall_conversion * 100).toFixed(1)}%</strong>
      </p>
      <div data-testid="funnel-chart">
        {data.steps.map((s) => {
          const widthPct = (s.users_entered / max) * 100;
          return (
            <div key={s.step_key} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>
                  {s.order}. {s.step_label}
                </span>
                <span style={{ color: '#475569' }}>
                  {s.users_completed.toLocaleString()} / {s.users_entered.toLocaleString()} ({(s.conversion_rate * 100).toFixed(1)}%)
                </span>
              </div>
              <div style={{ background: '#e2e8f0', borderRadius: 6, height: 22, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${widthPct}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
