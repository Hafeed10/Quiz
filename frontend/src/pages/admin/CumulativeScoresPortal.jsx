import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { ParticipantDailyHistoryModal } from './ParticipantDailyHistoryModal';
import {
  Trophy, Search, RefreshCw, Eye, EyeOff, Copy, Check,
  Award, Calendar, Users, ChevronRight, ArrowUpDown, Shield, Sparkles, TrendingUp, Trash2
} from 'lucide-react';

export const CumulativeScoresPortal = () => {
  const [data, setData] = useState({ participants: [], total_participants: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFullPhone, setShowFullPhone] = useState(false);
  const [revealedRows, setRevealedRows] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [sortBy, setSortBy] = useState('score'); // 'score' | 'quizzes' | 'accuracy' | 'name'

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminCumulativeParticipants();
      setData(res);
    } catch (err) {
      console.error('Failed to load cumulative leaderboard', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteParticipant = async (participantId, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete participant "${name}" and all their quiz attempts?`)) return;
    try {
      setData((prev) => ({
        ...prev,
        participants: (prev.participants || []).filter((p) => p.id !== participantId),
      }));
      await api.deleteAdminParticipant(participantId);
      loadLeaderboard();
    } catch (err) {
      alert(`Failed to delete participant: ${err.message}`);
      loadLeaderboard();
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const toggleRowReveal = (id) => {
    setRevealedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyPhone = (phone, id) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const participants = data.participants || [];

  // Filter
  const filtered = participants.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.phone_number && p.phone_number.includes(q)) ||
      (p.masked_phone && p.masked_phone.includes(q))
    );
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'score') return b.total_score - a.total_score || b.accuracy_percent - a.accuracy_percent;
    if (sortBy === 'quizzes') return b.total_quizzes_taken - a.total_quizzes_taken || b.total_score - a.total_score;
    if (sortBy === 'accuracy') return b.accuracy_percent - a.accuracy_percent || b.total_score - a.total_score;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  // Overall aggregate stats
  const totalScoresSum = participants.reduce((acc, curr) => acc + (curr.total_score || 0), 0);
  const totalPossibleSum = participants.reduce((acc, curr) => acc + (curr.max_possible_score || 0), 0);
  const overallAccuracy = totalPossibleSum > 0 ? Math.round((totalScoresSum / totalPossibleSum) * 100) : 0;
  const topParticipant = participants.length > 0 && participants[0].total_score > 0 ? participants[0] : null;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '50px' }}>
      {/* Portal Header */}
      <div style={{
        background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
        borderRadius: '16px',
        padding: '28px 32px',
        color: '#ffffff',
        marginBottom: '24px',
        boxShadow: '0 10px 25px -5px rgba(6, 95, 70, 0.25)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          right: '-20px',
          top: '-20px',
          opacity: 0.1,
          pointerEvents: 'none',
        }}>
          <Trophy size={200} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(4px)',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              ⭐ Admin Exclusive Portal
            </span>
          </div>

          <h2 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '6px', letterSpacing: '-0.02em' }}>
            Daily Participant Cumulative Scores Portal
          </h2>
          <p style={{ fontSize: '14px', color: '#d1fae5', maxWidth: '680px', lineHeight: 1.5 }}>
            Tracks all participants who take the daily quiz every day. Each day's score is accumulated into their total profile with day-by-day scorecards and rankings.
          </p>
        </div>
      </div>

      {/* Aggregate KPI Highlights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {/* Total Tracked Participants */}
        <div className="glass-card" style={{ padding: '20px', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Tracked Participants
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} color="#065f46" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a' }}>
            {participants.length}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
            All-time registered profiles
          </div>
        </div>

        {/* Total Cumulative Points Scored */}
        <div className="glass-card" style={{ padding: '20px', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Points Scored
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} color="#2563eb" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#065f46' }}>
            {totalScoresSum} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>/ {totalPossibleSum} max</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
            Summed across all daily sessions
          </div>
        </div>

        {/* Platform Accuracy */}
        <div className="glass-card" style={{ padding: '20px', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Overall Accuracy
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="#16a34a" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#16a34a' }}>
            {overallAccuracy}%
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
            Average success rate
          </div>
        </div>

        {/* Current Leader */}
        <div className="glass-card" style={{ padding: '20px', background: '#ffffff', border: topParticipant ? '1.5px solid #fde68a' : '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Rank #1 Leader
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={16} color="#d97706" />
            </div>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
            {topParticipant ? topParticipant.name : 'No Submissions'}
          </div>
          <div style={{ fontSize: '12px', color: '#065f46', fontWeight: 700, marginTop: '6px' }}>
            {topParticipant ? `${topParticipant.total_score} pts • ${topParticipant.total_quizzes_taken} Quizzes` : 'Awaiting daily attempts'}
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '18px',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '460px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by participant name or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '40px' }}
          />
        </div>

        {/* Sorting & Mask Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b' }}>
            <ArrowUpDown size={14} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              <option value="score">Sort by Total Score</option>
              <option value="quizzes">Sort by Days / Quizzes Taken</option>
              <option value="accuracy">Sort by Accuracy %</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>

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
            {showFullPhone ? 'Mask All' : 'Show Full Phone Numbers'}
          </button>

          <button onClick={loadLeaderboard} className="btn-secondary" style={{ padding: '8px 12px' }} title="Refresh Portal">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Cumulative Leaderboard Table */}
      <div className="glass-card" style={{ overflowX: 'auto', background: '#ffffff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#475569' }}>
              <th style={{ padding: '14px 18px', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', width: '70px' }}>Rank</th>
              <th style={{ padding: '14px 18px', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>Participant</th>
              <th style={{ padding: '14px 18px', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>Phone Number</th>
              <th style={{ padding: '14px 18px', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>Daily Quizzes Taken</th>
              <th style={{ padding: '14px 18px', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>Total Accumulated Score</th>
              <th style={{ padding: '14px 18px', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>Average Score & Accuracy</th>
              <th style={{ padding: '14px 18px', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', textAlign: 'right' }}>Daily Scorecard</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
                  No participant records found.
                </td>
              </tr>
            ) : (
              sorted.map((p, idx) => {
                const isRevealed = showFullPhone || revealedRows[p.id];
                const displayedPhone = isRevealed ? p.phone_number : p.masked_phone;
                const scorePercent = p.max_possible_score > 0 ? (p.total_score / p.max_possible_score) * 100 : 0;

                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Rank Badge */}
                    <td style={{ padding: '16px 18px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: idx === 0 ? '#fef3c7' : idx === 1 ? '#f1f5f9' : idx === 2 ? '#ffedd5' : '#f8fafc',
                        color: idx === 0 ? '#b45309' : idx === 1 ? '#475569' : idx === 2 ? '#c2410c' : '#64748b',
                        fontWeight: 900,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #e2e8f0',
                      }}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </div>
                    </td>

                    {/* Participant Details */}
                    <td style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: '#065f46',
                          color: '#ffffff',
                          fontWeight: 900,
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 6px rgba(6, 95, 70, 0.2)',
                          overflow: 'hidden',
                        }}>
                          {p.photo ? (
                            <img src={p.photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            p.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '15px' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            Participant ID: #{p.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Phone Number with Reveal / Copy */}
                    <td style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          color: '#0f172a',
                          fontSize: '13px',
                          fontWeight: 700,
                          letterSpacing: '0.02em',
                        }}>
                          {displayedPhone}
                        </span>
                        <button
                          onClick={() => toggleRowReveal(p.id)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: '#64748b' }}
                          title={isRevealed ? 'Mask' : 'Reveal full number'}
                        >
                          {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => copyPhone(p.phone_number, p.id)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: '#64748b' }}
                          title="Copy phone"
                        >
                          {copiedId === p.id ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </td>

                    {/* Daily Quizzes Taken */}
                    <td style={{ padding: '16px 18px' }}>
                      <span style={{
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        color: '#334155',
                        fontWeight: 700,
                        fontSize: '12px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}>
                        <Calendar size={12} color="#64748b" />
                        {p.total_quizzes_taken} {p.total_quizzes_taken === 1 ? 'Day / Quiz' : 'Days / Quizzes'}
                      </span>
                    </td>

                    {/* Total Cumulative Score */}
                    <td style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '150px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{
                            background: '#ecfdf5',
                            border: '1.5px solid #a7f3d0',
                            color: '#065f46',
                            fontWeight: 900,
                            fontSize: '14px',
                            padding: '3px 10px',
                            borderRadius: '8px',
                            fontFamily: 'var(--font-mono)',
                          }}>
                            {p.total_score} Points
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                            out of {p.max_possible_score}
                          </span>
                        </div>

                        {/* Visual Progress Bar */}
                        <div style={{
                          width: '100%',
                          height: '5px',
                          background: '#e2e8f0',
                          borderRadius: '999px',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${scorePercent}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
                            borderRadius: '999px',
                            transition: 'width 0.3s ease',
                          }} />
                        </div>
                      </div>
                    </td>

                    {/* Average / Accuracy */}
                    <td style={{ padding: '16px 18px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                        {p.average_score} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>/ 4 avg</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                        {p.accuracy_percent}% accuracy
                      </div>
                    </td>

                    {/* Action: View Daily Scorecard & Delete Participant */}
                    <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setSelectedParticipant(p)}
                          style={{
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            borderRadius: '8px',
                            color: '#065f46',
                            fontWeight: 800,
                            fontSize: '12px',
                            padding: '7px 14px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#065f46';
                            e.currentTarget.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#ecfdf5';
                            e.currentTarget.style.color = '#065f46';
                          }}
                        >
                          <span>Daily Scorecard</span>
                          <ChevronRight size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteParticipant(p.id, p.name)}
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            color: '#dc2626',
                            fontWeight: 700,
                            fontSize: '12px',
                            padding: '7px 10px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          title="Delete Participant Profile"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Daily Scorecard Modal */}
      {selectedParticipant && (
        <ParticipantDailyHistoryModal
          participant={selectedParticipant}
          onClose={() => setSelectedParticipant(null)}
        />
      )}
    </div>
  );
};
