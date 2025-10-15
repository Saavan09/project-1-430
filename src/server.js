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
    req.query = query;

    //serve main client html page
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

    //serve stylesheet
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

    //serve client js which connects html to backend
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


    //all possible endpoints
    switch (pathname) {
        case '/getCountries':
            if (req.method === 'GET') {
                jsonResponses.getCountries(req, res, countries);
            } else if (req.method === 'HEAD') {
                jsonResponses.getCountriesMeta(req, res);
            }
            break;

        case '/getCountryByName':
            if (req.method === 'GET') {
                jsonResponses.getCountryByName(req, res, countries);
            } else if (req.method === 'HEAD') {
                jsonResponses.getCountryByNameMeta(req, res);
            }
            break;

        case '/getCountriesByTimezone':
            if (req.method === 'GET') {
                jsonResponses.getCountriesByTimezone(req, res, countries);
            } else if (req.method === 'HEAD') {
                jsonResponses.getCountriesByTimezoneMeta(req, res);
            }
            break;

        case '/getCountriesByCapital':
            if (req.method === 'GET') {
                jsonResponses.getCountriesByCapital(req, res, countries);
            } else if (req.method === 'HEAD') {
                jsonResponses.getCountriesByCapitalMeta(req, res);
            }
            break;

        case '/addCountry':
            if (req.method === 'POST') {
                parseBody(req, res, (body) => {
                    jsonResponses.addCountry(req, res, body, countries);
                });
            }
            break;

        case '/editCountry':
            if (req.method === 'POST') {
                parseBody(req, res, (body) => {
                    jsonResponses.editCountry(req, res, body, countries);
                });
            }
            break;

        default:
            if (req.method === 'HEAD') {
                jsonResponses.notFoundMeta(req, res);
            } else {
                jsonResponses.notFound(req, res);
            }
            break;
    }
};

http.createServer(onRequest).listen(port, () => {
    console.log(`Listening on 127.0.0.1:${port}`);
});
