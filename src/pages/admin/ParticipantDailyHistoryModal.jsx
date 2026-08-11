import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Trophy, Calendar, Award, CheckCircle, Clock, Eye, EyeOff, Copy, Check } from 'lucide-react';

export const ParticipantDailyHistoryModal = ({ participant, onClose }) => {
  const [showPhone, setShowPhone] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!participant) return null;

  const copyPhone = () => {
    navigator.clipboard.writeText(participant.phone_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const breakdown = participant.daily_breakdown || [];

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
          title="Close scorecard"
          aria-label="Close scorecard"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px', paddingRight: '40px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            minWidth: '46px',
            borderRadius: '12px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 800,
          }}>
            {participant.rank === 1 ? '🥇' : participant.rank === 2 ? '🥈' : participant.rank === 3 ? '🥉' : `#${participant.rank || 1}`}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {participant.name}
              </h3>
              <span className="badge badge-completed" style={{ fontSize: '11px' }}>
                Verified Participant
              </span>
            </div>

            {/* Phone with Mask/Unmask */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '13px', color: '#64748b' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#1e293b' }}>
                {showPhone ? participant.phone_number : participant.masked_phone}
              </span>
              <button
                onClick={() => setShowPhone(!showPhone)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: '#065f46' }}
                title={showPhone ? 'Mask' : 'Reveal phone'}
              >
                {showPhone ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button
                onClick={copyPhone}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: '#64748b' }}
                title="Copy Phone Number"
              >
                {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="modal-stats-grid">
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Score</span>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#065f46', marginTop: '4px' }}>
              {participant.total_score} <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>/ {participant.max_possible_score}</span>
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Days Active</span>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
              {participant.total_quizzes_taken}
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Avg Score</span>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#2563eb', marginTop: '4px' }}>
              {participant.average_score} <span style={{ fontSize: '11px', color: '#64748b' }}>/ 4</span>
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Accuracy</span>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#059669', marginTop: '4px' }}>
              {participant.accuracy_percent}%
            </div>
          </div>
        </div>

        {/* Daily Breakdown List */}
        <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={15} color="#065f46" />
          Day-by-Day Quiz Score History ({breakdown.length})
        </h4>

        {breakdown.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', background: '#f8fafc', borderRadius: '10px', color: '#64748b', fontSize: '13px' }}>
            No completed quizzes recorded yet for this participant.
          </div>
        ) : (
          <div className="modal-table-responsive">
            <table style={{ width: '100%', minWidth: '480px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '10px 14px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Quiz Title</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Score</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Submitted Time</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', color: '#64748b', fontSize: '12px' }}>
                      {row.quiz_date}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                      {row.quiz_title}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: row.score >= 3 ? '#ecfdf5' : '#fef3c7',
                        color: row.score >= 3 ? '#065f46' : '#92400e',
                        border: row.score >= 3 ? '1px solid #a7f3d0' : '1px solid #fde68a',
                        fontWeight: 800,
                        fontSize: '12px',
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}>
                        {row.score} / {row.max_score}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '12px', color: '#64748b' }}>
                      {row.submission_time}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="badge badge-completed" style={{ fontSize: '10px' }}>
                        COMPLETED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
