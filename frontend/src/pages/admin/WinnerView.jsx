import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Trophy, Sparkles, Eye, EyeOff, Check, Copy, Award, Clock, Users } from 'lucide-react';

export const WinnerView = ({ quizId }) => {
  const [winnerData, setWinnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullPhone, setShowFullPhone] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchWinner = async () => {
      setLoading(true);
      try {
        const res = await api.getAdminQuizWinner(quizId);
        setWinnerData(res);
      } catch (err) {
        console.error('Error fetching winner', err);
      } finally {
        setLoading(false);
      }
    };
    if (quizId) fetchWinner();
  }, [quizId]);

  const handleCopy = (phone) => {
    navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Calculating winner standings...</div>;
  }

  if (!winnerData || !winnerData.winner_found) {
    return (
      <div className="glass-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
        <Trophy size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>No Completed Attempts Yet</h3>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
          The winner will be calculated automatically as soon as participants submit their answers.
        </p>
      </div>
    );
  }

  const { winner, top_candidates, criteria, quiz_title } = winnerData;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '840px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Trophy Hero Card in Crisp White */}
      <div className="glass-card" style={{
        padding: '36px 28px',
        textAlign: 'center',
        border: '2px solid #a7f3d0',
        boxShadow: '0 10px 30px rgba(6, 95, 70, 0.08)',
        marginBottom: '24px',
        position: 'relative',
        background: '#ffffff',
      }}>
        {/* Glowing circular photo / trophy badge */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#ecfdf5',
          border: '3px solid #059669',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(6, 95, 70, 0.2)',
        }}>
          {winner.photo ? (
            <img src={winner.photo} alt={winner.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Trophy size={40} color="#065f46" />
          )}
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 14px',
          borderRadius: '999px',
          background: '#ecfdf5',
          color: '#065f46',
          fontSize: '11px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          border: '1px solid #a7f3d0',
          marginBottom: '10px',
        }}>
          <Sparkles size={13} color="#059669" /> Official Daily Winner
        </div>

        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '6px', color: '#0f172a' }}>
          {winner.name}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', color: '#475569', marginBottom: '22px' }}>
          <span>{quiz_title}</span>
          <span>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Phone:</span>
            <strong style={{ fontFamily: 'var(--font-mono)', color: showFullPhone ? '#065f46' : 'inherit' }}>
              {showFullPhone ? winner.phone_number : winner.masked_phone}
            </strong>
            <button
              onClick={() => setShowFullPhone(!showFullPhone)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#065f46',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'underline',
              }}
            >
              {showFullPhone ? 'Mask' : 'Reveal'}
            </button>
            <button
              onClick={() => handleCopy(winner.phone_number)}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                color: copied ? '#059669' : '#64748b',
                cursor: 'pointer',
                fontSize: '11px',
                padding: '2px 8px',
                fontWeight: 600,
              }}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          maxWidth: '520px',
          margin: '0 auto 22px',
        }}>
          <div style={{ background: '#ecfdf5', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
            <span style={{ fontSize: '11px', color: '#065f46', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>Final Score</span>
            <strong style={{ fontSize: '24px', color: '#065f46', fontWeight: 900 }}>
              {winner.score} / {winner.max_score}
            </strong>
          </div>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>Submission Time</span>
            <strong style={{ fontSize: '20px', color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
              {winner.submitted_at}
            </strong>
          </div>
        </div>

        {/* Winner Rule Banner */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          fontSize: '12px',
          color: '#334155',
          maxWidth: '540px',
          margin: '0 auto',
        }}>
          ⚖️ <strong>Winner Rule:</strong> {criteria}
        </div>
      </div>

      {/* Top Standings Leaderboard */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Top Leaderboard Standings</h3>
          <button
            onClick={() => setShowFullPhone(!showFullPhone)}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            {showFullPhone ? <EyeOff size={13} /> : <Eye size={13} />}
            {showFullPhone ? 'Mask Phones' : 'Show All Phones'}
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', background: '#f8fafc' }}>
                <th style={{ padding: '10px 14px', fontWeight: 700, fontSize: '12px' }}>Rank</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, fontSize: '12px' }}>Participant</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, fontSize: '12px' }}>Phone</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, fontSize: '12px' }}>Score</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, fontSize: '12px' }}>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {top_candidates?.map((c) => (
                <tr
                  key={c.rank}
                  style={{
                    borderBottom: '1px solid #e2e8f0',
                    background: c.rank === 1 ? '#ecfdf5' : undefined,
                  }}
                >
                  <td style={{ padding: '12px 14px', fontWeight: 800 }}>
                    {c.rank === 1 ? '🥇 #1' : c.rank === 2 ? '🥈 #2' : c.rank === 3 ? '🥉 #3' : `#${c.rank}`}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                    {c.name}
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#475569' }}>
                    {showFullPhone ? c.phone_number || c.masked_phone : c.masked_phone}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 800, color: c.score === 4 ? '#065f46' : '#2563eb' }}>
                    {c.score} / 4
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#0f172a' }}>
                    {c.submitted_at}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
