import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import client from './api/client';
import CameraRegistry from './pages/CameraRegistry';
import Watchlist from "./pages/Watchlist";
import Alerts from "./pages/Alerts";
import Events from "./pages/Events";
import Dashboard from "./pages/Dashboard";
import VehicleTrace from "./pages/VehicleTrace";
import LiveFeeds from "./pages/LiveFeeds";
import Login from './pages/Login';


export default function App() {
  const [session, setSession] = useState(null);

  function handleLogin(data) {
    client.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;
    setSession(data);
  }

  function handleLogout() {
    delete client.defaults.headers.common.Authorization;
    setSession(null);
  }

  function protectedPage(element) {
    return session ? element : <Navigate to="/login" replace />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              okDriver CCTV Platform
            </span>
            <nav className="flex space-x-6">
              {session && <>
              <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Dashboard
              </Link>
              <Link to="/cameras" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Camera Registry
              </Link>
              <Link to="/watchlist" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Watchlist
              </Link>
              <Link to="/alerts" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Alerts
              </Link>
              <Link to="/events" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Events
              </Link>
              <Link to="/trace" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Vehicle Trace
              </Link>
              <Link to="/feeds" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Live Feeds
              </Link>
              </>}
            </nav>
            {session && (
              <div className="flex items-center gap-3 text-sm">
                <span>{session.user.username} ({session.user.role})</span>
                <button onClick={handleLogout} className="text-slate-600 hover:text-slate-900">Sign out</button>
              </div>
            )}
          </div>
        </header>

        <main className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/login" element={session ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} />
            <Route path="/" element={protectedPage(<Dashboard accessToken={session?.access_token} />)} />
            <Route path="/cameras" element={protectedPage(<CameraRegistry />)} />
            <Route path="/watchlist" element={protectedPage(<Watchlist />)} />
            <Route path="/alerts" element={protectedPage(<Alerts accessToken={session?.access_token} />)} />
            <Route path="/events" element={protectedPage(<Events />)} />
            <Route path="/trace" element={protectedPage(<VehicleTrace />)} />
            <Route path="/feeds" element={protectedPage(<LiveFeeds />)} />
            <Route path="*" element={<Navigate to={session ? "/" : "/login"} replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
