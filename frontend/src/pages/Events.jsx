import { useState, useEffect } from "react";
import client from "../api/client";

export default function Events() {
    const [events, setEvents] = useState([]);

    const load = async () => {
        const res = await client.get("/api/events/detection");
        setEvents(res.data);
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <div className="p-6 space-y-5">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Detection Events</h1>
                <button onClick={load} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
                    Refresh
                </button>
            </div>

            <table className="w-full bg-white rounded-lg shadow overflow-hidden">
                <thead className="bg-slate-100 text-left">
                    <tr>
                        <th className="p-3">Camera</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Identifier</th>
                        <th className="p-3">Vehicle Type</th>
                        <th className="p-3">Confidence</th>
                        <th className="p-3">Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {events.map((e) => (
                        <tr key={e.id} className="border-t">
                            <td className="p-3">{e.camera_id}</td>
                            <td className="p-3">{e.event_type}</td>
                            <td className="p-3 font-mono">{e.identifier}</td>
                            <td className="p-3">{e.vehicle_type}</td>
                            <td className="p-3">{(e.confidence * 100).toFixed(0)}%</td>
                            <td className="p-3 text-sm text-slate-500">{new Date(e.timestamp).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}