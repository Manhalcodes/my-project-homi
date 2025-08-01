import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

export default function RequestReset() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const res = await fetch(`${API_URL}/request-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage('Password reset link sent! Check your email.');
    } else {
      setMessage(data.error || 'Failed to send reset link.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
        <input
          type="email"
          className="w-full p-3 border rounded mb-4"
          placeholder="Your email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-orange-400 text-white py-2 rounded font-semibold"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
        {message && <div className="mt-4 text-orange-700">{message}</div>}
      </form>
    </div>
  );
}
