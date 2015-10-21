package com.kunishu.chronos.logic

import com.kunishu.core.monit.Instrumented
import com.kunishu.model.calendar.{Visit}
import com.kunishu.model.calendar.VisitValidator._
import com.kunishu.chronos.io.{UserGateway, CalendarRepo}
import com.kunishu.core.processing.{Result}
import Result._
import com.kunishu.model.user._
import org.joda.time.DateTime
import scala.concurrent.{ExecutionContext, Future}
import ExecutionContext.Implicits.global
import scala.concurrent.Future

/**
 * Common functions related with visits
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait Visits extends Instrumented {

  protected val calendarRepo: CalendarRepo
  protected val userGateway: UserGateway

  /**
   * Get visit
   * @param id ID of a visit
   * @param user user accessing data
   * @return non-nullable result
   */
  def getVisit(id: String, user: AnyUser): Result[Visit] = segment("getVisit") {
    val visit = calendarRepo.get(id).
      filter(v => userParticipates(v, user))
    asResult(visit, "Visit not found: " + id)
  }

  /**
   * Update info about user in visits
   * @param changedUser info about changed user
   * @return future result of update
   */
  def changeUserInVisits(changedUser: AnyUser): Future[Boolean] = futureSegment("changeUserInVisits") {
    userGateway.
      getUser(changedUser.id.get, changedUser).
      map(_.get).
      filter(_.isDefined).
      map(_.get).
      map(
        _ match {

          case user: User => {
            calendarRepo.updatePatientInfo(user.info(), new DateTime())
            true
          }

          case doctor: Doctor => {
            val now = new DateTime()
            val doctorInfo = new User(doctor.attributes).info()
            calendarRepo.updatePatientInfo(doctorInfo, now)
            calendarRepo.updateDoctorInfo(doctorInfo, now)
            doctor.locations.map(
              loc => {
                calendarRepo.updateLocationInfo(
                  doctor.id.get,
                  loc.withoutTemplates,
                  now
                )
              }
            )
            true
          }

        }
      )
  }


}
