import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "./App.css";
import "leaflet/dist/leaflet.css";

import { default as permits } from "./data/geocodedpermits.json";

type Permit = {
  status: string;
  address: string;
  units: number;
  zip: number;
};

type GeocodedPermit = {
  permit: Permit;
  location: { latitude: number; longitude: number };
};

export const App = () => {
  permits satisfies GeocodedPermit[];

  const [activePermit, setActivePermit] = useState<GeocodedPermit | null>(null);
  const [geocodedPermits, setGeocodedPermits] = useState<
    GeocodedPermit[] | null
  >(null);
  const [errorString, setErrorString] = useState<string | null>(null);

  useEffect(() => {
    document.title = "EHO Map";
    try {
      setGeocodedPermits(permits);
    } catch (err) {
      console.log(err);
      setErrorString("failed to parse data");
    }
  }, []);

  return (
    <div>
      <div>
        <MapContainer
          center={[38.89, -77.11]}
          zoom={11}
          scrollWheelZoom={true}
          style={{ height: "80vh", width: "100vh" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {geocodedPermits &&
            geocodedPermits.map((p) => {
              return (
                <div
                  // onMouseOver={(_) => setActivePermit(p)}
                  // onMouseOut={(_) => setActivePermit(null)}
                  onClick={(_) => setActivePermit(p)}
                >
                  <Marker
                    position={[p.location.longitude, p.location.latitude]}
                    eventHandlers={{
                      mouseover: (_) => setActivePermit(p),
                    }}
                  >
                    <div>{p.permit.address}</div>
                    <Popup>
                      <div>{p.permit.address}</div>
                      <div>{p.permit.units + " units"}</div>
                      <div>{p.permit.status}</div>
                    </Popup>
                  </Marker>
                </div>
              );
            })}
        </MapContainer>
      </div>
      {activePermit && (
        <div>
          <div>{activePermit.permit.address}</div>
          <div>{activePermit.permit.units + " units"}</div>
          <div>{activePermit.permit.status}</div>
        </div>
      )}
      <div style={{}}>{errorString}</div>
    </div>
  );
};

export default App;
