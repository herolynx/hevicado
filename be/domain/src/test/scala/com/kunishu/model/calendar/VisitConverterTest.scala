package com.kunishu.model.calendar

import org.scalatest.{OneInstancePerTest, Matchers, GivenWhenThen, FunSpec}
import com.kunishu.test.data.VisitTestData._
import com.kunishu.test.data.UsersTestData._

/**
 * Unit tests for checking visit conversions
 *
 * @author Michal Wronski
 * @since 1.1
 */
class VisitConverterTest extends FunSpec with GivenWhenThen with Matchers with OneInstancePerTest
with VisitConverter {


  describe("Participant visits") {

    it("Should show details of visit to participant") {
      Given("visit")
      val visit = pulsantisVisit()
      And("user participates in a visit")
      val user = johnnyBravo

      When("converting visit")
      val converted = toParticipantVisit(visit, user)

      Then("details of visit are shown")
      converted.isDefined should be(true)
      converted.get.attributes.size should not be (3)
    }

    it("Should hide details of visit to not participant users") {
      Given("visit")
      val visit = pulsantisVisit()
      And("user doesn't participate in a visit")
      val user = pamelaAnderson

      When("converting visit")
      val converted = toParticipantVisit(visit, user)

      Then("details of visit are hidden")
      converted.isDefined should be(true)
      converted.get.attributes.size should be(3)
      converted.get.attributes.keySet.toString() should include("start, end, doctor")
    }

  }

  describe("Public visits") {

    it("Should convert visit to public one") {
      Given("any not cancelled visit")
      val visit = pulsantisVisit()

      When("converting visit to public one")
      val converted = toPublicVisit(visit)

      Then("the same visit is returned")
      converted.isDefined should be(true)
      converted.get.attributes should be equals (visit.attributes)
    }

    it("Should not convert cancelled visits") {
      Given("any cancelled visit")
      val visit = cancelVisit(pulsantisVisit())

      When("converting visit to public one")
      val converted = toPublicVisit(visit)

      Then("the visit is not converted")
      converted should be(None)
    }

  }

  describe("Cancelled visits") {

    it("Should convert visit to visit cancellation") {
      Given("visit about to be cancelled")
      val visit = cancelVisit(pulsantisVisit())

      When("converting visit to visit cancellation")
      val converted = toCancelVisit(visit)

      Then("only info needed for cancellation is included")
      converted.attributes.keySet.toString() should include("cancelled, id")
    }

  }

}
