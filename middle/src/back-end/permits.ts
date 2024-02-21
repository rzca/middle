
import { default as permits } from "../data/permits.json" assert { type: "json" };
import { JSDOM } from 'jsdom';
import { Permit, Location, Assessment } from "../shared/types";
import { default as fs } from "fs/promises";

export const getPermits = async () => {
    const permits: Permit[] = [];

    const text = await fetch("https://www.arlingtonva.us/Government/Programs/Building/Permits/EHO/Tracker", {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "max-age=0",
            "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1"
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    })
        .then(res => res.blob())
        .then(blob => blob.text());

    const dom = new JSDOM(text);

    // get all the permits from the approved table
    Array.from(dom.window.document.querySelectorAll("table:nth-of-type(1) > tbody > tr")).slice(1).forEach(tr => {
        permits.push({
            permitNumber: tr.children.item(0)!.textContent!.trim(),
            submissionDate: tr.children.item(1)!.textContent!.trim(),
            approvalDate: tr.children.item(2)!.textContent!.trim(),
            status: tr.children.item(3)!.textContent!.trim(),
            address: tr.children.item(4)!.textContent!.trim(),
            zip: parseInt(tr.children.item(5)!.textContent!.trim()),
            units: parseInt(tr.children.item(6)!.textContent!.trim()),
            unitType: tr.children.item(7)!.textContent!.trim(),
            zoningDistrict: tr.children.item(8)!.textContent!.trim(),
        })
    });

    // get all the permits from the under review table
    Array.from(dom.window.document.querySelectorAll("table:nth-of-type(3) > tbody > tr")).slice(1).forEach(tr => {
        permits.push({
            permitNumber: tr.children.item(0)!.textContent!.trim(),
            submissionDate: tr.children.item(1)!.textContent!.trim(),
            approvalDate: null,
            status: tr.children.item(3)!.textContent!.trim(),
            address: tr.children.item(4)!.textContent!.trim(),
            zip: parseInt(tr.children.item(5)!.textContent!.trim()),
            units: parseInt(tr.children.item(6)!.textContent!.trim()),
            unitType: tr.children.item(7)!.textContent!.trim(),
            zoningDistrict: tr.children.item(8)!.textContent!.trim(),
        })
    });

    return permits;
}

const scrapedPermits = await getPermits();
const newPermits: { permit: Permit, location?: Location, assessment?: Assessment }[] = [];

for (const permit of scrapedPermits) {
    const existingPermits = permits.filter(p => p.permit.address == permit.address)

    // if the permit already exists, replace the permit object with the new one but keep existing geocodes and assessments
    if (existingPermits.length == 1) {
        const existingPermit = existingPermits[0];
        newPermits.push({ permit: permit, location: existingPermit.location, assessment: existingPermit.assessment })
    }

    // if it does not exist, 
    if (!permits.map(p => p.permit.address).includes(permit.address)) {
        console.log("new permit!", permit);
        newPermits.push({ permit: permit, location: undefined, assessment: undefined })
    }
}

newPermits.sort((left, right) => left.permit.permitNumber > right.permit.permitNumber ? 1 : -1);

await fs.writeFile('./src/data/permits.json', JSON.stringify(newPermits, null, 2), 'utf8');