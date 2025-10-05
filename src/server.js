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




    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify({ message: 'Server is running' }));
    res.end();
};

http.createServer(onRequest).listen(port, () => {
    console.log(`Listening on 127.0.0.1:${port}`);
});
