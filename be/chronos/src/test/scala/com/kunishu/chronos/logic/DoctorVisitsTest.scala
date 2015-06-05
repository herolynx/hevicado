package com.kunishu.chronos.logic

import com.kunishu.chronos.io.{UserGateway, CalendarRepo}
import com.kunishu.core.processing.Success
import com.kunishu.model.calendar.Visit
import com.kunishu.model.messages.EmailGateway
import com.kunishu.test.data.{VisitTestData, UsersTestData}
import org.joda.time.{Period, DateTime}
import org.scalamock.scalatest.MockFactory
import org.scalatest.{OneInstancePerTest, Matchers, GivenWhenThen, FunSpec}

/**
 * Unit tests related with doctor visits use cases
 *
 * @author Michal Wronski
 * @since
 */
class DoctorVisitsTest extends FunSpec with GivenWhenThen with MockFactory with Matchers with OneInstancePerTest
with DoctorVisits {

  protected override val calendarRepo = stub[CalendarRepo]
  protected override val userGateway = stub[UserGateway]
  protected override val eMailGateway = stub[EmailGateway]

  describe("Doctor visits") {

    describe("Getting doctor's visits") {

      it("Should get visits with detail information") {
        Given("chosen doctor")
        val doctor = UsersTestData.zbigniewReliga
        And("chosen time period")
        val start = new DateTime(2015, 1, 1, 0, 0, 0)
        val end = new DateTime(2015, 1, 31, 23, 59, 59)
        And("doctor has visits defined")
        (calendarRepo.getDoctorVisits _) when(doctor.id.get, start, end) returns (List(
          VisitTestData.pulsantisVisit(start, 30)
        ))
        And("user participates in visits")
        val user = UsersTestData.johnnyBravo

        When("getting doctor's visit")
        val result = getDoctorVisits(doctor.id.get, start, end, user)

        Then("visits are returned")
        result.isSuccess should be(true)
        (calendarRepo.getDoctorVisits _) verify(doctor.id.get, start, end)
        And("user can see details of visits")
        val visits = result.asInstanceOf[Success[Seq[Visit]]].value
        visits(0).patient.isDefined should be(true)
      }

      it("Should get visits with generic information") {
        Given("chosen doctor")
        val doctor = UsersTestData.zbigniewReliga
        And("chosen time period")
        val start = new DateTime(2015, 1, 1, 0, 0, 0)
        val end = new DateTime(2015, 1, 31, 23, 59, 59)
        And("doctor has visits defined")
        (calendarRepo.getDoctorVisits _) when(doctor.id.get, start, end) returns (List(
          VisitTestData.pulsantisVisit(start, 30)
        ))
        And("user doesn't participate in visits")
        val user = UsersTestData.pamelaAnderson

        When("getting doctor's visit")
        val result = getDoctorVisits(doctor.id.get, start, end, user)

        Then("visits are returned")
        result.isSuccess should be(true)
        (calendarRepo.getDoctorVisits _) verify(doctor.id.get, start, end)
        And("user can see only generic information about visit")
        val visits = result.asInstanceOf[Success[Seq[Visit]]].value
        visits(0).patient.isDefined should be(false)
      }

    }

    describe("Visit modifications") {

      describe("Visit creation") {

        it("Should create visit") {
          Given("any doctor")
          val doctor = UsersTestData.zbigniewReliga
          And("a visit")
          val visit = VisitTestData.pulsantisVisit(new DateTime(2015, 1, 21, 8, 0, 0), 30)
          And("doctor has visits defined")
          (calendarRepo.create _) when (*) returns ("new-visit-id")

          When("creating a visit")
          val result = createDoctorVisit(visit, doctor)

          Then("visits is created")
          result.isSuccess should be(true)
          (calendarRepo.create _) verify (visit)
          And("e-mail about visit modification is sent")
          (eMailGateway.send _) verify (*)
        }

        it("Should not create a visit on behalf of other doctors") {
          Given("any doctor")
          val doctor = UsersTestData.zbigniewReliga
          And("a visit")
          val visit = VisitTestData.pulsantisVisit(new DateTime(2015, 1, 21, 8, 0, 0), 30)
          And("doctor has visits defined")
          (calendarRepo.create _) when (*) returns ("new-visit-id")

          When("creating a visit on behalf of other doctors")
          val result = createDoctorVisit(visit, UsersTestData.doctorQuin)

          Then("visits is not created")
          result.isSuccess should be(false)
          result.toString should include("is not an owner of")
          And("e-mail about visit modification is not sent")
          (eMailGateway.send _) verify (*) repeat (0) times()
        }

      }

      describe("Visit update") {

        it("Should update visit in OPEN state") {
          Given("any doctor")
          val doctor = UsersTestData.zbigniewReliga
          And("a visit in OPEN state")
          val visit = VisitTestData.pulsantisVisit(new DateTime().plus(Period.minutes(60)), 30)
          And("visit is reachable")
          (calendarRepo.get _) when (*) returns (Some(visit))
          (calendarRepo.update _) when (*) returns (true)

          When("updating visit")
          val result = updateDoctorVisit(visit, doctor)

          Then("visits is updated")
          result.isSuccess should be(true)
          (calendarRepo.get _) verify (visit.id.get)
          (calendarRepo.update _) verify (visit)
          And("e-mail about visit modification is sent")
          (eMailGateway.send _) verify (*)
        }

        it("Should not update visit not in OPEN state") {
          Given("any doctor")
          val doctor = UsersTestData.zbigniewReliga
          And("a visit is not in OPEN state")
          val visit = VisitTestData.pulsantisVisit(new DateTime(2015, 1, 21, 8, 0, 0), 30)
          And("visit is reachable")
          (calendarRepo.get _) when (*) returns (Some(visit))
          (calendarRepo.update _) when (*) returns (true)

          When("updating visit")
          val result = updateDoctorVisit(visit, doctor)

          Then("visits is not updated")
          result.isSuccess should be(false)
          result.toString should include("cannot be changed because of state CLOSED")
          And("e-mail about visit modification is not sent")
          (eMailGateway.send _) verify (*) repeat (0) times()
        }

        it("Should not update visit on behalf of other doctors") {
          Given("doctor doesn't own a visit")
          val doctor = UsersTestData.doctorQuin
          And("a visit in OPEN state")
          val visit = VisitTestData.pulsantisVisit(new DateTime().plus(Period.minutes(60)), 30)
          And("visit is reachable")
          (calendarRepo.get _) when (*) returns (Some(visit))
          (calendarRepo.update _) when (*) returns (true)

          When("updating visit on behalf of other doctor")
          val result = updateDoctorVisit(visit, doctor)

          Then("visits is not updated")
          result.isSuccess should be(false)
          result.toString should include("is not a participant of")
          And("e-mail about visit modification is not sent")
          (eMailGateway.send _) verify (*) repeat (0) times()
        }

        it("Should not update non-existing visit") {
          Given("any doctor")
          val doctor = UsersTestData.zbigniewReliga
          And("a visit in OPEN state")
          val visit = VisitTestData.pulsantisVisit(new DateTime().plus(Period.minutes(60)), 30)
          And("visit is not reachable")
          (calendarRepo.get _) when (*) returns (None)
          (calendarRepo.update _) when (*) returns (true)

          When("updating visit")
          val result = updateDoctorVisit(visit, doctor)

          Then("visits is not updated")
          result.isSuccess should be(false)
          result.toString should include("Visit not found")
          And("e-mail about visit modification is not sent")
          (eMailGateway.send _) verify (*) repeat (0) times()
        }

      }

    }

  }

}
