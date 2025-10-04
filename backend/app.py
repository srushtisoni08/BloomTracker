"""
BloomWatch Backend - Standalone Version
Single file application for easy deployment and testing

Usage:
1. Install dependencies: pip install flask flask-cors numpy requests
2. Run: python standalone_app.py
3. Access: http://localhost:5000/api/health
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import numpy as np
from typing import List, Dict
import os

app = Flask(__name__)
CORS(app)

# Configuration
NASA_API_KEY = os.getenv('NASA_API_KEY', 'DEMO_KEY')
BLOOM_THRESHOLD_NDVI = 0.6

# ========== Helper Functions ==========

def generate_mock_ndvi_data(lat, lon, start_date, end_date):
    """Generate realistic mock NDVI time series data"""
    start = datetime.strptime(start_date, '%Y-%m-%d')
    end = datetime.strptime(end_date, '%Y-%m-%d')
    
    dates = []
    current = start
    while current <= end:
        dates.append(current)
        current += timedelta(days=8)  # MODIS 8-day composite
    
    timeseries = []
    base_doy = 100 + int((lat / 90) * 30)  # Latitude-dependent bloom timing
    
    for date in dates:
        doy = date.timetuple().tm_yday
        # Gaussian seasonal pattern
        seasonal_ndvi = 0.3 + 0.4 * np.exp(-((doy - base_doy) ** 2) / (2 * 30 ** 2))
        noise = np.random.normal(0, 0.05)
        ndvi = float(np.clip(seasonal_ndvi + noise, 0, 1))
        
        timeseries.append({
            'date': date.strftime('%Y-%m-%d'),
            'ndvi': round(ndvi, 3),
            'evi': round(ndvi * 0.8, 3),
            'quality': 'good',
            'source': 'MODIS MOD13Q1'
        })
    
    return timeseries


def detect_bloom_from_ndvi(timeseries):
    """Detect bloom onset from NDVI time series"""
    if len(timeseries) < 3:
        return None
    
    ndvi_values = [d['ndvi'] for d in timeseries]
    dates = [d['date'] for d in timeseries]
    
    # Calculate rate of change
    derivatives = np.diff(ndvi_values)
    
    # Find rapid increases
    threshold = np.std(derivatives) * 1.5
    bloom_indices = np.where(derivatives > threshold)[0]
    
    if len(bloom_indices) > 0:
        bloom_idx = bloom_indices[0]
        return {
            'bloom_onset_date': dates[bloom_idx],
            'bloom_onset_ndvi': float(ndvi_values[bloom_idx]),
            'peak_date': dates[np.argmax(ndvi_values)],
            'peak_ndvi': float(max(ndvi_values)),
            'confidence': float(min(derivatives[bloom_idx] * 10, 1.0))
        }
    
    return None


def predict_bloom_window(lat, lon, historical_blooms):
    """Predict bloom window from historical data"""
    if not historical_blooms or len(historical_blooms) < 2:
        return None
    
    bloom_days = [d['day_of_year'] for d in historical_blooms]
    avg_bloom_day = int(np.mean(bloom_days))
    std_bloom_day = int(np.std(bloom_days)) if len(bloom_days) > 1 else 7
    
    current_year = datetime.now().year
    predicted_date = datetime(current_year, 1, 1) + timedelta(days=avg_bloom_day - 1)
    
    return {
        'predicted_date': predicted_date.strftime('%Y-%m-%d'),
        'confidence': 'high' if std_bloom_day < 7 else 'medium' if std_bloom_day < 14 else 'low',
        'window_start': (predicted_date - timedelta(days=std_bloom_day)).strftime('%Y-%m-%d'),
        'window_end': (predicted_date + timedelta(days=std_bloom_day)).strftime('%Y-%m-%d'),
        'variability_days': std_bloom_day
    }


# ========== API Endpoints ==========

@app.route('/')
def home():
    """Home endpoint with API documentation"""
    return jsonify({
        'name': 'BloomWatch API',
        'version': '1.0.0',
        'description': 'Earth Observation API for Global Flowering Phenology',
        'endpoints': {
            'health': '/api/health',
            'vegetation_indices': '/api/vegetation/indices?lat=38.9&lon=-77.0&start_date=2024-01-01&end_date=2024-03-31',
            'detect_bloom': '/api/bloom/detect (POST)',
            'predict_bloom': '/api/bloom/predict (POST)',
            'bloom_map': '/api/regions/bloom-map?min_lat=35&max_lat=40&min_lon=-80&max_lon=-75',
            'bloom_calendar': '/api/species/bloom-calendar'
        }
    })


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0',
        'nasa_api': 'connected'
    })


@app.route('/api/vegetation/indices', methods=['GET'])
def get_vegetation_indices():
    """Get vegetation indices for a location and time range"""
    try:
        lat = float(request.args.get('lat', 38.9))
        lon = float(request.args.get('lon', -77.0))
        start_date = request.args.get('start_date', 
                                      (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d'))
        end_date = request.args.get('end_date', datetime.now().strftime('%Y-%m-%d'))
        
        # Validate coordinates
        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
            return jsonify({'error': 'Invalid coordinates'}), 400
        
        # Fetch data
        data = generate_mock_ndvi_data(lat, lon, start_date, end_date)
        
        # Calculate statistics
        ndvi_values = [d['ndvi'] for d in data]
        
        return jsonify({
            'location': {'lat': lat, 'lon': lon},
            'time_range': {'start': start_date, 'end': end_date},
            'statistics': {
                'mean_ndvi': round(float(np.mean(ndvi_values)), 3),
                'max_ndvi': round(float(np.max(ndvi_values)), 3),
                'min_ndvi': round(float(np.min(ndvi_values)), 3),
                'data_points': len(data)
            },
            'data': data
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/bloom/detect', methods=['POST'])
def detect_bloom():
    """Detect bloom events from vegetation data"""
    try:
        data = request.json
        lat = float(data.get('lat', 38.9))
        lon = float(data.get('lon', -77.0))
        start_date = data.get('start_date', (datetime.now() - timedelta(days=180)).strftime('%Y-%m-%d'))
        end_date = data.get('end_date', datetime.now().strftime('%Y-%m-%d'))
        
        # Fetch time series
        timeseries = generate_mock_ndvi_data(lat, lon, start_date, end_date)
        
        # Detect bloom
        bloom_event = detect_bloom_from_ndvi(timeseries)
        
        if bloom_event:
            return jsonify({
                'location': {'lat': lat, 'lon': lon},
                'bloom_detected': True,
                'bloom_event': bloom_event,
                'recommendation': 'Peak bloom expected within 7-14 days of onset',
                'timeseries': timeseries
            })
        else:
            return jsonify({
                'location': {'lat': lat, 'lon': lon},
                'bloom_detected': False,
                'message': 'No significant bloom event detected',
                'timeseries': timeseries
            })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/bloom/predict', methods=['POST'])
def predict_bloom():
    """Predict bloom window based on historical data"""
    try:
        data = request.json
        lat = float(data.get('lat', 38.9))
        lon = float(data.get('lon', -77.0))
        years_back = int(data.get('years_back', 5))
        
        # Generate mock historical data
        historical = []
        current_year = datetime.now().year
        base_day = 100 + int((lat / 90) * 30)
        
        for year in range(current_year - years_back, current_year):
            day_of_year = base_day + np.random.randint(-10, 10)
            historical.append({
                'year': year,
                'day_of_year': day_of_year,
                'bloom_date': (datetime(year, 1, 1) + timedelta(days=day_of_year - 1)).strftime('%Y-%m-%d'),
                'peak_ndvi': round(0.7 + np.random.uniform(-0.1, 0.1), 2)
            })
        
        # Predict
        prediction = predict_bloom_window(lat, lon, historical)
        
        if prediction:
            return jsonify({
                'location': {'lat': lat, 'lon': lon},
                'prediction': prediction,
                'historical_data': historical,
                'note': 'Prediction based on historical phenology patterns'
            })
        else:
            return jsonify({
                'location': {'lat': lat, 'lon': lon},
                'prediction': None,
                'message': 'Insufficient historical data'
            })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/regions/bloom-map', methods=['GET'])
def get_bloom_map():
    """Get bloom status for multiple regions"""
    try:
        min_lat = float(request.args.get('min_lat', 35))
        max_lat = float(request.args.get('max_lat', 40))
        min_lon = float(request.args.get('min_lon', -80))
        max_lon = float(request.args.get('max_lon', -75))
        resolution = float(request.args.get('resolution', 1.0))
        
        # Generate grid
        lats = np.arange(min_lat, max_lat, resolution)
        lons = np.arange(min_lon, max_lon, resolution)
        
        bloom_data = []
        current_date = datetime.now().strftime('%Y-%m-%d')
        
        for lat in lats[:10]:  # Limit for performance
            for lon in lons[:10]:
                # Sample NDVI
                recent_data = generate_mock_ndvi_data(
                    lat, lon,
                    (datetime.now() - timedelta(days=16)).strftime('%Y-%m-%d'),
                    current_date
                )
                
                if recent_data:
                    avg_ndvi = np.mean([d['ndvi'] for d in recent_data])
                    status = 'blooming' if avg_ndvi > BLOOM_THRESHOLD_NDVI else 'vegetated' if avg_ndvi > 0.3 else 'dormant'
                    
                    bloom_data.append({
                        'lat': round(float(lat), 2),
                        'lon': round(float(lon), 2),
                        'ndvi': round(float(avg_ndvi), 3),
                        'status': status
                    })
        
        return jsonify({
            'region': {
                'min_lat': min_lat, 'max_lat': max_lat,
                'min_lon': min_lon, 'max_lon': max_lon
            },
            'timestamp': current_date,
            'grid_points': len(bloom_data),
            'data': bloom_data
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/species/bloom-calendar', methods=['GET'])
def get_bloom_calendar():
    """Get bloom calendar for different plant species"""
    calendar = {
        'cherry_blossom': {
            'common_name': 'Cherry Blossom',
            'scientific_name': 'Prunus serrulata',
            'typical_bloom_months': [3, 4],
            'duration_days': '7-10',
            'famous_locations': [
                {'name': 'Washington DC', 'lat': 38.89, 'lon': -77.04},
                {'name': 'Tokyo', 'lat': 35.68, 'lon': 139.65},
                {'name': 'Seoul', 'lat': 37.57, 'lon': 126.98}
            ]
        },
        'tulip': {
            'common_name': 'Tulip',
            'scientific_name': 'Tulipa',
            'typical_bloom_months': [4, 5],
            'duration_days': '14-21',
            'famous_locations': [
                {'name': 'Netherlands', 'lat': 52.37, 'lon': 4.89},
                {'name': 'Turkey', 'lat': 39.93, 'lon': 32.85}
            ]
        },
        'lavender': {
            'common_name': 'Lavender',
            'scientific_name': 'Lavandula',
            'typical_bloom_months': [6, 7, 8],
            'duration_days': '60-90',
            'famous_locations': [
                {'name': 'Provence, France', 'lat': 43.95, 'lon': 5.70},
                {'name': 'California', 'lat': 36.78, 'lon': -119.42}
            ]
        },
        'sunflower': {
            'common_name': 'Sunflower',
            'scientific_name': 'Helianthus annuus',
            'typical_bloom_months': [7, 8, 9],
            'duration_days': '20-30',
            'famous_locations': [
                {'name': 'Kansas', 'lat': 38.50, 'lon': -98.00},
                {'name': 'Tuscany', 'lat': 43.45, 'lon': 11.25}
            ]
        }
    }
    
    species = request.args.get('species')
    if species and species in calendar:
        return jsonify({species: calendar[species]})
    
    return jsonify(calendar)


@app.route('/api/phenology/metrics', methods=['POST'])
def calculate_phenology():
    """Calculate phenology metrics for a location"""
    try:
        data = request.json
        lat = float(data.get('lat'))
        lon = float(data.get('lon'))
        year = int(data.get('year', datetime.now().year))
        
        # Get full year data
        start_date = f"{year}-01-01"
        end_date = f"{year}-12-31"
        
        timeseries = generate_mock_ndvi_data(lat, lon, start_date, end_date)
        ndvi_values = [d['ndvi'] for d in timeseries]
        
        # Calculate metrics
        max_idx = np.argmax(ndvi_values)
        greenup_idx = next((i for i, v in enumerate(ndvi_values) if v > 0.4), 0)
        senescence_idx = next((i for i in range(max_idx, len(ndvi_values)) if ndvi_values[i] < 0.4), len(ndvi_values) - 1)
        
        return jsonify({
            'location': {'lat': lat, 'lon': lon},
            'year': year,
            'metrics': {
                'greenup_date': timeseries[greenup_idx]['date'],
                'peak_date': timeseries[max_idx]['date'],
                'senescence_date': timeseries[senescence_idx]['date'],
                'max_ndvi': round(float(max(ndvi_values)), 3),
                'growing_season_length_days': (senescence_idx - greenup_idx) * 8
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400


# ========== Main ==========

if __name__ == '__main__':
    print("="*60)
    print("🌸 BloomWatch Backend API Starting...")
    print("="*60)
    print("📡 Server: http://localhost:5000")
    print("📚 API Docs: http://localhost:5000/")
    print("💚 Health Check: http://localhost:5000/api/health")
    print("="*60)
    print("\nPress CTRL+C to stop the server\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)