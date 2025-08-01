import React, { useEffect, useState } from 'react';

const API_URL = 'http://localhost:5000/api';

export default function VerifyEmail() {
  const [status, setStatus] = useState('Verifying...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) {
      setStatus('Invalid verification link.');
      return;
    }
    fetch(`${API_URL}/verify-email?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus('Email verified! You can now log in.');
        } else {
          setStatus(data.error || 'Verification failed.');
        }
      })
      .catch(() => setStatus('Verification failed.'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <div className="bg-white rounded-xl p-8 shadow text-center">
        <h2 className="text-2xl font-bold mb-4">Email Verification</h2>
        <p>{status}</p>
      </div>
    </div>
  );
}
