import React from 'react';
import { QrCode, BookOpen, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MobileBottomNav = ({ currentView, setCurrentView, openLoginModal, isQuizOpen }) => {
  const { participant } = useAuth();

  // Hide bottom nav during active quiz to keep participant focused
  if (isQuizOpen) return null;

  // Hide bottom nav entirely on the admin page
  if (currentView === 'admin') return null;

  const tabs = [
    {
      key: 'launch',
      label: 'QR Portal',
      icon: <QrCode size={20} />,
    },
    {
      key: 'participant',
      label: 'Quiz',
      icon: <BookOpen size={20} />,
    },
    {
      key: 'profile',
      label: participant ? participant.name.split(' ')[0] : 'Sign In',
      icon: <User size={20} />,
      onClick: () => {
        if (!participant) openLoginModal();
        else setCurrentView('participant');
      },
    },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <div className="mobile-bottom-nav-inner">
        {tabs.map((tab) => {
          const isActive = currentView === tab.key;
          const handleClick = tab.onClick || (() => setCurrentView(tab.key));

          return (
            <button
              key={tab.key}
              className={`mobile-nav-btn${isActive ? ' active' : ''}`}
              onClick={handleClick}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="mobile-nav-icon">
                {tab.icon}
              </span>
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
