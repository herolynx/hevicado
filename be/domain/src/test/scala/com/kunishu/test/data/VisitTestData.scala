package com.kunishu.test.data

import com.kunishu.model.calendar.Visit
import com.kunishu.model.user.{User, Doctor, AnyUser, Location}
import org.joda.time.{Period, DateTime}
import LocationTestData._
import UsersTestData._

/**
 * Sample visits that can be used for testing purposes
 *
 * @author Michal Wronski
 * @since 1.0
 */
object VisitTestData {

  import com.kunishu.model.EntityAttrs._
  import com.kunishu.model.calendar.VisitAttrs._

  private val defaultLocation = pulsantis()
  private var visitId: Int = 0

  private def nextId: String = {
    visitId += 1
    "visit-" + visitId
  }

  def cancelVisit(v: Visit): Visit =
    new Visit(
      v.attributes ++ Map(attCancelled -> new DateTime())
    )


  def luxMedVisit(
                   start: DateTime = new DateTime(),
                   length: Int = 30,
                   patient: AnyUser = johnnyBravo,
                   doctor: Doctor = zbigniewReliga,
                   id: String = nextId
                   ): Visit =
    sampleVisit(start, length, luxMed(), patient, doctor, id)

  def pulsantisVisit(
                      start: DateTime = new DateTime(),
                      length: Int = 30,
                      patient: AnyUser = johnnyBravo,
                      doctor: Doctor = zbigniewReliga,
                      id: String = nextId
                      ): Visit =
    sampleVisit(start, length, pulsantis(), patient, doctor, id)

  def sampleVisit(
                   start: DateTime = new DateTime(),
                   length: Int = 30,
                   location: Location = defaultLocation,
                   patient: AnyUser = johnnyBravo,
                   doctor: Doctor = zbigniewReliga,
                   id: String = nextId
                   ): Visit = {
    visitId += 1
    Visit(
      Map(
        attId -> id,
        attPatient -> patient.info().attributes,
        attDoctor -> new User(doctor.attributes).info().attributes,
        attStart -> start,
        attEnd -> start.plus(Period.minutes(length)),
        attLocation -> location.attributes
      )
    )
  }

}
