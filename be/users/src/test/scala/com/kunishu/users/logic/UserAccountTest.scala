package com.kunishu.users.logic

import com.kunishu.core.processing.Success
import com.kunishu.model.user.{UserAttrs, AnyUser, User}
import com.kunishu.test.data.UsersTestData
import com.kunishu.users.io.UserRepo
import org.scalamock.scalatest.MockFactory
import org.scalatest.{OneInstancePerTest, Matchers, GivenWhenThen, FunSpec}

/**
 * Unit tests related with managing user accounts
 *
 * @author Michal Wronski
 * @since 1.0
 */
class UserAccountTest extends FunSpec with GivenWhenThen with MockFactory with Matchers with OneInstancePerTest
with UserAccount {

  protected override val userRepo: UserRepo = stub[UserRepo]

  describe("User account") {

    describe("Updating user profile") {

      it("Should update owner's account") {
        Given("any user")
        val user = UsersTestData.johnnyBravo
        And("user is reachable")
        (userRepo.update _) when (*) returns (true)

        When("updating owner's account")
        val result = updateAccount(user, user)

        Then("account is updated")
        result.isSuccess should be(true)
        (userRepo.update _) verify (user)
      }

      it("Should not update account of other users") {
        Given("any user")
        val user = UsersTestData.johnnyBravo
        And("user is reachable")
        (userRepo.update _) when (*) returns (true)

        When("updating other user account")
        val result = updateAccount(UsersTestData.pamelaAnderson, user)

        Then("account is NOT updated")
        result.isSuccess should be(false)
        result.toString should include("Cannot update user's account")
      }

      it("Should not change e-mail to one that's already taken") {
        Given("any user")
        val user = UsersTestData.johnnyBravo
        And("user is reachable")
        (userRepo.update _) when (*) returns (true)
        And("user wants change e-mail to one that's taken by somebody else")
        val changeLoginUser = new User(
          user.attributes ++
          Map(UserAttrs.attEMail -> "new_mail@kunishu.com")
        )
        (userRepo.isLoginFree _) when ("new_mail@kunishu.com") returns (false)

        When("changing user's e-mail")
        val result = updateAccount(changeLoginUser, user)

        Then("account is not updated")
        result.isSuccess should be(false)
        result.toString should include("Cannot change e-mail as new one is already taken: new_mail@kunishu.com")
      }

      it("Should encrypt password while changing credentials") {
        Given("user changes credentials")
        val user = new User(UsersTestData.johnnyBravo.attributes ++ Map(UserAttrs.attPassword -> "new-pass-123"))
        And("user is reachable")
        (userRepo.update _) when (*) returns (true)

        When("updating owner's account")
        val result = updateAccount(user, user)

        Then("account is updated")
        result.isSuccess should be(true)
        And("password is encrypted")
        (userRepo.update _) verify (new User(
          UsersTestData.johnnyBravo.attributes ++
            Map(UserAttrs.attPassword -> "5a4722f55b54888ab990e7d80551518d728944e6ba339f2538fccf1444f9e12c")
        ))
      }

    }

    describe("User registration") {

      import UserAttrs._

      it("Should register new user") {
        Given("any new user")
        val user = new User(Map(
          attEMail -> "new@kunishu.com",
          attPassword -> "pass-123"
        ))
        And("user e-mail is not taken")
        (userRepo.isLoginFree _) when (*) returns (true)
        And("user is reachable")
        (userRepo.create _) when (*) returns ("new-user-id")

        When("registering user")
        val result = createAccount(user)

        Then("new account is created")
        result.isSuccess should be(true)
        And("password is encrypted")
        And("default user role is given")
        (userRepo.create _) verify (new User(Map(
          attEMail -> "new@kunishu.com",
          attPassword -> "7933c6af5038858646e92e3a3d61cac74e93508c004f97a89637db66a7b906ce",
          attRole -> roleUser
        )))
      }

      it("Should not register users who's e-mails already exist") {
        Given("any new user")
        val user = new User(Map(
          attEMail -> "new@kunishu.com",
          attPassword -> "pass-123"
        ))
        And("user e-mail is taken")
        (userRepo.isLoginFree _) when (*) returns (false)
        And("user is reachable")
        (userRepo.create _) when (*) returns ("new-user-id")

        When("registering user")
        val result = createAccount(user)

        Then("new account is not created")
        result.isSuccess should be(false)
        result.toString should include("E-mail already taken")
      }

      it("Should not register users without e-mail") {
        Given("any new user")
        val user = new User(Map(
          attPassword -> "pass-123"
        ))
        And("user e-mail is not taken")
        (userRepo.isLoginFree _) when (*) returns (false)
        And("user is reachable")
        (userRepo.create _) when (*) returns ("new-user-id")

        When("registering user")
        val result = createAccount(user)

        Then("new account is not created")
        result.isSuccess should be(false)
        result.toString should include("E-mail is not given")
      }

      it("Should not register users without password") {
        Given("any new user")
        val user = new User(Map(
          attEMail -> "new@kunishu.com"
        ))
        And("user e-mail is not taken")
        (userRepo.isLoginFree _) when (*) returns (false)
        And("user is reachable")
        (userRepo.create _) when (*) returns ("new-user-id")

        When("registering user")
        val result = createAccount(user)

        Then("new account is not created")
        result.isSuccess should be(false)
        result.toString should include("Password not given")
      }

    }

  }

}
