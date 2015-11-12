package com.kunishu.services.chronos

import akka.actor.{Actor, ActorLogging}
import akka.event.LoggingReceive
import com.kunishu.chronos.logic.{DoctorVisits, PatientVisits}
import com.kunishu.chronos.io.{UserGateway, CalendarRepo}
import com.kunishu.core.processing.{Fault, Result}
import com.kunishu.model.calendar.{SearchDoctorCriteria, Visit}
import com.kunishu.model.messages.EmailGateway
import com.kunishu.model.user.{AnyUser, Doctor, User}
import com.kunishu.services.chronos.CalendarService._
import com.kunishu.services.monit.ServiceHealthCheck
import com.kunishu.services.users.UserService.UserModifiedNotification
import org.joda.time.DateTime
import scala.util.{Failure, Success}
import scala.concurrent._
import ExecutionContext.Implicits.global
import com.kunishu.model.user.UserValidator.isOwner

/**
 * Messages for calendar usage
 */
object CalendarService {

  /**
   * Get visit
   * @param id visit ID
   * @param user user accessing data
   */
  case class GetVisit(id: String, user: AnyUser)

  case class GetVisitResponse(visit: Result[Visit])

  /**
   * Get visits from given period of time
   * @param ownerId user who is owner of visits to be found
   * @param start beginning of time period
   * @param end end of time period
   * @param user user accessing data
   * @param asDoctor flag indicates whether visits should be found where owner is a doctor or a patient
   */
  case class GetVisits(ownerId: String, start: DateTime, end: DateTime, user: AnyUser, asDoctor: Boolean = false)

  case class GetVisitsResponse(visits: Result[Seq[Visit]])

  /**
   * Create new visit
   * @param visit visit to be updated
   * @param user user accessing data
   */
  case class CreateVisit(visit: Visit, user: AnyUser)

  case class CreateVisitResponse(visits: Result[String])

  /**
   * Update chosen visit
   * @param visit visit to be updated
   * @param user user accessing data
   */
  case class UpdateVisit(visit: Visit, user: AnyUser)

  case class UpdateVisitResponse(visits: Result[Boolean])

  /**
   * Search doctors
   * @param criteria search criteria
   * @param user user accessing data
   */
  case class SearchDoctors(criteria: SearchDoctorCriteria, user: AnyUser)

  case class SearchDoctorsResponse(doctors: Result[Seq[Doctor]])

}

/**
 * Service managing calendar visits
 *
 * @author Michal Wronski
 * @since 1.0
 * @param calendarVisitsRepo calendar data provider
 * @param userGatewayProvider user data provider
 * @param emailGatewayProvider e-mail service provider
 */
class CalendarService(calendarVisitsRepo: CalendarRepo, userGatewayProvider: UserGateway, emailGatewayProvider: EmailGateway) extends Actor with ActorLogging with ServiceHealthCheck
with PatientVisits with DoctorVisits {

  protected override val calendarRepo = calendarVisitsRepo
  protected override val userGateway: UserGateway = userGatewayProvider
  protected val eMailGateway: EmailGateway = emailGatewayProvider

  override def receive = LoggingReceive {

    healthCheck orElse {

      case GetVisit(id, user) => {
        log.debug("Getting visit - event id: {}, user id: {}", id, user.id)
        sender() ! GetVisitResponse(getVisit(id, user))
      }

      case GetVisits(ownerId, start, end, user, asDoctor) => {
        log.debug("Getting doctor's - ownerId: {}, start: {}, end: {}, user id: {}", ownerId, start, end, user.id)
        asDoctor match {
          case true =>
            sender() ! GetVisitsResponse(getDoctorVisits(ownerId, start, end, user))

          case false =>
            sender() ! GetVisitsResponse(getPatientVisits(ownerId, start, end, user))
        }
      }

      case UpdateVisit(visit, user) => {
        log.debug("Update visit - visit: {}, user: {}", visit, user)
        if (isOwner(visit, user).isSuccess) {
          sender() ! UpdateVisitResponse(updateDoctorVisit(visit, user.asInstanceOf[Doctor]))
        } else {
          sender() ! UpdateVisitResponse(updatePatientVisit(visit, user))
        }
      }

      case CreateVisit(visit, user) => {
        log.debug("Create visit -  user: {}, visit: {}", user.eMail, visit)
        if (isOwner(visit, user).isSuccess) {
          sender() ! CreateVisitResponse(createDoctorVisit(visit, user.asInstanceOf[Doctor]))
        } else {
          val responseTo = sender()
          createPatientVisit(visit, user) onComplete {

            case Success(visitId) => responseTo ! CreateVisitResponse(visitId)

            case Failure(ex) => {
              log.error(ex, "Couldn't create visit - user: {}, visit: {}", user.eMail, visit)
              responseTo ! CreateVisitResponse(Fault("Unexpected server error occurred"))
            }

          }
        }
      }

      case SearchDoctors(criteria, user) => {
        log.debug("Search doctors - criteria: {}, user: {}", criteria, user)
        val responseTo = sender()
        findDoctors(criteria, user) onComplete {

          case Success(doctors) => responseTo ! SearchDoctorsResponse(doctors)

          case Failure(ex) => {
            log.error(ex, "Couldn't get doctors - user: {}, criteria: {}", user.eMail, criteria)
            responseTo ! SearchDoctorsResponse(Fault("Unexpected server error occurred"))
          }

        }

      }

      case UserModifiedNotification(user) => {
        log.debug("User has changed {} - updating future visits", user)
        changeUserInVisits(user)
      }

    }

  }

}
