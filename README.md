# 🌸 BloomTracker
**An Earth Observation Web App for Monitoring Global Flowering Phenology**

> *"Witness the pulse of life across our planet — from season to season and year to year."*

BloomTracker is a full-stack application designed for the **NASA Space Apps Challenge 2025** under the **BloomWatch** theme. It uses satellite-based Earth observation data and user-collected inputs to **visualize, monitor, and predict plant blooming patterns** around the world.

---

## 🚀 Project Overview

Plants reflect the rhythm of Earth's climate — their flowering patterns (phenology) are key indicators of ecological health, crop productivity, and seasonal change. BloomTracker aims to visualize and analyze these patterns through interactive maps and time-based data insights.

### 🌍 Core Objectives
- Use **NASA Earth observation data** to monitor vegetation and flowering trends.
- Detect and visualize **blooming events** over time using NDVI/EVI indices.
- Build an **interactive frontend** to explore global bloom activity.
- Provide APIs for **data ingestion**, **bloom detection**, and **trend forecasting**.

---

## 🧠 Features

| Category | Features |
|-----------|-----------|
| 🛰️ **Data Integration** | Connects to NASA Earthdata / MODIS / Sentinel datasets for vegetation indices. |
| 🌿 **Phenology Detection** | Processes time-series vegetation data to identify bloom onset, peak, and decline. |
| 📈 **Visualization Dashboard** | Interactive frontend to visualize bloom maps, graphs, and timelines. |
| 🔍 **Search & Filter** | Explore data by region, plant type, or time period. |
| ☁️ **Cloud-Aware Preprocessing** | Handles cloud masking and NDVI smoothing. |
| 🔮 **Future Scope** | AI-based bloom forecasting using climate and phenology data. |

---

## 🏗️ Tech Stack

### **Frontend**
- ⚛️ React (Vite setup)
- 🌐 Leaflet / Mapbox (for interactive maps)
- 🎨 TailwindCSS (styling)

### **Backend**
- 🐍 Python (Flask / FastAPI)
- 🌱 Rasterio / GDAL / Earth Engine API (for satellite image processing)
- 💾 SQLite / PostgreSQL (for storing regional data and bloom events)
- 🔍 Requests / Pandas / NumPy for data analysis

---

## ⚙️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/srushtisoni08/BloomTracker.git
cd BloomTracker
```

### 2. Create a Virtual Environment
```bash
python -m venv venv
source venv/bin/activate   # on Linux/Mac
venv\Scripts\activate      # on Windows
```

### 3. Install Backend Dependencies
```bash
pip install -r requirements.txt
```

### 4. Start the Backend
```bash
cd backend
python app.py
```

### 5. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

Then open: [http://localhost:5173](http://localhost:5173)

---

## 📊 Example Workflow

1. User selects a region (e.g., Gujarat, India).
2. Backend fetches NDVI/EVI satellite data for that area.
3. Data is analyzed for seasonal patterns and bloom timing.
4. Frontend visualizes the results on a **map with bloom intensity and time slider**.

---

## 🔮 Future Enhancements

- 🌦️ Integrate real-time temperature & rainfall data (NASA POWER, OpenWeatherMap).
- 🧬 ML-based bloom prediction model (LSTM / Random Forest).
- 📱 Mobile-friendly responsive dashboard.
- 🪴 Add species-specific bloom tracking (flowers, crops).
- ☁️ Deploy on Render / Vercel with a cloud DB (e.g., Supabase).

---

## 🏆 Challenge Alignment: NASA BloomWatch

| BloomWatch Objective | How BloomTracker Aligns |
|----------------------|--------------------------|
| Create a dynamic visual tool | Interactive React + Map visualization |
| Display/detect blooming events | Backend detection using NDVI/EVI analysis |
| Use NASA Earth observations | Planned integration with MODIS/Sentinel datasets |
| Advance vegetation monitoring | Data dashboard + future forecasting module |

---

## 📜 License
This project is open-source under the **MIT License**.

---

### 🌸 “Every bloom tells a story of our planet’s heartbeat.”