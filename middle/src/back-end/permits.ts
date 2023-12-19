
import { default as permits } from "../data/permits.json" assert { type: "json" };
import { JSDOM } from 'jsdom';
import { Permit, Location, Assessment } from "../shared/types";
import { default as fs } from "fs/promises";

export const getPermits = async () => {
    const permits: Permit[] = [];

    const text = await fetch("https://www.arlingtonva.us/Government/Programs/Building/Permits/EHO/Tracker")
        .then(res => res.blob())
        .then(blob => blob.text());

    const dom = new JSDOM(text);

    // get all the permits from the approved table
    Array.from(dom.window.document.querySelectorAll("table:nth-of-type(1) > tbody > tr")).slice(1).forEach(tr => {
        permits.push({
            permitNumber: tr.children.item(0)!.textContent!,
            submissionDate: tr.children.item(1)!.textContent!,
            approvalDate: tr.children.item(2)!.textContent!,
            status: tr.children.item(3)!.textContent!,
            address: tr.children.item(4)!.textContent!,
            zip: parseInt(tr.children.item(5)!.textContent!),
            units: parseInt(tr.children.item(6)!.textContent!),
            unitType: tr.children.item(7)!.textContent!,
            zoningDistrict: tr.children.item(8)!.textContent!,
        })
    });

    // get all the permits from the under review table
    Array.from(dom.window.document.querySelectorAll("table:nth-of-type(3) > tbody > tr")).slice(1).forEach(tr => {
        permits.push({
            permitNumber: tr.children.item(0)!.textContent!,
            submissionDate: tr.children.item(1)!.textContent!,
            approvalDate: null,
            status: tr.children.item(3)!.textContent!,
            address: tr.children.item(4)!.textContent!,
            zip: parseInt(tr.children.item(5)!.textContent!),
            units: parseInt(tr.children.item(6)!.textContent!),
            unitType: tr.children.item(7)!.textContent!,
            zoningDistrict: tr.children.item(8)!.textContent!,
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
        newPermits.push({permit: permit, location: existingPermit.location, assessment: existingPermit.assessment})
    }

    // if it does not exist, 
    if (!permits.map(p => p.permit.address).includes(permit.address)) {
        console.log("new permit!", permit);
        newPermits.push({permit: permit, location: undefined, assessment: undefined})
    }
}

await fs.writeFile('./src/data/permits.json', JSON.stringify(newPermits, null, 2), 'utf8');