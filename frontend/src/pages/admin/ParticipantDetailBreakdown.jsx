import React, { useState } from 'react';
import { User, Phone, CheckCircle, XCircle, ArrowLeft, Award, Check, Copy } from 'lucide-react';

export const ParticipantDetailBreakdown = ({ attempt, onBack }) => {
  const [showPhone, setShowPhone] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!attempt) return null;

  const handleCopy = (phone) => {
    navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPerfect = attempt.score === 4;

  return (
    <div className="animate-fade-in" style={{ padding: '8px 0 60px' }}>
      {/* Top Back Link */}
      <button
        onClick={onBack}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#57534e',
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '24px',
        }}
      >
        <ArrowLeft size={13} />
        BACK TO PARTICIPANTS
      </button>

      {/* Top Two Cards: Participant Profile | Standing */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        marginBottom: '36px',
      }}>
        {/* Profile Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e7e5e4',
          borderRadius: '12px',
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          boxShadow: '0 2px 8px -2px rgba(0,0,0,0.03)',
        }}>
          {/* Avatar */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #e7e5e4 0%, #d6d3d1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
            border: '2px solid #ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: '#292524',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
            }}>
              {attempt.participant_name?.charAt(0) || 'P'}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '24px',
                fontWeight: 800,
                color: '#1c1917',
              }}>
                {attempt.participant_name}
              </h2>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                background: '#f5f5f4',
                color: '#57534e',
                border: '1px solid #e7e5e4',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                ACTIVE PARTICIPANT
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', fontSize: '13px', color: '#78716c' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={13} color="#a8a29e" />
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: showPhone ? '#166534' : 'inherit' }}>
                  {showPhone ? attempt.phone_number : attempt.masked_phone}
                </span>
                <button
                  onClick={() => setShowPhone(!showPhone)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent-gold)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    textDecoration: 'underline',
                    padding: '0 2px',
                  }}
                >
                  {showPhone ? 'Mask' : 'Reveal'}
                </button>
                <button
                  onClick={() => handleCopy(attempt.phone_number)}
                  style={{
                    background: '#f5f5f4',
                    border: '1px solid #e7e5e4',
                    borderRadius: '4px',
                    color: copied ? '#16a34a' : '#78716c',
                    cursor: 'pointer',
                    fontSize: '10px',
                    padding: '2px 6px',
                  }}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Standing Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e7e5e4',
          borderRadius: '12px',
          padding: '20px 24px',
          boxShadow: '0 2px 8px -2px rgba(0,0,0,0.03)',
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#78716c',
            marginBottom: '12px',
          }}>
            ACADEMIC STANDING
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
            <div style={{ borderRight: '1px solid #e7e5e4', paddingRight: '8px' }}>
              <span style={{ fontSize: '11px', color: '#a8a29e', display: 'block' }}>Score</span>
              <strong style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', color: isPerfect ? '#16a34a' : '#1c1917' }}>
                {attempt.score} / 4
              </strong>
            </div>
            <div style={{ borderRight: '1px solid #e7e5e4', paddingRight: '8px' }}>
              <span style={{ fontSize: '11px', color: '#a8a29e', display: 'block' }}>Time</span>
              <strong style={{ fontSize: '16px', fontFamily: 'var(--font-mono)', color: '#1c1917' }}>
                {attempt.submission_time_formatted || '—'}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#a8a29e', display: 'block' }}>Accuracy</span>
              <strong style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)' }}>
                {Math.round((attempt.score / 4) * 100)}%
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Quiz Breakdown Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e7e5e4',
        paddingBottom: '12px',
        marginBottom: '28px',
      }}>
        <div>
          <h3 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '22px',
            fontWeight: 800,
            color: '#1c1917',
          }}>
            Latest Quiz Breakdown
          </h3>
          <p style={{ fontSize: '12px', color: '#78716c', marginTop: '2px' }}>
            Module: Daily Reading Comprehension • Submitted at {attempt.submission_time_formatted}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '22px',
            fontWeight: 800,
            color: isPerfect ? '#16a34a' : '#1c1917',
          }}>
            {attempt.score}/4
          </span>
          <span style={{ fontSize: '11px', color: '#a8a29e', textTransform: 'uppercase', display: 'block', letterSpacing: '0.04em' }}>
            SCORE
          </span>
        </div>
      </div>

      {/* Question Cards Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {attempt.answers?.map((ans, idx) => {
          const isCorrect = ans.is_correct;

          return (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: '8px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 2px 6px -1px rgba(0,0,0,0.02)',
              }}
            >
              {/* Left Vertical Colored Accent Stripe */}
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '6px',
                background: isCorrect ? '#1c1917' : '#dc2626',
              }} />

              <div style={{ padding: '24px 28px 24px 34px' }}>
                {/* Question Header with Number Icon */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: '1px solid #e7e5e4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#78716c',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}>
                    {ans.question_number || idx + 1}
                  </div>

                  <h4 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '16px',
                    fontWeight: 700,
                    lineHeight: 1.5,
                    color: '#1c1917',
                  }}>
                    {ans.question_text}
                  </h4>
                </div>

                {/* Answer Boxes */}
                {isCorrect ? (
                  /* Single Gold / Beige Correct Box */
                  <div style={{
                    background: '#fefce8',
                    border: '1px solid #fef08a',
                    borderRadius: '6px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#fef9c3',
                      border: '1.5px solid #ca8a04',
                      color: '#854d0e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}>
                      <Check size={12} strokeWidth={3} />
                    </div>

                    <div>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: '#854d0e',
                        display: 'block',
                        marginBottom: '4px',
                      }}>
                        SELECTED & CORRECT ANSWER
                      </span>
                      <p style={{ fontSize: '14px', color: '#713f12', lineHeight: 1.5 }}>
                        Option {ans.selected_key}: {ans.selected_text}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Two Boxes: Red Selected + Cyan/Green Correct */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Red Selected Incorrect Box */}
                    <div style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#fee2e2',
                        border: '1.5px solid #dc2626',
                        color: '#b91c1c',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}>
                        <XCircle size={14} />
                      </div>

                      <div>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: '#b91c1c',
                          display: 'block',
                          marginBottom: '4px',
                        }}>
                          SELECTED ANSWER
                        </span>
                        <p style={{ fontSize: '14px', color: '#991b1c', lineHeight: 1.5 }}>
                          Option {ans.selected_key}: {ans.selected_text}
                        </p>
                      </div>
                    </div>

                    {/* Correct Answer Box */}
                    {ans.correct_option && (
                      <div style={{
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '6px',
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                      }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#dcfce7',
                          border: '1.5px solid #16a34a',
                          color: '#15803d',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}>
                          <Check size={12} strokeWidth={3} />
                        </div>

                        <div>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: '#15803d',
                            display: 'block',
                            marginBottom: '4px',
                          }}>
                            CORRECT ANSWER
                          </span>
                          <p style={{ fontSize: '14px', color: '#14532d', lineHeight: 1.5 }}>
                            Option {ans.correct_option.key}: {ans.correct_option.text}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
