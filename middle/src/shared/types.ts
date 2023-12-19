export type Permit = {
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

export type Location = {
    latitude: number;
    longitude: number;
}

export type GeocodedPermit = {
    permit: Permit;
    location: Location;
};

export type Assessment = {
    address: string,
    assessedValue2023: number,
    taxDue: string,
    taxPaymentStatus: string,
    lastSale: string
}