'use strict';

/**
 * Directive displays current version of application
 */
angular.module('hevicado.generic').
    directive('appVersion',
    ['version',
        function (version) {
            return function (scope, elm, attrs) {
                elm.text(version);
            };
        }
    ]);

/**
 * Initialize app's current version filter
 */
angular.module('hevicado.generic').
    filter('interpolate',
    ['version',
        function (version) {
            return function (text) {
                return String(text).replace(/\%VERSION\%/mg, version);
            };
        }
    ]);