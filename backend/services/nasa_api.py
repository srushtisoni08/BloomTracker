import requests
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import json

class NASAEarthDataService:
    """Service for fetching NASA Earth observation data"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.modis_base_url = "https://modis.ornl.gov/rst/api/v1"
        self.appeears_base_url = "https://appeears.earthdatacloud.nasa.gov/api"
        self.session = requests.Session()
        
    def fetch_modis_ndvi(self, lat: float, lon: float, 
                         start_date: str, end_date: str,
                         product: str = "MOD13Q1") -> List[Dict]:
        """
        Fetch MODIS NDVI data for a location
        
        Args:
            lat: Latitude
            lon: Longitude
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            product: MODIS product (MOD13Q1 or MYD13Q1)
        
        Returns:
            List of dictionaries containing NDVI data
        """
        endpoint = f"{self.modis_base_url}/{product}/subset"
        
        params = {
            'latitude': lat,
            'longitude': lon,
            'startDate': start_date,
            'endDate': end_date,
            'kmAboveBelow': 0,
            'kmLeftRight': 0
        }
        
        try:
            response = self.session.get(endpoint, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            return self._parse_modis_response(data)
        except requests.exceptions.RequestException as e:
            print(f"Error fetching MODIS data: {e}")
            return []
    
    def _parse_modis_response(self, data: Dict) -> List[Dict]:
        """Parse MODIS API response"""
        results = []
        
        if 'subset' in data and len(data['subset']) > 0:
            subset = data['subset'][0]
            
            # Extract NDVI band data
            if 'data' in subset:
                for item in subset['data']:
                    if '250m_16_days_NDVI' in item:
                        results.append({
                            'date': item.get('calendar_date'),
                            'ndvi': float(item['250m_16_days_NDVI']) / 10000,  # Scale factor
                            'quality': item.get('250m_16_days_VI_Quality', 'unknown')
                        })
        
        return results
    
    def fetch_landsat_data(self, lat: float, lon: float,
                          start_date: str, end_date: str) -> List[Dict]:
        """
        Fetch Landsat surface reflectance data
        
        Args:
            lat: Latitude
            lon: Longitude  
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
        
        Returns:
            List of Landsat observations
        """
        # Placeholder - implement actual Landsat API integration
        # This would use the USGS Earth Explorer API or Google Earth Engine
        return []
    
    def calculate_phenology_metrics(self, ndvi_timeseries: List[Dict]) -> Dict:
        """
        Calculate phenology metrics from NDVI time series
        
        Args:
            ndvi_timeseries: List of NDVI observations with dates
        
        Returns:
            Dictionary containing phenology metrics
        """
        if len(ndvi_timeseries) < 3:
            return {'error': 'Insufficient data points'}
        
        # Sort by date
        sorted_data = sorted(ndvi_timeseries, key=lambda x: x['date'])
        ndvi_values = np.array([d['ndvi'] for d in sorted_data])
        dates = [datetime.strptime(d['date'], '%Y-%m-%d') for d in sorted_data]
        
        # Calculate metrics
        max_ndvi = float(np.max(ndvi_values))
        min_ndvi = float(np.min(ndvi_values))
        mean_ndvi = float(np.mean(ndvi_values))
        amplitude = max_ndvi - min_ndvi
        
        # Find green-up onset (rapid increase)
        derivatives = np.diff(ndvi_values)
        greenup_idx = np.argmax(derivatives)
        
        # Find peak (maximum NDVI)
        peak_idx = np.argmax(ndvi_values)
        
        # Find senescence (rapid decrease after peak)
        if peak_idx < len(derivatives) - 1:
            post_peak_derivatives = derivatives[peak_idx:]
            senescence_idx = peak_idx + np.argmin(post_peak_derivatives)
        else:
            senescence_idx = len(ndvi_values) - 1
        
        return {
            'max_ndvi': max_ndvi,
            'min_ndvi': min_ndvi,
            'mean_ndvi': mean_ndvi,
            'amplitude': amplitude,
            'greenup_date': dates[greenup_idx].strftime('%Y-%m-%d'),
            'peak_date': dates[peak_idx].strftime('%Y-%m-%d'),
            'senescence_date': dates[senescence_idx].strftime('%Y-%m-%d'),
            'growing_season_length': (dates[senescence_idx] - dates[greenup_idx]).days
        }
    
    def detect_anomalies(self, current_ndvi: List[Dict], 
                        historical_ndvi: List[List[Dict]]) -> Dict:
        """
        Detect phenology anomalies by comparing current year to historical data
        
        Args:
            current_ndvi: Current year NDVI data
            historical_ndvi: List of historical year NDVI data
        
        Returns:
            Anomaly detection results
        """
        if not historical_ndvi or not current_ndvi:
            return {'error': 'Insufficient data'}
        
        # Calculate current metrics
        current_metrics = self.calculate_phenology_metrics(current_ndvi)
        
        # Calculate historical average metrics
        historical_metrics = [
            self.calculate_phenology_metrics(year_data) 
            for year_data in historical_ndvi
        ]
        
        historical_peaks = [
            datetime.strptime(m['peak_date'], '%Y-%m-%d').timetuple().tm_yday 
            for m in historical_metrics if 'peak_date' in m
        ]
        
        if not historical_peaks:
            return {'error': 'Insufficient historical data'}
        
        avg_peak_day = np.mean(historical_peaks)
        std_peak_day = np.std(historical_peaks)
        
        current_peak_day = datetime.strptime(
            current_metrics['peak_date'], '%Y-%m-%d'
        ).timetuple().tm_yday
        
        # Calculate z-score
        z_score = (current_peak_day - avg_peak_day) / (std_peak_day + 1e-10)
        
        anomaly_detected = abs(z_score) > 2  # 2 standard deviations
        
        return {
            'anomaly_detected': anomaly_detected,
            'z_score': float(z_score),
            'current_peak_day': current_peak_day,
            'historical_avg_peak_day': float(avg_peak_day),
            'days_difference': int(current_peak_day - avg_peak_day),
            'interpretation': self._interpret_anomaly(z_score)
        }
    
    def _interpret_anomaly(self, z_score: float) -> str:
        """Interpret phenology anomaly"""
        if z_score > 2:
            return "Significantly delayed bloom (possibly due to cooler temperatures or drought)"
        elif z_score < -2:
            return "Significantly early bloom (possibly due to warmer temperatures)"
        elif z_score > 1:
            return "Moderately delayed bloom"
        elif z_score < -1:
            return "Moderately early bloom"
        else:
            return "Normal bloom timing"


class BloomPredictionService:
    """Service for predicting bloom events"""
    
    def __init__(self):
        self.models = {}
    
    def train_simple_model(self, historical_data: List[Dict]) -> Dict:
        """
        Train a simple bloom prediction model
        
        Args:
            historical_data: Historical bloom events with dates and conditions
        
        Returns:
            Model parameters
        """
        if len(historical_data) < 3:
            return {'error': 'Insufficient training data'}
        
        bloom_days = [d['day_of_year'] for d in historical_data]
        years = list(range(len(bloom_days)))
        
        # Simple linear regression
        coeffs = np.polyfit(years, bloom_days, 1)
        
        return {
            'slope': float(coeffs[0]),
            'intercept': float(coeffs[1]),
            'trend': 'earlier' if coeffs[0] < 0 else 'later',
            'days_per_year': abs(float(coeffs[0]))
        }
    
    def predict_bloom_date(self, lat: float, lon: float, 
                          historical_data: List[Dict],
                          year: Optional[int] = None) -> Dict:
        """
        Predict bloom date for a location
        
        Args:
            lat: Latitude
            lon: Longitude
            historical_data: Historical bloom data
            year: Target year (default: current year)
        
        Returns:
            Bloom prediction
        """
        if not historical_data:
            return {'error': 'No historical data available'}
        
        if year is None:
            year = datetime.now().year
        
        # Train model
        model = self.train_simple_model(historical_data)
        
        if 'error' in model:
            return model
        
        # Predict
        years_from_start = len(historical_data)
        predicted_day = int(model['slope'] * years_from_start + model['intercept'])
        
        # Convert day of year to date
        predicted_date = datetime(year, 1, 1) + timedelta(days=predicted_day - 1)
        
        # Calculate confidence interval (simple approach)
        bloom_days = [d['day_of_year'] for d in historical_data]
        std_dev = np.std(bloom_days)
        
        return {
            'predicted_date': predicted_date.strftime('%Y-%m-%d'),
            'confidence_interval_days': int(std_dev * 1.96),  # 95% CI
            'earliest_date': (predicted_date - timedelta(days=int(std_dev * 1.96))).strftime('%Y-%m-%d'),
            'latest_date': (predicted_date + timedelta(days=int(std_dev * 1.96))).strftime('%Y-%m-%d'),
            'trend': model['trend'],
            'confidence': 'high' if std_dev < 7 else 'medium' if std_dev < 14 else 'low'
        }


class GlobalBloomMonitor:
    """Monitor bloom events across multiple regions"""
    
    def __init__(self, nasa_service: NASAEarthDataService):
        self.nasa_service = nasa_service
        self.regions = {}
    
    def add_region(self, name: str, bounds: Dict):
        """Add a region to monitor"""
        self.regions[name] = bounds
    
    def scan_region(self, region_name: str, date: str) -> List[Dict]:
        """
        Scan a region for bloom events
        
        Args:
            region_name: Name of the region to scan
            date: Date to scan (YYYY-MM-DD)
        
        Returns:
            List of bloom detections
        """
        if region_name not in self.regions:
            return []
        
        bounds = self.regions[region_name]
        detections = []
        
        # Grid sampling across region
        lat_step = (bounds['max_lat'] - bounds['min_lat']) / 10
        lon_step = (bounds['max_lon'] - bounds['min_lon']) / 10
        
        for lat in np.arange(bounds['min_lat'], bounds['max_lat'], lat_step):
            for lon in np.arange(bounds['min_lon'], bounds['max_lon'], lon_step):
                # Fetch NDVI for this point
                end_date = datetime.strptime(date, '%Y-%m-%d')
                start_date = end_date - timedelta(days=30)
                
                ndvi_data = self.nasa_service.fetch_modis_ndvi(
                    lat, lon,
                    start_date.strftime('%Y-%m-%d'),
                    end_date.strftime('%Y-%m-%d')
                )
                
                if ndvi_data:
                    avg_ndvi = np.mean([d['ndvi'] for d in ndvi_data])
                    
                    if avg_ndvi > 0.6:  # Bloom threshold
                        detections.append({
                            'lat': float(lat),
                            'lon': float(lon),
                            'ndvi': float(avg_ndvi),
                            'status': 'blooming',
                            'date': date
                        })
        
        return detections
    
    def generate_bloom_report(self, region_name: str, 
                            start_date: str, end_date: str) -> Dict:
        """Generate comprehensive bloom report for a region"""
        
        detections_over_time = []
        current = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        
        while current <= end:
            detections = self.scan_region(region_name, current.strftime('%Y-%m-%d'))
            detections_over_time.append({
                'date': current.strftime('%Y-%m-%d'),
                'bloom_count': len(detections),
                'detections': detections
            })
            current += timedelta(days=7)
        
        return {
            'region': region_name,
            'time_range': {'start': start_date, 'end': end_date},
            'timeline': detections_over_time,
            'total_bloom_events': sum(d['bloom_count'] for d in detections_over_time)
        }