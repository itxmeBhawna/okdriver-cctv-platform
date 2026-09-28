import { useState, useEffect } from "react";
import client from "../api/client";

const severityColors = {
    low: "bg-gray-200 text-gray-800",
    medium: "bg-blue-200 text-blue-800",
    high: "bg-orange-200 text-orange-800",
    critical: "bg-red-200 text-red-800",
};

export default function Watchlist() {
    const [entries, setEntries] = useState([]);
    const [search, setSearch] = useState("");
    const [entityFilter, setEntityFilter] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        entity_type: "vehicle",
        identifier: "",
        category: "",
        description: "",
        severity: "medium",
    });

    const load = async () => {
        const params = {};
        if (search) params.search = search;
        if (entityFilter) params.entity_type = entityFilter;
        const res = await client.get("/api/watchlist", { params });
        setEntries(res.data);
    };

    useEffect(() => {
        load();
    }, [search, entityFilter]);

    const handleAdd = async (e) => {
        e.preventDefault();
        await client.post("/api/watchlist", form);
        setForm({ entity_type: "vehicle", identifier: "", category: "", description: "", severity: "medium" });
        setShowForm(false);
        load();
    };

    const handleRemove = async (id) => {
        await client.delete(`/api/watchlist/${id}`);
        load();
    };

    return (
        <div className="p-6 space-y-5">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Watchlist</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
                >
                    + Add Entry
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleAdd} className="bg-white p-4 rounded-lg shadow space-y-3 max-w-md">
                    <select
                        value={form.entity_type}
                        onChange={(e) => setForm({ ...form, entity_type: e.target.value })}
                        className="border rounded p-2 w-full"
                    >
                        <option value="vehicle">Vehicle</option>
                        <option value="person">Person</option>
                    </select>
                    <input
                        placeholder="Identifier (e.g. GJ01XX0001)"
                        value={form.identifier}
                        onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                        className="border rounded p-2 w-full"
                        required
                    />
                    <input
                        placeholder="Category (e.g. stolen_vehicle)"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="border rounded p-2 w-full"
                        required
                    />
                    <input
                        placeholder="Description"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="border rounded p-2 w-full"
                    />
                    <select
                        value={form.severity}
                        onChange={(e) => setForm({ ...form, severity: e.target.value })}
                        className="border rounded p-2 w-full"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg w-full">
                        Save
                    </button>
                </form>
            )}

            <div className="flex gap-3">
                <input
                    placeholder="Search by identifier..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded p-2 flex-1"
                />
                <select
                    value={entityFilter}
                    onChange={(e) => setEntityFilter(e.target.value)}
                    className="border rounded p-2"
                >
                    <option value="">All Types</option>
                    <option value="vehicle">Vehicle</option>
                    <option value="person">Person</option>
                </select>
            </div>

            <table className="w-full bg-white rounded-lg shadow overflow-hidden">
                <thead className="bg-slate-100 text-left">
                    <tr>
                        <th className="p-3">Identifier</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Severity</th>
                        <th className="p-3">Description</th>
                        <th className="p-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {entries.map((entry) => (
                        <tr key={entry.id} className="border-t">
                            <td className="p-3 font-mono">{entry.identifier}</td>
                            <td className="p-3">{entry.entity_type}</td>
                            <td className="p-3">{entry.category}</td>
                            <td className="p-3">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${severityColors[entry.severity]}`}>
                                    {entry.severity}
                                </span>
                            </td>
                            <td className="p-3 text-sm text-slate-600">{entry.description}</td>
                            <td className="p-3">
                                <button
                                    onClick={() => handleRemove(entry.id)}
                                    className="text-red-600 border border-red-300 px-3 py-1 rounded text-sm"
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}