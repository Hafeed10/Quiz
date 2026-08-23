import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, CheckCircle, XCircle, User, Clock, Award, Phone, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';

export const AnswerReviewModal = ({ attempt, onClose }) => {
  const [showPhone, setShowPhone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fullAttempt, setFullAttempt] = useState(attempt);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Fetch full details if answers are missing or empty
  useEffect(() => {
    setFullAttempt(attempt);
    if (attempt && (!attempt.answers || attempt.answers.length === 0) && attempt.id) {
      setLoadingDetails(true);
      api.getAdminAttemptDetail(attempt.id)
        .then((res) => {
          if (res) {
            setFullAttempt((prev) => ({ ...prev, ...res }));
          }
        })
        .catch((err) => {
          console.error('Failed to load full attempt details:', err);
        })
        .finally(() => {
          setLoadingDetails(false);
        });
    }
  }, [attempt]);

  if (!fullAttempt) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullAttempt.phone_number || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const answersList = fullAttempt.answers || [];

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container modal-container-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="modal-close-btn"
          title="Close review"
          aria-label="Close review"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingRight: '40px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            minWidth: '48px',
            borderRadius: '12px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <User size={22} color="#065f46" />
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', lineHeight: 1.2, margin: 0 }}>
              {fullAttempt.participant_name || 'Participant'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={13} color="#64748b" />
                <span style={{ color: '#64748b' }}>Phone:</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                  {showPhone ? fullAttempt.phone_number : (fullAttempt.masked_phone || fullAttempt.phone_number)}
                </strong>
                <button
                  type="button"
                  onClick={() => setShowPhone(!showPhone)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#065f46',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                    textDecoration: 'underline',
                    padding: '0 4px',
                  }}
                >
                  {showPhone ? 'Mask' : 'Reveal'}
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    color: copied ? '#065f46' : '#475569',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                  }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <span>•</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>
                Submitted: {fullAttempt.submission_time_formatted || fullAttempt.submitted_at || '—'}
              </span>
              <span>•</span>
              <span style={{
                background: fullAttempt.score === 4 ? '#ecfdf5' : '#f8fafc',
                color: fullAttempt.score === 4 ? '#065f46' : '#0f172a',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 800,
                border: fullAttempt.score === 4 ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
              }}>
                Score: {fullAttempt.score ?? 0}/4
              </span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loadingDetails && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px', color: '#059669' }} />
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Loading detailed answers...</p>
          </div>
        )}

        {/* Empty State */}
        {!loadingDetails && answersList.length === 0 && (
          <div style={{
            padding: '36px 20px',
            textAlign: 'center',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1.5px dashed #cbd5e1',
            color: '#64748b',
          }}>
            <AlertCircle size={28} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#334155', margin: '0 0 4px' }}>
              No detailed question answers recorded
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              The submission was recorded with total score of {fullAttempt.score}/4, but question-by-question selections were not captured.
            </p>
          </div>
        )}

        {/* Question Breakdown List in Sharp High Contrast */}
        {!loadingDetails && answersList.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {answersList.map((ans, idx) => {
              const isCorrect = Boolean(ans.is_correct);
              const selectedKey = ans.selected_key || ans.selected_option_key || '—';
              const selectedText = ans.selected_text || ans.selected_option_text || '';
              const correctKey = ans.correct_option?.key || ans.correct_key;
              const correctText = ans.correct_option?.text || ans.correct_text;

              return (
                <div
                  key={ans.id || idx}
                  style={{
                    padding: '16px 18px',
                    borderRadius: '10px',
                    background: isCorrect ? '#f0fdf4' : '#fff1f2',
                    border: isCorrect ? '1.5px solid #86efac' : '1.5px solid #fecdd3',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: isCorrect ? '#15803d' : '#be123c' }}>
                      QUESTION {ans.question_number || idx + 1}
                    </span>
                    {isCorrect ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#15803d', fontSize: '12px', fontWeight: 800 }}>
                        <CheckCircle size={14} /> Correct (+1)
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#be123c', fontSize: '12px', fontWeight: 800 }}>
                        <XCircle size={14} /> Incorrect (0)
                      </span>
                    )}
                  </div>

                  {/* Question Text */}
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', lineHeight: 1.5, marginBottom: '12px' }}>
                    {ans.question_text}
                  </p>

                  {/* Answers Breakdown */}
                  <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{
                      color: isCorrect ? '#15803d' : '#be123c',
                      fontWeight: 600,
                      background: isCorrect ? '#dcfce7' : '#fee2e2',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      wordBreak: 'break-word',
                    }}>
                      <strong>Participant's Answer:</strong> Option {selectedKey} {selectedText ? `— ${selectedText}` : ''}
                    </div>
                    {!isCorrect && (correctKey || correctText) && (
                      <div style={{
                        color: '#15803d',
                        fontWeight: 600,
                        background: '#dcfce7',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        wordBreak: 'break-word',
                      }}>
                        <strong>Correct Answer:</strong> Option {correctKey} {correctText ? `— ${correctText}` : ''}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '8px 20px', fontSize: '13px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
