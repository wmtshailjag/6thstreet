require('dotenv-flow').config();
const express = require('express');
var serveStatic = require('serve-static')
const serverTimings = require('server-timings');
const cookieParser = require('cookie-parser');
const proxy = require('./src/setupProxy');
const path = require('path');

const PORT = 3000;
const app = express();
function setCustomCacheControl(res, path) {
    res.append('Access-Control-Allow-Origin', ['*']);
    if (serveStatic.mime.lookup(path) === 'text/html' || res.req.path === '/serviceworker.js') {
        // Custom Cache-Control for HTML files & Service Worker File
        res.setHeader('Cache-Control', 'public, max-age=0')
    }

    else {
        res.append('cache-control', 'public, max-age=259200, must-revalidate');
    }
    // Prevent Click-Jacking
    res.setHeader("X-Frame-Options", "SAMEORIGIN");

    // Dont allow browser to do sniffing with MIME type
    res.setHeader("X-Content-Type-Options", "nosniff")

    // Prevent cross site scripting, 'mode=block' prevent loading the page, unlike only sanitization
    res.setHeader("X-XSS-Protection", "1; mode=block;")

    // To convert http to https 'subDomains' to include subDomains also
    res.setHeader("Strict-Transport-Security", "max-age=15768000; includeSubDomains")
}
app.use(cookieParser())
app.use(serverTimings);
proxy(app);

// Serve the static files from the React app
app.use(serveStatic(path.join(__dirname, 'build'), {
    setHeaders: setCustomCacheControl,
    index: false
}))

// app.use(express.static(path.join(__dirname, 'build')));
// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
    const { locale, gender="" } = req.cookies;
    const host =  !locale?"":process.env[`REACT_APP_HOST_${locale.replace("-", "_").toUpperCase()}`];
    if(gender && req.path==="/"){
        return res.redirect(302, `${host}/${gender}`);
    }
    if(locale){
        let queryString = "";
        for(key in req.query) {
            queryString = queryString + `${key}=${req.query[key]}`
        }
        queryString = `?${queryString}`;
        // If locale & gender are set, rediect to the regional subdomain
        const path = req.path==="/" ? `/${gender}` : `${req.path}${queryString}`;
        return res.redirect(302, `${host}${path}`);
    }

    return res.sendFile(path.join(`${__dirname}/build/index.html`));
});

app.listen(PORT, () => {
    console.log('Application started. Press Ctrl+C to quit');
});
app.disable('x-powered-by');