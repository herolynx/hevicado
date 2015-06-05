package com.kunishu.chronos.logic

import com.kunishu.model.calendar._
import VisitConverter._
import com.kunishu.chronos.io.{UserGateway, CalendarRepo}
import com.kunishu.core.date.Date._
import com.kunishu.core.processing._
import com.kunishu.model.calendar.{VisitValidator, SearchDoctorCriteria, Visit}
import com.kunishu.model.calendar.VisitAttrs._
import Result._
import ResultChain._
import com.kunishu.model.messages.{VisitEmail, EmailGateway}
import com.kunishu.model.user.{SearchUserCriteria, Doctor, AnyUser}
import com.kunishu.model.user.UserValidator._
import org.joda.time.{Interval, Days, DateTime}
import VisitValidator._
import scala.concurrent.Future
import scala.concurrent._
import ExecutionContext.Implicits.global
import VisitValidator.isValid

/**
 * Logic related with patient visits
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait PatientVisits extends Visits {

  protected val calendarRepo: CalendarRepo
  protected val userGateway: UserGateway
  protected val eMailGateway: EmailGateway

  /**
   * Get visits assigned to patient
   * @param ownerId patient ID
   * @param start start of time window
   * @param end end of time window
   * @param user user access data
   * @return non-nullable result
   */
  def getPatientVisits(ownerId: String, start: DateTime, end: DateTime, user: AnyUser): Result[Seq[Visit]] =
    chainOf[Seq[Visit]].
      check(isOwner(ownerId, user)).
      then(() => Success(calendarRepo.getPatientVisits(ownerId, start, end)))

  /**
   * Find doctors based on given criteria
   * @param criteria search criteria
   * @param user user accessing data
   * @return non-nullable future results
   */
  def findDoctors(criteria: SearchDoctorCriteria, user: AnyUser): Future[Result[Seq[Doctor]]] = {
    userGateway.
      findDoctors(new SearchUserCriteria(criteria.map, false), user).
      map(
        result => {
          if (!result.isSuccess) {
            result.asInstanceOf[Result[Seq[Doctor]]]
          } else {
            val doctors = result.
              asInstanceOf[Success[Seq[AnyUser]]].
              value.
              filter(u => u.isInstanceOf[Doctor]).
              map(u => u.asInstanceOf[Doctor])
            val doctorsVisits = calendarRepo.getDoctorsVisits(doctors.toList.map(doctor => doctor.id.get), criteria.startDate, criteria.endDate)
            Success(
              doctors.
                map(doctor => attachCalendarInfo(doctor, criteria.startDate, criteria.endDate, doctorsVisits.get(doctor.id.get).getOrElse(List())))
            )
          }
        }
      )
  }

  /**
   * Create patient visit
   * @param visit visit to be created
   * @param user user accessing data
   * @return non-nullable result with promise of ID of newly created visit
   */
  def createPatientVisit(visit: Visit, user: AnyUser): Future[Result[String]] = {
    userGateway.
      getUser(visit.doctor.id.get, user).
      map(
        result => {
          if (!result.isSuccess) {
            Fault("Couldn't create visit - error: " + result.asInstanceOf[Error[String]].msg)
          } else {
            val doctor = Option.
              apply(result.asInstanceOf[Success[AnyUser]].value).
              filter(user => user.isInstanceOf[Doctor]).
              map(user => user.asInstanceOf[Doctor])
            chainOf[String].
              check(() => if (doctor.isDefined) Success("") else NotFoundError("Doctor not found: " + visit.doctor.id.get)).
              check(isValid(visit, user)).
              check(isParticipant(visit, user)).
              check(isWorking(doctor.orNull, visit.start, visit.end)).
              check(isTimeWindowFree(calendarRepo, doctor.orNull, visit.start, visit.end)).
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
        }
      )
  }

  /**
   * Update patient visit
   * @param visit visit to be updated
   * @param user user accessing data
   * @return non-nullable result with update status
   */
  def updatePatientVisit(visit: Visit, user: AnyUser): Result[Boolean] = {
    val repoVisit = calendarRepo.get(visit.id.get)
    chainOf[Boolean].
      check(() => isPresent(repoVisit, "Visit not found: " + visit.id.get)).
      check(isParticipant(repoVisit.orNull, user)).
      check(canBeChanged(repoVisit.orNull)).
      check(wantsToCancel(visit)).
      then(
        () => {
          val result = toResult(calendarRepo.update(toCancelVisit(visit)), "Visit wasn't updated in repository - id: " + visit.id.get)
          if (result.isSuccess()) {
            eMailGateway.send(new VisitEmail(visit))
          }
          result
        }
      )
  }

  /**
   * Attach summary info about calendar status to doctor
   * @param doctor doctor who's visits should be summarized
   * @param start start time
   * @param end end time
   * @param visits visits to be summarized
   * @return new instance of doctor with summary calendar info
   */
  private def attachCalendarInfo(doctor: Doctor, start: DateTime, end: DateTime, visits: Seq[Visit]): Doctor = {
    val locations = scala.collection.mutable.ListBuffer[Map[String, Any]]()
    for (location <- doctor.locations) {
      val info = for (
        dayInterval <- intervals(start, end, Days.ONE.toPeriod)
      )
      yield (
          //day for which summary info will be gathered
          dayInterval.toString,
          //count how long doctor is working in given day (in minutes)
          location.
            workingHours.
            map(wh => wh.interval(dayInterval)).
            filter(optionalWT => optionalWT.isDefined).
            map(optionalWT => optionalWT.get).
            map(workTime => dayInterval.overlap(workTime)).
            filter(overlap => overlap != null).
            map(overlap => overlap.toDuration.getStandardMinutes).
            sum.
            toInt,
          //count total time occupied by visits in given day (in minutes)
          visits.
            //filter cancelled events
            filterNot(v => v.cancelled.isDefined).
            //filter events from different days
            filter(v => dayInterval.contains(v.start)).
            //filter duplicates (events with the same time window)
            groupBy(v => new Interval(v.start, v.end)).
            map(_._2.head).
            //check visit duration in scope of working hours
            flatMap(v => location.overlap(v.start, v.end)).
            filter(optionalTime => optionalTime.isDefined).
            map(optionalTime => optionalTime.get).
            map(time => time.toDuration.getStandardMinutes).
            sum.
            toInt
          )
      //attach summary info to doctor's location
      locations += location.map ++
        Map(
          "calendar" -> info.map(tuple => Map("period" -> tuple._1, "total" -> tuple._2, "occupied" -> tuple._3)).toList
        )
    }
    new Doctor((doctor.map ++ Map("locations" -> locations.toList)).toMap)
  }

  /**
   * Check whether visit is about to be cancelled
   * @param visit visit to be checked
   * @tparam T type of results
   * @return non-nullable result
   */
  private def wantsToCancel[T](visit: Visit)(): Result[T] = {
    visit.attributes.get(attCancelled).isDefined match {
      case true => Success[T](Nil.asInstanceOf[T])
      case false => UnauthorizedError("Patient can only cancel a visit")
    }
  }

  /**
   * Check whether doctor doesn't have any visit during given time window
   * @param repo visit repository
   * @param doctor doctor owning visits
   * @param start start time
   * @param end end time
   * @tparam T type of result
   * @return non-nullable result
   */
  private def isTimeWindowFree[T](repo: CalendarRepo, doctor: Doctor, start: DateTime, end: DateTime)(): Result[T] = {
    if (repo.isDoctorTimeWindowFree(doctor.id.get, start, end)) {
      return Success[T](Nil.asInstanceOf[T])
    } else {
      return Fault[T]("Time window '%s' - '%s' is already taken".format(start.toString(dateFormatter), end.toString(dateFormatter)))
    }
  }

}
