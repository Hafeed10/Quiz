import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, ArrowRight, Clock, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const QRCodePortalPage = ({ quizData, onOpenWebsite }) => {
  const { participant } = useAuth();

  return (
    <div
      className="hero-glow-bg animate-fade-in"
      style={{
        minHeight: 'calc(85vh - 80px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px 40px',
        textAlign: 'center',
      }}
    >
      {/* 1. Live Assessment Status Pill Badge */}
      <div className="hero-badge-pill">
        <span className="hero-pulse-dot" />
        <span>Today's Quiz Competition is Live</span>
      </div>

      {/* 2. Modern Hero Brand Logo Box */}
      <div className="hero-logo-box">
        <BookOpen size={44} />
      </div>

      {/* 3. Hero Title: Quiz Bazar */}
      <h1 className="hero-title">
        Quiz <span style={{ color: '#059669' }}>Bazar</span>
      </h1>

      {/* 4. Subtitle Tagline */}
      <p className="hero-subtitle">
        {quizData?.title ? (
          <span>Featured: <strong>{quizData.title}</strong></span>
        ) : (
          <span>Read today’s factual passage, answer 4 timed questions, and compete on the leaderboard.</span>
        )}
      </p>

      {/* 5. Primary Action: Open Website Participation Button */}
      <div style={{ width: '100%', maxWidth: '380px', marginBottom: '12px' }}>
        <button
          onClick={onOpenWebsite}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '17px 32px',
            fontSize: '17px',
            fontWeight: 800,
            borderRadius: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: 'pointer',
            minHeight: '56px',
            boxShadow: '0 10px 30px rgba(6, 95, 70, 0.3)',
            transition: 'all 0.2s ease',
          }}
        >
          <span>Open Website Participation</span>
          <ArrowRight size={20} />
        </button>
      </div>

      {/* 6. Micro Trust Badge Under CTA */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: '#065f46',
        fontWeight: 700,
        marginBottom: '6px',
      }}>
        <ShieldCheck size={14} color="#059669" />
        <span>Instant Registration • Single Fair Attempt</span>
      </div>

      {/* 7. 2x2 Model Grid (4 Square Feature Cards) */}
      <div className="hero-grid-2x2">
        {/* Card 1: 1 Passage */}
        <div className="hero-card-2x2">
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#ecfdf5',
            color: '#065f46',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px',
          }}>
            <BookOpen size={18} />
          </div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
            1 Factual Passage
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
            Reading story with all key answers
          </div>
        </div>

        {/* Card 2: 4 MCQs */}
        <div className="hero-card-2x2">
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#ecfdf5',
            color: '#065f46',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px',
          }}>
            <CheckCircle2 size={18} />
          </div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
            4 MCQs
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
            4 timed questions (1 mark each)
          </div>
        </div>

        {/* Card 3: Timed Window */}
        <div className="hero-card-2x2">
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#ecfdf5',
            color: '#065f46',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px',
          }}>
            <Clock size={18} />
          </div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
            {quizData?.duration_minutes || 5} Min Window
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
            Fast assessment with auto-submission
          </div>
        </div>

        {/* Card 4: Daily Leaderboard */}
        <div className="hero-card-2x2">
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#ecfdf5',
            color: '#065f46',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px',
          }}>
            <Award size={18} />
          </div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
            Leaderboard
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
            Daily winner rankings & honors
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodePortalPage;
