from datetime import datetime
from typing import List, Dict, Optional
import json

class BloomEvent:
    """Model for bloom events"""
    
    def __init__(self, id: str, lat: float, lon: float, 
                 date: str, species: str, ndvi: float,
                 confidence: float, source: str):
        self.id = id
        self.lat = lat
        self.lon = lon
        self.date = date
        self.species = species
        self.ndvi = ndvi
        self.confidence = confidence
        self.source = source
        self.created_at = datetime.utcnow().isoformat()
    
    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'lat': self.lat,
            'lon': self.lon,
            'date': self.date,
            'species': self.species,
            'ndvi': self.ndvi,
            'confidence': self.confidence,
            'source': self.source,
            'created_at': self.created_at
        }


class Region:
    """Model for monitored regions"""
    
    def __init__(self, name: str, bounds: Dict, 
                 description: str = '', active: bool = True):
        self.name = name
        self.bounds = bounds  # {min_lat, max_lat, min_lon, max_lon}
        self.description = description
        self.active = active
        self.created_at = datetime.utcnow().isoformat()
        self.bloom_events: List[BloomEvent] = []
    
    def add_bloom_event(self, event: BloomEvent):
        """Add a bloom event to this region"""
        if self._is_in_bounds(event.lat, event.lon):
            self.bloom_events.append(event)
    
    def _is_in_bounds(self, lat: float, lon: float) -> bool:
        """Check if coordinates are within region bounds"""
        return (self.bounds['min_lat'] <= lat <= self.bounds['max_lat'] and
                self.bounds['min_lon'] <= lon <= self.bounds['max_lon'])
    
    def to_dict(self) -> Dict:
        return {
            'name': self.name,
            'bounds': self.bounds,
            'description': self.description,
            'active': self.active,
            'created_at': self.created_at,
            'bloom_event_count': len(self.bloom_events)
        }


class Species:
    """Model for plant species"""
    
    def __init__(self, common_name: str, scientific_name: str,
                 typical_bloom_months: List[int],
                 regions: List[str],
                 characteristics: Dict):
        self.common_name = common_name
        self.scientific_name = scientific_name
        self.typical_bloom_months = typical_bloom_months
        self.regions = regions
        self.characteristics = characteristics
        self.bloom_history: List[Dict] = []
    
    def add_bloom_record(self, year: int, location: str, 
                        bloom_date: str, duration_days: int):
        """Add a historical bloom record"""
        self.bloom_history.append({
            'year': year,
            'location': location,
            'bloom_date': bloom_date,
            'duration_days': duration_days,
            'recorded_at': datetime.utcnow().isoformat()
        })
    
    def get_average_bloom_day(self) -> Optional[int]:
        """Calculate average bloom day of year from history"""
        if not self.bloom_history:
            return None
        
        bloom_days = []
        for record in self.bloom_history:
            date = datetime.strptime(record['bloom_date'], '%Y-%m-%d')
            bloom_days.append(date.timetuple().tm_yday)
        
        return int(sum(bloom_days) / len(bloom_days))
    
    def to_dict(self) -> Dict:
        return {
            'common_name': self.common_name,
            'scientific_name': self.scientific_name,
            'typical_bloom_months': self.typical_bloom_months,
            'regions': self.regions,
            'characteristics': self.characteristics,
            'bloom_history_count': len(self.bloom_history),
            'average_bloom_day': self.get_average_bloom_day()
        }


class VegetationIndex:
    """Model for vegetation index measurements"""
    
    def __init__(self, lat: float, lon: float, date: str,
                 ndvi: Optional[float] = None,
                 evi: Optional[float] = None,
                 ndwi: Optional[float] = None,
                 quality: str = 'unknown'):
        self.lat = lat
        self.lon = lon
        self.date = date
        self.ndvi = ndvi
        self.evi = evi
        self.ndwi = ndwi
        self.quality = quality
        self.source = 'MODIS'
        self.created_at = datetime.utcnow().isoformat()
    
    def to_dict(self) -> Dict:
        return {
            'lat': self.lat,
            'lon': self.lon,
            'date': self.date,
            'ndvi': self.ndvi,
            'evi': self.evi,
            'ndwi': self.ndwi,
            'quality': self.quality,
            'source': self.source,
            'created_at': self.created_at
        }


class UserAlert:
    """Model for user-configured bloom alerts"""
    
    def __init__(self, user_id: str, region_name: str,
                 species: List[str], alert_type: str):
        self.user_id = user_id
        self.region_name = region_name
        self.species = species
        self.alert_type = alert_type  # 'bloom_onset', 'peak', 'prediction'
        self.active = True
        self.created_at = datetime.utcnow().isoformat()
        self.last_triggered = None
    
    def trigger(self):
        """Mark alert as triggered"""
        self.last_triggered = datetime.utcnow().isoformat()
    
    def to_dict(self) -> Dict:
        return {
            'user_id': self.user_id,
            'region_name': self.region_name,
            'species': self.species,
            'alert_type': self.alert_type,
            'active': self.active,
            'created_at': self.created_at,
            'last_triggered': self.last_triggered
        }


# In-memory storage (replace with actual database in production)
class InMemoryStore:
    """Simple in-memory data store"""
    
    def __init__(self):
        self.bloom_events: List[BloomEvent] = []
        self.regions: Dict[str, Region] = {}
        self.species: Dict[str, Species] = {}
        self.vegetation_indices: List[VegetationIndex] = []
        self.alerts: List[UserAlert] = []
        
        # Initialize with some default regions
        self._initialize_default_regions()
        self._initialize_default_species()
    
    def _initialize_default_regions(self):
        """Add default regions of interest"""
        self.regions['washington_dc'] = Region(
            name='Washington DC',
            bounds={
                'min_lat': 38.8,
                'max_lat': 39.0,
                'min_lon': -77.2,
                'max_lon': -76.9
            },
            description='Cherry blossom viewing area'
        )
        
        self.regions['japan_tokyo'] = Region(
            name='Tokyo, Japan',
            bounds={
                'min_lat': 35.5,
                'max_lat': 35.8,
                'min_lon': 139.5,
                'max_lon': 139.9
            },
            description='Famous cherry blossom region'
        )
        
        self.regions['netherlands'] = Region(
            name='Netherlands Tulip Region',
            bounds={
                'min_lat': 52.0,
                'max_lat': 52.5,
                'min_lon': 4.5,
                'max_lon': 5.0
            },
            description='Tulip fields'
        )
    
    def _initialize_default_species(self):
        """Add default species"""
        self.species['cherry_blossom'] = Species(
            common_name='Cherry Blossom',
            scientific_name='Prunus serrulata',
            typical_bloom_months=[3, 4],
            regions=['Washington DC', 'Tokyo', 'Korea'],
            characteristics={
                'color': 'pink/white',
                'duration_days': 7-10,
                'temperature_sensitive': True
            }
        )
        
        self.species['tulip'] = Species(
            common_name='Tulip',
            scientific_name='Tulipa',
            typical_bloom_months=[4, 5],
            regions=['Netherlands', 'Turkey'],
            characteristics={
                'color': 'various',
                'duration_days': 14-21,
                'temperature_sensitive': True
            }
        )
    
    # CRUD operations
    def add_bloom_event(self, event: BloomEvent):
        """Add a bloom event"""
        self.bloom_events.append(event)
        
        # Add to relevant regions
        for region in self.regions.values():
            region.add_bloom_event(event)
    
    def get_bloom_events(self, start_date: str, end_date: str,
                        region: Optional[str] = None) -> List[BloomEvent]:
        """Get bloom events within date range"""
        events = [e for e in self.bloom_events
                 if start_date <= e.date <= end_date]
        
        if region and region in self.regions:
            region_obj = self.regions[region]
            events = [e for e in events
                     if region_obj._is_in_bounds(e.lat, e.lon)]
        
        return events
    
    def add_vegetation_index(self, vi: VegetationIndex):
        """Add vegetation index measurement"""
        self.vegetation_indices.append(vi)
    
    def get_vegetation_indices(self, lat: float, lon: float,
                              start_date: str, end_date: str,
                              tolerance: float = 0.1) -> List[VegetationIndex]:
        """Get vegetation indices near a location"""
        return [vi for vi in self.vegetation_indices
                if (abs(vi.lat - lat) <= tolerance and
                    abs(vi.lon - lon) <= tolerance and
                    start_date <= vi.date <= end_date)]
    
    def add_region(self, region: Region):
        """Add a region"""
        self.regions[region.name] = region
    
    def get_region(self, name: str) -> Optional[Region]:
        """Get region by name"""
        return self.regions.get(name)
    
    def add_species(self, species: Species):
        """Add a species"""
        self.species[species.common_name.lower().replace(' ', '_')] = species
    
    def get_species(self, name: str) -> Optional[Species]:
        """Get species by name"""
        return self.species.get(name)
    
    def add_alert(self, alert: UserAlert):
        """Add user alert"""
        self.alerts.append(alert)
    
    def get_user_alerts(self, user_id: str) -> List[UserAlert]:
        """Get all alerts for a user"""
        return [a for a in self.alerts if a.user_id == user_id]


# Global store instance
data_store = InMemoryStore()