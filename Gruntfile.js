module.exports = function (grunt) {

    grunt.initConfig({

        // Import package manifest
        pkg: grunt.file.readJSON("package.json"),

        // Banner definitions
        meta: {
            banner: "/**!\n" +
            " *  <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n" +
            " *  <%= pkg.description %>\n" +
            " *  <%= pkg.homepage %>\n" +
            " *\n" +
            " *  Made by <%= pkg.author.name %>\n" +
            " *  Under <%= pkg.license %> License\n" +
            " */\n"
        },

        // Concat definitions
        concat: {
            options: {
                banner: "<%= meta.banner %>"
            },
            js: {
                src: ["src/js/autocomplete-choice-input.js"],
                dest: "dist/js/autocomplete-choice-input.js"
            },
            css: {
                src: ["src/css/autocomplete-choice-input.css"],
                dest: "dist/css/autocomplete-choice-input.css"
            }
        },

        // Lint definitions
        jshint: {
            files: ["src/js/autocomplete-choice-input.js"],
            options: {
                jshintrc: ".jshintrc"
            }
        },

        // Minify definitions
        uglify: {
            target: {
                src: ["dist/js/autocomplete-choice-input.js"],
                dest: "dist/js/autocomplete-choice-input.min.js"
            },
            options: {
                banner: "<%= meta.banner %>"
            }
        },

        // Minify css
        cssmin: {
            target: {
                src: ["dist/css/autocomplete-choice-input.css"],
                dest: "dist/css/autocomplete-choice-input.min.css"
            },
            options: {
                banner: "<%= meta.banner %>"
            }
        },

        // watch for changes to source
        // Better than calling grunt a million times
        // (call "grunt watch")
        watch: {
            src: {
                files: ["src/js/*", "src/css/*"],
                tasks: ["default"]
            },
            tests: {
                files: ["tests/*"],
                tasks: ["test"]
            }
        },


        jasmine: {
            src: "dist/**/*.js",
            options: {
                specs: "tests/tests.js",
                vendor: [
                    "node_modules/jquery/dist/jquery.min.js",
                    "node_modules/jquery-simulate-ext/libs/bililiteRange.js",
                    "node_modules/jquery-simulate-ext/libs/jquery.simulate.js",
                    "node_modules/jquery-simulate-ext/src/jquery.simulate.ext.js",
                    "node_modules/jquery-simulate-ext/src/jquery.simulate.drag-n-drop.js",
                    "node_modules/jquery-simulate-ext/src/jquery.simulate.key-sequence.js",
                    "node_modules/jquery-simulate-ext/src/jquery.simulate.key-combo.js",
                    "node_modules/randstr/randstr.js"
                ]
            }
        }

    });

    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-jasmine");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.registerTask("build", ["concat", "uglify", "cssmin"]);
    grunt.registerTask("default", ["jshint", "build", "test"]);
    grunt.registerTask("test", ["jasmine"]);
    grunt.registerTask("travis", ["default"]);

};