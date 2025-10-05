import React from "react";

export default function Header() {
    return (
        <div className="bg-white/95 backdrop-blur-md p-6 sticky top-0 z-50 shadow-md">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-700 bg-clip-text text-transparent mb-1">🌸 BloomTracker</h1>
            <p className="text-gray-600 text-sm">NASA Earth Observation Application for Global Flowering Phenology</p>
            <span className="inline-block bg-blue-900 text-white px-4 py-1 rounded-full mt-2 text-xs font-bold">🛰️ Powered by NASA POWER & EONET APIs</span>
        </div>
    );
}
