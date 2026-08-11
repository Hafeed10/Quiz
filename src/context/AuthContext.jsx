import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [participant, setParticipant] = useState(() => {
    try {
      const saved = localStorage.getItem('daily_quiz_participant');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem('daily_quiz_is_admin') === 'true';
    } catch {
      return false;
    }
  });

  const [loading, setLoading] = useState(false);

  const loginParticipant = async (name, phone_number, photo = '') => {
    setLoading(true);
    try {
      const res = await api.authParticipant(name, phone_number, photo);
      if (res.success && res.participant) {
        setParticipant(res.participant);
        localStorage.setItem('daily_quiz_participant', JSON.stringify(res.participant));
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logoutParticipant = () => {
    setParticipant(null);
    localStorage.removeItem('daily_quiz_participant');
  };

  const loginAdmin = (passcode = '') => {
    const clean = String(passcode || '').trim().toLowerCase().replace(/\s+/g, '');
    if (clean === 'admin123' || clean === 'admin' || clean === 'admin1234') {
      setIsAdmin(true);
      localStorage.setItem('daily_quiz_is_admin', 'true');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    localStorage.removeItem('daily_quiz_is_admin');
  };

  return (
    <AuthContext.Provider
      value={{
        participant,
        loginParticipant,
        logoutParticipant,
        isAdmin,
        loginAdmin,
        logoutAdmin,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
