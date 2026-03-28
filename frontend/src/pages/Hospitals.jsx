import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// 🔵 User icon
const userIcon = new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    iconSize: [32, 32],
});

// 🔴 Hospital icon
const hospitalIcon = new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    iconSize: [32, 32],
});

export default function Hospitals() {
    const [position, setPosition] = useState(null);
    const [hospitals, setHospitals] = useState([]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;

                const userPos = [latitude, longitude];
                setPosition(userPos);

                // ✅ Fake hospitals with phone numbers
                const fakeHospitals = [
                    {
                        id: 1,
                        name: "City Care Hospital",
                        lat: latitude + 0.01,
                        lon: longitude + 0.01,
                        phone: "+919876543210",
                    },
                    {
                        id: 2,
                        name: "Apollo Clinic",
                        lat: latitude - 0.01,
                        lon: longitude + 0.005,
                        phone: "+919812345678",
                    },
                    {
                        id: 3,
                        name: "Lifeline Hospital",
                        lat: latitude + 0.015,
                        lon: longitude - 0.008,
                        phone: "+919900112233",
                    },
                ];

                setHospitals(fakeHospitals);
            },
            () => {
                alert("Location permission denied");
            }
        );
    }, []);

    // 🚨 Emergency (Nearest)
    function handleEmergency() {
        if (!position || hospitals.length === 0) {
            alert("No hospitals available 😢");
            return;
        }

        const nearest = hospitals[0];

        const confirmCall = window.confirm(
            `🚨 Call ${nearest.name}?\n${nearest.phone}`
        );

        if (confirmCall) {
            window.location.href = `tel:${nearest.phone}`;
        }
    }

    if (!position) return <p>Loading map...</p>;

    return (
        <div style={{ padding: "20px" }}>
            {/* 🚨 Emergency Button */}
            <button
                onClick={handleEmergency}
                style={{
                    background: "red",
                    color: "white",
                    padding: "8px 15px",
                    border: "none",
                    borderRadius: "9px",
                    fontWeight: "bold",
                    marginBottom: "1px",
                    cursor: "pointer",
                }}
            >
                🚨 Emergency - Call Nearest Hospital
            </button>

            <h1>Nearby Hospitals 🏥</h1>



            <MapContainer
                key={position.join(",")}
                center={position}
                zoom={13}
                style={{ height: "500px", borderRadius: "10px" }}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* 🔵 User */}
                <Marker position={position} icon={userIcon}>
                    <Popup>You are here 📍</Popup>
                </Marker>

                {/* 🔴 Hospitals */}
                {hospitals.map((h) => (
                    <Marker
                        key={h.id}
                        position={[h.lat, h.lon]}
                        icon={hospitalIcon}
                    >
                        <Popup>
                            <strong>{h.name}</strong> <br />
                            <button
                                onClick={() =>
                                    (window.location.href = `tel:${h.phone}`)
                                }
                                style={{
                                    background: "green",
                                    color: "white",
                                    padding: "6px 10px",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    marginTop: "5px",
                                }}
                            >
                                📞 Call
                            </button>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}