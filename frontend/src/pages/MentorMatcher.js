import React, { useState } from 'react';
import { Users, Target, Star, MessageCircle, Sparkles, X } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { mentorMatchesAPI, aiGenerateAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { useEffect } from 'react';

const sampleData = [
  { mentee_name: 'Alex Kim', department: 'Engineering', skills_to_develop: ['System Design', 'Code Review', 'Technical Writing'], match_reason: 'Junior developer looking to grow into a mid-level role. Wants to learn scalable architecture patterns.', status: 'pending' },
  { mentee_name: 'Jordan Brooks', department: 'Product', skills_to_develop: ['Product Strategy', 'User Research', 'Roadmap Planning', 'Stakeholder Management'], match_reason: 'Transitioning from software engineering to product management.', status: 'pending' },
  { mentee_name: 'Samantha Torres', department: 'Engineering', skills_to_develop: ['Team Management', 'Conflict Resolution', 'Performance Reviews', 'Strategic Planning'], match_reason: 'Senior engineer recently promoted to team lead. First time managing people.', status: 'pending' },
  { mentee_name: 'Ravi Mehta', department: 'Design', skills_to_develop: ['Data Analytics', 'A/B Testing', 'SQL Basics', 'Business Metrics'], match_reason: 'UX designer wanting to become more data-driven.', status: 'pending' },
];

const getStatusColor = (status) => {
  const colors = { active: '#10b981', pending: '#f59e0b', completed: '#6366f1' };
  return colors[status] || '#6b7280';
};

const MentorForm = ({ data, onChange }) => {
  const [skillInput, setSkillInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const skills = Array.isArray(data.skills_to_develop) ? data.skills_to_develop :
    (typeof data.skills_to_develop === 'string' ? (() => { try { return JSON.parse(data.skills_to_develop); } catch { return []; } })() : []);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      onChange({ ...data, skills_to_develop: [...skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    onChange({ ...data, skills_to_develop: skills.filter(s => s !== skill) });
  };

  const findMentorWithAI = async () => {
    setAiLoading(true);
    try {
      const response = await aiGenerateAPI.findMentor({
        mentee_name: data.mentee_name, mentee_role: 'Team Member',
        department: data.department, skills_to_develop: skills, career_goals: data.match_reason
      });
      setAiResult(response.data.match);
      if (response.data.match?.recommended_mentor) {
        onChange({
          ...data,
          mentor_name: response.data.match.recommended_mentor.name || data.mentor_name,
          matching_score: response.data.match.recommended_mentor.matching_score || data.matching_score,
          match_reason: response.data.match.recommended_mentor.match_reason || data.match_reason,
          ai_recommendation: JSON.stringify(response.data.match)
        });
      }
    } catch (error) {
      console.error('Error finding mentor:', error);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 12px', background: '#f8fafc', borderRadius: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 11, color: '#94a3b8', alignSelf: 'center', marginRight: 4 }}>Load sample:</span>
        {sampleData.map((sample, i) => (
          <button key={i} type="button" onClick={() => { onChange({ ...data, ...sample, mentor_name: '', matching_score: 0 }); setAiResult(null); setSkillInput(''); }}
            style={{ padding: '4px 10px', fontSize: 11, fontWeight: 500, background: 'linear-gradient(135deg, #ede9fe, #f3e8ff)', color: '#7c3aed', border: '1px solid #ddd6fe', borderRadius: 20, cursor: 'pointer' }}>
            {['Junior Dev', 'Career Switch', 'Leadership', 'Cross-functional'][i]}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Mentee Name *</label>
          <input type="text" value={data.mentee_name || ''} onChange={(e) => onChange({ ...data, mentee_name: e.target.value })} required
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Department *</label>
          <input type="text" value={data.department || ''} onChange={(e) => onChange({ ...data, department: e.target.value })} required
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Skills to Develop</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            placeholder="Type a skill and press Enter"
            style={{ flex: 1, padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
          <button type="button" onClick={addSkill}
            style={{ padding: '10px 16px', background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>Add</button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {skills.map((skill, i) => (
            <span key={i} style={{ padding: '4px 10px', background: '#6366f120', color: '#6366f1', borderRadius: 16, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
              {skill} <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeSkill(skill)} />
            </span>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Career Goals / Notes</label>
        <textarea value={data.match_reason || ''} onChange={(e) => onChange({ ...data, match_reason: e.target.value })} rows={3}
          placeholder="Describe career goals or development objectives..."
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, resize: 'vertical' }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Status</label>
        <select value={data.status || 'pending'} onChange={(e) => onChange({ ...data, status: e.target.value })}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: 'white' }}>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <button type="button" onClick={findMentorWithAI} disabled={aiLoading || !data.mentee_name || skills.length === 0}
        style={{ width: '100%', padding: '12px', marginBottom: 16, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600 }}>
        <Sparkles size={18} /> {aiLoading ? 'Finding Match...' : 'Find AI-Powered Match'}
      </button>
      {aiResult && (
        <div style={{ background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)', padding: 16, borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Sparkles size={16} style={{ color: '#8b5cf6' }} />
            <span style={{ fontWeight: 600, color: '#7c3aed' }}>AI Match Result</span>
          </div>
          {typeof aiResult === 'object' ? (
            <div>
              {aiResult.recommended_mentor && (
                <div style={{ padding: 12, background: 'white', borderRadius: 8, marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, color: '#7c3aed', marginBottom: 4 }}>Recommended: {aiResult.recommended_mentor.name}</div>
                  <div style={{ fontSize: 13, color: '#581c87' }}>Match Score: {aiResult.recommended_mentor.matching_score}%</div>
                  <p style={{ color: '#581c87', fontSize: 14, marginTop: 8 }}>{aiResult.recommended_mentor.match_reason}</p>
                </div>
              )}
              {aiResult.development_plan && <p style={{ color: '#581c87', fontSize: 14, marginBottom: 8 }}><strong>Development Plan:</strong> {aiResult.development_plan}</p>}
              {aiResult.session_recommendations?.length > 0 && (
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#7c3aed', marginBottom: 4 }}>Suggested Topics:</div>
                  <ul style={{ margin: 0, paddingLeft: 20, color: '#581c87', fontSize: 13 }}>
                    {aiResult.session_recommendations.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: '#581c87', fontSize: 14, whiteSpace: 'pre-wrap' }}>{aiResult}</p>
          )}
        </div>
      )}
    </div>
  );
};

const MentorMatcher = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchMatches = async () => {
    try {
      const response = await mentorMatchesAPI.getAll();
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setMatches(data);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to load mentor matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatches(); }, []);

  const handleSubmit = async (data) => {
    await mentorMatchesAPI.create({ ...data, mentee_id: 1 });
    toast.success('Mentor match created successfully');
    fetchMatches();
  };

  const handleUpdate = async (id, data) => {
    await mentorMatchesAPI.update(id, data);
    toast.success('Mentor match updated successfully');
    fetchMatches();
  };

  const handleDelete = async (id) => {
    await mentorMatchesAPI.delete(id);
    toast.success('Mentor match deleted');
    fetchMatches();
  };

  const parseSkills = (skills) => {
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') { try { return JSON.parse(skills); } catch { return []; } }
    return [];
  };

  const columns = [
    {
      key: 'mentee_name',
      label: 'Mentee',
      render: (value, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: 13 }}>{value?.charAt(0)}</div>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: 13, marginLeft: -10, border: '2px solid white' }}>{row.mentor_name?.charAt(0) || '?'}</div>
          </div>
          <div>
            <div style={{ fontWeight: 500 }}>{value}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>with {row.mentor_name || 'TBD'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'department',
      label: 'Department',
      render: (value) => <span>{value || '-'}</span>
    },
    {
      key: 'skills_to_develop',
      label: 'Skills',
      render: (value) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {parseSkills(value).slice(0, 2).map((skill, i) => (
            <span key={i} style={{ padding: '2px 8px', background: '#f1f5f9', borderRadius: 12, fontSize: 11, color: '#475569' }}>{skill}</span>
          ))}
          {parseSkills(value).length > 2 && <span style={{ fontSize: 11, color: '#94a3b8' }}>+{parseSkills(value).length - 2}</span>}
        </div>
      )
    },
    {
      key: 'matching_score',
      label: 'Match',
      render: (value) => value > 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Target size={14} style={{ color: '#6366f1' }} />
          <div style={{ width: 50, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${value}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: 3 }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#6366f1' }}>{value}%</span>
        </div>
      ) : <span style={{ color: '#cbd5e1', fontSize: 12 }}>-</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: `${getStatusColor(value)}20`, color: getStatusColor(value) }}>{value}</span>
      )
    },
    {
      key: 'session_count',
      label: 'Sessions',
      render: (value, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b' }}>
          <MessageCircle size={14} /> {value || 0}
          {row.feedback_score && <><Star size={14} style={{ color: '#f59e0b' }} /> {row.feedback_score}</>}
        </div>
      )
    }
  ];

  const detailFields = [
    { key: 'id', label: 'ID' },
    { key: 'mentee_name', label: 'Mentee' },
    { key: 'mentor_name', label: 'Mentor', render: (v) => v || 'TBD' },
    { key: 'department', label: 'Department' },
    { key: 'skills_to_develop', label: 'Skills', render: (v) => parseSkills(v).join(', ') || '-' },
    { key: 'matching_score', label: 'Match Score', render: (v) => v ? `${v}%` : '-' },
    { key: 'match_reason', label: 'Match Reason' },
    { key: 'status', label: 'Status' },
    { key: 'session_count', label: 'Sessions', render: (v) => v || 0 },
    { key: 'ai_recommendation', label: 'AI Recommendation', render: (v) => v || '-' },
    { key: 'created_at', label: 'Created At', render: (v) => v ? new Date(v).toLocaleString() : '-' }
  ];

  return (
    <DataTable
      title="AI Mentor Matcher"
      data={matches}
      columns={columns}
      loading={loading}
      addButtonText="New Match"
      FormComponent={MentorForm}
      onSubmit={handleSubmit}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      detailFields={detailFields}
      emptyIcon={Users}
      onExportCSV={mentorMatchesAPI.exportCSV}
      onExportPDF={mentorMatchesAPI.exportPDF}
    />
  );
};

export default MentorMatcher;
