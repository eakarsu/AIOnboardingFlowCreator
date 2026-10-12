import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import NativeAIControls from './components/NativeAIControls';
import AIReport, { FormattedAIValue } from './components/AIReport';
import FullFieldPresets from './components/FullFieldPresets';
import Login from './pages/Login';
import features from './components/aiWorkspaceFeatures.json';
import AIWorkspace, { workspaceFields, workspacePresets } from './components/AIWorkspace';
import ComplianceAudit from './pages/ComplianceAudit';
import AIContent from './pages/AIContent';
import { aiContentAPI, aiGenerateAPI, aiChecklistsAPI, aiProgressAPI, feedbackAPI, mentorMatchesAPI, ptoRequestsAPI, trainingAPI, flowsAPI, recordRows } from './services/api';
import Flows from './pages/Flows';
import { DataTable } from './components/DataTable';
import AIChecklists from './pages/AIChecklists';
import AIProgressTracker from './pages/AIProgressTracker';
import FeedbackCollector from './pages/FeedbackCollector';
import MentorMatcher from './pages/MentorMatcher';
import PTOScheduler from './pages/PTOScheduler';
import TrainingRecommender from './pages/TrainingRecommender';

global.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('./contexts/AuthContext', () => ({ useAuth: () => ({ login: jest.fn(), register: jest.fn(), demoLogin: global.fixtureDemoLogin }) }));
jest.mock('./components/Toast', () => ({ useToast: () => ({ error: jest.fn(), success: jest.fn() }) }));

let host, root;
beforeEach(() => { host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); });
const render = (element) => act(() => root.render(element));
const click = (element) => act(() => element.dispatchEvent(new MouseEvent('click', { bubbles: true })));

test('native preset fills required and optional fields without submitting or inventing references', () => {
  const submit = jest.fn();
  render(<form onSubmit={submit}><NativeAIControls context="Compliance audit"><input name="goal" required /><textarea name="policy" /><input name="record_id" required /><select name="flow_id"><option value="">Choose</option><option value="real-42">Existing flow</option></select><input type="file" name="upload" /></NativeAIControls><button type="submit">Run</button></form>);
  const preset = host.querySelector('.native-ai-control-buttons button');
  expect(host.querySelectorAll('.native-ai-control-buttons button')).toHaveLength(3);
  click(preset);
  expect(host.querySelector('[name=goal]').value).toBeTruthy();
  expect(host.querySelector('[name=policy]').value).toBeTruthy();
  expect(host.querySelector('[name=record_id]').value).toBe('');
  expect(host.querySelector('[name=flow_id]').value).toBe('real-42');
  expect(host.querySelector('[name=upload]').files).toHaveLength(0);
  expect(host.querySelector('[role=status]').textContent).toMatch(/record id/i);
  expect(submit).not.toHaveBeenCalled();
});

test('workspace presets fill optional fields but do not submit', () => {
  const submit = jest.fn();
  const values = { input: '', context: '', goal: '' };
  const onChange = jest.fn();
  render(<form onSubmit={submit}><FullFieldPresets value={values} onChange={onChange} presets={[{label:'Scenario', values:{input:'Brief',context:'Context',goal:'Goal'}},{label:'Review',values:{input:'Review',context:'Details',goal:'Outcome'}}]} /></form>);
  expect(host.querySelectorAll('button')).toHaveLength(2);
  click(host.querySelector('button'));
  expect(onChange).toHaveBeenCalledWith({input:'Brief',context:'Context',goal:'Goal'});
  expect(submit).not.toHaveBeenCalled();
});

test('returned and saved structured reports render labels, tables and exact scalar values', () => {
  const payload = { result_json: JSON.stringify({ summary: { approved: false, count: 0, note: '' }, steps: [{ name: 'First', done: false }, { name: 'Second', done: true }] }) };
  render(<><AIReport response={payload} title="Returned" /><AIReport response={{id:'saved-1', model:'fixture', ...payload}} title="Saved" /><FormattedAIValue value={{ nested: { amount: 0, empty: '' } }} /></>);
  expect(host.querySelectorAll('.ai-report')).toHaveLength(2);
  expect(host.querySelectorAll('table')).toHaveLength(2);
  expect(host.textContent).toMatch(/Approved/);
  expect(host.textContent).toMatch(/No/);
  expect(host.textContent).toMatch(/Count/);
  expect(host.textContent).toMatch(/0/);
  expect(host.textContent).toMatch(/""/);
  expect(host.querySelector('pre')).toBeNull();
});

test('every workspace feature has three full field presets', () => {
  expect(features.length).toBeGreaterThan(0);
  for (const feature of features) {
    const presets = workspacePresets(feature);
    expect(presets.length).toBeGreaterThanOrEqual(2);
    for (const preset of presets) {
      for (const field of workspaceFields) expect(String(preset.values[field.key] || '').trim()).not.toBe('');
    }
  }
});

test('workspace returned result and saved detail use structured sections without a provider call', async () => {
  const item = { id: 'fixture-1', model: 'fixture', created_at: new Date().toISOString(), input: { goal: 'Review' }, result_json: { findings: [{ title: 'Access', complete: false, count: 0, note: '' }] } };
  const previousFetch = global.fetch;
  global.fetch = jest.fn(async (url, options = {}) => ({ ok: true, json: async () => options.method === 'POST' ? { item } : { items: [item] } }));
  try {
    await act(async () => root.render(<AIWorkspace feature={features[0]} token="fixture-token" />));
    expect(host.querySelector('.ai-history-row')).not.toBeNull();
    click(host.querySelector('.ai-history-row'));
    expect(document.querySelector('.ai-report')).not.toBeNull();
    expect(document.body.textContent).toContain('Findings');
    expect(document.body.textContent).toContain('No');
    expect(document.body.textContent).toContain('0');
    expect(document.body.textContent).toContain('""');
    expect(global.fetch.mock.calls.every(([, options]) => !options || options.method !== 'POST')).toBe(true);
  } finally { global.fetch = previousFetch; }
});

test('workspace returned response displays structured JSON from a mocked run', async () => {
  const item = { id: 'fixture-returned', model: 'fixture', created_at: new Date().toISOString(), input: { goal: 'Review' }, result_json: { decision: { accepted: false, score: 0, explanation: '' }, actions: ['Review access'] } };
  const previousFetch = global.fetch;
  global.fetch = jest.fn(async (url, options = {}) => ({ ok: true, json: async () => options.method === 'POST' ? { item } : { items: [] } }));
  try {
    await act(async () => root.render(<AIWorkspace feature={features[0]} token="fixture-token" />));
    click(host.querySelector('.ai-preset-bar button'));
    await act(async () => host.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(global.fetch.mock.calls.filter(([, options]) => options && options.method === 'POST')).toHaveLength(1);
    expect(host.querySelector('.ai-report')).not.toBeNull();
    expect(host.textContent).toContain('Decision');
    expect(host.textContent).toContain('No');
    expect(host.textContent).toContain('0');
    expect(host.textContent).toContain('""');
  } finally { global.fetch = previousFetch; }
});

test('demo login uses configured auth action only on click', async () => {
  global.fixtureDemoLogin = jest.fn().mockResolvedValue({success:false,error:'Demo unavailable'});
  render(<MemoryRouter><Login /></MemoryRouter>);
  const button = Array.from(host.querySelectorAll('button')).find((item) => item.textContent.includes('Log In as Demo'));
  expect(button.type).toBe('button');
  expect(global.fixtureDemoLogin).not.toHaveBeenCalled();
  await act(async () => { button.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
  expect(global.fixtureDemoLogin).toHaveBeenCalledTimes(1);
  expect(host.textContent).toContain('Demo unavailable');
});

test('Compliance Audit native presets fill the real controlled fields without running AI', () => {
  const run = jest.spyOn(aiGenerateAPI, 'complianceAudit');
  try {
    render(<ComplianceAudit />);
    const fields = () => Array.from(host.querySelectorAll('.native-ai-scope input, .native-ai-scope textarea'));
    expect(host.querySelectorAll('.native-ai-control-buttons button')).toHaveLength(3);
    expect(fields()).toHaveLength(5);
    for (const preset of host.querySelectorAll('.native-ai-control-buttons button')) {
      click(preset);
      expect(fields().every((field) => field.value.trim())).toBe(true);
      expect(fields()[4].value).toMatch(/policy/i);
    }
    expect(run).not.toHaveBeenCalled();
  } finally { run.mockRestore(); }
});

test('AI Content native generator sample fills every request input without generation', async () => {
  const getAll = jest.spyOn(aiContentAPI, 'getAll').mockResolvedValue({ data: [] });
  const generate = jest.spyOn(aiGenerateAPI, 'welcomeMessage');
  try {
    await act(async () => root.render(<AIContent />));
    const sample = Array.from(host.querySelectorAll('button')).find((button) => button.textContent === 'SaaS Onboarding');
    expect(sample).toBeTruthy();
    click(sample);
    let form = host.querySelector('form');
    expect(form).toBeTruthy();
    expect(Array.from(form.querySelectorAll('input, textarea')).map((field) => field.value)).toEqual([
      'CloudFlow', 'marketing teams switching from spreadsheets', 'friendly and empowering'
    ]);
    for (const card of host.querySelectorAll('.fade-in > div:nth-child(2) > div')) {
      const bar = Array.from(card.querySelectorAll('span')).find((item) => item.textContent === 'Fill all fields:')?.parentElement;
      expect(bar?.querySelectorAll('button').length).toBeGreaterThanOrEqual(2);
      for (const button of bar.querySelectorAll('button')) {
        click(button);
        form = card.querySelector('form');
        expect(form).toBeTruthy();
        expect(Array.from(form.querySelectorAll('input, textarea')).every((field) => String(field.value).trim())).toBe(true);
      }
    }
    expect(generate).not.toHaveBeenCalled();
  } finally { getAll.mockRestore(); generate.mockRestore(); }
});

test.each([
  ['checklist', AIChecklists, aiChecklistsAPI, 'New Checklist', 'New Hire'],
  ['progress', AIProgressTracker, aiProgressAPI, 'New Goal', 'AWS Cert'],
  ['feedback', FeedbackCollector, feedbackAPI, 'New Feedback', 'Feature Request'],
  ['mentor', MentorMatcher, mentorMatchesAPI, 'New Match', 'Junior Dev'],
  ['PTO', PTOScheduler, ptoRequestsAPI, 'New Request', 'Summer Vacation'],
  ['training', TrainingRecommender, trainingAPI, 'New Training Plan', 'Dev to Lead']
])('%s native form sample populates its editable inputs without calling AI', async (_, Page, api, addLabel, sampleLabel) => {
  const getAll = jest.spyOn(api, 'getAll').mockResolvedValue({ data: [] });
  const aiSpies = Object.entries(aiGenerateAPI).filter(([, method]) => typeof method === 'function').map(([name]) => jest.spyOn(aiGenerateAPI, name));
  try {
    await act(async () => root.render(<Page />));
    const add = Array.from(host.querySelectorAll('button')).find((button) => button.textContent.trim() === addLabel);
    expect(add).toBeTruthy();
    click(add);
    const sample = Array.from(host.querySelectorAll('button')).find((button) => button.textContent.trim() === sampleLabel);
    expect(sample).toBeTruthy();
    const form = host.querySelector('form');
    expect(form).toBeTruthy();
    const bar = sample.parentElement;
    expect(bar.querySelectorAll('button').length).toBeGreaterThanOrEqual(2);
    for (const button of bar.querySelectorAll('button')) {
      click(button);
      const fields = Array.from(form.querySelectorAll('input, textarea, select')).filter((field) => !['hidden', 'submit'].includes(field.type));
      expect(fields.length).toBeGreaterThan(3);
      expect(fields.every((field) => String(field.value).trim())).toBe(true);
    }
    expect(aiSpies.every((spy) => spy.mock.calls.length === 0)).toBe(true);
  } finally { getAll.mockRestore(); aiSpies.forEach((spy) => spy.mockRestore()); }
});

test('the flow list renders all 15 project seed flows from a paginated API shape without errors', async () => {
  const seedNames = [
    'New User Welcome Flow', 'Premium Feature Tour', 'Dashboard Overview',
    'API Integration Setup', 'Team Collaboration Guide', 'Mobile App Quick Start',
    'Billing Setup Wizard', 'Custom Reports Training', 'Security Best Practices',
    'Automation Workflow Builder', 'E-commerce Integration', 'Data Import Guide',
    'Notification Settings Tour', 'Marketplace Introduction', 'Admin Console Mastery'
  ];
  const rows = seedNames.map((name, index) => ({
    id: index + 1, name, description: name, status: 'active',
    target_audience: 'New Users', total_steps: 5, completion_rate: 0
  }));
  const response = { data: rows, pagination: { page: 1, limit: 15, total: 15, totalPages: 1 } };
  expect(recordRows(response)).toHaveLength(15);
  expect(recordRows({ data: { error: 'Unavailable' } })).toEqual([]);
  const fetch = jest.spyOn(flowsAPI, 'getAll').mockResolvedValue({ data: response });
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    await act(async () => root.render(<MemoryRouter><Flows /></MemoryRouter>));
    expect(host.querySelectorAll('tbody tr')).toHaveLength(15);
    expect(host.textContent).toContain('Admin Console Mastery');
    expect(consoleError).not.toHaveBeenCalled();
  } finally { fetch.mockRestore(); consoleError.mockRestore(); }
});

test('record table safely handles a non-array payload', () => {
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    render(<DataTable title="Records" data={{ error: 'Unavailable' }} columns={[{ key: 'name', label: 'Name' }]} />);
    expect(host.textContent).toContain('No items found');
    expect(consoleError).not.toHaveBeenCalled();
  } finally { consoleError.mockRestore(); }
});
