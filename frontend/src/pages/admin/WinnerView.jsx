import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import confetti from 'canvas-confetti';
import {
  Trophy, Sparkles, Eye, EyeOff, Check, Copy, Award, Clock, Users,
  Dices, Crown, RotateCcw, CheckCircle2, Zap, UserCheck, RefreshCw
} from 'lucide-react';

export const WinnerView = ({ quizId }) => {
  const [winnerData, setWinnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showFullPhone, setShowFullPhone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(null);

  const fetchWinner = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminQuizWinner(quizId);
      setWinnerData(res);
      if (res && res.winner_found) {
        setTimeout(() => {
          triggerConfetti();
        }, 350);
      }
    } catch (err) {
      console.error('Error fetching winner', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizId) fetchWinner();
  }, [quizId]);

  const handleCopy = (phone) => {
    navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#059669', '#10b981', '#34d399', '#fbbf24', '#f59e0b', '#d97706']
      });
    } catch (e) {
      console.log('Confetti effect triggered');
    }
  };

  const handleSelectWinner = async (participantId, mode = 'MANUAL', notes = '') => {
    setUpdating(true);
    try {
      const res = await api.selectAdminQuizWinner(quizId, {
        participant_id: participantId,
        selection_mode: mode,
        notes: notes
      });
      setWinnerData(res);
      triggerConfetti();
    } catch (err) {
      alert(err.message || 'Failed to update winner selection');
    } finally {
      setUpdating(false);
    }
  };

  const handleResetAuto = async () => {
    setUpdating(true);
    try {
      const res = await api.selectAdminQuizWinner(quizId, {
        selection_mode: 'AUTO'
      });
      setWinnerData(res);
    } catch (err) {
      alert(err.message || 'Failed to reset winner selection');
    } finally {
      setUpdating(false);
    }
  };

  const handleLuckyDraw = () => {
    if (!winnerData?.top_candidates || winnerData.top_candidates.length === 0) return;

    const maxScore = Math.max(...winnerData.top_candidates.map(c => c.score));
    const eligible = winnerData.top_candidates.filter(c => c.score === maxScore);
    const pool = eligible.length > 0 ? eligible : winnerData.top_candidates;

    setIsSpinning(true);
    let counter = 0;
    const totalSpins = 25;
    const interval = setInterval(() => {
      const randIndex = Math.floor(Math.random() * pool.length);
      setHighlightedIndex(pool[randIndex].participant_id);
      counter++;

      if (counter >= totalSpins) {
        clearInterval(interval);
        const finalSelected = pool[randIndex];
        setIsSpinning(false);
        setHighlightedIndex(null);
        handleSelectWinner(finalSelected.participant_id, 'LUCKY_DRAW');
      }
    }, 90);
  };

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '60px 24px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <RefreshCw size={28} className="animate-spin" color="#059669" style={{ margin: '0 auto 14px' }} />
        <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Calculating Winner Standings...</div>
        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Evaluating submission timestamps and accuracy thresholds</div>
      </div>
    );
  }

  if (!winnerData || !winnerData.winner_found) {
    return (
      <div className="glass-card animate-fade-in" style={{ padding: '50px 24px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f8fafc', border: '2px solid #cbd5e1', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Trophy size={32} color="#94a3b8" />
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>No Completed Attempts Yet</h3>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', maxWidth: '420px', margin: '6px auto 0' }}>
          The winner will be calculated automatically as soon as participants submit their answers for this assessment.
        </p>
      </div>
    );
  }

  const { winner, top_candidates, criteria, quiz_title, selection_mode } = winnerData;

  const modeBadgeText = {
    AUTO: '⚡ Auto-Calculated (Fastest 4/4)',
    MANUAL: '👤 Hand-Picked by Admin',
    LUCKY_DRAW: '🎲 Lucky Draw Winner'
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '920px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* Winner Selection Option Control Suite */}
      <div className="glass-card" style={{
        padding: '18px 24px',
        marginBottom: '24px',
        background: '#ffffff',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Crown size={20} color="#d97706" />
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
            Daily Winner Selection Mode:
          </span>
          <span style={{
            fontSize: '12px',
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: '999px',
            background: selection_mode === 'MANUAL' ? '#eff6ff' : selection_mode === 'LUCKY_DRAW' ? '#fef3c7' : '#ecfdf5',
            color: selection_mode === 'MANUAL' ? '#1d4ed8' : selection_mode === 'LUCKY_DRAW' ? '#b45309' : '#047857',
            border: `1px solid ${selection_mode === 'MANUAL' ? '#bfdbfe' : selection_mode === 'LUCKY_DRAW' ? '#fde68a' : '#a7f3d0'}`,
          }}>
            {modeBadgeText[selection_mode] || '⚡ Auto-Calculated'}
          </span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Lucky Draw Trigger */}
          <button
            onClick={handleLuckyDraw}
            disabled={isSpinning || updating}
            style={{
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 800,
              color: '#92400e',
              background: '#fffbeb',
              border: '1.5px solid #fde68a',
              borderRadius: '10px',
              cursor: isSpinning ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              boxShadow: '0 2px 8px rgba(217, 119, 6, 0.15)',
              transition: 'all 0.15s ease',
            }}
          >
            <Dices size={16} className={isSpinning ? 'animate-spin' : ''} color="#d97706" />
            {isSpinning ? 'Spinning Lucky Draw...' : 'Spin Lucky Draw 🎲'}
          </button>

          {/* Reset to Auto */}
          {selection_mode !== 'AUTO' && (
            <button
              onClick={handleResetAuto}
              disabled={updating}
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#475569',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <RotateCcw size={14} />
              Reset to Auto
            </button>
          )}
        </div>
      </div>

      {/* Trophy Hero Card — Crisp Modern Glassmorphism Redesign */}
      <div className="glass-card animate-fade-in" style={{
        padding: '44px 36px 36px',
        textAlign: 'center',
        borderRadius: '24px',
        border: '1.5px solid rgba(52, 211, 153, 0.45)',
        boxShadow: '0 20px 48px -10px rgba(6, 95, 70, 0.12), 0 0 30px rgba(52, 211, 153, 0.15)',
        marginBottom: '32px',
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(236, 253, 245, 0.85) 60%, rgba(209, 250, 229, 0.6) 100%)',
        backdropFilter: 'blur(16px)',
        overflow: 'hidden',
      }}>
        {/* Background Ambient Glow Accents */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '320px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(52, 211, 153, 0.25) 0%, rgba(255, 255, 255, 0) 70%)',
          pointerEvents: 'none',
        }} />

        {/* Glowing Avatar / Trophy Badge */}
        <div style={{
          width: '96px',
          height: '96px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
          padding: '4px',
          margin: '0 auto 20px',
          boxShadow: '0 10px 28px rgba(5, 150, 105, 0.35), 0 0 0 6px rgba(167, 243, 208, 0.4)',
          position: 'relative',
          zIndex: 2,
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {winner.photo ? (
              <img src={winner.photo} alt={winner.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Trophy size={48} color="#065f46" />
            )}
          </div>
        </div>

        {/* Official Daily Winner Pill Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          padding: '6px 18px',
          borderRadius: '999px',
          background: 'rgba(16, 185, 129, 0.12)',
          color: '#065f46',
          fontSize: '11px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.09em',
          border: '1px solid rgba(52, 211, 153, 0.5)',
          marginBottom: '14px',
          boxShadow: '0 2px 8px rgba(6, 95, 70, 0.06)',
          backdropFilter: 'blur(8px)',
        }}>
          <Sparkles size={14} color="#059669" /> Official Daily Winner
        </div>

        {/* Winner Name */}
        <h1 style={{
          fontSize: '36px',
          fontWeight: 900,
          margin: '0 0 10px',
          color: '#0f172a',
          letterSpacing: '-0.03em',
          lineHeight: 1.2,
        }}>
          {winner.name}
        </h1>

        {/* Subtitle & Phone Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          fontSize: '13px',
          color: '#475569',
          marginBottom: '28px',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontWeight: 800, color: '#065f46', background: '#ecfdf5', padding: '3px 10px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
            {quiz_title}
          </span>
          <span>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Phone:</span>
            <strong style={{ fontFamily: 'var(--font-mono)', color: showFullPhone ? '#065f46' : '#1e293b', fontSize: '14px', fontWeight: 800 }}>
              {showFullPhone ? winner.phone_number : winner.masked_phone}
            </strong>
            <button
              onClick={() => setShowFullPhone(!showFullPhone)}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                color: '#065f46',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                transition: 'all 0.15s ease',
              }}
            >
              {showFullPhone ? 'Mask' : 'Reveal'}
            </button>
            <button
              onClick={() => handleCopy(winner.phone_number)}
              style={{
                background: copied ? '#ecfdf5' : '#ffffff',
                border: copied ? '1px solid #a7f3d0' : '1px solid #cbd5e1',
                borderRadius: '6px',
                color: copied ? '#059669' : '#475569',
                cursor: 'pointer',
                fontSize: '11px',
                padding: '3px 9px',
                fontWeight: 700,
                transition: 'all 0.15s ease',
              }}
            >
              {copied ? 'Copied ✓' : 'Copy'}
            </button>

            {/* Celebrate Confetti Trigger */}
            <button
              onClick={triggerConfetti}
              title="Trigger Victory Confetti"
              style={{
                background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '11px',
                padding: '4px 10px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 8px rgba(6, 95, 70, 0.25)',
              }}
            >
              <Sparkles size={12} color="#fde68a" /> Celebrate 🎉
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '16px',
          maxWidth: '560px',
          margin: '0 auto 24px',
        }}>
          <div style={{
            background: '#ffffff',
            padding: '18px 20px',
            borderRadius: '16px',
            border: '1.5px solid #a7f3d0',
            boxShadow: '0 6px 18px rgba(6, 95, 70, 0.06)',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: '11px', color: '#065f46', display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800, marginBottom: '4px' }}>
              Final Score
            </span>
            <strong style={{ fontSize: '28px', color: '#065f46', fontWeight: 900, lineHeight: 1 }}>
              {winner.score} / {winner.max_score}
            </strong>
          </div>

          <div style={{
            background: '#ffffff',
            padding: '18px 20px',
            borderRadius: '16px',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 6px 18px rgba(15, 23, 42, 0.04)',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800, marginBottom: '4px' }}>
              Submission Time
            </span>
            <strong style={{ fontSize: '22px', color: '#0f172a', fontFamily: 'var(--font-mono)', fontWeight: 800, lineHeight: 1 }}>
              {winner.submitted_at}
            </strong>
          </div>
        </div>

        {/* Winner Rule Banner */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid #cbd5e1',
          borderRadius: '12px',
          padding: '10px 18px',
          fontSize: '12px',
          color: '#475569',
          maxWidth: '560px',
          margin: '0 auto',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        }}>
          ⚖️ <strong>Winner Rule:</strong> {criteria}
        </div>
      </div>

      {/* Top Standings Leaderboard & Winner Selection Action */}
      <div className="glass-card" style={{ padding: '28px', background: '#ffffff', borderRadius: '20px', border: '1.5px solid #e2e8f0', boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Top Leaderboard Standings</h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>Click "Select Winner" on any candidate below to override the daily winner.</p>
          </div>

          <button
            onClick={() => setShowFullPhone(!showFullPhone)}
            style={{
              padding: '7px 14px',
              fontSize: '12px',
              fontWeight: 700,
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {showFullPhone ? <EyeOff size={14} /> : <Eye size={14} />}
            {showFullPhone ? 'Mask Phones' : 'Show All Phones'}
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #e2e8f0', color: '#64748b', background: '#f8fafc', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Rank</th>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Participant</th>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Phone</th>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Score</th>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Submitted At</th>
                <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'right' }}>Select Option</th>
              </tr>
            </thead>
            <tbody>
              {top_candidates?.map((c) => {
                const isWinner = c.is_selected_winner;
                const isHighlighted = highlightedIndex === c.participant_id;

                return (
                  <tr
                    key={c.rank}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      background: isWinner
                        ? '#ecfdf5'
                        : isHighlighted
                        ? '#fef3c7'
                        : undefined,
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 800 }}>
                      {c.rank === 1 ? '🥇 #1' : c.rank === 2 ? '🥈 #2' : c.rank === 3 ? '🥉 #3' : `#${c.rank}`}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {c.photo ? (
                          <img src={c.photo} alt={c.name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : null}
                        <span>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#475569' }}>
                      {showFullPhone ? c.phone_number || c.masked_phone : c.masked_phone}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: c.score === 4 ? '#065f46' : '#2563eb' }}>
                      {c.score} / 4
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#0f172a' }}>
                      {c.submitted_at}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      {isWinner ? (
                        <span style={{
                          background: '#059669',
                          color: '#ffffff',
                          padding: '5px 14px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
                        }}>
                          <Crown size={13} /> Declared Winner
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSelectWinner(c.participant_id, 'MANUAL')}
                          disabled={updating || isSpinning}
                          style={{
                            padding: '6px 12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            color: '#334155',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#d97706';
                            e.currentTarget.style.color = '#d97706';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#cbd5e1';
                            e.currentTarget.style.color = '#334155';
                          }}
                        >
                          <Crown size={13} color="#d97706" />
                          Select as Winner
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
