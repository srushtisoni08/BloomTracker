import React from "react";

const species = [
    { name: "Cherry Blossom", scientific: "Prunus serrulata", bloom: "March - April", duration: "7-10 days", emoji: "🌸" },
    { name: "Tulip", scientific: "Tulipa", bloom: "April - May", duration: "14-21 days", emoji: "🌷" },
    { name: "Lavender", scientific: "Lavandula", bloom: "June - August", duration: "60-90 days", emoji: "💜" },
    { name: "Sunflower", scientific: "Helianthus annuus", bloom: "July - September", duration: "20-30 days", emoji: "🌻" },
];

export default function SpeciesCard() {
    return (
        <div className="card mt-6">
            <h2 className="text-lg font-semibold mb-4">🌺 Species Bloom Calendar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {species.map((s) => (
                    <div key={s.name} className="species-card p-3 border rounded cursor-pointer hover:border-blue-500 hover:scale-105 transition">
                        <h4 className="text-blue-500 font-semibold mb-1">{s.emoji} {s.name}</h4>
                        <p><strong>Scientific:</strong> {s.scientific}</p>
                        <p><strong>Bloom:</strong> {s.bloom}</p>
                        <p><strong>Duration:</strong> {s.duration}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
