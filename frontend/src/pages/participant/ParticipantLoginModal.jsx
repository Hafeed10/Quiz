import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Phone, User, X, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export const ParticipantLoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const { loginParticipant } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [isRecognized, setIsRecognized] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handlePhoneChange = async (e) => {
    const val = e.target.value;
    setPhoneNumber(val);
    setErrorMessage('');

    const digits = val.replace(/\D/g, '');
    if (digits.length >= 10) {
      setLookupLoading(true);
      try {
        const res = await api.lookupParticipant(digits);
        if (res.exists && res.name) {
          setName(res.name);
          setIsRecognized(true);
        } else {
          setIsRecognized(false);
        }
      } catch (err) {
        // silent
      } finally {
        setLookupLoading(false);
      }
    } else {
      setIsRecognized(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit phone number.');
      return;
    }

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await loginParticipant(name.trim(), cleanPhone);
      if (res.success) {
        if (onLoginSuccess) {
          onLoginSuccess(res);
        }
        onClose();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unable to log in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    /* Full Black Opacity Backdrop Overlay mounted directly to document.body */
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999999,
        backgroundColor: 'rgba(0, 0, 0, 0.75)', // Deep rich black opacity
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
        animation: 'fadeIn 0.15s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-card animate-fade-in"
        style={{
          maxWidth: '460px',
          width: '100%',
          padding: '32px',
          position: 'relative',
          background: '#ffffff',
          border: '1.5px solid #cbd5e1',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            color: '#475569',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e2e8f0';
            e.currentTarget.style.color = '#0f172a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f1f5f9';
            e.currentTarget.style.color = '#475569';
          }}
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
          }}>
            <User size={24} color="#065f46" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
            Participant Sign-In
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Enter your phone number & name to access today's timed daily quiz.
          </p>
        </div>

        {errorMessage && (
          <div style={{
            padding: '10px 14px',
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            color: '#be123c',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '18px',
          }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Phone Number Input */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
              Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={phoneNumber}
                onChange={handlePhoneChange}
                autoFocus
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  paddingRight: '14px',
                  paddingTop: '11px',
                  paddingBottom: '11px',
                  fontSize: '14px',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  color: '#0f172a',
                }}
              />
            </div>
          </div>

          {/* Name Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155' }}>
                Your Full Name
              </label>
              {isRecognized && (
                <span style={{ fontSize: '11px', color: '#065f46', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                  <CheckCircle2 size={12} color="#065f46" /> Auto-Recognized
                </span>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  paddingRight: '14px',
                  paddingTop: '11px',
                  paddingBottom: '11px',
                  fontSize: '14px',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  color: '#0f172a',
                }}
              />
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '13px',
              fontSize: '14px',
              fontWeight: 800,
              justifyContent: 'center',
              marginTop: '8px',
            }}
          >
            {submitting ? 'Authenticating...' : (
              <>
                Continue to Quiz <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          paddingTop: '14px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '11px',
          color: '#64748b',
        }}>
          <ShieldCheck size={14} color="#065f46" />
          <span>Strict 1 attempt per day enforced by phone number</span>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
