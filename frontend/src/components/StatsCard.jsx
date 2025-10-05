import React from "react";

export default function StatsCard({ stats, bloom }) {
    return (
        <div className="card mt-6">
            <h2 className="text-lg font-semibold mb-4">📈 Vegetation Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat-box text-center p-4 rounded bg-gradient-to-r from-blue-100 to-purple-100">
                    <div className="value text-2xl font-bold text-blue-500">{stats.meanNDVI ?? "--"}</div>
                    <div className="label text-gray-600">Mean NDVI</div>
                </div>
                <div className="stat-box text-center p-4 rounded bg-gradient-to-r from-blue-100 to-purple-100">
                    <div className="value text-2xl font-bold text-blue-500">{stats.maxNDVI ?? "--"}</div>
                    <div className="label text-gray-600">Peak NDVI</div>
                </div>
                <div className="stat-box text-center p-4 rounded bg-gradient-to-r from-blue-100 to-purple-100">
                    <div className="value text-2xl font-bold text-blue-500">{stats.dataPoints ?? "--"}</div>
                    <div className="label text-gray-600">Data Points</div>
                </div>
                <div className="stat-box text-center p-4 rounded bg-gradient-to-r from-blue-100 to-purple-100">
                    <div className="value text-2xl font-bold text-blue-500">{stats.avgTemp ?? "--"}</div>
                    <div className="label text-gray-600">Avg Temp (°C)</div>
                </div>
            </div>

            {bloom && (
                <div
                    className={`mt-4 p-3 rounded font-semibold ${bloom.detected ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                        }`}
                >
                    {bloom.detected ? (
                        <div>
                            🌸 Bloom Detected! <br />
                            Onset: {bloom.onset} <br />
                            Peak: {bloom.peak} <br />
                            Peak NDVI: {bloom.peakNDVI} <br />
                            Confidence: {bloom.confidence}%
                        </div>
                    ) : (
                        "ℹ️ No significant bloom detected in this period"
                    )}
                </div>
            )}
        </div>
    );
}
