import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import client from "../api/client";

function numberedIcon(number) {
    return L.divIcon({
        className: "",
        html: `<div style="background:#2563eb;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:13px;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);">${number}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
    });
}

export default function VehicleTrace() {
    const [identifier, setIdentifier] = useState("");
    const [traceData, setTraceData] = useState(null);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        setError(null);
        setTraceData(null);
        try {
            const res = await client.get(`/api/trace/${identifier.trim()}`);
            setTraceData(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || "No trace found for this identifier.");
        }
    };

    const validPoints = traceData
        ? traceData.trace.filter((p) => p.latitude != null && p.longitude != null)
        : [];
    const polylinePositions = validPoints.map((p) => [p.latitude, p.longitude]);
    const center = validPoints.length > 0 ? polylinePositions[0] : [22.9, 72.6];

    return (
        <div className="p-6 space-y-5">
            <h1 className="text-2xl font-bold">Vehicle / Entity Movement Trace</h1>

            <form onSubmit={handleSearch} className="flex gap-3 max-w-lg">
                <input
                    placeholder="Enter vehicle number, e.g. GJ01XX0001"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="border rounded p-2 flex-1"
                    required
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
                    Trace
                </button>
            </form>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            {traceData && (
                <>
                    <div className="text-sm text-slate-600">
                        Found {traceData.total_sightings} sighting(s) for <span className="font-mono font-bold">{traceData.identifier}</span>
                    </div>

                    <div className="rounded-lg overflow-hidden shadow" style={{ height: "400px" }}>
                        <MapContainer center={center} zoom={9} style={{ height: "100%", width: "100%" }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; OpenStreetMap contributors'
                            />
                            {polylinePositions.length > 1 && (
                                <Polyline positions={polylinePositions} color="#2563eb" weight={3} dashArray="6 6" />
                            )}
                            {validPoints.map((point, idx) => (
                                <Marker
                                    key={idx}
                                    position={[point.latitude, point.longitude]}
                                    icon={numberedIcon(idx + 1)}
                                >
                                    <Popup>
                                        <strong>{point.camera_name}</strong> ({point.camera_id})
                                        <br />
                                        {new Date(point.timestamp).toLocaleString()}
                                        <br />
                                        Confidence: {(point.confidence * 100).toFixed(0)}%
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">Chronological Sightings</h2>
                        <div className="space-y-2">
                            {traceData.trace.map((point, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-lg shadow flex items-center gap-3 text-sm">
                                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                                        {idx + 1}
                                    </span>
                                    <div>
                                        <span className="font-semibold">{point.camera_name}</span>{" "}
                                        <span className="text-slate-500">({point.camera_id})</span>
                                        <div className="text-slate-500 text-xs">
                                            {new Date(point.timestamp).toLocaleString()} · Confidence: {(point.confidence * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}