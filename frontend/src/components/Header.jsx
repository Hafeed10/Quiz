import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, ShieldCheck, LogOut, Lock, User, Clock, Phone } from 'lucide-react';

export const Header = ({ currentView, setCurrentView, openLoginModal, isQuizOpen = false }) => {
  const { participant, logoutParticipant, isAdmin, logoutAdmin } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const userInitial = participant?.name ? participant.name.charAt(0).toUpperCase() : 'U';

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={{
      borderBottom: 'none',
      background: 'transparent',
      position: 'relative',
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px 20px 10px',
        paddingTop: 'max(24px, calc(env(safe-area-inset-top, 0px) + 18px))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Left: Brand Logo & Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* Logo */}
          <div
            onClick={() => {
              if (!isQuizOpen) setCurrentView('launch');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '19px',
              fontWeight: 800,
              color: '#0f172a',
              cursor: isQuizOpen ? 'default' : 'pointer',
            }}
          >
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: '#065f46',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(6, 95, 70, 0.3)',
            }}>
              <BookOpen size={19} />
            </div>
            <span>Quiz <span style={{ color: '#059669' }}>Bazar</span></span>
          </div>

          {/* Admin Badge if on Admin view */}
          {currentView === 'admin' && (
            <span style={{
              background: '#f1f5f9',
              color: '#334155',
              fontSize: '11px',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              border: '1px solid #e2e8f0',
            }}>
              Admin Console
            </span>
          )}
        </div>

        {/* Right: Participant Info & Desktop Actions */}
        <div className="header-admin-controls" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Active Quiz Badge (Small & Compact) */}
          {isQuizOpen && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              fontSize: '11px',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '999px',
              whiteSpace: 'nowrap',
              marginRight: '4px',
            }}>
              <Clock size={11} color="#059669" />
              <span>Timed Quiz</span>
            </span>
          )}

          {/* Participant Identification Avatar — clickable popup for Name, Phone & Logout */}
          {currentView !== 'admin' && participant ? (
            <div ref={profileMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                title="View profile & account"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: showProfileMenu ? '#ecfdf5' : '#f8fafc',
                  padding: '3px',
                  borderRadius: '999px',
                  border: showProfileMenu ? '2px solid #059669' : '1.5px solid #cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#065f46',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '12px',
                  overflow: 'hidden',
                }}>
                  {participant.photo ? (
                    <img src={participant.photo} alt={participant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    userInitial
                  )}
                </div>
              </button>

              {/* Floating Profile & Logout Dropdown Menu */}
              {showProfileMenu && (
                <div
                  className="glass-card animate-fade-in"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: '240px',
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1.5px solid #e2e8f0',
                    boxShadow: '0 14px 36px rgba(6, 95, 70, 0.12)',
                    padding: '16px',
                    zIndex: 9999,
                    textAlign: 'left',
                  }}
                >
                  {/* Participant Name & Phone */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: '#065f46',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '15px',
                      overflow: 'hidden',
                      border: '2px solid #059669',
                      flexShrink: 0,
                    }}>
                      {participant.photo ? (
                        <img src={participant.photo} alt={participant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        userInitial
                      )}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {participant.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {participant.phone_number || participant.masked_phone}
                      </div>
                    </div>
                  </div>

                  <div style={{ height: '1px', background: '#f1f5f9', margin: '0 -16px 12px' }} />

                  {/* Logout Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      logoutParticipant();
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#dc2626',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fee2e2')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#fef2f2')}
                  >
                    <LogOut size={15} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            !isQuizOpen && currentView !== 'admin' && (
              <button
                onClick={openLoginModal}
                title="Sign In"
                aria-label="Sign In"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  color: '#065f46',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.15s ease',
                }}
              >
                <User size={18} />
              </button>
            )
          )}

          {/* Admin Controls — shown when viewing admin page */}
          {!isQuizOpen && currentView === 'admin' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setCurrentView('participant')}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600 }}
                title="Switch to Participant Portal"
              >
                View Portal
              </button>

              {isAdmin && (
                <>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    color: '#065f46',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '999px',
                  }}>
                    <ShieldCheck size={13} color="#059669" />
                    Admin Verified
                  </span>
                  <button
                    onClick={logoutAdmin}
                    className="btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '11px', fontWeight: 700 }}
                    title="Logout Admin"
                  >
                    <Lock size={12} />
                    Logout
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
