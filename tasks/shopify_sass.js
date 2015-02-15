/*
 * grunt-shopify-sass
 * https://github.com/graygilmore/grunt-shopify-sass
 *
 * Copyright (c) 2014 Gray Gilmore
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    var path = require("path");

    grunt.registerMultiTask('shopify_sass', 'Concatenate your Sass files defined by the @import order.', function() {

        var rex = /@import\s*(("([^"]+)")|('([^']+)'))\s*;/g;
        var match;

        // Iterate over each src/dest pairing
        this.files.forEach( function(files) {

            var fileContents = [];

            // Iterate over each src file
            files.src.forEach( function(filepath, i) {
                fileContents[i] = grunt.file.read(filepath);
                var imports = {};

                var dir = path.dirname(filepath);
                /* Find all of our @imports */
                while( match = rex.exec(fileContents[i]) ) {
                    // [3] double quotes, @import "_import-file.scss";
                    // [5] single quotes, @import '_import-file.scss';
                    var importFileRaw = (match[3] || match[5]);
                    var importFileParts = importFileRaw.split('/');
                    var importDir = path.join(dir, importFileParts.slice(0,-1).join('/'));
                    var importFile = importFileParts.slice(-1).join();
                    var importFileForms = [
                      path.join(importDir, importFile),
                      path.join(importDir, importFile+".scss"),
                      path.join(importDir, "_"+importFile+".scss"),
                      path.join(importDir, importFile+".scss.liquid"),
                      path.join(importDir, "_"+importFile+".scss.liquid"),
                    ]
                    for (var j = 0, len = importFileForms.length; j < len; j++) {
                      if (grunt.file.exists(importFileForms[j])) {
                        imports[match[0]] = importFileForms[j];
                        continue;
                      }
                    }
                    // Skip the file if it doesn't exist
                    if (!imports[match[0]]) {
                      grunt.log.warn('File to import: "' + importFileRaw + '" not found.');
                    }
                }

                for( var imp in imports ) {
                    // Replace the @import text with the actual contents of the file
                    fileContents[i] = fileContents[i].replace(imp, grunt.file.read(imports[imp]));
                }
            });

            // Write our new file
            grunt.file.write(files.dest, fileContents.join("\n"));

            // Print a success message.
            grunt.log.writeln('File "' + files.dest + '" created.');

        });

    });

};
