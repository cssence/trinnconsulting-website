module.exports = function (grunt) {
	"use strict";

	// project configuration
	grunt.file.defaultEncoding = "utf8";

	// project data
	var data = require("./data.js")();

	// project initialization
	grunt.config.init({

		data: data,

		// clean staging directory
		clean: {
			temp: ["build"],
			live: ["public"]
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
				cwd: "static/css/",
				src: "*.css",
				dest: "build/"
			}
		},

		// js minify
		uglify: {
			scripts: {
				options: { screwIE8: true },
				files: {
					"build/main.js": ["static/js/mailto.js"]
				}
			}
		},

		// file copy
		copy: {
			styles: {
				files: {
					"public/css/main.css": ["build/style.css"]
				}
			},
			images: {
				files: [
					{
						expand: true,
						flatten: true,
						src: ["data/img/*", "static/img/*"],
						dest: "public/img/"
					},
					{
						expand: true,
						flatten: true,
						src: ["static/favicon.ico"],
						dest: "public/"
					}
				]
			},
			settings: {
				files: {
					"public/robots.txt": ["static/robots.txt"],
					"public/CNAME": ["CNAME"]
				}
			},
		},

		// jade compile
		jade: {
			compile: {
				options: {
					data: function (dest, src) {
						var data = grunt.config("data");
						var path = data.toPath("public", dest);
						grunt.log.writeln("Rendering \"%s\": %s", path, dest);
						return data.get(path);
					}
				},
				files: data.map("views", "public")
			}
		}

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
		"Prepares assets (minification)",
		["clean:temp", "postcss", "uglify"]
	);
	grunt.registerTask(
		"release",
		"Generate static site",
		["clean:live", "copy", "jade"]
	);
	grunt.registerTask("default", ["build", "release"]);
};
