import { useEffect, useState } from "react";
import { Map, Marker } from "pigeon-maps"
import "./App.css";

type Permit = {
  status: string,
  address: string,
  units: number,
  zip: number,
}

type GeocodedPermit = {
  permit: Permit,
  location: { latitude: number, longitude: number,}
}

const data = "[{\"permit\":{\"status\":\"Approved\",\"address\":\"2005N.TaylorStreet\",\"units\":3,\"zip\":22207},\"location\":{\"latitude\":-77.11322323183396,\"longitude\":38.895411423883125}},{\"permit\":{\"status\":\"Approved\",\"address\":\"504125thStreetS.\",\"units\":2,\"zip\":22206},\"location\":{\"latitude\":-77.13196110703716,\"longitude\":38.89922068481843}},{\"permit\":{\"status\":\"Approved\",\"address\":\"2612S.FernStreet\",\"units\":6,\"zip\":22202},\"location\":{\"latitude\":-77.05527256068297,\"longitude\":38.85005167145353}},{\"permit\":{\"status\":\"Approved\",\"address\":\"4611N.CarlinSpringsRoad\",\"units\":6,\"zip\":22203},\"location\":{\"latitude\":-77.11505822670783,\"longitude\":38.875944170273236}},{\"permit\":{\"status\":\"Approved\",\"address\":\"735N.GeorgeMasonDrive\",\"units\":6,\"zip\":22203},\"location\":{\"latitude\":-77.1198915131058,\"longitude\":38.87709758213202}},{\"permit\":{\"status\":\"Approved\",\"address\":\"40157thStreetS.\",\"units\":6,\"zip\":22204},\"location\":{\"latitude\":-77.10081642763048,\"longitude\":38.8635008243322}},{\"permit\":{\"status\":\"Approved\",\"address\":\"40197thStreetS.\",\"units\":6,\"zip\":22204},\"location\":{\"latitude\":-77.10087939258833,\"longitude\":38.863449082871924}},{\"permit\":{\"status\":\"Approved\",\"address\":\"644S.IllinoisStreet\",\"units\":2,\"zip\":22204},\"location\":{\"latitude\":-77.12175450346874,\"longitude\":38.85925966229667}},{\"permit\":{\"status\":\"Approved\",\"address\":\"1816N.JacksonStreet\",\"units\":2,\"zip\":22201},\"location\":{\"latitude\":-77.10026510967096,\"longitude\":38.89200034045049}},{\"permit\":{\"status\":\"Approved\",\"address\":\"1227N.UtahStreet\",\"units\":6,\"zip\":22201},\"location\":{\"latitude\":-77.11411079574275,\"longitude\":38.88598067683682}},{\"permit\":{\"status\":\"Approved\",\"address\":\"2100N.GeorgeMasonDrive\",\"units\":4,\"zip\":22205},\"location\":{\"latitude\":-77.1316398191915,\"longitude\":38.894143215898985}},{\"permit\":{\"status\":\"Approved\",\"address\":\"92122ndStreetS.\",\"units\":3,\"zip\":22202},\"location\":{\"latitude\":-77.06178851846474,\"longitude\":38.85409248195429}},{\"permit\":{\"status\":\"Approved\",\"address\":\"29092ndRoadN.\",\"units\":3,\"zip\":22201},\"location\":{\"latitude\":-77.09123116283028,\"longitude\":38.87730377836847}},{\"permit\":{\"status\":\"Approved\",\"address\":\"56308thStreetN.\",\"units\":5,\"zip\":22205},\"location\":{\"latitude\":-77.12844494798698,\"longitude\":38.87479712508186}},{\"permit\":{\"status\":\"Approved\",\"address\":\"380214thStreetN.\",\"units\":6,\"zip\":22201},\"location\":{\"latitude\":-77.1064947238499,\"longitude\":38.888284564424765}},{\"permit\":{\"status\":\"Approved\",\"address\":\"641022ndStreetN.\",\"units\":3,\"zip\":22205},\"location\":{\"latitude\":-77.15467026163584,\"longitude\":38.888666728921784}},{\"permit\":{\"status\":\"Approved\",\"address\":\"629N.MonroeStreet\",\"units\":3,\"zip\":22201},\"location\":{\"latitude\":-77.10151699288373,\"longitude\":38.879544185714565}},{\"permit\":{\"status\":\"Approved\",\"address\":\"1907N.RooseveltStreet\",\"units\":3,\"zip\":22205},\"location\":{\"latitude\":-77.15441402183434,\"longitude\":38.88645795676943}},{\"permit\":{\"status\":\"Approved\",\"address\":\"422916thStreetS.\",\"units\":4,\"zip\":22204},\"location\":{\"latitude\":-77.1008488072026,\"longitude\":38.85317834320084}},{\"permit\":{\"status\":\"Approved\",\"address\":\"1004N.DanielStreet\",\"units\":6,\"zip\":22201},\"location\":{\"latitude\":-77.09082457284634,\"longitude\":38.8846856658936}},{\"permit\":{\"status\":\"Approved\",\"address\":\"2129N.TroyStreet\",\"units\":2,\"zip\":22201},\"location\":{\"latitude\":-77.08382637582453,\"longitude\":38.89849796956928}},{\"permit\":{\"status\":\"First\\nReview\\nRejected\\n[9/01/2023]\",\"address\":\"1052S.EdisonStreet\",\"units\":6,\"zip\":22204},\"location\":{\"latitude\":-77.11267893904684,\"longitude\":38.85300733627215}},{\"permit\":{\"status\":\"First\\nReview\\nRejected\\n[8/21/2023]\",\"address\":\"2108S.JoyceStreet\",\"units\":2,\"zip\":22202},\"location\":{\"latitude\":-77.06329248730268,\"longitude\":38.854661802028424}},{\"permit\":{\"status\":\"First\\nReview\\nRejected\\n[9/14/2023]\",\"address\":\"90020thStS\",\"units\":3,\"zip\":22202},\"location\":{\"latitude\":-77.06150027586754,\"longitude\":38.85550892829733}},{\"permit\":{\"status\":\"First\\nReview\\nRejected\\n[9/20/2023]\",\"address\":\"703N.BartonStreet\",\"units\":4,\"zip\":22201},\"location\":{\"latitude\":-77.08723320915793,\"longitude\":38.88075161229324}},{\"permit\":{\"status\":\"**WITHDRAWN**\\n10/16/2023\",\"address\":\"12S.HighlandStreet\",\"units\":2,\"zip\":22204},\"location\":{\"latitude\":-77.09193587104666,\"longitude\":38.87258477191245}},{\"permit\":{\"status\":\"First\\nReview\\nRejected\\n[9/21/2023]\",\"address\":\"432N.MonroeStreet\",\"units\":2,\"zip\":22201},\"location\":{\"latitude\":-77.10068319937405,\"longitude\":38.87660238723735}},{\"permit\":{\"status\":\"Second\\nReview\\nRejected\\n[12/04/2023]\",\"address\":\"34117thStreetS.\",\"units\":4,\"zip\":22204},\"location\":{\"latitude\":-77.0934969311431,\"longitude\":38.865658551720784}},{\"permit\":{\"status\":\"First\\nReview\\nRejected\\n[10/23/2023]\",\"address\":\"1524N.RandolphStreet\",\"units\":2,\"zip\":22207},\"location\":{\"latitude\":-77.11040288522899,\"longitude\":38.88992823384846}},{\"permit\":{\"status\":\"Under\\nSecond\\nReview\\n[11/03/2023]\",\"address\":\"561723rdStreetN.\",\"units\":2,\"zip\":22205},\"location\":{\"latitude\":-77.13977625221719,\"longitude\":38.89377140530589}},{\"permit\":{\"status\":\"Under\\nSecond\\nReview\\n[11/28/2023]\",\"address\":\"461017thStreetN.\",\"units\":6,\"zip\":22207},\"location\":{\"latitude\":-77.11844933348101,\"longitude\":38.891363837947516}},{\"permit\":{\"status\":\"Under\\nSecond\\nReview\\n[11/09/2023]\",\"address\":\"2111N.UhleStreet\",\"units\":6,\"zip\":22201},\"location\":{\"latitude\":-77.08487602553288,\"longitude\":38.89577154970652}},{\"permit\":{\"status\":\"First\\nReview\\nRejected\\n[11/21/2023]\",\"address\":\"30147thStreetN.\",\"units\":3,\"zip\":22201},\"location\":{\"latitude\":-77.09366029569696,\"longitude\":38.88091583582789}},{\"permit\":{\"status\":\"First\\nReview\\nRejected\\n[11/27/2023]\",\"address\":\"520N.GarfieldStreet\",\"units\":3,\"zip\":22201},\"location\":{\"latitude\":-77.09349671270246,\"longitude\":38.879722074284494}},{\"permit\":{\"status\":\"Under\\nReview\",\"address\":\"735N.GeorgeMasonDr.\",\"units\":3,\"zip\":22203},\"location\":{\"latitude\":-77.1198915131058,\"longitude\":38.87709758213202}},{\"permit\":{\"status\":\"**DENIAL**\\n[12/04/2023]\\nLotineligiblefor\\nEHOdevelopment,\\nperACZO§10.4.2.A\",\"address\":\"1922N.VeitchStreet\",\"units\":6,\"zip\":22201},\"location\":{\"latitude\":-77.08662430068728,\"longitude\":38.89622836545168}},{\"permit\":{\"status\":\"Under\\nReview\",\"address\":\"2400N.LincolnStreet\",\"units\":3,\"zip\":22207},\"location\":{\"latitude\":-77.10189457288459,\"longitude\":38.901737203082476}}]";

export const App = () => {
  const [geocodedPermits, setGeocodedPermits] = useState<GeocodedPermit[] | null>(null);
  const [errorString, setErrorString] = useState<string | null>(null);

  try {
    setGeocodedPermits(JSON.parse(data));
  } catch (err) {
    setErrorString("failed to parse");
  }
  

  // useEffect(() => {
  //   fetch("https://gist.github.com/rzca/d98b616a38bc510f26d272577c274789")
  //   .then(res => res.json())
  //   .then(data => setGeocodedPermits(JSON.parse(data)))
  //   .catch(err => {
  //     setErrorString("failed to fetch data");
  //     console.log("failed to fetch data", err);
  // });
  // })

  if (errorString != null) {
    return <div>{errorString}</div>
  }

  return (
    <>
      <div>
        <Map height={600} width={600} defaultCenter={[50.879, 4.6997]} defaultZoom={11}>
          {geocodedPermits && geocodedPermits.map(p => <Marker anchor={[p.location?.latitude, p.location?.longitude]}></Marker>)}
          <Marker width={50} anchor={[50.879, 4.6997]} color="red" />
        </Map>
        </div>
    </>
  );
}

export default App;
