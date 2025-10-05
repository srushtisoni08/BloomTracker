import React from "react";

export default function SpeciesCard() {
    const species = [
        { name: "Cherry Blossom", sci: "Prunus serrulata", bloom: "March-April", duration: "7-10 days", icon: "🌸" },
        { name: "Tulip", sci: "Tulipa", bloom: "April-May", duration: "14-21 days", icon: "🌷" },
        { name: "Lavender", sci: "Lavandula", bloom: "June-August", duration: "60-90 days", icon: "💜" },
        { name: "Sunflower", sci: "Helianthus annuus", bloom: "July-September", duration: "20-30 days", icon: "🌻" }
    ];

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">🌺 Species Bloom Calendar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {species.map(s => (
                    <div key={s.name} className="border p-4 rounded-lg hover:border-blue-500 transition transform hover:scale-105">
                        <h4 className="text-blue-600 text-lg font-semibold">{s.icon} {s.name}</h4>
                        <p className="text-xs">Scientific: {s.sci}</p>
                        <p className="text-xs">Bloom: {s.bloom}</p>
                        <p className="text-xs">Duration: {s.duration}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
