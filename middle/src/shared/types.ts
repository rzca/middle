
export type Permit = {
    status: string;
    address: string;
    units: number;
    zip: number;
};

export type Location = {
    latitude: number;
    longitude: number;
}

export type GeocodedPermit = {
    permit: Permit;
    location: Location;
};

export interface Assessment {
    address: string,
    assessedValue2023: number,
    taxDue: string,
    taxPaymentStatus: string,
    lastSale: string
}