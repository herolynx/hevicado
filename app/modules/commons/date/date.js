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

/**
 * Convert hour into date
 * @param string hour in format HH:mm
 * @param tzOffset time zone offset
 * @returns {*} new date
 */
var hourToDate = function (string, tzOffset) {
    var time = string.split(':');
    var offset = -(tzOffset + new Date().getTimezoneOffset());
    return Date.today().set({
        hour: Number(time[0]),
        minute: Number(time[1]),
        second: 0
    }).add(offset).minutes();
};