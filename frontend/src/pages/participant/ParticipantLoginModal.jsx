import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import {
  Phone, User, X, CheckCircle2, ArrowRight, ShieldCheck,
  History, Trophy, Calendar, Award, LogOut, BookOpen, Clock
} from 'lucide-react';

export const ParticipantLoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const { participant, loginParticipant, logoutParticipant } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
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
          setIsRecognized(true);
          setQuizHistory(res.history || []);
          if (res.next_quiz) setNextQuiz(res.next_quiz);
        } else {
          setIsRecognized(false);
          setQuizHistory([]);
        }
      } catch (err) {
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
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container modal-container-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="modal-close-btn"
          title="Close login"
          aria-label="Close login"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px',
          }}>
            <User size={22} color="#065f46" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
            {participant ? `Account: ${participant.name}` : 'Participant Sign-In'}
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            {participant ? 'View your past quiz scores and active session details.' : "Enter your phone number & name to access today's timed daily quiz."}
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
            marginBottom: '16px',
          }}>
            {errorMessage}
          </div>
        )}

        {/* Participant Login Form */}
        {!participant ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                    paddingTop: '10px',
                    paddingBottom: '10px',
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
                    paddingTop: '10px',
                    paddingBottom: '10px',
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
                padding: '12px',
                fontSize: '14px',
                fontWeight: 800,
                justifyContent: 'center',
                marginTop: '4px',
              }}
            >
              {submitting ? 'Authenticating...' : (
                <>
                  Continue to Quiz <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Logged-In Participant Profile Action Bar */
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '14px 16px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                {participant.name}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                {participant.phone_number || participant.masked_phone}
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
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px', gap: '4px' }}
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        )}

        {/* ========== COMPLETED QUIZ HISTORY SECTION ========== */}
        {(quizHistory.length > 0 || isRecognized) && (
          <div style={{ marginTop: '22px', borderTop: '1px solid #e2e8f0', paddingTop: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <History size={16} color="#065f46" />
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                  Completed Quiz History
                </h3>
              </div>
              {quizHistory.length > 0 && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#065f46',
                  background: '#ecfdf5',
                  padding: '2px 10px',
                  borderRadius: '999px',
                  border: '1px solid #a7f3d0',
                }}>
                  {quizHistory.length} Completed
                </span>
              )}
            </div>

            {/* Next Quiz Date & Time Schedule Card */}
            <div style={{
              background: '#eff6ff',
              border: '1.5px solid #bfdbfe',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: '#dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Clock size={18} color="#1d4ed8" />
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#1e40af', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
                    Next Assessment Schedule
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                    {nextQuiz?.date_formatted || 'Tomorrow'} ({nextQuiz?.window_text || '10:00 AM – 10:20 AM'})
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#1d4ed8',
                  background: '#ffffff',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #bfdbfe',
                  display: 'inline-block',
                }}>
                  {nextQuiz?.duration_minutes || 20} Mins Window
                </span>
              </div>
            </div>

            {/* 1 Day Completed Notice */}
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '12px',
              fontSize: '12px',
              color: '#065f46',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0 }} />
              <div>
                <strong>1 Attempt Policy:</strong> Answers submitted successfully. Only 1 attempt allowed per day.
              </div>
            </div>

            {historyLoading ? (
              <div style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '12px' }}>
                Loading quiz history...
              </div>
            ) : quizHistory.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                color: '#64748b',
                fontSize: '12px',
              }}>
                No completed quizzes recorded yet. Take today's quiz to see your completion record here!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '220px', overflowY: 'auto' }}>
                {quizHistory.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <Calendar size={11} color="#64748b" />
                        <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          {item.quiz_date}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#0f172a',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {item.quiz_title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        Submitted: {item.submitted_at}
                      </div>
                    </div>

                    {/* Clean Completed Status Pill (No Answer / Score Exposed) */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 800,
                        background: '#ecfdf5',
                        color: '#065f46',
                        border: '1px solid #a7f3d0',
                      }}>
                        <CheckCircle2 size={12} color="#059669" />
                        Completed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{
          marginTop: '18px',
          paddingTop: '12px',
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
