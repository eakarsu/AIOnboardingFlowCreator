import React, { useState } from 'react';
import { Code, Book, Zap, CheckCircle } from 'lucide-react';

const CodeBlock = ({ code, language = 'html' }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ position: 'relative', marginBottom: 20 }}>
      <div style={{ background: '#1e293b', borderRadius: 8, padding: '16px 20px', fontFamily: 'monospace', fontSize: 13, color: '#e2e8f0', overflowX: 'auto', whiteSpace: 'pre' }}>
        {code}
      </div>
      <button
        onClick={handleCopy}
        style={{ position: 'absolute', top: 10, right: 10, background: copied ? '#10b981' : '#6366f1', color: 'white', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)', marginBottom: 24 }}>
    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>{title}</h2>
    {children}
  </div>
);

const SDKDocs = () => (
  <div className="fade-in">
    {/* Header */}
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div style={{ width: 40, height: 40, background: '#ede9fe', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Book size={20} color="#7c3aed" />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1e293b' }}>Flow SDK Docs</h1>
      </div>
      <p style={{ color: '#64748b', fontSize: 15 }}>
        Embed onboarding flows in any external website using the FlowRunner SDK — no framework required.
      </p>
    </div>

    <Section title="Quick Start">
      <p style={{ color: '#475569', fontSize: 14, marginBottom: 16 }}>
        Add one script tag to your HTML page. The SDK auto-fetches your published flow and renders it as a modal overlay.
      </p>
      <CodeBlock code={`<script src="https://your-domain.com/flow-sdk.js"
        data-site-key="YOUR_FLOW_ID">
</script>`} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          'Replace YOUR_FLOW_ID with the numeric ID of your flow (found on the Flow Detail page)',
          'The flow must have status = "active" to be served by the SDK',
          'No additional JavaScript setup is needed — the SDK auto-initializes on page load'
        ].map((tip, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: '#475569' }}>
            <CheckCircle size={15} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
            {tip}
          </div>
        ))}
      </div>
    </Section>

    <Section title="Manual Initialization">
      <p style={{ color: '#475569', fontSize: 14, marginBottom: 16 }}>
        You can also initialize the SDK programmatically using <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>window.FlowRunner.init()</code>.
      </p>
      <CodeBlock code={`<script src="https://your-domain.com/flow-sdk.js"></script>
<script>
  // Optionally override the auto-init and call manually
  document.addEventListener('DOMContentLoaded', function() {
    window.FlowRunner.init('YOUR_FLOW_ID', {
      apiBase: 'https://your-domain.com/api',
      onStepComplete: function(stepId) {
        console.log('Step completed:', stepId);
      },
      onFlowComplete: function() {
        console.log('Flow finished!');
      }
    });
  });
</script>`} />
    </Section>

    <Section title="Event Tracking">
      <p style={{ color: '#475569', fontSize: 14, marginBottom: 16 }}>
        The SDK automatically posts step-completion events to <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>POST /api/sdk/events</code>.
        You can also ingest custom events using the events API.
      </p>
      <CodeBlock code={`// Record a custom event from your app
fetch('https://your-domain.com/api/events/ingest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    siteKey: 'YOUR_FLOW_ID',
    eventType: 'feature_access',
    userId: 'user-123',
    properties: {
      feature: 'dashboard',
      plan: 'pro'
    }
  })
});`} language="javascript" />
    </Section>

    <Section title="SDK Endpoints Reference">
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>Endpoint</th>
            <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>Method</th>
            <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>Auth</th>
            <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['/api/sdk/flow?siteKey=FLOW_ID', 'GET', 'None', 'Returns published flow + steps for the given flow ID'],
            ['/api/sdk/events', 'POST', 'None', 'Records step-completion events from the embedded SDK'],
            ['/api/events/ingest', 'POST', 'None', 'Ingests any custom event and evaluates trigger conditions'],
          ].map(([endpoint, method, auth, desc], i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '10px 14px' }}><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{endpoint}</code></td>
              <td style={{ padding: '10px 14px' }}><span style={{ background: method === 'GET' ? '#dbeafe' : '#dcfce7', color: method === 'GET' ? '#2563eb' : '#16a34a', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>{method}</span></td>
              <td style={{ padding: '10px 14px', color: '#64748b' }}>{auth}</td>
              <td style={{ padding: '10px 14px', color: '#475569' }}>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>

    <Section title="Flow SDK Source">
      <p style={{ color: '#475569', fontSize: 14, marginBottom: 12 }}>The SDK is served as a standalone JavaScript file from your backend server.</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '12px 16px', flex: 1, fontSize: 13 }}>
          <strong style={{ color: '#166534' }}>File location:</strong>
          <code style={{ display: 'block', marginTop: 4, color: '#15803d' }}>backend/public/flow-sdk.js</code>
        </div>
        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '12px 16px', flex: 1, fontSize: 13 }}>
          <strong style={{ color: '#075985' }}>Served at:</strong>
          <code style={{ display: 'block', marginTop: 4, color: '#0369a1' }}>http://your-server/flow-sdk.js</code>
        </div>
      </div>
    </Section>
  </div>
);

export default SDKDocs;
