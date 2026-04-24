import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
};

const toastColors = {
  success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', icon: '#16a34a' },
  error: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', icon: '#dc2626' },
  warning: { bg: '#fffbeb', border: '#fed7aa', text: '#92400e', icon: '#d97706' },
  info: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', icon: '#2563eb' }
};

const Toast = ({ toast, onClose }) => {
  const Icon = toastIcons[toast.type] || Info;
  const colors = toastColors[toast.type] || toastColors.info;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 16px',
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: 10,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      minWidth: 300,
      maxWidth: 420,
      animation: 'slideIn 0.3s ease'
    }}>
      <Icon size={20} color={colors.icon} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 14, color: colors.text, fontWeight: 500 }}>
        {toast.message}
      </span>
      <button
        onClick={() => onClose(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: colors.text,
          padding: 2,
          opacity: 0.6,
          flexShrink: 0
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error', 6000),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info')
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}>
        {toasts.map(t => (
          <Toast key={t.id} toast={t} onClose={removeToast} />
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
