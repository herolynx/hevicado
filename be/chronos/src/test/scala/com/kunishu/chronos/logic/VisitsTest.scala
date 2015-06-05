package com.kunishu.chronos.logic

import com.kunishu.chronos.io.{UserGateway, CalendarRepo}
import com.kunishu.core.processing.{Success, Result}
import com.kunishu.model.user.{User, AnyUser}
import com.kunishu.test.data.{VisitTestData, UsersTestData}
import org.joda.time.{Period, DateTime}
import org.scalamock.scalatest.MockFactory
import org.scalatest.{OneInstancePerTest, Matchers, GivenWhenThen, FunSpec}
import scala.concurrent.{Await, ExecutionContext, Promise}
import ExecutionContext.Implicits.global
import scala.concurrent.duration._

/**
 * Unit tests related with generic visit use cases
 *
 * @author Michal Wronski
 * @since 1.0
 */
class VisitsTest extends FunSpec with GivenWhenThen with MockFactory with Matchers with OneInstancePerTest
with Visits {

  protected override val calendarRepo = stub[CalendarRepo]
  protected override val userGateway = stub[UserGateway]

  describe("Visits") {

    describe("Getting visit details") {

      it("Should get visit details") {
        Given("visit")
        val visit = VisitTestData.pulsantisVisit(new DateTime().plus(Period.minutes(60)), 30)
        And("user participates in visit")
        val user = UsersTestData.johnnyBravo
        And("visit can be found in repository")
        (calendarRepo.get _) when (visit.id.get) returns (Some(visit))


        When("getting details about visit")
        val result = getVisit(visit.id.get, user)

        Then("details are returned")
        result.isSuccess should be(true)
        (calendarRepo.get _) verify (visit.id.get)
      }

      it("Should not get visit details if user is not a participant") {
        Given("visit")
        val visit = VisitTestData.pulsantisVisit(new DateTime().plus(Period.minutes(60)), 30)
        And("user doesn't participate in visit")
        val user = UsersTestData.pamelaAnderson
        And("visit can be found in repository")
        (calendarRepo.get _) when (visit.id.get) returns (Some(visit))


        When("getting details about visit")
        val result = getVisit(visit.id.get, user)

        Then("details are not returned")
        result.isSuccess should be(false)
        result.toString should include("Visit not found")
      }

    }

    describe("Handling broadcast messages") {

      it("Should modify patients in visits after user is changed") {
        Given("user has been modified")
        val user = UsersTestData.johnnyBravo
        And("user has visits")
        val userPromise = Promise[Result[AnyUser]]
        (userGateway.getUser _) when(
          user.id.get,
          user
          ) returns (
          userPromise.future
          )

        When("user is updated in visits")
        userPromise.success(Success[AnyUser](user))
        Await.result(changeUserInVisits(user), 500 millisecond)

        Then("patients in future visits are updated")
        (calendarRepo.updatePatientInfo _) verify(user.info(), *)
        And("doctors in future visits are not updated")
        (calendarRepo.updateDoctorInfo _) verify(*, *) repeat (0) times()
      }

      it("Should modify doctors in visits after doctor is changed") {
        Given("doctor has been modified")
        val user = UsersTestData.zbigniewReliga
        val userInfo = new User(user.attributes).info()
        And("user has visits")
        val userPromise = Promise[Result[AnyUser]]
        (userGateway.getUser _) when(
          user.id.get,
          user
          ) returns (
          userPromise.future
          )

        When("user is updated in visits")
        userPromise.success(Success[AnyUser](user))
        Await.result(changeUserInVisits(user), 500 millisecond)

        Then("patients in future visits are updated")
        (calendarRepo.updatePatientInfo _) verify(userInfo, *)
        And("doctors in future visits are updated")
        (calendarRepo.updateDoctorInfo _) verify(userInfo, *)
        And("locations in future visits are updated")
        (calendarRepo.updateLocationInfo _) verify(user.id.get, user.locations(0).withoutTemplates, *)
        (calendarRepo.updateLocationInfo _) verify(user.id.get, user.locations(1).withoutTemplates, *)
      }

    }

  }
}
