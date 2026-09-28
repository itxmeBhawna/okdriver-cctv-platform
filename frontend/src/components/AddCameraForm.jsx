import { useState } from 'react';
import client from '../api/client';

const INITIAL = {
  camera_id: '',
  name: '',
  department: '',
  latitude: '',
  longitude: '',
  camera_type: 'traffic_junction',
  source_protocol: 'RTSP',
  stream_endpoint: '',
  status: 'offline',
  zone: '',
};

export default function AddCameraForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState('');

  function onChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await client.post('/api/cameras', {
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        stream_endpoint: form.stream_endpoint || null,
        zone: form.zone || null,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Failed to create camera');
    }
  }

  const inp = 'w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500';
  const lbl = 'block text-xs font-medium text-slate-600 mb-1';

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
      <h2 className="font-semibold text-slate-800">Add Camera</h2>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-2 gap-4">
        <div><label className={lbl}>Camera ID *</label><input className={inp} name="camera_id" value={form.camera_id} onChange={onChange} required /></div>
        <div><label className={lbl}>Name *</label><input className={inp} name="name" value={form.name} onChange={onChange} required /></div>
        <div><label className={lbl}>Department *</label><input className={inp} name="department" value={form.department} onChange={onChange} required /></div>
        <div><label className={lbl}>Zone</label><input className={inp} name="zone" value={form.zone} onChange={onChange} /></div>
        <div><label className={lbl}>Latitude *</label><input className={inp} type="number" step="any" name="latitude" value={form.latitude} onChange={onChange} required /></div>
        <div><label className={lbl}>Longitude *</label><input className={inp} type="number" step="any" name="longitude" value={form.longitude} onChange={onChange} required /></div>
        <div>
          <label className={lbl}>Camera Type</label>
          <select className={inp} name="camera_type" value={form.camera_type} onChange={onChange}>
            <option value="traffic_junction">Traffic Junction</option>
            <option value="rto_checkpoint">RTO Checkpoint</option>
          </select>
        </div>
        <div>
          <label className={lbl}>Protocol</label>
          <select className={inp} name="source_protocol" value={form.source_protocol} onChange={onChange}>
            <option value="RTSP">RTSP</option>
            <option value="ONVIF">ONVIF</option>
            <option value="SIMULATED">SIMULATED</option>
          </select>
        </div>
        <div className="col-span-2"><label className={lbl}>Stream Endpoint</label><input className={inp} name="stream_endpoint" value={form.stream_endpoint} onChange={onChange} /></div>
      </div>
      <div className="flex gap-3 justify-end pt-1">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100">Cancel</button>
        <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create Camera</button>
      </div>
    </form>
  );
}
