import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useWindowSize from '../hooks/useWindowSize';
import {
  LayoutDashboard, GitBranch, Users, FileText, Sparkles,
  BarChart3, Plug, MessageCircle, CheckSquare, TrendingUp,
  FlaskConical, Zap, UserCog, Bell, LogOut, Menu, X, ChevronDown,
  CalendarCheck, UserPlus, ThumbsUp, GraduationCap, ClipboardCheck, Target, User,
  TrendingDown, Book
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    if (isMobile) setSidebarOpen(false);
  };

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/flows', icon: GitBranch, label: 'Onboarding Flows' },
    { path: '/segments', icon: Users, label: 'User Segments' },
    { path: '/templates', icon: FileText, label: 'Templates' },
    { path: '/ai-content', icon: Sparkles, label: 'AI Content' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/integrations', icon: Plug, label: 'Integrations' },
    { path: '/tooltips', icon: MessageCircle, label: 'Tooltips' },
    { path: '/checklists', icon: CheckSquare, label: 'Checklists' },
    { path: '/progress', icon: TrendingUp, label: 'Progress Tracking' },
    { path: '/ab-tests', icon: FlaskConical, label: 'A/B Tests' },
    { path: '/triggers', icon: Zap, label: 'Triggers' },
    { path: '/personalization', icon: UserCog, label: 'Personalization' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/ai-checklists', icon: ClipboardCheck, label: 'AI Checklists' },
    { path: '/pto-scheduler', icon: CalendarCheck, label: 'AI PTO Scheduler' },
    { path: '/mentor-matcher', icon: UserPlus, label: 'AI Mentor Matcher' },
    { path: '/ai-progress', icon: Target, label: 'AI Progress Tracker' },
    { path: '/feedback-collector', icon: ThumbsUp, label: 'AI Feedback' },
    { path: '/training-recommender', icon: GraduationCap, label: 'AI Training' },
    { path: '/funnel-analytics', icon: TrendingDown, label: 'Funnel Analytics' },
    { path: '/sdk-docs', icon: Book, label: 'SDK Docs' },
  // === Batch 06 Gaps & Frontend Mounts ===
  { path: '/cf-ai-flow-generator-from-jd', label: 'AI flow generator from JD', icon: '✨' },
  { path: '/cf-real-time-feedback-loop', label: 'Real-time feedback loop', icon: '✨' },
  { path: '/cf-adaptive-pacing', label: 'Adaptive pacing', icon: '✨' },
  { path: '/cf-department-specific-content-recommendation', label: 'Department-specific content recommendation', icon: '✨' },
  { path: '/cf-onboarding-compliance-auditing', label: 'Onboarding compliance auditing', icon: '✨' },
  { path: '/gap-no-cohort', label: 'No `/cohort', icon: '✨' },
  { path: '/gap-no-sentiment', label: 'No `/sentiment', icon: '✨' },
  { path: '/gap-no-auto', label: 'No `/auto', icon: '✨' },
  { path: '/gap-no-role', label: 'No `/role', icon: '✨' },
  { path: '/gap-backend-logic-concentrated-in-single-index-js', label: 'Backend logic concentrated in single index.js', icon: '✨' },
  { path: '/gap-missing-dedicated-checklist-routes-only-ai-generat', label: 'Missing dedicated checklist routes (only AI generation, not CRUD)', icon: '✨' },
  { path: '/gap-no-hr-system-integrations-workday-bamboohr', label: 'No HR system integrations (Workday, BambooHR)', icon: '✨' },
  { path: '/gap-no-webhooks-for-outbound-triggers-to-customer-syst', label: 'No webhooks for outbound triggers to customer systems', icon: '✨' },
  { path: '/gap-limited-reporting-export-pdf-csv', label: 'Limited reporting export (PDF/CSV)', icon: '✨' },
  { path: '/gap-no-rbac-granularity-beyond-admin-manager', label: 'No RBAC granularity beyond admin/manager', icon: '✨' },
  { path: '/gap-no-file-upload-for-onboarding-documents-videos', label: 'No file upload for onboarding documents/videos', icon: '✨' }
];

  const sidebarWidth = sidebarOpen ? 260 : (isMobile ? 0 : 72);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 260 : (isMobile ? 0 : 72),
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        color: 'white',
        transition: 'width 0.3s ease, transform 0.3s ease',
        position: 'fixed',
        height: '100vh',
        zIndex: 100,
        overflowY: 'auto',
        overflowX: 'hidden',
        transform: isMobile && !sidebarOpen ? 'translateX(-260px)' : 'translateX(0)'
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <div style={{
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <GitBranch size={20} />
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>OnboardFlow</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>AI Onboarding Creator</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ padding: '12px 8px' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={handleNavClick}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: sidebarOpen ? '10px 12px' : '10px',
                borderRadius: 8,
                marginBottom: 2,
                color: isActive ? 'white' : '#94a3b8',
                background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                transition: 'all 0.2s',
                justifyContent: sidebarOpen ? 'flex-start' : 'center'
              })}
            >
              <item.icon size={18} style={{ flexShrink: 0 }} />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: isMobile ? 0 : sidebarWidth,
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Header */}
        <header style={{
          height: 64,
          background: 'white',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              padding: 8,
              borderRadius: 8,
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            {sidebarOpen && !isMobile ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'none',
                border: 'none',
                padding: '6px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                color: '#1e293b'
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 13,
                fontWeight: 600
              }}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              {!isMobile && <span style={{ fontSize: 14, fontWeight: 500 }}>{user?.name || 'User'}</span>}
              <ChevronDown size={16} />
            </button>

            {userMenuOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: 8,
                background: 'white',
                borderRadius: 8,
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
                minWidth: 180,
                overflow: 'hidden'
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{user?.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{user?.email}</div>
                </div>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/profile');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    color: '#1e293b',
                    fontSize: 14,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <User size={16} />
                  My Profile
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: 14,
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderTop: '1px solid #e2e8f0'
                  }}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: isMobile ? 16 : 24 }}>
          {children}
        </main>
      </div>

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40
          }}
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
