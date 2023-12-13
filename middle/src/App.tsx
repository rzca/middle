import { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer, GeoJSON } from "react-leaflet";
import "./App.css";

import { default as permits } from "./data/geocodedpermits.json";
import { default as arlington } from "./data/arlington.json";

// these are some hacks to get markers to show up correctly in leaflet
// https://github.com/Leaflet/Leaflet/issues/4968#issuecomment-264311098
// import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import L from "leaflet";
import { Section } from "@blueprintjs/core";

const ActiveIcon = L.icon({
  // iconUrl: icon,
  iconUrl:
    "https://mapmarker.io/api/v3/font-awesome/v6/pin?icon=fa-solid%20fa-house&size=75&color=FFF&background=e97451&hoffset=0&voffset=0",
  shadowUrl: iconShadow,
  iconSize: [40, 50],
  iconAnchor: [12, 36],
});

const DefaultIcon = L.icon({
  // iconUrl: icon,
  iconUrl:
    "https://mapmarker.io/api/v3/font-awesome/v6/pin?icon=fa-solid%20fa-house&size=75&color=FFF&background=003e77&hoffset=0&voffset=0",
  shadowUrl: iconShadow,
  iconSize: [30, 40],
  iconAnchor: [12, 36],
});
L.Marker.prototype.options.icon = DefaultIcon;
// end hacks

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
    try {
      setGeocodedPermits(permits);
    } catch (err) {
      console.log(err);
      setErrorString("failed to parse data");
    }
  }, []);

  const mapContainer = useMemo(() => {
    return (
      <MapContainer
        center={[38.89, -77.11]}
        zoom={11}
        scrollWheelZoom={true}
        style={{
          margin: "auto",
          height: "80vh",
          width: "100vw",
          maxWidth: "1200px",
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* @ts-expect-error idk why this it doesn't like this*/}
        <GeoJSON data={arlington as GeoJSONObject}></GeoJSON>

        {geocodedPermits &&
          geocodedPermits.map((p) => {
            return (
              <Marker
                icon={
                  p.permit.address === activePermit?.permit.address
                    ? ActiveIcon
                    : DefaultIcon
                }
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
    );
  }, [geocodedPermits, activePermit]);

  return (
    <div>
      <div>
        <Section>{mapContainer}</Section>
        <Section>
          {activePermit && (
            <div>
              <div>{activePermit.permit.address}</div>
              <div>{activePermit.permit.units + " units"}</div>
              <div>{activePermit.permit.status}</div>
            </div>
          )}
          <div style={{}}>{errorString}</div>
          {geocodedPermits && (
            <table className="bp5-html-table {{.modifier}}">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Units</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {geocodedPermits.map((p) => (
                  <tr onMouseOver={(_) => setActivePermit(p)}>
                    <td>{p.permit.address}</td>
                    <td>{p.permit.units}</td>
                    <td>{}</td>
                    <td>{p.permit.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>
        <Section>
          <div>
            Credit to{" "}
            <a href="https://cartographyvectors.com/map/1129-virginia-with-county-boundaries" >https://cartographyvectors.com/map/1129-virginia-with-county-boundaries</a>{" "}
            for the outline of Arlington
          </div>
          <div>
            Original data from{" "}
            <a href="https://www.arlingtonva.us/Government/Programs/Building/Permits/EHO/Tracker">https://www.arlingtonva.us/Government/Programs/Building/Permits/EHO/Tracker</a>
          </div>
          <div>Geocoding accuracy is best effort, not guaranteed</div>
        </Section>
      </div>
    </div>
  );
};

export default App;
