package com.kunishu.model.calendar

import com.kunishu.core.processing._
import com.kunishu.model.user.{AnyUser}
import org.joda.time.{DateTime}
import com.kunishu.model.user.UserValidator.isOwner

object VisitValidator extends VisitValidator

/**
 * Visit validators
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait VisitValidator {

  /**
   * Check whether visit is valid
   * @param visit visit to be checked
   * @param user user who wants to create visit
   * @tparam T type of result
   * @return non-nullable result
   */
  def isValid[T](visit: Visit, user: AnyUser)(): Result[T] = {
    val result = scala.collection.mutable.ListBuffer[String]()
    if (!isOwner(visit, user).isSuccess() && visit.start.isBefore(new DateTime())) {
      result += "Visit start is in the past"
    }
    if (visit.start.isAfter(visit.end)) {
      result += "Visit start is after its end"
    }
    if (result.isEmpty) {
      Success[T](Nil.asInstanceOf[T])
    }
    else {
      ValidationError[T](result.toString)
    }
  }

  /**
   * Check whether given visit can be changed based on its state
   * @param visit visit to be checked
   * @tparam T type of result
   * @return non-nullable result
   */
  def canBeChanged[T](visit: Visit)(): Result[T] =
    visit.state match {
      case VisitState.OPEN => Success[T](Nil.asInstanceOf[T])
      case _ => Fault("Visit %s cannot be changed because of state %s".format(visit.id.get, visit.state))
    }

  /**
   * Check whether user is a participant of given visit
   * @param visit visit to be checked
   * @param user user accessing data
   * @tparam T type of result
   * @return non-nullable result
   */
  def isParticipant[T](visit: Visit, user: AnyUser)(): Result[T] = {
    userParticipates(visit, user) match {
      case true => Success(Nil.asInstanceOf[T])
      case false => UnauthorizedError("User %s is not a participant of %s".format(user.id.get, visit.id.get))
    }
  }

  /**
   * Check if user participates in given visit
   * @param visit visit to be checked
   * @param user user accessing visit
   * @return true if user is a participant, false otherwise
   */
  def userParticipates(visit: Visit, user: AnyUser) =
    visit.ownerId.equals(user.id.get) || visit.patient.map(p => p.id.equals(user.id)).getOrElse(false)

}
