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
      const response = await client.post('/api/auth/login', { username, password });
      onLogin(response.data);
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white border border-slate-200 rounded-lg p-6 space-y-4">
        <h1 className="text-xl font-bold text-slate-900">Sign in</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <label className="block text-sm text-slate-700">
          Username
          <input
            className="mt-1 w-full border border-slate-300 rounded px-3 py-2"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </label>
        <label className="block text-sm text-slate-700">
          Password
          <input
            className="mt-1 w-full border border-slate-300 rounded px-3 py-2"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <button
          className="w-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}