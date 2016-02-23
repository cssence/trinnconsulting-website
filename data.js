module.exports = function (pkg) {
	"use strict";
	var path = require("path");
	var fs = require("fs");
	var jade = require("jade");
	var cache = {};
	var load = function (file) {
		if (pkg.config.verbose || !cache[file]) {
			var fn = {
				withPath: path.join(__dirname, pkg.config.folders.db, file),
				extension: file.split(".").pop()
			};
			if (fn.extension === "json" || fn.extension === "js") {
				cache[file] = require(fn.withPath);
			} else {
				cache[file] = fs.readFileSync(fn.withPath, "utf8");
			}
		}
		return cache[file];
	};
	var refreshSitemap = function () {
		var file = "sitemap.json";
		var refresh = pkg.config.verbose || !cache[file];
		var map = load(file);
		if (refresh) {
			Object.keys(map).forEach(function (href) {
				map[href] = {
					template: map[href],
					file: (href + (href.slice(-1) === "/" ? "index.html" : ".html")).slice(1)
				};
			});
		}
		return map;
	};
	try {
		if (!fs.statSync(path.join(__dirname, "data")).isDirectory()) {
			throw new Error("Invalid folder /data");
		}
		pkg.config.folders.db = "data";
	} catch (err) {
		console.warn("No valid data directory found, resorting to demo mode.");
	}
	return {
		get: function (href) {
			var data = {
				verbose: pkg.config.verbose,
				path: href,
				link: {
					self: pkg.homepage,
					to: function (uri) {
						return (!data.verbose && data.link.delegate ? data.link.delegate.slice(0, -1) : "") + uri;
					}
				}
			};
			var augment = function (assignment) {
				var key = data;
				var value;
				assignment.node.split(".").slice(0, -1).forEach(function (node) {
					if (!key[node]) {
						key[node] = {};
					}
					key = key[node];
				});
				var file;
				if (assignment.load) {
					file = typeof assignment.load === "function" ? assignment.load(data) : assignment.load;
					value = load(file);
				} else if (assignment.render) {
					file = typeof assignment.render === "function" ? assignment.render(data) : assignment.render;
					value = jade.renderFile(path.join(__dirname, pkg.config.folders.db, file), data);
				} else if (assignment.set) {
					value = typeof assignment.set === "function" ? assignment.set(data) : assignment.set;
				}
				key[assignment.node.split(".").pop()] = value;
			};
			var fetch = load("fetch.js");
			(fetch["*"] || []).forEach(augment);
			if (href === "*") {
				return data;
			}
			var sitemap = refreshSitemap();
			if (!sitemap[href]) {
				data.error = 404;
				href = "/404";
				if (!sitemap[href]) {
					return {error: 404, path: data.path};
				}
			}
			data.file = sitemap[href].file;
			data.template = sitemap[href].template;
			if (!data.template) {
				return {error: 500, path: data.path};
			}
			(fetch[data.template] || []).forEach(augment);
			return data;
		},
		/*toFile: function (href) {
			return refreshSitemap()[href].file;
		},*/
		toPath: function (dest, file) {
			var sitemap = refreshSitemap();
			return Object.keys(sitemap).filter(function (href) { return [dest, sitemap[href].file].join("/") === file; })[0];
		},
		/*toTemplate: function (href) {
			return refreshSitemap()[href].template;
		},*/
		list: function () {
			return Object.keys(refreshSitemap());
		},
		map: function (src, dest) {
			var sitemap = refreshSitemap();
			var map = {};
			Object.keys(sitemap).forEach(function (href) {
				map[[dest, sitemap[href].file].join("/")] = [src, sitemap[href].template].join("/");
			});
			return map;
		}
	};
};
