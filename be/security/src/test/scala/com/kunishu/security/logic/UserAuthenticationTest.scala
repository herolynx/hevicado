package com.kunishu.security.logic

import com.kunishu.core.security.Encryption
import com.kunishu.model.messages.EmailGateway
import com.kunishu.model.security.{TempPassword, AccessPass}
import com.kunishu.model.user.{UserAttrs, User}
import com.kunishu.security.io.AuthenticationRepo
import com.kunishu.test.data.UsersTestData
import org.scalamock.scalatest.MockFactory
import org.scalatest.{OneInstancePerTest, Matchers, GivenWhenThen, FunSpec}

/**
 * Unit tests related with authentication cases
 *
 * @author Michal Wronski
 * @since 1.0
 */
class UserAuthenticationTest extends FunSpec with GivenWhenThen with MockFactory with Matchers with OneInstancePerTest
with UserAuthentication with TokenAuthentication {

  protected override val authRepo: AuthenticationRepo = stub[AuthenticationRepo]
  protected override val eMailGateway: EmailGateway = stub[EmailGateway]

  describe("User authentication") {

    describe("Logging in") {

      it("Should authenticate user with valid credentials") {
        Given("any user")
        val user = new User(
          UsersTestData.johnnyBravo.attributes ++
            Map(UserAttrs.attPassword -> Encryption.hash("new-pass-123"))
        )
        And("valid credentials")
        val eMail = "user@kunishu.com"
        val password = "new-pass-123"
        And("user account is reachable")
        (authRepo.findUserByLogin _) when (*) returns (Some(user))
        (authRepo.findByLogin _) when (*) returns (List())

        When("logging in")
        val result = authUser(eMail, password)

        Then("user is logged in")
        result.isDefined should be(true)
        (authRepo.findUserByLogin _) verify (eMail)
        And("token is created for newly logged in user")
        (authRepo.create _) verify (*)
      }

      it("Should not authenticate user with invalid credentials") {
        Given("any user")
        val user = new User(
          UsersTestData.johnnyBravo.attributes ++
            Map(UserAttrs.attPassword -> Encryption.hash("new-pass-123"))
        )
        And("invalid credentials")
        val eMail = "user@kunishu.com"
        val password = "wrong-pass-123"
        And("user account is reachable")
        (authRepo.findUserByLogin _) when (*) returns (Some(user))
        (authRepo.findByLogin _) when (*) returns (List())

        When("logging in")
        val result = authUser(eMail, password)

        Then("user is not logged in")
        result.isDefined should be(false)
        (authRepo.findUserByLogin _) verify (eMail)
        And("token is NOT created for newly logged in user")
        (authRepo.create _) verify (*) repeated (0) times()
      }

      it("Should authenticate user with valid temporary password") {
        Given("any user")
        val user = new User(
          UsersTestData.johnnyBravo.attributes ++
            Map(UserAttrs.attPassword -> Encryption.hash("new-pass-123"))
        )
        And("valid temporary password")
        val tempPass = AccessPass.createTmpPassword(user)
        val tempPassToken = new TempPassword(
          tempPass._2.attributes ++
            Map("id" -> "temp-pass-123")
        )
        (authRepo.findByLogin _) when (*) returns (List(tempPassToken))
        And("user account is reachable")
        (authRepo.findUserByLogin _) when (*) returns (Some(user))
        (authRepo.findByLogin _) when (*) returns (List())

        When("logging in user with valid temporary password")
        val result = authUser(user.eMail, tempPass._1)

        Then("user is logged in")
        result.isDefined should be(true)
        (authRepo.findUserByLogin _) verify (user.eMail)
        And("token is created for newly logged in user")
        (authRepo.create _) verify (*)
        And("temporary password is deleted after usage")
        (authRepo.delete _) verify ("temp-pass-123")
      }

      it("Should not authenticate user with invalid temporary password") {
        Given("any user")
        val user = new User(
          UsersTestData.johnnyBravo.attributes ++
            Map(UserAttrs.attPassword -> Encryption.hash("new-pass-123"))
        )
        And("valid temporary password")
        val tempPass = AccessPass.createTmpPassword(user)
        val tempPassToken = new TempPassword(
          tempPass._2.attributes ++
            Map("id" -> "temp-pass-123")
        )
        (authRepo.findByLogin _) when (*) returns (List(tempPassToken))
        And("user account is reachable")
        (authRepo.findUserByLogin _) when (*) returns (Some(user))
        (authRepo.findByLogin _) when (*) returns (List())

        When("logging in user with invalid temporary password")
        val result = authUser(user.eMail, "wrong-pass-123")

        Then("user is not logged in")
        result.isDefined should be(false)
        (authRepo.findUserByLogin _) verify (user.eMail)
        And("token is not created for user")
        (authRepo.create _) verify (*) repeated (0) times()
        And("temporary password is not deleted and may be still used")
        (authRepo.delete _) verify ("temp-pass-123") repeated (0) times()
      }

    }

    describe("Lost password") {

      it("should generate temporary password for user") {
        Given("any user")
        val user = UsersTestData.johnnyBravo
        (authRepo.findUserByLogin _) when (*) returns (Some(user))

        When("user wants to regain control over his account")
        regainAccount(user)

        Then("temporary password is generated for user")
        (authRepo.create _) verify (*)
        And("e-mail with temporary password is sent to the user")
        (eMailGateway.send _) verify (*)
      }

    }


  }

}
