package com.kunishu.core.date

import org.joda.time.{Interval, Period, DateTime}
import org.joda.time.format.{ISODateTimeFormat, DateTimeFormat}

/**
 * Date support
 *
 * @author Michal Wronski
 * @since 1.0
 */
object Date {

  val dateTimePattern = "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.*$"

  val dateFormatter = ISODateTimeFormat.dateTime()

  val prettyDateFormatter = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss")

  /**
   * Parse string date representation
   * @param date date to be parsed
   * @return non-nullable instance
   */
  def toDate(date: String) = dateFormatter.parseDateTime(date)

  /**
   * Get name of day of the week
   * @param date any date and time
   * @return non-nullable string
   */
  def dayOfWeek(date: DateTime) = date.toString("EEEE")

  /**
   * Get days from given time period
   * @param start start day
   * @param end end day
   * @param period
   * @return non-nullable iterator
   */
  def intervals(start: DateTime, end: DateTime, period: Period): Iterator[Interval] = Iterator.
    iterate(new Interval(start, start.plus(period)))(interval => new Interval(interval.getStart.plus(period), interval.getEnd.plus(period))).
    takeWhile(interval => interval.getEnd.compareTo(end) <= 0)

}
