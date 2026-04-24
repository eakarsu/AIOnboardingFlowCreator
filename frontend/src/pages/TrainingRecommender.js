import React, { useState, useEffect } from 'react';
import { GraduationCap, Clock, TrendingUp, Sparkles, X } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { trainingAPI, aiGenerateAPI } from '../services/api';
import { useToast } from '../components/Toast';

const sampleData = [
  { user_name: 'Chris Nguyen', current_role: 'Senior Software Engineer', target_role: 'Technical Lead', skill_gap: ['System Architecture', 'Team Mentoring', 'Technical Decision Making'], priority: 'high', status: 'pending' },
  { user_name: 'Maya Rodriguez', current_role: 'Business Analyst', target_role: 'Data Scientist', skill_gap: ['Python Programming', 'Machine Learning', 'Statistical Modeling', 'SQL Advanced'], priority: 'high', status: 'pending' },
  { user_name: 'Tomas Eriksson', current_role: 'Senior UX Designer', target_role: 'Design Manager', skill_gap: ['People Management', 'Design Systems Strategy', 'Budget Planning', 'Cross-functional Leadership'], priority: 'medium', status: 'pending' },
  { user_name: 'Aaliyah Johnson', current_role: 'Customer Support Agent', target_role: 'Customer Success Manager', skill_gap: ['Account Management', 'Renewal Strategy', 'Data Analysis', 'Executive Communication'], priority: 'medium', status: 'pending' },
];

const getPriorityColor = (priority) => {
  const colors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
  return colors[priority] || '#6b7280';
};

const getStatusColor = (status) => {
  const colors = { in_progress: '#3b82f6', pending: '#f59e0b', completed: '#10b981' };
  return colors[status] || '#6b7280';
};

const TrainingForm = ({ data, onChange }) => {
  const [skillInput, setSkillInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const skills = Array.isArray(data.skill_gap) ? data.skill_gap :
    (typeof data.skill_gap === 'string' ? (() => { try { return JSON.parse(data.skill_gap); } catch { return []; } })() : []);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      onChange({ ...data, skill_gap: [...skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    onChange({ ...data, skill_gap: skills.filter(s => s !== skill) });
  };

  const generateWithAI = async () => {
    setAiLoading(true);
    try {
      const response = await aiGenerateAPI.generateTrainingPlan({
        user_name: data.user_name, current_role: data.current_role,
        target_role: data.target_role, current_skills: skills
      });
      setAiResult(response.data.plan);
      if (response.data.plan && typeof response.data.plan === 'object') {
        onChange({
          ...data,
          recommended_courses: response.data.plan.recommended_courses,
          ai_learning_path: response.data.plan.learning_path,
          estimated_duration: response.data.plan.estimated_duration
        });
      }
    } catch (error) {
      console.error('Error generating:', error);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 12px', background: '#f8fafc', borderRadius: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 11, color: '#94a3b8', alignSelf: 'center', marginRight: 4 }}>Load sample:</span>
        {sampleData.map((sample, i) => (
          <button key={i} type="button" onClick={() => { onChange({ ...data, ...sample, ai_learning_path: '', estimated_duration: '' }); setSkillInput(''); setAiResult(null); }}
            style={{ padding: '4px 10px', fontSize: 11, fontWeight: 500, background: 'linear-gradient(135deg, #ede9fe, #f3e8ff)', color: '#7c3aed', border: '1px solid #ddd6fe', borderRadius: 20, cursor: 'pointer' }}>
            {['Dev to Lead', 'Analyst to DS', 'Designer to Mgr', 'Support to CS'][i]}
          </button>
        ))}
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Employee Name *</label>
        <input type="text" value={data.user_name || ''} onChange={(e) => onChange({ ...data, user_name: e.target.value })} required
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Current Role *</label>
          <input type="text" value={data.current_role || ''} onChange={(e) => onChange({ ...data, current_role: e.target.value })} required
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Target Role *</label>
          <input type="text" value={data.target_role || ''} onChange={(e) => onChange({ ...data, target_role: e.target.value })} required
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Skills to Develop</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            placeholder="Type skill and press Enter"
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Priority</label>
          <select value={data.priority || 'medium'} onChange={(e) => onChange({ ...data, priority: e.target.value })}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: 'white' }}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Status</label>
          <select value={data.status || 'pending'} onChange={(e) => onChange({ ...data, status: e.target.value })}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: 'white' }}>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      <button type="button" onClick={generateWithAI} disabled={aiLoading || !data.user_name || !data.current_role || !data.target_role}
        style={{ width: '100%', padding: '12px', marginBottom: 16, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600 }}>
        <Sparkles size={18} /> {aiLoading ? 'Generating...' : 'Generate AI Training Plan'}
      </button>
      {aiResult && (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', padding: 16, borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Sparkles size={16} style={{ color: '#10b981' }} />
            <span style={{ fontWeight: 600, color: '#166534' }}>AI Generated Plan</span>
            {typeof aiResult === 'object' && aiResult.estimated_duration && <span style={{ marginLeft: 'auto', fontSize: 12, color: '#166534' }}>{aiResult.estimated_duration}</span>}
          </div>
          {typeof aiResult === 'object' ? (
            <div>
              {aiResult.skill_gap_analysis && (
                <div style={{ padding: 12, background: 'white', borderRadius: 8, marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#166534', marginBottom: 4 }}>Skill Gap Analysis</div>
                  {aiResult.skill_gap_analysis.missing_skills?.length > 0 && <div style={{ marginBottom: 4 }}><span style={{ fontSize: 12, color: '#dc2626' }}>Missing:</span> {aiResult.skill_gap_analysis.missing_skills.join(', ')}</div>}
                  {aiResult.skill_gap_analysis.skills_to_improve?.length > 0 && <div><span style={{ fontSize: 12, color: '#f59e0b' }}>Improve:</span> {aiResult.skill_gap_analysis.skills_to_improve.join(', ')}</div>}
                </div>
              )}
              {aiResult.learning_path && <p style={{ color: '#14532d', fontSize: 14, marginBottom: 12 }}>{aiResult.learning_path}</p>}
              {aiResult.recommended_courses?.length > 0 && (
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#166534', marginBottom: 8 }}>Recommended Courses:</div>
                  {aiResult.recommended_courses.map((course, i) => (
                    <div key={i} style={{ padding: 8, background: 'white', borderRadius: 6, marginBottom: 4, fontSize: 13 }}>
                      <strong>{course.name}</strong> - {course.provider} ({course.duration})
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: '#14532d', fontSize: 14, whiteSpace: 'pre-wrap' }}>{aiResult}</p>
          )}
        </div>
      )}
    </div>
  );
};

const TrainingRecommender = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchRecommendations = async () => {
    try {
      const response = await trainingAPI.getAll();
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching:', error);
      toast.error('Failed to load training recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecommendations(); }, []);

  const handleSubmit = async (data) => {
    await trainingAPI.create({ ...data, user_id: 1 });
    toast.success('Training plan created successfully');
    fetchRecommendations();
  };

  const handleUpdate = async (id, data) => {
    await trainingAPI.update(id, data);
    toast.success('Training plan updated successfully');
    fetchRecommendations();
  };

  const handleDelete = async (id) => {
    await trainingAPI.delete(id);
    toast.success('Training plan deleted');
    fetchRecommendations();
  };

  const parseSkills = (sg) => {
    if (Array.isArray(sg)) return sg;
    if (typeof sg === 'string') { try { const p = JSON.parse(sg); return Array.isArray(p) ? p : (p.missing_skills || p.skills_to_improve || Object.values(p).flat() || []); } catch { return []; } }
    if (typeof sg === 'object' && sg) return sg.missing_skills || sg.skills_to_improve || Object.values(sg).flat() || [];
    return [];
  };

  const columns = [
    {
      key: 'user_name',
      label: 'Employee',
      render: (value, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <GraduationCap size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 500 }}>{value}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{row.current_role}</div>
          </div>
        </div>
      )
    },
    {
      key: 'target_role',
      label: 'Path',
      render: (value, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <span style={{ color: '#64748b' }}>{row.current_role}</span>
          <TrendingUp size={14} color="#6366f1" />
          <span style={{ fontWeight: 500 }}>{value}</span>
        </div>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (value) => (
        <span style={{ padding: '4px 10px', borderRadius: 16, fontSize: 12, fontWeight: 500, background: getPriorityColor(value) + '20', color: getPriorityColor(value) }}>{value}</span>
      )
    },
    {
      key: 'estimated_duration',
      label: 'Duration',
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#64748b' }}>
          <Clock size={14} /> {value || 'TBD'}
        </div>
      )
    },
    {
      key: 'completion_percentage',
      label: 'Progress',
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 60, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${value || 0}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: 3 }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#6366f1' }}>{value || 0}%</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: getStatusColor(value) + '20', color: getStatusColor(value) }}>{value?.replace('_', ' ')}</span>
      )
    }
  ];

  const detailFields = [
    { key: 'id', label: 'ID' },
    { key: 'user_name', label: 'Employee' },
    { key: 'current_role', label: 'Current Role' },
    { key: 'target_role', label: 'Target Role' },
    { key: 'skill_gap', label: 'Skills to Develop', render: (v) => parseSkills(v).map(s => typeof s === 'string' ? s : s.name || JSON.stringify(s)).join(', ') || '-' },
    { key: 'priority', label: 'Priority' },
    { key: 'estimated_duration', label: 'Duration', render: (v) => v || 'TBD' },
    { key: 'completion_percentage', label: 'Progress', render: (v) => `${v || 0}%` },
    { key: 'status', label: 'Status', render: (v) => v?.replace('_', ' ') },
    { key: 'ai_learning_path', label: 'AI Learning Path', render: (v) => v || '-' },
    { key: 'recommended_courses', label: 'Courses', render: (v) => {
      if (!v) return '-';
      const courses = typeof v === 'string' ? JSON.parse(v) : v;
      return Array.isArray(courses) ? courses.map(c => c.name).join(', ') : '-';
    }},
    { key: 'created_at', label: 'Created At', render: (v) => v ? new Date(v).toLocaleString() : '-' }
  ];

  return (
    <DataTable
      title="AI Training Recommender"
      data={recommendations}
      columns={columns}
      loading={loading}
      addButtonText="New Training Plan"
      FormComponent={TrainingForm}
      onSubmit={handleSubmit}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      detailFields={detailFields}
      emptyIcon={GraduationCap}
      onExportCSV={trainingAPI.exportCSV}
      onExportPDF={trainingAPI.exportPDF}
    />
  );
};

export default TrainingRecommender;
