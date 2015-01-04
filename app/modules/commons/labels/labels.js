'use strict';

var commonsLabels = angular.module('commons.labels', []);

/**
 * Service manages labels for generic dynamic data
 * @param $translate service for translating labels
 * @param $q promise
 */
commonsLabels.service('Labels',
    ['$translate', '$q',
        function ($translate, $q) {

            var SPECIALIZATIONS_COUNT = 77;

            /**
             * Translate label
             * @param prefix label area
             * @param key label to be translated
             * @returns {*} promise with key-value response
             */
            var translateLabel = function (prefix, key) {
                return $translate(prefix + '.' + key).
                    then(function (translation) {
                        return {
                            key: key,
                            value: translation
                        };
                    });
            };

            return {

                /**
                 * Get all specializations (key-value)
                 * @returns {*} non-nullable promise
                 */
                getSpecializations: function () {
                    var allSpec = [];
                    var promises = [];
                    for (var i = 1; i <= SPECIALIZATIONS_COUNT; i++) {
                        var key = 'spec-' + i;
                        promises.push(translateLabel('specializations', key));
                    }
                    return $q.all(promises);
                }
            };

        }
    ]
);