import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Camera,
  Upload,
  User,
  Phone,
  CheckCircle,
  Clock,
  Shield,
  Award,
  AlertCircle,
  HelpCircle,
  Play,
  RotateCcw,
  Check,
  Zap,
  Info
} from 'lucide-react';

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Zack',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Precious',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Milo',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Bella',
];

export const ParticipantFlowWizard = ({
  quizData,
  onStartQuiz,
  initialStep = 1,
}) => {
  const { participant, loginParticipant } = useAuth();

  // step: 1 = Welcome/Logo/Quiz Name, 2 = Participant Form (Phone, Photo, Name), 3 = Rules Page
  const [step, setStep] = useState(initialStep);

  // Form State
  const [name, setName] = useState(participant?.name || '');
  const [phone, setPhone] = useState(participant?.phone_number || '');
  const [photo, setPhoto] = useState(participant?.photo || '');
  const [agreeRules, setAgreeRules] = useState(true);

  // UI state
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupMessage, setLookupMessage] = useState(null);
  const [error, setError] = useState('');
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Sync state if participant context updates
  useEffect(() => {
    if (participant) {
      setName(participant.name || '');
      setPhone(participant.phone_number || '');
      setPhoto(participant.photo || '');
    }
  }, [participant]);

  // Image compression & conversion to lightweight base64 Data URL
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG or PNG).');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 220;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setPhoto(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Phone lookup on blur or 10 digits entered
  const handlePhoneBlur = async () => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length >= 10 && !name) {
      setLookupLoading(true);
      setLookupMessage(null);
      try {
        const res = await api.lookupParticipant(cleanPhone);
        if (res.exists) {
          setName(res.name);
          if (res.photo) setPhoto(res.photo);
          setLookupMessage(`Found account: ${res.name}`);
        }
      } catch {
        // Ignore lookup error
      } finally {
        setLookupLoading(false);
      }
    }
  };

  // Handle Proceed from Step 1 (Welcome) -> Step 2 (Form)
  const handleWelcomeNext = () => {
    setError('');
    setStep(2);
  };

  // Handle Submit on Step 2 (Participation Details Form) -> Step 3 (Rules)
  const handleDetailsSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const cleanName = name.trim();
    const cleanPhone = phone.replace(/\D/g, '');

    if (!cleanPhone || cleanPhone.length < 7 || cleanPhone.length > 15) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!cleanName || cleanName.length < 2) {
      setError('Please enter your full name (minimum 2 characters).');
      return;
    }

    setLoading(true);
    try {
      const res = await loginParticipant(cleanName, cleanPhone, photo);
      if (res.success) {
        if (res.has_completed_today) {
          setError('You have already completed today’s daily quiz session.');
          return;
        }
        setStep(3); // Proceed to Rules Screen
      } else {
        setError(res.message || 'Unable to register participant. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Start Competition on Step 3 (Rules) -> Start Quiz
  const handleStartCompetition = () => {
    if (!agreeRules) {
      setError('Please confirm that you have read and understood the rules.');
      return;
    }
    onStartQuiz();
  };

  return (
    <div className="wizard-container animate-fade-in">
      {/* Visual Step Indicator Banner */}
      <div className="wizard-step-indicator">
        {[
          { num: 1, label: 'Welcome' },
          { num: 2, label: 'Enter Details' },
          { num: 3, label: 'Rules' },
        ].map((item, idx) => (
          <React.Fragment key={item.num}>
            <div
              className="wizard-step-pill"
              style={{
                background: step === item.num ? '#ecfdf5' : '#ffffff',
                border: step === item.num ? '1.5px solid #059669' : '1px solid #e2e8f0',
                color: step === item.num ? '#065f46' : step > item.num ? '#059669' : '#94a3b8',
                fontWeight: step === item.num ? 800 : 600,
              }}
            >
              <span style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: step === item.num ? '#059669' : step > item.num ? '#10b981' : '#e2e8f0',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 800,
                flexShrink: 0,
              }}>
                {step > item.num ? <Check size={12} strokeWidth={3} /> : item.num}
              </span>
              <span>{item.label}</span>
            </div>
            {idx < 2 && (
              <div style={{
                width: '20px',
                height: '2px',
                background: step > item.num ? '#10b981' : '#e2e8f0',
                flexShrink: 0,
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: WELCOME SCREEN (Logo, Quiz Name, Overview, Next Button) */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="wizard-card animate-fade-in" style={{ textAlign: 'center' }}>
          {/* Logo & Brand Header (Transparent & Larger Size) */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '14px',
            background: 'transparent',
            padding: '4px 0',
            marginBottom: '20px',
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(6, 95, 70, 0.25)',
              flexShrink: 0,
            }}>
              <BookOpen size={28} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <span style={{
                fontSize: 'clamp(11px, 2.5vw, 14px)',
                fontWeight: 700,
                color: '#64748b',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '2px',
              }}>AHLUSUFFA</span>
              <span style={{
                fontSize: 'clamp(28px, 6.5vw, 38px)',
                fontWeight: 900,
                color: '#0f172a',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}>
                Quiz <span style={{ color: '#059669' }}>Bazar</span>
              </span>
            </div>
          </div>

          {/* Live Status Badge */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              fontSize: '12px',
              fontWeight: 800,
              padding: '5px 14px',
              borderRadius: '999px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#059669',
                boxShadow: '0 0 8px #059669',
              }} />
              {quizData?.dynamic_status === 'LIVE' ? 'Competition Active' : 'Daily Reading Assessment'}
            </span>
          </div>

          {/* Quiz Name / Title */}
          <h1 style={{
            fontSize: '32px',
            fontWeight: 900,
            color: '#0f172a',
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
            marginBottom: '12px',
          }}>
            {quizData?.title || "Daily Reading & Comprehension Quiz"}
          </h1>

          {/* Passage Topic info */}
          {quizData?.passage_title && (
            <div style={{
              fontSize: '15px',
              color: '#065f46',
              fontWeight: 700,
              background: '#f0fdf4',
              display: 'inline-block',
              padding: '4px 14px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #bbf7d0',
            }}>
              📖 Topic: {quizData.passage_title}
            </div>
          )}

          <p style={{
            fontSize: '15px',
            color: '#475569',
            lineHeight: 1.6,
            maxWidth: '560px',
            margin: '0 auto 28px',
          }}>
            Welcome to today’s reading comprehension competition! Read the passage carefully, answer 4 timed questions, and compete for top honors on the leaderboard.
          </p>

          {/* 4 Pillars Summary 2x2 Grid */}
          <div className="wizard-grid-4">
            {/* Box 1: 1 Passage */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '18px',
              padding: '16px 14px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '125px',
              textAlign: 'left',
            }}>
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

            {/* Box 2: 4 MCQs */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '18px',
              padding: '16px 14px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '125px',
              textAlign: 'left',
            }}>
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
                <CheckCircle size={18} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '3px' }}>
                4 MCQs
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
                4 multiple-choice questions (1 mark each)
              </div>
            </div>

            {/* Box 3: 20 Minutes / Timed */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '18px',
              padding: '16px 14px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '125px',
              textAlign: 'left',
            }}>
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

            {/* Box 4: 1 Attempt */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '18px',
              padding: '16px 14px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '125px',
              textAlign: 'left',
            }}>
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
                <Shield size={18} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '3px' }}>
                1 Attempt
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
                Single fair attempt verified per participant
              </div>
            </div>
          </div>

          {/* Primary Action Button: NEXT */}
          <button
            onClick={handleWelcomeNext}
            className="btn-primary"
            style={{
              width: '100%',
              maxWidth: '420px',
              padding: '15px 24px',
              fontSize: '16px',
              fontWeight: 800,
              borderRadius: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 6px 20px rgba(6, 95, 70, 0.25)',
              cursor: 'pointer',
              minHeight: '48px',
            }}
          >
            <span>Proceed to Participate (Next)</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: PARTICIPATION DETAILS (Phone Number, Photo, Name) - NEW MODEL */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="wizard-card animate-fade-in">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              color: '#065f46',
              fontSize: '12px',
              fontWeight: 800,
              padding: '5px 14px',
              borderRadius: '999px',
              border: '1px solid #a7f3d0',
              boxShadow: '0 2px 8px rgba(6, 95, 70, 0.08)',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              <User size={14} color="#059669" />
              <span>Participant Registration</span>
            </div>
            <h2 style={{ fontSize: 'clamp(24px, 6vw, 32px)', fontWeight: 900, color: '#0f172a', marginBottom: '6px', letterSpacing: '-0.02em' }}>
              Enter Your Information
            </h2>
            <p style={{ fontSize: '14px', color: '#475569', maxWidth: '440px', margin: '0 auto' }}>
              Please enter your phone number, photo, and name to register for today's competition.
            </p>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: '14px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleDetailsSubmit}>
            {/* Single Unified White Card Container (Avatar + Phone + Name) */}
            <div style={{
              background: '#ffffff',
              borderRadius: '24px',
              border: '1.5px solid #e2e8f0',
              padding: '24px 20px 22px',
              boxShadow: '0 8px 24px -4px rgba(6, 95, 70, 0.08)',
              marginBottom: '20px',
            }}>
              {/* 1. Avatar Centerpiece */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '22px',
                paddingBottom: '20px',
                borderBottom: '1px solid #f1f5f9',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', marginBottom: '12px' }}>
                  Profile Photo <span style={{ color: '#64748b', fontWeight: 600 }}>(Optional / പ്രൊഫൈൽ ഫോട്ടോ)</span>
                </div>

                {/* Clickable Photo Preview Frame with Camera Badge */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  title="Click to upload/change photo"
                  style={{
                    position: 'relative',
                    width: '92px',
                    height: '92px',
                    borderRadius: '50%',
                    background: '#f1f5f9',
                    border: '3px solid #059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 8px 22px rgba(6, 95, 70, 0.2)',
                    marginBottom: '12px',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  {photo ? (
                    <img
                      src={photo}
                      alt="Participant avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    />
                  ) : (
                    <User size={46} color="#94a3b8" />
                  )}

                  {/* Floating Camera Action Badge */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: '#065f46',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #ffffff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  }}>
                    <Camera size={14} />
                  </div>
                </div>

                {/* Hidden File Inputs: Gallery & Camera */}
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />

                {/* Upload Action Buttons: Gallery, Camera, Remove */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '12px' }}>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    style={{
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      color: '#065f46',
                      padding: '7px 16px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      minHeight: '38px',
                    }}
                  >
                    <Upload size={15} />
                    <span>Upload from Gallery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      color: '#166534',
                      padding: '7px 16px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      minHeight: '38px',
                    }}
                  >
                    <Camera size={15} />
                    <span>Camera</span>
                  </button>

                  {photo && (
                    <button
                      type="button"
                      onClick={() => setPhoto('')}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        color: '#64748b',
                        padding: '7px 14px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        minHeight: '38px',
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Quick Preset Avatars Picker */}
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                    Or pick a fun avatar:
                  </span>
                  <div className="wizard-avatar-grid">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPhoto(preset)}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          border: photo === preset ? '2.5px solid #059669' : '1.5px solid #e2e8f0',
                          padding: 0,
                          background: '#ffffff',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          transform: photo === preset ? 'scale(1.12)' : 'none',
                          transition: 'all 0.15s ease',
                          boxShadow: photo === preset ? '0 4px 12px rgba(6, 95, 70, 0.25)' : 'none',
                        }}
                      >
                        <img src={preset} alt={`Avatar ${idx + 1}`} style={{ width: '100%', height: '100%' }} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Mobile Phone Number Field */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#1e293b',
                  marginBottom: '6px',
                }}>
                  Mobile Phone Number (ഫോൺ നമ്പർ) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#065f46',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onBlur={handlePhoneBlur}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 48px',
                      fontSize: '16px',
                      borderRadius: '14px',
                      border: '1.5px solid #cbd5e1',
                      background: '#f8fafc',
                      outline: 'none',
                      fontFamily: 'inherit',
                      minHeight: '50px',
                    }}
                  />
                </div>
                {lookupLoading && (
                  <div style={{ fontSize: '12px', color: '#059669', marginTop: '6px', fontWeight: 600 }}>
                    🔍 Checking existing account...
                  </div>
                )}
                {lookupMessage && !lookupLoading && (
                  <div style={{ fontSize: '12px', color: '#059669', marginTop: '6px', fontWeight: 700 }}>
                    ✓ {lookupMessage}
                  </div>
                )}
              </div>

              {/* 3. Full Name Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#1e293b',
                  marginBottom: '6px',
                }}>
                  Full Name (പേര്) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#065f46',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 48px',
                      fontSize: '16px',
                      borderRadius: '14px',
                      border: '1.5px solid #cbd5e1',
                      background: '#f8fafc',
                      outline: 'none',
                      fontFamily: 'inherit',
                      minHeight: '50px',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Step 2 Action Buttons: Centered Small Back + Full Width Next */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
            }}>
              {/* Top: Compact Centered Back Button */}
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  padding: '9px 24px',
                  borderRadius: '12px',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  minHeight: '40px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                }}
              >
                <ArrowLeft size={15} />
                <span>Back</span>
              </button>

              {/* Bottom: Full-Width Primary Next Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  borderRadius: '16px',
                  fontSize: '16px',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 24px rgba(6, 95, 70, 0.28)',
                  minHeight: '54px',
                }}
              >
                {loading ? (
                  <span>Registering...</span>
                ) : (
                  <>
                    <span>Next: Competition Rules</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: RULES & GUIDELINES PAGE (Rules, Confirmation, Start Competition) - NEW MODEL */}
      {/* ========================================================================= */}
      {step === 3 && (
        <div className="wizard-card animate-fade-in">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              color: '#065f46',
              fontSize: '12px',
              fontWeight: 800,
              padding: '5px 14px',
              borderRadius: '999px',
              border: '1px solid #a7f3d0',
              boxShadow: '0 2px 8px rgba(6, 95, 70, 0.08)',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              <Shield size={14} color="#059669" />
              <span>Competition Guidelines</span>
            </div>
            <h2 style={{ fontSize: 'clamp(24px, 6vw, 32px)', fontWeight: 900, color: '#0f172a', marginBottom: '6px', letterSpacing: '-0.02em' }}>
              Quiz Competition Rules (നിബന്ധനകൾ)
            </h2>
            <p style={{ fontSize: '14px', color: '#475569', maxWidth: '440px', margin: '0 auto' }}>
              Please read the competition rules carefully before clicking start.
            </p>
          </div>

          {/* Participant Profile Chip Summary */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '18px',
            padding: '14px 18px',
            marginBottom: '24px',
            gap: '12px',
            flexWrap: 'wrap',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: '#065f46',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                fontWeight: 800,
                fontSize: '17px',
                border: '2.5px solid #059669',
                boxShadow: '0 4px 12px rgba(6, 95, 70, 0.2)',
                flexShrink: 0,
              }}>
                {photo ? (
                  <img src={photo} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  name.charAt(0).toUpperCase()
                )}
              </div>
              <div style={{ textAlign: 'left', minWidth: 0 }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {name}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Phone: {phone}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '7px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#065f46',
                cursor: 'pointer',
                minHeight: '38px',
              }}
            >
              Edit Details
            </button>
          </div>

          {/* Detailed Rules List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
            <div style={{
              display: 'flex',
              gap: '14px',
              padding: '16px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #bbf7d0',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: '#059669',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '14px',
                flexShrink: 0,
              }}>
                1
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#065f46', marginBottom: '3px' }}>
                  Read the Factual Passage Carefully (ഖണ്ഡിക ശ്രദ്ധിച്ചു വായിക്കുക)
                </div>
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                  A reading passage containing all key facts will be presented at the top of the quiz. Read every sentence attentively.
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '14px',
              padding: '16px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '14px',
                flexShrink: 0,
              }}>
                2
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '3px' }}>
                  Answer 4 Multiple Choice Questions (4 ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകുക)
                </div>
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                  Select one option (A, B, C, or D) for each question. You can change your choice anytime before submitting.
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '14px',
              padding: '16px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '14px',
                flexShrink: 0,
              }}>
                3
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '3px' }}>
                  Live Countdown Timer (സമയ പരിധി: {quizData?.duration_minutes || 20} മിനിറ്റ്)
                </div>
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                  Keep an eye on the countdown clock. When the timer reaches 0:00, the quiz automatically locks and submits your chosen answers.
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '14px',
              padding: '16px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '14px',
                flexShrink: 0,
              }}>
                4
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '3px' }}>
                  Single Attempt Policy (ഒരു അവസരം മാത്രം)
                </div>
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                  Each registered phone number gets exactly one attempt per daily quiz session. No retakes are allowed.
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '28px',
            padding: '14px 18px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #a7f3d0',
            boxShadow: '0 2px 10px rgba(6, 95, 70, 0.04)',
          }}>
            <input
              type="checkbox"
              id="agree-rules"
              checked={agreeRules}
              onChange={(e) => setAgreeRules(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: '#059669', cursor: 'pointer', flexShrink: 0 }}
            />
            <label htmlFor="agree-rules" style={{ fontSize: '13px', fontWeight: 700, color: '#065f46', cursor: 'pointer' }}>
              I have read and agree to follow the competition rules and guidelines.
            </label>
          </div>

          {/* Action Buttons: Centered Small Back + Full Width Start Assessment */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
          }}>
            {/* Top: Compact Centered Back Button */}
            <button
              type="button"
              onClick={() => setStep(2)}
              style={{
                padding: '9px 24px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                color: '#475569',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                minHeight: '40px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              }}
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>

            {/* Bottom: Full-Width Primary Start Button */}
            <button
              type="button"
              onClick={handleStartCompetition}
              disabled={!agreeRules}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '16px 24px',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: !agreeRules ? 'not-allowed' : 'pointer',
                opacity: !agreeRules ? 0.6 : 1,
                boxShadow: '0 8px 24px rgba(6, 95, 70, 0.28)',
                minHeight: '54px',
              }}
            >
              <Play size={18} />
              <span>Start Live Assessment</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
