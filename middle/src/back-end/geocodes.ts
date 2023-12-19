import { Semaphore } from "@shopify/semaphore";
import { JSDOM } from 'jsdom';

type Permit = {
    permitNumber: string,
    submissionDate: string,
    approvalDate: string | null,
    status: string,
    address: string,
    units: number,
    zip: number,
    unitType: string,
    zoningDistrict: string
}

type GeocodedPermit = {
    permit: Permit,
    location: { latitude: number, longitude: number,} | undefined
}

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

export const getData = async () => {

    if (html == null) {
        const text = await fetch("https://www.arlingtonva.us/Government/Programs/Building/Permits/EHO/Tracker")
            .then(res => res.blob())
            .then(blob => blob.text());
    
        html = text;
        const dom = new JSDOM(html);
    
        // get all the permits from the approved table
        Array.from(dom.window.document.querySelectorAll("table:nth-of-type(1) > tbody > tr")).slice(1).forEach(tr => {
            permits.push({
                permitNumber: tr.children.item(0)?.textContent,
                submissionDate: tr.children.item(1)?.textContent,
                approvalDate: tr.children.item(2)?.textContent,
                status: tr.children.item(3)?.textContent,
                address: tr.children.item(4)?.textContent,
                zip: parseInt(tr.children.item(5)?.textContent),
                units: parseInt(tr.children.item(6)?.textContent),
                unitType: tr.children.item(7)?.textContent,
                zoningDistrict: tr.children.item(8)?.textContent,
            })
        });
    
        // get all the permits from the under review table
        Array.from(dom.window.document.querySelectorAll("table:nth-of-type(3) > tbody > tr")).slice(1).forEach(tr => {
            permits.push({
                permitNumber: tr.children.item(0)?.textContent!,
                submissionDate: tr.children.item(1)?.textContent!,
                approvalDate: null,
                status: tr.children.item(3)?.textContent!,
                address: tr.children.item(4)?.textContent!,
                zip: parseInt(tr.children.item(5)?.textContent!),
                units: parseInt(tr.children.item(6)?.textContent!),
                unitType: tr.children.item(7)?.textContent!,
                zoningDistrict: tr.children.item(8)?.textContent!,
            })
        });
    }
    
    const geocodedPermits = await Promise.all(permits.map(async (permit) => {
        try {
            return await getCoordinatesForPermit(permit)
        } catch(e) {
            return { permit, location: undefined };
        }
        }));

    console.log(JSON.stringify(geocodedPermits));    

    return geocodedPermits;
}

// export const writeData(geocodedPermits: GeocodedPermit[]) {

// }