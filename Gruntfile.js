module.exports = function (grunt) {
	"use strict";

	// project configuration
	grunt.file.defaultEncoding = "utf8";

	// project data
	var pkg = require("./package.json");
	var data = require("./data.js")(pkg);

	// project initialization
	grunt.config.init({

		dir: pkg.config.folders,

		data: data,

		// clean staging directory
		clean: {
			temp: ["<%= dir.temp %>"],
			live: ["<%= dir.rendered %>"],
			delegate: {
				expand: true,
				cwd: "<%= dir.rendered %>/",
				src: ["css", "js", "img", "browserconfig.xml", "manifest.json"]
			}
		},

		// css autoprefix and minify
		postcss: {
			options: {
				processors: [
					require("autoprefixer")(),
					require("cssnano")()
				]
			},
			styles: {
				expand: true,
				cwd: "<%= dir.assets %>/",
				src: "css/*.css",
				dest: "<%= dir.temp %>/"
			}
		},

		// js minify
		uglify: {
			scripts: {
				options: { screwIE8: true },
				files: {
					"<%= dir.temp %>/js/main.js": ["<%= dir.assets %>/js/mailto.js"]
				}
			}
		},

		// file copy
		copy: {
			assets: {
				expand: true,
				cwd: "<%= dir.assets %>",
				src: "**",
				dest: "<%= dir.rendered %>/"
			},
			build: {
				expand: true,
				cwd: "<%= dir.temp %>",
				src: "**",
				dest: "<%= dir.rendered %>/"
			},
			data: {
				expand: true,
				cwd: "<%= dir.db %>",
				src: ["**", "!*.jade", "!*.css", "!*.json",  "!*.js"],
				dest: "<%= dir.rendered %>/"
			}
		},

		// jade compile
		jade: {
			compile: {
				options: {
					data: function (dest, src) {
						var data = grunt.config("data");
						var path = data.toPath(pkg.config.folders.rendered, dest);
						grunt.log.writeln("Rendering \"%s\": %s", path, dest);
						return data.get(path);
					}
				},
				files: data.map(pkg.config.folders.views, pkg.config.folders.rendered)
			}
		},

		// file create
		create: {
			cname: {
				file: "<%= dir.rendered %>/CNAME",
				content: data.get("*").link.text
			}
		}

	});

	grunt.registerMultiTask("create", "Simple file creation", function () {
		grunt.file.write(this.data.file, this.data.content);
		grunt.log.writeln("File \"" + this.data.file + "\" created.");
	});

	// required external tasks
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-postcss");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-jade");

	// task definition
	grunt.registerTask(
		"build",
		"Prepare assets (minification)",
		["clean:temp", "postcss", "uglify"]
	);
	grunt.registerTask(
		"release",
		"Generate static site",
		["clean:live", "copy:assets", "copy:build", "copy:data", "jade", "build", "create:cname"]
	);
	grunt.registerTask("default", ["build", "release"]);
};
