import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import CameraRegistry from './pages/CameraRegistry';
import Watchlist from "./pages/Watchlist";
import Alerts from "./pages/Alerts";
import Events from "./pages/Events";
import Dashboard from "./pages/Dashboard";
import VehicleTrace from "./pages/VehicleTrace";
import LiveFeeds from "./pages/LiveFeeds";


export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              okDriver CCTV Platform
            </span>
            <nav className="flex space-x-6">
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

            </nav>
          </div>
        </header>

        <main className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cameras" element={<CameraRegistry />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/events" element={<Events />} />
            <Route path="/trace" element={<VehicleTrace />} />
            <Route path="/feeds" element={<LiveFeeds />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
