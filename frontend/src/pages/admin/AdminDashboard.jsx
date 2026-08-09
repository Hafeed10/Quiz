import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { QuizBuilder } from './QuizBuilder';
import { ParticipantsView } from './ParticipantsView';
import { WinnerView } from './WinnerView';
import { QuizHistoryView } from './QuizHistoryView';
import { CustomDropdown } from '../../components/CustomDropdown';
import {
  Users, Award, PlusCircle, RefreshCw,
  Calendar, Clock, CheckCircle2, History, Trophy, BookOpen,
  Sparkles, Shield, ArrowUpRight, Check
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [activeTab, setActiveTab] = useState('participants'); // 'participants' | 'winner' | 'builder' | 'history'
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, quizzesRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminQuizzes(),
      ]);
      setStats(statsRes);
      setQuizzes(quizzesRes);

      const todayId = statsRes?.today_stats?.quiz_id;
      if (quizzesRes.length > 0) {
        const activeQuiz =
          quizzesRes.find((q) => q.dynamic_status === 'LIVE' || q.status === 'LIVE') ||
          quizzesRes.find((q) => q.id === todayId) ||
          quizzesRes[0];
        if (activeQuiz) {
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

  const todayStats = stats?.today_stats || {};

  const quizDropdownOptions = quizzes.map((q) => ({
    value: q.id,
    label: `${q.quiz_date} — ${q.title}`,
    badge: q.dynamic_status,
    badgeClass: q.dynamic_status === 'LIVE' ? 'badge-live' : q.dynamic_status === 'SCHEDULED' ? 'badge-scheduled' : 'badge-ended',
  }));

  const selectedQuiz = quizzes.find((q) => q.id === selectedQuizId);

  return (
    <div className="admin-container animate-fade-in" style={{ maxWidth: '1240px', padding: '36px 24px 100px' }}>
      {/* Executive Header Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '28px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '24px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>
              Admin Operations Center
            </h1>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '999px',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />
              Live System
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Configure daily reading paragraphs, review participants, inspect submitted answers & verify winners.
          </p>
        </div>

        {/* Top Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => {
              setEditingQuiz(null);
              setActiveTab('builder');
            }}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '13px' }}
          >
            <PlusCircle size={16} />
            Create Daily Quiz
          </button>

          <button onClick={loadData} className="btn-secondary" style={{ padding: '10px 14px' }} title="Refresh All Data">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Modern Bento Metric Suite (4 Stat Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        {/* Metric 1: Registered Participants */}
        <div className="glass-card" style={{ padding: '20px', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Participants
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} color="#065f46" />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
            {stats?.total_participants || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Verified Phone Profiles</span>
          </div>
        </div>

        {/* Metric 2: Today's Status */}
        <div className="glass-card" style={{ padding: '20px', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Today's Quiz State
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={16} color="#2563eb" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`badge ${todayStats.status === 'LIVE' ? 'badge-live' : todayStats.status === 'SCHEDULED' ? 'badge-scheduled' : 'badge-ended'}`} style={{ fontSize: '12px', padding: '4px 12px' }}>
              {todayStats.status || 'NO ACTIVE QUIZ'}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
            Window: {todayStats.start_time || '10:00'} – {todayStats.end_time || '10:05'}
          </div>
        </div>

        {/* Metric 3: Submissions Finalized */}
        <div className="glass-card" style={{ padding: '20px', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Completed Today
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} color="#059669" />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#065f46', lineHeight: 1 }}>
            {todayStats.completed_count || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
            1 Attempt Per User Enforced
          </div>
        </div>

        {/* Metric 4: Current Winner */}
        <div className="glass-card" style={{ padding: '20px', background: '#ffffff', border: todayStats.winner_name ? '1.5px solid #fde68a' : '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Leaderboard Winner
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={16} color="#d97706" />
            </div>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: todayStats.winner_name ? '#0f172a' : '#94a3b8', lineHeight: 1.2 }}>
            {todayStats.winner_name ? todayStats.winner_name : 'Awaiting Submissions'}
          </div>
          <div style={{ fontSize: '12px', color: '#065f46', fontWeight: 700, marginTop: '8px' }}>
            {todayStats.winner_score ? `Score: ${todayStats.winner_score}/4 (Earliest Valid Time)` : 'Admin-Only Standings'}
          </div>
        </div>
      </div>

      {/* Interactive Controller & Navigation Bar */}
      <div className="glass-card" style={{
        padding: '14px 20px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        background: '#ffffff',
        position: 'relative',
        zIndex: 50,
        overflow: 'visible',
      }}>
        {/* Quiz Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>Active Quiz:</span>
          <CustomDropdown
            options={quizDropdownOptions}
            value={selectedQuizId}
            onChange={(val) => setSelectedQuizId(Number(val))}
            width="480px"
            popoverWidth="580px"
          />
        </div>

        {/* Clean Segmented Navigation Controller */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: '#f8fafc',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
        }}>
          {[
            { id: 'participants', label: 'Participants', icon: Users },
            { id: 'winner', label: 'Winner', icon: Trophy },
            { id: 'builder', label: 'Quiz Builder', icon: PlusCircle },
            { id: 'history', label: 'Quiz History', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'builder') setEditingQuiz(null);
                  setActiveTab(tab.id);
                }}
                style={{
                  background: isActive ? '#065f46' : 'transparent',
                  color: isActive ? '#ffffff' : '#475569',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '7px',
                  fontSize: '13px',
                  fontWeight: isActive ? 800 : 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 6px rgba(6, 95, 70, 0.25)' : 'none',
                }}
              >
                <Icon size={14} color={isActive ? '#ffffff' : 'currentColor'} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Core Views Container */}
      <div>
        {activeTab === 'participants' && selectedQuizId && (
          <ParticipantsView quizId={selectedQuizId} />
        )}

        {activeTab === 'winner' && selectedQuizId && (
          <WinnerView quizId={selectedQuizId} />
        )}

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
            onMakeLive={handleMakeLive}
            onCloseQuiz={handleCloseQuiz}
          />
        )}
      </div>
    </div>
  );
};
