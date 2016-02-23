module.exports = {
	"*": [
		{"node": "website", "set": function (data) { return data.link.self; } }
	],
	"display.jade": [
		{"node": "document.title", "set": "TRINN Consulting · We Make Innovation Happen"},
		{"node": "document.description", "set": "Strategy Consulting for Transformation and Innovation."},
		{"node": "document.style", "load": "css/demo.css"},
		{"node": "document.body", "render": "demo.jade"}
		// Order matters, as subsequent entries may refer to already set/loaded ones!
	]
};
