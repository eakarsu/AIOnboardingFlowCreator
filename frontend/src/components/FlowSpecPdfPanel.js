import React, { useState } from 'react';

// NON-VIZ 1 — Download/preview the onboarding flow spec as a PDF.
export default function FlowSpecPdfPanel() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    setStatus('loading');
    setError(null);
    try {
      const token = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || '';
      const res = await fetch('/api/custom-views/spec-pdf', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'onboarding_flow_spec.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus('done');
    } catch (e) {
      setError(e.message);
      setStatus('error');
    }
  };

  return (
    <div style={{ background: '#fff', padding: 20, borderRadius: 10, border: '1px solid #e2e8f0' }} data-testid="flow-spec-pdf">
      <h3 style={{ margin: 0, marginBottom: 4, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
        Onboarding Flow Spec (PDF)
      </h3>
      <p style={{ margin: 0, marginBottom: 14, color: '#64748b', fontSize: 12 }}>
        Generates a canonical PDF describing the current onboarding steps, conversion targets,
        and active branching rules — ready to share with stakeholders.
      </p>
      <button
        onClick={handleDownload}
        disabled={status === 'loading'}
        style={{
          padding: '8px 16px',
          background: status === 'loading' ? '#94a3b8' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 13,
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
        }}
      >
        {status === 'loading' ? 'Generating…' : 'Download spec PDF'}
      </button>
      {status === 'done' && (
        <div style={{ marginTop: 10, color: '#15803d', fontSize: 12 }}>PDF downloaded.</div>
      )}
      {status === 'error' && (
        <div style={{ marginTop: 10, color: '#b91c1c', fontSize: 12 }}>Error: {error}</div>
      )}
    </div>
  );
}
