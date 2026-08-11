import React from 'react';
import { Home, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MobileBottomNav = ({ currentView, setCurrentView, openLoginModal, isQuizOpen }) => {
  const { participant } = useAuth();

  // Hide bottom nav during active quiz to keep participant focused
  if (isQuizOpen) return null;

  // Hide bottom nav on admin dashboard
  if (currentView === 'admin') return null;

  const tabs = [
    {
      key: 'launch',
      label: 'Home',
      icon: <Home size={19} />,
      onClick: () => setCurrentView('launch'),
    },
    {
      key: 'participant',
      label: 'Quiz',
      icon: <ClipboardList size={19} />,
      onClick: () => setCurrentView('participant'),
    },
  ];

  return (
    <nav
      className="mobile-bottom-nav"
      aria-label="Mobile App Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
      }}
    >
      <div className="mobile-bottom-nav-inner">
        {tabs.map((tab) => {
          const isActive = currentView === tab.key;

          return (
            <button
              key={tab.key}
              className={`mobile-nav-btn${isActive ? ' active' : ''}`}
              onClick={tab.onClick}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="mobile-nav-icon">
                {tab.icon}
              </span>
              <span className="mobile-nav-label">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
