import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './api/client';
import { Header } from './components/Header';
import { QRCodePortalPage } from './pages/participant/QRCodePortalPage';
import { ParticipantFlowWizard } from './pages/participant/ParticipantFlowWizard';
import { LandingPage } from './pages/participant/LandingPage';
import { DailyQuizPage } from './pages/participant/DailyQuizPage';
import { ParticipantLoginModal } from './pages/participant/ParticipantLoginModal';
import {
  CompletionPage,
  AlreadyCompletedScreen,
  QuizNotStartedScreen,
  QuizEndedScreen,
} from './pages/participant/QuizStatusScreens';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminLogin } from './pages/admin/AdminLogin';

export function App() {
  const { participant, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState('participant'); // 'participant' | 'admin'
  const [participantSubView, setParticipantSubView] = useState('landing'); // 'landing' | 'quiz' | 'completed' | 'already_completed' | 'not_started' | 'ended'
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(true);

  // Sync state from URL hash on initial load and when URL hash changes
  useEffect(() => {
    const syncFromHash = () => {
      const rawHash = (window.location.hash || '').replace('#', '').toLowerCase();
      if (rawHash === 'admin') {
        setCurrentView('admin');
      } else if (rawHash === 'quiz') {
        setCurrentView('participant');
        setParticipantSubView('quiz');
      } else if (rawHash === 'login') {
        setLoginModalOpen(true);
      } else if (rawHash === 'participant' || rawHash === 'home' || rawHash === '') {
        setCurrentView('participant');
        setParticipantSubView('landing');
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  // Update URL hash when switching main views
  const handleViewChange = (view) => {
    setCurrentView(view);
    window.location.hash = `#${view}`;
    if (view === 'participant') {
      setParticipantSubView('landing');
      fetchTodayQuiz();
    }
  };

  // Fetch today's quiz status whenever participant or view changes
  const fetchTodayQuiz = async () => {
    setLoadingQuiz(true);
    try {
      const res = await api.getTodayQuiz(participant?.id);
      setQuizData(res);
    } catch (err) {
      console.error('Error loading today quiz', err);
    } finally {
      setLoadingQuiz(false);
    }
  };

  useEffect(() => {
    fetchTodayQuiz();
  }, [participant]);

  // Handle participant starting today's quiz
  const handleStartQuiz = () => {
    if (!quizData || !quizData.available) {
      setParticipantSubView('not_started');
      window.location.hash = '#participant';
      return;
    }

    if (quizData.has_completed) {
      setParticipantSubView('already_completed');
      window.location.hash = '#participant';
      return;
    }

    const isLive = quizData.dynamic_status === 'LIVE' || quizData.status === 'LIVE';
    if (isLive) {
      setParticipantSubView('quiz');
      window.location.hash = '#quiz';
    } else if (quizData.dynamic_status === 'SCHEDULED' || quizData.status === 'SCHEDULED') {
      setParticipantSubView('not_started');
      window.location.hash = '#participant';
    } else {
      setParticipantSubView('ended');
      window.location.hash = '#participant';
    }
  };

  const handleLoginSuccess = (res) => {
    if (res.has_completed_today) {
      setParticipantSubView('already_completed');
    } else {
      handleStartQuiz();
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Header
        currentView={currentView}
        setCurrentView={handleViewChange}
        openLoginModal={() => {
          setLoginModalOpen(true);
          window.location.hash = '#login';
        }}
        isQuizOpen={currentView === 'participant' && participantSubView === 'quiz'}
      />

      {/* Main Content Body */}
      <main style={{ flex: 1, padding: '16px 0' }}>
        {currentView === 'launch' ? (
          <QRCodePortalPage
            quizData={quizData}
            onOpenWebsite={() => handleViewChange('participant')}
            onOpenAdmin={() => handleViewChange('admin')}
          />
        ) : currentView === 'admin' ? (
          !isAdmin ? (
            <AdminLogin onLoginSuccess={() => {
              setCurrentView('admin');
              window.location.hash = '#admin';
            }} />
          ) : (
            <AdminDashboard />
          )
        ) : (
          /* Participant Portal Views */
          <div>
            {participantSubView === 'landing' && (
              <ParticipantFlowWizard
                quizData={quizData}
                onStartQuiz={handleStartQuiz}
              />
            )}

            {participantSubView === 'quiz' && quizData && (
              <DailyQuizPage
                quiz={quizData}
                onSubmitted={() => {
                  setParticipantSubView('completed');
                  window.location.hash = '#participant';
                  fetchTodayQuiz();
                }}
                onQuizExpired={() => {
                  setParticipantSubView('ended');
                  window.location.hash = '#participant';
                }}
              />
            )}

            {participantSubView === 'completed' && (
              <CompletionPage
                participantName={participant?.name}
                onBackHome={() => {
                  setParticipantSubView('landing');
                  window.location.hash = '#participant';
                }}
              />
            )}

            {participantSubView === 'already_completed' && (
              <AlreadyCompletedScreen
                participantName={participant?.name}
                onBackHome={() => {
                  setParticipantSubView('landing');
                  window.location.hash = '#participant';
                }}
              />
            )}

            {participantSubView === 'not_started' && (
              <QuizNotStartedScreen
                quiz={quizData}
                onBackHome={() => {
                  setParticipantSubView('landing');
                  window.location.hash = '#participant';
                }}
              />
            )}

            {participantSubView === 'ended' && (
              <QuizEndedScreen
                onBackHome={() => {
                  setParticipantSubView('landing');
                  window.location.hash = '#participant';
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* Participant Login Modal */}
      <ParticipantLoginModal
        isOpen={loginModalOpen}
        onClose={() => {
          setLoginModalOpen(false);
          if (window.location.hash === '#login') {
            window.location.hash = `#${currentView}`;
          }
        }}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default App;
