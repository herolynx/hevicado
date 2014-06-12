module.exports = function (config) {
    config.set({

        basePath: '../',

        files: [
            /* dependencies */
            'bower_components/angular/angular.js',
            'bower_components/angular-cookies/angular-cookies.js',
            'bower_components/angular-route/angular-route.js',
            'bower_components/angular-ui-router/release/angular-ui-router.js',
            /* test dependencies */
            'bower_components/angular-mocks/angular-mocks.js',
            /* tested components */
            'app/js/*.js',
            'app/common/**/*.js',
            'app/modules/**/*.js',
            /* test cases */
            'test/unit/**/*.js'
        ],

        //exclude files
        exclude: [ ],

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        frameworks: ['jasmine'],

        // start tests on listed web browsers
        // available: PhantomJS, Chrome, Firefox, Safari (on Macs), IE (on Windows)
        browsers: ['PhantomJS'],

        // web server port
        port: 8444,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_DEBUG,

        plugins: [
            'karma-junit-reporter',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-phantomjs-launcher'
        ],

        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        },

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: true

    });
};
