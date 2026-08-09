import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  QrCode, Smartphone, ArrowRight, ShieldCheck, Copy, Check,
  BookOpen, Clock, Award, Sparkles, Zap, ChevronLeft, Rocket, Shield, CheckCircle2, UserCheck
} from 'lucide-react';

export const LaunchQRPortal = ({ onProceedToLanding, onProceedToAdmin }) => {
  const { participant } = useAuth();
  // step 1 = 'launch_items', step 2 = 'qr_code'
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="app-container animate-fade-in" style={{
      maxWidth: '860px',
      padding: '40px 24px 100px',
      margin: '0 auto',
    }}>
      {/* Progress Step Indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        marginBottom: '32px',
        fontSize: '12px',
        fontWeight: 800,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: step === 1 ? '#065f46' : '#64748b',
          background: step === 1 ? '#ecfdf5' : '#ffffff',
          padding: '6px 14px',
          borderRadius: '999px',
          border: step === 1 ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
        }}>
          <span style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: step === 1 ? '#065f46' : '#cbd5e1',
            color: '#ffffff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
          }}>1</span>
          Launching Items
        </div>

        <span style={{ color: '#cbd5e1' }}>→</span>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: step === 2 ? '#065f46' : '#64748b',
          background: step === 2 ? '#ecfdf5' : '#ffffff',
          padding: '6px 14px',
          borderRadius: '999px',
          border: step === 2 ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
        }}>
          <span style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: step === 2 ? '#065f46' : '#cbd5e1',
            color: '#ffffff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
          }}>2</span>
          Website QR Code
        </div>

        <span style={{ color: '#cbd5e1' }}>→</span>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#64748b',
          background: '#ffffff',
          padding: '6px 14px',
          borderRadius: '999px',
          border: '1px solid #e2e8f0',
        }}>
          <span style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#cbd5e1',
            color: '#ffffff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
          }}>3</span>
          Open Website
        </div>
      </div>

      {/* =========================================================
          STEP 1: LAUNCHING ITEMS (PLACED BEFORE THE QR CODE)
         ========================================================= */}
      {step === 1 && (
        <div className="animate-fade-in">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '999px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '16px',
            }}>
              <Rocket size={14} color="#059669" />
              STEP 1: LAUNCHING ITEMS BRIEFING
            </div>

            <h1 style={{
              fontSize: '36px',
              fontWeight: 900,
              color: '#0f172a',
              lineHeight: 1.15,
              marginBottom: '12px',
            }}>
              Items Available During Launch
            </h1>

            <p style={{
              fontSize: '15px',
              color: '#475569',
              maxWidth: '620px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}>
              Review the four mandatory platform launch items and assessment rules before generating the scannable website QR code.
            </p>
          </div>

          {/* 4 Launching Item Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
            marginBottom: '36px',
          }}>
            {/* Item 1 */}
            <div className="glass-card" style={{ padding: '24px', background: '#ffffff', border: '1.5px solid #e2e8f0' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
              }}>
                <BookOpen size={22} color="#065f46" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ITEM 1: READING PASSAGE
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '4px 0 8px' }}>
                Factual Paragraph
              </h3>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                Each daily assessment begins with an authentic factual reading passage containing all core answers.
              </p>
            </div>

            {/* Item 2 */}
            <div className="glass-card" style={{ padding: '24px', background: '#ffffff', border: '1.5px solid #e2e8f0' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
              }}>
                <CheckCircle2 size={22} color="#065f46" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ITEM 2: FOUR QUESTIONS
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '4px 0 8px' }}>
                Multiple-Choice MCQs
              </h3>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                Four clear questions with options A, B, C, D. All 4 questions are required before submitting.
              </p>
            </div>

            {/* Item 3 */}
            <div className="glass-card" style={{ padding: '24px', background: '#ffffff', border: '1.5px solid #e2e8f0' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#fffbeb',
                border: '1px solid #fde68a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
              }}>
                <Clock size={22} color="#d97706" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ITEM 3: TIMED WINDOW
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '4px 0 8px' }}>
                Synchronized Timer
              </h3>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                Participants compete under a 5-minute common timer window. Interface locks automatically on expiration.
              </p>
            </div>

            {/* Item 4 */}
            <div className="glass-card" style={{ padding: '24px', background: '#ffffff', border: '1.5px solid #e2e8f0' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
              }}>
                <ShieldCheck size={22} color="#e11d48" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#be123c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ITEM 4: 1 ATTEMPT RULE
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '4px 0 8px' }}>
                Phone-Verified Entry
              </h3>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                Strict database-level enforcement of 1 attempt per phone number for honest leaderboard rankings.
              </p>
            </div>
          </div>

          {/* Action Button: Move from Step 1 (Launching Items) to Step 2 (QR Code) */}
          <div style={{ textAlignment: 'center' }}>
            <button
              onClick={() => setStep(2)}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '16px 28px',
                fontSize: '16px',
                fontWeight: 800,
                justifyContent: 'center',
              }}
            >
              Proceed to Website QR Code <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          STEP 2: WEBSITE QR CODE (PLACED BEFORE LANDING PAGE)
         ========================================================= */}
      {step === 2 && (
        <div className="animate-fade-in">
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <button
              onClick={() => setStep(1)}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#475569',
                fontSize: '12px',
                fontWeight: 700,
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '16px',
              }}
            >
              <ChevronLeft size={14} /> Back to Launching Items
            </button>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '999px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '12px',
            }}>
              <QrCode size={14} color="#059669" />
              STEP 2: WEBSITE SCANNABLE QR CODE
            </div>

            <h1 style={{
              fontSize: '34px',
              fontWeight: 900,
              color: '#0f172a',
              lineHeight: 1.15,
              marginBottom: '8px',
            }}>
              Website QR Code
            </h1>

            <p style={{
              fontSize: '15px',
              color: '#475569',
              maxWidth: '560px',
              margin: '0 auto',
            }}>
              Once scanned with any mobile camera, the website will open immediately.
            </p>
          </div>

          {/* QR Code Showcase Card */}
          <div className="glass-card" style={{
            maxWidth: '520px',
            margin: '0 auto',
            padding: '36px 32px',
            background: '#ffffff',
            border: '2px solid #065f46',
            borderRadius: '20px',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(6, 95, 70, 0.15)',
          }}>
            {/* Scannable SVG QR Code Matrix */}
            <div style={{
              display: 'inline-block',
              padding: '16px',
              background: '#ffffff',
              border: '2px solid #cbd5e1',
              borderRadius: '16px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
              marginBottom: '24px',
            }}>
              <svg width="220" height="220" viewBox="0 0 210 210" style={{ display: 'block' }}>
                <rect width="210" height="210" fill="#ffffff" rx="8" />

                {/* Finder Squares */}
                <rect x="15" y="15" width="50" height="50" fill="#065f46" rx="6" />
                <rect x="23" y="23" width="34" height="34" fill="#ffffff" rx="4" />
                <rect x="31" y="31" width="18" height="18" fill="#065f46" rx="2" />

                <rect x="145" y="15" width="50" height="50" fill="#065f46" rx="6" />
                <rect x="153" y="23" width="34" height="34" fill="#ffffff" rx="4" />
                <rect x="161" y="31" width="18" height="18" fill="#065f46" rx="2" />

                <rect x="15" y="145" width="50" height="50" fill="#065f46" rx="6" />
                <rect x="23" y="153" width="34" height="34" fill="#ffffff" rx="4" />
                <rect x="31" y="161" width="18" height="18" fill="#065f46" rx="2" />

                {/* QR Pattern */}
                <rect x="75" y="18" width="8" height="8" fill="#0f172a" rx="1" />
                <rect x="90" y="18" width="8" height="8" fill="#065f46" rx="1" />
                <rect x="105" y="18" width="8" height="8" fill="#0f172a" rx="1" />
                <rect x="120" y="18" width="8" height="8" fill="#065f46" rx="1" />
                <rect x="75" y="33" width="8" height="8" fill="#065f46" rx="1" />
                <rect x="105" y="33" width="8" height="8" fill="#0f172a" rx="1" />
                <rect x="120" y="33" width="8" height="8" fill="#065f46" rx="1" />

                <rect x="18" y="75" width="8" height="8" fill="#0f172a" rx="1" />
                <rect x="33" y="75" width="8" height="8" fill="#065f46" rx="1" />
                <rect x="48" y="75" width="8" height="8" fill="#0f172a" rx="1" />
                <rect x="63" y="75" width="8" height="8" fill="#065f46" rx="1" />
                <rect x="78" y="75" width="8" height="8" fill="#0f172a" rx="1" />
                <rect x="93" y="75" width="8" height="8" fill="#065f46" rx="1" />
                <rect x="108" y="75" width="8" height="8" fill="#0f172a" rx="1" />
                <rect x="123" y="75" width="8" height="8" fill="#065f46" rx="1" />
                <rect x="138" y="75" width="8" height="8" fill="#0f172a" rx="1" />
                <rect x="153" y="75" width="8" height="8" fill="#065f46" rx="1" />
                <rect x="168" y="75" width="8" height="8" fill="#0f172a" rx="1" />
                <rect x="183" y="75" width="8" height="8" fill="#065f46" rx="1" />

                <circle cx="105" cy="105" r="16" fill="#ffffff" />
                <circle cx="105" cy="105" r="12" fill="#065f46" />
              </svg>
            </div>

            {/* Active Session Indicator */}
            {participant && (
              <div style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                padding: '8px 12px',
                marginBottom: '16px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#065f46',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}>
                <UserCheck size={14} color="#059669" />
                <span>Logged In as {participant.name} ({participant.masked_phone}) — No Login Required!</span>
              </div>
            )}

            {/* Action Buttons: Step 3 (Open Website & Start Quiz) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={onProceedToLanding}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  fontSize: '16px',
                  fontWeight: 800,
                  justifyContent: 'center',
                }}
              >
                {participant ? `Open Website (${participant.name})` : 'Open Website & Start Quiz'} <ArrowRight size={18} />
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleCopyLink}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '10px', fontSize: '12px', justifyContent: 'center' }}
                >
                  {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                  {copied ? 'Link Copied!' : 'Copy Web Link'}
                </button>

                <button
                  onClick={onProceedToAdmin}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '10px', fontSize: '12px', justifyContent: 'center' }}
                >
                  <ShieldCheck size={14} color="#065f46" />
                  Admin Dashboard
                </button>
              </div>
            </div>

            <div style={{ marginTop: '18px', fontSize: '11px', color: '#64748b' }}>
              Target Web URL: <strong style={{ color: '#0f172a', fontFamily: 'var(--font-mono)' }}>{currentUrl}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
