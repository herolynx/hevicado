package com.kunishu.model.user

import com.kunishu.core.date.Date._
import com.kunishu.core.processing._
import com.kunishu.model.{Owner, Entity}
import org.joda.time.{Interval, DateTime}

object UserValidator extends UserValidator

/**
 * Generic functions related with validating users
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait UserValidator {

  /**
   * Check whether user is valid
   * @param user user to be validated
   * @tparam T type of result
   * @return non-nullable result
   */
  def isValid[T](user: AnyUser): Result[T] = {
    val result = scala.collection.mutable.ListBuffer[String]()
    if (user.eMail.isEmpty) {
      result += "E-mail is not given"
    }
    if (result.isEmpty) {
      Success[T](Nil.asInstanceOf[T])
    }
    else {
      ValidationError[T](result.toString)
    }
  }

  /**
   * Check whether given user is an owner
   * @param ownerId owner
   * @param userId user accessing resource
   * @tparam T type of result
   * @return non-nullable result
   */
  def isOwner[T](ownerId: String, userId: String)(): Result[T] = {
    if (!ownerId.equals(userId)) {
      UnauthorizedError[T]("%s is not an owner of %s".format(userId, ownerId))
    } else {
      Success[T](Nil.asInstanceOf[T])
    }
  }

  /**
   * Check whether given user is an owner
   * @param ownerId owner
   * @param user user accessing resource
   * @tparam T type of result
   * @return non-nullable result
   */
  def isOwner[T](ownerId: String, user: AnyUser)(): Result[T] = isOwner(ownerId, user.id.get)()

  /**
   * Check whether given user is an owner
   * @param entity entity to be checked
   * @param user user accessing resource
   * @tparam E type of entity with owner
   * @tparam T type of result
   * @return non-nullable result
   */
  def isOwner[E, T](entity: Entity with Owner, user: AnyUser)(): Result[T] = isOwner(entity.ownerId, user.id.get)()

  /**
   * Check whether doctor is seeing patients at any location during given time window
   * @param doctor doctor whom working hours should be checked
   * @param start start time
   * @param end end time
   * @tparam T type of result
   * @return non-nullable result
   */
  def isWorking[T](doctor: Doctor, start: DateTime, end: DateTime)(): Result[T] = {
    doctor.
      locations.
      flatMap(location => location.overlap(start, end)).
      filter(optionalTime => optionalTime.isDefined).
      map(optionalTime => optionalTime.get).
      filter(time => time.isEqual(new Interval(start, end))).
      isEmpty match {
      case true => Fault[T]("Doctor %s is not working between '%s' and '%s'".format(doctor.eMail, start.toString(dateFormatter), end.toString(dateFormatter)))
      case false => Success[T](Nil.asInstanceOf[T])
    }
  }

}
