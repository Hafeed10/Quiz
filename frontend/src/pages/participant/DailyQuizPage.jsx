import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Clock, BookOpen, CheckCircle, AlertCircle, Send } from 'lucide-react';

export const DailyQuizPage = ({ quiz, onSubmitted, onQuizExpired }) => {
  const { participant } = useAuth();
  const [answers, setAnswers] = useState({}); // { [qId]: optionId }
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [unansweredHighlight, setUnansweredHighlight] = useState([]);

  const [secondsRemaining, setSecondsRemaining] = useState(() => {
    return (quiz?.duration_minutes || 5) * 60;
  });

  const questionRefs = useRef({});

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onQuizExpired) onQuizExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onQuizExpired]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
    setErrorMessage('');
    setUnansweredHighlight((prev) => prev.filter((id) => id !== questionId));
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quiz?.questions?.length || 4;
  const isUrgent = secondsRemaining < 60;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!participant) {
      setErrorMessage('Participant identity missing. Please re-authenticate.');
      return;
    }

    const unanswered = [];
    quiz.questions.forEach((q) => {
      if (!answers[q.id]) {
        unanswered.push(q.id);
      }
    });

    if (unanswered.length > 0) {
      setUnansweredHighlight(unanswered);
      setErrorMessage(`Please answer all ${totalQuestions} questions before submitting (${unanswered.length} remaining).`);
      
      const firstUnansweredId = unanswered[0];
      if (questionRefs.current[firstUnansweredId]) {
        questionRefs.current[firstUnansweredId].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitQuizAttempt(quiz.id, participant.id, answers);
      if (res.success) {
        onSubmitted(res);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Submission failed. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container animate-fade-in">
      {/* Sticky Top Timer HUD Bar in Crisp White */}
      <div className="sticky-timer-bar" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge badge-live">Live Quiz</span>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
            {quiz.title}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Answer Progress Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
            <span>{answeredCount} of {totalQuestions} answered</span>
            <div style={{ width: '64px', height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                width: `${(answeredCount / totalQuestions) * 100}%`,
                height: '100%',
                background: '#059669',
                transition: 'width 0.25s ease',
              }} />
            </div>
          </div>

          {/* Timer Countdown in Dark Green */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: isUrgent ? '#fff1f2' : '#ecfdf5',
            border: isUrgent ? '1px solid #fecdd3' : '1px solid #a7f3d0',
            padding: '5px 14px',
            borderRadius: 'var(--radius-md)',
          }}>
            <Clock size={15} color={isUrgent ? '#e11d48' : '#065f46'} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '15px',
              fontWeight: 800,
              color: isUrgent ? '#e11d48' : '#065f46',
              letterSpacing: '0.05em',
            }}>
              {formatTimer(secondsRemaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Reading Passage Card */}
      <div className="glass-card" style={{
        padding: '30px 28px',
        marginBottom: '32px',
        borderLeft: '4px solid #065f46',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <BookOpen size={18} color="#065f46" />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
              {quiz.passage_title || 'Reading Passage'}
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b' }}>
              {quiz.instructions || 'Read the following paragraph carefully before answering the 4 questions below.'}
            </p>
          </div>
        </div>

        <div style={{
          fontSize: '15px',
          lineHeight: '1.8',
          color: '#334155',
          background: '#f8fafc',
          padding: '22px 24px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #e2e8f0',
          whiteSpace: 'pre-line',
          letterSpacing: '0.01em',
        }}>
          {quiz.passage_content}
        </div>
      </div>

      {/* 4 Multiple-Choice Questions Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {quiz.questions?.map((q, idx) => {
            const isUnanswered = unansweredHighlight.includes(q.id);
            const isAnswered = !!answers[q.id];

            return (
              <div
                key={q.id}
                ref={(el) => (questionRefs.current[q.id] = el)}
                className="glass-card"
                style={{
                  padding: '24px',
                  borderColor: isUnanswered
                    ? '#e11d48'
                    : isAnswered
                    ? '#a7f3d0'
                    : '#e2e8f0',
                  boxShadow: isUnanswered
                    ? '0 0 0 2px rgba(225, 29, 72, 0.15)'
                    : undefined,
                  transition: 'var(--transition-smooth)',
                }}
              >
                {/* Question Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: isAnswered ? '#065f46' : '#64748b',
                  }}>
                    Question {q.question_number || idx + 1} of {totalQuestions}
                  </span>
                  {isAnswered && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#065f46', fontWeight: 700 }}>
                      <CheckCircle size={13} /> Selected
                    </span>
                  )}
                </div>

                {/* Question Text */}
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '18px', lineHeight: 1.5 }}>
                  {q.question_text}
                </h3>

                {/* 4 Options Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                  {q.options?.map((opt) => {
                    const isSelected = answers[q.id] === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectOption(q.id, opt.id)}
                        className={`option-card ${isSelected ? 'selected' : ''}`}
                      >
                        <div className="option-badge">
                          {opt.option_key}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: isSelected ? '#065f46' : '#334155',
                          fontWeight: isSelected ? 700 : 500,
                          lineHeight: 1.4,
                        }}>
                          {opt.option_text}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div style={{
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            color: '#be123c',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            marginTop: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
          }}>
            <AlertCircle size={18} color="#e11d48" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Action Bar with Dark Green Button */}
        <div style={{
          marginTop: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
        }}>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ width: '100%', maxWidth: '380px', padding: '15px', fontSize: '15px' }}
          >
            {submitting ? 'Submitting Answers...' : (
              <>
                <Send size={16} />
                Submit Answers ({answeredCount}/{totalQuestions})
              </>
            )}
          </button>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Submitting is final. You cannot modify answers or re-attempt today.
          </span>
        </div>
      </form>
    </div>
  );
};
