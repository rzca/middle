# middle

# updating the data
The data that backs [ehomap.org](https://ehomap.org) is all stored statically in this repository in the `/src/data/permits.json` file.

There are three steps to updating that file with new data:
- fetch new permit data from Arlington County's [EHO Tracker](https://www.arlingtonva.us/Government/Programs/Building/Permits/EHO/Tracker)
- this fetching this data has been wrapped up in the "permits" script
    `npm run permits`
- fetch assessment data for any of the new permits:
    `npm run assessments`
- fetch geocoded lat/lngs for any of the new permits:
    `npm run geocodes`