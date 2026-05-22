import React, { useState } from 'react';

export default function ManagerReadiness() {
  const [form, setForm] = useState({ checklistCompletePct: 64, managerTouchpoints: 2, firstWeekMeetings: 1, openQuestions: 4, roleClarity: 3 });
  const [result, setResult] = useState(null);

  const submit = async () => {
    const response = await fetch('/api/manager-readiness/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      body: JSON.stringify(form),
    });
    setResult(await response.json());
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Manager Readiness</h1>
      {Object.entries(form).map(([key, value]) => (
        <label key={key} style={{ display: 'block', marginBottom: 12 }}>{key.replace(/([A-Z])/g, ' $1')}
          <input type="number" value={value} onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })} />
        </label>
      ))}
      <button onClick={submit}>Score readiness</button>
      {result && <section><h2>{result.level.toUpperCase()} · {result.score}/100</h2><ul>{result.actions.map((action) => <li key={action}>{action}</li>)}</ul></section>}
    </div>
  );
}
