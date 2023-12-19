
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