package com.kunishu.model.user

import org.joda.time.DateTime
import org.scalatest.{OneInstancePerTest, Matchers, GivenWhenThen, FunSpec}

import com.kunishu.test.data.UsersTestData._
import com.kunishu.test.data.VisitTestData._

/**
 * Unit tests related with users validation
 *
 * @author Michal Wronski
 * @since 1.1
 */
class UserValidatorTest extends FunSpec with GivenWhenThen with Matchers with OneInstancePerTest
with UserValidator {

  describe("User validation") {

    it("Should validate user successfully") {
      Given("any user with mandatory fields")
      val user = johnnyBravo

      When("validating user")
      val validation = isValid(user)

      Then("user is valid")
      validation.isSuccess should be(true)
    }

    it("Should fail validation of user without mandatory fields") {
      Given("empty user")
      val user = new User(Map())

      When("validating user")
      val validation = isValid(user)

      Then("user is not valid")
      validation.isSuccess should be(false)
      And("reason of failure are given")
      validation.toString should include("E-mail is not given")
    }

  }

  describe("User ownership validation") {

    it("Should verify entity that belongs to user") {
      Given("any user")
      val user = zbigniewReliga
      And("entity that belongs to user")
      val entity = pulsantisVisit()

      When("checking ownership")
      val validation = isOwner(entity, user)

      Then("check is positive")
      validation.isSuccess should be(true)
    }

    it("Should verify entity that doesn't belong to user") {
      Given("any user")
      val user = johnnyBravo
      And("entity that doesn't belong to user")
      val entity = pulsantisVisit()

      When("checking ownership")
      val validation = isOwner(entity, user)

      Then("check is negative")
      validation.isSuccess should be(false)
      validation.toString should include("is not an owner of")
    }

  }

  describe("Working hours validation") {

    it("Should verify time window in doctor's working hours") {
      Given("any doctor")
      val doctor = zbigniewReliga
      And("time window in working hours")
      val start = new DateTime(2015, 2, 23, 8, 0, 0)
      val end = new DateTime(2015, 2, 23, 10, 0, 0)

      When("checking whether doctor is working in time window")
      val validation = isWorking(doctor, start, end)

      Then("check is positive")
      validation.isSuccess should be(true)
    }

    it("Should verify time window not in doctor's working hours") {
      Given("any doctor")
      val doctor = zbigniewReliga
      And("time window not in working hours")
      val start = new DateTime(2015, 2, 23, 10, 0, 0)
      val end = new DateTime(2015, 2, 23, 11, 0, 0)

      When("checking whether doctor is working in time window")
      val validation = isWorking(doctor, start, end)

      Then("check is negative")
      validation.isSuccess should be(false)
      validation.toString should include("Doctor zbigniew.religa@kunishu.com is not working between '2015-02-23T10:00:00.000Z' and '2015-02-23T11:00:00.000Z'")
    }

  }

}
