package com.kunishu.chronos.logic

import com.kunishu.model.calendar._
import VisitConverter._
import com.kunishu.chronos.io.CalendarRepo
import com.kunishu.core.processing.{Success, ResultChain, Result}
import Result._
import ResultChain._
import com.kunishu.model.messages.{VisitEmail, EmailGateway}
import com.kunishu.model.user.{AnyUser, Doctor}
import com.kunishu.model.user.UserValidator._
import org.joda.time.DateTime
import VisitValidator.{isParticipant, canBeChanged}

/**
 * Logic related with doctor's visits
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait DoctorVisits extends Visits {

  protected val calendarRepo: CalendarRepo
  protected val eMailGateway: EmailGateway

  /**
   * Get visits assigned to doctor
   * @param ownerId doctor's ID
   * @param start start of time window
   * @param end end of time window
   * @param user user accessing data
   * @return non-nullable result
   */
  def getDoctorVisits(ownerId: String, start: DateTime, end: DateTime, user: AnyUser): Result[Seq[Visit]] = segment("getDoctorVisits") {
    chainOf[Seq[Visit]].
      then(
        () =>
          Success(
            calendarRepo.
              getDoctorVisits(ownerId, start, end).
              map(v => toParticipantVisit(v, user)).
              filter(v => v.isDefined).
              map(v => v.get)
          )
      )
  }

  /**
   * Create doctor's visit
   * @param visit visit to be created
   * @param user user accessing data
   * @return non-nullable result with promise of ID of newly created visit
   */
  def createDoctorVisit(visit: Visit, user: Doctor): Result[String] = segment("createDoctorVisit") {
    chainOf[String].
      check(isOwner(visit, user)).
      check(VisitValidator.isValid(visit, user)).
      then(
        () => {
          val result = toResult(calendarRepo.create(visit), "Visit wasn't created in repository")
          if (result.isSuccess()) {
            eMailGateway.send(new VisitEmail(visit))
          }
          result
        }
      )
  }

  /**
   * Update doctor visit
   * @param visit visit to be updated
   * @param user user accessing data
   * @return non-nullable result
   */
  def updateDoctorVisit(visit: Visit, user: Doctor): Result[Boolean] = segment("updateDoctorVisit") {
    val repoVisit = calendarRepo.get(visit.id.get)
    chainOf[Boolean].
      check(() => isPresent(repoVisit, "Visit not found: " + visit.id.get)).
      check(isParticipant(repoVisit.orNull, user)).
      check(canBeChanged(repoVisit.orNull)).
      check(VisitValidator.isValid(visit, user)).
      then(
        () => {
          val result = toResult(calendarRepo.update(visit), "Visit wasn't updated in repository - id: " + visit.id.get)
          if (result.isSuccess()) {
            eMailGateway.send(new VisitEmail(visit))
          }
          result
        }
      )
  }

}
