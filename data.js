module.exports = function (pkg) {
	"use strict";
	var path = require("path");
	var cson = require("cson");
	var jade = require("jade");
	var cache = {};
	var fetch = function (id) {
		if (!cache[id] || verbose) {
			cache[id] = cson.load(path.join(__dirname, "data", id + ".cson"));
		}
		return cache[id];
	};
	var verbose = false;
	if (pkg) {
		verbose = !!pkg.config && pkg.config.verbose;
	} else {
		["partner", "team"].forEach(function (id) {
			fetch(id);
		});
	}
	var sitemap = fetch("sitemap");
	Object.keys(sitemap).forEach(function (id) {
		var file = (id + (id.slice(-1) === "/" ? "index.html" : ".html")).slice(1);
		sitemap[id] = {template: sitemap[id], file: file};
	});
	return {
		get: function (id) {
			var data = {
				verbose: verbose,
				path: id,
				file: sitemap[id].file,
				template: sitemap[id].template
			};
			if (!data.template) {
				return {error: 404, path: data.path};
			}
			var required = {
				"index.jade": ["partner"]
			};
			if (required[data.template]) {
				required[data.template].forEach(function (attach) {
					data[attach] = fetch(attach);
					if (!data[attach]) {
						return {error: 500, file: attach + ".cson"};
					}
				});
			}
			return data;
		},
		/*toFile: function (path) {
			return sitemap[path].file;
		},*/
		toPath: function (dest, file) {
			return Object.keys(sitemap).filter(function (id) { return [dest, sitemap[id].file].join("/") === file; })[0];
		},
		/*toTemplate: function (path) {
			return sitemap[path].template;
		},*/
		list: function () {
			return Object.keys(sitemap);
		},
		map: function (src, dest) {
			var map = {};
			Object.keys(sitemap).forEach(function (id) {
				map[[dest, sitemap[id].file].join("/")] = [src, sitemap[id].template].join("/");
			});
			return map;
		}
	};
};
