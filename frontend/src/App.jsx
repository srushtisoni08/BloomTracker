import React, { useState } from "react";
import Header from "./components/Header";
import Controls from "./components/Controls";
import MapCard from "./components/MapCard";
import ChartCard from "./components/ChartCard";
import StatsCard from "./components/StatsCard";
import SpeciesCard from "./components/SpeciesCard";

function App() {
  const [lat, setLat] = useState(38.89);
  const [lon, setLon] = useState(-77.04);
  const [markerColor, setMarkerColor] = useState("#667eea");
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({});
  const [bloom, setBloom] = useState(null);

  const API_BASE_URL = "http://localhost:5000/api";

  const fetchVegetationData = async (lat, lon, start, end) => {
    try {
      const res = await fetch(`${API_BASE_URL}/vegetation/indices?lat=${lat}&lon=${lon}&start_date=${start}&end_date=${end}`);
      const data = await res.json();
      setChartData(data.data);
      setStats({
        meanNDVI: data.statistics.mean_ndvi,
        maxNDVI: data.statistics.max_ndvi,
        dataPoints: data.statistics.data_points,
        avgTemp: data.weather_summary?.avg_temperature?.toFixed(1) || "--"
      });
      const color = data.statistics.mean_ndvi > 0.6 ? "#4CAF50" : data.statistics.mean_ndvi > 0.3 ? "#FFC107" : "#F44336";
      setMarkerColor(color);
      setBloom(null);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch vegetation data");
    }
  };

  const detectBloom = async (lat, lon, start, end) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bloom/detect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon, start_date: start, end_date: end })
      });
      const data = await res.json();
      setChartData(data.timeseries);
      setBloom(data.bloom_detected ? {
        detected: true,
        onset: data.bloom_event.bloom_onset_date,
        peak: data.bloom_event.peak_date,
        peakNDVI: data.bloom_event.peak_ndvi,
        confidence: (data.bloom_event.confidence * 100).toFixed(0)
      } : { detected: false });
    } catch (err) {
      console.error(err);
      alert("Failed to detect bloom");
    }
  };

  const loadPresetLocation = (preset) => {
    const locations = { dc: { lat: 38.89, lon: -77.04 }, tokyo: { lat: 35.68, lon: 139.65 }, netherlands: { lat: 52.37, lon: 4.89 } };
    setLat(locations[preset].lat);
    setLon(locations[preset].lon);
  };

  return (
    <div className="bg-gradient-to-tr from-blue-500 to-purple-700 text-gray-800 min-h-screen">
      <Header />
      <div className="max-w-6xl mx-auto p-4">
        <Controls onFetch={fetchVegetationData} onDetect={detectBloom} onPreset={loadPresetLocation} />
        <MapCard lat={lat} lon={lon} color={markerColor} />
        {chartData.length > 0 && <ChartCard data={chartData} />}
        <StatsCard stats={stats} bloom={bloom} />
        <SpeciesCard />
      </div>
    </div>
  );
}

export default App;
