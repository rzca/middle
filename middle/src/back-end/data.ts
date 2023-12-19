// import { GeocodedPermit } from "../shared/types";
import { default as permits } from "../data/geocodedpermits.json" assert { type: "json" };
// import { default as permitsWithAssessments } from "../data/assessments.json";
import { JSDOM } from 'jsdom';
import { Location, Permit } from "../shared/types";
import { default as fs } from "fs/promises";

interface Assessment {
    rpc: string,
    owner: string,
    address: string,
    assessedValue2023: number,
    taxDue: string,
    taxPaymentStatus: string,
    lastSale: string
}

const getAssessment = async (streetNumber: string, streetName: string, direction: "N" | "S", streetType: string) => {
    const xx = await fetch("https://propertysearch.arlingtonva.us/Home/Search", {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/x-www-form-urlencoded",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-User": "?1"
        },
        "referrer": "https://propertysearch.arlingtonva.us/Home/Search",
        "body": `action=Search&SearchFilters.StreetNumber=${streetNumber}&SearchFilters.DirectionSelected=${direction}&SearchFilters.StreetSelected=${streetName}&SearchFilters.TypeSelected=${streetType}&SearchFilters.Unit=&SearchFilters.RPCs=&SearchFilters.TaxStatementAccountNumber=&SearchFilters.TradeName=`,
        "method": "POST",
        "mode": "cors"
    }).then(res => res.blob())
        .then(blob => blob.text());
    // .then(data => console.log(data));

    // return xx;

    const dom = new JSDOM(xx);

    const zz = Array.from(dom.window.document.querySelectorAll("table:nth-of-type(1) > tbody > tr")).slice(1);

    // assert we have two trs: one for the headers and one for the data
    const assessments: Assessment[] = zz.map(tr => {
        return {
            rpc: tr.children.item(0)?.textContent!,
            owner: tr.children.item(1)?.textContent!,
            address: tr.children.item(2)?.textContent!,
            assessedValue2023: parseFloat(tr.children.item(3)?.textContent!.replace("?", "").replace(",", "")!),
            taxDue: tr.children.item(4)?.textContent!,
            taxPaymentStatus: tr.children.item(5)?.textContent!,
            lastSale: tr.children.item(6)?.textContent!
        }
    })
    return assessments;
}

// permits satisfies { permit: Permit, location?: Location, assessment?: Assessment }[]
const newPermits: { permit: Permit, location?: Location, assessment?: Assessment }[] = permits;

permits.forEach(async permit => {
    if (permit.assessment == null) {
        const numberRegex: RegExp = /[0-9]{1,4}/;
        const streetNumber = numberRegex.exec(permit.permit.address)![0]

        const assessment = await getAssessment(streetNumber, "taylor", "S", "Drive");
        if (assessment.length == 1) {
            newPermits.push({ permit: permit.permit, location: permit.location, assessment: assessment[0] })
        }
        else {
            newPermits.push({ permit: permit.permit, location: permit.location, assessment: undefined })
        }

    }
})

await fs.writeFile('./src/data/geocodedPermits.json', JSON.stringify(newPermits), 'utf8');

// const ss = await getAssessment("2909", "2ND", "N", "RD");
// console.log(ss);