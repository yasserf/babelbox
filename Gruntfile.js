module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON( 'package.json' ),
        release: {
            options: {
                github: {
                    repo: 'hoxton-one/babelbox',
                    usernameVar: 'GITHUB_USERNAME',
                    passwordVar: 'GITHUB_PASSWORD'
                }
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.version %> (c)<%= grunt.template.today("yyyy") %> @licence <%= pkg.license %>*/\n'
            },
            dist: {
                files: {
                    'dist/babelbox.min.js': [ 'src/babelbox.js' ]
                }
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                singleRun: true
            }
        },
        copy: {
            main: {
                expand: true,
                flatten: true,
                src: 'src/*',
                dest: 'dist/'
            }
        }
    });

    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks( 'grunt-release' );
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask( 'default', [ 'karma:unit', 'copy', 'uglify:dist' ] );
};