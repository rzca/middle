import { useEffect, useState } from "react";
import { Map, Marker, ZoomControl } from "pigeon-maps"
import { default as permits } from "./data/geocodedpermits.json"
import "./App.css";

type Permit = {
  status: string,
  address: string,
  units: number,
  zip: number,
}

type GeocodedPermit = {
  permit: Permit,
  location: { latitude: number, longitude: number, }
}

export const App = () => {

  permits satisfies GeocodedPermit[];

  const [activePermit, setActivePermit] = useState<GeocodedPermit | null>(null);
  const [geocodedPermits, setGeocodedPermits] = useState<GeocodedPermit[] | null>(null);
  const [errorString, setErrorString] = useState<string | null>(null);

  useEffect(() => {
    document.title = "EHO Map"
    try {
      setGeocodedPermits(permits);
    }
    catch (err) {
      console.log(err);
      setErrorString("failed to parse data");
    }
  }, []);

  return (
    <div style={{ position: 'absolute', left: 10, top: 10 }}>

      <Map
        height={Math.min(window.innerHeight - 100, 600)} width={Math.min(window.innerWidth - 20, 1000)}
        defaultCenter={[38.89, -77.11,]} defaultZoom={11}>
        {geocodedPermits && geocodedPermits.map(p => {
          return <Marker
            anchor={[p.location?.longitude, p.location?.latitude]}
            onMouseOver={_ => setActivePermit(p)}
            onMouseOut={_ => setActivePermit(null)}
          ></Marker>
        })}
        <ZoomControl />
      </Map>
      {activePermit && <div>
        <div>{activePermit.permit.address}</div>
        <div>{activePermit.permit.units + " units"}</div>
        <div>{activePermit.permit.status}</div>
      </div>}
      <div style={{}}>{errorString}</div>
    </div>
  );
}

export default App;
