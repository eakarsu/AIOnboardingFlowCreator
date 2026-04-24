import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Trash2, Plus, GripVertical,
  CheckCircle, Clock, Sparkles, BarChart3, Save, Loader
} from 'lucide-react';
import { flowsAPI, stepsAPI, aiGenerateAPI } from '../services/api';
import { Modal } from '../components/DataTable';
import { useToast } from '../components/Toast';

const StepCard = ({ step, onEdit, onDelete }) => {
  const typeColors = {
    modal: { bg: '#ede9fe', color: '#7c3aed' },
    tooltip: { bg: '#dbeafe', color: '#2563eb' },
    spotlight: { bg: '#fef3c7', color: '#d97706' },
    banner: { bg: '#dcfce7', color: '#16a34a' }
  };

  const colors = typeColors[step.step_type] || typeColors.modal;

  return (
    <div style={{
      background: 'white',
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12
    }}>
      <div style={{ color: '#cbd5e1', cursor: 'grab' }}>
        <GripVertical size={20} />
      </div>
      <div style={{
        width: 32,
        height: 32,
        background: '#6366f1',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: 14,
        fontWeight: 600,
        flexShrink: 0
      }}>
        {step.step_order}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>{step.title}</h3>
          <span style={{
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 500,
            background: colors.bg,
            color: colors.color
          }}>
            {step.step_type}
          </span>
        </div>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>{step.content}</p>
        {step.element_selector && (
          <code style={{
            fontSize: 11,
            padding: '2px 6px',
            background: '#f1f5f9',
            borderRadius: 4,
            color: '#475569'
          }}>
            {step.element_selector}
          </code>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => onEdit(step)}
          style={{
            padding: 8,
            background: '#f1f5f9',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            color: '#64748b'
          }}
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={() => onDelete(step.id)}
          style={{
            padding: 8,
            background: '#fef2f2',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            color: '#ef4444'
          }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

const StepForm = ({ data, onChange }) => (
  <div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
        Step Title *
      </label>
      <input
        type="text"
        value={data.title || ''}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
        placeholder="e.g., Welcome Message"
        required
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          fontSize: 14
        }}
      />
    </div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
        Content *
      </label>
      <textarea
        value={data.content || ''}
        onChange={(e) => onChange({ ...data, content: e.target.value })}
        placeholder="The message or instruction to show..."
        rows={3}
        required
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          fontSize: 14,
          resize: 'vertical'
        }}
      />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
          Step Type *
        </label>
        <select
          value={data.step_type || 'modal'}
          onChange={(e) => onChange({ ...data, step_type: e.target.value })}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            fontSize: 14,
            background: 'white'
          }}
        >
          <option value="modal">Modal</option>
          <option value="tooltip">Tooltip</option>
          <option value="spotlight">Spotlight</option>
          <option value="banner">Banner</option>
        </select>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
          Position
        </label>
        <select
          value={data.position || 'center'}
          onChange={(e) => onChange({ ...data, position: e.target.value })}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            fontSize: 14,
            background: 'white'
          }}
        >
          <option value="center">Center</option>
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </div>
    </div>
    <div>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
        Element Selector
      </label>
      <input
        type="text"
        value={data.element_selector || ''}
        onChange={(e) => onChange({ ...data, element_selector: e.target.value })}
        placeholder="e.g., #my-button, .my-class"
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          fontSize: 14
        }}
      />
    </div>
  </div>
);

const FlowDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [flow, setFlow] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStepForm, setShowStepForm] = useState(false);
  const [stepFormData, setStepFormData] = useState({});
  const [editingStep, setEditingStep] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const fetchData = async () => {
    try {
      const [flowRes, stepsRes] = await Promise.all([
        flowsAPI.getById(id),
        flowsAPI.getSteps(id)
      ]);
      setFlow(flowRes.data);
      setSteps(stepsRes.data);
    } catch (error) {
      console.error('Error fetching flow:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddStep = () => {
    setEditingStep(null);
    setStepFormData({ step_order: steps.length + 1 });
    setShowStepForm(true);
  };

  const handleEditStep = (step) => {
    setEditingStep(step);
    setStepFormData(step);
    setShowStepForm(true);
  };

  const handleDeleteStep = async (stepId) => {
    if (window.confirm('Are you sure you want to delete this step?')) {
      await stepsAPI.delete(stepId);
      toast.success('Step deleted successfully');
      fetchData();
    }
  };

  const handleStepSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingStep) {
        await stepsAPI.update(editingStep.id, stepFormData);
        toast.success('Step updated successfully');
      } else {
        await stepsAPI.create({ ...stepFormData, flow_id: parseInt(id) });
        toast.success('Step created successfully');
      }
      setShowStepForm(false);
      fetchData();
    } catch (error) {
      console.error('Error saving step:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleAIAnalysis = async () => {
    setAiLoading(true);
    try {
      const response = await aiGenerateAPI.analyzeFlow(id);
      setAnalysis(response.data.analysis);
    } catch (error) {
      console.error('Error analyzing flow:', error);
      alert('Failed to analyze flow. Make sure OpenRouter API key is configured.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIGenerateSteps = async () => {
    setAiLoading(true);
    try {
      const response = await aiGenerateAPI.flowSteps({
        flowName: flow.name,
        flowDescription: flow.description,
        numberOfSteps: 5
      });
      if (Array.isArray(response.data.steps)) {
        for (let i = 0; i < response.data.steps.length; i++) {
          const step = response.data.steps[i];
          await stepsAPI.create({
            flow_id: parseInt(id),
            title: step.title,
            content: step.content,
            step_type: step.step_type || 'modal',
            step_order: steps.length + i + 1,
            element_selector: step.element_selector
          });
        }
        toast.success('Steps generated successfully');
        fetchData();
      }
    } catch (error) {
      console.error('Error generating steps:', error);
      alert('Failed to generate steps. Make sure OpenRouter API key is configured.');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid #e2e8f0',
          borderTopColor: '#6366f1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!flow) {
    return <div>Flow not found</div>;
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => navigate('/flows')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            color: '#64748b',
            fontSize: 14,
            cursor: 'pointer',
            marginBottom: 16
          }}
        >
          <ArrowLeft size={18} />
          Back to Flows
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              background: flow.status === 'active' ? '#dcfce7' : '#fef3c7',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {flow.status === 'active' ? (
                <CheckCircle size={24} color="#16a34a" />
              ) : (
                <Clock size={24} color="#d97706" />
              )}
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                {flow.name}
              </h1>
              <p style={{ color: '#64748b', fontSize: 14 }}>{flow.description}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleAIAnalysis}
              disabled={aiLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                color: '#6366f1',
                fontSize: 14,
                fontWeight: 500,
                cursor: aiLoading ? 'wait' : 'pointer'
              }}
            >
              {aiLoading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <BarChart3 size={16} />}
              AI Analysis
            </button>
            <button
              onClick={handleAIGenerateSteps}
              disabled={aiLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                color: '#8b5cf6',
                fontSize: 14,
                fontWeight: 500,
                cursor: aiLoading ? 'wait' : 'pointer'
              }}
            >
              <Sparkles size={16} />
              AI Generate Steps
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        {[
          { label: 'Status', value: flow.status, color: flow.status === 'active' ? '#10b981' : '#f59e0b' },
          { label: 'Target Audience', value: flow.target_audience || '-' },
          { label: 'Total Steps', value: steps.length },
          { label: 'Completion Rate', value: `${flow.completion_rate || 0}%` }
        ].map((stat) => (
          <div key={stat.label} style={{
            background: 'white',
            borderRadius: 10,
            padding: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{stat.label}</p>
            <p style={{ fontSize: 18, fontWeight: 600, color: stat.color || '#1e293b' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* AI Analysis */}
      {analysis && (
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Sparkles size={18} color="#0284c7" />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0284c7' }}>AI Analysis</h3>
          </div>
          <div style={{ fontSize: 14, color: '#0369a1', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {analysis}
          </div>
        </div>
      )}

      {/* Steps */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b' }}>Flow Steps</h2>
        <button
          onClick={handleAddStep}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none',
            borderRadius: 8,
            color: 'white',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          <Plus size={18} />
          Add Step
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {steps.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 40,
            textAlign: 'center',
            color: '#64748b',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <p style={{ marginBottom: 16 }}>No steps yet. Add your first step to get started.</p>
            <button
              onClick={handleAddStep}
              style={{
                padding: '10px 20px',
                background: '#6366f1',
                border: 'none',
                borderRadius: 8,
                color: 'white',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Add First Step
            </button>
          </div>
        ) : (
          steps.map((step) => (
            <StepCard
              key={step.id}
              step={step}
              onEdit={handleEditStep}
              onDelete={handleDeleteStep}
            />
          ))
        )}
      </div>

      {/* Step Form Modal */}
      <Modal
        isOpen={showStepForm}
        onClose={() => setShowStepForm(false)}
        title={editingStep ? 'Edit Step' : 'Add Step'}
        onSubmit={handleStepSubmit}
        loading={formLoading}
      >
        <StepForm data={stepFormData} onChange={setStepFormData} />
      </Modal>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default FlowDetail;
