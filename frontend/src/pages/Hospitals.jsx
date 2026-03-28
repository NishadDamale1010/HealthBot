import { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet marker issue
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const redIcon = new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    iconSize: [32, 32],
});

export default function Hospitals() {
    const [hospitals, setHospitals] = useState([]);
    const [position, setPosition] = useState(null);
    const [loading, setLoading] = useState(true);

    function getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;

        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setPosition([latitude, longitude]);

                try {
                    const res = await axios.get(
                        `http://localhost:5000/api/hospitals/nearby?lat=${latitude}&lon=${longitude}`
                    );

                    const hospitalList =
                        res.data.elements?.map((el, index) => ({
                            id: index,
                            name: el.tags?.name || "Unnamed Hospital",
                            lat: Number(el.lat),
                            lon: Number(el.lon),
                        })) || [];

                    // ✅ Filter invalid coords (IMPORTANT FIX)
                    const validHospitals = hospitalList.filter(
                        (h) =>
                            !isNaN(h.lat) &&
                            !isNaN(h.lon) &&
                            h.lat !== 0 &&
                            h.lon !== 0
                    );

                    const sorted = validHospitals
                        .map((h) => ({
                            ...h,
                            distance: getDistance(latitude, longitude, h.lat, h.lon),
                        }))
                        .sort((a, b) => a.distance - b.distance);

                    setHospitals(sorted);
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            },
            () => {
                alert("Location permission denied");
                setLoading(false);
            }
        );
    }, []);

    if (loading) return <p>Loading...</p>;
    if (!position) return <p>Location not available</p>;

    return (
        <div style={{ padding: "20px" }}>
            <h1>Nearby Hospitals 🏥</h1>

            {/* LIST */}
            {hospitals.length === 0 && <p>No hospitals found 😢</p>}

            {hospitals.map((h, index) => (
                <div key={h.id}>
                    {index < 3 && <span style={{ color: "red" }}>🚑 Nearest</span>}
                    <h3>{h.name}</h3>
                    <p>{h.distance.toFixed(2)} km away</p>
                </div>
            ))}

            {/* ✅ IMPORTANT: Only render map when position exists */}
            {position && (
                <MapContainer
                    center={position}
                    zoom={13}
                    style={{ height: "500px", borderRadius: "10px" }}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {/* User */}
                    <Marker position={position}>
                        <Popup>You are here 📍</Popup>
                    </Marker>

                    {/* Hospitals */}
                    {hospitals.map((h, index) => (
                        <Marker
                            key={h.id}
                            position={[h.lat, h.lon]}
                            icon={index < 3 ? redIcon : undefined}
                        >
                            <Popup>
                                <strong>{h.name}</strong> <br />
                                {h.distance.toFixed(2)} km away
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            )}
        </div>
    );
}