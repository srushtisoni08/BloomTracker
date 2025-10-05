import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapCard({ lat, lon, color }) {
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        mapRef.current = L.map("map", { center: [lat, lon], zoom: 10 });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
        }).addTo(mapRef.current);

        return () => mapRef.current.remove();
    }, []);

    useEffect(() => {
        if (markerRef.current) mapRef.current.removeLayer(markerRef.current);

        const icon = L.divIcon({
            className: "custom-marker",
            html: `<div style="background: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white;"></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
        });

        markerRef.current = L.marker([lat, lon], { icon }).addTo(mapRef.current);
        mapRef.current.setView([lat, lon], 10);
    }, [lat, lon, color]);

    return (
        <div className="card h-full">
            <h2 className="text-lg font-semibold mb-2">🗺️ Interactive Bloom Map</h2>
            <div id="map" style={{ height: "500px", borderRadius: "12px" }}></div>
        </div>
    );
}
