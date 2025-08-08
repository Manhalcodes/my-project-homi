import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import JournalEntry from "./components/JournalEntry";
import EntryList from "./components/EntryList";
import VerifyEmail from "./VerifyEmail";
import RequestReset from "./RequestReset";
import ResetPassword from "./ResetPassword";
import { Heart, Leaf, Calendar, Edit3, User, Lock, Mail, Home, BookOpen, TrendingUp, MessageCircle, Award, Plus, ArrowRight, Sparkles } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL; 

function App() {
  const [user, setUser] = useState(() => {
    // Try to load user and token from localStorage
    const stored = localStorage.getItem('homi_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('homi_token') || '');
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [checkInStreak, setCheckInStreak] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authData, setAuthData] = useState({ name: '', email: '', password: '' });
  const [aiResponse, setAiResponse] = useState('');
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [showVerifyMsg, setShowVerifyMsg] = useState(false);
  const [showReset, setShowReset] = useState(false);

  // Simple routing for verification and reset
  const pathname = window.location.pathname;
  if (pathname === '/verify-email') return <VerifyEmail />;
  if (pathname === '/reset-password') return <ResetPassword />;

  useEffect(() => {
    // Fetch entries if logged in
    if (user) {
      fetch(`${API_URL}/entries`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setEntries(data.entries || []));
    }
  }, [user, token]);

  const handleNewEntry = (entry) => setEntries([entry, ...entries]);

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData),
      });
      const data = await response.json();
      if (data.token) {
        setUser({ name: data.name || data.username || 'Friend', email: data.email });
        setToken(data.token);
        localStorage.setItem('homi_user', JSON.stringify({ name: data.name || data.username || 'Friend', email: data.email }));
        localStorage.setItem('homi_token', data.token);
        setShowVerifyMsg(false);
      } else if (data.error && data.error.toLowerCase().includes('verify')) {
        setShowVerifyMsg(true);
      } else {
        alert(data.error || 'Login failed.');
      }
    } catch (error) {
      alert('Network error. Try again.');
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData),
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('homi_user', JSON.stringify(data.user));
        localStorage.setItem('homi_token', data.token);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('homi_user');
    localStorage.removeItem('homi_token');
  };

  const handleGenerateResponse = async () => {
    try {
      setIsGeneratingResponse(true);
      const response = await fetch(`${API_URL}/generate-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ entry: currentEntry }),
      });
      const data = await response.json();
      setAiResponse(data.response);
      setIsGeneratingResponse(false);
    } catch (error) {
      console.error(error);
      setIsGeneratingResponse(false);
    }
  };

  if (showReset) return <RequestReset />;
  return (
    <div className="min-h-screen bg-gradient-to-br from-autumn-light to-autumn-yellow">
      <Navbar user={user} setUser={setUser} />
      <main className="max-w-2xl mx-auto p-4">
        {user ? (
          <>
            <JournalEntry user={user} onNewEntry={handleNewEntry} />
            <EntryList entries={entries} />
          </>
        ) : (
          <div className="text-center mt-16 text-autumn-brown">
            <h2 className="text-3xl font-bold mb-4">Welcome to Homi 🍂</h2>
            <p className="mb-2">Sign in to start your cozy journaling journey.</p>
            {showVerifyMsg && <div className="mb-4 text-orange-700">Please check your email to verify your account before logging in.</div>}
            {/* Your login/register form here, add a "Forgot password?" link: */}
            <button className="text-orange-600 underline mt-2" onClick={() => setShowReset(true)}>Forgot password?</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
