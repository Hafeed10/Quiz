import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, ArrowRight, Clock, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import logoHomeScreen from '../../assets/quiz-bazar-logo.png';

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

      {/* 2. Modern Hero Brand Logo Image */}
      <div style={{ marginBottom: '16px', marginTop: '12px' }}>
        <img
          src={logoHomeScreen}
          alt="Ahlussuffa Quiz Bazar"
          style={{
            height: 'clamp(120px, 26vw, 175px)',
            maxWidth: '340px',
            width: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 12px 28px rgba(6, 95, 70, 0.22))',
          }}
        />
      </div>

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
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '3px' }}>
            1 Passage
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
            Factual reading text with all core answers
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
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '3px' }}>
            4 MCQs
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
            4 multiple-choice questions (1 mark each)
          </div>
        </div>

        {/* Card 3: 20 Minutes / Timed */}
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
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '3px' }}>
            {quizData?.duration_minutes || 20} Minutes
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
            Live timed assessment with auto-submission
          </div>
        </div>

        {/* Card 4: 1 Attempt */}
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
            <ShieldCheck size={18} />
          </div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '3px' }}>
            1 Attempt
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
            Single fair attempt verified per participant
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodePortalPage;
