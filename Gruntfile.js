module.exports = function(grunt) {

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
        // (call 'grunt watch')
        watch: {
            files: ['src/*'],
            tasks: ['default']
        }

    });

    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.registerTask("build", ["concat", "uglify", "cssmin"]);
    grunt.registerTask("default", ["jshint", "build"]);
    grunt.registerTask("travis", ["default"]);

};