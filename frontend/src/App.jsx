import React, { useState, useEffect } from "react";
import MapView from "./components/MapView";
import NDVIChart from "./components/NDVIChart";
import TimelineSlider from "./components/TimelineSlider";

function App() {
  const [ndviData, setNdviData] = useState([]);
  const [status, setStatus] = useState("");
  const [coords, setCoords] = useState({ lat: 20.59, lon: 78.96 }); // default India

  const fetchData = async () => {
    const res = await fetch(`http://127.0.0.1:5000/ndvi?lat=${coords.lat}&lon=${coords.lon}`);
    const data = await res.json();
    setNdviData(data.data);
    setStatus(data.status);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">🌸 BloomTracker</h1>
      <p className="text-center mb-4">{status}</p>
      <MapView coords={coords} setCoords={setCoords} onUpdate={fetchData} />
      <NDVIChart data={ndviData} />
      <TimelineSlider />
    </div>
  );
}

export default App;
