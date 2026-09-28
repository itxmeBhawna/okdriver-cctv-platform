import { useState } from 'react';
import client from '../api/client';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await client.post('/api/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      onLogin(response.data);
    } catch (err) {
      console.error(err.response?.data);

      const detail = err.response?.data?.detail;
      setError(
        Array.isArray(detail) ? detail[0]?.msg : detail || 'Login failed'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-sm p-6 rounded-lg shadow space-y-4"
      >
        <h1 className="text-xl font-bold text-slate-900">
          okDriver CCTV Platform
        </h1>
        <p className="text-sm text-slate-500">Sign in to continue</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-2 rounded">
            {error}
          </div>
        )}

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border rounded p-2 w-full"
          autoComplete="username"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded p-2 w-full"
          autoComplete="current-password"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white w-full py-2 rounded-lg font-semibold disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}