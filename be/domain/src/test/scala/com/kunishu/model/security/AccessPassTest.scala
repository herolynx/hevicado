package com.kunishu.model.security

import com.kunishu.core.security.Encryption
import org.joda.time.DateTime
import org.scalatest.{OneInstancePerTest, Matchers, GivenWhenThen, FunSpec}
import AccessPass._
import com.kunishu.test.data.UsersTestData._

/**
 * Unit tests related with access pass (tokens, temporary passwords etc.)
 *
 * @author Michal Wronski
 * @since 1.1
 */
class AccessPassTest extends FunSpec with GivenWhenThen with Matchers with OneInstancePerTest {


  describe("Access pass creation") {

    it("Should create new token") {
      Given("any user")
      val user = johnnyBravo

      When("new token is created")
      val pass = createToken(user)

      Then("token has proper expiry date")
      pass.isValid should be(true)
      pass.expiryDate.isAfter(new DateTime().plusHours(23)) should be(true)
      And("token ID is set")
      pass.token should not be (null)
    }

    it("Should create new temporary password") {
      Given("any user")
      val user = johnnyBravo

      When("new temporary password is created")
      val pass = createTmpPassword(user)

      Then("temporary password has proper expiry date")
      pass._2.isValid should be(true)
      pass._2.expiryDate.isAfter(new DateTime().plusMinutes(50)) should be(true)
      And("password is set both in encrypted and non-encrypted form")
      pass._2.password should not be (null)
      pass._1 should not be (null)
      pass._2.password should be equals (Encryption.hash(pass._1))
    }

  }

  describe("Access pass conversions") {

    it("Should create token pass based on attributes") {
      Given("any user")
      val user = johnnyBravo
      And("sample token")
      val pass = createToken(user)

      When("new pass is created based on attributes")
      val newPass = create(pass.attributes)

      Then("proper type of access pass is created")
      newPass.isInstanceOf[Token] should be(true)
    }

    it("Should create temporary password pass based on attributes") {
      Given("any user")
      val user = johnnyBravo
      And("sample temporary password")
      val pass = createTmpPassword(user)._2

      When("new pass is created based on attributes")
      val newPass = create(pass.attributes)

      Then("proper type of access pass is created")
      newPass.isInstanceOf[TempPassword] should be(true)
    }

  }


}
