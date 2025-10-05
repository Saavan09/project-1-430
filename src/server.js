const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const jsonResponses = require('./jsonResponses');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

//parse countries.json and save
let countries = [];

try {
    const raw = fs.readFileSync(path.join(__dirname, '../data/countries.json'), 'utf8');
    countries = JSON.parse(raw);
    console.log(`Loaded ${countries.length} countries`);
} catch (err) {
    console.error('Error loading countries.json:', err);
}

const parseBody = (req, res, callback) => {
    let body = '';

    req.on('data', (chunk) => {
        body += chunk;
    });

    req.on('end', () => {
        if (body.length > 0) {
            try {
                if (req.headers['content-type'] === 'application/json') {
                    callback(JSON.parse(body));
                } else if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
                    const parsed = {};
                    body.split('&').forEach((pair) => {
                        const [key, value] = pair.split('=');
                        parsed[decodeURIComponent(key)] = decodeURIComponent(value);
                    });
                    callback(parsed);
                } else {
                    //unsupported content type
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.write(JSON.stringify({ message: 'Unsupported Content-Type', id: 'unsupportedType' }));
                    res.end();
                }
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({ message: 'Invalid body', id: 'invalidBody' }));
                res.end();
            }
        } else {
            callback({});
        }
    });
};


const onRequest = (req, res) => {
    console.log(req.method, req.url);

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    if (pathname === '/' || pathname === '/client.html') {
        fs.readFile(path.join(__dirname, '../client/client.html'), (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.write('Internal Server Error');
                res.end();
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(data);
                res.end();
            }
        });
        return;
    }

    if (pathname === '/style.css') {
        fs.readFile(path.join(__dirname, '../client/style.css'), (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.write('Internal Server Error');
                res.end();
            } else {
                res.writeHead(200, { 'Content-Type': 'text/css' });
                res.write(data);
                res.end();
            }
        });
        return;
    }

    //empty right now but serving here just in case
    if (pathname === '/index.js') {
        fs.readFile(path.join(__dirname, '../client/index.js'), (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.write('Internal Server Error');
                res.end();
            } else {
                res.writeHead(200, {
                    'Content-Type': 'application/javascript',
                    'Content-Length': Buffer.byteLength(data),
                });
                res.write(data);
                res.end();
            }
        });
        return;
    }




    //API ROUTES



    //GET enpoints
    if (pathname === '/getCountries') {
        const { region, subregion, name } = query; // read query params

        // Filter countries based on query
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

        const responseJSON = JSON.stringify({ countries: filteredCountries });

        if (req.method === 'GET') {
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(responseJSON),
            });
            res.write(responseJSON);
            res.end();
        } else if (req.method === 'HEAD') {
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(responseJSON),
            });
            res.end();
        }
        return;
    }



    //POST endpoints
    if (pathname === '/addCountry' && req.method === 'POST') {
        parseBody(req, res, (body) => {
            if (!body.name || !body.capital || !body.region) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({ message: 'Missing required fields', id: 'missingFields' }));
                res.end();
                return;
            }

            //add the new country to in-memory array
            countries.push(body);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify({ message: `Added country ${body.name}` }));
            res.end();
        });
        return;
    }

    if (pathname === '/editCountry' && req.method === 'POST') {
        parseBody(req, res, (body) => {
            if (!body.name) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({ message: 'Missing country name', id: 'missingName' }));
                res.end();
                return;
            }

            //find the country by name
            const countryIndex = countries.findIndex(
                (c) => c.name.toLowerCase() === body.name.toLowerCase()
            );

            if (countryIndex === -1) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({ message: 'Country not found', id: 'notFound' }));
                res.end();
                return;
            }

            //update it with any provided fields
            countries[countryIndex] = { ...countries[countryIndex], ...body };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify({ message: `Updated country ${body.name}` }));
            res.end();
        });
        return;
    }



    //fallback
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify({ message: 'Endpoint not found', id: 'notFound' }));
    res.end();

};

http.createServer(onRequest).listen(port, () => {
    console.log(`Listening on 127.0.0.1:${port}`);
});
