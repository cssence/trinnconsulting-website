/*jshint node: true */
"use strict";
var path = require("path");

// Configuration
var pkg = require("./package.json");
pkg.config = pkg.config || {};
pkg.config.port = process.env.PORT || pkg.config.port || 8080;
pkg.config.verbose = "false" === process.env.VERBOSE ? false : (pkg.config.verbose || true);
pkg.config.dir = {
	data: path.join(__dirname, "data"),
	static: path.join(__dirname, "static"),
	build: path.join(__dirname, "build"),
	views: path.join(__dirname, "views")
};

// Initialization
var app = require("express")();
var serve = require("serve-static");
app.set("port", pkg.config.port);
app.use(serve(pkg.config.verbose ? pkg.config.dir.static : pkg.config.dir.build, {index: false}));
app.use(serve(pkg.config.dir.data, {index: false}));
app.locals.basedir = pkg.config.dir.views;
app.set("views", pkg.config.dir.views);
app.set("view engine", "jade");

// Routes
var routes = require(path.join(__dirname, "routes.js"))(pkg);
app.all("*", routes.log);
app.get("*", routes.render);
app.use(routes.error);

// Http server
require("http").createServer(app).listen(pkg.config.port, function () {
	console.info("Express server listening on port", pkg.config.port, pkg.config.verbose ? "--verbose" : "");
});
