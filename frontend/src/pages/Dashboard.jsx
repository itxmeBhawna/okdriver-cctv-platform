import { useState, useEffect } from "react";
import client from "../api/client";

const severityColors = {
    low: "bg-gray-200 text-gray-800",
    medium: "bg-blue-200 text-blue-800",
    high: "bg-orange-200 text-orange-800",
    critical: "bg-red-200 text-red-800",
};

const statusColors = {
    online: "bg-green-500",
    offline: "bg-gray-400",
    degraded: "bg-yellow-500",
};

export default function Dashboard({ accessToken }) {
    const [summary, setSummary] = useState(null);
    const [cameras, setCameras] = useState([]);
    const [search, setSearch] = useState("");

    const load = async () => {
        const [summaryRes, camerasRes] = await Promise.all([
            client.get("/api/dashboard/summary"),
            client.get("/api/cameras"),
        ]);
        setSummary(summaryRes.data);
        setCameras(camerasRes.data);
    };

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000/ws/alerts");
        ws.onopen = () => ws.send(accessToken);
        ws.onmessage = () => load();
        return () => ws.close();
    }, [accessToken]);

    if (!summary) return <div className="p-6">Loading...</div>;

    const filteredAlerts = search
        ? summary.recent_alerts.filter((a) =>
            a.matched_identifier.toLowerCase().includes(search.toLowerCase())
        )
        : summary.recent_alerts;

    const filteredEvents = search
        ? summary.recent_events.filter((e) =>
            e.identifier.toLowerCase().includes(search.toLowerCase())
        )
        : summary.recent_events;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard label="Total Cameras" value={summary.camera_stats.total} color="text-slate-900" />
                <StatCard label="Online" value={summary.camera_stats.online} color="text-green-600" />
                <StatCard label="Offline" value={summary.camera_stats.offline} color="text-gray-500" />
                <StatCard label="Active Alerts" value={summary.active_alerts_count} color="text-red-600" />
                <StatCard label="Watchlist Entries" value={summary.active_watchlist_count} color="text-blue-600" />
            </div>

            {/* Vehicle/entity search */}
            <input
                placeholder="Search vehicle/entity identifier across alerts and events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded p-2 w-full max-w-lg"
            />

            {/* Camera health grid */}
            <div>
                <h2 className="text-lg font-semibold mb-2">Camera Health</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {cameras.map((cam) => (
                        <div key={cam.camera_id} className="bg-white p-3 rounded-lg shadow flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${statusColors[cam.status] || "bg-gray-300"}`}></span>
                            <div>
                                <div className="font-semibold text-sm">{cam.camera_id}</div>
                                <div className="text-xs text-slate-500">{cam.name}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Recent alerts */}
                <div>
                    <h2 className="text-lg font-semibold mb-2">Recent Alerts</h2>
                    <div className="space-y-2">
                        {filteredAlerts.length === 0 && <div className="text-slate-400 text-sm">No alerts.</div>}
                        {filteredAlerts.map((alert) => (
                            <div key={alert.id} className="bg-white p-3 rounded-lg shadow">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-sm">{alert.matched_identifier}</span>
                                    {alert.watchlist_entry && (
                                        <span
                                            className={`px-2 py-0.5 rounded text-xs font-semibold ${severityColors[alert.watchlist_entry.severity]}`}
                                        >
                                            {alert.watchlist_entry.severity}
                                        </span>
                                    )}
                                    <span className="text-xs text-slate-400 ml-auto">{alert.status}</span>
                                </div>
                                <div className="text-xs text-slate-500">
                                    {alert.camera_id} · {new Date(alert.detected_at).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent events */}
                <div>
                    <h2 className="text-lg font-semibold mb-2">Recent Detection Events</h2>
                    <div className="space-y-2">
                        {filteredEvents.length === 0 && <div className="text-slate-400 text-sm">No events.</div>}
                        {filteredEvents.map((event) => (
                            <div key={event.id} className="bg-white p-3 rounded-lg shadow text-sm">
                                <span className="font-mono font-semibold">{event.identifier}</span>{" "}
                                <span className="text-slate-500">
                                    · {event.camera_id} · {(event.confidence * 100).toFixed(0)}% ·{" "}
                                    {new Date(event.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, color }) {
    return (
        <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
        </div>
    );
}