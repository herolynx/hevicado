package com.kunishu.model.user

import com.kunishu.core.string.RegExp
import org.scalatest.{OneInstancePerTest, Matchers, GivenWhenThen, FunSpec}
import com.kunishu.test.data.UsersTestData._

/**
 * Unit tests related with user related filters
 *
 * @author Michal Wronski
 * @since 1.1
 */
class UserFiltersTest extends FunSpec with GivenWhenThen with Matchers with OneInstancePerTest
with UserFilters with RegExp {

  describe("Doctor filtering") {

    it("Should find doctor location based on matching criteria") {
      Given("any doctor")
      val doctor = zbigniewReliga
      And("criteria that matches doctor's location")
      val criteria = "pul"

      When("filtering doctor")
      val result = filterLocation(location2Address)(doctor, multiMatch(Some(List(criteria)))).asInstanceOf[Doctor]

      Then("only matching location is returned")
      result.locations.size should be(1)
      result.locations(0).name should be("Pulsantis")
    }

    it("Should find no doctor location for non-matching criteria") {
      Given("any doctor")
      val doctor = zbigniewReliga
      And("criteria that doesn't match any location")
      val criteria = "non-matching"

      When("filtering doctor")
      val result = filterLocation(location2Address)(doctor, multiMatch(Some(List(criteria)))).asInstanceOf[Doctor]

      Then("empty results are returned")
      result.locations.size should be(0)
    }

    it("Should find doctor specialization based on matching criteria") {
      Given("any doctor")
      val doctor = zbigniewReliga
      And("criteria that matches doctor's specialization for chosen location")
      val criteria = "heart"

      When("filtering doctor")
      val result = filterLocation(locationToSpecializations)(doctor, multiMatch(Some(List(criteria)))).asInstanceOf[Doctor]

      Then("only matching location is returned")
      result.locations.size should be(1)
      result.locations(0).name should be("Pulsantis")
    }

    it("Should find no doctor specialization for non-matching criteria") {
      Given("any doctor")
      val doctor = zbigniewReliga
      And("criteria that doesn't match doctor's specialization for any location")
      val criteria = "leg"

      When("filtering doctor")
      val result = filterLocation(locationToSpecializations)(doctor, multiMatch(Some(List(criteria)))).asInstanceOf[Doctor]

      Then("empty results are returned")
      result.locations.size should be(0)
    }

  }

}
