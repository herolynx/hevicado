package com.kunishu.model.calendar

import org.joda.time.DateTime
import org.scalatest.{OneInstancePerTest, Matchers, GivenWhenThen, FunSpec}
import com.kunishu.test.data.UsersTestData._
import com.kunishu.test.data.VisitTestData._
import VisitAttrs._

/**
 * Unit tests related with visits validation
 *
 * @author Michal Wronski
 * @since 1.1
 */
class VisitValidatorTest extends FunSpec with GivenWhenThen with Matchers with OneInstancePerTest
with VisitValidator {

  describe("Visit validation") {

    it("Should not allow patients to create visits in the past") {
      Given("any patient")
      val user = johnnyBravo
      And("visit that stars in the past")
      val visit = pulsantisVisit(new DateTime().minusDays(1))

      When("checking visit")
      val validation = isValid(visit, user)

      Then("visit is not valid")
      validation.isSuccess should be(false)
      validation.toString should include("Visit start is in the past")
    }

    it("Should allow doctor to create visits in the past") {
      Given("any doctor")
      val user = zbigniewReliga
      And("visit that stars in the past")
      val visit = pulsantisVisit(new DateTime().minusDays(1))

      When("checking visit")
      val validation = isValid(visit, user)

      Then("visit is valid")
      validation.isSuccess should be(true)
    }

    it("Should prevent creating visits where visit start is before it's end") {
      Given("any doctor")
      val user = zbigniewReliga
      And("visit with end date before its start")
      val visit = new Visit(
        pulsantisVisit(new DateTime().minusDays(1)).attributes ++
          Map(
            attStart -> new DateTime(),
            attEnd -> new DateTime().minusDays(1)
          )
      )

      When("checking visit")
      val validation = isValid(visit, user)

      Then("visit is valid")
      validation.isSuccess should be(false)
      validation.toString should include("Visit start is after its end")
    }

  }

  describe("Visit participation validation") {

    it("Should verify that users participate in visit") {
      Given("visit")
      val visit = pulsantisVisit()

      When("checking its participants")
      val doctorParticipates = isParticipant(visit, zbigniewReliga)
      val patientParticipates = isParticipant(visit, johnnyBravo)
      val otherParticipates = isParticipant(visit, pamelaAnderson)


      Then("participants are verified correctly")
      doctorParticipates.isSuccess should be(true)
      patientParticipates.isSuccess should be(true)
      otherParticipates.isSuccess should be(false)
      otherParticipates.toString should include("is not a participant of")
    }

  }

  describe("Visit modifications validation") {

    it("Should allow to modify visits in OPEN state") {
      Given("visit in OPEN state")
      val visit = pulsantisVisit(new DateTime().plusDays(1))

      When("checking whether visit can be modified")
      val canModify = canBeChanged(visit)

      Then("modification is allowed")
      canModify.isSuccess should be(true)
    }

    it("Should prevent to modify visits in CLOSED state") {
      Given("visit in CLOSED state")
      val visit = pulsantisVisit(new DateTime().minusDays(1))

      When("checking whether visit can be modified")
      val canModify = canBeChanged(visit)

      Then("modification is not allowed")
      canModify.isSuccess should be(false)
      canModify.toString should include("cannot be changed because of state CLOSED")
    }

    it("Should prevent to modify visits in CANCELLED state") {
      Given("cancelled visit")
      val visit = cancelVisit(pulsantisVisit(new DateTime().plusDays(1)))

      When("checking whether visit can be modified")
      val canModify = canBeChanged(visit)

      Then("modification is not allowed")
      canModify.isSuccess should be(false)
      canModify.toString should include("cannot be changed because of state CANCELLED")
    }


  }


}
