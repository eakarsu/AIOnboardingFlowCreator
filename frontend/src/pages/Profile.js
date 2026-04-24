import React, { useState, useEffect } from 'react';
import { User, Lock, Save, Loader } from 'lucide-react';
import { authAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [profileData, setProfileData] = useState({
    name: '',
    department: '',
    position: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authAPI.getProfile();
        setProfileData({
          name: res.data.name || '',
          department: res.data.department || '',
          position: res.data.position || ''
        });
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []); // eslint-disable-line

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await authAPI.updateProfile(profileData);
      if (updateUser) updateUser(res.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s'
  };

  const labelStyle = {
    display: 'block',
    fontSize: 14,
    fontWeight: 500,
    color: '#374151',
    marginBottom: 6
  };

  if (loadingProfile) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <Loader size={32} style={{ animation: 'spin 1s linear infinite', color: '#6366f1' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: 640, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>My Profile</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Manage your account settings</p>

      {/* Profile Info */}
      <div style={{
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: 24,
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 40, height: 40,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white'
          }}>
            <User size={20} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b' }}>Profile Information</h2>
        </div>

        <form onSubmit={handleProfileSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              style={inputStyle}
              required
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={user?.email || ''}
              style={{ ...inputStyle, background: '#f8fafc', color: '#94a3b8' }}
              disabled
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Department</label>
              <input
                type="text"
                value={profileData.department}
                onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Position</label>
              <input
                type="text"
                value={profileData.position}
                onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={profileLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 24px',
              background: profileLoading ? '#94a3b8' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none', borderRadius: 8, color: 'white',
              fontSize: 14, fontWeight: 500, cursor: profileLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {profileLoading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
            Save Changes
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div style={{
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 40, height: 40,
            background: '#fef2f2',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#dc2626'
          }}>
            <Lock size={20} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b' }}>Change Password</h2>
        </div>

        <form onSubmit={handlePasswordSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Current Password</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              style={inputStyle}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                style={inputStyle}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={passwordLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 24px',
              background: passwordLoading ? '#94a3b8' : '#dc2626',
              border: 'none', borderRadius: 8, color: 'white',
              fontSize: 14, fontWeight: 500, cursor: passwordLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {passwordLoading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Lock size={16} />}
            Change Password
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
      `}</style>
    </div>
  );
};

export default Profile;
