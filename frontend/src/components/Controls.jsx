import React, { useState } from "react";

export default function Controls({ onFetch, onDetect, onPreset }) {
    const [lat, setLat] = useState(38.89);
    const [lon, setLon] = useState(-77.04);
    const today = new Date().toISOString().split("T")[0];
    const threeMonthsAgo = new Date(new Date().setMonth(new Date().getMonth() - 3))
        .toISOString()
        .split("T")[0];

    const [startDate, setStartDate] = useState(threeMonthsAgo);
    const [endDate, setEndDate] = useState(today);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">📍 Search Location & Date Range</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                    <label className="block text-gray-600 text-sm font-semibold">Latitude</label>
                    <input type="number" value={lat} step="0.01" min="-90" max="90"
                        onChange={e => setLat(parseFloat(e.target.value))}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-gray-600 text-sm font-semibold">Longitude</label>
                    <input type="number" value={lon} step="0.01" min="-180" max="180"
                        onChange={e => setLon(parseFloat(e.target.value))}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-gray-600 text-sm font-semibold">Start Date</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-gray-600 text-sm font-semibold">End Date</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    />
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <button className="bg-gradient-to-r from-blue-500 to-purple-700 text-white px-4 py-2 rounded-lg"
                    onClick={() => onFetch(lat, lon, startDate, endDate)}>🌱 Analyze Vegetation</button>
                <button className="bg-gradient-to-r from-blue-500 to-purple-700 text-white px-4 py-2 rounded-lg"
                    onClick={() => onDetect(lat, lon, startDate, endDate)}>🔍 Detect Bloom</button>
                <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg" onClick={() => onPreset("dc")}>📍 Washington DC</button>
                <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg" onClick={() => onPreset("tokyo")}>📍 Tokyo</button>
                <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg" onClick={() => onPreset("netherlands")}>📍 Netherlands</button>
            </div>
        </div>
    );
}
