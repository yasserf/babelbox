var browsers = {
    sl_chrome: {
        base: 'SauceLabs',
        browserName: 'chrome'
    },
    sl_firefox: {
        base: 'SauceLabs',
        browserName: 'firefox'
    },
    sl_ie_11: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        version: '11'
    },
    sl_ie_10: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        version: '10'
    }
};

module.exports = function( config ) {
    config.set( {
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: [ 'jasmine' ],


        // list of files / patterns to load in the browser
        files: [
            'src/*.js',
            'test/**/*Spec.js'
        ],


        // list of files to exclude
        exclude: [],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {},


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: [ 'saucelabs', 'spec' ],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: Object.keys( browsers ),
        customLaunchers: browsers,


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,
    } );
};
