import React, { useState } from 'react';

const API_URL = 'http://localhost:5000/api';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const res = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage('Password reset! You can now log in.');
    } else {
      setMessage(data.error || 'Failed to reset password.');
    }
    setLoading(false);
  };

  if (!token) return <div className="min-h-screen flex items-center justify-center bg-orange-50"><div className="bg-white rounded-xl p-8 shadow">Invalid reset link.</div></div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Set New Password</h2>
        <input
          type="password"
          className="w-full p-3 border rounded mb-4"
          placeholder="New password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-orange-400 text-white py-2 rounded font-semibold"
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
        {message && <div className="mt-4 text-orange-700">{message}</div>}
      </form>
    </div>
  );
}
