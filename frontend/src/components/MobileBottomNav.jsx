import React from 'react';
import { Home, ClipboardList, History, Settings } from 'lucide-react';
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
      label: 'Assessments',
      icon: <ClipboardList size={19} />,
      onClick: () => setCurrentView('participant'),
    },
    {
      key: 'history',
      label: 'History',
      icon: <History size={19} />,
      onClick: () => {
        if (!participant) {
          openLoginModal();
        } else {
          setCurrentView('participant');
        }
      },
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <Settings size={19} />,
      onClick: () => openLoginModal(),
    },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile App Navigation">
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
