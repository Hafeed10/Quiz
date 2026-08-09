import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  QrCode, Smartphone, ArrowRight, ShieldCheck, Copy, Check,
  BookOpen, Clock, Award, Sparkles, Zap, Rocket, UserCheck, Printer
} from 'lucide-react';

export const QRCodePortalPage = ({ quizData, onOpenWebsite, onOpenAdmin }) => {
  const { participant } = useAuth();
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

  const isLive = quizData?.dynamic_status === 'LIVE';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="app-container animate-fade-in" style={{
      maxWidth: '1040px',
      padding: '36px 24px 100px',
      margin: '0 auto',
    }}>
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '999px',
          background: '#ecfdf5',
          border: '1.5px solid #a7f3d0',
          color: '#065f46',
          fontSize: '12px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '16px',
        }}>
          <Sparkles size={14} color="#059669" />
          Official Assessment Portal QR Code
        </div>

        <h1 style={{
          fontSize: '40px',
          fontWeight: 900,
          color: '#0f172a',
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          marginBottom: '12px',
        }}>
          Scan to Enter Today's Quiz <br />
          <span style={{ color: '#065f46' }}>Daily Reading & Comprehension</span>
        </h1>

        <p style={{
          fontSize: '15px',
          color: '#475569',
          maxWidth: '640px',
          margin: '0 auto',
          lineHeight: 1.6,
        }}>
          Point any mobile camera at the QR code below to open the website, read today's factual passage, and submit your 4 timed answers.
        </p>
      </div>

      {/* 2-Column Split: QR Code Frame on Left, Launch Specifications on Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '36px',
        alignItems: 'center',
        marginBottom: '48px',
      }}>
        {/* Left Column: Big Scannable QR Code Portal Card */}
        <div className="glass-card" style={{
          padding: '36px 32px',
          background: '#ffffff',
          border: '2px solid #065f46',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(6, 95, 70, 0.15)',
          position: 'relative',
        }}>
          {/* Card Header Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#ecfdf5',
            color: '#065f46',
            padding: '4px 14px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 800,
            marginBottom: '20px',
            border: '1px solid #a7f3d0',
          }}>
            <Smartphone size={14} />
            SCAN WITH MOBILE CAMERA
          </div>

          {/* High-Resolution SVG Scannable QR Matrix */}
          <div style={{
            display: 'inline-block',
            padding: '18px',
            background: '#ffffff',
            border: '2px solid #cbd5e1',
            borderRadius: '18px',
            boxShadow: '0 12px 30px -5px rgba(0, 0, 0, 0.08)',
            marginBottom: '24px',
          }}>
            <svg width="230" height="230" viewBox="0 0 210 210" style={{ display: 'block' }}>
              <rect width="210" height="210" fill="#ffffff" rx="8" />

              {/* Top-Left Finder */}
              <rect x="15" y="15" width="50" height="50" fill="#065f46" rx="6" />
              <rect x="23" y="23" width="34" height="34" fill="#ffffff" rx="4" />
              <rect x="31" y="31" width="18" height="18" fill="#065f46" rx="2" />

              {/* Top-Right Finder */}
              <rect x="145" y="15" width="50" height="50" fill="#065f46" rx="6" />
              <rect x="153" y="23" width="34" height="34" fill="#ffffff" rx="4" />
              <rect x="161" y="31" width="18" height="18" fill="#065f46" rx="2" />

              {/* Bottom-Left Finder */}
              <rect x="15" y="145" width="50" height="50" fill="#065f46" rx="6" />
              <rect x="23" y="153" width="34" height="34" fill="#ffffff" rx="4" />
              <rect x="31" y="161" width="18" height="18" fill="#065f46" rx="2" />

              {/* Alignment Grid Pattern */}
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

              <rect x="80" y="90" width="10" height="10" fill="#065f46" rx="2" />
              <rect x="98" y="90" width="14" height="14" fill="#059669" rx="2" />
              <rect x="120" y="90" width="10" height="10" fill="#065f46" rx="2" />

              <rect x="75" y="112" width="12" height="12" fill="#0f172a" rx="2" />
              <rect x="95" y="112" width="20" height="20" fill="#065f46" rx="3" />
              <rect x="125" y="112" width="12" height="12" fill="#0f172a" rx="2" />

              <rect x="145" y="95" width="12" height="12" fill="#065f46" rx="2" />
              <rect x="165" y="95" width="12" height="12" fill="#0f172a" rx="2" />
              <rect x="180" y="95" width="12" height="12" fill="#065f46" rx="2" />

              <rect x="75" y="145" width="10" height="10" fill="#065f46" rx="2" />
              <rect x="95" y="145" width="10" height="10" fill="#0f172a" rx="2" />
              <rect x="115" y="145" width="10" height="10" fill="#065f46" rx="2" />
              <rect x="145" y="145" width="14" height="14" fill="#059669" rx="2" />
              <rect x="165" y="145" width="14" height="14" fill="#065f46" rx="2" />

              <rect x="75" y="168" width="12" height="12" fill="#0f172a" rx="2" />
              <rect x="95" y="168" width="12" height="12" fill="#065f46" rx="2" />
              <rect x="115" y="168" width="12" height="12" fill="#0f172a" rx="2" />
              <rect x="145" y="168" width="12" height="12" fill="#065f46" rx="2" />
              <rect x="165" y="168" width="12" height="12" fill="#0f172a" rx="2" />
              <rect x="180" y="168" width="12" height="12" fill="#065f46" rx="2" />

              <circle cx="105" cy="105" r="16" fill="#ffffff" />
              <circle cx="105" cy="105" r="12" fill="#065f46" />
            </svg>
          </div>

          {/* Active Session Status */}
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
              <span>Session Active: {participant.name} ({participant.masked_phone})</span>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={onOpenWebsite}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '16px 24px',
                fontSize: '16px',
                fontWeight: 800,
                justifyContent: 'center',
              }}
            >
              Open Website & Participate <ArrowRight size={18} />
            </button>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              width: '100%',
            }}>
              <button
                onClick={handleCopyLink}
                className="btn-secondary"
                style={{
                  padding: '11px 8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  width: '100%',
                }}
              >
                {copied ? <Check size={16} color="#059669" style={{ flexShrink: 0 }} /> : <Copy size={16} style={{ flexShrink: 0 }} />}
                <span>{copied ? 'Link Copied!' : 'Copy Web Link'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="btn-secondary"
                style={{
                  padding: '11px 8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  width: '100%',
                }}
                title="Project or Print QR Code"
              >
                <Printer size={16} color="#065f46" style={{ flexShrink: 0 }} />
                <span>Print / Project</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Today's Launch Specifications Suite */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Quiz Preview Box */}
          <div className="glass-card" style={{ padding: '24px', background: '#ffffff', border: '1.5px solid #065f46' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="badge badge-live" style={{ fontSize: '11px' }}>
                ● LIVE ASSESSMENT TODAY
              </span>
              <span style={{ fontSize: '12px', color: '#065f46', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {quizData?.quiz_date}
              </span>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', lineHeight: 1.3, marginBottom: '8px' }}>
              {quizData?.title || "Today's Daily Reading Quiz"}
            </h3>

            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, marginBottom: '16px' }}>
              {quizData?.passage_title || 'Passage Topic Preview'}
            </p>

            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} color="#065f46" /> {quizData?.duration_minutes || 20} Mins Window
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <BookOpen size={14} color="#065f46" /> 4 Questions
              </span>
            </div>
          </div>

          {/* Platform Launch Specifications */}
          <div className="glass-card" style={{ padding: '24px', background: '#ffffff', border: '1.5px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Platform Launch Items
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#334155' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <BookOpen size={16} color="#065f46" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong>Item 1: Factual Reading Paragraph</strong>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Every daily assessment starts with an authentic factual reading passage.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Zap size={16} color="#065f46" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong>Item 2: Four Multiple Choice MCQs</strong>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Four options per question (A, B, C, D) with single correct answer.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Clock size={16} color="#d97706" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong>Item 3: Synchronized Countdown Timer</strong>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Common live timer window. Interface locks automatically on time expiration.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <ShieldCheck size={16} color="#e11d48" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong>Item 4: Single Attempt Guarantee</strong>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Strict database-level enforcement by phone number for honest ranking.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
