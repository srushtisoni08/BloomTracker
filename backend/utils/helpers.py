import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Optional
import hashlib

def calculate_distance(lat1: float, lon1: float, 
                      lat2: float, lon2: float) -> float:
    """
    Calculate distance between two points using Haversine formula
    
    Args:
        lat1, lon1: First point coordinates
        lat2, lon2: Second point coordinates
    
    Returns:
        Distance in kilometers
    """
    R = 6371  # Earth's radius in km
    
    lat1_rad = np.radians(lat1)
    lat2_rad = np.radians(lat2)
    delta_lat = np.radians(lat2 - lat1)
    delta_lon = np.radians(lon2 - lon1)
    
    a = (np.sin(delta_lat / 2) ** 2 + 
         np.cos(lat1_rad) * np.cos(lat2_rad) * 
         np.sin(delta_lon / 2) ** 2)
    
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
    
    return R * c


def generate_grid_points(min_lat: float, max_lat: float,
                        min_lon: float, max_lon: float,
                        resolution: float) -> List[Tuple[float, float]]:
    """
    Generate a grid of lat/lon points
    
    Args:
        min_lat, max_lat: Latitude bounds
        min_lon, max_lon: Longitude bounds
        resolution: Grid resolution in degrees
    
    Returns:
        List of (lat, lon) tuples
    """
    lats = np.arange(min_lat, max_lat, resolution)
    lons = np.arange(min_lon, max_lon, resolution)
    
    grid_points = []
    for lat in lats:
        for lon in lons:
            grid_points.append((float(lat), float(lon)))
    
    return grid_points


def smooth_timeseries(values: List[float], window_size: int = 3) -> List[float]:
    """
    Apply moving average smoothing to time series
    
    Args:
        values: List of values
        window_size: Size of smoothing window
    
    Returns:
        Smoothed values
    """
    if len(values) < window_size:
        return values
    
    smoothed = []
    for i in range(len(values)):
        start = max(0, i - window_size // 2)
        end = min(len(values), i + window_size // 2 + 1)
        window = values[start:end]
        smoothed.append(sum(window) / len(window))
    
    return smoothed


def interpolate_missing_values(timeseries: List[Dict], 
                               value_key: str = 'ndvi') -> List[Dict]:
    """
    Interpolate missing values in time series
    
    Args:
        timeseries: List of dictionaries with date and value
        value_key: Key for the value to interpolate
    
    Returns:
        Time series with interpolated values
    """
    if not timeseries:
        return []
    
    # Sort by date
    sorted_ts = sorted(timeseries, key=lambda x: x['date'])
    
    # Find gaps
    result = []
    for i, item in enumerate(sorted_ts):
        result.append(item)
        
        if i < len(sorted_ts) - 1:
            current_date = datetime.strptime(item['date'], '%Y-%m-%d')
            next_date = datetime.strptime(sorted_ts[i + 1]['date'], '%Y-%m-%d')
            gap_days = (next_date - current_date).days
            
            # If gap is larger than typical interval, interpolate
            if gap_days > 16:  # MODIS is 8-day composite
                num_points = gap_days // 8
                current_val = item[value_key]
                next_val = sorted_ts[i + 1][value_key]
                
                for j in range(1, num_points):
                    interp_date = current_date + timedelta(days=8 * j)
                    interp_val = current_val + (next_val - current_val) * (j / num_points)
                    
                    result.append({
                        'date': interp_date.strftime('%Y-%m-%d'),
                        value_key: interp_val,
                        'interpolated': True
                    })
    
    return result


def calculate_growing_degree_days(temp_min: List[float], 
                                  temp_max: List[float],
                                  base_temp: float = 10.0) -> List[float]:
    """
    Calculate Growing Degree Days (GDD)
    
    Args:
        temp_min: Daily minimum temperatures (Celsius)
        temp_max: Daily maximum temperatures (Celsius)
        base_temp: Base temperature for GDD calculation
    
    Returns:
        List of daily GDD values
    """
    gdd = []
    for tmin, tmax in zip(temp_min, temp_max):
        avg_temp = (tmin + tmax) / 2
        daily_gdd = max(0, avg_temp - base_temp)
        gdd.append(daily_gdd)
    
    return gdd


def detect_outliers(values: List[float], threshold: float = 2.5) -> List[int]:
    """
    Detect outliers using z-score method
    
    Args:
        values: List of values
        threshold: Z-score threshold for outlier detection
    
    Returns:
        Indices of outliers
    """
    if len(values) < 3:
        return []
    
    mean = np.mean(values)
    std = np.std(values)
    
    if std == 0:
        return []
    
    z_scores = [(v - mean) / std for v in values]
    outliers = [i for i, z in enumerate(z_scores) if abs(z) > threshold]
    
    return outliers


def calculate_phenology_stage(ndvi: float) -> str:
    """
    Determine phenology stage based on NDVI value
    
    Args:
        ndvi: NDVI value (0-1)
    
    Returns:
        Phenology stage description
    """
    if ndvi < 0.2:
        return 'dormant'
    elif ndvi < 0.4:
        return 'early_greenup'
    elif ndvi < 0.6:
        return 'greenup'
    elif ndvi < 0.75:
        return 'peak_green'
    elif ndvi < 0.85:
        return 'blooming'
    else:
        return 'mature'


def generate_event_id(lat: float, lon: float, date: str, 
                     species: str) -> str:
    """
    Generate unique event ID
    
    Args:
        lat, lon: Coordinates
        date: Date string
        species: Species name
    
    Returns:
        Unique event ID
    """
    data = f"{lat:.4f}_{lon:.4f}_{date}_{species}"
    return hashlib.md5(data.encode()).hexdigest()[:16]


def format_confidence_score(score: float) -> str:
    """
    Convert numeric confidence score to descriptive text
    
    Args:
        score: Confidence score (0-1)
    
    Returns:
        Confidence description
    """
    if score >= 0.9:
        return 'very_high'
    elif score >= 0.7:
        return 'high'
    elif score >= 0.5:
        return 'medium'
    elif score >= 0.3:
        return 'low'
    else:
        return 'very_low'


def validate_coordinates(lat: float, lon: float) -> bool:
    """
    Validate latitude and longitude values
    
    Args:
        lat: Latitude
        lon: Longitude
    
    Returns:
        True if valid, False otherwise
    """
    return -90 <= lat <= 90 and -180 <= lon <= 180


def parse_date_range(start_str: str, end_str: str) -> Tuple[datetime, datetime]:
    """
    Parse and validate date range strings
    
    Args:
        start_str: Start date (YYYY-MM-DD)
        end_str: End date (YYYY-MM-DD)
    
    Returns:
        Tuple of datetime objects
    
    Raises:
        ValueError: If dates are invalid
    """
    try:
        start = datetime.strptime(start_str, '%Y-%m-%d')
        end = datetime.strptime(end_str, '%Y-%m-%d')
        
        if start > end:
            raise ValueError("Start date must be before end date")
        
        return start, end
    except ValueError as e:
        raise ValueError(f"Invalid date format: {e}")


def get_season(month: int, hemisphere: str = 'north') -> str:
    """
    Get season based on month and hemisphere
    
    Args:
        month: Month number (1-12)
        hemisphere: 'north' or 'south'
    
    Returns:
        Season name
    """
    if hemisphere == 'north':
        if month in [12, 1, 2]:
            return 'winter'
        elif month in [3, 4, 5]:
            return 'spring'
        elif month in [6, 7, 8]:
            return 'summer'
        else:
            return 'fall'
    else:  # southern hemisphere
        if month in [12, 1, 2]:
            return 'summer'
        elif month in [3, 4, 5]:
            return 'fall'
        elif month in [6, 7, 8]:
            return 'winter'
        else:
            return 'spring'


def aggregate_by_region(data_points: List[Dict], 
                       grid_size: float = 0.5) -> Dict:
    """
    Aggregate data points into grid cells
    
    Args:
        data_points: List of data points with lat/lon
        grid_size: Size of grid cells in degrees
    
    Returns:
        Dictionary of aggregated data by grid cell
    """
    grid = {}
    
    for point in data_points:
        lat = point['lat']
        lon = point['lon']
        
        # Calculate grid cell
        cell_lat = int(lat / grid_size) * grid_size
        cell_lon = int(lon / grid_size) * grid_size
        cell_key = f"{cell_lat:.2f}_{cell_lon:.2f}"
        
        if cell_key not in grid:
            grid[cell_key] = {
                'lat': cell_lat,
                'lon': cell_lon,
                'points': [],
                'count': 0
            }
        
        grid[cell_key]['points'].append(point)
        grid[cell_key]['count'] += 1
    
    # Calculate aggregates
    for cell in grid.values():
        if 'ndvi' in cell['points'][0]:
            cell['avg_ndvi'] = np.mean([p['ndvi'] for p in cell['points']])
            cell['max_ndvi'] = np.max([p['ndvi'] for p in cell['points']])
    
    return grid


class PhenologyMetrics:
    """Class for calculating phenology metrics"""
    
    @staticmethod
    def calculate_sos(timeseries: List[Dict], threshold: float = 0.5) -> Optional[str]:
        """Calculate Start of Season (SOS)"""
        for item in timeseries:
            if item.get('ndvi', 0) >= threshold:
                return item['date']
        return None
    
    @staticmethod
    def calculate_eos(timeseries: List[Dict], threshold: float = 0.5) -> Optional[str]:
        """Calculate End of Season (EOS)"""
        reversed_ts = list(reversed(timeseries))
        for item in reversed_ts:
            if item.get('ndvi', 0) >= threshold:
                return item['date']
        return None
    
    @staticmethod
    def calculate_los(sos: Optional[str], eos: Optional[str]) -> Optional[int]:
        """Calculate Length of Season (LOS) in days"""
        if not sos or not eos:
            return None
        
        sos_date = datetime.strptime(sos, '%Y-%m-%d')
        eos_date = datetime.strptime(eos, '%Y-%m-%d')
        
        return (eos_date - sos_date).days