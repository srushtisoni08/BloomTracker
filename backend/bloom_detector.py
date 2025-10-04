def detect_bloom(df, threshold=0.15):
    """
    Detect blooming events based on significant increases in NDVI.

    :param df: DataFrame containing NDVI data
    :param threshold: NDVI increase threshold to consider as blooming
    :return: List of dates when blooming events occurred
    """
    blooming_dates = []

    for i in range(1, len(df)):
        if df['NDVI'].iloc[i] - df['NDVI'].iloc[i - 1] > threshold:
            blooming_dates.append(df['Date'].iloc[i])

    return blooming_dates
