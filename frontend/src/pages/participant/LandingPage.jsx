import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles, Clock, BookOpen, CheckCircle, Shield,
  ArrowRight, Award, Zap, Users, Lock, ChevronRight
} from 'lucide-react';

export const LandingPage = ({ quizData, onStartQuiz, openLoginModal }) => {
  const { participant } = useAuth();

  const isLive = quizData?.dynamic_status === 'LIVE';
  const isScheduled = quizData?.dynamic_status === 'SCHEDULED';
  const isEnded = quizData?.dynamic_status === 'ENDED' || quizData?.dynamic_status === 'ARCHIVED';
  const hasCompleted = quizData?.has_completed;

  const handleActionClick = () => {
    if (!participant) {
      openLoginModal();
    } else {
      onStartQuiz();
    }
  };

  return (
    <div className="app-container animate-fade-in" style={{ maxWidth: '1120px', padding: '40px 24px 100px' }}>
      {/* 2-Column Split Hero Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '40px',
        alignItems: 'center',
        marginBottom: '64px',
      }}>
        {/* Left Column: Value Proposition & Details */}
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '999px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            fontSize: '12px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '20px',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#059669',
              boxShadow: '0 0 8px #059669',
            }} />
            Daily Reading Challenge
          </div>

          <h1 style={{
            fontSize: '44px',
            fontWeight: 900,
            lineHeight: 1.12,
            letterSpacing: '-0.03em',
            color: '#0f172a',
            marginBottom: '18px',
          }}>
            Master Today's Passage. <br />
            <span style={{ color: '#065f46' }}>Four Questions. One Attempt.</span>
          </h1>

          <p style={{
            fontSize: '16px',
            color: '#475569',
            lineHeight: 1.65,
            marginBottom: '28px',
          }}>
            A daily reading comprehension test. Read the supplied paragraph carefully, answer 4 questions against the clock, and compete for today's highest score.
          </p>

          {/* Quick Pillars */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '32px',
          }}>
            {[
              { icon: BookOpen, label: '1 Reading Passage' },
              { icon: CheckCircle, label: '4 Multiple Choice' },
              { icon: Clock, label: `${quizData?.duration_minutes || 5} Min Window` },
              { icon: Shield, label: 'Strict 1 Attempt' },
            ].map((pill, idx) => {
              const Icon = pill.icon;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#334155',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  }}
                >
                  <Icon size={14} color="#065f46" />
                  <span>{pill.label}</span>
                </div>
              );
            })}
          </div>

          {/* Participant Authentication Bar */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#065f46',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '13px',
              }}>
                {participant ? participant.name.charAt(0).toUpperCase() : <Shield size={16} />}
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  {participant ? 'Logged in participant' : 'Participant Login'}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                  {participant ? `${participant.name} (${participant.masked_phone})` : 'Phone & Name Authentication'}
                </div>
              </div>
            </div>

            {!participant && (
              <button
                onClick={openLoginModal}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#065f46',
                  fontWeight: 700,
                  fontSize: '12px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Live Assessment Showcase Card */}
        <div style={{ position: 'relative' }}>
          {/* Decorative Glow */}
          <div style={{
            position: 'absolute',
            inset: '-10px',
            background: 'radial-gradient(circle, rgba(5, 150, 105, 0.12) 0%, transparent 70%)',
            borderRadius: '24px',
            zIndex: 0,
            pointerEvents: 'none',
          }} />

          <div
            className="glass-card"
            style={{
              position: 'relative',
              zIndex: 1,
              padding: '32px',
              background: '#ffffff',
              border: isLive ? '2px solid #059669' : '1.5px solid #e2e8f0',
              boxShadow: '0 20px 35px -10px rgba(6, 95, 70, 0.12), 0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            {/* Top Card Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`badge ${isLive ? 'badge-live' : isScheduled ? 'badge-scheduled' : 'badge-ended'}`}>
                  {isLive ? '● LIVE ASSESSMENT' : isScheduled ? 'SCHEDULED' : 'ENDED'}
                </span>
                <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                  {quizData?.quiz_date}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#065f46', fontWeight: 700 }}>
                <Clock size={14} />
                <span>{quizData?.duration_minutes || 5} Mins</span>
              </div>
            </div>

            {/* Quiz Title & Passage Intro */}
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', lineHeight: 1.3, marginBottom: '12px' }}>
              {quizData?.title || "Today's Daily Reading Quiz"}
            </h2>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#065f46', marginBottom: '6px' }}>
                <BookOpen size={14} />
                <span>Passage: {quizData?.passage_title || 'Passage Preview'}</span>
              </div>
              <p style={{
                fontSize: '13px',
                color: '#475569',
                lineHeight: 1.6,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {quizData?.passage_content || 'The paragraph presents key facts, data, and details for today’s questions. Ensure you review all lines attentively.'}
              </p>
            </div>

            {/* Primary Action Button */}
            {hasCompleted ? (
              <button
                onClick={onStartQuiz}
                className="btn-secondary"
                style={{ width: '100%', padding: '14px', fontSize: '14px', justifyContent: 'center' }}
              >
                <CheckCircle size={16} color="#059669" />
                View Completed Attempt
              </button>
            ) : isLive ? (
              <button
                onClick={handleActionClick}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '16px',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
                }}
              >
                <Zap size={18} />
                {participant ? "Start Today's Quiz" : 'Login & Start Quiz'}
                <ArrowRight size={18} />
              </button>
            ) : isScheduled ? (
              <div style={{
                textAlign: 'center',
                padding: '14px',
                background: '#eff6ff',
                borderRadius: '8px',
                border: '1px solid #bfdbfe',
              }}>
                <span style={{ fontSize: '12px', color: '#1d4ed8', display: 'block', fontWeight: 600 }}>
                  Assessment Starts at:
                </span>
                <strong style={{ fontSize: '18px', color: '#1e40af', fontFamily: 'var(--font-mono)' }}>
                  {quizData?.start_time || '10:00 AM'}
                </strong>
              </div>
            ) : (
              <button
                onClick={onStartQuiz}
                className="btn-secondary"
                style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
              >
                Quiz Closed — View Status
              </button>
            )}

            {/* Micro Rules Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '18px',
              paddingTop: '14px',
              borderTop: '1px solid #f1f5f9',
              fontSize: '11px',
              color: '#64748b',
            }}>
              <span>🔒 1 Attempt Allowed</span>
              <span>⚖️ Fair Common Window</span>
              <span>🏆 Admin Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Bento Grid (4 Pillars) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
      }}>
        <div className="glass-card" style={{ padding: '24px', background: '#ffffff' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <BookOpen size={20} color="#065f46" />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            1. Read The Passage
          </h3>
          <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
            Every quiz opens with a factual passage containing the key evidence needed for all 4 questions.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '24px', background: '#ffffff' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <CheckCircle size={20} color="#065f46" />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            2. Answer 4 MCQs
          </h3>
          <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
            Four multiple-choice options per question. All 4 questions are required before you can submit.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '24px', background: '#ffffff' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: '#fffbeb',
            border: '1px solid #fde68a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <Clock size={20} color="#d97706" />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            3. Synchronized Timer
          </h3>
          <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
            Everyone competes during a common time window. When time expires, answers lock automatically.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '24px', background: '#ffffff' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <Award size={20} color="#e11d48" />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            4. Single Daily Attempt
          </h3>
          <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
            Enforced at the database level by phone number to ensure an honest, fair daily competition.
          </p>
        </div>
      </div>
    </div>
  );
};
