import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapCard({ lat, lon, color }) {
    useEffect(() => {
        const map = L.map("map").setView([lat, lon], 10);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors"
        }).addTo(map);

        const marker = L.circleMarker([lat, lon], {
            color: color || "#667eea",
            radius: 10,
            fillOpacity: 0.8
        }).addTo(map);

        return () => map.remove(); // cleanup
    }, [lat, lon, color]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">🗺️ Interactive Bloom Map</h2>
            <div id="map" className="h-80 rounded-lg shadow-md"></div>
        </div>
    );
}
