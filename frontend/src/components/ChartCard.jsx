import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

export default function ChartCard({ data }) {
    const chartData = {
        labels: data.map(d => d.date),
        datasets: [
            {
                label: "NDVI",
                data: data.map(d => d.ndvi),
                borderColor: "#4CAF50",
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                fill: true,
                tension: 0.4
            },
            {
                label: "EVI",
                data: data.map(d => d.evi),
                borderColor: "#2196F3",
                backgroundColor: "rgba(33, 150, 243, 0.1)",
                fill: true,
                tension: 0.4
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: { legend: { position: "top" }, title: { display: true, text: "Vegetation Indices Over Time" } },
        scales: {
            y: { beginAtZero: true, max: 1, title: { display: true, text: "Index Value" } },
            x: { title: { display: true, text: "Date" } }
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">📊 NDVI Time Series Analysis</h2>
            <Line data={chartData} options={options} />
        </div>
    );
}
