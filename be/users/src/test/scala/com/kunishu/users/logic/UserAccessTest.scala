package com.kunishu.users.logic

import com.kunishu.core.processing.Success
import com.kunishu.model.user.{User, SearchUserCriteria, AnyUser}
import com.kunishu.test.data.UsersTestData
import com.kunishu.users.io.UserRepo
import org.joda.time.DateTime
import org.scalamock.scalatest.MockFactory
import org.scalatest.{OneInstancePerTest, Matchers, GivenWhenThen, FunSpec}

/**
 * Unit tests related with user access cases
 *
 * @author Michal Wronski
 * @since 1.0
 */
class UserAccessTest extends FunSpec with GivenWhenThen with MockFactory with Matchers with OneInstancePerTest
with UserAccess {

  protected override val userRepo: UserRepo = stub[UserRepo]

  describe("User access") {

    describe("Getting user") {

      it("Should get details about user's account") {
        Given("any user")
        val user = UsersTestData.johnnyBravo
        And("user is reachable ")
        (userRepo.get _) when (user.id.get) returns (Some(user))

        When("getting owner's account")
        val result = getUser(user.id.get, user)

        Then("access is granted")
        result.isSuccess should be(true)
        (userRepo.get _) verify (user.id.get)
        And("details are returned")
        result.asInstanceOf[Success[AnyUser]].value should be(user)
      }

      it("Should prevent user to take info about other users") {
        Given("any user")
        val user = UsersTestData.johnnyBravo
        And("different patient")
        val otherUser = UsersTestData.pamelaAnderson
        And("user is reachable ")
        (userRepo.get _) when (otherUser.id.get) returns (Some(otherUser))

        When("getting account of other user")
        val result = getUser(otherUser.id.get, user)

        Then("access is not granted")
        result.isSuccess should be(false)
        result.toString should include("No privileges to see user")
      }

      it("Should provide user info about doctors") {
        Given("any user")
        val user = UsersTestData.johnnyBravo
        And("a doctor")
        val otherUser = UsersTestData.zbigniewReliga
        And("user is reachable ")
        (userRepo.get _) when (otherUser.id.get) returns (Some(otherUser))

        When("getting account of other user")
        val result = getUser(otherUser.id.get, user)

        Then("access is granted")
        result.isSuccess should be(true)
        And("generic info is returned")
        result.asInstanceOf[Success[AnyUser]].value should be(otherUser.info())
      }

      it("Should get details about doctor's account") {
        Given("any doctor")
        val user = UsersTestData.zbigniewReliga
        And("user is reachable ")
        (userRepo.get _) when (user.id.get) returns (Some(user))

        When("getting owner's account")
        val result = getUser(user.id.get, user)

        Then("access is granted")
        result.isSuccess should be(true)
        (userRepo.get _) verify (user.id.get)
        And("details are returned")
        result.asInstanceOf[Success[AnyUser]].value should be(user)
      }

      it("Should provide generic info about other users to doctors") {
        Given("any user")
        val user = UsersTestData.zbigniewReliga
        And("different patient")
        val otherUser = UsersTestData.pamelaAnderson
        And("user is reachable ")
        (userRepo.get _) when (otherUser.id.get) returns (Some(otherUser))

        When("getting account of other user")
        val result = getUser(otherUser.id.get, user)

        Then("access is granted")
        result.isSuccess should be(true)
        And("generic info is returned")
        result.asInstanceOf[Success[AnyUser]].value should be(otherUser.info())
      }

    }

    describe("Searching users") {

      it("Should provide patients generic info only about doctors") {
        Given("any user")
        val user = UsersTestData.johnnyBravo
        And("search criteria")
        val criteria = new SearchUserCriteria(Map())
        And("users are reachable ")
        (userRepo.find _) when (criteria) returns (List(UsersTestData.johnnyBravo, UsersTestData.pamelaAnderson, UsersTestData.zbigniewReliga))

        When("searching users")
        val result = findUsers(criteria, user)

        Then("response is successful")
        result.isSuccess should be(true)
        (userRepo.find _) verify (criteria)
        And("generic info only about doctors are returned")
        val users = result.asInstanceOf[Success[Seq[AnyUser]]].value
        users.size should be(1)
        users(0) should be(new User(UsersTestData.zbigniewReliga.attributes).info())
      }

      it("Should provide patients detail info only about doctors") {
        Given("any user")
        val user = UsersTestData.johnnyBravo
        And("search criteria")
        val criteria = new SearchUserCriteria(Map(), false)
        And("users are reachable ")
        (userRepo.find _) when (criteria) returns (List(UsersTestData.johnnyBravo, UsersTestData.pamelaAnderson, UsersTestData.zbigniewReliga))

        When("searching users")
        val result = findUsers(criteria, user)

        Then("response is successful")
        result.isSuccess should be(true)
        (userRepo.find _) verify (criteria)
        And("detail info only about doctors are returned")
        val users = result.asInstanceOf[Success[Seq[AnyUser]]].value
        users.size should be(1)
        users(0) should be(UsersTestData.zbigniewReliga.info())
      }

      it("Should provide doctors generic info about users") {
        Given("any doctor")
        val user = UsersTestData.zbigniewReliga
        And("search criteria")
        val criteria = new SearchUserCriteria(Map())
        And("users are reachable ")
        (userRepo.find _) when (criteria) returns (List(UsersTestData.johnnyBravo, UsersTestData.pamelaAnderson, UsersTestData.zbigniewReliga))

        When("searching users")
        val result = findUsers(criteria, user)

        Then("response is successful")
        result.isSuccess should be(true)
        (userRepo.find _) verify (criteria)
        And("generic info about all users is returned")
        val users = result.asInstanceOf[Success[Seq[AnyUser]]].value
        users.size should be(3)
        users(0) should be(UsersTestData.johnnyBravo.info())
        users(1) should be(UsersTestData.pamelaAnderson.info())
        users(2) should be(new User(UsersTestData.zbigniewReliga.attributes).info())
      }

      it("Should provide doctors detail info about users") {
        Given("any doctor")
        val user = UsersTestData.zbigniewReliga
        And("search criteria")
        val criteria = new SearchUserCriteria(Map(), false)
        And("users are reachable ")
        (userRepo.find _) when (criteria) returns (List(UsersTestData.johnnyBravo, UsersTestData.pamelaAnderson, UsersTestData.zbigniewReliga))

        When("searching users")
        val result = findUsers(criteria, user)

        Then("response is successful")
        result.isSuccess should be(true)
        (userRepo.find _) verify (criteria)
        And("detail info about all users is returned")
        val users = result.asInstanceOf[Success[Seq[AnyUser]]].value
        users.size should be(3)
        users(0) should be(UsersTestData.johnnyBravo.info())
        users(1) should be(UsersTestData.pamelaAnderson.info())
        users(2) should be(UsersTestData.zbigniewReliga.info())
      }

    }

  }

}
