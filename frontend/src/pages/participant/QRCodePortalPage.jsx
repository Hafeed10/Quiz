import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode, Smartphone, ArrowRight, ShieldCheck, Copy, Check,
  BookOpen, Clock, Award, Sparkles, Zap, Rocket, UserCheck, Printer, ExternalLink
} from 'lucide-react';

export const QRCodePortalPage = ({ quizData, onOpenWebsite, onOpenAdmin }) => {
  const { participant } = useAuth();
  const [copied, setCopied] = useState(false);
  const targetUrl = 'https://al-anvar.netlify.app/';

  const isLive = quizData?.dynamic_status === 'LIVE';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
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
          Point any mobile camera at the QR code below to open <strong style={{ color: '#065f46' }}>https://al-anvar.netlify.app/</strong>, read today's factual passage, and submit your 4 timed answers.
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

          {/* Genuine Scannable QR Code */}
          <div style={{
            display: 'inline-block',
            padding: '16px',
            background: '#ffffff',
            border: '2px solid #cbd5e1',
            borderRadius: '18px',
            boxShadow: '0 12px 30px -5px rgba(0, 0, 0, 0.08)',
            marginBottom: '16px',
          }}>
            <QRCodeSVG
              value={targetUrl}
              size={220}
              bgColor="#ffffff"
              fgColor="#065f46"
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Target URL Display */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: '#065f46',
            marginBottom: '20px',
          }}>
            <span>{targetUrl}</span>
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
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{
                width: '100%',
                padding: '16px 24px',
                fontSize: '16px',
                fontWeight: 800,
                justifyContent: 'center',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Open Website & Participate <ExternalLink size={18} />
            </a>

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
                  justifyContent: 'center',
                }}
              >
                {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                {copied ? 'Link Copied!' : 'Copy Web Link'}
              </button>

              <button
                onClick={handlePrint}
                className="btn-secondary"
                style={{
                  padding: '11px 8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  justifyContent: 'center',
                }}
              >
                <Printer size={14} />
                Print / Project
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Launch Protocols & Assessment Rules */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Assessment Parameters Card */}
          <div className="glass-card" style={{ padding: '24px', background: '#ffffff' }}>
            <h3 style={{
              fontSize: '17px',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <Zap size={18} color="#065f46" />
              Assessment Specifications
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Target Portal URL</span>
                <a href={targetUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', fontWeight: 800, color: '#065f46', fontFamily: 'var(--font-mono)' }}>
                  al-anvar.netlify.app
                </a>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Questions</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>4 Standard MCQs</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Time Allowed</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>5 Minutes (Countdown)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Attempts Allowed</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#065f46' }}>1 Attempt Per Phone Number</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Live Status</span>
                <span className={`badge ${isLive ? 'badge-live' : 'badge-completed'}`} style={{ fontSize: '11px' }}>
                  {isLive ? 'ACTIVE NOW' : quizData?.dynamic_status || 'SCHEDULED'}
                </span>
              </div>
            </div>
          </div>

          {/* Participation Steps */}
          <div className="glass-card" style={{ padding: '24px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
              How to Participate in 3 Steps:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#475569' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#065f46', color: '#fff', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</span>
                <span>Open your phone camera and scan the QR code to open <strong>https://al-anvar.netlify.app/</strong>.</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#065f46', color: '#fff', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</span>
                <span>Enter your <strong>Name</strong> and <strong>Phone Number</strong>.</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#065f46', color: '#fff', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</span>
                <span>Read the passage and select your 4 answers before the 5-minute timer expires.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
