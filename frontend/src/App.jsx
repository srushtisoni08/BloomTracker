import { useState, useEffect, useRef } from 'react';

export default function App() {
  const [latitude, setLatitude] = useState(38.89);
  const [longitude, setLongitude] = useState(-77.04);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [stats, setStats] = useState({
    meanNDVI: '--',
    maxNDVI: '--',
    dataPoints: '--',
    avgTemp: '--'
  });
  const [bloomStatus, setBloomStatus] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [chartLoaded, setChartLoaded] = useState(false);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const API_BASE_URL = 'http://localhost:5000/api';

  const presets = {
    dc: { lat: 38.89, lon: -77.04, name: 'Washington DC' },
    tokyo: { lat: 35.68, lon: 139.65, name: 'Tokyo' },
    netherlands: { lat: 52.37, lon: 4.89, name: 'Netherlands' }
  };

  useEffect(() => {
    // Set default dates
    const today = new Date();
    const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
    setStartDate(threeMonthsAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);

    // Load Leaflet
    if (!window.L) {
      const leafletScript = document.createElement('script');
      leafletScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      leafletScript.onload = () => {
        setMapLoaded(true);
      };
      document.body.appendChild(leafletScript);

      const leafletCSS = document.createElement('link');
      leafletCSS.rel = 'stylesheet';
      leafletCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(leafletCSS);
    } else {
      setMapLoaded(true);
    }

    // Load Chart.js
    if (!window.Chart) {
      const chartScript = document.createElement('script');
      chartScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js';
      chartScript.onload = () => {
        setChartLoaded(true);
      };
      document.body.appendChild(chartScript);
    } else {
      setChartLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (mapLoaded && mapRef.current && !mapInstanceRef.current) {
      const L = window.L;
      mapInstanceRef.current = L.map(mapRef.current).setView([38.89, -77.04], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      // Add legend
      const legend = L.control({ position: 'bottomright' });
      legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'legend');
        div.style.background = 'white';
        div.style.padding = '10px';
        div.style.borderRadius = '8px';
        div.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        div.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px; margin: 5px 0; font-size: 0.85em;">
            <div style="width: 20px; height: 20px; border-radius: 50%; background: #4CAF50; border: 2px solid white; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);"></div>
            <span>Peak Bloom (NDVI > 0.6)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin: 5px 0; font-size: 0.85em;">
            <div style="width: 20px; height: 20px; border-radius: 50%; background: #FFC107; border: 2px solid white; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);"></div>
            <span>Vegetated (NDVI > 0.3)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin: 5px 0; font-size: 0.85em;">
            <div style="width: 20px; height: 20px; border-radius: 50%; background: #F44336; border: 2px solid white; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);"></div>
            <span>Dormant (NDVI < 0.3)</span>
          </div>
        `;
        return div;
      };
      legend.addTo(mapInstanceRef.current);

      // Map click handler
      mapInstanceRef.current.on('click', function (e) {
        setLatitude(parseFloat(e.latlng.lat.toFixed(4)));
        setLongitude(parseFloat(e.latlng.lng.toFixed(4)));
        updateMarker(e.latlng.lat, e.latlng.lng);
      });

      // Initial marker
      updateMarker(38.89, -77.04);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLoaded]);

  const updateMarker = (lat, lon, color = '#667eea') => {
    const L = window.L;
    if (!L || !mapInstanceRef.current) return;

    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
    }

    const icon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    markerRef.current = L.marker([lat, lon], { icon: icon }).addTo(mapInstanceRef.current);
    mapInstanceRef.current.setView([lat, lon], 10);
  };

  const loadPresetLocation = (preset) => {
    const location = presets[preset];
    setLatitude(location.lat);
    setLongitude(location.lon);
    updateMarker(location.lat, location.lon);
  };

  const fetchVegetationData = async () => {
    setStatsLoading(true);
    setStatsVisible(false);

    try {
      const response = await fetch(
        `${API_BASE_URL}/vegetation/indices?lat=${latitude}&lon=${longitude}&start_date=${startDate}&end_date=${endDate}`
      );
      const data = await response.json();

      setStats({
        meanNDVI: data.statistics.mean_ndvi,
        maxNDVI: data.statistics.max_ndvi,
        dataPoints: data.statistics.data_points,
        avgTemp: data.weather_summary?.avg_temperature?.toFixed(1) || '--'
      });

      updateNDVIChart(data.data);

      const color = data.statistics.mean_ndvi > 0.6 ? '#4CAF50' :
        data.statistics.mean_ndvi > 0.3 ? '#FFC107' : '#F44336';
      updateMarker(latitude, longitude, color);

      setStatsLoading(false);
      setStatsVisible(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to fetch vegetation data. Make sure the backend is running on localhost:5000');
      setStatsLoading(false);
    }
  };

  const detectBloom = async () => {
    setStatsLoading(true);
    setStatsVisible(false);

    try {
      const response = await fetch(`${API_BASE_URL}/bloom/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: latitude, lon: longitude, start_date: startDate, end_date: endDate })
      });
      const data = await response.json();

      updateNDVIChart(data.timeseries);

      if (data.bloom_detected) {
        setBloomStatus({
          detected: true,
          onsetDate: data.bloom_event.bloom_onset_date,
          peakDate: data.bloom_event.peak_date,
          peakNDVI: data.bloom_event.peak_ndvi,
          confidence: (data.bloom_event.confidence * 100).toFixed(0)
        });
        updateMarker(latitude, longitude, '#4CAF50');
      } else {
        setBloomStatus({ detected: false });
      }

      if (data.timeseries && data.timeseries.length > 0) {
        const ndviValues = data.timeseries.map(d => d.ndvi);
        setStats({
          meanNDVI: (ndviValues.reduce((a, b) => a + b) / ndviValues.length).toFixed(3),
          maxNDVI: Math.max(...ndviValues).toFixed(3),
          dataPoints: data.timeseries.length,
          avgTemp: '--'
        });
      }

      setStatsLoading(false);
      setStatsVisible(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to detect bloom. Make sure the backend is running on localhost:5000');
      setStatsLoading(false);
    }
  };

  const updateNDVIChart = (data) => {
    if (!window.Chart || !chartRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    const dates = data.map(d => d.date);
    const ndviValues = data.map(d => d.ndvi);
    const eviValues = data.map(d => d.evi);

    chartInstanceRef.current = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'NDVI',
            data: ndviValues,
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          },
          {
            label: 'EVI',
            data: eviValues,
            borderColor: '#2196F3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          title: {
            display: true,
            text: 'Vegetation Indices Over Time'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 1,
            title: {
              display: true,
              text: 'Index Value'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] text-black">
      {/* Header */}
      <div className="sticky top-0 z-[1000] bg-white/95 backdrop-blur-[10px] px-[30px] py-5 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
        <h1 className="text-[2em] mb-[5px] bg-gradient-to-br from-[#667eea] to-[#764ba2] bg-clip-text text-transparent inline-block">
          🌸 BloomTracker
        </h1>
        <p className="text-[#666] text-[0.95em]">
          NASA Earth Observation Application for Global Flowering Phenology
        </p>
        <span className="inline-block bg-[#0B3D91] text-white px-[15px] py-[5px] rounded-[20px] text-[0.85em] mt-[10px] font-bold">
          🛰️ Powered by NASA POWER & EONET APIs
        </span>
      </div>

      <div className="max-w-[1400px] mx-auto my-[30px] px-5">
        {/* Controls Panel */}
        <div className="bg-white p-[25px] rounded-[15px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] mb-[30px]">
          <h2 className="mb-5">📍 Search Location & Date Range</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[15px] mb-5">
            <div>
              <label className="block mb-[5px] font-semibold text-[#555] text-[0.9em]">Latitude</label>
              <input
                type="number"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                step="0.01"
                min="-90"
                max="90"
                className="w-full p-[10px] border-2 border-[#e0e0e0] rounded-lg text-[0.95em] focus:outline-none focus:border-[#667eea]"
              />
            </div>
            <div>
              <label className="block mb-[5px] font-semibold text-[#555] text-[0.9em]">Longitude</label>
              <input
                type="number"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                step="0.01"
                min="-180"
                max="180"
                className="w-full p-[10px] border-2 border-[#e0e0e0] rounded-lg text-[0.95em] focus:outline-none focus:border-[#667eea]"
              />
            </div>
            <div>
              <label className="block mb-[5px] font-semibold text-[#555] text-[0.9em]">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-[10px] border-2 border-[#e0e0e0] rounded-lg text-[0.95em] focus:outline-none focus:border-[#667eea]"
              />
            </div>
            <div>
              <label className="block mb-[5px] font-semibold text-[#555] text-[0.9em]">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-[10px] border-2 border-[#e0e0e0] rounded-lg text-[0.95em] focus:outline-none focus:border-[#667eea]"
              />
            </div>
          </div>

          <div className="flex gap-[10px] flex-wrap">
            <button
              onClick={fetchVegetationData}
              className="px-[25px] py-3 border-none rounded-lg text-[0.95em] font-semibold cursor-pointer bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white inline-flex items-center gap-2 hover:translate-y-[-2px] hover:shadow-[0_5px_15px_rgba(102,126,234,0.4)] transition-all"
            >
              <span>🌱</span> Analyze Vegetation
            </button>
            <button
              onClick={detectBloom}
              className="px-[25px] py-3 border-none rounded-lg text-[0.95em] font-semibold cursor-pointer bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white inline-flex items-center gap-2 hover:translate-y-[-2px] hover:shadow-[0_5px_15px_rgba(102,126,234,0.4)] transition-all"
            >
              <span>🔍</span> Detect Bloom
            </button>
            <button
              onClick={() => loadPresetLocation('dc')}
              className="px-[25px] py-3 border-none rounded-lg text-[0.95em] font-semibold cursor-pointer bg-[#f0f0f0] text-[#333] inline-flex items-center gap-2 hover:bg-[#e0e0e0] transition-all"
            >
              📍 Washington DC
            </button>
            <button
              onClick={() => loadPresetLocation('tokyo')}
              className="px-[25px] py-3 border-none rounded-lg text-[0.95em] font-semibold cursor-pointer bg-[#f0f0f0] text-[#333] inline-flex items-center gap-2 hover:bg-[#e0e0e0] transition-all"
            >
              📍 Tokyo
            </button>
            <button
              onClick={() => loadPresetLocation('netherlands')}
              className="px-[25px] py-3 border-none rounded-lg text-[0.95em] font-semibold cursor-pointer bg-[#f0f0f0] text-[#333] inline-flex items-center gap-2 hover:bg-[#e0e0e0] transition-all"
            >
              📍 Netherlands
            </button>
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-[30px] mb-[30px]">
          {/* Map Card */}
          <div className="bg-white rounded-[15px] p-[25px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:translate-y-[-5px] transition-transform">
            <h2 className="text-[1.4em] mb-[15px] text-[#333] flex items-center gap-[10px]">
              <span>🗺️</span> Interactive Bloom Map
            </h2>
            <div ref={mapRef} className="h-[500px] rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.1)]"></div>
          </div>

          {/* NDVI Chart Card */}
          <div className="bg-white rounded-[15px] p-[25px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:translate-y-[-5px] transition-transform">
            <h2 className="text-[1.4em] mb-[15px] text-[#333] flex items-center gap-[10px]">
              <span>📊</span> NDVI Time Series Analysis
            </h2>
            <div className="relative h-[400px]">
              <canvas ref={chartRef}></canvas>
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="bg-white rounded-[15px] p-[25px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] mb-[30px] hover:translate-y-[-5px] transition-transform">
          <h2 className="text-[1.4em] mb-[15px] text-[#333] flex items-center gap-[10px]">
            <span>📈</span> Vegetation Statistics
          </h2>
          {statsLoading && (
            <div className="text-center py-10 text-[#667eea] text-[1.1em]">
              <div className="border-4 border-[#f3f3f3] border-t-4 border-t-[#667eea] rounded-full w-10 h-10 animate-spin mx-auto mb-5"></div>
              <p>Loading vegetation data...</p>
            </div>
          )}
          {statsVisible && (
            <div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-[15px] mt-5">
                <div className="bg-gradient-to-br from-[#667eea15] to-[#764ba215] p-5 rounded-[10px] text-center">
                  <div className="text-[2em] font-bold text-[#667eea] mb-[5px]">{stats.meanNDVI}</div>
                  <div className="text-[0.85em] text-[#666] uppercase">Mean NDVI</div>
                </div>
                <div className="bg-gradient-to-br from-[#667eea15] to-[#764ba215] p-5 rounded-[10px] text-center">
                  <div className="text-[2em] font-bold text-[#667eea] mb-[5px]">{stats.maxNDVI}</div>
                  <div className="text-[0.85em] text-[#666] uppercase">Peak NDVI</div>
                </div>
                <div className="bg-gradient-to-br from-[#667eea15] to-[#764ba215] p-5 rounded-[10px] text-center">
                  <div className="text-[2em] font-bold text-[#667eea] mb-[5px]">{stats.dataPoints}</div>
                  <div className="text-[0.85em] text-[#666] uppercase">Data Points</div>
                </div>
                <div className="bg-gradient-to-br from-[#667eea15] to-[#764ba215] p-5 rounded-[10px] text-center">
                  <div className="text-[2em] font-bold text-[#667eea] mb-[5px]">{stats.avgTemp}</div>
                  <div className="text-[0.85em] text-[#666] uppercase">Avg Temp (°C)</div>
                </div>
              </div>
              {bloomStatus && (
                <div className={`p-[15px] rounded-[10px] mt-[15px] font-semibold ${bloomStatus.detected
                  ? 'bg-[#4caf5020] text-[#2e7d32] border-l-4 border-[#4caf50]'
                  : 'bg-[#ff980020] text-[#ef6c00] border-l-4 border-[#ff9800]'
                  }`}>
                  {bloomStatus.detected ? (
                    <>
                      <strong>🌸 Bloom Detected!</strong><br />
                      Onset Date: {bloomStatus.onsetDate}<br />
                      Peak Date: {bloomStatus.peakDate}<br />
                      Peak NDVI: {bloomStatus.peakNDVI}<br />
                      Confidence: {bloomStatus.confidence}%
                    </>
                  ) : (
                    <strong>ℹ️ No significant bloom detected in this period</strong>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Species Bloom Calendar */}
        <div className="bg-white rounded-[15px] p-[25px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:translate-y-[-5px] transition-transform">
          <h2 className="text-[1.4em] mb-[15px] text-[#333] flex items-center gap-[10px]">
            <span>🌺</span> Species Bloom Calendar
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-[15px] mt-[15px]">
            <div className="bg-gradient-to-br from-[#667eea08] to-[#764ba208] p-[15px] rounded-[10px] border-2 border-[#e0e0e0] hover:border-[#667eea] hover:scale-[1.02] transition-all cursor-pointer">
              <h4 className="text-[#667eea] mb-2">🌸 Cherry Blossom</h4>
              <p className="text-[0.85em] text-[#666] my-[5px]"><strong>Scientific:</strong> Prunus serrulata</p>
              <p className="text-[0.85em] text-[#666] my-[5px]"><strong>Bloom:</strong> March - April</p>
              <p className="text-[0.85em] text-[#666] my-[5px]"><strong>Duration:</strong> 7-10 days</p>
            </div>
            <div className="bg-gradient-to-br from-[#667eea08] to-[#764ba208] p-[15px] rounded-[10px] border-2 border-[#e0e0e0] hover:border-[#667eea] hover:scale-[1.02] transition-all cursor-pointer">
              <h4 className="text-[#667eea] mb-2">🌷 Tulip</h4>
              <p className="text-[0.85em] text-[#666] my-[5px]"><strong>Scientific:</strong> Tulipa</p>
              <p className="text-[0.85em] text-[#666] my-[5px]"><strong>Bloom:</strong> April - May</p>
              <p className="text-[0.85em] text-[#666] my-[5px]"><strong>Duration:</strong> 14-21 days</p>
            </div>
            <div className="bg-gradient-to-br from-[#667eea08] to-[#764ba208] p-[15px] rounded-[10px] border-2 border-[#e0e0e0] hover:border-[#667eea] hover:scale-[1.02] transition-all cursor-pointer">
              <h4 className="text-[#667eea] mb-2">💜 Lavender</h4>
              <p className="text-[0.85em] text-[#666] my-[5px]"><strong>Scientific:</strong> Lavandula</p>
              <p className="text-[0.85em] text-[#666] my-[5px]"><strong>Bloom:</strong> June - August</p>
              <p className="text-[0.85em] text-[#666] my-[5px]"><strong>Duration:</strong> 60-90 days</p>
            </div>
            <div className="bg-gradient-to-br from-[#667eea08] to-[#764ba208] p-[15px] rounded-[10px] border-2 border-[#e0e0e0] hover:border-[#667eea] hover:scale-[1.02] transition-all cursor-pointer">
              <h4 className="text-[#667eea] mb-2">🌻 Sunflower</h4>
              <p className="text-[0.85em] text-[#666] my-[5px]"><strong>Scientific:</strong> Helianthus annuus</p>
              <p className="text-[0.85em] text-[#666] my-[5px]"><strong>Bloom:</strong> July - September</p>
              <p className="text-[0.85em] text-[#666] my-[5px]"><strong>Duration:</strong> 20-30 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-[30px] bg-white/95 mt-[50px] text-[#666]">
        <p><strong>BloomTracker</strong> - A NASA Space Apps Challenge Project</p>
        <p>Data Sources: NASA POWER API, NASA EONET, Weather-based NDVI Estimation</p>
        <p className="mt-[10px] text-[#999]">🛰️ Empowering global flowering phenology monitoring with Earth observation data</p>
      </div>
    </div>
  );
}