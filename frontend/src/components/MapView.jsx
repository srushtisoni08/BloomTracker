import React from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapView = ({ coords, setCoords, onUpdate }) => {
  function LocationPicker() {
    useMapEvents({
      click(e) {
        setCoords({ lat: e.latlng.lat, lon: e.latlng.lng });
        onUpdate();
      },
    });
    return null;
  }

  return (
    <div className="my-4">
      <MapContainer
        center={[coords.lat, coords.lon]}
        zoom={3}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[coords.lat, coords.lon]} />
        <LocationPicker />
      </MapContainer>
    </div>
  );
};

export default MapView;
