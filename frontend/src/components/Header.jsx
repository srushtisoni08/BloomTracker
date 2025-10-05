import React from "react";

export default function Controls({ onFetch, onDetect, onPreset, lat, lon, setLat, setLon }) {
    const today = new Date();
    const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
    const [startDate, setStartDate] = React.useState(threeMonthsAgo.toISOString().split("T")[0]);
    const [endDate, setEndDate] = React.useState(today.toISOString().split("T")[0]);

    return (
        <div className="controls bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl mb-4 font-semibold">📍 Search Location & Date Range</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                    <label className="block mb-1 text-gray-600">Latitude</label>
                    <input
                        type="number"
                        value={lat}
                        onChange={(e) => setLat(parseFloat(e.target.value))}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div>
                    <label className="block mb-1 text-gray-600">Longitude</label>
                    <input
                        type="number"
                        value={lon}
                        onChange={(e) => setLon(parseFloat(e.target.value))}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div>
                    <label className="block mb-1 text-gray-600">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div>
                    <label className="block mb-1 text-gray-600">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                <button
                    className="btn-primary px-4 py-2 rounded text-white bg-gradient-to-r from-blue-500 to-purple-700"
                    onClick={() => onFetch(lat, lon, startDate, endDate)}
                >
                    🌱 Analyze Vegetation
                </button>
                <button
                    className="btn-primary px-4 py-2 rounded text-white bg-gradient-to-r from-blue-500 to-purple-700"
                    onClick={() => onDetect(lat, lon, startDate, endDate)}
                >
                    🔍 Detect Bloom
                </button>
                <button className="btn-secondary px-4 py-2 rounded" onClick={() => onPreset("dc")}>
                    📍 Washington DC
                </button>
                <button className="btn-secondary px-4 py-2 rounded" onClick={() => onPreset("tokyo")}>
                    📍 Tokyo
                </button>
                <button className="btn-secondary px-4 py-2 rounded" onClick={() => onPreset("netherlands")}>
                    📍 Netherlands
                </button>
            </div>
        </div>
    );
}
