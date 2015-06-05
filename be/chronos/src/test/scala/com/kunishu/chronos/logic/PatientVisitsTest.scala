package com.kunishu.chronos.logic

import com.kunishu.chronos.io.{UserGateway, CalendarRepo}
import com.kunishu.model.calendar.{ Visit}
import com.kunishu.model.messages.EmailGateway
import com.kunishu.test.data.{VisitTestData, UsersTestData}
import org.joda.time.{Period, DateTime}
import org.scalatest._
import org.scalamock.scalatest.MockFactory

import scala.concurrent.{ExecutionContext, Future}
import ExecutionContext.Implicits.global

/**
 * Unit tests related with patient visits use cases
 *
 * @author Michal Wronski
 * @since 1.0
 */
class PatientVisitsTest extends FunSpec with GivenWhenThen with MockFactory with Matchers with OneInstancePerTest
with PatientVisits {

  import com.kunishu.model.EntityAttrs.attId
  import com.kunishu.model.calendar.VisitAttrs._

  protected override val calendarRepo = stub[CalendarRepo]
  protected override val userGateway = stub[UserGateway]
  protected override val eMailGateway = stub[EmailGateway]

  describe("Patient visits") {

    describe("Getting patient visits") {

      it("Should get visits owned by patients") {
        Given("any user")
        val user = UsersTestData.johnnyBravo
        And("chosen time period")
        val start = new DateTime(2015, 1, 1, 0, 0, 0)
        val end = new DateTime(2015, 1, 31, 23, 59, 59)

        When("getting visits that user owns")
        val result = getPatientVisits(user.id.get, start, end, user)

        Then("visits are returned")
        result.isSuccess should be(true)
        (calendarRepo.getPatientVisits _) verify(user.id.get, start, end)
      }

      it("Should not get visits owned by different patients") {
        Given("any user")
        val user = UsersTestData.johnnyBravo
        And("chosen time period")
        val start = new DateTime(2015, 1, 1, 0, 0, 0)
        val end = new DateTime(2015, 1, 31, 23, 59, 59)

        When("getting visits that belongs to different user")
        val result = getPatientVisits("diff-user-123", start, end, user)

        Then("visits are not returned")
        result.isSuccess should be(false)
        (calendarRepo.getPatientVisits _) verify(user.id.get, start, end) repeated (0) times()
        And("proper error message is returned")
        result.toString should include("is not an owner of")
      }

    }

    describe("Visit modification") {

      it("Should cancel visit") {
        Given("visit is in OPEN state")
        val visit = VisitTestData.pulsantisVisit(new DateTime().plus(Period.minutes(60)), 30)
        And("user participates in visit")
        val user = UsersTestData.johnnyBravo
        And("visit can be found in repository")
        (calendarRepo.get _) when (visit.id.get) returns (Some(visit))

        When("cancelling visit")
        val cancelVisit = new Visit(visit.attributes ++ Map(
          attId -> visit.id.get,
          attCancelled -> new DateTime()
        ))
        val cancelOnlyVisit = new Visit(Map(
          attId -> visit.id.get,
          attCancelled -> new DateTime()
        ))
        (calendarRepo.update _) when (*) returns (true)
        val result = updatePatientVisit(cancelVisit, user)

        Then("visit is cancelled")
        (calendarRepo.update _) verify (*)
        result.isSuccess should be(true)
        And("e-mail about visit modification is sent")
        (eMailGateway.send _) verify (*)
      }

      it("Should not cancel visit not in OPEN state") {
        Given("visit is not in OPEN state")
        val visit = VisitTestData.pulsantisVisit(new DateTime().plus(Period.minutes(-60)), 30)
        And("user participates in visit")
        val user = UsersTestData.johnnyBravo
        And("visit can be found in repository")
        (calendarRepo.get _) when (visit.id.get) returns (Some(visit))

        When("cancelling visit")
        val cancelVisit = new Visit(Map(
          attId -> visit.id.get,
          attCancelled -> new DateTime()
        ))
        val result = updatePatientVisit(cancelVisit, user)

        Then("visit is NOT cancelled")
        (calendarRepo.update _) verify (cancelVisit) repeated (0) times()
        result.toString should include("cannot be changed because of state CLOSED")
        And("e-mail about visit modification is not sent")
        (eMailGateway.send _) verify (*) repeat(0) times()
      }

      it("Should prevent patient before changing visit") {
        Given("visit is in OPEN state")
        val visit = VisitTestData.pulsantisVisit(new DateTime().plus(Period.minutes(60)), 30)
        And("user participates in visit")
        val user = UsersTestData.johnnyBravo
        And("visit can be found in repository")
        (calendarRepo.get _) when (visit.id.get) returns (Some(visit))

        When("trying to modify visit")
        val result = updatePatientVisit(visit, user)

        Then("visit is NOT cancelled")
        (calendarRepo.update _) verify (visit) repeated (0) times()
        result.toString should include("Patient can only cancel a visit")
        And("e-mail about visit modification is not sent")
        (eMailGateway.send _) verify (*) repeat(0) times()
      }

      it("Should prevent modifying visits of other patients") {
        Given("visit is in OPEN state")
        val visit = VisitTestData.pulsantisVisit(new DateTime().plus(Period.minutes(60)), 30)
        And("user doesn't participate in visit")
        val user = UsersTestData.pamelaAnderson
        And("visit can be found in repository")
        (calendarRepo.get _) when (visit.id.get) returns (Some(visit))

        When("cancelling visit")
        val cancelOnlyVisit = new Visit(Map(
          attId -> visit.id.get,
          attCancelled -> new DateTime()
        ))

        val result = updatePatientVisit(cancelOnlyVisit, user)

        Then("visit is NOT cancelled")
        (calendarRepo.update _) verify (cancelOnlyVisit) repeated (0) times()
        result.toString should include("is not a participant of")
        And("e-mail about visit modification is not sent")
        (eMailGateway.send _) verify (*) repeat(0) times()
      }

      it("Should not change not existing visit") {
        Given("visit is in OPEN state")
        val visit = VisitTestData.pulsantisVisit(new DateTime().plus(Period.minutes(60)), 30)
        And("user participates in visit")
        val user = UsersTestData.johnnyBravo
        And("visit can NOT be found in repository")
        (calendarRepo.get _) when (visit.id.get) returns (None)

        When("cancelling visit")
        val cancelOnlyVisit = new Visit(Map(
          attId -> visit.id.get,
          attCancelled -> new DateTime()
        ))
        val result = updatePatientVisit(cancelOnlyVisit, user)

        Then("visit is NOT cancelled")
        (calendarRepo.update _) verify (cancelOnlyVisit) repeated (0) times()
        result.toString should include("Visit not found")
        And("e-mail about visit modification is not sent")
        (eMailGateway.send _) verify (*) repeat(0) times()
      }

    }

  }

}
