import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import 'leaflet/dist/images/marker-icon-2x.png'
import "leaflet/dist/images/marker-icon.png"
import "leaflet/dist/images/marker-shadow.png"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "./App.css";

import { default as permits } from "./data/geocodedpermits.json";

// https://github.com/Leaflet/Leaflet/issues/4968#issuecomment-264311098
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import L from 'leaflet';

const DefaultIcon = L.icon({
   iconUrl: icon,
   shadowUrl: iconShadow,
   iconSize: [24,36],
   iconAnchor: [12,36]
 });

 L.Marker.prototype.options.icon = DefaultIcon; 

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
          style={{ margin: "auto", height: "80vh", width: "85vw", maxWidth: "1200px"}}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {geocodedPermits &&
            geocodedPermits.map((p) => {
              return (
                  <Marker
                    position={[p.location.longitude, p.location.latitude]}
                    eventHandlers={{
                      mouseover: (_) => setActivePermit(p),
                    }}
                    key={p.permit.address}
                  >
                    <Popup>
                      <div>{p.permit.address}</div>
                      <div>{p.permit.units + " units"}</div>
                      <div>{p.permit.status}</div>
                    </Popup>
                  </Marker>
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
