const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const e = require('express');
const app = express();
const server = http.createServer(app);

const routes = [];

routesToExicute = [];

String.prototype.interpolate = function(params) {
    const names = Object.keys(params);
    const vals = Object.values(params);
    return new Function(...names, `return \`${this}\`;`)(...vals);
}

function setRoutes(folder) {
    
    const routeFiles = fs.readdirSync(folder).filter(file => file.endsWith('.js'));

    for (const file of routeFiles) {
        routes.push(path.join(folder, file));
    }

    return routes;
}

function getRoutes() {
    return routes;
}


function parseRoutes(routes) {
    let route = {};
    for (const file of routes) {
        route = require(file);
        /*if (route.name === "") {
            console.error();
            throw new Error("Route name is empty. File: " + file);
            return;
        }*/
        routesToExicute.forEach(element => {
            if (element.name === route.name) {
                throw new Error("Route name is already in use");
            }
        });
        routesToExicute.push(route);
    }
}

function serveRoutes(routes) {

    parseRoutes(routes);

    routesToExicute.forEach(element => {
        if (element.name.startsWith('/')) {
            app.get(element.name, (req, res) => {
                res.send(element.exicute());
            });
        } else {
            app.get('/' + element.name, (req, res) => {
                res.send(element.exicute());
            });
        }
    });
}

function serveStaticFolder(folder) {
    app.use(express.static(folder));
}

function startServer(port) {
    server.listen(port, () => {
        console.log('Server running on port ' + port);
    });
}

function importHTML(file) {

    let html = fs.readFileSync(file, 'utf8').toString();
    if (html.startsWith(`'`)) {
        html = html.slice(1, -1);
    } else if (html.startsWith(`"`)) {
        html = html.slice(1, -1);
    }
    return html;
}


module.exports = {
    setRoutes: setRoutes,
    getRoutes: getRoutes,
    parseRoutes: parseRoutes,
    serveRoutes: serveRoutes,
    serveStaticFolder: serveStaticFolder,
    startServer: startServer,
    importHTML: importHTML
};