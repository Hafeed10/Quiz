import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ArrowRight, KeyRound, Eye, EyeOff, Lock, Sparkles, CheckCircle } from 'lucide-react';

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
        setError('Invalid admin passcode. Please enter the correct key (Default: admin123).');
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
    <div className="app-container animate-fade-in" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '65vh',
      padding: '40px 20px',
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '36px 32px',
        textAlign: 'center',
        background: '#ffffff',
        border: '1.5px solid #cbd5e1',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
      }}>
        {/* Security Shield Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: '#ecfdf5',
          border: '1.5px solid #a7f3d0',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <ShieldCheck size={30} color="#065f46" />
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '6px', color: '#0f172a', letterSpacing: '-0.02em' }}>
          Admin Authentication
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px', lineHeight: 1.5 }}>
          Authorized administrator login for assessment management, question authoring, participant inspection, and official winner determination.
        </p>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
              Master Security Passcode
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter master passcode"
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  paddingRight: '42px',
                  paddingTop: '11px',
                  paddingBottom: '11px',
                  fontSize: '14px',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  color: '#0f172a',
                  fontFamily: showPassword ? 'inherit' : 'var(--font-mono)',
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
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Demo Key Quick Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '8px',
              fontSize: '12px',
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
                  padding: '2px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                1-Click Auto Fill
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#be123c',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '18px',
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
              padding: '13px',
              fontSize: '14px',
              fontWeight: 800,
              justifyContent: 'center',
            }}
          >
            {loading ? 'Authenticating...' : (
              <>
                Access Admin Dashboard <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{
          marginTop: '22px',
          paddingTop: '16px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '11px',
          color: '#64748b',
        }}>
          <Lock size={13} color="#065f46" />
          <span>Role-Based Access Control • Quiz Bazar Platform</span>
        </div>
      </div>
    </div>
  );
};
