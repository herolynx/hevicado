module.exports = function (config) {
    config.set({

        basePath: '../',

        files: [
            /* dependencies */
            'app/bower_components/angular/angular.js',
            'app/bower_components/angular-cookies/angular-cookies.js',
            'app/bower_components/angular-route/angular-route.js',
            'app/bower_components/angular-ui-router/release/angular-ui-router.js',
            'app/bower_components/angular-translate/angular-translate.js',
            'app/bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
            'app/bower_components/angular-translate-storage-cookie/angular-translate-storage-cookie.js',
            'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            'app/bower_components/angular-ui-sortable/sortable.js',
            'app/bower_components/angular-ui-dashboard/dist/angular-ui-dashboard.js',
            'modules/ui/js/ui-notifications.js',
            /* test dependencies */
            'app/bower_components/angular-mocks/angular-mocks.js',
            /* tested components */
            'app/js/*.js',
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
        logLevel: config.LOG_INFO,

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
