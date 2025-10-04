import random
import datetime

def fetch_ndvi_data(lat, lon):
    """
    Mock NDVI data generator (replace later with NASA API)
    Returns monthly NDVI for last 12 months.
    """
    today = datetime.date.today()
    data = []
    for i in range(12):
        month = (today - datetime.timedelta(days=30 * i)).strftime("%b %Y")
        ndvi = round(random.uniform(0.2, 0.9), 2)  # random NDVI value
        data.append({"month": month, "ndvi": ndvi})
    return list(reversed(data))
