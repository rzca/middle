import { useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  GeoJSON,
  LayersControl,
} from "react-leaflet";
import "./App.css";

import { default as permits } from "./data/permits.json";
import { default as arlington } from "./data/arlington.json";

// these are some hacks to get markers to show up correctly in leaflet
// https://github.com/Leaflet/Leaflet/issues/4968#issuecomment-264311098
// import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import L from "leaflet";
import { Colors, Section } from "@blueprintjs/core";
import { FeatureLayer } from "react-esri-leaflet";
import { Assessment, Permit, Location } from "./shared/types";

const activeIcon = L.icon({
  iconUrl:
    "https://mapmarker.io/api/v3/font-awesome/v6/pin?icon=fa-solid%20fa-house&size=75&color=FFF&background=e97451&hoffset=0&voffset=0",
  shadowUrl: iconShadow,
  iconSize: [40, 50],
  iconAnchor: [12, 36],
});

const defaultIcon = L.icon({
  iconUrl:
    "https://mapmarker.io/api/v3/font-awesome/v6/pin?icon=fa-solid%20fa-house&size=75&color=FFF&background=003e77&hoffset=0&voffset=0",
  shadowUrl: iconShadow,
  iconSize: [30, 40],
  iconAnchor: [12, 36],
});
L.Marker.prototype.options.icon = defaultIcon;

const icon = (color: string) => {
  return L.icon({
    iconUrl: `https://mapmarker.io/api/v3/font-awesome/v6/pin?icon=fa-solid%20fa-house&size=75&color=FFF&background=${color.replace(
      "#",
      ""
    )}&hoffset=0&voffset=0`,
    shadowUrl: iconShadow,
    iconSize: [30, 40],
    iconAnchor: [12, 36],
  });
};

type Feature = {
  properties: { ZN_DESIG: string; LABEL: string };
};

const getColor = (znDesignation: string) => {
  if (znDesignation == "R-6") return Colors.BLUE1;
  if (znDesignation == "R-5") return Colors.ORANGE1;
  if (znDesignation == "R-8") return Colors.FOREST1;
  if (znDesignation == "R-10") return Colors.FOREST2;
  if (znDesignation == "R-20") return Colors.FOREST3;
  return Colors.VIOLET1;
};

const initialZones = {
  ["R-5"]: "One-Family, Restricted Two Family Dwelling District",
  ["R-6"]: "One-Family Dwelling District",
  ["R-8"]: "One-Family Dwelling District",
  ["R-10"]: "One-Family Dwelling District",
  ["R-20"]: "One-Family Dwelling District",
  ["R-10T"]: "One Family Residential-Town-House Dwelling District",
  ["R15-30T"]: "Residential Town House Dwelling District",
  ["R2-7"]: "Two-Family and Town House Dwelling District",
};

const ZoneFeatureLayer = (props: { znDesig: string; color?: string }) => {
  const featureRef = useRef();
  return (
    <FeatureLayer
      // @ts-ignore there is something wrong with the react-esri-leaflet library types
      url={
        "https://arlgis.arlingtonva.us/arcgis/rest/services/Open_Data/od_Zoning_Polygons/FeatureServer/0"
      }
      featureRef={featureRef}
      // where={"GZDC = 'R'"}
      where={`ZN_DESIG = '${props.znDesig}'`}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      style={(_: Feature) => {
        return { color: props.color ?? getColor(props.znDesig) };
      }}
      // onEachFeature={(feature: Feature) => {
      //   // zns[feature.properties.ZN_DESIG] = feature.properties.LABEL;
      //   setZnDesignations(prev => {
      //     return ({ ...prev, [feature.properties.ZN_DESIG]: feature.properties.LABEL })
      //   });
      // }}
    />
  );
};

export const App = () => {
  permits satisfies {
    permit: Permit;
    location?: Location;
    assessment?: Assessment;
  }[];
  const arlington2 = arlington as { type: "Feature" };

  const [activePermit, setActivePermit] = useState<{
    permit: Permit;
    location?: Location;
    assessment?: Assessment;
  } | null>(null);
  const [znDesignations] = useState<{ [desig: string]: string }>(initialZones);

  const mapContainer = useMemo(() => {
    return (
      <MapContainer
        center={[38.89, -77.11]}
        zoom={11}
        scrollWheelZoom={true}
        style={{
          height: "80vh",
          width: "100vw",
          maxWidth: "1200px",
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {permits
          .filter((p) => p.location != null)
          .map((p) => {
            return (
              <Marker
                icon={
                  p.permit.address === activePermit?.permit.address
                    ? activeIcon
                    : icon(Colors.GRAY1)
                }
                position={[p.location!.longitude, p.location!.latitude]}
                eventHandlers={{
                  mouseover: () => setActivePermit(p),
                }}
                key={p.permit.address}
              >
                <Popup>
                  <div>{p.permit.address}</div>
                  <div>{p.permit.units + " units"}</div>
                  <div>{p.permit.status}</div>
                  {p.assessment && (
                    <div>
                      {Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(p.assessment.assessedValue2023)}
                    </div>
                  )}
                </Popup>
              </Marker>
            );
          })}
        <LayersControl position={"topright"}>
          {Object.entries(znDesignations).map((entry) => {
            return (
              <LayersControl.Overlay checked name={entry[0]}>
                <ZoneFeatureLayer znDesig={entry[0]} />
              </LayersControl.Overlay>
            );
          })}
          <LayersControl.Overlay name="Arlington County">
            <GeoJSON data={arlington2}></GeoJSON>
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
    );
  }, [activePermit]);

  return (
    <div>
      <div>
        <Section>
          {mapContainer}
          <table className="bp5-html-table {{.modifier}}">
            {znDesignations &&
              Object.entries(znDesignations).map((entry) => {
                const color = getColor(entry[0]);
                return (
                  <tr>
                    <td
                      style={{
                        backgroundColor: color,
                        width: "10px",
                        height: "10px",
                      }}
                    ></td>
                    <td>
                      <b>{entry[0]}</b>
                    </td>
                    <td>{entry[1]}</td>
                  </tr>
                );
              })}
          </table>
        </Section>
        <Section>
          {permits && (
            <table className="bp5-html-table bp5-compact bp5-html-table-striped">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Units</th>
                  <th>Assessed value in 2023</th>
                  <th>Submission date</th>
                  <th>Approval date?</th>
                  <th>Zoning District</th>
                  <th>Permit number</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {permits.map((p) => (
                  <tr onMouseOver={() => setActivePermit(p)}>
                    <td>{p.permit.address}</td>
                    <td>{p.permit.units}</td>
                    <td>
                      {p.assessment &&
                        Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(p.assessment?.assessedValue2023)}
                    </td>
                    <td>{p.permit.submissionDate}</td>
                    <td>{p.permit.approvalDate}</td>
                    <td>{p.permit.zoningDistrict}</td>
                    <td>{p.permit.permitNumber}</td>
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
            <a href="https://cartographyvectors.com/map/1129-virginia-with-county-boundaries">
              https://cartographyvectors.com/map/1129-virginia-with-county-boundaries
            </a>{" "}
            for the outline of Arlington
          </div>
          <div>
            Original data from{" "}
            <a href="https://www.arlingtonva.us/Government/Programs/Building/Permits/EHO/Tracker">
              https://www.arlingtonva.us/Government/Programs/Building/Permits/EHO/Tracker
            </a>
          </div>
          <div>Geocoding accuracy is best effort, not guaranteed</div>
          <div>
            Zoning data is from{" "}
            <a href="https://gisdata-arlgis.opendata.arcgis.com/datasets/zoning-polygons-1/explore">
              Arlington County opendata
            </a>
          </div>
        </Section>
      </div>
    </div>
  );
};

export default App;
