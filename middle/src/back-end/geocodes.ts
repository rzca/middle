import { Semaphore } from "@shopify/semaphore";

import { default as permits } from "../data/permits.json" assert { type: "json" };
import { Location, Permit, Assessment } from "../shared/types";
import { default as fs } from "fs/promises";

const semaphore = new Semaphore(1);

const getCoordinatesForPermit = async (permit: Permit): Promise<Location | undefined> => {
    const semaphorePermit = await semaphore.acquire();

    // usps geocoding
    const usps = await fetch("https://geocoding.geo.census.gov/geocoder/locations/address?street=" + permit.address + "&city=Arlington&state=VA&benchmark=2020&format=json")
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

            // throw new Error(err);
        }).finally(() => {
            // sleep 1s
            setTimeout(() => { }, 1000)
            semaphorePermit.release();
        });

    if (!usps) {
        return;
    }

    return { latitude: usps.latitude, longitude: usps.longitude };
}

const newPermits: { permit: Permit, location?: Location, assessment?: Assessment }[] = [];

for (const permit of permits) {
    if (permit.location == null) {
        const coordinates = await getCoordinatesForPermit(permit.permit);

        if (coordinates) {
            const newPermit = { permit: permit.permit, location: coordinates, assessment: permit.assessment };
            newPermits.push(newPermit)
            console.log("saved coordinates!", newPermit);
        }
        else {
            console.log("failed to geocode", permit);
            newPermits.push(permit);
        }
    }
    else {
        newPermits.push(permit);
    }
}

await fs.writeFile('./src/data/permits.json', JSON.stringify(newPermits, null, 2), 'utf8');
