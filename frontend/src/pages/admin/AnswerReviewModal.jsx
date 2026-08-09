import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, CheckCircle, XCircle, User, Clock, Award, Phone } from 'lucide-react';

export const AnswerReviewModal = ({ attempt, onClose }) => {
  const [showPhone, setShowPhone] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!attempt) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(attempt.phone_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container modal-container-lg"
        onClick={(e) => e.stopPropagation()}
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
              {attempt.participant_name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={13} color="#64748b" />
                <span style={{ color: '#64748b' }}>Phone:</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                  {showPhone ? attempt.phone_number : attempt.masked_phone}
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
              <span style={{ fontFamily: 'var(--font-mono)' }}>Submitted: {attempt.submission_time_formatted}</span>
              <span>•</span>
              <span style={{
                background: attempt.score === 4 ? '#ecfdf5' : '#f8fafc',
                color: attempt.score === 4 ? '#065f46' : '#0f172a',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 800,
                border: attempt.score === 4 ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
              }}>
                Score: {attempt.score}/4
              </span>
            </div>
          </div>
        </div>

        {/* Question Breakdown List in Sharp High Contrast */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {attempt.answers?.map((ans, idx) => {
            const isCorrect = ans.is_correct;
            return (
              <div
                key={idx}
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

                {/* Question Text in Bold High Contrast Black */}
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
                    <strong>Participant's Answer:</strong> Option {ans.selected_key} — {ans.selected_text}
                  </div>
                  {!isCorrect && ans.correct_option && (
                    <div style={{
                      color: '#15803d',
                      fontWeight: 600,
                      background: '#dcfce7',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      wordBreak: 'break-word',
                    }}>
                      <strong>Correct Answer:</strong> Option {ans.correct_option.key} — {ans.correct_option.text}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

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
