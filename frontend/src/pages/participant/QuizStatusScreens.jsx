import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Clock, AlertTriangle, Award, ArrowLeft } from 'lucide-react';

export const CompletionPage = ({ participantName, onBackHome }) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#16a34a', '#d97706']
      });
    } catch {
      // safe
    }
  }, []);

  return (
    <div className="glass-card animate-fade-in" style={{
      maxWidth: '560px',
      margin: '40px auto',
      padding: '40px 32px',
      textAlign: 'center',
      border: '1px solid #bbf7d0',
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        margin: '0 auto 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <CheckCircle2 size={36} color="#16a34a" />
      </div>

      <span className="badge badge-completed" style={{ marginBottom: '12px' }}>
        Attempt Completed
      </span>

      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px', color: '#0f172a' }}>
        Congratulations{participantName ? `, ${participantName}` : ''}!
      </h1>

      <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
        Your answers have been submitted successfully. Thank you for participating in today's daily quiz.
      </p>

      {/* Info card */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Status</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--success-text)' }}>Submitted</span>
        </div>
        <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }} />
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Daily Policy</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>1 Attempt</span>
        </div>
        <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }} />
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Next Quiz</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#2563eb' }}>Tomorrow</span>
        </div>
      </div>

      <div style={{
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        color: '#1e3a8a',
        fontSize: '13px',
        marginBottom: '24px',
      }}>
        🔒 Correct answers and rankings are kept confidential by the system during the daily window.
      </div>

      <button onClick={onBackHome} className="btn-secondary" style={{ width: '100%' }}>
        <ArrowLeft size={15} />
        Back to Home
      </button>
    </div>
  );
};


export const AlreadyCompletedScreen = ({ participantName, onBackHome }) => {
  return (
    <div className="glass-card animate-fade-in" style={{
      maxWidth: '520px',
      margin: '40px auto',
      padding: '36px 28px',
      textAlign: 'center',
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        margin: '0 auto 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Award size={28} color="#2563eb" />
      </div>

      <span className="badge badge-completed" style={{ marginBottom: '10px' }}>
        Already Completed Today
      </span>

      <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px', color: '#0f172a' }}>
        Welcome back, {participantName}!
      </h2>

      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
        You have already completed today's daily quiz. Each participant is allowed exactly one attempt per day.
      </p>

      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 'var(--radius-md)',
        padding: '14px',
        marginBottom: '20px',
        fontSize: '13px',
        color: 'var(--text-secondary)',
      }}>
        📅 Please return tomorrow for the next daily reading passage and quiz.
      </div>

      <button onClick={onBackHome} className="btn-secondary" style={{ width: '100%' }}>
        <ArrowLeft size={15} />
        Back to Home
      </button>
    </div>
  );
};


export const QuizNotStartedScreen = ({ quiz, onBackHome }) => {
  return (
    <div className="glass-card animate-fade-in" style={{
      maxWidth: '520px',
      margin: '40px auto',
      padding: '36px 28px',
      textAlign: 'center',
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        margin: '0 auto 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Clock size={28} color="#2563eb" />
      </div>

      <span className="badge badge-scheduled" style={{ marginBottom: '10px' }}>
        Quiz Scheduled
      </span>

      <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px', color: '#0f172a' }}>
        Today's quiz has not started yet
      </h2>

      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        The quiz will unlock during the configured daily window.
      </p>

      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        marginBottom: '20px',
      }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Scheduled Start Time
        </div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: '#2563eb', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
          {quiz?.start_time || '10:00 AM'}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Duration: {quiz?.duration_minutes || 5} minutes
        </div>
      </div>

      <button onClick={onBackHome} className="btn-secondary" style={{ width: '100%' }}>
        <ArrowLeft size={15} />
        Back to Home
      </button>
    </div>
  );
};


export const QuizEndedScreen = ({ onBackHome }) => {
  return (
    <div className="glass-card animate-fade-in" style={{
      maxWidth: '520px',
      margin: '40px auto',
      padding: '36px 28px',
      textAlign: 'center',
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        margin: '0 auto 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <AlertTriangle size={28} color="#dc2626" />
      </div>

      <span className="badge badge-ended" style={{ marginBottom: '10px' }}>
        Quiz Expired
      </span>

      <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px', color: '#0f172a' }}>
        Today's quiz has ended
      </h2>

      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
        The time window for today's daily quiz has expired.
      </p>

      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 'var(--radius-md)',
        padding: '14px',
        marginBottom: '20px',
        fontSize: '13px',
        color: 'var(--text-primary)',
      }}>
        ✨ Please return tomorrow for the next daily challenge!
      </div>

      <button onClick={onBackHome} className="btn-secondary" style={{ width: '100%' }}>
        <ArrowLeft size={15} />
        Back to Home
      </button>
    </div>
  );
};
