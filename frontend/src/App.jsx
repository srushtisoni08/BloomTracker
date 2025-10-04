import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, TrendingUp, Leaf, Search, Activity, AlertCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function BloomWatchApp() {
  const [activeTab, setActiveTab] = useState('map');
  const [location, setLocation] = useState({ lat: 38.9, lon: -77.0, name: 'Washington DC' });
  const [vegetationData, setVegetationData] = useState(null);
  const [bloomDetection, setBloomDetection] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [species, setSpecies] = useState(null);

  // Fetch species data on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/species/bloom-calendar`)
      .then(res => res.json())
      .then(data => setSpecies(data))
      .catch(err => console.error('Error fetching species:', err));
  }, []);

  // Fetch vegetation data
  const fetchVegetationData = async () => {
    setLoading(true);
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await fetch(
        `${API_BASE_URL}/vegetation/indices?lat=${location.lat}&lon=${location.lon}&start_date=${startDate}&end_date=${endDate}`
      );
      const data = await response.json();
      setVegetationData(data);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  // Detect bloom
  const detectBloom = async () => {
    setLoading(true);
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await fetch(`${API_BASE_URL}/bloom/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: location.lat,
          lon: location.lon,
          start_date: startDate,
          end_date: endDate
        })
      });
      const data = await response.json();
      setBloomDetection(data);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  // Predict bloom
  const predictBloom = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/bloom/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: location.lat,
          lon: location.lon,
          years_back: 5
        })
      });
      const data = await response.json();
      setPrediction(data);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  // Famous bloom locations
  const locations = [
    { name: 'Washington DC', lat: 38.89, lon: -77.04, icon: '🌸' },
    { name: 'Tokyo, Japan', lat: 35.68, lon: 139.65, icon: '🌸' },
    { name: 'Netherlands', lat: 52.37, lon: 4.89, icon: '🌷' },
    { name: 'Provence, France', lat: 43.95, lon: 5.70, icon: '💜' },
    { name: 'California', lat: 36.78, lon: -119.42, icon: '🌻' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b-4 border-emerald-400">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-3 rounded-xl">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  BloomWatch
                </h1>
                <p className="text-sm text-gray-600">Global Flowering Phenology Monitor</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>Powered by NASA Earth Observations</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            {[
              { id: 'map', label: 'Bloom Map', icon: MapPin },
              { id: 'detect', label: 'Detect Bloom', icon: Search },
              { id: 'predict', label: 'Predict Bloom', icon: TrendingUp },
              { id: 'species', label: 'Species Calendar', icon: Calendar }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'border-b-4 border-emerald-500 text-emerald-600'
                    : 'text-gray-600 hover:text-emerald-500 hover:bg-emerald-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Location Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-2 border-emerald-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-emerald-500" />
            Select Location
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {locations.map(loc => (
              <button
                key={loc.name}
                onClick={() => setLocation(loc)}
                className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                  location.name === loc.name
                    ? 'border-emerald-500 bg-emerald-50 shadow-md'
                    : 'border-gray-200 hover:border-emerald-300'
                }`}
              >
                <div className="text-3xl mb-2">{loc.icon}</div>
                <div className="text-sm font-medium text-gray-800">{loc.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {loc.lat.toFixed(2)}°, {loc.lon.toFixed(2)}°
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            {/* Simple Map Visualization */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-emerald-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Current Location</h2>
              <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">
                  {locations.find(l => l.name === location.name)?.icon || '🌍'}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{location.name}</h3>
                <p className="text-gray-600">
                  Latitude: {location.lat}° | Longitude: {location.lon}°
                </p>
                <button
                  onClick={fetchVegetationData}
                  disabled={loading}
                  className="mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Fetch Vegetation Data'}
                </button>
              </div>
            </div>

            {/* Vegetation Data Display */}
            {vegetationData && (
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-emerald-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Vegetation Indices</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Mean NDVI</div>
                    <div className="text-2xl font-bold text-emerald-600">
                      {vegetationData.statistics?.mean_ndvi}
                    </div>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Max NDVI</div>
                    <div className="text-2xl font-bold text-teal-600">
                      {vegetationData.statistics?.max_ndvi}
                    </div>
                  </div>
                  <div className="bg-cyan-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Data Points</div>
                    <div className="text-2xl font-bold text-cyan-600">
                      {vegetationData.statistics?.data_points}
                    </div>
                  </div>
                </div>
                
                {/* Simple Chart */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">NDVI Time Series</h3>
                  <div className="flex items-end justify-between h-32 space-x-1">
                    {vegetationData.data?.slice(0, 20).map((d, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-t hover:from-emerald-600 transition-all"
                        style={{ height: `${d.ndvi * 100}%` }}
                        title={`${d.date}: ${d.ndvi}`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    Last {Math.min(20, vegetationData.data?.length || 0)} measurements
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'detect' && (
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-emerald-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Bloom Detection</h2>
            <p className="text-gray-600 mb-6">
              Detect flowering events using satellite-derived vegetation indices
            </p>
            
            <button
              onClick={detectBloom}
              disabled={loading}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 mb-6"
            >
              {loading ? 'Analyzing...' : 'Detect Bloom Events'}
            </button>

            {bloomDetection && (
              <div className={`p-6 rounded-lg ${bloomDetection.bloom_detected ? 'bg-emerald-50 border-2 border-emerald-300' : 'bg-gray-50 border-2 border-gray-300'}`}>
                {bloomDetection.bloom_detected ? (
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Leaf className="w-6 h-6 text-emerald-600" />
                      <h3 className="text-xl font-bold text-emerald-700">Bloom Detected!</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Bloom Onset Date</div>
                        <div className="text-lg font-semibold text-gray-800">
                          {bloomDetection.bloom_event?.bloom_onset_date}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Peak Date</div>
                        <div className="text-lg font-semibold text-gray-800">
                          {bloomDetection.bloom_event?.peak_date}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Peak NDVI</div>
                        <div className="text-lg font-semibold text-gray-800">
                          {bloomDetection.bloom_event?.peak_ndvi?.toFixed(3)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Confidence</div>
                        <div className="text-lg font-semibold text-gray-800">
                          {(bloomDetection.bloom_event?.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    {bloomDetection.recommendation && (
                      <div className="mt-4 p-3 bg-white rounded-lg">
                        <AlertCircle className="w-5 h-5 text-emerald-600 inline mr-2" />
                        <span className="text-sm text-gray-700">{bloomDetection.recommendation}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Bloom Detected</h3>
                    <p className="text-gray-600">{bloomDetection.message}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'predict' && (
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-emerald-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Bloom Prediction</h2>
            <p className="text-gray-600 mb-6">
              Predict bloom timing based on historical phenology patterns
            </p>
            
            <button
              onClick={predictBloom}
              disabled={loading}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all disabled:opacity-50 mb-6"
            >
              {loading ? 'Predicting...' : 'Predict Bloom Window'}
            </button>

            {prediction?.prediction && (
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-lg border-2 border-teal-300">
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="w-6 h-6 text-teal-600" />
                  <h3 className="text-xl font-bold text-teal-700">Bloom Prediction</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Predicted Date</div>
                    <div className="text-lg font-bold text-teal-600">
                      {prediction.prediction.predicted_date}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Window Start</div>
                    <div className="text-lg font-semibold text-gray-800">
                      {prediction.prediction.earliest_date}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Window End</div>
                    <div className="text-lg font-semibold text-gray-800">
                      {prediction.prediction.latest_date}
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Confidence Level</span>
                    <span className="text-lg font-bold text-teal-600 uppercase">
                      {prediction.prediction.confidence}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'species' && species && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Bloom Calendar by Species</h2>
            {Object.entries(species).map(([key, sp]) => (
              <div key={key} className="bg-white rounded-xl shadow-lg p-6 border-2 border-emerald-200 hover:border-emerald-400 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{sp.common_name}</h3>
                    <p className="text-sm italic text-gray-600 mb-3">{sp.scientific_name}</p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-gray-700">
                          Bloom Months: {sp.typical_bloom_months.join(', ')}
                        </span>
                      </div>
                      {sp.duration_days && (
                        <div className="text-sm text-gray-600">
                          Duration: {sp.duration_days} days
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {sp.famous_locations && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Famous Locations:</div>
                    <div className="flex flex-wrap gap-2">
                      {sp.famous_locations.map((loc, i) => (
                        <span key={i} className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">
                          {loc.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-2">🛰️ Powered by NASA Earth Observations</p>
          <p className="text-sm text-gray-400">
            Data from MODIS, Landsat & Sentinel satellites
          </p>
        </div>
      </footer>
    </div>
  );
}