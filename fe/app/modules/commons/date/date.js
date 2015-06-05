'use strict';

/**
 * Convert value into local date (according to browser settings)
 * @param value value to be converted
 * @returns {Date} non-nullable date
 */
var toLocalDate = function (value) {
    var utcTime = moment.utc(value).toDate();
    return moment(utcTime).toDate();
};

/**
 * Convert value into UTC date
 * @param value value to be converted
 * @returns {Date} non-nullable date
 */
var toUTCDate = function (value) {
    var date = typeof value == 'string' ? Date.parse(value) : value;
    return moment.utc(date).toDate();
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

/**
 * Convert local date to date in chosen TZ
 * @param localDate local date
 * @param offsetFromUTC time zone offset from UTC
 * @returns {*} new date
 */
var toTZDate = function (localDate, offsetFromUTC) {
    var destTZOffset = offsetFromUTC + new Date().getTimezoneOffset();
    return localDate.clone().add(destTZOffset).minutes();
};