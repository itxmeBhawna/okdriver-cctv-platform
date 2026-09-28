import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import CameraMap from '../components/CameraMap';
import AddCameraForm from '../components/AddCameraForm';

const STATUS_DOT = { online: 'bg-green-500', offline: 'bg-gray-400', degraded: 'bg-yellow-400' };

function formatHeartbeat(dt) {
  return dt ? new Date(dt).toLocaleString() : '—';
}

export default function CameraRegistry() {
  const [cameras, setCameras] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchCameras = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await client.get('/api/cameras', { params });
      setCameras(res.data);
    } catch (err) {
      console.error('Failed to fetch cameras', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchCameras(); }, [fetchCameras]);

  async function handleDisable(cameraId) {
    if (!window.confirm(`Disable camera ${cameraId}?`)) return;
    try {
      await client.patch(`/api/cameras/${cameraId}/disable`);
      fetchCameras();
    } catch (err) {
      console.error('Failed to disable camera', err);
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Camera Registry</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Camera'}
        </button>
      </div>

      {showForm && (
        <AddCameraForm
          onSuccess={() => { setShowForm(false); fetchCameras(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <CameraMap cameras={cameras} />

      <div className="flex gap-3 items-center">
        <input
          type="text"
          placeholder="Search by name or ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="degraded">Degraded</option>
        </select>
        {loading && <span className="text-sm text-slate-400">Loading…</span>}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-left">
            <tr>
              {['ID', 'Name', 'Department', 'Status', 'Zone', 'Last Heartbeat', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {cameras.map((cam) => (
              <tr key={cam.camera_id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono text-slate-700">{cam.camera_id}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{cam.name}</td>
                <td className="px-4 py-3 text-slate-600">{cam.department}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[cam.status] ?? 'bg-gray-400'}`} />
                    <span className="capitalize text-slate-700">{cam.status}</span>
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{cam.zone ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500">{formatHeartbeat(cam.last_heartbeat)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDisable(cam.camera_id)}
                    className="text-xs px-3 py-1 text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                  >
                    Disable
                  </button>
                </td>
              </tr>
            ))}
            {!loading && cameras.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">No cameras found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
