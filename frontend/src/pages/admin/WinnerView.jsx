import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../api/client';
import confetti from 'canvas-confetti';
import {
  Trophy, Sparkles, Eye, EyeOff, Check, Copy, Award, Clock, Users,
  Dices, Crown, RotateCcw, CheckCircle2, Zap, UserCheck, RefreshCw, X, Play, Volume2
} from 'lucide-react';

export const WinnerView = ({ quizId }) => {
  const [winnerData, setWinnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showFullPhone, setShowFullPhone] = useState(false);
  const [copied, setCopied] = useState(false);

  // Lucky Draw Modal State
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [selectedScoreTier, setSelectedScoreTier] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spunWinner, setSpunWinner] = useState(null);
  const [activePoolIndex, setActivePoolIndex] = useState(0);
  const [spinSpeed, setSpinSpeed] = useState(50);
  const spinIntervalRef = useRef(null);

  const fetchWinner = async () => {
    if (!quizId || quizId === 'ALL') {
      setWinnerData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.getAdminQuizWinner(quizId);
      setWinnerData(res);
      if (res && res.max_score !== undefined) {
        setSelectedScoreTier(res.max_score);
      }
      if (res && res.winner_found && !spunWinner) {
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
    if (quizId) {
      setSpunWinner(null);
      setShowDrawModal(false);
      fetchWinner();
    }
  }, [quizId]);

  const handleCopy = (phone) => {
    if (!phone) return;
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

  // Get current candidate pool based on selected points tier
  const allCandidates = winnerData?.top_candidates || [];
  const maxScore = winnerData?.max_score ?? (allCandidates[0]?.score ?? 4);
  const activeScore = selectedScoreTier !== null ? selectedScoreTier : maxScore;
  
  // Candidates that share the exact same number of points
  const tiedPool = allCandidates.filter((c) => c.score === activeScore);

  const startLuckyDrawSpin = () => {
    if (tiedPool.length === 0 || isSpinning) return;
    setIsSpinning(true);
    setSpunWinner(null);

    let currentIdx = 0;
    let iterations = 0;
    const totalIterations = Math.max(35, tiedPool.length * 3 + Math.floor(Math.random() * 8));
    let delay = 60;

    const runStep = () => {
      currentIdx = (currentIdx + 1) % tiedPool.length;
      setActivePoolIndex(currentIdx);
      iterations++;

      if (iterations > totalIterations - 12) {
        delay += 35; // Easing deceleration
      } else if (iterations > totalIterations - 6) {
        delay += 70;
      }

      if (iterations < totalIterations) {
        spinIntervalRef.current = setTimeout(runStep, delay);
      } else {
        // Spin finished!
        const chosen = tiedPool[currentIdx];
        setSpunWinner(chosen);
        setIsSpinning(false);
        triggerConfetti();
      }
    };

    spinIntervalRef.current = setTimeout(runStep, delay);
  };

  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearTimeout(spinIntervalRef.current);
    };
  }, []);

  const openLuckyDrawModal = (scoreTier = null) => {
    if (scoreTier !== null) {
      setSelectedScoreTier(scoreTier);
    } else if (selectedScoreTier === null && winnerData?.max_score !== undefined) {
      setSelectedScoreTier(winnerData.max_score);
    }
    setSpunWinner(null);
    setShowDrawModal(true);
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
        <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>
          {quizId === 'ALL' ? 'Select an Individual Quiz' : 'No Completed Attempts Yet'}
        </h3>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', maxWidth: '420px', margin: '6px auto 0' }}>
          {quizId === 'ALL'
            ? 'Winner selection is calculated per daily assessment. Please select a specific quiz from the dropdown menu above to view its standings.'
            : 'The winner will be calculated automatically as soon as participants submit their answers for this assessment.'}
        </p>
      </div>
    );
  }

  const { winner, top_candidates, criteria, quiz_title, selection_mode, score_tiers, tied_top_count } = winnerData;

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Crown size={20} color="#d97706" />
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
            Daily Winner Mode:
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
          
          {tied_top_count > 1 && (
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '6px',
              background: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fde68a',
            }}>
              🎯 {tied_top_count} participants tied with {maxScore}/4 pts
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Lucky Draw Trigger Button */}
          <button
            onClick={() => openLuckyDrawModal(maxScore)}
            disabled={updating}
            style={{
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: 800,
              color: '#78350f',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              border: '1.5px solid #f59e0b',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.2)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(217, 119, 6, 0.28)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(217, 119, 6, 0.2)';
            }}
          >
            <Dices size={17} color="#b45309" />
            <span>Spin Lucky Draw</span>
            <span style={{ background: '#b45309', color: '#ffffff', padding: '1px 6px', borderRadius: '999px', fontSize: '10px', fontWeight: 900 }}>
              {tied_top_count} Tied
            </span>
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
          background: 'radial-gradient(circle, rgba(52, 211, 153, 0.25) 0%, rgba(255, 255, 255) 70%)',
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
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              All Participants Standings ({top_candidates?.length || 0})
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
              Candidates tied with the same points can be spun via Lucky Draw or selected manually.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => openLuckyDrawModal(maxScore)}
              style={{
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: 800,
                color: '#92400e',
                background: '#fef3c7',
                border: '1.5px solid #fde68a',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Dices size={15} color="#d97706" />
              Spin Tied {maxScore}/4 Scorers ({tied_top_count})
            </button>

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
                const isTiedTop = c.is_tied_top;

                return (
                  <tr
                    key={c.participant_id}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      background: isWinner
                        ? '#ecfdf5'
                        : isTiedTop
                        ? '#fffdf5'
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
                        <div>
                          <span>{c.name}</span>
                          {isTiedTop && (
                            <span style={{
                              marginLeft: '8px',
                              fontSize: '10px',
                              fontWeight: 800,
                              background: '#fef3c7',
                              color: '#92400e',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              border: '1px solid #fde68a',
                            }}>
                              ⭐ Tied Pool
                            </span>
                          )}
                        </div>
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
                          disabled={updating}
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
                          Set as Winner
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

      {/* ========================================================================= */}
      {/* LUCKY DRAW SPINNER MODAL (Spins among candidates with SAME points)        */}
      {/* ========================================================================= */}
      {showDrawModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}>
          <div className="glass-card animate-fade-in" style={{
            background: '#ffffff',
            borderRadius: '24px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            border: '2px solid #fde68a',
            boxShadow: '0 25px 60px -15px rgba(217, 119, 6, 0.3)',
            position: 'relative',
          }}>
            {/* Close Button */}
            <button
              onClick={() => {
                if (isSpinning) return;
                setShowDrawModal(false);
              }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isSpinning ? 'not-allowed' : 'pointer',
                color: '#64748b',
              }}
            >
              <X size={18} />
            </button>

            {/* Modal Title */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                background: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: '999px',
                color: '#b45309',
                fontSize: '12px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '8px',
              }}>
                <Dices size={16} /> Equal Points Lucky Draw Roulette
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
                Spin Tied Participants
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Select a point score tier below to spin among all participants tied on that exact score.
              </p>
            </div>

            {/* Score Tier Selector Tabs */}
            {score_tiers && score_tiers.length > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginBottom: '24px',
                flexWrap: 'wrap',
              }}>
                {score_tiers.map((tier) => {
                  const isSelected = activeScore === tier.score;
                  return (
                    <button
                      key={tier.score}
                      onClick={() => {
                        if (isSpinning) return;
                        setSelectedScoreTier(tier.score);
                        setSpunWinner(null);
                      }}
                      disabled={isSpinning}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: 800,
                        cursor: isSpinning ? 'not-allowed' : 'pointer',
                        border: isSelected ? '2px solid #d97706' : '1.5px solid #e2e8f0',
                        background: isSelected ? '#fffbeb' : '#f8fafc',
                        color: isSelected ? '#92400e' : '#475569',
                        boxShadow: isSelected ? '0 4px 12px rgba(217, 119, 6, 0.15)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {tier.is_max ? '⭐ ' : ''}{tier.score}/4 Points ({tier.count} Tied)
                    </button>
                  );
                })}
              </div>
            )}

            {/* Spinning Reel / Highlight Area */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              borderRadius: '20px',
              padding: '28px 20px',
              color: '#ffffff',
              textAlign: 'center',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
              marginBottom: '24px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Glowing Background Ring */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '260px',
                height: '260px',
                background: isSpinning
                  ? 'radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, rgba(0,0,0,0) 70%)'
                  : 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(0,0,0,0) 70%)',
                pointerEvents: 'none',
                transition: 'background 0.3s ease',
              }} />

              {/* Pool Size Header */}
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
                🎯 Spinning Pool: {tiedPool.length} Participants with {activeScore}/4 Points
              </div>

              {/* Active Highlighted Slot */}
              {tiedPool.length > 0 ? (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: isSpinning
                    ? '2px solid #f59e0b'
                    : spunWinner
                    ? '2px solid #10b981'
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  padding: '20px',
                  maxWidth: '400px',
                  margin: '0 auto',
                  boxShadow: isSpinning
                    ? '0 0 24px rgba(245, 158, 11, 0.4)'
                    : spunWinner
                    ? '0 0 28px rgba(16, 185, 129, 0.4)'
                    : 'none',
                  transition: 'all 0.15s ease',
                }}>
                  {/* Candidate Avatar */}
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    margin: '0 auto 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    border: '3px solid #fde68a',
                  }}>
                    {(spunWinner || tiedPool[activePoolIndex])?.photo ? (
                      <img
                        src={(spunWinner || tiedPool[activePoolIndex])?.photo}
                        alt="Candidate"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Crown size={32} color="#d97706" />
                    )}
                  </div>

                  {/* Candidate Name */}
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', marginBottom: '4px' }}>
                    {(spunWinner || tiedPool[activePoolIndex])?.name}
                  </div>

                  {/* Candidate Details */}
                  <div style={{ fontSize: '12px', color: '#cbd5e1', fontFamily: 'var(--font-mono)' }}>
                    Phone: {(spunWinner || tiedPool[activePoolIndex])?.masked_phone} • Score: {activeScore}/4
                  </div>

                  {spunWinner && (
                    <div style={{
                      marginTop: '14px',
                      padding: '6px 12px',
                      background: '#10b981',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      <Sparkles size={14} /> Lucky Winner Selected!
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '13px' }}>No participants found in this point tier.</div>
              )}

              {/* Pool Chips Preview */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                flexWrap: 'wrap',
                marginTop: '18px',
                maxHeight: '75px',
                overflowY: 'auto',
                padding: '4px',
              }}>
                {tiedPool.map((c, i) => {
                  const isActive = !spunWinner && isSpinning && activePoolIndex === i;
                  const isWon = spunWinner && spunWinner.participant_id === c.participant_id;

                  return (
                    <span
                      key={c.participant_id}
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: isWon
                          ? '#10b981'
                          : isActive
                          ? '#f59e0b'
                          : 'rgba(255, 255, 255, 0.1)',
                        color: isWon || isActive ? '#ffffff' : '#94a3b8',
                        border: isWon
                          ? '1px solid #34d399'
                          : isActive
                          ? '1px solid #fbbf24'
                          : '1px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.1s ease',
                      }}
                    >
                      {c.name}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {!spunWinner ? (
                <button
                  onClick={startLuckyDrawSpin}
                  disabled={isSpinning || tiedPool.length === 0}
                  style={{
                    padding: '14px 32px',
                    fontSize: '15px',
                    fontWeight: 900,
                    color: '#ffffff',
                    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: isSpinning ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 8px 24px rgba(217, 119, 6, 0.35)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSpinning) e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <Dices size={20} className={isSpinning ? 'animate-spin' : ''} />
                  <span>{isSpinning ? 'Spinning Tied Pool...' : '🎲 Spin Lucky Draw'}</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      handleSelectWinner(spunWinner.participant_id, 'LUCKY_DRAW', `Selected via Lucky Draw from ${tiedPool.length} participants with ${activeScore}/4 pts`);
                      setShowDrawModal(false);
                    }}
                    disabled={updating}
                    style={{
                      padding: '14px 28px',
                      fontSize: '14px',
                      fontWeight: 900,
                      color: '#ffffff',
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 8px 24px rgba(5, 150, 105, 0.35)',
                    }}
                  >
                    <Crown size={18} />
                    <span>Crown {spunWinner.name} as Winner 👑</span>
                  </button>

                  <button
                    onClick={startLuckyDrawSpin}
                    disabled={isSpinning}
                    style={{
                      padding: '14px 22px',
                      fontSize: '14px',
                      fontWeight: 800,
                      color: '#475569',
                      background: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <RotateCcw size={16} />
                    <span>Re-Spin 🎲</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
