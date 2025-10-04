from flask import Flask, jsonify, request
from flask_cors import CORS
from bloom_detector import detect_bloom
from nasa_api import fetch_ndvi_data

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return {"message": "BloomTracker API is running 🚀"}

@app.route('/ndvi', methods=['GET'])
def get_ndvi():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    start = request.args.get('start', '2024-01-01')
    end = request.args.get('end', '2024-12-31')
    
    ndvi_data = fetch_ndvi_data(lat, lon, start, end)
    bloom_status = detect_bloom(ndvi_data)
    return jsonify({
        "location": {"lat": lat, "lon": lon},
        "data": ndvi_data,
        "status": bloom_status
    })

if __name__ == '__main__':
    app.run(debug=True)
