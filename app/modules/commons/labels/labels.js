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

            /**
             * Get all sub-labels (key-value)
             * @param labelName name of the main label which sub-labels should be taken
             * @param keyPrefix sub-labels key prefix
             * @returns {*} non-nullable promise
             */
            var get = function (labelName, keyPrefix, count) {
                var promises = [];
                for (var i = 1; i <= count; i++) {
                    var key = keyPrefix + '-' + i;
                    promises.push(translateLabel(labelName, key));
                }
                return $q.all(promises);
            };

            return {

                /**
                 * Get all specializations (key-value)
                 * @returns {*} non-nullable promise
                 */
                getSpecializations: function () {
                    return get('specializations', '$$spec', SPECIALIZATIONS_COUNT);
                }
            };

        }
    ]
);