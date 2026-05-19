import React from 'react';
import FunnelChart from '../components/FunnelChart';
import DropOffHeatmap from '../components/DropOffHeatmap';
import FlowSpecPdfPanel from '../components/FlowSpecPdfPanel';
import FlowRulesEditor from '../components/FlowRulesEditor';

export default function CustomViewsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} data-testid="custom-views-page">
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0, marginBottom: 4 }}>
          Onboarding Views
        </h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: 13 }}>
          Custom analytics, spec generation, and branching-rule management for onboarding flows.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
        <FunnelChart />
        <DropOffHeatmap />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
        <FlowSpecPdfPanel />
        <FlowRulesEditor />
      </div>
    </div>
  );
}
