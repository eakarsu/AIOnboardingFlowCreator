import React, { useEffect, useState } from 'react';

// VIZ 2 — Drop-off heatmap (step x cohort).
export default function DropOffHeatmap() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || '';
    fetch('/api/custom-views/heatmap', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div style={{ padding: 12, background: '#fef2f2', color: '#b91c1c', borderRadius: 6 }}>Heatmap error: {error}</div>;
  if (!data) return <div style={{ padding: 12, color: '#64748b' }}>Loading heatmap…</div>;

  // Convert flat cells into matrix indexed by [cohort][step_key].
  const byKey = {};
  data.cells.forEach((c) => {
    byKey[c.cohort] = byKey[c.cohort] || {};
    byKey[c.cohort][c.step_key] = c;
  });

  const color = (pct) => {
    // 0 -> green-ish, 40 -> red
    const clamped = Math.min(40, Math.max(0, pct));
    const t = clamped / 40;
    const r = Math.round(60 + t * 195);
    const g = Math.round(180 - t * 130);
    const b = Math.round(120 - t * 90);
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div style={{ background: '#fff', padding: 20, borderRadius: 10, border: '1px solid #e2e8f0' }}>
      <h3 style={{ margin: 0, marginBottom: 4, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
        Drop-Off Heatmap (Step × Cohort)
      </h3>
      <p style={{ margin: 0, marginBottom: 16, color: '#64748b', fontSize: 12 }}>
        Darker red = higher drop-off percentage.
      </p>
      <div style={{ overflowX: 'auto' }} data-testid="dropoff-heatmap">
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 6, fontSize: 12, color: '#64748b' }}>Cohort \ Step</th>
              {data.steps.map((s) => (
                <th key={s.key} style={{ padding: 6, fontSize: 11, color: '#475569', writingMode: 'horizontal-tb' }}>
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.cohorts.map((cohort) => (
              <tr key={cohort}>
                <td style={{ padding: 6, fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{cohort}</td>
                {data.steps.map((s) => {
                  const cell = (byKey[cohort] || {})[s.key];
                  const pct = cell ? cell.drop_off_pct : 0;
                  return (
                    <td
                      key={s.key}
                      title={`${cohort} • ${s.label} — ${pct.toFixed(1)}% (${cell && cell.severity})`}
                      style={{
                        padding: 6,
                        background: color(pct),
                        color: pct > 20 ? '#fff' : '#0f172a',
                        textAlign: 'center',
                        fontSize: 11,
                        fontVariantNumeric: 'tabular-nums',
                        border: '1px solid #f1f5f9',
                      }}
                    >
                      {pct.toFixed(1)}%
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
