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

        exclude: [

        ],

        autoWatch: true,
        frameworks: ['jasmine'],
        browsers: ['PhantomJS'],

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
        }

    });
};
