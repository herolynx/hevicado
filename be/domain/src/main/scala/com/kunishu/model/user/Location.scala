package com.kunishu.model.user

import com.kunishu.core.date.Date._
import com.kunishu.model.Entity
import org.joda.time._

object LocationAttrs {

  val attrName = "name"
  val attrWorkingHours = "working_hours"
  val attrTemplates = "templates"

}

/**
 * Location of doctor's cabinet
 * @param map
 */
sealed case class Location(map: Map[String, Any]) extends Entity {

  import LocationAttrs._

  lazy val name: String = map.get(attrName).map(v => v.toString).get

  lazy val workingHours: Seq[WorkingHours] =
    map.get(attrWorkingHours).
      map(days => days.asInstanceOf[List[Map[String, Any]]]).
      map(days => for (day <- days) yield WorkingHours(day)).
      get

  /**
   * Check for what time intervals given time period is overlapping doctor's working hours
   * in given location
   * @param start start time
   * @param end end time
   * @return non-nullable sequence
   */
  def overlap(start: DateTime, end: DateTime): Seq[Option[Interval]] =
    workingHours.
      map(workingDay => workingDay.overlap(start, end))

  /**
   * Get location without templates definition
   * @return new instance
   */
  def withoutTemplates = new Location(attributes.filterKeys(!_.equals(LocationAttrs.attrTemplates)))

}

/**
 * Working hours in which doctor's seeing patients
 * @param map
 */
sealed case class WorkingHours(map: Map[String, Any]) extends Entity {

  /**
   * Day name when doctor's working
   */
  lazy val day: String = map.get("day").map(v => v.toString).get

  /**
   * Working start time (HH:mm)
   */
  lazy val start: Array[String] = map.get("start").map(v => v.toString.split(':')).get

  /**
   * Working end time (HH:mm)
   */
  lazy val end: Array[String] = map.get("end").map(v => v.toString.split(':')).get

  /**
   * Owner's time zone offset in minutes
   */
  lazy val tzOffset: Int = map.get("tzOffset").map(v => v.toString.toFloat.toInt).getOrElse(0)

  /**
   * Convert day into day time working hours
   * @param dayTime day definition
   * @param time time definition (hours and minutes)
   * @return non-nullable option
   */
  private def toTime(dayTime: DateTime, time: Array[String]): Option[DateTime] = {
    if (day == dayOfWeek(dayTime)) {
      Some(
        new DateTime(dayTime).
          withHourOfDay(time(0).toInt).
          withMinuteOfHour(time(1).toInt).
          withZoneRetainFields(DateTimeZone.forOffsetHoursMinutes(tzOffset / 60, tzOffset % 60))
      )
    } else {
      None
    }
  }

  /**
   * Get date and time when doctor's start working during chosen day
   * @param dayTime day when start work time should be checked
   * @return non-nullable option
   */
  def startDayTime(dayTime: DateTime): Option[DateTime] = toTime(dayTime, start)

  /**
   * Get date and time when doctor's end working during chosen day
   * @param dayTime day when end work time should be checked
   * @return non-nullable option
   */
  def endDayTime(dayTime: DateTime): Option[DateTime] = toTime(dayTime, end)

  /**
   * Get working interval
   * @param dayTime day when end work time should be checked
   * @return some interval if doctor is working in given day, none otherwise
   */
  def interval(dayTime: DateTime): Option[Interval] = {
    val workStart = startDayTime(dayTime)
    val workEnd = endDayTime(dayTime)
    if (!workStart.isDefined || !workEnd.isDefined) {
      return None
    }
    Some(new Interval(workStart.get, workEnd.get))
  }

  /**
   * Get working interval
   * @param timePeriod internal for which working hour should be selected
   * @return some interval if doctor is working in given day, none otherwise
   */
  def interval(timePeriod: Interval): Option[Interval] = {
    val overlapping = (for (
      subInterval <- intervals(timePeriod.getStart, timePeriod.getEnd, Hours.FOUR.toPeriod);
      overlap <- interval(subInterval.getStart)
    ) yield overlap).toList
    if (overlapping.nonEmpty)
      Some(overlapping(0))
    else
      None
  }

  /**
   * Check for what interval given time period is overlapping working hour
   * @param start start time
   * @param end end time
   * @return some interval if doctor is working in given time, none otherwise
   */
  def overlap(start: DateTime, end: DateTime): Option[Interval] =
    interval(start).
      map(working => working.overlap(new Interval(start, end))).
      flatMap(interval => if (interval != null) Some(interval) else None)

}
