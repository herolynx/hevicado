module.exports = function (config) {
    config.set({

        basePath: '../',

        files: [
            /* dependencies */
            'app/bower_components/jquery/dist/jquery.js',
            'app/bower_components/jquery-ui/jquery-ui.js',
            'app/bower_components/toastr/toastr.js',
            'app/bower_components/datejs/build/date.js',
            'app/bower_components/momentjs/min/moment-with-locales.js',
            'app/bower_components/moment-timezone/builds/moment-timezone-with-data.js',
            'app/bower_components/underscore/underscore-min.js',

            'app/bower_components/angular/angular.js',
            'app/bower_components/angular-cookies/angular-cookies.js',
            'app/bower_components/angular-ui-router/release/angular-ui-router.js',
            'app/bower_components/angular-translate/angular-translate.js',
            'app/bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
            'app/bower_components/angular-translate-storage-cookie/angular-translate-storage-cookie.js',
            'app/bower_components/angular-bootstrap/ui-bootstrap.js',
            'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            'app/bower_components/angular-ui-sortable/sortable.js',
            'app/bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js',
            'app/bower_components/ngmap/build/scripts/ng-map.js',
            /* test dependencies */
            'app/bower_components/angular-mocks/angular-mocks.js',
            /* tested components */
            'app/modules/**/*.js',
            /* test cases */
            'test/unit/**/*.js'
        ],

        //exclude files
        exclude: [],

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
