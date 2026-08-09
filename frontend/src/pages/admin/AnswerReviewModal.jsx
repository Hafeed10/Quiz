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
    /* Full Black Opacity Backdrop Overlay mounted directly on document.body via Portal */
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
        backgroundColor: 'rgba(0, 0, 0, 0.75)', // Deep full black opacity
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 9999999, // Absolute highest z-index across entire document
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      {/* Centered Modal Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-card animate-fade-in"
        style={{
          maxWidth: '720px',
          width: '100%',
          maxHeight: '88vh',
          overflowY: 'auto',
          padding: '32px',
          position: 'relative',
          background: '#ffffff',
          border: '1.5px solid #cbd5e1',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(0,0,0,0.15)',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            color: '#475569',
            width: '34px',
            height: '34px',
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
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <User size={24} color="#065f46" />
          </div>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
              {attempt.participant_name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={14} color="#64748b" />
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {attempt.answers?.map((ans, idx) => {
            const isCorrect = ans.is_correct;
            return (
              <div
                key={idx}
                style={{
                  padding: '20px',
                  borderRadius: '10px',
                  background: isCorrect ? '#f0fdf4' : '#fff1f2',
                  border: isCorrect ? '1.5px solid #86efac' : '1.5px solid #fecdd3',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: isCorrect ? '#15803d' : '#be123c' }}>
                    QUESTION {ans.question_number || idx + 1}
                  </span>
                  {isCorrect ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#15803d', fontSize: '12px', fontWeight: 800 }}>
                      <CheckCircle size={15} /> Correct (+1)
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#be123c', fontSize: '12px', fontWeight: 800 }}>
                      <XCircle size={15} /> Incorrect (0)
                    </span>
                  )}
                </div>

                {/* Question Text in Bold High Contrast Black */}
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', lineHeight: 1.5, marginBottom: '14px' }}>
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
                    }}>
                      <strong>Correct Answer:</strong> Option {ans.correct_option.key} — {ans.correct_option.text}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
