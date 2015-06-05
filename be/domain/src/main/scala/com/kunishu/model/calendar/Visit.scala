package com.kunishu.model.calendar

import com.kunishu.model.user.{Location, User, Doctor}
import com.kunishu.model.{Entity, Owner}
import org.joda.time.{Interval, Duration, DateTime}

/**
 * Published attributes of visit
 */
object VisitAttrs {

  val attStart = "start"
  val attEnd = "end"
  val attDoctor = "doctor"
  val attPatient = "patient"
  val attCancelled = "cancelled"
  val attLocation = "location"

}


/**
 * Possible states of visit
 */
object VisitState extends Enumeration {
  type VisitState = Value
  val OPEN, CLOSED, CANCELLED = Value
}

/**
 * Single visit at chosen doctor
 *
 * @author Michal Wronski
 * @since 1.0
 */
sealed case class Visit(map: Map[String, Any]) extends Entity with Owner {

  import VisitAttrs._
  import VisitState._

  /**
   * Visit start date
   * @return non-nullable date
   */
  def start: DateTime = map.get(attStart).get.asInstanceOf[DateTime]

  /**
   * Visit end date
   * @return non-nullable date
   */
  def end: DateTime = map.get(attEnd).get.asInstanceOf[DateTime]

  /**
   * Get cancellation date
   * @return non-nullable option
   */
  def cancelled: Option[DateTime] = map.get(attCancelled).map(date => date.asInstanceOf[DateTime])

  /**
   * Get state of visit
   * @return non-nullable state
   */
  def state: VisitState = {
    if (cancelled.isDefined) return CANCELLED
    if (new DateTime().isAfter(start)) return CLOSED
    return OPEN
  }

  /**
   * Get doctor who owns visit
   * @return non-nullable instance
   */
  def doctor: Doctor = new Doctor(map.get(attDoctor).get.asInstanceOf[Map[String, Any]])

  /**
   * Get patient who wants to visit doctor
   * @return non-nullable option
   */
  def patient: Option[User] = map.get(attPatient).map(v => new User(v.asInstanceOf[Map[String, Any]]))

  /**
   * Get location of visit
   * @return non-nullable instance
   */
  def location: Location = map.get(attLocation).map(v => new Location(v.asInstanceOf[Map[String, Any]])).get

  override def ownerId: String = doctor.id.get

}
