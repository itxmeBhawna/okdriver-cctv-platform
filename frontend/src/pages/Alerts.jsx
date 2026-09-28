import { useState, useEffect, useRef } from "react";
import client from "../api/client";

const severityColors = {
    low: "bg-gray-200 text-gray-800",
    medium: "bg-blue-200 text-blue-800",
    high: "bg-orange-200 text-orange-800",
    critical: "bg-red-200 text-red-800",
};

export default function Alerts({ accessToken }) {
    const [alerts, setAlerts] = useState([]);
    const [statusFilter, setStatusFilter] = useState("");
    const [banner, setBanner] = useState(null);
    const wsRef = useRef(null);

    const load = async () => {
        const params = {};
        if (statusFilter) params.status = statusFilter;
        const res = await client.get("/api/alerts", { params });
        setAlerts(res.data);
    };

    useEffect(() => {
        load();
    }, [statusFilter]);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000/ws/alerts");
        wsRef.current = ws;
        ws.onopen = () => ws.send(accessToken);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "new_alert") {
                setBanner(`New alert: ${data.alert.matched_identifier} at ${data.alert.camera_id}`);
                load();
                setTimeout(() => setBanner(null), 5000);
            }
        };

        return () => ws.close();
    }, [accessToken]);

    const handleAcknowledge = async (id) => {
        const name = prompt("Your name (for acknowledgment record):");
        if (name === null) return;
        await client.patch(`/api/alerts/${id}/acknowledge`, { acknowledged_by: name });
        load();
    };

    const handleResolve = async (id) => {
        await client.patch(`/api/alerts/${id}/resolve`);
        load();
    };

    return (
        <div className="p-6 space-y-5">
            <h1 className="text-2xl font-bold">Alerts</h1>

            {banner && (
                <div className="bg-red-600 text-white px-4 py-3 rounded-lg font-semibold animate-pulse">
                    🚨 {banner}
                </div>
            )}

            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded p-2"
            >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="resolved">Resolved</option>
            </select>

            <div className="space-y-3">
                {alerts.map((alert) => (
                    <div key={alert.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-bold">{alert.matched_identifier}</span>
                                {alert.watchlist_entry && (
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-semibold ${severityColors[alert.watchlist_entry.severity]}`}
                                    >
                                        {alert.watchlist_entry.severity}
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-slate-600">
                                Camera: {alert.camera_id} · Category: {alert.watchlist_entry?.category} · Confidence:{" "}
                                {(alert.confidence * 100).toFixed(0)}% · Status: {alert.status}
                            </div>
                            <div className="text-xs text-slate-400">{new Date(alert.detected_at).toLocaleString()}</div>
                        </div>
                        <div className="flex gap-2">
                            {alert.status === "new" && (
                                <button
                                    onClick={() => handleAcknowledge(alert.id)}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                                >
                                    Acknowledge
                                </button>
                            )}
                            {alert.status !== "resolved" && (
                                <button
                                    onClick={() => handleResolve(alert.id)}
                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                                >
                                    Resolve
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}