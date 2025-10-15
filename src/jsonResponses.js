//json helper
const respondJSON = (request, response, status, object) => {
    const responseString = JSON.stringify(object);

    response.writeHead(status, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(responseString),
    });
    response.write(responseString);
    response.end();
};

const respondJSONMeta = (request, response, status) => {
    response.writeHead(status, { 'Content-Type': 'application/json' });
    response.end();
};



//GET endpoints


//gets country names alongside their region, subregion, and capital
const getCountries = (request, response, countries) => {
    const { region, subregion, name } = request.query;
    let filteredCountries = countries;

    if (region) {
        filteredCountries = filteredCountries.filter(
            (c) => c.region.toLowerCase() === region.toLowerCase()
        );
    }

    if (subregion) {
        filteredCountries = filteredCountries.filter(
            (c) => c.subregion.toLowerCase() === subregion.toLowerCase()
        );
    }

    if (name) {
        filteredCountries = filteredCountries.filter(
            (c) => c.name.toLowerCase() === name.toLowerCase()
        );
    }

    if (filteredCountries.length === 0) {
        return respondJSONMeta(request, response, 204);
    }

    return respondJSON(request, response, 200, { countries: filteredCountries });
};

//head
const getCountriesMeta = (request, response) => {
    respondJSONMeta(request, response, 200);
};

//gets countries specifically based on name
const getCountryByName = (request, response, countries) => {
    const { name } = request.query;

    if (!name) {
        return respondJSON(request, response, 400, {
            message: 'Name query parameter is required',
            id: 'missingName',
        });
    }

    const country = countries.find(
        (c) => c.name.toLowerCase() === name.toLowerCase()
    );

    if (!country) {
        return respondJSONMeta(request, response, 204);
    }

    return respondJSON(request, response, 200, { country });
};

//head
const getCountryByNameMeta = (request, response) => {
    respondJSONMeta(request, response, 200);
};

//gets countries specifically based on timezone
const getCountriesByTimezone = (request, response, countries) => {
    const { timezone } = request.query;

    let filteredCountries = countries;

    if (timezone) {
        filteredCountries = countries.filter((c) =>
            Array.isArray(c.timezones) &&
            c.timezones.some((t) => t.abbreviation.toLowerCase() === timezone.toLowerCase())
        );
    }

    if (filteredCountries.length === 0) {
        return respondJSONMeta(request, response, 204);
    }

    return respondJSON(request, response, 200, { countries: filteredCountries });
};

//head
const getCountriesByTimezoneMeta = (request, response) => {
    respondJSONMeta(request, response, 200);
};

//gets countries based on their capital
const getCountriesByCapital = (request, response, countries) => {
    const { capital } = request.query;

    if (!capital) {
        return respondJSON(request, response, 400, {
            message: 'Capital query parameter is required',
            id: 'missingCapital',
        });
    }

    const filteredCountries = countries.filter((c) =>
        c.capital.toLowerCase() === capital.toLowerCase()
    );

    if (filteredCountries.length === 0) {
        return respondJSONMeta(request, response, 204);
    }

    return respondJSON(request, response, 200, { countries: filteredCountries });
};

//head
const getCountriesByCapitalMeta = (request, response) => {
    respondJSONMeta(request, response, 200);
};



//POST enpoints


//creates a new country and adds it to the database. needs name capital and region
const addCountry = (request, response, body, countries) => {
    if (!body.name || !body.capital || !body.region) {
        return respondJSON(request, response, 400, {
            message: 'Missing required fields',
            id: 'missingFields',
        });
    }

    //check if country already exists
    const existing = countries.find(
        (c) => c.name.toLowerCase() === body.name.toLowerCase()
    );

    if (existing) {
        //update existing country
        Object.assign(existing, body);
        return respondJSONMeta(request, response, 204);
    }

    //add new country
    countries.push(body);

    return respondJSON(request, response, 201, {
        message: `Added country ${body.name}`,
        id: 'created',
    });
};

//edit country that already exists in database. changes its fields
const editCountry = (request, response, body, countries) => {
    if (!body.name) {
        return respondJSON(request, response, 400, {
            message: 'Missing country name',
            id: 'missingName',
        });
    }

    const countryIndex = countries.findIndex(
        (c) => c.name.toLowerCase() === body.name.toLowerCase()
    );

    if (countryIndex === -1) {
        return respondJSON(request, response, 404, {
            message: 'Country not found',
            id: 'notFound',
        });
    }

    //update country with provided fields
    countries[countryIndex] = { ...countries[countryIndex], ...body };

    return respondJSON(request, response, 200, {
        message: `Updated country ${body.name}`,
        id: 'updated',
    });
};


//fallback
const notFound = (request, response) => {
    respondJSON(request, response, 404, {
        message: 'The page you are looking for was not found',
        id: 'notFound',
    });
};

const notFoundMeta = (request, response) => {
    respondJSONMeta(request, response, 404);
};



module.exports.respondJSON = respondJSON;
module.exports.respondJSONMeta = respondJSONMeta;

module.exports.getCountries = getCountries;
module.exports.getCountriesMeta = getCountriesMeta;

module.exports.getCountryByName = getCountryByName;
module.exports.getCountryByNameMeta = getCountryByNameMeta;

module.exports.getCountriesByTimezone = getCountriesByTimezone;
module.exports.getCountriesByTimezoneMeta = getCountriesByTimezoneMeta;

module.exports.getCountriesByCapital = getCountriesByCapital;
module.exports.getCountriesByCapitalMeta = getCountriesByCapitalMeta;

module.exports.addCountry = addCountry;
module.exports.editCountry = editCountry;

module.exports.notFound = notFound;
module.exports.notFoundMeta = notFoundMeta;