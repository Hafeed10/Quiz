import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Clock, BookOpen, CheckCircle2, AlertCircle, Check } from 'lucide-react';

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
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const handleTimeOut = async () => {
    const currentAnswers = answersRef.current;
    if (participant && Object.keys(currentAnswers).length > 0) {
      try {
        const res = await api.submitQuizAttempt(quiz.id, participant.id, currentAnswers);
        if (res.success && onSubmitted) {
          onSubmitted(res);
          return;
        }
      } catch (err) {
        // proceed to expired screen
      }
    }
    if (onQuizExpired) onQuizExpired();
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [participant, quiz?.id]);

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
  const progressPercent = (answeredCount / totalQuestions) * 100;
  const isUrgent = secondsRemaining < 60;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
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
    <div className="app-container animate-fade-in" style={{ paddingBottom: '140px' }}>
      {/* Sub-Header Status & Progress HUD */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
            <span style={{
              background: '#e0e7ff',
              color: '#3730a3',
              fontSize: '10px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '4px',
              letterSpacing: '0.04em',
              flexShrink: 0,
            }}>
              LIVE QUIZ
            </span>
            <span style={{
              fontSize: '13px',
              fontWeight: 800,
              color: '#0f172a',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {quiz.title}
            </span>
          </div>

          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, flexShrink: 0, marginLeft: '8px' }}>
            {answeredCount} of {totalQuestions} answered
          </div>
        </div>

        {/* Full-width Green Progress Bar */}
        <div style={{
          width: '100%',
          height: '4px',
          background: '#e2e8f0',
          borderRadius: '999px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: '#059669',
            transition: 'width 0.25s ease',
          }} />
        </div>
      </div>

      {/* Reading Passage Card */}
      <div className="glass-card" style={{
        padding: '20px',
        marginBottom: '24px',
        borderLeft: '4px solid #065f46',
        background: '#ffffff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <BookOpen size={16} color="#065f46" />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              {quiz.passage_title || 'Life in the Abyss'}
            </h2>
            <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              Read the passage before answering.
            </p>
          </div>
        </div>

        <div style={{
          fontSize: '15px',
          lineHeight: '1.75',
          color: '#334155',
          background: '#f8fafc',
          padding: '18px 20px',
          borderRadius: '12px',
          border: '1.5px solid #e2e8f0',
          whiteSpace: 'pre-line',
          letterSpacing: '0.01em',
          textAlign: 'justify',
          textJustify: 'inter-word',
          hyphens: 'auto',
        }}>
          {quiz.passage_content}
        </div>
      </div>

      {/* 4 Multiple-Choice Questions */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {quiz.questions?.map((q, idx) => {
            const isUnanswered = unansweredHighlight.includes(q.id);
            const isAnswered = !!answers[q.id];

            return (
              <div
                key={q.id}
                ref={(el) => (questionRefs.current[q.id] = el)}
                className="glass-card"
                style={{
                  padding: '20px',
                  background: '#ffffff',
                  borderColor: isUnanswered
                    ? '#e11d48'
                    : isAnswered
                    ? '#a7f3d0'
                    : '#e2e8f0',
                  boxShadow: isUnanswered
                    ? '0 0 0 2px rgba(225, 29, 72, 0.15)'
                    : '0 1px 3px rgba(0, 0, 0, 0.03)',
                  transition: 'var(--transition-smooth)',
                }}
              >
                {/* Question Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: isAnswered ? '#065f46' : '#64748b',
                  }}>
                    QUESTION {q.question_number || idx + 1} OF {totalQuestions}
                  </span>
                  {isAnswered && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#065f46', fontWeight: 700 }}>
                      <Check size={13} strokeWidth={3} /> Answered
                    </span>
                  )}
                </div>

                {/* Question Text */}
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '14px', lineHeight: 1.45 }}>
                  {q.question_text}
                </h3>

                {/* 4 Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {q.options?.map((opt) => {
                    const isSelected = answers[q.id] === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectOption(q.id, opt.id)}
                        className={`option-card ${isSelected ? 'selected' : ''}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: isSelected ? '1.5px solid #065f46' : '1px solid #e2e8f0',
                          background: isSelected ? '#ecfdf5' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          border: isSelected ? '1.5px solid #065f46' : '1px solid #cbd5e1',
                          background: isSelected ? '#065f46' : '#f8fafc',
                          color: isSelected ? '#ffffff' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}>
                          {opt.option_key}
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: isSelected ? '#065f46' : '#1e293b',
                          fontWeight: isSelected ? 700 : 500,
                          lineHeight: 1.35,
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
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
          }}>
            <AlertCircle size={16} color="#e11d48" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Fixed Bottom Sticky Submission Bar */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)',
          padding: '12px 16px calc(12px + env(safe-area-inset-bottom, 0px))',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
        }}>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '14px',
              fontSize: '15px',
              fontWeight: 800,
              background: '#065f46',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={18} />
            {submitting ? 'Submitting Answers...' : `Submit Answers (${answeredCount}/${totalQuestions})`}
          </button>
          <span style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
            Submitting is final. You cannot modify answers once attempted today.
          </span>
        </div>
      </form>
    </div>
  );
};
