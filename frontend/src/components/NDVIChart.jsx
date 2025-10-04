import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement);

const NDVIChart = ({ data }) => {
  const months = data.map(d => d.month);
  const ndviValues = data.map(d => d.ndvi);

  return (
    <div className="my-6">
      <Line
        data={{
          labels: months,
          datasets: [
            {
              label: "NDVI Value",
              data: ndviValues,
              borderColor: "green",
              tension: 0.3,
            },
          ],
        }}
        options={{
          responsive: true,
          scales: {
            y: { min: 0, max: 1 },
          },
        }}
      />
    </div>
  );
};

export default NDVIChart;
