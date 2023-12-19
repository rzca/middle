// import { GeocodedPermit } from "../shared/types";
import { default as permits } from "../data/permits.json" assert { type: "json" };
// import { default as permitsWithAssessments } from "../data/assessments.json";
import { JSDOM } from 'jsdom';
import { Location, Permit, Assessment } from "../shared/types";
import { default as fs } from "fs/promises";

const getAssessment = async (streetNumber?: string, streetName?: string, direction?: "N" | "S", streetType?: string) => {
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
    const dom = new JSDOM(xx);

    const rows = Array.from(dom.window.document.querySelectorAll("table:nth-of-type(1) > tbody > tr")).slice(1);

    // assert we have two trs: one for the headers and one for the data
    const assessments: Assessment[] = rows.map(tr => {
        return {
            address: tr.children.item(2)?.textContent!,
            assessedValue2023: parseFloat(tr.children.item(3)?.textContent!.replace("$", "").replaceAll(",", "")!),
            taxDue: tr.children.item(4)?.textContent!,
            taxPaymentStatus: tr.children.item(5)?.textContent!,
            lastSale: tr.children.item(6)?.textContent!
        }
    })
    return assessments;
}

const newPermits: { permit: Permit, location?: Location, assessment?: Assessment }[] = [];

const getType = (address: string): "ST" | "DR" | "RD" | "CT" | undefined => {
    if (address.toLowerCase().includes("street")) return "ST";
    if (address.toLowerCase().includes("drive")) return "DR";
    if (address.toLowerCase().includes("road")) return "RD";
    if (address.toLowerCase().includes("court")) return "CT";
} // I'm sure there are more! 

for (const permit of permits) {
    if (permit.assessment == null) {
        const numberRegex: RegExp = /[0-9]{1,4}/;
        const direction: "N" | "S" = permit.permit.address.includes("S.") ? "S" : "N";
        const type = getType(permit.permit.address);

        // sometimes the N. or the S. appears in different spots
        const street = permit.permit.address
            .replace("N.", "")
            .replace("S.", "")
            .replace("  ", " ")
            .split(" ").slice(1, permit.permit.address.split(" ").length)[0];

        const streetNumber = numberRegex.exec(permit.permit.address)![0];

        const assessment = await getAssessment(streetNumber, street, direction, type);
        if (assessment.length == 1) {
            newPermits.push({ permit: permit.permit, location: permit.location, assessment: assessment[0] })
        }
        else {
            console.log("did not find assessment", permit.permit);
            newPermits.push({ permit: permit.permit, location: permit.location, assessment: undefined })
        }
    }
}

await fs.writeFile('./src/data/permits.json', JSON.stringify(newPermits, null, 2), 'utf8');

// const ss = await getAssessment("2909", "2ND", "N", "RD");
// console.log(ss);