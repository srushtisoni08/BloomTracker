import React, { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default function ChartCard({ data }) {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        if (!chartRef.current) return;
        if (chartInstanceRef.current) chartInstanceRef.current.destroy();

        chartInstanceRef.current = new Chart(chartRef.current, {
            type: "line",
            data: {
                labels: data.map((d) => d.date),
                datasets: [
                    {
                        label: "NDVI",
                        data: data.map((d) => d.ndvi),
                        borderColor: "#4CAF50",
                        backgroundColor: "rgba(76, 175, 80, 0.1)",
                        fill: true,
                        tension: 0.4,
                    },
                    {
                        label: "EVI",
                        data: data.map((d) => d.evi),
                        borderColor: "#2196F3",
                        backgroundColor: "rgba(33, 150, 243, 0.1)",
                        fill: true,
                        tension: 0.4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "top" },
                    title: { display: true, text: "Vegetation Indices Over Time" },
                },
                scales: {
                    y: { beginAtZero: true, max: 1, title: { display: true, text: "Index Value" } },
                    x: { title: { display: true, text: "Date" } },
                },
            },
        });
    }, [data]);

    return (
        <div className="card h-full">
            <h2 className="text-lg font-semibold mb-2">📊 NDVI Time Series Analysis</h2>
            <div style={{ height: "500px" }}>
                <canvas ref={chartRef}></canvas>
            </div>
        </div>
    );
}
