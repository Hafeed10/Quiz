import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { QuizBuilder } from './QuizBuilder';
import { ParticipantsView } from './ParticipantsView';
import { CumulativeScoresPortal } from './CumulativeScoresPortal';
import { WinnerView } from './WinnerView';
import { QuizHistoryView } from './QuizHistoryView';
import { CustomDropdown } from '../../components/CustomDropdown';
import {
  GraduationCap,
  PlusCircle,
  LayoutDashboard,
  Award,
  Users,
  History,
  Trophy,
  Settings,
  HelpCircle,
  LogOut,
  ShieldCheck,
  Bell,
  RefreshCw,
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2,
  Activity,
  BarChart3,
  ExternalLink,
  Shield
} from 'lucide-react';

export const AdminDashboard = () => {
  const { logoutAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [activeTab, setActiveTab] = useState('operations'); // 'operations' | 'leaderboard' | 'participants' | 'winner' | 'history' | 'builder'
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncingMongo, setSyncingMongo] = useState(false);
  const [activeWinnerData, setActiveWinnerData] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, quizzesRes] = await Promise.allSettled([
        api.getAdminStats(),
        api.getAdminQuizzes(),
      ]);
      const statsData = statsRes.status === 'fulfilled' ? statsRes.value : null;
      const quizzesData = quizzesRes.status === 'fulfilled' && Array.isArray(quizzesRes.value) ? quizzesRes.value : [];

      if (statsData) setStats(statsData);
      if (quizzesData) setQuizzes(quizzesData);

      const todayId = statsData?.today_stats?.quiz_id;
      if (quizzesData.length > 0) {
        const activeQuiz =
          quizzesData.find((q) => q.dynamic_status === 'LIVE' || q.status === 'LIVE') ||
          quizzesData.find((q) => q.id === todayId) ||
          quizzesData[0];
        if (activeQuiz && (!selectedQuizId || selectedQuizId === 'ALL')) {
          setSelectedQuizId(activeQuiz.id);
        }
      }
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const targetQuizId = selectedQuizId && selectedQuizId !== 'ALL' ? selectedQuizId : stats?.today_stats?.quiz_id || (quizzes[0]?.id);
    if (targetQuizId) {
      api.getAdminQuizWinner(targetQuizId)
        .then((res) => {
          if (res && res.winner_found && res.winner) {
            setActiveWinnerData(res.winner);
          } else {
            setActiveWinnerData(null);
          }
        })
        .catch(() => setActiveWinnerData(null));
    } else {
      setActiveWinnerData(null);
    }
  }, [selectedQuizId, quizzes, stats]);

  const handleMakeLive = async (quizId) => {
    try {
      await api.makeLiveAdminQuiz(quizId);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCloseQuiz = async (quizId) => {
    try {
      await api.closeAdminQuiz(quizId);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    try {
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      if (selectedQuizId === quizId) {
        setSelectedQuizId('ALL');
      }
      await api.deleteAdminQuiz(quizId);
      await loadData();
    } catch (err) {
      alert(`Failed to delete quiz: ${err.message}`);
      loadData();
    }
  };

  const handleSyncMongo = async () => {
    setSyncingMongo(true);
    try {
      const res = await api.syncFromMongo();
      alert(res.message || 'Synced successfully from MongoDB Atlas!');
      await loadData();
    } catch (err) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setSyncingMongo(false);
    }
  };

  const todayStats = stats?.today_stats || {};
  const todayStr = new Date().toISOString().split('T')[0];

  const quizDropdownOptions = [
    {
      value: 'ALL',
      label: '⚡ All Quizzes (All Submissions)',
      badge: `${quizzes.length} Quizzes`,
      badgeClass: 'badge-live',
    },
    ...quizzes.map((q) => {
      const isDraft = q.status === 'DRAFT' || q.dynamic_status === 'DRAFT';
      const hasWinner = Boolean(q.winner_name && q.winner_name.trim() && q.winner_name !== '—');
      const isPastDate = Boolean(q.quiz_date && q.quiz_date < todayStr);
      const isCompleted = !isDraft && (q.dynamic_status === 'ENDED' || q.dynamic_status === 'ARCHIVED' || q.dynamic_status === 'COMPLETED' || q.status === 'ENDED' || q.status === 'ARCHIVED' || hasWinner || isPastDate);
      const isLive = !isDraft && !isCompleted && (q.dynamic_status === 'LIVE' || q.status === 'LIVE');

      const badgeLabel = isCompleted ? 'COMPLETED' : isLive ? 'LIVE' : isDraft ? 'DRAFT' : 'SCHEDULED';
      const badgeClass = isLive ? 'badge-live' : isCompleted ? 'badge-completed' : isDraft ? 'badge-ended' : 'badge-scheduled';

      return {
        value: q.id,
        label: `${q.quiz_date} — ${q.title}`,
        badge: badgeLabel,
        badgeClass: badgeClass,
      };
    })
  ];

  const handleViewPortal = () => {
    window.location.hash = '#participant';
    window.location.reload();
  };

  return (
    <div className="admin-sidebar-shell animate-fade-in">
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="admin-sidebar">
        <div>
          {/* Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 8px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(6, 95, 70, 0.3)',
              color: '#ffffff',
            }}>
              <GraduationCap size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                Admin Console
              </h2>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                ACADEMIC MANAGEMENT
              </span>
            </div>
          </div>

          {/* Primary Action CTA */}
          <div style={{ padding: '20px 0 16px' }}>
            <button
              onClick={() => {
                setEditingQuiz(null);
                setActiveTab('builder');
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '12px 18px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(6, 95, 70, 0.25)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <PlusCircle size={18} />
              <span>Create Daily Quiz</span>
            </button>
          </div>

          {/* Main Navigation Menu */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              className={`admin-nav-item ${activeTab === 'operations' ? 'active' : ''}`}
              onClick={() => setActiveTab('operations')}
            >
              <LayoutDashboard size={18} />
              <span>Operations Center</span>
            </button>

            <button
              className={`admin-nav-item ${activeTab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('leaderboard')}
            >
              <Award size={18} />
              <span>Cumulative Leaderboard</span>
            </button>

            <button
              className={`admin-nav-item ${activeTab === 'participants' ? 'active' : ''}`}
              onClick={() => setActiveTab('participants')}
            >
              <Users size={18} />
              <span>Live Submissions</span>
            </button>

            <button
              className={`admin-nav-item ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <History size={18} />
              <span>Quiz History</span>
            </button>

            <button
              className={`admin-nav-item ${activeTab === 'winner' ? 'active' : ''}`}
              onClick={() => setActiveTab('winner')}
            >
              <Trophy size={18} />
              <span>Winner Portal</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Links & User Profile */}
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
            <button
              className="admin-nav-item"
              onClick={() => alert('Settings module is active.')}
            >
              <Settings size={17} color="#64748b" />
              <span style={{ fontSize: '13px', color: '#64748b' }}>Settings</span>
            </button>
            <button
              className="admin-nav-item"
              onClick={() => alert('QuizBazar Admin Support Helpdesk is active.')}
            >
              <HelpCircle size={17} color="#64748b" />
              <span style={{ fontSize: '13px', color: '#64748b' }}>Support</span>
            </button>
          </div>

          {/* Admin User Card */}
          <div style={{
            marginTop: '16px',
            padding: '10px 12px',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#065f46',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 800,
                flexShrink: 0,
              }}>
                A
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
                  Admin User
                </div>
                <div style={{ fontSize: '10px', color: '#059669', fontWeight: 700 }}>
                  Verified
                </div>
              </div>
            </div>
            <button
              onClick={logoutAdmin}
              title="Logout Admin"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CANVAS AREA */}
      <main className="admin-main-canvas">
        {/* TOP HEADER BAR */}
        <header className="admin-top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              QuizBazar Admin
            </h1>
            <button
              onClick={handleViewPortal}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#059669',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'underline',
              }}
            >
              View Portal <ExternalLink size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              fontSize: '11px',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: '999px',
            }}>
              <ShieldCheck size={14} color="#059669" />
              Admin Verified
            </span>

            <button
              title="System Notifications"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <Bell size={16} />
              <span style={{
                position: 'absolute',
                top: '7px',
                right: '8px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#ef4444',
              }} />
            </button>

            <button
              onClick={() => alert('Settings menu')}
              title="Settings"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Settings size={16} />
            </button>

            <button
              onClick={logoutAdmin}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <LogOut size={13} />
              Logout
            </button>
          </div>
        </header>

        {/* MAIN CONTENT BODY */}
        <div className="admin-content-body">

          {/* ACTIVE QUIZ CONTEXT BAR (Shown on specific sub-views) */}
          {activeTab !== 'operations' && activeTab !== 'builder' && (
            <div style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '12px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BarChart3 size={16} color="#065f46" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Active Quiz Context:
                </span>
                <CustomDropdown
                  options={quizDropdownOptions}
                  value={selectedQuizId}
                  onChange={(val) => setSelectedQuizId(val === 'ALL' ? 'ALL' : Number(val))}
                  width="360px"
                  popoverWidth="460px"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className="btn-secondary"
                  onClick={() => setActiveTab('leaderboard')}
                  style={{
                    fontSize: '12px',
                    padding: '6px 12px',
                    background: activeTab === 'leaderboard' ? '#ecfdf5' : '#ffffff',
                    borderColor: activeTab === 'leaderboard' ? '#a7f3d0' : '#e2e8f0',
                    color: activeTab === 'leaderboard' ? '#065f46' : '#475569',
                    fontWeight: 700,
                  }}
                >
                  <Award size={13} /> Cumulative Leaderboard
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setActiveTab('participants')}
                  style={{
                    fontSize: '12px',
                    padding: '6px 12px',
                    background: activeTab === 'participants' ? '#ecfdf5' : '#ffffff',
                    borderColor: activeTab === 'participants' ? '#a7f3d0' : '#e2e8f0',
                    color: activeTab === 'participants' ? '#065f46' : '#475569',
                    fontWeight: 700,
                  }}
                >
                  <Users size={13} /> Live Submissions
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: OPERATIONS CENTER */}
          {activeTab === 'operations' && (
            <div>
              {/* Operations Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
                borderRadius: '20px',
                padding: '28px 32px',
                marginBottom: '28px',
                color: '#ffffff',
                boxShadow: '0 16px 32px -8px rgba(6, 95, 70, 0.35)',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(167, 243, 208, 0.25)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Shield size={20} color="#34d399" />
                      </div>
                      <h1 style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.03em', margin: 0, color: '#ffffff' }}>
                        Admin Operations Center
                      </h1>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(16, 185, 129, 0.25)',
                        backdropFilter: 'blur(6px)',
                        border: '1px solid rgba(52, 211, 153, 0.4)',
                        color: '#a7f3d0',
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '4px 12px',
                        borderRadius: '999px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
                        Live System Active
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#d1fae5', margin: 0, maxWidth: '640px', opacity: 0.9 }}>
                      Manage daily academic assessments, track live participant submissions, inspect cumulative standings & declare daily winners.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      onClick={() => {
                        setEditingQuiz(null);
                        setActiveTab('builder');
                      }}
                      style={{
                        background: '#ffffff',
                        color: '#065f46',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                      }}
                    >
                      <PlusCircle size={16} color="#065f46" />
                      Create Daily Quiz
                    </button>

                    <button
                      onClick={handleSyncMongo}
                      disabled={syncingMongo}
                      style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        color: '#ffffff',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        cursor: syncingMongo ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                      title="Sync latest live attempts & submissions from MongoDB Atlas"
                    >
                      <Sparkles size={15} className={syncingMongo ? 'animate-spin' : ''} color="#34d399" />
                      <span>{syncingMongo ? 'Syncing Cloud...' : 'Sync Cloud Data'}</span>
                    </button>

                    <button
                      onClick={loadData}
                      style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        color: '#ffffff',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Refresh All System Data"
                    >
                      <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bento Metric Suite (4 Stat Cards) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                gap: '18px',
                marginBottom: '28px',
              }}>
                {/* Metric 1 */}
                <div className="glass-card" style={{ padding: '20px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Total Participants
                    </span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={18} color="#065f46" />
                    </div>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                    {stats?.total_participants || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Sparkles size={13} color="#059669" /> Unique Verified Profiles
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="glass-card" style={{ padding: '20px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Total Quizzes
                    </span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={18} color="#1d4ed8" />
                    </div>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                    {stats?.total_quizzes || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={13} color="#2563eb" /> Active & Scheduled Ledger
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="glass-card" style={{ padding: '20px', background: '#ffffff', borderRadius: '16px', border: '1px solid #a7f3d0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Completed Today
                    </span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={18} color="#059669" />
                    </div>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: '#065f46', lineHeight: 1 }}>
                    {todayStats.completed_count || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#059669', fontWeight: 700, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Activity size={13} color="#059669" /> 1 Attempt Per User Enforced
                  </div>
                </div>

                {/* Metric 4 */}
                {(() => {
                  const winnerName =
                    activeWinnerData?.name ||
                    todayStats?.winner_name ||
                    (quizzes.find((q) => q.winner_name)?.winner_name) ||
                    null;
                  const winnerScore =
                    activeWinnerData?.score !== undefined
                      ? `${activeWinnerData.score}/4`
                      : todayStats?.winner_score
                      ? `${todayStats.winner_score}/4`
                      : '4/4';
                  const winnerTime = activeWinnerData?.submitted_at;

                  return (
                    <div className="glass-card" style={{
                      padding: '20px',
                      background: winnerName ? 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)' : '#ffffff',
                      borderRadius: '16px',
                      border: winnerName ? '1.5px solid #fde68a' : '1px solid #e2e8f0',
                      boxShadow: winnerName ? '0 8px 24px rgba(217, 119, 6, 0.10)' : '0 8px 24px rgba(15, 23, 42, 0.04)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Daily Winner
                        </span>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trophy size={18} color="#d97706" />
                        </div>
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: winnerName ? '#0f172a' : '#94a3b8', lineHeight: 1.2 }}>
                        {winnerName ? winnerName : 'Awaiting Submissions'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#d97706', fontWeight: 800, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                        <Award size={13} color="#d97706" />
                        {winnerName ? (
                          <span>Score: {winnerScore} {winnerTime ? `(${winnerTime})` : ''}</span>
                        ) : (
                          <span>Standings Calculated</span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Cumulative Leaderboard embedded directly under Operations */}
              <CumulativeScoresPortal />
            </div>
          )}

          {/* TAB 2: CUMULATIVE LEADERBOARD */}
          {activeTab === 'leaderboard' && (
            <CumulativeScoresPortal />
          )}

          {/* TAB 3: LIVE SUBMISSIONS */}
          {activeTab === 'participants' && (
            <ParticipantsView quizId={selectedQuizId || 'ALL'} />
          )}

          {/* TAB 4: WINNER PORTAL */}
          {activeTab === 'winner' && (
            <WinnerView
              quizId={selectedQuizId && selectedQuizId !== 'ALL' ? selectedQuizId : (stats?.today_stats?.quiz_id || quizzes[0]?.id)}
              onQuizUpdated={loadData}
              onCloseQuiz={handleCloseQuiz}
            />
          )}

          {/* TAB 5: QUIZ HISTORY */}
          {activeTab === 'history' && (
            <QuizHistoryView
              quizzes={quizzes}
              onSelectQuiz={(id) => {
                setSelectedQuizId(id);
                setActiveTab('participants');
              }}
              onEditQuiz={(quiz) => {
                setEditingQuiz(quiz);
                setActiveTab('builder');
              }}
              onDeleteQuiz={handleDeleteQuiz}
              onMakeLive={handleMakeLive}
              onCloseQuiz={handleCloseQuiz}
            />
          )}

          {/* TAB 6: QUIZ BUILDER */}
          {activeTab === 'builder' && (
            <QuizBuilder
              quizToEdit={editingQuiz}
              onSaved={() => {
                setEditingQuiz(null);
                setActiveTab('history');
                loadData();
              }}
              onCancel={() => {
                setEditingQuiz(null);
                setActiveTab('participants');
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
};
