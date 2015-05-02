'use strict';

angular.module('hevicado.config', [
    'hevicado.config.lang',
    'hevicado.config.http',
    'ui.router',
    'pascalprecht.translate'
]);

/**
 * Application version
 */
angular.module('hevicado.config').
    value('version', '1.2.1');

/**
 * Generic configuration
 */
angular.module('hevicado.config')
    .config(['$logProvider',
        function ($logProvider) {
            //TODO should be auto-detected based on environment or URL settings
            $logProvider.debugEnabled(false);
        }
    ]);

/**
 * Service responsible for discovering HTTP back-end configuration
 * @param $location location manager
 */
angular.module('hevicado.config.http', []).
    service('HTTP_CONFIG',
    ['$location',
        function ($location) {

            var backendUrl = $location.port() === 8444 ? 'http://' + $location.host() + ':8000' : '/be';

            return {
                server: backendUrl
            };
        }
    ]);

/**
 * Language settings
 */
angular.module('hevicado.config.lang', []).
    config(['$translateProvider',
        function ($translateProvider) {
            $translateProvider.useStaticFilesLoader({
                prefix: 'lang/',
                suffix: '.json'
            });
            $translateProvider.preferredLanguage('pl');
            $translateProvider.useCookieStorage(); //store lang in cookies
            moment.locale('pl');
        }
    ]);