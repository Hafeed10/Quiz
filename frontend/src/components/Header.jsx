import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, ShieldCheck, LogOut, Lock, User, QrCode, Clock } from 'lucide-react';

export const Header = ({ currentView, setCurrentView, openLoginModal, isQuizOpen = false }) => {
  const { participant, logoutParticipant, isAdmin, logoutAdmin } = useAuth();

  const userInitial = participant?.name ? participant.name.charAt(0).toUpperCase() : 'U';

  return (
    <header style={{
      borderBottom: '1px solid #e2e8f0',
      background: '#ffffff',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '14px 20px',
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
            <span>Daily<span style={{ color: '#059669' }}>Quiz</span></span>
          </div>

          {/* Navigation Links — Desktop */}
          {currentView === 'admin' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            </div>
          ) : (
            <nav className="header-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {!isQuizOpen && (
                <button
                  onClick={() => setCurrentView('launch')}
                  style={{
                    background: currentView === 'launch' ? '#ecfdf5' : 'transparent',
                    color: currentView === 'launch' ? '#065f46' : '#475569',
                    fontWeight: currentView === 'launch' ? 700 : 500,
                    fontSize: '13px',
                    padding: '7px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: currentView === 'launch' ? '1px solid #a7f3d0' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <QrCode size={14} color={currentView === 'launch' ? '#065f46' : '#64748b'} />
                  QR Code Portal
                </button>
              )}

              <button
                onClick={() => {
                  if (!isQuizOpen) setCurrentView('participant');
                }}
                style={{
                  background: currentView === 'participant' ? '#ecfdf5' : 'transparent',
                  color: currentView === 'participant' ? '#065f46' : '#475569',
                  fontWeight: currentView === 'participant' ? 700 : 500,
                  fontSize: '13px',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: currentView === 'participant' ? '1px solid #a7f3d0' : '1px solid transparent',
                  cursor: isQuizOpen ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Participant Quiz {isQuizOpen ? '(Active)' : ''}
              </button>
            </nav>
          )}
        </div>

        {/* Mobile Header Right Item */}
        {currentView !== 'admin' && (
          <div className="header-mobile-avatar-wrap">
            {isQuizOpen ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: '#c8f5df',
                color: '#065f46',
                fontSize: '12px',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '999px',
                fontFamily: 'var(--font-mono)',
              }}>
                <Clock size={13} color="#065f46" />
                <span>04:59</span>
              </span>
            ) : (
              <button
                onClick={openLoginModal}
                aria-label="User Account"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#065f46',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(6, 95, 70, 0.25)',
                }}
              >
                {userInitial}
              </button>
            )}
          </div>
        )}

        {/* Right: Participant Info & Desktop Actions */}
        <div className="header-admin-controls" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Active Quiz Session Indicator */}
          {isQuizOpen && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              fontSize: '11px',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '999px',
              marginRight: '6px',
            }}>
              <Clock size={13} color="#059669" />
              Timed Quiz In Progress
            </span>
          )}

          {/* Participant Identification Chip — only visible on public/participant views, hidden in Admin Console */}
          {currentView !== 'admin' && participant ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f8fafc',
                padding: '4px 12px 4px 6px',
                borderRadius: '999px',
                border: '1px solid #e2e8f0',
              }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: '#065f46',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '11px',
                }}>
                  {userInitial}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                    {participant.name}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    {participant.masked_phone}
                  </div>
                </div>
              </div>

              {!isQuizOpen && (
                <button
                  onClick={logoutParticipant}
                  title="Sign out participant"
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#64748b',
                    padding: '6px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={15} />
                </button>
              )}
            </div>
          ) : (
            !isQuizOpen && currentView !== 'admin' && (
              <button
                onClick={openLoginModal}
                className="btn-secondary"
                style={{ padding: '7px 14px', fontSize: '13px' }}
              >
                <User size={14} />
                Sign in with Phone
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
