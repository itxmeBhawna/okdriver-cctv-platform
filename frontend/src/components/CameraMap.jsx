import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const STATUS_COLOR = {
  online: '#22c55e',
  offline: '#9ca3af',
  degraded: '#eab308',
};

function makeIcon(status) {
  const color = STATUS_COLOR[status] ?? STATUS_COLOR.offline;
  return L.divIcon({
    className: '',
    html: `<div style="width:13px;height:13px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></div>`,
    iconAnchor: [6, 6],
  });
}

export default function CameraMap({ cameras }) {
  return (
    <MapContainer
      center={[22.9, 72.6]}
      zoom={8}
      style={{ height: '320px', width: '100%', borderRadius: '12px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {cameras.map((cam) => (
        <Marker
          key={cam.camera_id}
          position={[cam.latitude, cam.longitude]}
          icon={makeIcon(cam.status)}
        >
          <Popup>
            <strong>{cam.camera_id}</strong> — {cam.name}
            <br />
            {cam.department}
            <br />
            Status: <strong>{cam.status}</strong>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
