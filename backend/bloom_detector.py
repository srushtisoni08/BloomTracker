def detect_bloom(ndvi_data):
    """
    Detect bloom period when NDVI rises sharply (>0.15 increase month to month)
    """
    blooms = []
    for i in range(1, len(ndvi_data)):
        diff = ndvi_data[i]["ndvi"] - ndvi_data[i-1]["ndvi"]
        if diff > 0.15:
            blooms.append(ndvi_data[i]["month"])
    if not blooms:
        return "No active bloom detected"
    return f"Blooming observed in: {', '.join(blooms)}"
