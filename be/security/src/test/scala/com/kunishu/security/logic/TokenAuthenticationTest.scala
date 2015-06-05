package com.kunishu.security.logic

import com.kunishu.model.security.{AccessPass, Token}
import com.kunishu.security.io.AuthenticationRepo
import com.kunishu.test.data.UsersTestData
import org.scalamock.scalatest.MockFactory
import org.scalatest.{OneInstancePerTest, Matchers, GivenWhenThen, FunSpec}

/**
 * Unit tests related with token authentication
 *
 * @author Michal Wronski
 * @since 1.1
 */
class TokenAuthenticationTest extends FunSpec with GivenWhenThen with MockFactory with Matchers with OneInstancePerTest
with TokenAuthentication {

  protected override val authRepo: AuthenticationRepo = stub[AuthenticationRepo]

  describe("Token management") {

    it("Should authenticate user by valid token") {
      Given("any user")
      val user = UsersTestData.johnnyBravo
      And("valid token")
      val tokenPass = AccessPass.createToken(user)
      And("tokens are reachable")
      (authRepo.findByToken _) when (*) returns (Some(tokenPass))

      When("authenticating via token")
      val result = authToken(tokenPass.token)

      Then("authentication is successful")
      result.isDefined should be(true)
      (authRepo.findByToken _) verify (tokenPass.token)
    }

    it("Should not authenticate user by invalid token") {
      Given("any user")
      val user = UsersTestData.johnnyBravo
      And("invalid token")
      val token = "token-123"
      And("tokens are reachable")
      (authRepo.findByToken _) when (*) returns (None)

      When("authenticating via token")
      val result = authToken(token)

      Then("authentication is not successful")
      result.isDefined should be(false)
      (authRepo.findByToken _) verify (token)
    }

    it("Should destroy token while logging out") {
      Given("any user")
      val user = UsersTestData.johnnyBravo
      And("any valid token")
      val tokenPass = Token(
        AccessPass.createToken(user).attributes ++
          Map("id" -> "token-123")
      )
      (authRepo.findByToken _) when (*) returns (Some(tokenPass))

      When("logging out user")
      invalidateToken(tokenPass.token)

      Then("token is destroyed")
      (authRepo.delete _) verify (*)
    }

    it("Should create token while logging in") {
      Given("any user")
      val user = UsersTestData.johnnyBravo

      When("logging in user")
      val tokenPass = createToken(user)

      Then("token is created")
      tokenPass should not be (null)
      (authRepo.create _) verify (*)
    }

  }

}
