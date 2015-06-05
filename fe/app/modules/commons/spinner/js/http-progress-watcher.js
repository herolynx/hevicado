'use strict';

/**
 * Service observing http communication that's in-progress
 */
angular.module('commons.spinner').
    service('HttpProgressWatcher',
    ['$q', 'SpinnerCounter',
        function ($q, SpinnerCounter) {

            return {
                'request': function (config) {
                    SpinnerCounter.increment();
                    return config;
                },

                'requestError': function (rejection) {
                    SpinnerCounter.decrement();
                    return $q.reject(rejection);
                },

                'response': function (response) {
                    SpinnerCounter.decrement();
                    return response;
                },


                'responseError': function (rejection) {
                    SpinnerCounter.decrement();
                    return $q.reject(rejection);
                }
            };

        }
    ]);