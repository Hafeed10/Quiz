import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { AnswerReviewModal } from './AnswerReviewModal';
import { Eye, EyeOff, Search, RefreshCw, Copy, Check } from 'lucide-react';

export const ParticipantsView = ({ quizId }) => {
  const [data, setData] = useState({ attempts: [], quiz_title: '' });
  const [loading, setLoading] = useState(true);
  const [showFullPhone, setShowFullPhone] = useState(false);
  const [revealedRows, setRevealedRows] = useState({}); // { [attemptId]: boolean }
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminParticipants(quizId);
      setData(res);
    } catch (err) {
      console.error('Failed to load participants', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [quizId]);

  const toggleRowReveal = (id) => {
    setRevealedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyPhoneNumber = (phone, id) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const attempts = data.attempts || [];
  const filteredAttempts = attempts.filter((att) => {
    const q = searchQuery.toLowerCase();
    return (
      (att.participant_name && att.participant_name.toLowerCase().includes(q)) ||
      (att.phone_number && att.phone_number.includes(q)) ||
      (att.masked_phone && att.masked_phone.includes(q))
    );
  });

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
            Participants & Submissions ({attempts.length})
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Quiz: <strong style={{ color: '#065f46' }}>{data.quiz_title || 'Today'}</strong> • {data.quiz_date}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Prominent Global Phone Number Show/Mask Button */}
          <button
            onClick={() => {
              const nextState = !showFullPhone;
              setShowFullPhone(nextState);
              setRevealedRows({});
            }}
            className={showFullPhone ? 'btn-primary' : 'btn-secondary'}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {showFullPhone ? <EyeOff size={16} /> : <Eye size={16} />}
            {showFullPhone ? 'Mask All Numbers' : 'Show All Phone Numbers'}
          </button>

          {/* Refresh Button */}
          <button onClick={fetchParticipants} className="btn-secondary" style={{ padding: '8px 12px' }} title="Refresh Submissions">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Filter by participant name or phone number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', paddingLeft: '40px' }}
        />
      </div>

      {/* Participants Table in Crisp White Card */}
      <div className="glass-card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b' }}>
              <th style={{ padding: '14px 18px', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>Participant</th>
              <th style={{ padding: '14px 18px', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Phone Number</span>
                  <button
                    onClick={() => setShowFullPhone(!showFullPhone)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: showFullPhone ? '#065f46' : '#64748b',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 600,
                    }}
                    title="Toggle full phone numbers for all rows"
                  >
                    {showFullPhone ? <EyeOff size={12} /> : <Eye size={12} />}
                    {showFullPhone ? 'Mask' : 'Reveal'}
                  </button>
                </div>
              </th>
              {data.quiz_id === 'ALL' && (
                <th style={{ padding: '14px 18px', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>Quiz Title</th>
              )}
              <th style={{ padding: '14px 18px', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '14px 18px', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>Submitted At</th>
              <th style={{ padding: '14px 18px', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>Score</th>
              <th style={{ padding: '14px 18px', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttempts.length === 0 ? (
              <tr>
                <td colSpan={data.quiz_id === 'ALL' ? 7 : 6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  {loading ? 'Loading participants...' : 'No participant submissions recorded for this quiz.'}
                </td>
              </tr>
            ) : (
              filteredAttempts.map((att) => {
                const isPerfect = att.score === 4;
                const isRowRevealed = revealedRows[att.id] !== undefined ? revealedRows[att.id] : showFullPhone;
                const displayPhone = isRowRevealed ? att.phone_number : att.masked_phone;

                return (
                  <tr
                    key={att.id}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Participant Name in High-Contrast Crisp Black */}
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          color: '#065f46',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 800,
                        }}>
                          {att.participant_name ? att.participant_name.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <span>{att.participant_name}</span>
                      </div>
                    </td>

                    {/* Phone Number */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: isRowRevealed ? '#065f46' : '#475569',
                            background: isRowRevealed ? '#ecfdf5' : '#f8fafc',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: isRowRevealed ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {displayPhone}
                        </span>

                        <button
                          onClick={() => toggleRowReveal(att.id)}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            color: isRowRevealed ? '#065f46' : '#64748b',
                            padding: '4px 6px',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                          }}
                          title={isRowRevealed ? 'Mask phone number' : 'Reveal full number'}
                        >
                          {isRowRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>

                        <button
                          onClick={() => copyPhoneNumber(att.phone_number, att.id)}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            color: copiedId === att.id ? '#059669' : '#64748b',
                            padding: '4px 6px',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                          }}
                          title="Copy phone number"
                        >
                          {copiedId === att.id ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </td>

                    {/* Quiz Title Column (when All Quizzes is active) */}
                    {data.quiz_id === 'ALL' && (
                      <td style={{ padding: '14px 18px', color: '#0f172a', fontWeight: 600, fontSize: '13px' }}>
                        <div>{att.quiz_title || 'Daily Quiz'}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>{att.quiz_date}</div>
                      </td>
                    )}

                    {/* Status */}
                    <td style={{ padding: '14px 18px' }}>
                      <span className="badge badge-completed">
                        {att.status}
                      </span>
                    </td>

                    {/* Submitted At */}
                    <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#334155' }}>
                      {att.submission_time_formatted || '—'}
                    </td>

                    {/* Score */}
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '13px',
                        fontWeight: 700,
                        background: isPerfect ? '#ecfdf5' : '#eff6ff',
                        color: isPerfect ? '#065f46' : '#1d4ed8',
                        border: isPerfect ? '1px solid #a7f3d0' : '1px solid #bfdbfe',
                      }}>
                        {att.score} / 4
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedAttempt(att)}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        Inspect Answers
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Answer Review Modal */}
      {selectedAttempt && (
        <AnswerReviewModal
          attempt={selectedAttempt}
          onClose={() => setSelectedAttempt(null)}
        />
      )}
    </div>
  );
};
