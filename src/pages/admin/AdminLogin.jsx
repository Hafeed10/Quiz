import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ArrowRight, KeyRound, Eye, EyeOff, Lock } from 'lucide-react';

export const AdminLogin = ({ onLoginSuccess }) => {
  const { loginAdmin } = useAuth();
  const [passcode, setPasscode] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (loginAdmin(passcode.trim())) {
        setError('');
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setError('Invalid admin passcode. (Default: admin123).');
      }
      setLoading(false);
    }, 200);
  };

  const handleQuickLogin = () => {
    setPasscode('admin123');
    loginAdmin('admin123');
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(80vh - 80px)',
      padding: '24px 16px 60px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '380px',
        background: '#ffffff',
        border: '1.5px solid #e2e8f0',
        borderRadius: '24px',
        padding: '28px 24px',
        textAlign: 'center',
        boxShadow: '0 20px 40px -8px rgba(6, 95, 70, 0.16), 0 8px 16px -4px rgba(0, 0, 0, 0.04)',
      }}>
        {/* Security Shield Icon Badge */}
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          border: '1.5px solid #a7f3d0',
          margin: '0 auto 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(6, 95, 70, 0.15)',
        }}>
          <ShieldCheck size={28} color="#065f46" />
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '6px', color: '#0f172a', letterSpacing: '-0.02em' }}>
          Admin Authentication
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '22px', lineHeight: 1.45 }}>
          Authorized access to manage quizzes, author questions, inspect participants & view winners.
        </p>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
              Security Passcode <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#065f46',
                display: 'flex',
                alignItems: 'center',
              }}>
                <KeyRound size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter master passcode"
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  paddingRight: '42px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  fontSize: '15px',
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '12px',
                  color: '#0f172a',
                  fontFamily: showPassword ? 'inherit' : 'var(--font-mono)',
                  outline: 'none',
                  minHeight: '48px',
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Quick 1-Click Auto Fill Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '8px',
              fontSize: '11px',
              color: '#64748b',
            }}>
              <span>Default Key: <strong style={{ color: '#065f46', fontFamily: 'var(--font-mono)' }}>admin123</strong></span>
              <button
                type="button"
                onClick={handleQuickLogin}
                style={{
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#065f46',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                1-Click Fill
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#be123c',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '15px',
              fontWeight: 800,
              borderRadius: '12px',
              justifyContent: 'center',
              gap: '8px',
              minHeight: '48px',
              boxShadow: '0 6px 18px rgba(6, 95, 70, 0.25)',
            }}
          >
            {loading ? 'Authenticating...' : (
              <>
                <span>Access Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          paddingTop: '12px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '11px',
          color: '#64748b',
        }}>
          <Lock size={12} color="#065f46" />
          <span>Role-Based Access Control • Quiz Bazar</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
