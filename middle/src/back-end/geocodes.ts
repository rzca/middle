import { Semaphore } from "@shopify/semaphore";

import { default as permits } from "../data/permits.json" assert { type: "json" };
import { JSDOM } from 'jsdom';
import { Location, Permit } from "../shared/types";
import { default as fs } from "fs/promises";

let html: string | null = null;
const permits: Permit[] = []
const geocodedPermits: GeocodedPermit[] = [];

const cache: { [address: string]: GeocodedPermit } = {}

const semaphore = new Semaphore(1);

const getCoordinatesForPermit = async (permit: Permit, checkCache = true) => {
    if (checkCache && permit.address in cache) {
        return cache[permit.address];
    }

    const semaphorePermit = await semaphore.acquire();

    // usps geocoding
    const usps = await fetch("https://geocoding.geo.census.gov/geocoder/locations/address?street=" + permit.address +"&city=Arlington&state=VA&benchmark=2020&format=json")
        .then(res => {
            // console.log(res);
            return res.json();
        })
        .then(json => {
            // console.log(json);
            return {
                latitude: parseFloat(json["result"]["addressMatches"][0]["coordinates"]["x"]),
                longitude: parseFloat(json["result"]["addressMatches"][0]["coordinates"]["y"]),
            };
        }).catch(err => {
            console.log(err, permit);
            
            throw new Error(err);
        }).finally(() => {
                // sleep 1s
            setTimeout(() => {}, 1000)
            semaphorePermit.release();
        });

    cache[permit.address] = { permit: permit, location: { latitude: usps.latitude, longitude: usps.longitude }};

    return cache[permit.address];
}

// export const writeData(geocodedPermits: GeocodedPermit[]) {

// }


for (const permit of permits) {
    if (permit.location == null) {
        const numberRegex: RegExp = /[0-9]{1,4}/;
        const direction: "N" | "S" = permit.permit.address.includes("S.") ? "S" : "N";
        const type = getType(permit.permit.address);

        // sometimes the N. or the S. appears in different spots
        const streetNameWords = permit.permit.address
            .replace("N.", "")
            .replace("S.", "")
            .replace("  ", " ")
            .split(" ");

        const streetName = streetNameWords.length == 3 ? streetNameWords[1] : streetNameWords[1].concat(" " + streetNameWords[2]);

        const streetNumber = numberRegex.exec(permit.permit.address)![0];

        const assessment = await getAssessment(streetNumber, streetName, direction, type);
        if (assessment.length == 1) {
            newPermits.push({ permit: permit.permit, location: permit.location, assessment: assessment[0] })
        }
        else {
            console.log("did not find assessment", permit.permit);
            newPermits.push({ permit: permit.permit, location: permit.location, assessment: undefined })
        }
    }
    else {
        newPermits.push(permit);
    }
}

await fs.writeFile('./src/data/permits.json', JSON.stringify(newPermits, null, 2), 'utf8');