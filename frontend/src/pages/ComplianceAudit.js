// Apply pass 5 — Compliance Audit page (PRODUCT-DECISION default domains:
// hr_onboarding, security_training, code_of_conduct).
import React, { useState } from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { aiGenerateAPI } from '../services/api';

const DEFAULT_DOMAINS = ['hr_onboarding', 'security_training', 'code_of_conduct'];

export default function ComplianceAudit() {
  const [flowSummary, setFlowSummary] = useState('');
  const [completed, setCompleted] = useState('');
  const [outstanding, setOutstanding] = useState('');
  const [domains, setDomains] = useState(DEFAULT_DOMAINS.join(', '));
  const [policy, setPolicy] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const payload = {
        flow_summary: flowSummary,
        completed_steps: completed.split(',').map((s) => s.trim()).filter(Boolean),
        outstanding_steps: outstanding.split(',').map((s) => s.trim()).filter(Boolean),
        domains: domains.split(',').map((s) => s.trim()).filter(Boolean),
        compliance_policy_text: policy,
      };
      const r = await aiGenerateAPI.complianceAudit(payload);
      setResult(r.data);
    } catch (e) {
      const data = e.response?.data;
      if (data?.missing) {
        setError(`AI service not configured (missing ${data.missing}). ${data.detail || ''}`);
      } else {
        setError(data?.error || e.message || 'Failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <ShieldCheck size={24} style={{ color: '#0ea5e9' }} />
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Onboarding Compliance Audit</h1>
      </div>
      <p style={{ color: '#64748b', marginBottom: 16 }}>
        AI-driven gap analysis across compliance domains. Defaults: <code>hr_onboarding, security_training, code_of_conduct</code>.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, maxWidth: 720 }}>
        <textarea value={flowSummary} onChange={(e) => setFlowSummary(e.target.value)} placeholder="Flow summary (optional)" rows={3} style={{ padding: 10, border: '1px solid #e2e8f0', borderRadius: 8 }} />
        <input value={completed} onChange={(e) => setCompleted(e.target.value)} placeholder="Completed steps (comma-separated)" style={{ padding: 10, border: '1px solid #e2e8f0', borderRadius: 8 }} />
        <input value={outstanding} onChange={(e) => setOutstanding(e.target.value)} placeholder="Outstanding steps (comma-separated)" style={{ padding: 10, border: '1px solid #e2e8f0', borderRadius: 8 }} />
        <input value={domains} onChange={(e) => setDomains(e.target.value)} placeholder="Domains (comma-separated)" style={{ padding: 10, border: '1px solid #e2e8f0', borderRadius: 8 }} />
        <textarea value={policy} onChange={(e) => setPolicy(e.target.value)} placeholder="Compliance policy text (excerpt, optional)" rows={4} style={{ padding: 10, border: '1px solid #e2e8f0', borderRadius: 8 }} />
        <button onClick={run} disabled={loading} style={{ padding: 12, background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600 }}>
          <Sparkles size={18} /> {loading ? 'Auditing...' : 'Run Compliance Audit'}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 16, padding: 12, background: '#fee2e2', color: '#991b1b', borderRadius: 8 }}>{error}</div>
      )}
      {result && (
        <pre style={{ marginTop: 16, padding: 12, background: '#0f172a', color: '#bbf7d0', borderRadius: 8, overflowX: 'auto', fontSize: 12 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
