module.exports = function (pkg) {
	"use strict";
	var path = require("path");
	var data = require(path.join(__dirname, "data.js"))(pkg);
	return {
		log: function (req, res, next) {
			console.log(req.method, req.path);
			next();
		},
		render: function (req, res) {
			var result = data.get(req.path);
			if (result.error) {
				res.status(result.error).send(JSON.stringify(result));
			} else {
				res.render(result.template, result);
			}
		},
		error: function (req, res) {
			res.status(404).send(JSON.stringify({
				status: 404,
				path: req.path
			}));
		}
	};
};
