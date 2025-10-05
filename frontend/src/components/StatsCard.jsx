import React from "react";

export default function StatsCard({ stats, bloom }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">📈 Vegetation Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.meanNDVI ?? "--"}</div>
                    <div className="text-xs text-gray-600 uppercase">Mean NDVI</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.maxNDVI ?? "--"}</div>
                    <div className="text-xs text-gray-600 uppercase">Peak NDVI</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.dataPoints ?? "--"}</div>
                    <div className="text-xs text-gray-600 uppercase">Data Points</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.avgTemp ?? "--"}</div>
                    <div className="text-xs text-gray-600 uppercase">Avg Temp (°C)</div>
                </div>
            </div>

            {bloom && (
                <div className={`mt-4 p-4 font-semibold rounded-lg ${bloom.detected ? "bg-green-100 text-green-700 border-l-4 border-green-500" : "bg-orange-100 text-orange-700 border-l-4 border-orange-500"}`}>
                    {bloom.detected ? (
                        <div>
                            🌸 Bloom Detected! <br />
                            Onset: {bloom.onset} <br />
                            Peak: {bloom.peak} <br />
                            Peak NDVI: {bloom.peakNDVI} <br />
                            Confidence: {bloom.confidence}%
                        </div>
                    ) : (
                        <div>ℹ️ No significant bloom detected in this period</div>
                    )}
                </div>
            )}
        </div>
    );
}
