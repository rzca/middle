import { useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  GeoJSON,
  LayersControl,
  FeatureGroup,
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
  if (znDesignation == "R-6") return Colors.RED1;
  // if (znDesignation == "R-5") return Colors.RED2;
  if (znDesignation == "R-8") return Colors.RED3;
  if (znDesignation == "R-10") return Colors.RED4;
  if (znDesignation == "R-20") return Colors.RED5;
  return Colors.VIOLET1;
};

const initialZones = {
  ["R-6"]: "One-Family Dwelling District",
  ["R-8"]: "One-Family Dwelling District",
  ["R-10"]: "One-Family Dwelling District",
  ["R-20"]: "One-Family Dwelling District",
  ["R-5"]: "One-Family, Restricted Two Family Dwelling District",
  ["R-10T"]: "One Family Residential-Town-House Dwelling District",
  ["R15-30T"]: "Residential Town House Dwelling District",
  ["R2-7"]: "Two-Family and Town House Dwelling District",
};

const ZoneFeatureLayer = (props: { znDesig: string; color?: string }) => {
  const featureRef = useRef();
  return (
    <FeatureLayer
      // @ts-expect-error there is something wrong with the react-esri-leaflet library types
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

  permits
    .filter((p) => p.location == null)
    .forEach((p) => console.log("a permit has not been geocoded", p));

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
          // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          // url="https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png  "
        />
        <LayersControl position={"topright"}>
          {Object.entries(znDesignations).map((entry) => {
            return (
              <LayersControl.Overlay checked name={entry[0]} key={entry[0]}>
                <ZoneFeatureLayer znDesig={entry[0]} />
              </LayersControl.Overlay>
            );
          })}
          <LayersControl.Overlay
            name="Arlington County"
            key={"Arlington County"}
          >
            <GeoJSON data={arlington2}></GeoJSON>
          </LayersControl.Overlay>
          <LayersControl.Overlay checked name={"EHO Permits"} key={"EHO Permits"}>
            <FeatureGroup>
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
            </FeatureGroup>
          
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
            <tbody>
              {znDesignations &&
                Object.entries(znDesignations).map((entry) => {
                  const color = getColor(entry[0]);
                  return (
                    <tr key={entry[0]}>
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
            </tbody>
          </table>
        </Section>
        <Section>
          {permits && (
            <div style={{ overflowX: "scroll" }}>
              <table className="bp5-html-table bp5-compact bp5-html-table-striped">
                <thead>
                  <tr>
                    <th>Address</th>
                    <th>Units</th>
                    <th>Assessed value in 2024</th>
                    <th>{"Submission date [Approval date]"}</th>
                    <th>Zoning District</th>
                    <th>Permit number</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {permits.map((p) => (
                    <tr
                      key={p.permit.address}
                      onMouseOver={() => setActivePermit(p)}
                    >
                      <td>{p.permit.address}</td>
                      <td>{p.permit.units}</td>
                      <td>
                        {p.assessment &&
                          Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0,
                          }).format(p.assessment?.assessedValue2023)}
                      </td>
                      <td>
                        {p.permit.submissionDate +
                          (p.permit.approvalDate != null
                            ? " [" + p.permit.approvalDate + "]"
                            : "")}
                      </td>
                      <td>{p.permit.zoningDistrict}</td>
                      <td>{p.permit.permitNumber}</td>
                      <td>{p.permit.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
        <Section>
          <div style={{ overflowX: "scroll", textWrap: "wrap" }}>
            <ul>
              Credit to{" "}
              <a href="https://cartographyvectors.com/map/1129-virginia-with-county-boundaries">
                https://cartographyvectors.com/map/1129-virginia-with-county-boundaries
              </a>{" "}
              for the outline of Arlington
            </ul>
            <ul>
              Original data from{" "}
              <a href="https://www.arlingtonva.us/Government/Programs/Building/Permits/EHO/Tracker">
                https://www.arlingtonva.us/Government/Programs/Building/Permits/EHO/Tracker
              </a>
            </ul>
            <ul>Geocoding accuracy is best effort, not guaranteed</ul>
            <ul>
              Zoning data is from{" "}
              <a href="https://gisdata-arlgis.opendata.arcgis.com/datasets/zoning-polygons-1/explore">
                Arlington County opendata
              </a>
            </ul>
          </div>
        </Section>
      </div>
    </div>
  );
};

export default App;
