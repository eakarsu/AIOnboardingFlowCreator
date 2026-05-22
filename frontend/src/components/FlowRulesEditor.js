import React, { useCallback, useEffect, useState } from 'react';

// NON-VIZ 2 — CRUD editor for onboarding flow step branching rules.
const EMPTY = { step_key: '', condition_expr: '', next_step: '', priority: 1, active: true };

export default function FlowRulesEditor() {
  const [rules, setRules] = useState([]);
  const [draft, setDraft] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const authHeaders = () => {
    const token = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || '';
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/custom-views/rules', { headers: authHeaders() });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      setRules(data.rules || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const url = editingId ? `/api/custom-views/rules/${editingId}` : '/api/custom-views/rules';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(draft) });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      setDraft(EMPTY);
      setEditingId(null);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (id) => {
    setError(null);
    try {
      const res = await fetch(`/api/custom-views/rules/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setDraft({
      step_key: r.step_key,
      condition_expr: r.condition_expr,
      next_step: r.next_step,
      priority: r.priority,
      active: r.active,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(EMPTY);
  };

  const fieldStyle = {
    padding: '6px 8px',
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    fontSize: 13,
    fontFamily: 'inherit',
  };

  return (
    <div style={{ background: '#fff', padding: 20, borderRadius: 10, border: '1px solid #e2e8f0' }} data-testid="rules-editor">
      <h3 style={{ margin: 0, marginBottom: 4, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
        Flow Step Rules Editor
      </h3>
      <p style={{ margin: 0, marginBottom: 14, color: '#64748b', fontSize: 12 }}>
        CRUD for the branching logic that decides which step a user sees next.
      </p>

      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 80px 70px auto', gap: 8, marginBottom: 14 }}>
        <input style={fieldStyle} placeholder="step_key" value={draft.step_key}
               onChange={(e) => setDraft({ ...draft, step_key: e.target.value })} required />
        <input style={fieldStyle} placeholder='condition_expr (e.g. role == "engineer")' value={draft.condition_expr}
               onChange={(e) => setDraft({ ...draft, condition_expr: e.target.value })} required />
        <input style={fieldStyle} placeholder="next_step" value={draft.next_step}
               onChange={(e) => setDraft({ ...draft, next_step: e.target.value })} required />
        <input style={fieldStyle} type="number" min="1" value={draft.priority}
               onChange={(e) => setDraft({ ...draft, priority: parseInt(e.target.value, 10) || 1 })} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
          <input type="checkbox" checked={!!draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
          active
        </label>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="submit" style={{ padding: '6px 12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            {editingId ? 'Update' : 'Add'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} style={{ padding: '6px 10px', background: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: 8, borderRadius: 6, marginBottom: 10, fontSize: 12 }}>Error: {error}</div>}
      {loading && <div style={{ fontSize: 12, color: '#64748b' }}>Loading rules…</div>}

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
            <th style={{ padding: 6, color: '#475569' }}>ID</th>
            <th style={{ padding: 6, color: '#475569' }}>Step</th>
            <th style={{ padding: 6, color: '#475569' }}>Condition</th>
            <th style={{ padding: 6, color: '#475569' }}>Next</th>
            <th style={{ padding: 6, color: '#475569' }}>Pri</th>
            <th style={{ padding: 6, color: '#475569' }}>Active</th>
            <th style={{ padding: 6, color: '#475569' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((r) => (
            <tr key={r.id} style={{ borderTop: '1px solid #e2e8f0' }}>
              <td style={{ padding: 6, color: '#64748b' }}>{r.id}</td>
              <td style={{ padding: 6, color: '#0f172a', fontWeight: 600 }}>{r.step_key}</td>
              <td style={{ padding: 6, color: '#334155', fontFamily: 'monospace' }}>{r.condition_expr}</td>
              <td style={{ padding: 6, color: '#0f172a' }}>{r.next_step}</td>
              <td style={{ padding: 6 }}>{r.priority}</td>
              <td style={{ padding: 6 }}>{r.active ? 'yes' : 'no'}</td>
              <td style={{ padding: 6, display: 'flex', gap: 6 }}>
                <button onClick={() => startEdit(r)} style={{ padding: '4px 8px', background: '#e0e7ff', border: '1px solid #c7d2fe', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Edit</button>
                <button onClick={() => remove(r.id)} style={{ padding: '4px 8px', background: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Delete</button>
              </td>
            </tr>
          ))}
          {!loading && rules.length === 0 && (
            <tr><td colSpan={7} style={{ padding: 10, color: '#94a3b8', textAlign: 'center' }}>No rules yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
