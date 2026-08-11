import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import {
  Phone, User, X, CheckCircle2, ArrowRight, ShieldCheck,
  History, Trophy, Calendar, Award, LogOut, BookOpen, Clock, Sparkles
} from 'lucide-react';

export const ParticipantLoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const { participant, loginParticipant, logoutParticipant } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [isRecognized, setIsRecognized] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // History & Schedule state
  const [quizHistory, setQuizHistory] = useState([]);
  const [nextQuiz, setNextQuiz] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = async (phoneOrId) => {
    setHistoryLoading(true);
    try {
      const res = await api.getParticipantHistory(phoneOrId);
      if (res.exists) {
        setQuizHistory(res.attempts || res.history || []);
        if (res.next_quiz) setNextQuiz(res.next_quiz);
      }
    } catch (err) {
      console.error('Error loading participant history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      if (participant) {
        setPhoneNumber(participant.phone_number || '');
        setName(participant.name || '');
        setPhoto(participant.photo || '');
        setIsRecognized(true);
        fetchHistory(participant.id);
      } else {
        setQuizHistory([]);
        setIsRecognized(false);
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, participant, onClose]);

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
          if (res.photo) setPhoto(res.photo);
          setIsRecognized(true);
          setQuizHistory(res.history || []);
          if (res.next_quiz) setNextQuiz(res.next_quiz);
        } else {
          setIsRecognized(false);
          setQuizHistory([]);
        }
      } catch {
        // silent
      } finally {
        setLookupLoading(false);
      }
    } else {
      setIsRecognized(false);
      setQuizHistory([]);
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
      const res = await loginParticipant(name.trim(), cleanPhone, photo);
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
    <div
      className="modal-overlay animate-fade-in"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 9999,
      }}
    >
      <div
        className="animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '380px',
          background: '#ffffff',
          borderRadius: '24px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 20px 40px -8px rgba(6, 95, 70, 0.18), 0 8px 16px -4px rgba(0, 0, 0, 0.04)',
          padding: '24px 20px',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#f1f5f9',
            border: 'none',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Close modal"
        >
          <X size={16} />
        </button>

        {/* Small Box Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            border: '1.5px solid #a7f3d0',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px',
            boxShadow: '0 4px 12px rgba(6, 95, 70, 0.12)',
          }}>
            <Phone size={22} color="#065f46" />
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            {participant ? `Account: ${participant.name}` : 'Participant Sign-In'}
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.4 }}>
            {participant ? 'View your past scores and active quiz session.' : 'Enter your phone & name to participate in today’s quiz.'}
          </p>
        </div>

        {errorMessage && (
          <div style={{
            padding: '10px 14px',
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            color: '#be123c',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '16px',
          }}>
            {errorMessage}
          </div>
        )}

        {/* Participant Login Form */}
        {!participant ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Phone Input */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                Phone Number (ഫോൺ നമ്പർ) <span style={{ color: '#dc2626' }}>*</span>
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
                  <Phone size={16} />
                </div>
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
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    fontSize: '15px',
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '12px',
                    color: '#0f172a',
                    outline: 'none',
                    minHeight: '48px',
                  }}
                />
              </div>
              {lookupLoading && (
                <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px', fontWeight: 600 }}>
                  🔍 Checking existing account...
                </div>
              )}
            </div>

            {/* Name Input */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b' }}>
                  Full Name (പേര്) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                {isRecognized && (
                  <span style={{ fontSize: '11px', color: '#065f46', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 700 }}>
                    <CheckCircle2 size={12} color="#059669" /> Auto-Recognized
                  </span>
                )}
              </div>
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
                  <User size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '40px',
                    paddingRight: '14px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    fontSize: '15px',
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '12px',
                    color: '#0f172a',
                    outline: 'none',
                    minHeight: '48px',
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                fontWeight: 800,
                borderRadius: '12px',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '4px',
                minHeight: '48px',
                boxShadow: '0 6px 18px rgba(6, 95, 70, 0.25)',
              }}
            >
              {submitting ? 'Authenticating...' : (
                <>
                  <span>Continue to Quiz</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Logged-In Profile Card */
          <div style={{
            background: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: '16px',
            padding: '14px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#065f46',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                fontWeight: 800,
                fontSize: '15px',
              }}>
                {photo ? (
                  <img src={photo} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                  {participant.name}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                  {participant.phone_number || participant.masked_phone}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                logoutParticipant();
                setPhoneNumber('');
                setName('');
                setQuizHistory([]);
                setIsRecognized(false);
              }}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#be123c',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <LogOut size={12} /> Sign Out
            </button>
          </div>
        )}

        {/* Completed Quiz History Section */}
        {(quizHistory.length > 0 || isRecognized) && (
          <div style={{ marginTop: '18px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <History size={15} color="#065f46" />
                <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  Quiz History
                </h3>
              </div>
              {quizHistory.length > 0 && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#065f46',
                  background: '#ecfdf5',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  border: '1px solid #a7f3d0',
                }}>
                  {quizHistory.length} Completed
                </span>
              )}
            </div>

            {/* Next Quiz Schedule Banner */}
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '10px 12px',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="#1d4ed8" />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
                    {nextQuiz?.date_formatted || 'Tomorrow'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#1e40af' }}>
                    {nextQuiz?.window_text || '10:00 AM – 4:00 PM'}
                  </div>
                </div>
              </div>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#1d4ed8',
                background: '#ffffff',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid #bfdbfe',
              }}>
                {nextQuiz?.duration_minutes || 20}m
              </span>
            </div>

            {/* Completed Attempts List */}
            {quizHistory.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                {quizHistory.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.quiz_title}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>
                        {item.quiz_date} • {item.submitted_at}
                      </div>
                    </div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '10px',
                      fontWeight: 800,
                      background: '#ecfdf5',
                      color: '#065f46',
                      border: '1px solid #a7f3d0',
                      flexShrink: 0,
                    }}>
                      <CheckCircle2 size={10} color="#059669" />
                      Completed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Micro Trust Footer */}
        <div style={{
          marginTop: '16px',
          paddingTop: '10px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '11px',
          color: '#065f46',
          fontWeight: 700,
        }}>
          <ShieldCheck size={13} color="#059669" />
          <span>Single Fair Attempt • Verified by Phone</span>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ParticipantLoginModal;
