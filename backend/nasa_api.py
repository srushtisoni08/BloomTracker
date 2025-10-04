import random
import datetime
import requests
import pandas as pd

def fetch_ndvi_data(lat, lon, start_date, end_date):
    """
    Fetch NDVI data from NASA POWER API for a specific location and date range.

    :param lat: Latitude of the location
    :param lon: Longitude of the location
    :param start_date: Start date in 'YYYY-MM-DD' format
    :param end_date: End date in 'YYYY-MM-DD' format
    :return: DataFrame containing NDVI data
    """
    url = "https://power.larc.nasa.gov/api/temporal/daily/point"
    params = {
        "parameters": "NDVI",
        "community": "ag",
        "longitude": lon,
        "latitude": lat,
        "start": start_date,
        "end": end_date,
        "format": "JSON"
    }

    response = requests.get(url, params=params)
    data = response.json()

    # Extract relevant data
    dates = [entry['time']['value'] for entry in data['properties']['parameter']['NDVI']]
    ndvi_values = [entry['value'] for entry in data['properties']['parameter']['NDVI']]

    # Create a DataFrame
    df = pd.DataFrame({
        'Date': pd.to_datetime(dates),
        'NDVI': ndvi_values
    })

    return df
