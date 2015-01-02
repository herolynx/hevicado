'use strict';

/**
 * Convert value into local date (according to browser settings)
 * @param value value to be converted
 * @returns {Date} non-nullable date
 */
var toLocalDate = function (value) {
    var date = typeof value != 'string' ? value.toString('yyyy-MM-dd HH:mm:ss') : value;
    var localTime = moment.utc(date).toDate();
    localTime = moment(localTime).format('YYYY-MM-DD HH:mm:ss');
    return new Date(moment(localTime).format('YYYY-MM-DD HH:mm:ss'));
};

/**
 * Convert value into UTC date
 * @param value value to be converted
 * @returns {Date} non-nullable date
 */
var toUTCDate = function (value) {
    var date = typeof value == 'string' ? Date.parse(value) : value;
    return Date.parse(moment.utc(date).format('YYYY-MM-DD HH:mm:ss'));
};